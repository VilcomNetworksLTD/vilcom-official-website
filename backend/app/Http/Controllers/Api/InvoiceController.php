<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\Billing\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InvoiceController extends Controller
{
    public function __construct(protected InvoiceService $invoiceService) {}

    /**
     * List invoices. Clients see their own; admin/staff see all (with filters).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user  = $request->user();
        $query = Invoice::with(['user', 'subscription', 'items'])
                        ->latest('invoice_date');

        // Clients only see their own invoices
        if (!$user->hasAnyRole(['admin', 'staff'])) {
            $query->where('user_id', $user->id);
        }

        // Filters
        $query->when($request->status,  fn($q) => $q->where('status', $request->status))
              ->when($request->type,    fn($q) => $q->where('type', $request->type))
              ->when($request->from,    fn($q) => $q->whereDate('invoice_date', '>=', $request->from))
              ->when($request->to,      fn($q) => $q->whereDate('invoice_date', '<=', $request->to))
              ->when($request->user_id && $user->hasAnyRole(['admin', 'staff']),
                  fn($q) => $q->where('user_id', $request->user_id));

        return InvoiceResource::collection($query->paginate($request->per_page ?? 15));
    }

    /**
     * Show single invoice (with line items and payments).
     */
    public function show(Request $request, Invoice $invoice): InvoiceResource
    {
        $this->authorizeInvoiceAccess($request->user(), $invoice);

        $invoice->load(['user', 'subscription.product', 'items.product', 'items.addon', 'payments', 'createdBy']);

        return new InvoiceResource($invoice);
    }

    /**
     * Create a manual / ad-hoc invoice (admin/staff only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'      => 'required|exists:users,id',
            'type'         => 'required|in:one_time,service,other',
            'due_date'     => 'nullable|date|after_or_equal:today',
            'notes'        => 'nullable|string',
            'items'        => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.product_id'  => 'nullable|exists:products,id',
            'items.*.type'        => 'nullable|string',
            'discount_amount'     => 'nullable|numeric|min:0',
            'tax_rate'            => 'nullable|numeric|min:0|max:100',
        ]);

        $user    = \App\Models\User::findOrFail($validated['user_id']);
        $invoice = $this->invoiceService->generateOneTimeInvoice($user, $validated['items'], [
            'type'            => $validated['type'],
            'due_date'        => $validated['due_date'] ?? now()->addDays(7),
            'notes'           => $validated['notes'] ?? null,
            'discount_amount' => $validated['discount_amount'] ?? 0,
            'tax_rate'        => $validated['tax_rate'] ?? config('billing.tax_rate', 0),
            'created_by'      => $request->user()->id,
        ]);

        return (new InvoiceResource($invoice->load('items')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update invoice metadata (admin/staff only).
     */
    public function update(Request $request, Invoice $invoice): InvoiceResource
    {
        abort_if(in_array($invoice->status, ['paid', 'void']), 422, 'Cannot edit a paid or void invoice.');

        $validated = $request->validate([
            'due_date'       => 'nullable|date',
            'notes'          => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'discount_amount'=> 'nullable|numeric|min:0',
            'tax_rate'       => 'nullable|numeric|min:0|max:100',
        ]);

        $invoice->update($validated);
        $this->invoiceService->finalizeAmounts($invoice);

        return new InvoiceResource($invoice->fresh(['items', 'payments']));
    }

    /**
     * Send invoice to client via email.
     */
    public function send(Request $request, Invoice $invoice): JsonResponse
    {
        abort_if($invoice->status === 'void', 422, 'Cannot send a void invoice.');

        $this->invoiceService->send($invoice);

        return response()->json(['message' => 'Invoice sent successfully.']);
    }

    /**
     * Mark invoice as paid (manual override by admin/staff).
     */
    public function markPaid(Request $request, Invoice $invoice): JsonResponse
    {
        abort_if($invoice->status === 'paid', 422, 'Invoice is already paid.');

        $invoice->update([
            'status'     => 'paid',
            'paid_at'    => now(),
            'amount_paid'=> $invoice->total_amount,
            'amount_due' => 0,
        ]);

        return response()->json(['message' => 'Invoice marked as paid.']);
    }

    /**
     * Void an invoice.
     */
    public function void(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string']);

        $this->invoiceService->void($invoice, $request->reason);

        return response()->json(['message' => 'Invoice voided.']);
    }

    /**
     * Download invoice as PDF.
     */
    public function download(Request $request, Invoice $invoice)
    {
        $this->authorizeInvoiceAccess($request->user(), $invoice);

        // Generate PDF if not cached
        if (!$invoice->pdf_path || !file_exists(storage_path("app/{$invoice->pdf_path}"))) {
            // dispatch(new GenerateInvoicePdf($invoice));
            // For now, return JSON until PDF generation is wired up:
            return response()->json(['message' => 'PDF generation queued.'], 202);
        }

        return response()->download(
            storage_path("app/{$invoice->pdf_path}"),
            "Invoice-{$invoice->invoice_number}.pdf"
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    protected function authorizeInvoiceAccess(\App\Models\User $user, Invoice $invoice): void
    {
        if (!$user->hasAnyRole(['admin', 'staff']) && $invoice->user_id !== $user->id) {
            abort(403, 'Access denied.');
        }
    }
}