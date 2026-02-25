<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoverageZonePackage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'coverage_zone_id',
        'package_name',
        'speed_mbps_down',
        'speed_mbps_up',
        'monthly_price',
        'currency',
        'is_available',
        'description',
        'features',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'speed_mbps_down' => 'decimal:2',
            'speed_mbps_up' => 'decimal:2',
            'monthly_price' => 'decimal:2',
            'is_available' => 'boolean',
            'features' => 'array',
        ];
    }

    /**
     * Get the coverage zone that owns the package.
     */
    public function coverageZone()
    {
        return $this->belongsTo(CoverageZone::class);
    }

    /**
     * Check if the package is currently available.
     */
    public function isAvailable(): bool
    {
        return $this->is_available;
    }

    /**
     * Get formatted speed string.
     */
    public function getFormattedSpeedAttribute(): string
    {
        $down = $this->speed_mbps_down ? "{$this->speed_mbps_down} Mbps" : 'N/A';
        $up = $this->speed_mbps_up ? "{$this->speed_mbps_up} Mbps" : 'N/A';
        
        return "{$down} / {$up}";
    }

    /**
     * Get formatted price string.
     */
    public function getFormattedPriceAttribute(): string
    {
        return "{$this->currency} " . number_format($this->monthly_price, 2);
    }
}
