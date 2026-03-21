<?php
// app/Models/MpesaTransaction.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpesaTransaction extends Model
{
    protected $fillable = [
        'trans_id',
        'trans_time',
        'trans_type',       // C2B | STK
        'amount',
        'bill_ref',         // BillRefNumber = emerald_mbr_id
        'phone',
        'first_name',
        'middle_name',
        'last_name',
        'short_code',
        'org_acc_balance',
        'user_id',
        'status',           // pending | posted | emerald_failed | unmatched
        'emerald_posted_at',
        'raw_payload',
    ];

    protected $casts = [
        'trans_time'        => 'datetime',
        'emerald_posted_at' => 'datetime',
        'amount'            => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────

    public function scopePosted($query)
    {
        return $query->where('status', 'posted');
    }

    public function scopeUnmatched($query)
    {
        return $query->where('status', 'unmatched');
    }

    public function scopeEmeraldFailed($query)
    {
        return $query->where('status', 'emerald_failed');
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    public function getCustomerNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function isPosted(): bool
    {
        return $this->status === 'posted';
    }
}
