<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\LoginHistory;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    /**
     * Maximum login attempts before lockout
     */
    const MAX_ATTEMPTS = 5;

    /**
     * Lockout duration in seconds
     */
    const LOCKOUT_DURATION = 900; // 15 minutes

    /**
     * Handle user login
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Check rate limiting
        $key = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);

            $this->logFailedAttempt($request, 'Too many login attempts');

            return response()->json([
                'success' => false,
                'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
                'retry_after' => $seconds,
            ], 429);
        }

        // Find user
        $user = User::where('email', $request->email)->first();

        // Validate credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, self::LOCKOUT_DURATION);

            $this->logFailedAttempt($request, 'Invalid credentials');

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check account status
        if ($user->status === 'suspended') {
            $this->logFailedAttempt($request, 'Account suspended', $user->id);

            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended. Please contact support.',
                'reason' => $user->suspension_reason,
                'support_email' => config('app.support_email', 'support@vilcom.co.ke'),
                'support_phone' => config('app.support_phone', '+254712345678'),
            ], 403);
        }

        if ($user->status === 'banned') {
            $this->logFailedAttempt($request, 'Account banned', $user->id);

            return response()->json([
                'success' => false,
                'message' => 'Your account has been permanently banned.',
                'support_email' => config('app.support_email', 'support@vilcom.co.ke'),
            ], 403);
        }

        if ($user->status === 'inactive') {
            $this->logFailedAttempt($request, 'Account inactive', $user->id);

            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive. Please contact support to reactivate.',
            ], 403);
        }

        // Check if 2FA is enabled
        if ($user->two_factor_enabled && $user->two_factor_confirmed_at) {
            // Store user ID in session for 2FA verification
            $request->session()->put('2fa_user_id', $user->id);

            return response()->json([
                'success' => true,
                'requires_2fa' => true,
                'message' => 'Please enter your two-factor authentication code.',
                'user_id' => $user->id,
            ]);
        }

        // Clear rate limiter on successful login
        RateLimiter::clear($key);

        // Generate token with role-based abilities
        $abilities = $this->getTokenAbilities($user);
        $token = $user->createToken(
            'auth_token',
            $abilities,
            now()->addDays(30)
        )->plainTextToken;

        // Update user login info
        $user->recordLogin($request);

        // Activate account if pending verification (for business logic flexibility)
        if ($user->status === 'pending_verification' && $user->email_verified_at) {
            $user->update(['status' => 'active']);
        }

        // Log successful login
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'user_logged_in',
            'description' => 'User logged in successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Debug logging for dashboard redirect issue
\Illuminate\Support\Facades\Log::info('Login success - roles check', [
            'user_id' => $user->id,
            'email' => $user->email,
            'roles_count' => $user->roles->count(),
            'roles' => $user->roles->pluck('name')->toArray(),
            'status' => $user->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user->load('roles', 'permissions')),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addDays(30)->toIso8601String(),
                'abilities' => $abilities,
            ],
        ]);
    }

    /**
     * Verify 2FA code and complete login
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

        // Verify 2FA code
        if (!$this->verify2FACode($user, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid two-factor authentication code.',
            ], 401);
        }

        // Generate token
        $abilities = $this->getTokenAbilities($user);
        $token = $user->createToken(
            'auth_token',
            $abilities,
            now()->addDays(30)
        )->plainTextToken;

        // Update user login info
        $user->recordLogin($request);

        // Log successful login with 2FA
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'user_logged_in_2fa',
            'description' => 'User logged in with 2FA successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication successful',
            'data' => [
                'user' => new UserResource($user->load('roles', 'permissions')),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addDays(30)->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get token abilities based on user roles
     *
     * @param User $user
     * @return array
     */
    private function getTokenAbilities(User $user): array
    {
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();

        // Add role-specific abilities
        if ($user->hasRole('admin')) {
            return ['*']; // Admin gets all abilities
        }

        return array_merge(['read'], $permissions);
    }

    /**
     * Generate throttle key for rate limiting
     *
     * @param Request $request
     * @return string
     */
    private function throttleKey($request): string
    {
        return 'login|' . strtolower($request->input('email')) . '|' . $request->ip();
    }

    /**
     * Log failed login attempt
     *
     * @param Request $request
     * @param string $reason
     * @param int|null $userId
     * @return void
     */
    private function logFailedAttempt($request, string $reason, ?int $userId = null): void
    {
        LoginHistory::create([
            'user_id' => $userId,
            'email' => $request->email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);

        if ($userId) {
            UserActivity::create([
                'user_id' => $userId,
                'action' => 'login_failed',
                'description' => "Failed login attempt: {$reason}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }
    }

    /**
     * Verify 2FA code
     *
     * @param User $user
     * @param string $code
     * @return bool
     */
    private function verify2FACode(User $user, string $code): bool
    {
        // This is a placeholder - implement actual 2FA verification
        // using Google2FA or similar package

        // For now, accept any 6-digit code in development
        if (app()->environment('local')) {
            return strlen($code) === 6 && is_numeric($code);
        }

        // Implement actual verification here
        // Example: return Google2FA::verifyKey($user->two_factor_secret, $code);

        return false;
    }

    /**
     * Get currently authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles', 'permissions', 'activeSubscriptions');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'stats' => [
                    'active_subscriptions' => $user->getActiveSubscriptionsCount(),
                    'outstanding_balance' => $user->getTotalOutstandingBalance(),
                    'open_tickets' => $user->getOpenTicketsCount(),
                ],
            ],
        ]);
    }

    /**
     * Refresh authentication token
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        // Generate new token
        $abilities = $this->getTokenAbilities($user);
        $token = $user->createToken(
            'auth_token',
            $abilities,
            now()->addDays(30)
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed successfully',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addDays(30)->toIso8601String(),
            ],
        ]);
    }
}
