<?php
// app/Http/Controllers/Api/Client/DashboardController.php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\EmeraldService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'subscriptions',
            'roles',
        ]);

        // Fetch live data from Emerald
        $emeraldData = null;
        if ($user->emerald_mbr_id) {
            try {
                $emerald     = new EmeraldService();
                $emeraldData = $emerald->getSubscriber($user->emerald_mbr_id);
            } catch (\Exception $e) {
                Log::warning('Emerald fetch failed for dashboard', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [
                // User profile
                'user' => new UserResource($user),

                // M-Pesa payment info
                'payment_info' => [
                    'paybill'    => config('mpesa.paybill'),
                    'account_no' => $user->emerald_mbr_id,
                    'has_account'=> !is_null($user->emerald_mbr_id),
                ],

                // Live Emerald service data
                'service' => $emeraldData ? [
                    'mbr_id'       => $emeraldData['CustomerID']   ?? null,
                    'account_id'   => $emeraldData['AccountID']    ?? null,
                    'status'       => $emeraldData['Active']       ?? null,
                    'expiry_date'  => $emeraldData['ExpireDate']   ?? null,
                    'plan'         => $emeraldData['AccountType']  ?? null,
                    'login'        => $emeraldData['Login']        ?? null,
                    'data_left'    => $emeraldData['DataLeft']     ?? null,
                    'time_left'    => $emeraldData['TimeLeft']     ?? null,
                    'balance'      => $emeraldData['Balance']      ?? null,
                ] : null,

                // Quick stats
                'stats' => [
                    'active_subscriptions' => $user->activeSubscriptions()->count(),
                    'open_tickets'         => $user->getOpenTicketsCount(),
                    'outstanding_balance'  => $user->getTotalOutstandingBalance(),
                ],
            ],
        ]);
    }

    /**
     * Get recent invoices for client
     */
    public function invoices(Request $request): JsonResponse
    {
        $invoices = $request->user()
            ->invoices()
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $invoices,
        ]);
    }

    /**
     * Get recent payments for client
     */
    public function payments(Request $request): JsonResponse
    {
        $payments = $request->user()
            ->payments()
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $payments,
        ]);
    }
}
