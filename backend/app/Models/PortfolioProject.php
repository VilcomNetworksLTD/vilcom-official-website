<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PortfolioProject extends Model
{
    protected $fillable = [
        'title',
        'category',
        'location',
        'description',
        'media_id',
        'stats_value',
        'stats_label',
        'is_published',
        'sort_order',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order'   => 'integer',
    ];

    // ── Relationships ──────────────────────────────────────────────────────────

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }
}
