<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\QuoteRequest;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Dashboard overview statistics.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $pendingQuotes = QuoteRequest::where('status', 'pending')->count();

        $revenueThisMonth = Payment::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');

        $revenueLastMonth = Payment::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->sum('amount');

        $newSubscriptionsThisMonth = Subscription::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_subscriptions' => $totalSubscriptions,
                    'active_subscriptions' => $activeSubscriptions,
                    'pending_quotes' => $pendingQuotes,
                ],
                'revenue' => [
                    'this_month' => $revenueThisMonth,
                    'last_month' => $revenueLastMonth,
                    'growth' => $revenueLastMonth > 0
                        ? round(($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth * 100, 2)
                        : 0,
                ],
                'subscriptions' => [
                    'this_month' => $newSubscriptionsThisMonth,
                ],
            ],
        ]);
    }

    /**
     * Revenue reports.
     */
    public function revenue(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

        $payments = Payment::whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy(function ($payment) {
                return $payment->created_at->format('Y-m-d');
            });

        $totalRevenue = Payment::whereBetween('created_at', [$startDate, $endDate])->sum('amount');
        $averageRevenue = Payment::whereBetween('created_at', [$startDate, $endDate])->avg('amount');

        $byPaymentMethod = Payment::whereBetween('created_at', [$startDate, $endDate])
            ->select('payment_method')
            ->selectRaw('COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'average_transaction' => $averageRevenue,
                'transaction_count' => Payment::whereBetween('created_at', [$startDate, $endDate])->count(),
                'by_payment_method' => $byPaymentMethod,
                'daily_breakdown' => $payments,
            ],
        ]);
    }

    /**
     * Subscription reports.
     */
    public function subscriptions(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

        $subscriptions = Subscription::whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy(function ($subscription) {
                return $subscription->created_at->format('Y-m-d');
            });

        $totalSubscriptions = Subscription::whereBetween('created_at', [$startDate, $endDate])->count();

        $byStatus = Subscription::whereBetween('created_at', [$startDate, $endDate])
            ->select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'total_subscriptions' => $totalSubscriptions,
                'by_status' => $byStatus,
                'daily_breakdown' => $subscriptions,
            ],
        ]);
    }

    /**
     * Ticket reports.
     */
    public function tickets(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Ticket module not available',
                'total_tickets' => 0,
                'open_tickets' => 0,
                'closed_tickets' => 0,
            ],
        ]);
    }

    /**
     * Export reports data.
     */
    public function export(Request $request): JsonResponse
    {
        $type = $request->get('type', 'revenue');
        $format = $request->get('format', 'csv');
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

        $data = [];

        switch ($type) {
            case 'revenue':
                $data = Payment::whereBetween('created_at', [$startDate, $endDate])
                    ->with(['subscription.user'])
                    ->get();
                break;
            case 'subscriptions':
                $data = Subscription::whereBetween('created_at', [$startDate, $endDate])
                    ->with(['user', 'plan'])
                    ->get();
                break;
            case 'quotes':
                $data = QuoteRequest::whereBetween('created_at', [$startDate, $endDate])
                    ->with(['user', 'product'])
                    ->get();
                break;
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid export type',
                ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'type' => $type,
                'format' => $format,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'count' => count($data),
            ],
        ]);
    }
}
