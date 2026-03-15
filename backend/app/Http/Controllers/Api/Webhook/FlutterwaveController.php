<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Billing\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// ─────────────────────────────────────────────────────────────────────────────
// FLUTTERWAVE Webhook Controller
// ─────────────────────────────────────────────────────────────────────────────
class FlutterwaveController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * Flutterwave webhook – POST with signature verification.
     */
    public function webhook(Request $request)
    {
        // Verify signature
        $secretHash = config('flutterwave.secret_hash');
        $signature  = $request->header('verif-hash');

        if ($signature !== $secretHash) {
            Log::warning('FlutterwaveWebhook: Invalid signature');
            abort(401, 'Invalid signature');
        }

        Log::info('FlutterwaveWebhook', $request->all());

        $payload = $request->all();

        if (($payload['event'] ?? '') === 'charge.completed') {
            $data         = $payload['data'] ?? [];
            $transactionId = $data['id'] ?? null;
            $txRef         = $data['tx_ref'] ?? null;
            $status        = $data['status'] ?? null;

            $payment = Payment::where('payment_number', $txRef)->first();

            if ($payment && $status === 'successful') {
                $this->paymentService->verifyFlutterwave((string) $transactionId, $payment);
            }
        }

        return response()->json(['status' => 'ok']);
    }
}

