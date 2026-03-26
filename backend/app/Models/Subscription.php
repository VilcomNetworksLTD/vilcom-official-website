<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Subscription extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'subscriptions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'billing_cycle',
        'price',
        'setup_fee',
        'status',
        'start_date',
        'next_billing_date',
        'end_date',
        'cancellation_reason',
        'cancelled_at',
        'cancellation_date',
        'cancelled_by',
        'suspension_reason',
        'suspended_at',
        'suspended_by',
        'activated_at',
        'installation_address',
        'installation_notes',
        'installation_date',
        'installation Technician',
        'auto_renew',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'next_billing_date' => 'datetime',
            'end_date' => 'datetime',
            'cancelled_at' => 'datetime',
            'cancellation_date' => 'datetime',
            'suspended_at' => 'datetime',
            'activated_at' => 'datetime',
            'installation_date' => 'datetime',
            'auto_renew' => 'boolean',
            'price' => 'decimal:2',
            'setup_fee' => 'decimal:2',
        ];
    }



    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the user that owns the subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product associated with the subscription
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the add-ons associated with the subscription
     */
    public function addons(): BelongsToMany
    {
        return $this->belongsToMany(Addon::class, 'subscription_addons')
            ->withPivot('price', 'quantity')
            ->withTimestamps();
    }

    /**
     * Get the invoices for the subscription
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the payments for the subscription
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the user who cancelled the subscription
     */
    public function cancelledByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Get the user who suspended the subscription
     */
    public function suspendedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get only active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get pending subscriptions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get cancelled subscriptions
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope to get suspended subscriptions
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Scope to get expired subscriptions
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Scope to filter by billing cycle
     */
    public function scopeByBillingCycle($query, $billingCycle)
    {
        return $query->where('billing_cycle', $billingCycle);
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ============================================
    // ACCESSORS & HELPERS
    // ============================================

    /**
     * Check if the subscription is active
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the subscription is pending
     */
    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the subscription is cancelled
     */
    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the subscription is suspended
     */
    public function getIsSuspendedAttribute(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if the subscription is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->status === 'expired' ||
            ($this->end_date && $this->end_date->isPast());
    }

    /**
     * Check if subscription is up for renewal (within 7 days)
     */
    public function getIsDueForRenewalAttribute(): bool
    {
        if (!$this->next_billing_date) {
            return false;
        }

        return $this->next_billing_date->diffInDays(now()) <= 7;
    }

    /**
     * Get the number of days until next billing
     */
    public function getDaysUntilNextBillingAttribute(): ?int
    {
        if (!$this->next_billing_date) {
            return null;
        }

        return now()->diffInDays($this->next_billing_date, false);
    }

    /**
     * Get formatted price with currency
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2);
    }

    // ============================================
    // STATUS METHODS
    // ============================================

    /**
     * Activate the subscription
     */
    public function activate(): bool
    {
        return $this->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspension_reason' => null,
            'suspended_by' => null,
            'activated_at' => now(),
        ]);
    }

    /**
     * Suspend the subscription
     */
    public function suspend(string $reason, int $suspendedBy): bool
    {
        return $this->update([
            'status' => 'suspended',
            'suspension_reason' => $reason,
            'suspended_at' => now(),
            'suspended_by' => $suspendedBy,
        ]);
    }

    /**
     * Cancel the subscription
     */
    public function cancel(string $reason = null, bool $immediate = false, int $cancelledBy = null): bool
    {
        $data = [
            'status' => $immediate ? 'cancelled' : 'pending_cancellation',
            'cancellation_reason' => $reason,
            'cancelled_at' => $immediate ? now() : null,
            'cancellation_date' => $immediate ? now() : $this->next_billing_date,
            'cancelled_by' => $cancelledBy,
        ];

        return $this->update($data);
    }

    /**
     * Renew the subscription
     */
    public function renew(): bool
    {
        $nextBillingDate = $this->calculateNextBillingDate($this->billing_cycle);

        return $this->update([
            'next_billing_date' => $nextBillingDate,
            'status' => 'active',
            'cancellation_reason' => null,
            'cancelled_at' => null,
            'cancellation_date' => null,
        ]);
    }

    /**
     * Calculate next billing date based on billing cycle
     */
    private function calculateNextBillingDate(string $billingCycle): \Carbon\Carbon
    {
        switch ($billingCycle) {
            case 'monthly':
                return now()->addMonth();
            case 'quarterly':
                return now()->addMonths(3);
            case 'semi_annually':
                return now()->addMonths(6);
            case 'annually':
                return now()->addYear();
            case 'biennially':
                return now()->addYears(2);
            default:
                return now()->addMonth();
        }
    }
}


