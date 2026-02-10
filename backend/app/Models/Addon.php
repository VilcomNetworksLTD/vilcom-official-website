<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Addon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'type',
        'applicable_to',
        'price_monthly',
        'price_quarterly',
        'price_semi_annually',
        'price_annually',
        'price_one_time',
        'is_recurring',
        'min_quantity',
        'max_quantity',
        'stock_quantity',
        'bundle_rules',
        'can_be_bundled',
        'bundle_discount_percent',
        'icon',
        'image',
        'badge',
        'is_active',
        'is_featured',
        'requires_approval',
        'sort_order',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'applicable_to' => 'array',
            'bundle_rules' => 'array',
            'price_monthly' => 'decimal:2',
            'price_quarterly' => 'decimal:2',
            'price_semi_annually' => 'decimal:2',
            'price_annually' => 'decimal:2',
            'price_one_time' => 'decimal:2',
            'bundle_discount_percent' => 'decimal:2',
            'is_recurring' => 'boolean',
            'can_be_bundled' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'requires_approval' => 'boolean',
        ];
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get products that have this addon
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_addon')
            ->withPivot('custom_price', 'discount_percent', 'is_required', 'is_default', 'sort_order')
            ->withTimestamps();
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get active addons
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get featured addons
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to filter by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to filter by applicable product type
     */
    public function scopeApplicableTo($query, $productType)
    {
        return $query->whereJsonContains('applicable_to', $productType);
    }

    /**
     * Scope to get recurring addons
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope to get one-time addons
     */
    public function scopeOneTime($query)
    {
        return $query->where('is_recurring', false);
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    /**
     * Get addon URL
     */
    public function getUrlAttribute()
    {
        return route('addons.show', $this->slug);
    }

    /**
     * Get image URL
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }

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

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if addon is in stock
     */
    public function isInStock()
    {
        if (!$this->stock_quantity) {
            return true; // Unlimited stock
        }
        return $this->stock_quantity > 0;
    }

    /**
     * Check if addon can be applied to product type
     */
    public function canApplyTo($productType)
    {
        if (!$this->applicable_to) {
            return true; // Applies to all
        }
        return in_array($productType, $this->applicable_to);
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
     * Calculate price with quantity
     */
    public function calculateTotalPrice($quantity = 1, $billingCycle = 'monthly')
    {
        $unitPrice = $this->getPriceForCycle($billingCycle);
        return $unitPrice * $quantity;
    }

    /**
     * Get bundle discount price
     */
    public function getBundlePrice($originalPrice)
    {
        if ($this->can_be_bundled && $this->bundle_discount_percent) {
            return $originalPrice * (1 - ($this->bundle_discount_percent / 100));
        }
        return $originalPrice;
    }
}

