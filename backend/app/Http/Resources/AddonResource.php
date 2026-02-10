<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddonResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'sku' => $this->sku,
            'type' => $this->type,
            'applicable_to' => $this->applicable_to,
            
            // Pricing
            'price_monthly' => $this->price_monthly,
            'price_quarterly' => $this->price_quarterly,
            'price_semi_annually' => $this->price_semi_annually,
            'price_annually' => $this->price_annually,
            'price_one_time' => $this->price_one_time,
            'formatted_price' => $this->formatted_price,
            
            // Quantity & Limits
            'is_recurring' => $this->is_recurring,
            'min_quantity' => $this->min_quantity,
            'max_quantity' => $this->max_quantity,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->isInStock(),
            
            // Bundling
            'can_be_bundled' => $this->can_be_bundled,
            'bundle_discount_percent' => $this->bundle_discount_percent,
            'bundle_rules' => $this->bundle_rules,
            
            // Display
            'icon' => $this->icon,
            'image' => $this->image ? url('storage/' . $this->image) : null,
            'badge' => $this->badge,
            
            // Status
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'requires_approval' => $this->requires_approval,
            'sort_order' => $this->sort_order,
            
            // SEO
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            
            // Pivot data (when loaded through product)
            'pivot' => $this->whenLoaded('pivot', function() {
                return [
                    'custom_price' => $this->pivot->custom_price ?? null,
                    'discount_percent' => $this->pivot->discount_percent ?? null,
                    'is_required' => $this->pivot->is_required ?? false,
                    'is_default' => $this->pivot->is_default ?? false,
                    'sort_order' => $this->pivot->sort_order ?? 0,
                ];
            }),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

