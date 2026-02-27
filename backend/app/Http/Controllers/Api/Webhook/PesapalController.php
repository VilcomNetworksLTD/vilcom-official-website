<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// ─────────────────────────────────────────────────────────────────────────────
// PESAPAL IPN Controller
// ─────────────────────────────────────────────────────────────────────────────
class PesapalController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * Pesapal IPN – GET request with OrderTrackingId & OrderMerchantReference.
     */
    public function ipn(Request $request)
    {
        Log::info('PesapalIPN', $request->all());

        $orderTrackingId      = $request->query('OrderTrackingId');
        $merchantReference    = $request->query('OrderMerchantReference');

        try {
            $this->paymentService->handlePesapalIpn($orderTrackingId, $merchantReference);
        } catch (\Throwable $e) {
            Log::error('PesapalIPN error', ['error' => $e->getMessage()]);
        }

        return response()->json(['status' => 200, 'message' => 'IPN received.']);
    }
}

