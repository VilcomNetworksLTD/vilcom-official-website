<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'image',
        'position',
        'start_date',
        'end_date',
        'target_logged_in',
        'target_guests',
        'target_roles',
        'cta_text',
        'cta_url',
        'order',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'target_logged_in' => 'boolean',
        'target_guests' => 'boolean',
        'target_roles' => 'array',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this banner
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if banner is currently active based on dates
     */
    public function isCurrentlyActive(): bool
    {
        $now = now();
        
        if (!$this->is_active) {
            return false;
        }

        if ($this->start_date && $this->end_date) {
            return $now->between($this->start_date, $this->end_date);
        }

        if ($this->start_date) {
            return $now->greaterThanOrEqualTo($this->start_date);
        }

        if ($this->end_date) {
            return $now->lessThanOrEqualTo($this->end_date);
        }

        return true;
    }

    /**
     * Scope for active banners
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Scope for currently scheduled banners
     */
    public function scopeCurrentlyActive($query)
    {
        $now = now();
        
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $now);
            });
    }
}

