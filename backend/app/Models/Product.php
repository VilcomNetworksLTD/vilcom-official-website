<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'type',

        // Internet Plan
        'speed_mbps',
        'connection_type',
        'plan_category',

        // Hosting
        'storage_gb',
        'bandwidth_gb',
        'email_accounts',
        'databases',
        'domains_allowed',
        'ssl_included',
        'backup_included',

        // Web Development
        'pages_included',
        'revisions_included',
        'delivery_days',

        // Bulk SMS
        'sms_credits',
        'cost_per_sms',

        // Pricing
        'price_monthly',
        'price_quarterly',
        'price_semi_annually',
        'price_annually',
        'price_one_time',
        'setup_fee',

        // Promotional
        'promotional_price',
        'promotional_start',
        'promotional_end',

        // Features
        'features',
        'technical_specs',

        // Availability
        'coverage_areas',
        'available_nationwide',

        // Stock/Capacity
        'stock_quantity',
        'capacity_limit',
        'current_capacity',
        'track_capacity',

        // Display
        'image',
        'gallery',
        'icon',
        'badge',

        // Status
        'is_active',
        'is_featured',
        'is_quote_based',
        'requires_approval',
        'sort_order',

        // Requirements
        'requirements',
        'terms_conditions',

        // SEO
        'meta_title',
        'meta_description',
        'meta_keywords',
        'emerald_service_type_id',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'technical_specs' => 'array',
            'coverage_areas' => 'array',
            'gallery' => 'array',
            'price_monthly' => 'decimal:2',
            'price_quarterly' => 'decimal:2',
            'price_semi_annually' => 'decimal:2',
            'price_annually' => 'decimal:2',
            'price_one_time' => 'decimal:2',
            'setup_fee' => 'decimal:2',
            'promotional_price' => 'decimal:2',
            'promotional_start' => 'datetime',
            'promotional_end' => 'datetime',
            'cost_per_sms' => 'decimal:4',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_quote_based' => 'boolean',
            'requires_approval' => 'boolean',
            'ssl_included' => 'boolean',
            'backup_included' => 'boolean',
            'available_nationwide' => 'boolean',
            'track_capacity' => 'boolean',
        ];
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get product variants
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Get active variants
     */
    public function activeVariants()
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    /**
     * Get subscriptions using this product
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get active subscriptions
     */
    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)->where('status', 'active');
    }

    public function emeraldMapping()
{
    return $this->hasOne(\App\Models\EmeraldProductMapping::class);
}

    /**
     * Get available addons for this product
     */
    public function addons()
    {
        return $this->belongsToMany(Addon::class, 'product_addon')
            ->withPivot('custom_price', 'discount_percent', 'is_required', 'is_default', 'sort_order')
            ->withTimestamps();
    }

    /**
     * Get required addons
     */
    public function requiredAddons()
    {
        return $this->addons()->wherePivot('is_required', true);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get featured products
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
     * Scope to filter internet plans
     */
    public function scopeInternetPlans($query)
    {
        return $query->where('type', 'internet_plan');
    }

    /**
     * Scope to filter hosting packages
     */
    public function scopeHostingPackages($query)
    {
        return $query->where('type', 'hosting_package');
    }

    /**
     * Scope to filter by category
     */
    public function scopeInCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope to filter by plan category (home/business)
     */
    public function scopePlanCategory($query, $category)
    {
        return $query->where('plan_category', $category);
    }

    /**
     * Scope to filter by speed
     */
    public function scopeBySpeed($query, $speed)
    {
        return $query->where('speed_mbps', $speed);
    }

    /**
     * Scope to get promotional products
     */
    public function scopeOnPromotion($query)
    {
        return $query->whereNotNull('promotional_price')
            ->where('promotional_start', '<=', now())
            ->where('promotional_end', '>=', now());
    }

    /**
     * Scope to filter by coverage area
     */
    public function scopeAvailableIn($query, $area)
    {
        return $query->where(function($q) use ($area) {
            $q->where('available_nationwide', true)
              ->orWhereJsonContains('coverage_areas', $area);
        });
    }

    /**
     * Scope to get in-stock products
     */
    public function scopeInStock($query)
    {
        return $query->where(function($q) {
            $q->whereNull('stock_quantity')
              ->orWhere('stock_quantity', '>', 0);
        });
    }

    /**
     * Scope to get products with available capacity
     */
    public function scopeHasCapacity($query)
    {
        return $query->where(function($q) {
            $q->where('track_capacity', false)
              ->orWhereRaw('current_capacity < capacity_limit');
        });
    }

    /**
     * Scope to get quote-based products
     */
    public function scopeQuoteBased($query)
    {
        return $query->where('is_quote_based', true);
    }

    /**
     * Scope to get non-quote-based products
     */
    public function scopeNotQuoteBased($query)
    {
        return $query->where('is_quote_based', false);
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    /**
     * Get current price (considers promotional pricing)
     */
    public function getCurrentPriceAttribute()
    {
        if ($this->isOnPromotion()) {
            return $this->promotional_price;
        }
        return $this->price_monthly;
    }

    /**
     * Get savings amount if on promotion
     */
    public function getSavingsAttribute()
    {
        if ($this->isOnPromotion() && $this->price_monthly) {
            return $this->price_monthly - $this->promotional_price;
        }
        return 0;
    }

    /**
     * Get savings percentage
     */
    public function getSavingsPercentAttribute()
    {
        if ($this->savings > 0 && $this->price_monthly > 0) {
            return round(($this->savings / $this->price_monthly) * 100, 2);
        }
        return 0;
    }

    /**
     * Get product URL
     */
    public function getUrlAttribute()
    {
        return route('products.show', $this->slug);
    }

    /**
     * Get image URL
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return 'https://via.placeholder.com/400x300?text=' . urlencode($this->name);
    }

    /**
     * Get display name with speed for internet plans
     */
    public function getDisplayNameAttribute()
    {
        if ($this->type === 'internet_plan' && $this->speed_mbps) {
            return "{$this->speed_mbps} Mbps - {$this->name}";
        }
        return $this->name;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if product is on promotion
     */
    public function isOnPromotion()
    {
        return $this->promotional_price
            && $this->promotional_start <= now()
            && $this->promotional_end >= now();
    }

    /**
     * Check if product is in stock
     */
    public function isInStock()
    {
        if (!$this->stock_quantity) {
            return true; // Unlimited stock
        }
        return $this->stock_quantity > 0;
    }

    /**
     * Check if product has available capacity
     */
    public function hasAvailableCapacity()
    {
        if (!$this->track_capacity) {
            return true;
        }
        return $this->current_capacity < $this->capacity_limit;
    }

    /**
     * Check if product is available in area
     */
    public function isAvailableIn($area)
    {
        if ($this->available_nationwide) {
            return true;
        }

        $coverageAreas = $this->coverage_areas ?? [];
        return in_array($area, $coverageAreas);
    }

    /**
     * Check if product requires a quote (quote-based pricing)
     */
    public function isQuoteBased(): bool
    {
        return (bool) $this->is_quote_based;
    }

    /**
     * Get comprehensive price display information for frontend
     * This helps the frontend know how to display pricing for each product
     */
    public function getPriceDisplayInfo(): array
    {
        $isQuoteBased = $this->isQuoteBased();

        // Determine the primary price to display
        $primaryPrice = null;
        $primaryLabel = '';

        if (!$isQuoteBased) {
            // Has fixed pricing - determine best price to show
            if ($this->price_annually) {
                $primaryPrice = $this->price_annually / 12; // Show monthly equivalent
                $primaryLabel = '/month (billed annually)';
            } elseif ($this->price_monthly) {
                $primaryPrice = $this->price_monthly;
                $primaryLabel = '/month';
            } elseif ($this->price_one_time) {
                $primaryPrice = $this->price_one_time;
                $primaryLabel = ' (one-time)';
            }
        }

        return [
            'is_quote_based' => $isQuoteBased,
            'has_fixed_price' => !$isQuoteBased,
            'show_get_quote' => $isQuoteBased,
            'show_buy_now' => !$isQuoteBased && $primaryPrice !== null,
            'primary_price' => $primaryPrice,
            'primary_label' => $primaryLabel,
            'price_monthly' => $this->price_monthly,
            'price_quarterly' => $this->price_quarterly,
            'price_semi_annually' => $this->price_semi_annually,
            'price_annually' => $this->price_annually,
            'price_one_time' => $this->price_one_time,
            'setup_fee' => $this->setup_fee,
            'formatted_pricing' => $this->getAvailablePricingOptions(),
            'price_type' => $this->getPriceType(),
        ];
    }

    /**
     * Get the price type for this product
     */
    public function getPriceType(): string
    {
        if ($this->isQuoteBased()) {
            return 'quote';
        }

        if ($this->price_one_time && !$this->price_monthly && !$this->price_annually) {
            return 'one_time';
        }

        if ($this->price_annually) {
            return 'recurring_annual';
        }

        if ($this->price_monthly) {
            return 'recurring_monthly';
        }

        return 'none';
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
        if ($this->track_capacity) {
            $this->increment('current_capacity', $amount);
        }
    }

    /**
     * Decrease capacity usage
     */
    public function decreaseCapacity($amount = 1)
    {
        if ($this->track_capacity) {
            $this->decrement('current_capacity', $amount);
        }
    }

    /**
     * Get pricing for specific billing cycle
     */
    public function getPricingForCycle($cycle)
    {
        $priceField = "price_{$cycle}";
        return $this->$priceField ?? $this->price_monthly;
    }

    /**
     * Get all available pricing options
     */
    public function getAvailablePricingOptions()
    {
        $options = [];

        if ($this->price_monthly) {
            $options['monthly'] = [
                'price' => $this->price_monthly,
                'label' => 'Monthly',
                'per_month' => $this->price_monthly,
            ];
        }

        if ($this->price_quarterly) {
            $options['quarterly'] = [
                'price' => $this->price_quarterly,
                'label' => 'Quarterly (3 months)',
                'per_month' => round($this->price_quarterly / 3, 2),
            ];
        }

        if ($this->price_semi_annually) {
            $options['semi_annually'] = [
                'price' => $this->price_semi_annually,
                'label' => 'Semi-Annually (6 months)',
                'per_month' => round($this->price_semi_annually / 6, 2),
            ];
        }

        if ($this->price_annually) {
            $options['annually'] = [
                'price' => $this->price_annually,
                'label' => 'Annually (12 months)',
                'per_month' => round($this->price_annually / 12, 2),
            ];
        }

        return $options;
    }

    /**
     * Get product specifications as formatted array
     */
    public function getFormattedSpecs()
    {
        $specs = [];

        switch ($this->type) {
            case 'internet_plan':
                if ($this->speed_mbps) $specs['Speed'] = "{$this->speed_mbps} Mbps";
                if ($this->connection_type) $specs['Connection'] = ucfirst($this->connection_type);
                if ($this->plan_category) $specs['Category'] = ucfirst($this->plan_category);
                break;

            case 'hosting_package':
                if ($this->storage_gb) $specs['Storage'] = "{$this->storage_gb} GB";
                if ($this->bandwidth_gb) $specs['Bandwidth'] = "{$this->bandwidth_gb} GB/month";
                if ($this->email_accounts) $specs['Email Accounts'] = $this->email_accounts;
                if ($this->databases) $specs['Databases'] = $this->databases;
                if ($this->domains_allowed) $specs['Domains'] = $this->domains_allowed;
                if ($this->ssl_included) $specs['SSL Certificate'] = 'Included';
                if ($this->backup_included) $specs['Backup'] = 'Included';
                break;

            case 'web_development':
                if ($this->pages_included) $specs['Pages'] = $this->pages_included;
                if ($this->revisions_included) $specs['Revisions'] = $this->revisions_included;
                if ($this->delivery_days) $specs['Delivery'] = "{$this->delivery_days} days";
                break;

            case 'bulk_sms':
                if ($this->sms_credits) $specs['SMS Credits'] = number_format($this->sms_credits);
                if ($this->cost_per_sms) $specs['Cost per SMS'] = "KES {$this->cost_per_sms}";
                break;
        }

        // Add custom technical specs
        if ($this->technical_specs) {
            $specs = array_merge($specs, $this->technical_specs);
        }

        return $specs;
    }


public function coverageZones()
{
    return $this->belongsToMany(CoverageZone::class, 'product_coverage_zones')
                ->withPivot([
                    'price_monthly', 'price_quarterly', 'price_semi_annually',
                    'price_annually', 'price_one_time', 'setup_fee',
                    'promotional_price', 'promotional_start', 'promotional_end',
                    'is_available', 'capacity_limit', 'current_capacity',
                    'speed_mbps', 'connection_type', 'notes',
                ])
                ->withTimestamps();
}

// Get effective price for a zone (falls back to product default)
public function getPriceForZone(CoverageZone $zone, string $billing = 'monthly'): ?float
{
    $pivot = $this->coverageZones->find($zone->id)?->pivot;
    $field = "price_{$billing}";
    return $pivot?->$field ?? $this->$field;
}

// Check if product is available in a zone
public function isAvailableInZone(CoverageZone $zone): bool
{
    if ($this->available_nationwide) return true;

    $pivot = $this->coverageZones->find($zone->id)?->pivot;
    return $pivot?->is_available ?? false;
}

}
