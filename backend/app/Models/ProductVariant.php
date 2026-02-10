<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'attributes',
        'price_monthly',
        'price_quarterly',
        'price_semi_annually',
        'price_annually',
        'price_one_time',
        'setup_fee',
        'stock_quantity',
        'capacity_limit',
        'current_capacity',
        'is_active',
        'is_default',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'price_monthly' => 'decimal:2',
            'price_quarterly' => 'decimal:2',
            'price_semi_annually' => 'decimal:2',
            'price_annually' => 'decimal:2',
            'price_one_time' => 'decimal:2',
            'setup_fee' => 'decimal:2',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the parent product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get active variants
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get default variant
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        if ($this->price_monthly) {
            return 'KES ' . number_format($this->price_monthly, 2) . '/month';
        }
        if ($this->price_one_time) {
            return 'KES ' . number_format($this->price_one_time, 2);
        }
        return null;
    }

    /**
     * Get display name with attributes
     */
    public function getDisplayNameAttribute()
    {
        if ($this->name) {
            return $this->name;
        }
        
        $attributes = $this->attributes ?? [];
        $parts = [];
        
        foreach ($attributes as $key => $value) {
            $parts[] = ucfirst($key) . ': ' . ucfirst($value);
        }
        
        return implode(', ', $parts) ?: 'Variant #' . $this->id;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if variant is in stock
     */
    public function isInStock()
    {
        if (!$this->stock_quantity) {
            return true; // Unlimited stock
        }
        return $this->stock_quantity > 0;
    }

    /**
     * Check if variant has available capacity
     */
    public function hasAvailableCapacity()
    {
        if (!$this->capacity_limit) {
            return true;
        }
        return $this->current_capacity < $this->capacity_limit;
    }

    /**
     * Get price for specific billing cycle
     */
    public function getPriceForCycle($cycle)
    {
        $priceField = "price_{$cycle}";
        return $this->$priceField ?? $this->price_monthly ?? $this->price_one_time;
    }

    /**
     * Get total setup fee
     */
    public function getTotalSetupFeeAttribute()
    {
        return $this->setup_fee ?? 0;
    }

    /**
     * Check if this is the default variant
     */
    public function isDefault()
    {
        return $this->is_default;
    }

    /**
     * Get attribute value
     */
    public function getAttributeValue($key)
    {
        $attributes = $this->attributes ?? [];
        return $attributes[$key] ?? null;
    }

    /**
     * Decrease stock
     */
    public function decreaseStock($quantity = 1)
    {
        if ($this->stock_quantity) {
            $this->decrement('stock_quantity', $quantity);
        }
    }

    /**
     * Increase stock
     */
    public function increaseStock($quantity = 1)
    {
        if ($this->stock_quantity !== null) {
            $this->increment('stock_quantity', $quantity);
        }
    }

    /**
     * Increase capacity usage
     */
    public function increaseCapacity($amount = 1)
    {
        if ($this->capacity_limit) {
            $this->increment('current_capacity', $amount);
        }
    }

    /**
     * Decrease capacity usage
     */
    public function decreaseCapacity($amount = 1)
    {
        if ($this->capacity_limit) {
            $this->decrement('current_capacity', $amount);
        }
    }
}

