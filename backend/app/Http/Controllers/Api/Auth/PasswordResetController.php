<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PasswordResetRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\User;
use App\Models\UserActivity;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Send password reset link to user's email
     *
     * @param PasswordResetRequest $request
     * @return JsonResponse
     */
    public function sendResetLink(PasswordResetRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'If an account exists with this email, a password reset link will be sent.',
            ]);
        }

        // Check if user can reset password
        if (!$user->canResetPassword()) {
            return response()->json([
                'success' => false,
                'message' => 'This account cannot reset password. Please contact support.',
            ], 403);
        }

        // Generate reset token
        $token = $this->authService->generatePasswordResetToken($user);

        // Send password reset notification
        try {
            $user->sendPasswordResetNotification($token);

            // Log activity
            UserActivity::create([
                'user_id' => $user->id,
                'action' => 'password_reset_requested',
                'description' => 'Password reset link sent',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            Log::info('Password reset link sent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send password reset link', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'If an account exists with this email, a password reset link will be sent.',
        ]);
    }

    /**
     * Verify password reset token
     *
     * @param string $token
     * @return JsonResponse
     */
    public function verifyToken(string $token): JsonResponse
    {
        $user = $this->authService->validatePasswordResetToken($token);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset token.',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Valid password reset token.',
            'data' => [
                'user_id' => $user->id,
                'expires_at' => $user->password_reset_expires_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Reset user's password
     *
     * @param PasswordResetRequest $request
     * @return JsonResponse
     */
    public function resetPassword(PasswordResetRequest $request): JsonResponse
    {
        $user = $this->authService->validatePasswordResetToken($request->token);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset token.',
            ], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
            'password_reset_token' => null,
            'password_reset_expires_at' => null,
        ]);

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'password_reset',
            'description' => 'User password reset successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        Log::info('Password reset successful', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful. You can now login with your new password.',
        ]);
    }

    /**
     * Change password for authenticated user
     *
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 401);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Invalidate all other sessions
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'description' => 'User changed their password',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        Log::info('Password changed', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Other sessions have been logged out.',
        ]);
    }
}

