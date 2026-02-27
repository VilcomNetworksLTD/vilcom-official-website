<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'subscription_id', 'invoice_number', 'reference_number',
        'type', 'status', 'billing_period_start', 'billing_period_end',
        'invoice_date', 'due_date', 'paid_at', 'voided_at',
        'currency', 'subtotal', 'discount_amount', 'tax_amount',
        'setup_fee', 'total_amount', 'amount_paid', 'amount_due', 'credit_applied',
        'tax_rate', 'tax_label', 'tax_number',
        'discount_code', 'discount_percent', 'discount_reason',
        'original_invoice_id', 'credit_note_amount',
        'reminder_count', 'last_reminder_sent_at', 'reminders_enabled',
        'created_by', 'notes', 'internal_notes', 'pdf_path', 'pdf_generated_at',
        'metadata',
    ];

    protected $casts = [
        'billing_period_start' => 'date',
        'billing_period_end'   => 'date',
        'invoice_date'         => 'date',
        'due_date'             => 'date',
        'paid_at'              => 'date',
        'voided_at'            => 'date',
        'last_reminder_sent_at'=> 'datetime',
        'pdf_generated_at'     => 'datetime',
        'reminders_enabled'    => 'boolean',
        'subtotal'             => 'decimal:2',
        'discount_amount'      => 'decimal:2',
        'tax_amount'           => 'decimal:2',
        'setup_fee'            => 'decimal:2',
        'total_amount'         => 'decimal:2',
        'amount_paid'          => 'decimal:2',
        'amount_due'           => 'decimal:2',
        'credit_applied'       => 'decimal:2',
        'tax_rate'             => 'decimal:2',
        'discount_percent'     => 'decimal:2',
        'credit_note_amount'   => 'decimal:2',
        'metadata'             => 'array',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function originalInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'original_invoice_id');
    }

    public function creditNotes(): HasMany
    {
        return $this->hasMany(Invoice::class, 'original_invoice_id');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
                     ->orWhere(fn($q) => $q->where('status', 'sent')
                                           ->where('due_date', '<', now()));
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'sent', 'partial']);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ── Computed Accessors ────────────────────────────────────────────────────

    public function getIsOverdueAttribute(): bool
    {
        return !in_array($this->status, ['paid', 'void', 'refunded', 'uncollectible'])
            && $this->due_date?->isPast();
    }

    public function getBalanceDueAttribute(): float
    {
        return max(0, $this->total_amount - $this->amount_paid - $this->credit_applied);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Generate the next invoice number.
     */
    public static function generateNumber(): string
    {
        $year  = now()->year;
        $last  = static::whereYear('created_at', $year)->max('id') ?? 0;
        $seq   = str_pad($last + 1, 5, '0', STR_PAD_LEFT);
        return "INV-{$year}-{$seq}";
    }

    /**
     * Recalculate totals from line items.
     */
    public function recalculate(): void
    {
        $this->subtotal        = $this->items->sum('unit_price') * 1; // simplified
        $this->tax_amount      = round($this->subtotal * ($this->tax_rate / 100), 2);
        $this->total_amount    = $this->subtotal - $this->discount_amount + $this->tax_amount + $this->setup_fee;
        $this->amount_due      = max(0, $this->total_amount - $this->amount_paid - $this->credit_applied);
        $this->save();
    }

    /**
     * Mark invoice as paid (or partial if amount < total).
     */
    public function recordPayment(float $amount): void
    {
        $this->amount_paid += $amount;
        $this->amount_due   = max(0, $this->total_amount - $this->amount_paid - $this->credit_applied);

        if ($this->amount_due <= 0) {
            $this->status  = 'paid';
            $this->paid_at = now();
        } else {
            $this->status  = 'partial';
        }

        $this->save();
    }
}