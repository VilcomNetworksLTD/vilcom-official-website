<?php
// app/Http/Controllers/Api/Webhook/MpesaController.php

namespace App\Http\Controllers\Api\Webhook;

use App\Http\Controllers\Controller;
use App\Models\MpesaTransaction;
use App\Models\Payment;
use App\Models\User;
use App\Services\Billing\MpesaService;
use App\Services\Billing\PaymentService;
use App\Services\EmeraldBillingOrchestrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function __construct(
        protected PaymentService             $paymentService,
        protected EmeraldBillingOrchestrator $orchestrator
    ) {}

    // ════════════════════════════════════════════════════════════════════
    // STK PUSH CALLBACK
    // Called after customer enters M-Pesa PIN on phone
    // ════════════════════════════════════════════════════════════════════

    public function callback(Request $request): JsonResponse
    {
        $data = $request->all();
        Log::channel('mpesa')->info('STK Callback received', $data);

        try {
            // Hand to PaymentService first (existing flow — do not remove)
            $this->paymentService->handleMpesaStkCallback($data);
        } catch (\Throwable $e) {
            Log::channel('mpesa')->error('PaymentService STK handler failed', [
                'error' => $e->getMessage(),
            ]);
        }

        $body       = $data['Body']['stkCallback'] ?? [];
        $resultCode = $body['ResultCode']           ?? 1;

        // Failed or cancelled by customer
        if ((int) $resultCode !== 0) {
            Log::channel('mpesa')->warning('STK Push failed/cancelled', [
                'result_code' => $resultCode,
                'result_desc' => $body['ResultDesc'] ?? null,
            ]);
            return $this->ack();
        }

        // ── Extract metadata ─────────────────────────────────────────────
        $items   = collect($body['CallbackMetadata']['Item'] ?? []);
        $amount  = (float)  ($items->firstWhere('Name', 'Amount')['Value']            ?? 0);
        $transId = (string) ($items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? '');
        $phone   = (string) ($items->firstWhere('Name', 'PhoneNumber')['Value']        ?? '');
        // AccountReference = emerald_mbr_id (set when initiating STK Push)
        $acctRef = (string) ($body['AccountReference']
                          ?? $items->firstWhere('Name', 'AccountReference')['Value']
                          ?? '');

        if (!$transId || $amount <= 0) {
            Log::channel('mpesa')->error('STK callback missing required fields', $body);
            return $this->ack();
        }

        $this->processPayment(
            transId:   $transId,
            amount:    $amount,
            phone:     $phone,
            billRef:   $acctRef,
            transType: 'STK',
            rawData:   $data
        );

        return $this->ack();
    }

    // ════════════════════════════════════════════════════════════════════
    // C2B CONFIRMATION
    // Called by Safaricom after a Paybill payment completes
    // ════════════════════════════════════════════════════════════════════

    public function confirmation(Request $request): JsonResponse
    {
        $data = $request->all();
        Log::channel('mpesa')->info('C2B Confirmation received', $data);

        $transId   = $data['TransID']           ?? null;
        $amount    = (float)($data['TransAmount'] ?? 0);
        $billRef   = $data['BillRefNumber']      ?? null;  // = emerald_mbr_id
        $phone     = $data['MSISDN']             ?? null;

        if (!$transId || !$billRef || $amount <= 0) {
            Log::channel('mpesa')->error('C2B confirmation missing required fields', $data);
            return $this->c2bAck();
        }

        $this->processPayment(
            transId:   $transId,
            amount:    $amount,
            phone:     $phone ?? '',
            billRef:   $billRef,
            transType: 'C2B',
            rawData:   $data,
            extra: [
                'trans_time'      => $data['TransTime']          ?? null,
                'first_name'      => $data['FirstName']          ?? null,
                'middle_name'     => $data['MiddleName']         ?? null,
                'last_name'       => $data['LastName']           ?? null,
                'short_code'      => $data['BusinessShortCode']  ?? null,
                'org_acc_balance' => $data['OrgAccountBalance']  ?? null,
            ]
        );

        return $this->c2bAck();
    }

    // ════════════════════════════════════════════════════════════════════
    // C2B VALIDATION
    // Called BEFORE Safaricom processes a Paybill payment
    // Return ResultCode 0 to accept, 1 to reject
    // ════════════════════════════════════════════════════════════════════

    public function validation(Request $request): JsonResponse
    {
        $data    = $request->all();
        $billRef = $data['BillRefNumber'] ?? null;
        $amount  = $data['TransAmount']   ?? 0;
        $phone   = $data['MSISDN']        ?? null;

        Log::channel('mpesa')->info('C2B Validation received', $data);

        // Accept all if no billRef (shouldn't happen, but be safe)
        if (!$billRef) {
            return response()->json([
                'ResultCode'        => 0,
                'ResultDesc'        => 'Accepted',
                'ThirdPartyTransID' => $data['TransID'] ?? uniqid('VIL'),
            ]);
        }

        // Validate that BillRefNumber matches a known Emerald MBR ID
        $user = User::where('emerald_mbr_id', $billRef)->first();

        if (!$user) {
            Log::channel('mpesa')->warning('C2B validation — unknown MBR ID rejected', [
                'bill_ref' => $billRef,
                'phone'    => $phone,
                'amount'   => $amount,
            ]);

            // Return 1 to reject; comment out and return 0 to accept all
            return response()->json([
                'ResultCode'        => 1,
                'ResultDesc'        => 'Unknown account number',
                'ThirdPartyTransID' => $data['TransID'] ?? uniqid('VIL'),
            ]);
        }

        Log::channel('mpesa')->info('C2B validation accepted', [
            'user_id'  => $user->id,
            'bill_ref' => $billRef,
        ]);

        return response()->json([
            'ResultCode'        => 0,
            'ResultDesc'        => 'Accepted',
            'ThirdPartyTransID' => $data['TransID'] ?? uniqid('VIL'),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // SHARED PAYMENT PROCESSOR
    // Single source of truth for both STK + C2B payment handling
    // ════════════════════════════════════════════════════════════════════

    private function processPayment(
        string $transId,
        float  $amount,
        string $phone,
        string $billRef,
        string $transType,
        array  $rawData,
        array  $extra = []
    ): void {
        try {
            DB::beginTransaction();

            // ── 1. Deduplicate ───────────────────────────────────────────
            if (MpesaTransaction::where('trans_id', $transId)->exists()
                || Payment::where('transaction_id', $transId)->exists()
            ) {
                Log::channel('mpesa')->warning('Duplicate transaction ignored', [
                    'trans_id' => $transId,
                ]);
                DB::rollBack();
                return;
            }

            // ── 2. Find user by MBR ID ───────────────────────────────────
            $user = User::where('emerald_mbr_id', $billRef)->first();

            // ── 3. Record M-Pesa transaction (always — even if unmatched) ─
            $transTime = null;
            if (!empty($extra['trans_time'])) {
                try {
                    $transTime = \Carbon\Carbon::createFromFormat('YmdHis', $extra['trans_time']);
                } catch (\Exception $e) {
                    $transTime = now();
                }
            }

            MpesaTransaction::create([
                'trans_id'        => $transId,
                'trans_time'      => $transTime ?? now(),
                'trans_type'      => $transType,
                'amount'          => $amount,
                'bill_ref'        => $billRef,
                'phone'           => $phone,
                'first_name'      => $extra['first_name']      ?? null,
                'middle_name'     => $extra['middle_name']      ?? null,
                'last_name'       => $extra['last_name']        ?? null,
                'short_code'      => $extra['short_code']       ?? config('mpesa.shortcode'),
                'org_acc_balance' => $extra['org_acc_balance']  ?? null,
                'user_id'         => $user?->id,
                'status'          => $user ? 'pending' : 'unmatched',
                'raw_payload'     => json_encode($rawData),
            ]);

            if (!$user) {
                Log::channel('mpesa')->warning('Payment received for unknown MBR ID', [
                    'trans_id' => $transId,
                    'bill_ref' => $billRef,
                    'amount'   => $amount,
                    'phone'    => $phone,
                ]);
                DB::commit();
                return;
            }

            // ── 4. Record in payments table ──────────────────────────────
            Payment::create([
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

            DB::commit();

            // ── 5. Post to Emerald (outside transaction — safe to retry) ──
            $emeraldSuccess = $this->orchestrator->processPayment(
                (int) $billRef,
                $amount,
                $transId
            );

            // ── 6. Update transaction status ─────────────────────────────
            MpesaTransaction::where('trans_id', $transId)->update([
                'status'            => $emeraldSuccess ? 'posted' : 'emerald_failed',
                'emerald_posted_at' => $emeraldSuccess ? now() : null,
            ]);

            // ── 7. Reactivate suspended subscriptions in your DB ─────────
            if ($emeraldSuccess) {
                $user->subscriptions()
                    ->whereIn('status', ['suspended', 'expired'])
                    ->update(['status' => 'active', 'suspended_at' => null]);
            }

            Log::channel('mpesa')->info('Payment processed', [
                'trans_id'       => $transId,
                'user_id'        => $user->id,
                'amount'         => $amount,
                'trans_type'     => $transType,
                'emerald_posted' => $emeraldSuccess,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('mpesa')->error('Payment processing failed', [
                'trans_id' => $transId,
                'error'    => $e->getMessage(),
                'trace'    => $e->getTraceAsString(),
            ]);
        }
    }

    // ── Response helpers ─────────────────────────────────────────────────

    /** STK Push acknowledgement */
    private function ack(): JsonResponse
    {
        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Accepted',
        ]);
    }

    /** C2B acknowledgement */
    private function c2bAck(): JsonResponse
    {
        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Received',
        ]);
    }
}
