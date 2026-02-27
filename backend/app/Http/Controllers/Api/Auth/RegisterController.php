<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserActivity;
use App\Services\Auth\AuthService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Register a new user
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $this->formatPhone($request->phone),
                'customer_type' => $request->customer_type ?? 'individual',
                'status' => 'pending_verification',
                'timezone' => $request->timezone ?? 'Africa/Nairobi',
                'language' => $request->language ?? 'en',
                
                // Business info (if provided)
                'company_name' => $request->company_name,
                'company_registration' => $request->company_registration,
                'tax_pin' => $request->tax_pin,
                
                // Address info
                'address' => $request->address,
                'city' => $request->city,
                'county' => $request->county,
                'postal_code' => $request->postal_code,
                
                // Set initial preferences
                'preferences' => [
                    'notifications' => [
                        'email' => true,
                        'sms' => $request->sms_notifications ?? true,
                        'in_app' => true,
                        'marketing' => $request->marketing_consent ?? false,
                    ],
                ],
            ]);

            // Assign default 'client' role
            $user->assignRole('client');

            // Log activity
            UserActivity::create([
                'user_id' => $user->id,
                'action' => 'user_registered',
                'description' => 'User registered successfully',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Send verification email
            $this->authService->sendEmailVerification($user);

            // Send welcome email
            $this->authService->sendWelcomeEmail($user);

            // Send SMS notification (if opted in)
            if ($request->sms_notifications) {
                $this->authService->sendWelcomeSms($user);
            }

            DB::commit();

            // Return success WITHOUT token - user must verify email first
            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please check your email to verify your account.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => $user->status,
                    ],
                    'requires_verification' => true,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'email' => $request->email,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'errors' => config('app.debug') ? ['exception' => $e->getMessage()] : [],
            ], 500);
        }
    }

    /**
     * Format phone number to international format
     *
     * @param string $phone
     * @return string
     */
    private function formatPhone(string $phone): string
    {
        // Remove any spaces or special characters
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Convert to international format if starts with 0
        if (substr($phone, 0, 1) === '0') {
            $phone = '+254' . substr($phone, 1);
        }
        
        // Add +254 if not present
        if (substr($phone, 0, 1) !== '+') {
            $phone = '+254' . $phone;
        }
        
        return $phone;
    }

    /**
     * Resend verification email
     *
     * @param Request $request
     * @return JsonResponse
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
}