<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'invoice_id', 'subscription_id',
        'payment_number', 'transaction_id', 'gateway_reference',
        'payment_method', 'gateway', 'status',
        'currency', 'amount', 'gateway_fee', 'net_amount', 'refunded_amount',
        // M-Pesa
        'mpesa_phone', 'mpesa_receipt_number', 'mpesa_checkout_request_id',
        'mpesa_merchant_request_id', 'mpesa_account_reference',
        // Card
        'card_last_four', 'card_brand', 'card_holder_name', 'card_token',
        // Bank
        'bank_name', 'bank_account', 'bank_reference', 'bank_transfer_date',
        // Gateway
        'gateway_response', 'failure_reason', 'failure_code',
        // Refund
        'refunded_by', 'refunded_at', 'refund_reason', 'refund_transaction_id',
        // Other
        'paid_at', 'expires_at', 'recorded_by', 'notes', 'metadata', 'ip_address',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'gateway_fee'      => 'decimal:2',
        'net_amount'       => 'decimal:2',
        'refunded_amount'  => 'decimal:2',
        'gateway_response' => 'array',
        'metadata'         => 'array',
        'paid_at'          => 'datetime',
        'expires_at'       => 'datetime',
        'refunded_at'      => 'datetime',
        'bank_transfer_date' => 'date',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function refundedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }

    public function scopeForGateway($query, string $gateway)
    {
        return $query->where('gateway', $gateway);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public static function generateNumber(): string
    {
        $year = now()->year;
        $last = static::whereYear('created_at', $year)->max('id') ?? 0;
        $seq  = str_pad($last + 1, 5, '0', STR_PAD_LEFT);
        return "PAY-{$year}-{$seq}";
    }

    public function markCompleted(string $transactionId = null): void
    {
        $this->update([
            'status'         => 'completed',
            'transaction_id' => $transactionId ?? $this->transaction_id,
            'paid_at'        => now(),
            'net_amount'     => $this->amount - $this->gateway_fee,
        ]);
    }

    public function markFailed(string $reason = null, string $code = null): void
    {
        $this->update([
            'status'         => 'failed',
            'failure_reason' => $reason,
            'failure_code'   => $code,
        ]);
    }
}