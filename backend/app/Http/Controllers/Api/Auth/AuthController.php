<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserActivity;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Verify email address
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $user = User::findOrFail($request->id);

        if (!hash_equals(
            sha1($user->getEmailForVerification()),
            $request->hash
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link.',
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Email already verified.',
                'data' => [
                    'user' => new UserResource($user),
                ],
            ]);
        }

        $user->markEmailAsVerified();

        // Update user status to active after email verification
        $user->update(['status' => 'active']);

        // Send welcome email AFTER successful verification
        $this->authService->sendWelcomeEmail($user);

        // Generate API token after email verification
        $token = $user->createToken('auth_token', ['*'], now()->addDays(30))->plainTextToken;

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'email_verified',
            'description' => 'User verified their email address',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully. You can now access your account.',
            'data' => [
                'user' => new UserResource($user->load('roles')),
                'token' => $token,
                'expires_at' => now()->addDays(30)->toIso8601String(),
            ],
        ]);
    }

    /**
     * Enable two-factor authentication
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function enable2FA(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is already enabled.',
            ], 400);
        }

        $result = $this->authService->enableTwoFactor($user);

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => '2fa_enabled',
            'description' => 'User initiated two-factor authentication setup',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication setup initiated. Please scan the QR code and confirm.',
            'data' => [
                'secret' => $result['secret'],
                'qr_code_url' => $result['qr_code_url'],
                'recovery_codes' => $result['recovery_codes'],
            ],
        ]);
    }

    /**
     * Confirm two-factor authentication
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirm2FA(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        // Verify the code
        if (!$this->verify2FACode($user, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code.',
            ], 401);
        }

        // Enable 2FA confirmed
        $user->update([
            'two_factor_confirmed_at' => now(),
        ]);

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => '2fa_confirmed',
            'description' => 'User confirmed two-factor authentication',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication enabled successfully.',
        ]);
    }

    /**
     * Disable two-factor authentication
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function disable2FA(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify password before disabling
        if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password.',
            ], 401);
        }

        $this->authService->disableTwoFactor($user);

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => '2fa_disabled',
            'description' => 'User disabled two-factor authentication',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication disabled successfully.',
        ]);
    }

    /**
     * Verify 2FA code for login
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verify2FA(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$this->verify2FACode($user, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid two-factor authentication code.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => '2FA verification successful.',
        ]);
    }

    /**
     * Verify 2FA code helper method
     *
     * @param User $user
     * @param string $code
     * @return bool
     */
    private function verify2FACode(User $user, string $code): bool
    {
        // In development, accept any 6-digit code
        if (app()->environment('local')) {
            return strlen($code) === 6 && is_numeric($code);
        }

        // Implement actual 2FA verification using Google2FA or similar
        // For now, this is a placeholder
        
        return false;
    }
}

