<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Admin Base Controller
 * 
 * This controller serves as the base for all admin-related controllers.
 * It provides common functionality for admin operations.
 */
class AdminController extends Controller
{
    /**
     * Constructor
     * Apply middleware for admin-only routes
     */
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    /**
     * Dashboard overview
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard()
    {
        return response()->json([
            'success' => true,
            'message' => 'Admin dashboard data',
            'data' => [
                'stats' => [
                    'total_clients' => 0,
                    'active_subscriptions' => 0,
                    'monthly_revenue' => 0,
                    'open_tickets' => 0,
                ],
            ],
        ]);
    }
}

