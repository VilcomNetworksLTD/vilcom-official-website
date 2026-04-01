<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'subscriptions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Ownership
        'user_id',
        'subscription_number',

        // Product
        'product_id',
        'product_variant_id',
        'coverage_zone_id',

        // Billing
        'billing_cycle',
        'base_price',
        'addons_total',
        'discount_amount',
        'setup_fee',
        'total_amount',
        'currency',

        // Proration
        'proration_credit',
        'proration_charge',
        'proration_date',

        // Status
        'status',

        // Dates
        'trial_ends_at',
        'started_at',
        'current_period_start',
        'current_period_end',
        'next_renewal_at',
        'cancelled_at',
        'suspended_at',
        'expires_at',

        // Cancellation
        'cancel_reason',
        'cancel_notes',
        'cancel_at_period_end',

        // Suspension
        'suspension_reason',
        'grace_period_days',
        'grace_period_ends_at',

        // Plan Change Queue
        'pending_product_id',
        'pending_variant_id',
        'pending_change_type',
        'pending_change_date',

        // Renewal
        'auto_renew',
        'renewal_reminder_days',
        'last_reminder_sent_at',

        // Trial
        'is_trial',
        'trial_days',

        // Staff
        'created_by',
        'managed_by',
        'cancelled_by',
        'suspended_by',

        // Installation
        'installation_address',
        'installation_notes',
        'installation_date',
        'installation_technician',

        'internal_notes',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Dates
            'trial_ends_at' => 'datetime',
            'started_at' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'next_renewal_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'suspended_at' => 'datetime',
            'expires_at' => 'datetime',
            'installation_date' => 'datetime',
            'proration_date' => 'datetime',
            'last_reminder_sent_at' => 'datetime',

            // Booleans
            'auto_renew' => 'boolean',
            'cancel_at_period_end' => 'boolean',
            'is_trial' => 'boolean',

            // Decimals
            'base_price' => 'decimal:2',
            'addons_total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'setup_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'proration_credit' => 'decimal:2',
            'proration_charge' => 'decimal:2',

            // JSON
            'metadata' => 'array',
        ];
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function coverageZone(): BelongsTo
    {
        return $this->belongsTo(CoverageZone::class);
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

    // Staff/Audit Relationships
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function suspendedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function managedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'managed_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeByBillingCycle($query, $billingCycle)
    {
        return $query->where('billing_cycle', $billingCycle);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for subscriptions due for renewal within specified days
     */
    public function scopeDueForRenewal($query, $days = 7)
    {
        return $query->active()
            ->whereNotNull('current_period_end')
            ->where('current_period_end', '<=', now()->addDays($days));
    }

    /**
     * Scope for subscriptions in grace period (active but overdue)
     */
    public function scopeInGracePeriod($query)
    {
        return $query->active()
            ->whereNotNull('current_period_end')
            ->where('current_period_end', '<', now());
    }

    // ============================================
    // ACCESSORS & HELPERS
    // ============================================

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getIsSuspendedAttribute(): bool
    {
        return $this->status === 'suspended';
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->status === 'expired' ||
            ($this->expires_at && $this->expires_at->isPast());
    }

    /**
     * Check if subscription is up for renewal (within 7 days)
     */
    public function getIsDueForRenewalAttribute(): bool
    {
        if (!$this->current_period_end) {
            return false;
        }
        return $this->current_period_end->diffInDays(now()) <= 7;
    }

    /**
     * Get the number of days until next billing
     */
    public function getDaysUntilNextBillingAttribute(): ?int
    {
        if (!$this->current_period_end) {
            return null;
        }
        return now()->diffInDays($this->current_period_end, false);
    }

    /**
     * Helper to get the formatted total
     */
    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total_amount, 2);
    }

    // ============================================
    // STATUS METHODS
    // ============================================

    public function activate(): bool
    {
        return $this->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspension_reason' => null,
            'suspended_by' => null,
            'started_at' => now(),
            'current_period_start' => now(),
            'current_period_end' => $this->calculateNextBillingDate(),
        ]);
    }

    public function suspend(string $reason, int $suspendedBy): bool
    {
        return $this->update([
            'status' => 'suspended',
            'suspension_reason' => $reason,
            'suspended_at' => now(),
            'suspended_by' => $suspendedBy,
        ]);
    }

    public function cancel(string $reason = null, bool $immediate = false, int $cancelledBy = null): bool
    {
        $data = [
            'status' => $immediate ? 'cancelled' : 'pending_cancellation',
            'cancel_reason' => $reason,
            'cancelled_at' => $immediate ? now() : null,
            'cancel_at_period_end' => !$immediate,
            'cancelled_by' => $cancelledBy,
        ];

        return $this->update($data);
    }

    public function renew(): bool
    {
        $nextBillingDate = $this->calculateNextBillingDate($this->billing_cycle);

        return $this->update([
            'current_period_end' => $nextBillingDate,
            'next_renewal_at' => $nextBillingDate,
            'status' => 'active',
            'cancel_reason' => null,
            'cancelled_at' => null,
            'cancel_at_period_end' => false,
        ]);
    }

    private function calculateNextBillingDate(string $billingCycle = null): \Carbon\Carbon
    {
        $cycle = $billingCycle ?? $this->billing_cycle;

        return match ($cycle) {
            'monthly' => now()->addMonth(),
            'quarterly' => now()->addMonths(3),
            'semi_annually' => now()->addMonths(6),
            'annually' => now()->addYear(),
            default => now()->addMonth(),
        };
    }
}
