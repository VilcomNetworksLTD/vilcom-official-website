<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'answer',
        'category_id',
        'order',
        'is_active',
        'views',
        'created_by',
    ];

    protected $casts = [
        'order' => 'integer',
        'views' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category that owns the FAQ
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(FaqCategory::class, 'category_id');
    }

    /**
     * Get the user who created this FAQ
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for active FAQs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordering
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Get excerpt of answer
     */
    public function getExcerpt(int $length = 150): string
    {
        if (strlen($this->answer) <= $length) {
            return $this->answer;
        }
        
        return substr($this->answer, 0, $length) . '...';
    }
}

