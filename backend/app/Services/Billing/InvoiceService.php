<?php

namespace App\Services\Billing;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    /**
     * Generate an invoice for a subscription billing cycle.
     */
    public function generateSubscriptionInvoice(Subscription $subscription): Invoice
    {
        return DB::transaction(function () use ($subscription) {
            $user    = $subscription->user;
            $product = $subscription->product;
            $price   = $subscription->total_amount;

            $invoice = Invoice::create([
                'user_id'              => $user->id,
                'subscription_id'      => $subscription->id,
                'invoice_number'       => Invoice::generateNumber(),
                'type'                 => 'subscription',
                'status'               => 'draft',
                'invoice_date'         => now(),
                'due_date'             => now()->addDays(config('billing.due_days', 7)),
                'billing_period_start' => $subscription->current_period_start,
                'billing_period_end'   => $subscription->current_period_end,
                'currency'             => $subscription->currency,
                'subtotal'             => $subscription->base_price + $subscription->addons_total,
                'discount_amount'      => $subscription->discount_amount,
                'setup_fee'            => $subscription->setup_fee,
                'tax_rate'             => config('billing.tax_rate', 0),
                'tax_label'            => config('billing.tax_label', 'VAT'),
                'tax_number'           => $user->tax_pin,
            ]);

            // Main plan line item
            InvoiceItem::create([
                'invoice_id'  => $invoice->id,
                'product_id'  => $product->id,
                'description' => "{$product->name} – " . ucfirst($subscription->billing_cycle) . " plan",
                'quantity'    => 1,
                'unit_price'  => $subscription->base_price,
                'total'       => $subscription->base_price,
                'type'        => 'plan',
                'sort_order'  => 1,
            ]);

            // Addon line items
            foreach ($subscription->addons ?? [] as $index => $addon) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'addon_id'    => $addon->id,
                    'description' => $addon->name,
                    'quantity'    => 1,
                    'unit_price'  => $addon->pivot->price ?? $addon->price,
                    'total'       => $addon->pivot->price ?? $addon->price,
                    'type'        => 'addon',
                    'sort_order'  => $index + 2,
                ]);
            }

            // Setup fee line item (first invoice only)
            if ($subscription->setup_fee > 0) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => 'Setup Fee',
                    'quantity'    => 1,
                    'unit_price'  => $subscription->setup_fee,
                    'total'       => $subscription->setup_fee,
                    'type'        => 'setup_fee',
                    'sort_order'  => 99,
                ]);
            }

            $this->finalizeAmounts($invoice);

            return $invoice;
        });
    }

    /**
     * Generate an ad-hoc / one-time invoice.
     */
    public function generateOneTimeInvoice(User $user, array $items, array $options = []): Invoice
    {
        return DB::transaction(function () use ($user, $items, $options) {
            $invoice = Invoice::create(array_merge([
                'user_id'        => $user->id,
                'invoice_number' => Invoice::generateNumber(),
                'type'           => 'one_time',
                'status'         => 'draft',
                'invoice_date'   => now(),
                'due_date'       => now()->addDays(config('billing.due_days', 7)),
                'currency'       => 'KES',
                'tax_rate'       => config('billing.tax_rate', 0),
                'tax_label'      => config('billing.tax_label', 'VAT'),
            ], $options));

            foreach ($items as $index => $item) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'product_id'  => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'] ?? 1,
                    'unit_price'  => $item['unit_price'],
                    'total'       => ($item['quantity'] ?? 1) * $item['unit_price'],
                    'type'        => $item['type'] ?? 'other',
                    'sort_order'  => $index,
                ]);
            }

            $this->finalizeAmounts($invoice);

            return $invoice;
        });
    }

    /**
     * Generate a credit note against an existing invoice.
     */
    public function generateCreditNote(Invoice $original, float $amount, string $reason): Invoice
    {
        return DB::transaction(function () use ($original, $amount, $reason) {
            $credit = Invoice::create([
                'user_id'             => $original->user_id,
                'invoice_number'      => Invoice::generateNumber(),
                'type'                => 'credit_note',
                'status'              => 'sent',
                'invoice_date'        => now(),
                'due_date'            => now(),
                'currency'            => $original->currency,
                'subtotal'            => -$amount,
                'total_amount'        => -$amount,
                'amount_due'          => 0,
                'discount_reason'     => $reason,
                'original_invoice_id' => $original->id,
                'credit_note_amount'  => $amount,
            ]);

            InvoiceItem::create([
                'invoice_id'  => $credit->id,
                'description' => "Credit Note for Invoice #{$original->invoice_number}: {$reason}",
                'quantity'    => 1,
                'unit_price'  => -$amount,
                'total'       => -$amount,
                'type'        => 'credit',
            ]);

            // Apply credit to wallet
            $wallet = $original->user->creditWallet()->firstOrCreate(
                ['user_id' => $original->user_id],
                ['currency' => $original->currency]
            );
            $wallet->credit($amount, 'refund', ['invoice_id' => $original->id]);

            return $credit;
        });
    }

    /**
     * Recalculate invoice totals from line items.
     */
    public function finalizeAmounts(Invoice $invoice): void
    {
        $invoice->load('items');
        $subtotal = $invoice->items->sum(fn($i) => $i->unit_price * $i->quantity);

        $invoice->subtotal     = $subtotal;
        $invoice->tax_amount   = round($subtotal * ($invoice->tax_rate / 100), 2);
        $invoice->total_amount = $subtotal - $invoice->discount_amount + $invoice->tax_amount + $invoice->setup_fee;
        $invoice->amount_due   = max(0, $invoice->total_amount - $invoice->amount_paid - $invoice->credit_applied);
        $invoice->save();
    }

    /**
     * Send the invoice to the client (mark as sent + dispatch notification).
     */
    public function send(Invoice $invoice): void
    {
        $invoice->update(['status' => 'sent']);

        // Dispatch email notification
        // SendInvoiceNotification::dispatch($invoice);
    }

    /**
     * Void an invoice.
     */
    public function void(Invoice $invoice, string $reason = null): void
    {
        if (in_array($invoice->status, ['paid', 'void'])) {
            throw new \LogicException("Cannot void a {$invoice->status} invoice.");
        }

        $invoice->update([
            'status'    => 'void',
            'voided_at' => now(),
            'internal_notes' => trim($invoice->internal_notes . "\nVoided: " . $reason),
        ]);
    }

    /**
     * Mark overdue invoices (run via scheduler).
     */
    public function markOverdueInvoices(): int
    {
        return Invoice::whereIn('status', ['sent', 'partial'])
            ->where('due_date', '<', now())
            ->update(['status' => 'overdue']);
    }
}