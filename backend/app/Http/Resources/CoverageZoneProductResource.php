<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoverageZoneProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->product;
        
        // Check if promotional pricing is active
        $isPromo = $this->pivot->promotional_price
            && $this->pivot->promotional_start
            && $this->pivot->promotional_end
            && now()->between($this->pivot->promotional_start, $this->pivot->promotional_end);

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'type' => $product->type,
            'category' => $product->category?->name,
            'short_description' => $product->short_description,
            'features' => $product->features,
            'badge' => $product->badge,
            'is_featured' => $product->is_featured,

            // Zone-specific or fallback pricing
            'pricing' => [
                'monthly' => $this->pivot->price_monthly ?? $product->price_monthly,
                'quarterly' => $this->pivot->price_quarterly ?? $product->price_quarterly,
                'semi_annually' => $this->pivot->price_semi_annually ?? $product->price_semi_annually,
                'annually' => $this->pivot->price_annually ?? $product->price_annually,
                'one_time' => $this->pivot->price_one_time ?? $product->price_one_time,
                'setup_fee' => $this->pivot->setup_fee ?? $product->setup_fee,
            ],

            'promo' => $isPromo ? [
                'price' => $this->pivot->promotional_price,
                'ends_at' => $this->pivot->promotional_end,
            ] : null,

            // Zone-specific or fallback specs
            'speed_mbps' => $this->pivot->speed_mbps ?? $product->speed_mbps,
            'connection_type' => $this->pivot->connection_type ?? $product->connection_type,

            // Availability & capacity
            'is_available' => $this->pivot->is_available ?? true,
            'capacity' => [
                'limit' => $this->pivot->capacity_limit,
                'current' => $this->pivot->current_capacity,
                'has_capacity' => !$this->pivot->capacity_limit 
                    || $this->pivot->current_capacity < $this->pivot->capacity_limit,
            ],

            // Notes
            'notes' => $this->pivot->notes,
            
            'created_at' => $this->pivot->created_at?->toIso8601String(),
            'updated_at' => $this->pivot->updated_at?->toIso8601String(),
        ];
    }
}
