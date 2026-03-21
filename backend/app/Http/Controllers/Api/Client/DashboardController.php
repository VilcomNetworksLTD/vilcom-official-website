<?php


namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\EmeraldService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function __construct(
        protected EmeraldService $emerald
    ) {}

    /**
     * Client dashboard — all data in one call.
     * Fetches live Emerald service details including plan, expiry, status.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'subscriptions',
            'roles',
        ]);

        // ── Live Emerald data ────────────────────────────────────────────
        $emeraldData    = null;
        $serviceDetails = null;

        if ($user->emerald_mbr_id) {
            try {
                $emeraldData = $this->emerald->getSubscriber(
                    (int) $user->emerald_mbr_id
                );

                // Parse the service details from the MBR response
                $serviceDetails = $this->parseServiceDetails($emeraldData);

            } catch (\Exception $e) {
                Log::warning('Emerald dashboard fetch failed', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [

                // ── User profile ─────────────────────────────────────────
                'user' => new UserResource($user),

                // ── M-Pesa payment info ──────────────────────────────────
                // Customer pays Paybill using their MBR ID as account number
                'payment_info' => [
                    'paybill'     => config('mpesa.paybill'),
                    'account_no'  => $user->emerald_mbr_id,
                    'has_account' => !is_null($user->emerald_mbr_id),
                    'instructions'=> $user->emerald_mbr_id
                        ? "Go to M-Pesa → Lipa na M-Pesa → Pay Bill → Business No: " . config('mpesa.paybill') . " → Account No: {$user->emerald_mbr_id}"
                        : 'Your account is being set up. Please contact support.',
                ],

                // ── Live service details from Emerald ────────────────────
                'service' => $serviceDetails,

                // ── Raw Emerald MBR data (for admin debug / advanced use) ─
                'emerald_raw' => $request->boolean('debug') ? $emeraldData : null,

                // ── Quick stats ──────────────────────────────────────────
                'stats' => [
                    'active_subscriptions' => $user->activeSubscriptions()->count(),
                    'open_tickets'         => $user->getOpenTicketsCount(),
                    'outstanding_balance'  => $user->getTotalOutstandingBalance(),
                ],

            ],
        ]);
    }

    /**
     * Get recent invoices for client.
     */
    public function invoices(Request $request): JsonResponse
    {
        $invoices = $request->user()
            ->invoices()
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data'    => $invoices,
        ]);
    }

    /**
     * Get recent payments for client.
     */
    public function payments(Request $request): JsonResponse
    {
        $payments = $request->user()
            ->payments()
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data'    => $payments,
        ]);
    }

    /**
     * Get live service status from Emerald (lightweight poll endpoint).
     * Called by React every 30s to refresh service status.
     */
    public function serviceStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->emerald_mbr_id) {
            return response()->json([
                'success' => false,
                'message' => 'No Emerald account found.',
            ], 404);
        }

        try {
            $data    = $this->emerald->getSubscriber((int) $user->emerald_mbr_id);
            $details = $this->parseServiceDetails($data);

            return response()->json([
                'success' => true,
                'data'    => $details,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch service status.',
            ], 503);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /**
     * Parse Emerald MBR detail response into a clean service object.
     *
     * Emerald mbr_detail returns fields like:
     * CustomerID, FirstName, LastName, Email, Balance,
     * AccountType, AccountID, Login, Active, ExpireDate,
     * DataLeft, TimeLeft, PayPeriod, BillingCycle, etc.
     */
    private function parseServiceDetails(array $data): array
    {
        $isActive   = isset($data['Active']) && (int)$data['Active'] === 1;
        $expireDate = $data['ExpireDate'] ?? null;
        $daysLeft   = null;

        if ($expireDate) {
            try {
                $expire   = \Carbon\Carbon::parse($expireDate);
                $daysLeft = now()->diffInDays($expire, false);
            } catch (\Exception $e) {
                // ignore parse error
            }
        }

        // Determine service health status
        $status = match(true) {
            !$isActive && $daysLeft !== null && $daysLeft < 0 => 'expired',
            !$isActive                                         => 'suspended',
            $daysLeft !== null && $daysLeft <= 3               => 'expiring_soon',
            default                                            => 'active',
        };

        return [
            // Identity
            'mbr_id'       => $data['CustomerID']  ?? null,
            'account_id'   => $data['AccountID']   ?? null,
            'login'        => $data['Login']        ?? null,

            // Plan
            'plan_name'    => $data['AccountType'] ?? null,
            'pay_period'   => $data['PayPeriod']   ?? null,
            'billing_cycle'=> $data['BillingCycle']?? null,

            // Status
            'is_active'    => $isActive,
            'status'       => $status,  // active | suspended | expired | expiring_soon
            'expire_date'  => $expireDate,
            'days_left'    => $daysLeft !== null ? (int)$daysLeft : null,

            // Usage (data-capped plans)
            'data_left'    => $data['DataLeft']    ?? null,
            'time_left'    => $data['TimeLeft']    ?? null,

            // Financial
            'balance'      => $data['Balance']     ?? null,

            // Flags
            'is_expiring_soon' => $daysLeft !== null && $daysLeft <= 3 && $isActive,
            'needs_renewal'    => $daysLeft !== null && $daysLeft <= 0,
        ];
    }
}
