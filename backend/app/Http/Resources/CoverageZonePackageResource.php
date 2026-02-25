<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoverageZonePackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'coverage_zone_id' => $this->coverage_zone_id,
            'package_name' => $this->package_name,
            'speed_mbps_down' => $this->speed_mbps_down,
            'speed_mbps_up' => $this->speed_mbps_up,
            'monthly_price' => $this->monthly_price,
            'currency' => $this->currency,
            'is_available' => $this->is_available,
            'description' => $this->description,
            'features' => $this->features,
            'sort_order' => $this->sort_order,
            
            // Computed attributes
            'formatted_speed' => $this->formatted_speed,
            'formatted_price' => $this->formatted_price,
            
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
