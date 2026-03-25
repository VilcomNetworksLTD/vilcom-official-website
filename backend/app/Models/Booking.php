<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'email', 'phone',
        'company_name', 'customer_type',
        'product_id', 'product_snapshot',
        'assigned_to', 'reference',
        'booking_date', 'booking_time', 'duration_minutes',
        'meeting_type', 'meeting_link', 'meeting_location',
        'notes', 'internal_notes', 'status',
        'confirmed_at', 'confirmed_by',
        'cancelled_at', 'cancellation_reason',
        'rescheduled_from', 'original_date', 'original_time',
        'reminder_sent', 'reminder_sent_at',
        'id_type', 'id_number',
        'vms_reference', 'vms_check_in_code', 'vms_qr_code_url', 'vms_synced_at',
    ];

    protected $casts = [
        'booking_date'     => 'date',
        'original_date'    => 'date',
        'confirmed_at'     => 'datetime',
        'cancelled_at'     => 'datetime',
        'reminder_sent_at' => 'datetime',
        'reminder_sent'    => 'boolean',
        'product_snapshot' => 'array', // Auto JSON decode
    ];

    protected $appends = ['client_name', 'client_display', 'meeting_purpose'];

    // ─────────────────────────────────────────────────────────────────────────
    // VIRTUAL ATTRIBUTES
    // ─────────────────────────────────────────────────────────────────────────

    public function getClientNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getClientDisplayAttribute(): string
    {
        $name = $this->client_name;
        if ($this->customer_type === 'business' && $this->company_name) {
            return "{$name} ({$this->company_name})";
        }
        return $name;
    }

    /**
     * Returns the meeting purpose from the frozen product snapshot.
     * Falls back to the live product name, then a generic label.
     * This means the booking record stays accurate even if the product
     * is renamed, repriced, or deleted later.
     */
    public function getMeetingPurposeAttribute(): string
    {
        if ($this->product_snapshot && isset($this->product_snapshot['purpose_label'])) {
            return $this->product_snapshot['purpose_label'];
        }
        if ($this->relationLoaded('product') && $this->product) {
            return $this->product->name;
        }
        return 'Consultation';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NAME FORMAT COMPATIBILITY
    // Handles both 'name' (single) and 'first_name'/'last_name' user tables
    // ─────────────────────────────────────────────────────────────────────────

    public static function fromUser(User $user): array
    {
        $attrs = $user->getAttributes();

        if (array_key_exists('first_name', $attrs)) {
            $firstName = $user->first_name ?? '';
            $lastName  = $user->last_name ?? '';
        } else {
            $parts     = explode(' ', trim($user->name ?? ''), 2);
            $firstName = $parts[0] ?? '';
            $lastName  = $parts[1] ?? '';
        }

        return [
            'user_id'       => $user->id,
            'first_name'    => $firstName,
            'last_name'     => $lastName,
            'email'         => $user->email,
            'phone'         => $user->phone ?? null,
            'company_name'  => $user->company_name ?? null,
            'customer_type' => $user->customer_type ?? 'individual',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REFERENCE GENERATION
    // ─────────────────────────────────────────────────────────────────────────

    public static function generateReference(): string
    {
        $year  = now()->format('Y');
        $count = self::whereYear('created_at', $year)->withTrashed()->count() + 1;
        return 'VLC-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Live product — may be null if product was deleted (use product_snapshot instead) */
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

    // ─────────────────────────────────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────────────────────────────────

    public function scopePending(Builder $q): Builder   { return $q->where('status', 'pending'); }
    public function scopeConfirmed(Builder $q): Builder { return $q->where('status', 'confirmed'); }
    public function scopeToday(Builder $q): Builder     { return $q->whereDate('booking_date', today()); }
    public function scopeUpcoming(Builder $q): Builder
    {
        return $q->whereIn('status', ['pending', 'confirmed'])
                 ->where('booking_date', '>=', today());
    }
    public function scopeForProductType(Builder $q, string $type): Builder
    {
        return $q->whereHas('product', fn($p) => $p->where('type', $type));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    public function isPending(): bool   { return $this->status === 'pending'; }
    public function isConfirmed(): bool { return $this->status === 'confirmed'; }
    public function isCancelled(): bool { return $this->status === 'cancelled'; }
    public function isCompleted(): bool { return $this->status === 'completed'; }

    public function confirm(int $confirmedBy, ?string $meetingLink = null): void
    {
        $this->update(array_filter([
            'status'       => 'confirmed',
            'confirmed_at' => now(),
            'confirmed_by' => $confirmedBy,
            'meeting_link' => $meetingLink,
        ]));
    }

    public function cancel(string $reason): void
    {
        $this->update([
            'status'              => 'cancelled',
            'cancelled_at'        => now(),
            'cancellation_reason' => $reason,
        ]);
    }
}

