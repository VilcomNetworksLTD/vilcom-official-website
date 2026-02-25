<?php

// app/Models/CoverageZone.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoverageZone extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'type', 'parent_id', 'geojson',
        'center_lat', 'center_lng', 'radius_km',
        'status', 'is_serviceable', 'notes',
    ];

    protected $casts = [
        'geojson' => 'array',
        'is_serviceable' => 'boolean',
        'center_lat' => 'decimal:8',
        'center_lng' => 'decimal:8',
    ];

    public function parent()
    {
        return $this->belongsTo(CoverageZone::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(CoverageZone::class, 'parent_id');
    }

    public function packages()
    {
        return $this->hasMany(CoverageZonePackage::class);
    }

    // Check if a lat/lng point falls within this zone's radius
    public function containsPoint(float $lat, float $lng): bool
    {
        if (!$this->center_lat || !$this->center_lng || !$this->radius_km) {
            return false;
        }

        $distance = $this->haversineDistance(
            $this->center_lat, $this->center_lng, $lat, $lng
        );

        return $distance <= $this->radius_km;
    }

    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

public function products()
{
    return $this->belongsToMany(Product::class, 'product_coverage_zones')
                ->withPivot([
                    'price_monthly', 'price_quarterly', 'price_semi_annually',
                    'price_annually', 'price_one_time', 'setup_fee',
                    'promotional_price', 'promotional_start', 'promotional_end',
                    'is_available', 'capacity_limit', 'current_capacity',
                    'speed_mbps', 'connection_type', 'notes',
                ])
                ->wherePivot('is_available', true)
                ->withTimestamps();
}


}