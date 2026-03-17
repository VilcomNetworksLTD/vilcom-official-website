<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Services\Billing\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    public function callback(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::channel('mpesa')->info('MpesaCallback', $request->all());

        try {
            $this->paymentService->handleMpesaStkCallback($request->all());
        } catch (\Throwable $e) {
            Log::channel('mpesa')->error('MpesaCallback error', ['error' => $e->getMessage()]);
        }

        $body = $request->input('Body.stkCallback');

        // Reject failed transactions
        if (($body['ResultCode'] ?? 1) !== 0) {
            Log::warning('M-Pesa callback failed', $body ?? []);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $items   = collect($body['CallbackMetadata']['Item'] ?? []);
        $amount  = (float)  data_get($items->firstWhere('Name', 'Amount'), 'Value', 0);
        $transId = (string) data_get($items->firstWhere('Name', 'MpesaReceiptNumber'), 'Value', '');
        $phone   = (string) data_get($items->firstWhere('Name', 'PhoneNumber'), 'Value', '');
        $acctRef = (string) data_get($items->firstWhere('Name', 'AccountReference'), 'Value', '');

        // acctRef = emerald_mbr_id (the Paybill account number the customer entered)
        $user = \App\Models\User::where('emerald_mbr_id', $acctRef)->first();

        if (!$user) {
            Log::error('M-Pesa callback: no user found for MBR ID', ['acct_ref' => $acctRef]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        // Prevent duplicate processing
        if (\App\Models\Payment::where('transaction_id', $transId)->exists()) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        // 1. Record payment in your DB
        \App\Models\Payment::create([
            'user_id'              => $user->id,
            'amount'               => $amount,
            'transaction_id'       => $transId,
            'payment_method'       => 'mpesa',
            'gateway'              => 'mpesa',
            'mpesa_phone'          => $phone,
            'mpesa_receipt_number' => $transId,
            'status'               => 'completed',
            'paid_at'              => now(),
        ]);

        // 2. Post payment to Emerald
        try {
            $emerald = new \App\Services\EmeraldService();
            $emerald->postPayment((int) $acctRef, $amount, $transId);
        } catch (\Exception $e) {
            Log::error('Emerald payment_add failed', [
                'mbr_id'   => $acctRef,
                'trans_id' => $transId,
                'error'    => $e->getMessage(),
            ]);
        }

        // 3. Reactivate subscription in your DB if it was suspended
        $user->subscriptions()
             ->whereIn('status', ['suspended', 'expired'])
             ->update(['status' => 'active', 'suspended_at' => null]);

        // M-Pesa expects this exact JSON acknowledgment
        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Accepted',
        ]);
    }

    /**
     * C2B Validation URL – called before accepting Paybill payment.
     * Return ResultCode 0 to accept, any other code to reject.
     */
    public function validation(Request $request)
    {
        Log::channel('mpesa')->info('MpesaValidation', $request->all());

        // Auto-accept all; add business logic here if needed
        return response()->json([
            'ResultCode'          => 0,
            'ResultDesc'          => 'Accepted',
            'ThirdPartyTransID'   => $request->TransID,
        ]);
    }
}