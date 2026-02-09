<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserActivity;
use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LogoutController extends Controller
{
    /**
     * Logout user and revoke token
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Update logout time in login history
        $latestLogin = LoginHistory::where('user_id', $user->id)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->first();

        if ($latestLogin) {
            $latestLogin->update(['logged_out_at' => now()]);
        }

        // Log logout activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'user_logged_out',
            'description' => 'User logged out successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Revoke current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Logout from all devices
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();

        // Update all open login sessions
        LoginHistory::where('user_id', $user->id)
            ->whereNull('logged_out_at')
            ->update(['logged_out_at' => now()]);

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'user_logged_out_all_devices',
            'description' => 'User logged out from all devices',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Revoke all user tokens
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices successfully',
        ]);
    }
}