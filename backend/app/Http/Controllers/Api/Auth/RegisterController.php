<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserActivity;
use App\Services\Auth\AuthService;
use App\Services\EmeraldBillingOrchestrator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    public function __construct(
        protected AuthService               $authService,
        protected EmeraldBillingOrchestrator $orchestrator
    ) {}

    /**
     * Register a new user.
     *
     * Flow:
     * 1. Create user in local DB
     * 2. Assign client role
     * 3. Provision Emerald MBR (non-blocking — failure won't kill registration)
     * 4. Send verification email
     * 5. Return success (no token — user must verify email first)
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // ── 1. Create User ───────────────────────────────────────────
            $user = User::create([
                'name'                 => $request->name,
                'email'                => $request->email,
                'password'             => Hash::make($request->password),
                'phone'                => $this->formatPhone($request->phone),
                'customer_type'        => $request->customer_type ?? 'individual',
                'status'               => 'pending_verification',
                'timezone'             => $request->timezone ?? 'Africa/Nairobi',
                'language'             => $request->language ?? 'en',

                // Address
                'address'              => $request->address,
                'city'                 => $request->city,
                'county'               => $request->county,
                'postal_code'          => $request->postal_code,
                'country'              => $request->country ?? 'Kenya',

                // Business info
                'company_name'         => $request->company_name,
                'company_registration' => $request->company_registration,
                'tax_pin'              => $request->tax_pin,

                // Preferences
                'preferences' => [
                    'notifications' => [
                        'email'     => true,
                        'sms'       => $request->sms_notifications ?? true,
                        'in_app'    => true,
                        'marketing' => $request->marketing_consent ?? false,
                    ],
                ],
            ]);

            // ── 2. Assign Role ───────────────────────────────────────────
            if (!$user->hasRole('client')) {
                $user->assignRole('client');
            }

            Log::info('User registered', [
                'user_id'        => $user->id,
                'roles_assigned' => ['client'],
            ]);

            // ── 3. Queue Emerald MBR for Admin Approval ──────────────────
            // When a product is selected at signup, we do NOT auto-provision.
            // Instead we flag the account as pending admin/staff review.
            // An admin or staff member must approve before the Emerald
            // account_add API is called and the MBR ID is assigned.
            if ($request->filled('selected_product_id')) {
                $user->update([
                    'emerald_pending_product_id' => (int) $request->selected_product_id,
                    'emerald_approval_status'    => 'pending',
                ]);

                Log::info('Emerald provisioning queued for admin approval', [
                    'user_id'    => $user->id,
                    'product_id' => $request->selected_product_id,
                ]);
            }

            // ── 4. Activity Log ──────────────────────────────────────────
            UserActivity::create([
                'user_id'     => $user->id,
                'action'      => 'user_registered',
                'description' => 'User registered successfully',
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
            ]);

            // ── 5. Send Verification Email ───────────────────────────────
            $this->authService->sendEmailVerification($user);

            // ── 6. SMS (if opted in) ─────────────────────────────────────
            if ($request->sms_notifications) {
                $this->authService->sendWelcomeSms($user);
            }

            DB::commit();

            // Store selected product in session for after email verification
            if ($request->filled('selected_product_id')) {
                session(['pending_product_id' => $request->selected_product_id]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please check your email to verify your account.',
                'data'    => [
                    'user' => [
                        'id'             => $user->id,
                        'name'           => $user->name,
                        'email'          => $user->email,
                        'status'         => $user->status,
                        'emerald_mbr_id' => $user->emerald_mbr_id, // null until provisioned
                    ],
                    'requires_verification' => true,
                    'provisioned'           => !is_null($user->emerald_mbr_id),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'email' => $request->email,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'errors'  => config('app.debug')
                    ? ['exception' => $e->getMessage()]
                    : [],
            ], 500);
        }
    }

    /**
     * Resend verification email.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $this->authService->sendEmailVerification($user);

        return response()->json([
            'success' => true,
            'message' => 'Verification email sent successfully.',
        ]);
    }

    /**
     * Manually trigger Emerald provisioning for a user who registered
     * without a product, or whose provisioning failed at signup.
     *
     * Called by: Staff/Admin from dashboard
     */
    public function provisionEmerald(Request $request, User $user): JsonResponse
    {
        // Only admin or staff can manually provision
        if (!$request->user()->hasAnyRole(['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions.',
            ], 403);
        }

        if ($user->emerald_mbr_id) {
            return response()->json([
                'success' => false,
                'message' => 'User already has an Emerald account (MBR ID: ' . $user->emerald_mbr_id . ').',
            ], 422);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $result = $this->orchestrator->provisionNewSubscriber(
            $user,
            (int) $request->product_id
        );

        if ($result->isSuccess()) {
            if ($user->status !== 'active') {
                $user->update(['status' => 'active']);
            }
            
            return response()->json([
                'success'     => true,
                'message'     => 'Emerald account provisioned successfully.',
                'customer_id' => $result->customerId,
                'account_id'  => $result->accountId,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Provisioning failed: ' . $result->message,
        ], 422);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /**
     * Normalise phone to E.164 format (+254XXXXXXXXX).
     */
    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            return '+254' . substr($phone, 1);
        }

        if (!str_starts_with($phone, '+')) {
            return '+254' . $phone;
        }

        return $phone;
    }
}
