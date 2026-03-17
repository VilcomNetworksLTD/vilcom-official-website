<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AddressCheckLog extends Model
{
use HasFactory;

    protected $fillable = [
        'query_input',
        'matched_zone',
        'is_covered',
        'query_lat',
        'query_lng',
        'ip_address',
        'user_id',
        'session_id',
        'raw_result',
    ];

    protected function casts(): array
    {
        return [
            'is_covered' => 'boolean',
            'query_lat' => 'decimal:8',
            'query_lng' => 'decimal:8',
            'raw_result' => 'array',
        ];
    }

    /**
     * Get the user who made this check (if authenticated).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get covered checks.
     */
    public function scopeCovered($query)
    {
        return $query->where('is_covered', true);
    }

    /**
     * Scope to get uncovered checks.
     */
    public function scopeUncovered($query)
    {
        return $query->where('is_covered', false);
    }

    /**
     * Scope to get checks by date range.
     */
    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }

    /**
     * Get the matched zone as a model (if stored).
     */
    public function getMatchedZoneModel()
    {
        if ($this->matched_zone) {
            return CoverageZone::where('name', $this->matched_zone)->first();
        }
        return null;
    }
}
