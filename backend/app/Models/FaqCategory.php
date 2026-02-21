<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FaqCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /**
     * Get all FAQs in this category
     */
    public function faqs(): HasMany
    {
        return $this->hasMany(Faq::class, 'category_id');
    }

    /**
     * Scope for ordering
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }

    /**
     * Get active faqs count
     */
    public function getActiveFaqsCountAttribute(): int
    {
        return $this->faqs()->active()->count();
    }
}

