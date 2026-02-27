<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Billing\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * List payments. Clients see their own; admins see all.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user  = $request->user();
        $query = Payment::with(['invoice', 'user'])->latest();

        if (!$user->hasAnyRole(['admin', 'staff'])) {
            $query->where('user_id', $user->id);
        }

        $query->when($request->status,        fn($q) => $q->where('status', $request->status))
              ->when($request->payment_method, fn($q) => $q->where('payment_method', $request->payment_method))
              ->when($request->invoice_id,     fn($q) => $q->where('invoice_id', $request->invoice_id))
              ->when($request->from,           fn($q) => $q->whereDate('paid_at', '>=', $request->from))
              ->when($request->to,             fn($q) => $q->whereDate('paid_at', '<=', $request->to));

        return PaymentResource::collection($query->paginate($request->per_page ?? 15));
    }

    /**
     * Show a single payment.
     */
    public function show(Request $request, Payment $payment): PaymentResource
    {
        $this->authorizePaymentAccess($request->user(), $payment);
        $payment->load(['invoice', 'user', 'recordedBy', 'refundedBy']);
        return new PaymentResource($payment);
    }

    /**
     * Initiate M-Pesa STK Push.
     */
    public function initiateMpesa(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'phone'      => 'required|string|regex:/^(07|01|\+2547|\+2541|2547|2541)[0-9]{8}$/',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        $this->authorizeInvoiceAccess($request->user(), $invoice);

        abort_if($invoice->amount_due <= 0, 422, 'Invoice has no outstanding balance.');

        $payment = $this->paymentService->initiateMpesaStk($invoice, $validated['phone']);

        return response()->json([
            'message'              => 'STK Push sent. Please check your phone to complete payment.',
            'payment_number'       => $payment->payment_number,
            'checkout_request_id'  => $payment->mpesa_checkout_request_id,
        ]);
    }

    /**
     * Initiate Pesapal payment.
     */
    public function initiatePesapal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        $this->authorizeInvoiceAccess($request->user(), $invoice);

        $result = $this->paymentService->initiatePesapal($invoice, $request->user());

        return response()->json([
            'payment_number' => $result['payment']->payment_number,
            'redirect_url'   => $result['redirect_url'],
        ]);
    }

    /**
     * Initiate Flutterwave payment.
     */
    public function initiateFlutterwave(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        $this->authorizeInvoiceAccess($request->user(), $invoice);

        $result = $this->paymentService->initiateFlutterwave($invoice, $request->user());

        return response()->json([
            'payment_number' => $result['payment']->payment_number,
            'payment_url'    => $result['payment_url'],
        ]);
    }

    /**
     * Initiate card payment (generic entry point – routes to configured gateway).
     */
    public function initiateCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'gateway'    => 'nullable|in:pesapal,flutterwave',
        ]);

        $gateway = $validated['gateway'] ?? config('billing.default_card_gateway', 'pesapal');

        $request->merge(['invoice_id' => $validated['invoice_id']]);

        return match ($gateway) {
            'flutterwave' => $this->initiateFlutterwave($request),
            default       => $this->initiatePesapal($request),
        };
    }

    /**
     * Verify / confirm a payment manually (admin/staff).
     */
    public function verify(Request $request, Payment $payment): JsonResponse
    {
        abort_if($payment->status === 'completed', 422, 'Payment already completed.');

        $payment->markCompleted($request->transaction_id);
        $this->paymentService->applyPaymentToInvoice($payment); // Call via reflection or expose

        return response()->json(['message' => 'Payment verified and applied.']);
    }

    /**
     * Refund a payment (admin/staff only).
     */
    public function refund(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
        ]);

        $this->paymentService->refund(
            $payment,
            $validated['amount'],
            $validated['reason'],
            $request->user()->id
        );

        return response()->json(['message' => 'Refund processed and credit added to wallet.']);
    }

    /**
     * Record a manual payment (cash, bank transfer, cheque) - admin/staff only.
     */
    public function recordManual(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id'         => 'required|exists:invoices,id',
            'payment_method'     => 'required|in:cash,bank_transfer,cheque',
            'amount'             => 'required|numeric|min:0.01',
            'reference'          => 'nullable|string|max:255',
            'bank_name'          => 'nullable|string|max:255',
            'bank_reference'     => 'nullable|string|max:255',
            'transfer_date'      => 'nullable|date',
            'notes'              => 'nullable|string|max:500',
            'paid_at'            => 'nullable|date',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);

        $payment = $this->paymentService->recordManualPayment(
            $invoice,
            $validated,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'payment' => new PaymentResource($payment->load(['invoice', 'user'])),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    protected function authorizePaymentAccess(\App\Models\User $user, Payment $payment): void
    {
        if (!$user->hasAnyRole(['admin', 'staff']) && $payment->user_id !== $user->id) {
            abort(403, 'Access denied.');
        }
    }

    protected function authorizeInvoiceAccess(\App\Models\User $user, Invoice $invoice): void
    {
        if (!$user->hasAnyRole(['admin', 'staff']) && $invoice->user_id !== $user->id) {
            abort(403, 'Access denied.');
        }
    }
}