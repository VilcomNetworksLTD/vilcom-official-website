<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Booking extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'email', 'phone',
        'company_name',
        'customer_type', // 'new', 'existing'

        'product_id',
        'product_snapshot', // JSON

        'activity_type',   // 'meeting', 'interview', 'consultancy', 'training'
        'meeting_mode',    // 'in_person', 'virtual', 'phone'

        'assigned_to', 'reference',
        'booking_date', 'booking_time', 'duration_minutes',

        'meeting_link', 'meeting_location',
        'notes', 'internal_notes', 'status',

        'confirmed_at', 'confirmed_by',
        'cancelled_at', 'cancellation_reason',

        'rescheduled_from', 'original_date', 'original_time',

        'reminder_sent', 'reminder_sent_at',

        // VMS Fields
        'id_type', 'id_number',
        'vms_reference', 'vms_check_in_code', 'vms_qr_code_url', 'vms_synced_at',
    ];

    protected $casts = [
        'booking_date'     => 'date',
        'original_date'    => 'date',
        'confirmed_at'     => 'datetime',
        'cancelled_at'     => 'datetime',
        'reminder_sent_at' => 'datetime',
        'vms_synced_at'    => 'datetime',
        'reminder_sent'    => 'boolean',
        'product_snapshot' => 'array',
    ];

    protected $appends = ['client_name', 'client_display', 'meeting_purpose'];

    // ─────────────────────────────────────────────────────────────────
    // VIRTUAL ATTRIBUTES
    // ─────────────────────────────────────────────────────────────────

    public function getClientNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getClientDisplayAttribute(): string
    {
        $name = $this->client_name;
        // If a company name exists, append it regardless of customer_type
        if ($this->company_name) {
            return "{$name} ({$this->company_name})";
        }
        return $name;
    }

    /**
     * Determines the purpose of the meeting.
     * 1. Checks the frozen product snapshot (preferred for history).
     * 2. Checks the live product relationship.
     * 3. Falls back to Activity Type (for Interviews/General visits with no product).
     */
    public function getMeetingPurposeAttribute(): string
    {
        if ($this->product_snapshot && isset($this->product_snapshot['name'])) {
            return $this->product_snapshot['name'];
        }

        if ($this->relationLoaded('product') && $this->product) {
            return $this->product->name;
        }

        // Fallback for non-product bookings (Interviews, etc.)
        return ucfirst($this->activity_type ?? 'Consultation');
    }

    // ─────────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function rescheduledFrom(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'rescheduled_from');
    }

    // ─────────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────────

    public function scopePending(Builder $q): Builder   { return $q->where('status', 'pending'); }
    public function scopeConfirmed(Builder $q): Builder { return $q->where('status', 'confirmed'); }
    public function scopeToday(Builder $q): Builder     { return $q->whereDate('booking_date', today()); }

    public function scopeUpcoming(Builder $q): Builder
    {
        return $q->whereIn('status', ['pending', 'confirmed'])
                 ->where('booking_date', '>=', today());
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    public function isPending(): bool   { return $this->status === 'pending'; }
    public function isConfirmed(): bool { return $this->status === 'confirmed'; }
    public function isCancelled(): bool { return $this->status === 'cancelled'; }
    public function isCompleted(): bool { return $this->status === 'completed'; }

    public static function generateReference(): string
    {
        $year  = now()->format('Y');
        $count = self::whereYear('created_at', $year)->withTrashed()->count() + 1;
        return 'VLC-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
