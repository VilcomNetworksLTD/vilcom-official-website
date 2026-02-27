<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Services\Billing\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * STK Push / C2B Confirmation callback.
     * M-Pesa posts JSON; respond quickly with success acknowledgement.
     */
    public function callback(Request $request)
    {
        Log::channel('mpesa')->info('MpesaCallback', $request->all());

        try {
            $this->paymentService->handleMpesaStkCallback($request->all());
        } catch (\Throwable $e) {
            Log::channel('mpesa')->error('MpesaCallback error', ['error' => $e->getMessage()]);
        }

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