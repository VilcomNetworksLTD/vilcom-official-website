<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use App\Services\Billing\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function __construct(protected InvoiceService $invoiceService) {}

    // ============================================
    // LIST — GET /api/v1/admin/invoices
    // ============================================
    public function index(Request $request)
    {
        $query = Invoice::with(['user:id,name,email', 'subscription:id,subscription_number'])
            ->latest('invoice_date');

        if ($request->filled('status'))      $query->where('status', $request->status);
        if ($request->filled('type'))        $query->where('type',   $request->type);
        if ($request->filled('user_id'))     $query->where('user_id', $request->user_id);
        if ($request->filled('from'))        $query->whereDate('invoice_date', '>=', $request->from);
        if ($request->filled('to'))          $query->whereDate('invoice_date', '<=', $request->to);
        if ($request->filled('overdue'))     $query->where('status', 'overdue');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('invoice_number', 'LIKE', "%{$q}%")
                   ->orWhereHas('user', fn($u) => $u->where('name', 'LIKE', "%{$q}%")
                       ->orWhere('email', 'LIKE', "%{$q}%"));
            });
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $invoices = $query->paginate($perPage);

        return response()->json([
            'data' => $invoices->items(),
            'meta' => [
                'total'        => $invoices->total(),
                'per_page'     => $invoices->perPage(),
                'current_page' => $invoices->currentPage(),
                'last_page'    => $invoices->lastPage(),
            ],
        ]);
    }

    // ============================================
    // SHOW — GET /api/v1/admin/invoices/{invoice}
    // ============================================
    public function show(Invoice $invoice)
    {
        $invoice->load([
            'user:id,name,email,phone,company_name,address',
            'subscription.product:id,name',
            'items.product:id,name',
            'items.addon:id,name',
            'payments',
            'createdBy:id,name',
        ]);

        return response()->json(['data' => $invoice]);
    }

    // ============================================
    // STORE — POST /api/v1/admin/invoices
    // ============================================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'             => 'required|exists:users,id',
            'type'                => 'required|in:one_time,service,other',
            'due_date'            => 'nullable|date',
            'notes'               => 'nullable|string',
            'discount_amount'     => 'nullable|numeric|min:0',
            'tax_rate'            => 'nullable|numeric|min:0|max:100',
            'items'               => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.product_id'  => 'nullable|exists:products,id',
            'items.*.type'        => 'nullable|string',
        ]);

        $user    = User::findOrFail($validated['user_id']);
        $invoice = $this->invoiceService->generateOneTimeInvoice($user, $validated['items'], [
            'type'            => $validated['type'],
            'due_date'        => $validated['due_date'] ?? now()->addDays(7),
            'notes'           => $validated['notes']    ?? null,
            'discount_amount' => $validated['discount_amount'] ?? 0,
            'tax_rate'        => $validated['tax_rate']  ?? config('billing.tax_rate', 0),
            'created_by'      => $request->user()->id,
        ]);

        return response()->json(['data' => $invoice->load('items'), 'message' => 'Invoice created.'], 201);
    }

    // ============================================
    // UPDATE — PUT /api/v1/admin/invoices/{invoice}
    // ============================================
    public function update(Request $request, Invoice $invoice)
    {
        abort_if(in_array($invoice->status, ['paid', 'void']), 422, 'Cannot edit a paid or void invoice.');

        $validated = $request->validate([
            'due_date'        => 'nullable|date',
            'notes'           => 'nullable|string',
            'internal_notes'  => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
        ]);

        $invoice->update($validated);
        $this->invoiceService->finalizeAmounts($invoice);

        return response()->json(['data' => $invoice->fresh(['items', 'payments']), 'message' => 'Invoice updated.']);
    }

    // ============================================
    // SEND — POST /api/v1/admin/invoices/{invoice}/send
    // ============================================
    public function send(Invoice $invoice)
    {
        abort_if($invoice->status === 'void', 422, 'Cannot send a void invoice.');
        $this->invoiceService->send($invoice);
        return response()->json(['message' => 'Invoice sent successfully.']);
    }

    // ============================================
    // MARK PAID — POST /api/v1/admin/invoices/{invoice}/mark-paid
    // ============================================
    public function markPaid(Invoice $invoice)
    {
        abort_if($invoice->status === 'paid', 422, 'Invoice is already paid.');

        $invoice->update([
            'status'      => 'paid',
            'paid_at'     => now(),
            'amount_paid' => $invoice->total_amount,
            'amount_due'  => 0,
        ]);

        return response()->json(['message' => 'Invoice marked as paid.', 'data' => $invoice->fresh()]);
    }

    // ============================================
    // VOID — POST /api/v1/admin/invoices/{invoice}/void
    // ============================================
    public function void(Request $request, Invoice $invoice)
    {
        $request->validate(['reason' => 'nullable|string']);
        $this->invoiceService->void($invoice, $request->reason);
        return response()->json(['message' => 'Invoice voided.', 'data' => $invoice->fresh()]);
    }

    // ============================================
    // DOWNLOAD — GET /api/v1/admin/invoices/{invoice}/download
    // ============================================
    public function download(Invoice $invoice)
    {
        if (!$invoice->pdf_path || !file_exists(storage_path("app/{$invoice->pdf_path}"))) {
            return response()->json(['message' => 'PDF generation queued.'], 202);
        }
        return response()->download(
            storage_path("app/{$invoice->pdf_path}"),
            "Invoice-{$invoice->invoice_number}.pdf"
        );
    }

    // ============================================
    // ANALYTICS — GET /api/v1/admin/invoices/analytics
    // ============================================
    public function analytics(Request $request)
    {
        $from = $request->filled('from') ? $request->from : now()->startOfMonth()->toDateString();
        $to   = $request->filled('to')   ? $request->to   : now()->toDateString();

        $base = Invoice::whereBetween('invoice_date', [$from, $to]);

        return response()->json([
            'summary' => [
                'total'       => (clone $base)->count(),
                'draft'       => (clone $base)->where('status', 'draft')->count(),
                'sent'        => (clone $base)->where('status', 'sent')->count(),
                'paid'        => (clone $base)->where('status', 'paid')->count(),
                'overdue'     => (clone $base)->where('status', 'overdue')->count(),
                'void'        => (clone $base)->where('status', 'void')->count(),
            ],
            'revenue' => [
                'total_billed' => (clone $base)->sum('total_amount'),
                'total_paid'   => (clone $base)->where('status', 'paid')->sum('total_amount'),
                'outstanding'  => (clone $base)->whereIn('status', ['sent', 'overdue', 'partial'])->sum('amount_due'),
            ],
            'period' => ['from' => $from, 'to' => $to],
        ]);
    }
}
