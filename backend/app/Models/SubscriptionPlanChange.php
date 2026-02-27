<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPlanChange extends Model
{
    protected $table = 'subscription_plan_changes';

    protected $fillable = [
        'subscription_id', 'changed_by',
        'from_product_id', 'from_variant_id', 'from_price', 'from_billing_cycle',
        'to_product_id', 'to_variant_id', 'to_price', 'to_billing_cycle',
        'change_type', 'apply_timing',
        'proration_credit', 'proration_charge', 'net_proration',
        'days_remaining', 'days_in_cycle',
        'effective_date', 'notes', 'metadata',
    ];

    protected $casts = [
        'from_price'       => 'decimal:2',
        'to_price'         => 'decimal:2',
        'proration_credit' => 'decimal:2',
        'proration_charge' => 'decimal:2',
        'net_proration'    => 'decimal:2',
        'effective_date'   => 'date',
        'metadata'         => 'array',
    ];

    public function subscription(): BelongsTo 
    { 
        return $this->belongsTo(Subscription::class); 
    }
    
    public function changedBy(): BelongsTo    
    { 
        return $this->belongsTo(User::class, 'changed_by'); 
    }
    
    public function fromProduct(): BelongsTo  
    { 
        return $this->belongsTo(Product::class, 'from_product_id'); 
    }
    
    public function toProduct(): BelongsTo    
    { 
        return $this->belongsTo(Product::class, 'to_product_id'); 
    }
    
    public function fromVariant(): BelongsTo  
    { 
        return $this->belongsTo(ProductVariant::class, 'from_variant_id'); 
    }
    
    public function toVariant(): BelongsTo    
    { 
        return $this->belongsTo(ProductVariant::class, 'to_variant_id'); 
    }

    /**
     * Human-readable summary for timeline / notifications.
     */
    public function summary(): string
    {
        $from = $this->fromProduct?->name ?? 'N/A';
        $to   = $this->toProduct?->name   ?? 'N/A';
        $verb = match ($this->change_type) {
            'upgrade'      => 'Upgraded',
            'downgrade'    => 'Downgraded',
            'cycle_change' => 'Changed billing cycle',
            'addon_change' => 'Updated add-ons',
            default        => 'Changed plan',
        };
        return "{$verb}: {$from} → {$to}";
    }
}
