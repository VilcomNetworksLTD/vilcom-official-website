<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
        'url',
        'alt_text',
        'caption',
        'folder',
        'usage_count',
        'created_by',
    ];

    protected $casts = [
        'size' => 'integer',
        'usage_count' => 'integer',
    ];

    /**
     * Get the user who uploaded this file
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all models that use this media
     */
    public function usages()
    {
        return $this->morphTo();
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Decrement usage count
     */
    public function decrementUsage(): void
    {
        if ($this->usage_count > 0) {
            $this->decrement('usage_count');
        }
    }

    /**
     * Scope for filtering by folder
     */
    public function scopeInFolder($query, $folder)
    {
        return $query->where('folder', $folder);
    }

    /**
     * Scope for searching
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('original_name', 'like', "%{$search}%")
              ->orWhere('alt_text', 'like', "%{$search}%")
              ->orWhere('caption', 'like', "%{$search}%");
        });
    }
}

