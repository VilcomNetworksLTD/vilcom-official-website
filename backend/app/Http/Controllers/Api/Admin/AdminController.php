<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $userStats = User::statistics();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_clients' => $userStats['clients'] ?? 0,
                    'total_users' => $userStats['total'] ?? 0,
                    'total_staff' => $userStats['staff'] ?? 0,
                    'total_admins' => $userStats['admins'] ?? 0,
                    'active_clients' => User::role('client')->active()->count(),
                    'active_subscriptions' => \App\Models\Subscription::active()->count(),
                    'monthly_revenue' => \App\Models\Invoice::whereMonth('created_at', now())
                        ->where('status', 'paid')
                        ->sum('total_amount'),
                    'open_tickets' => 0, // Ticket model pending implementation
                    'pending_invoices' => \App\Models\Invoice::whereIn('status', ['pending', 'overdue'])->count(),
                ],
            ],
        ]);
    }
}

