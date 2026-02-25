<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoverageInterestSignup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'area_description',
        'lat',
        'lng',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:8',
            'lng' => 'decimal:8',
        ];
    }

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pending';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_COVERED = 'covered';
    const STATUS_NOT_VIABLE = 'not_viable';

    /**
     * Get all available statuses.
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_CONTACTED,
            self::STATUS_COVERED,
            self::STATUS_NOT_VIABLE,
        ];
    }

    /**
     * Check if the signup is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Get the user who registered this interest (if any).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark as contacted.
     */
    public function markAsContacted(): void
    {
        $this->update(['status' => self::STATUS_CONTACTED]);
    }

    /**
     * Mark as covered.
     */
    public function markAsCovered(): void
    {
        $this->update(['status' => self::STATUS_COVERED]);
    }

    /**
     * Mark as not viable.
     */
    public function markAsNotViable(): void
    {
        $this->update(['status' => self::STATUS_NOT_VIABLE]);
    }
}
