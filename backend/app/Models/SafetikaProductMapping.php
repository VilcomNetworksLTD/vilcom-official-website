<?php
// app/Models/SafetikaProductMapping.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SafetikaProductMapping extends Model
{
    protected $fillable = [
        'product_id',
        'account_type',
        'service_category',
        'customer_type',
        'label',
        'auto_provision',
        'is_active',
        'last_provisioned_at',
    ];

    protected $casts = [
        'auto_provision'       => 'boolean',
        'is_active'            => 'boolean',
        'last_provisioned_at'  => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
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

    // ── Helpers ──────────────────────────────────────────────────────────

    /**
     * Returns defaults from config if a mapping row isn't found for a product.
     * Ensures provisioning always works even for unmapped products.
     */
    public static function defaultsForProduct(): array
    {
        return [
            'account_type'     => config('vilcom_safetika.defaults.account_type', 'FTTH Home'),
            'service_category' => config('vilcom_safetika.defaults.service_category', 'Internet'),
            'customer_type'    => config('vilcom_safetika.defaults.customer_type', 'Residential'),
        ];
    }
}
