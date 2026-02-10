<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
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
            'product_id' => $this->product_id,
            'name' => $this->name,
            'sku' => $this->sku,
            'attributes' => $this->attributes,
            
            // Pricing
            'price_monthly' => $this->price_monthly,
            'price_quarterly' => $this->price_quarterly,
            'price_semi_annually' => $this->price_semi_annually,
            'price_annually' => $this->price_annually,
            'price_one_time' => $this->price_one_time,
            'setup_fee' => $this->setup_fee,
            'formatted_price' => $this->formatted_price,
            
            // Stock/Capacity
            'stock_quantity' => $this->stock_quantity,
            'capacity_limit' => $this->capacity_limit,
            'current_capacity' => $this->current_capacity,
            'in_stock' => $this->isInStock(),
            'has_capacity' => $this->hasAvailableCapacity(),
            
            // Status
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
            'sort_order' => $this->sort_order,
            
            // Display
            'display_name' => $this->display_name,
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

