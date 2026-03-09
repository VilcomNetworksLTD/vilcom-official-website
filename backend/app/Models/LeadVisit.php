<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'vlc_vid',
        'url',
        'page_title',
        'time_on_page',
        'scroll_depth',
        'referrer',
        'utm_params',
        'device_type',
        'browser',
        'operating_system',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'utm_params' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the lead associated with this visit
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}

