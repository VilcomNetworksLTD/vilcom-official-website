
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    /**
     * Logout the current user (invalidate current token)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Get the current token being used
        $currentToken = $request->user()->currentAccessToken();
        
        // Log the logout activity
        UserActivity::create([
            'user_id' => $request->user()->id,
            'action' => 'user_logged_out',
            'description' => 'User logged out',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Delete only the current token
        $currentToken->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out',
        ]);
    }

    /**
     * Logout from all devices (invalidate all tokens)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Count tokens before deleting
        $tokensCount = $user->tokens()->count();

        // Log the logout activity
        UserActivity::create([
            'user_id' => $user->id,
            'action' => 'user_logged_out_all_devices',
            'description' => 'User logged out from all devices',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Delete ALL tokens (logout from all devices)
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out from all devices',
            'data' => [
                'devices_logged_out' => $tokensCount,
            ],
        ]);
    }

    /**
     * Get list of active sessions/tokens
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $tokens = $user->tokens()->select([
            'id',
            'name',
            'abilities',
            'created_at',
            'expires_at',
        ])->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'created_at' => $token->created_at->toIso8601String(),
                'expires_at' => $token->expires_at ? $token->expires_at->toIso8601String() : null,
                'is_current' => $token->id === request()->user()->currentAccessTokenId(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'sessions' => $tokens,
                'total_sessions' => $tokens->count(),
            ],
        ]);
    }

    /**
     * Revoke a specific token (session)
     *
     * @param Request $request
     * @param int $tokenId
     * @return JsonResponse
     */
    public function revokeSession(Request $request, int $tokenId): JsonResponse
    {
        $user = $request->user();
        
        $token = $user->tokens()->where('id', $tokenId)->first();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
            ], 404);
        }

        // Don't allow revoking current token through this endpoint
        if ($token->id === $user->currentAccessTokenId()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot revoke current session. Use logout instead.',
            ], 422);
        }

        $token->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully',
        ]);
    }
}


