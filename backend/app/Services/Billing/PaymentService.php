<?php

namespace App\Services\Billing;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        protected MpesaService      $mpesa,
        protected PesapalService    $pesapal,
        protected FlutterwaveService $flutterwave,
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // M-PESA STK PUSH
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initiate M-Pesa STK Push and create a pending payment.
     */
    public function initiateMpesaStk(Invoice $invoice, string $phone): Payment
    {
        $payment = $this->createPendingPayment($invoice, [
            'payment_method' => 'mpesa',
            'gateway'        => 'mpesa_stk',
            'mpesa_phone'    => $this->formatKenyanPhone($phone),
        ]);

        $response = $this->mpesa->stkPush(
            phone:     $payment->mpesa_phone,
            amount:    (int) $invoice->amount_due,
            reference: $invoice->invoice_number,
            description: "Payment for invoice {$invoice->invoice_number}",
        );

        $payment->update([
            'mpesa_checkout_request_id'  => $response['CheckoutRequestID'] ?? null,
            'mpesa_merchant_request_id'  => $response['MerchantRequestID'] ?? null,
            'gateway_response'           => $response,
        ]);

        return $payment;
    }

    /**
     * Handle M-Pesa STK callback (called from webhook controller).
     */
    public function handleMpesaStkCallback(array $payload): void
    {
        $stkCallback = $payload['Body']['stkCallback'] ?? [];
        $checkoutId  = $stkCallback['CheckoutRequestID'] ?? null;
        $resultCode  = $stkCallback['ResultCode'] ?? -1;

        $payment = Payment::where('mpesa_checkout_request_id', $checkoutId)->first();

        if (!$payment) {
            Log::warning('MpesaCallback: Payment not found for CheckoutRequestID', ['id' => $checkoutId]);
            return;
        }

        if ($resultCode == 0) {
            // Success
            $items   = collect($stkCallback['CallbackMetadata']['Item'] ?? []);
            $receipt = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;
            $amount  = $items->firstWhere('Name', 'Amount')['Value'] ?? $payment->amount;

            $payment->update([
                'status'               => 'completed',
                'mpesa_receipt_number' => $receipt,
                'transaction_id'       => $receipt,
                'amount'               => $amount,
                'net_amount'           => $amount,
                'gateway_response'     => $payload,
                'paid_at'              => now(),
            ]);

            $this->applyPaymentToInvoice($payment);
        } else {
            $payment->markFailed(
                $stkCallback['ResultDesc'] ?? 'STK Push failed',
                (string) $resultCode
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PESAPAL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initiate Pesapal payment and return redirect URL.
     */
    public function initiatePesapal(Invoice $invoice, User $user): array
    {
        $payment = $this->createPendingPayment($invoice, [
            'payment_method' => 'card',
            'gateway'        => 'pesapal',
        ]);

        $result = $this->pesapal->submitOrder(
            amount:      $invoice->amount_due,
            currency:    $invoice->currency,
            reference:   $payment->payment_number,
            description: "Invoice {$invoice->invoice_number}",
            email:       $user->email,
            phone:       $user->phone,
            firstName:   explode(' ', $user->name)[0],
            lastName:    explode(' ', $user->name)[1] ?? '',
        );

        $payment->update([
            'gateway_reference' => $result['order_tracking_id'] ?? null,
            'gateway_response'  => $result,
        ]);

        return [
            'payment'      => $payment,
            'redirect_url' => $result['redirect_url'] ?? null,
        ];
    }

    /**
     * Handle Pesapal IPN (Instant Payment Notification).
     */
    public function handlePesapalIpn(string $orderTrackingId, string $merchantReference): void
    {
        $payment = Payment::where('gateway_reference', $orderTrackingId)
                           ->orWhere('payment_number', $merchantReference)
                           ->first();

        if (!$payment) {
            Log::warning('PesapalIPN: Payment not found', compact('orderTrackingId'));
            return;
        }

        $status = $this->pesapal->getTransactionStatus($orderTrackingId);

        $payment->update(['gateway_response' => $status]);

        match ($status['payment_status_description'] ?? '') {
            'Completed' => $payment->markCompleted($status['confirmation_code'] ?? null),
            'Failed'    => $payment->markFailed($status['description'] ?? 'Payment failed'),
            default     => null,
        };

        if ($payment->status === 'completed') {
            $this->applyPaymentToInvoice($payment);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FLUTTERWAVE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initiate Flutterwave payment link.
     */
    public function initiateFlutterwave(Invoice $invoice, User $user): array
    {
        $payment = $this->createPendingPayment($invoice, [
            'payment_method' => 'card',
            'gateway'        => 'flutterwave',
        ]);

        $result = $this->flutterwave->initializePayment([
            'tx_ref'       => $payment->payment_number,
            'amount'       => $invoice->amount_due,
            'currency'     => $invoice->currency,
            'redirect_url' => config('billing.flutterwave.callback_url'),
            'customer'     => [
                'email'        => $user->email,
                'phonenumber'  => $user->phone,
                'name'         => $user->name,
            ],
            'customizations' => [
                'title'       => config('app.name'),
                'description' => "Invoice {$invoice->invoice_number}",
            ],
        ]);

        $payment->update([
            'gateway_reference' => $result['data']['link'] ?? null,
            'gateway_response'  => $result,
        ]);

        return [
            'payment'     => $payment,
            'payment_url' => $result['data']['link'] ?? null,
        ];
    }

    /**
     * Verify Flutterwave transaction and finalize.
     */
    public function verifyFlutterwave(string $transactionId, Payment $payment): void
    {
        $result = $this->flutterwave->verifyTransaction($transactionId);

        if (($result['data']['status'] ?? '') === 'successful') {
            $payment->markCompleted($transactionId);
            $this->applyPaymentToInvoice($payment);
        } else {
            $payment->markFailed($result['data']['processor_response'] ?? 'Verification failed');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MANUAL PAYMENT (Cash / Bank Transfer / Cheque)
    // ─────────────────────────────────────────────────────────────────────────

    public function recordManualPayment(Invoice $invoice, array $data, int $recordedBy): Payment
    {
        return DB::transaction(function () use ($invoice, $data, $recordedBy) {
            $payment = Payment::create([
                'user_id'             => $invoice->user_id,
                'invoice_id'          => $invoice->id,
                'subscription_id'     => $invoice->subscription_id,
                'payment_number'      => Payment::generateNumber(),
                'payment_method'      => $data['payment_method'],
                'gateway'             => 'manual',
                'status'              => 'completed',
                'currency'            => $invoice->currency,
                'amount'              => $data['amount'],
                'net_amount'          => $data['amount'],
                'transaction_id'      => $data['reference'] ?? null,
                'bank_name'           => $data['bank_name'] ?? null,
                'bank_reference'      => $data['bank_reference'] ?? null,
                'bank_transfer_date'  => $data['transfer_date'] ?? null,
                'mpesa_receipt_number'=> $data['mpesa_receipt'] ?? null,
                'notes'               => $data['notes'] ?? null,
                'recorded_by'         => $recordedBy,
                'paid_at'             => $data['paid_at'] ?? now(),
                'ip_address'          => request()->ip(),
            ]);

            $this->applyPaymentToInvoice($payment);

            return $payment;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REFUND
    // ─────────────────────────────────────────────────────────────────────────

    public function refund(Payment $payment, float $amount, string $reason, int $refundedBy): void
    {
        DB::transaction(function () use ($payment, $amount, $reason, $refundedBy) {
            if ($amount > ($payment->amount - $payment->refunded_amount)) {
                throw new \InvalidArgumentException('Refund amount exceeds payment balance.');
            }

            $payment->increment('refunded_amount', $amount);
            $payment->update([
                'status'      => $payment->refunded_amount >= $payment->amount ? 'refunded' : 'partial_refund',
                'refunded_by' => $refundedBy,
                'refunded_at' => now(),
                'refund_reason' => $reason,
            ]);

            // Credit the user's wallet
            $wallet = $payment->user->creditWallet()->firstOrCreate(
                ['user_id' => $payment->user_id],
                ['currency' => $payment->currency]
            );
            $wallet->credit($amount, 'refund', [
                'invoice_id' => $payment->invoice_id,
                'payment_id' => $payment->id,
            ]);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    protected function createPendingPayment(Invoice $invoice, array $extra = []): Payment
    {
        return Payment::create(array_merge([
            'user_id'         => $invoice->user_id,
            'invoice_id'      => $invoice->id,
            'subscription_id' => $invoice->subscription_id,
            'payment_number'  => Payment::generateNumber(),
            'status'          => 'pending',
            'currency'        => $invoice->currency,
            'amount'          => $invoice->amount_due,
            'ip_address'      => request()->ip(),
        ], $extra));
    }

    /**
     * Apply payment to invoice (public for use by controllers).
     */
    public function applyPaymentToInvoice(Payment $payment): void
    {
        if (!$payment->invoice_id) {
            return;
        }

        $invoice = Invoice::lockForUpdate()->find($payment->invoice_id);
        $invoice->recordPayment($payment->amount);

        // Log activity
        activity()
            ->performedOn($invoice)
            ->causedBy($payment->user)
            ->withProperties(['payment_id' => $payment->id, 'amount' => $payment->amount])
            ->log('payment_received');
    }

    protected function formatKenyanPhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }
        if (!str_starts_with($phone, '254')) {
            $phone = '254' . $phone;
        }
        return $phone;
    }
}