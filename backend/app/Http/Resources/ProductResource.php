<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'sku' => $this->sku,
            'type' => $this->type,
            
            // Internet Plan
            'speed_mbps' => $this->speed_mbps,
            'connection_type' => $this->connection_type,
            'plan_category' => $this->plan_category,
            
            // Hosting
            'storage_gb' => $this->storage_gb,
            'bandwidth_gb' => $this->bandwidth_gb,
            'email_accounts' => $this->email_accounts,
            'databases' => $this->databases,
            'domains_allowed' => $this->domains_allowed,
            'ssl_included' => $this->ssl_included,
            'backup_included' => $this->backup_included,
            
            // Web Development
            'pages_included' => $this->pages_included,
            'revisions_included' => $this->revisions_included,
            'delivery_days' => $this->delivery_days,
            
            // Bulk SMS
            'sms_credits' => $this->sms_credits,
            'cost_per_sms' => $this->cost_per_sms,
            
            // Pricing
            'price_monthly' => $this->price_monthly,
            'price_quarterly' => $this->price_quarterly,
            'price_semi_annually' => $this->price_semi_annually,
            'price_annually' => $this->price_annually,
            'price_one_time' => $this->price_one_time,
            'setup_fee' => $this->setup_fee,
            
            // Current pricing
            'current_price' => $this->current_price,
            'is_on_promotion' => $this->isOnPromotion(),
            'savings' => $this->savings,
            'savings_percent' => $this->savings_percent,
            
            // Promotional pricing
            'promotional_price' => $this->promotional_price,
            'promotional_start' => $this->promotional_start,
            'promotional_end' => $this->promotional_end,
            
            // Features
            'features' => $this->features,
            'technical_specs' => $this->technical_specs,
            
            // Availability
            'coverage_areas' => $this->coverage_areas,
            'available_nationwide' => $this->available_nationwide,
            
            // Stock/Capacity
            'stock_quantity' => $this->stock_quantity,
            'capacity_limit' => $this->capacity_limit,
            'current_capacity' => $this->current_capacity,
            'track_capacity' => $this->track_capacity,
            'in_stock' => $this->isInStock(),
            'has_capacity' => $this->hasAvailableCapacity(),
            
            // Display
            'image' => $this->image ? url('storage/' . $this->image) : null,
            'gallery' => $this->gallery ? array_map(fn($img) => url('storage/' . $img), $this->gallery) : [],
            'icon' => $this->icon,
            'badge' => $this->badge,
            
            // Status
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'requires_approval' => $this->requires_approval,
            'sort_order' => $this->sort_order,
            
            // Requirements
            'requirements' => $this->requirements,
            'terms_conditions' => $this->terms_conditions,
            
            // SEO
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
            
            // Calculated
            'display_name' => $this->display_name,
            'formatted_specs' => $this->getFormattedSpecs(),
            'pricing_options' => $this->getAvailablePricingOptions(),
            
            // Relationships
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'addons' => AddonResource::collection($this->whenLoaded('addons')),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

