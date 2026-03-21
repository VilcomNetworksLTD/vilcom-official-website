<?php
// app/Models/EmeraldProductMapping.php

namespace App\Models;

use App\Services\EmeraldService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmeraldProductMapping extends Model
{
    protected $fillable = [
        'product_id',
        'emerald_service_type_id',
        'emerald_service_category_id',
        'emerald_service_type_name',
        'auto_provision',
        'sync_price',
        'is_active',
        'billing_cycle_name',  // name-based, not ID
        'pay_period_id',       // null = use global default (Monthly)
        'last_synced_at',
    ];

    protected $casts = [
        'auto_provision' => 'boolean',
        'sync_price'     => 'boolean',
        'is_active'      => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /**
     * Get the resolved billing cycle name for this mapping.
     * Falls back to global config if not set on the mapping.
     */
    public function getBillingCycleName(): string
    {
        return $this->billing_cycle_name
            ?? config('emerald.billing_cycle_name', 'Vilcom Billing Cycle');
    }

    /**
     * Get the resolved pay period ID for this mapping.
     * Falls back to global config (Monthly=1) if not set.
     */
    public function getResolvedPayPeriodId(): int
    {
        return $this->pay_period_id
            ?? config('emerald.pay_period_id', EmeraldService::PAY_PERIODS['monthly']);
    }

    public function getResolvedPayPeriodName(): string
    {
        // If a specific pay period ID is set, convert it to name
        if ($this->pay_period_id) {
            $periods = array_flip(EmeraldService::PAY_PERIODS);
            return ucfirst($periods[$this->pay_period_id] ?? 'Monthly');
            // ucfirst converts 'monthly' → 'Monthly', 'quarterly' → 'Quarterly' etc.
        }
        return config('emerald.pay_period_name', 'Monthly');
    }

    /**
     * Get human-readable pay period name.
     */
    public function getPayPeriodNameAttribute(): string
    {
        $periods = array_flip(EmeraldService::PAY_PERIODS);
        return $periods[$this->getResolvedPayPeriodId()] ?? 'monthly';
    }

    // ── Scopes ───────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAutoProvision($query)
    {
        return $query->where('auto_provision', true);
    }
}
