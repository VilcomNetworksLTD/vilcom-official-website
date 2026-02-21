<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company',
        'avatar',
        'content',
        'rating',
        'is_approved',
        'is_featured',
        'created_by',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
        'rating' => 'integer',
    ];

    /**
     * Get the user who created this testimonial
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for approved testimonials
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope for featured testimonials
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for pending approval
     */
    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    /**
     * Approve the testimonial
     */
    public function approve(): void
    {
        $this->update(['is_approved' => true]);
    }

    /**
     * Reject the testimonial
     */
    public function reject(): void
    {
        $this->update(['is_approved' => false]);
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured(): void
    {
        $this->update(['is_featured' => !$this->is_featured]);
    }

    /**
     * Get star rating as array
     */
    public function getStarRating(): array
    {
        return [
            'filled' => $this->rating,
            'empty' => 5 - $this->rating,
        ];
    }
}

