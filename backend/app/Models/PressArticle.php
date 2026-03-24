<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PressArticle extends Model
{
    protected $fillable = [
        'title',
        'excerpt',
        'source_name',
        'source_url',
        'article_url',
        'category',
        'type',
        'thumbnail_url',
        'thumbnail_media_id',
        'is_featured',
        'is_published',
        'published_at',
        'created_by',
    ];

    protected $appends = [
        'thumbnail'
    ];

    protected $casts = [
        'is_featured'  => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────────────────────────

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function thumbnailMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_media_id');
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Resolves the final thumbnail URL:
     * prefers the linked media file, falls back to the free-text URL.
     */
    public function getThumbnailAttribute(): ?string
    {
        return $this->thumbnailMedia?->url ?? $this->thumbnail_url;
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
                     ->where(function ($q) {
                         $q->whereNull('published_at')
                           ->orWhere('published_at', '<=', now());
                     });
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('excerpt', 'like', "%{$term}%")
              ->orWhere('source_name', 'like', "%{$term}%");
        });
    }

public function scopeOfType(Builder $query, string $type): Builder
{
    return $query->where('type', $type);
}

}
