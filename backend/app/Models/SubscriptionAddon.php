<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// ─── SubscriptionAddon ────────────────────────────────────────────────────────
class SubscriptionAddon extends Model
{
    protected $table = 'subscription_addons';

    protected $fillable = [
        'subscription_id', 'addon_id', 'quantity',
        'unit_price', 'total_price', 'billing_cycle',
        'status', 'added_at', 'cancelled_at',
    ];

    protected $casts = [
        'unit_price'   => 'decimal:2',
        'total_price'  => 'decimal:2',
        'added_at'     => 'date',
        'cancelled_at' => 'date',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled', 'cancelled_at' => now()->toDateString()]);

        // Recalculate subscription addon total
        $sub = $this->subscription;
        $newAddonTotal = $sub->activeAddons()->sum('total_price');
        $sub->update([
            'addons_total' => $newAddonTotal,
            'total_amount' => $sub->base_price + $newAddonTotal - $sub->discount_amount,
        ]);
    }
}


// ─── SubscriptionStatusHistory ────────────────────────────────────────────────
class SubscriptionStatusHistory extends Model
{
    protected $table = 'subscription_status_history';

    protected $fillable = [
        'subscription_id', 'changed_by', 'from_status',
        'to_status', 'reason', 'metadata', 'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
        'metadata'   => 'array',
    ];

    public function subscription(): BelongsTo { return $this->belongsTo(Subscription::class); }
    public function changedBy(): BelongsTo    { return $this->belongsTo(User::class, 'changed_by'); }
}

// ─── SubscriptionReminder ─────────────────────────────────────────────────────
class SubscriptionReminder extends Model
{
    protected $table = 'subscription_reminders';

    protected $fillable = [
        'subscription_id', 'user_id', 'type', 'channel',
        'status', 'scheduled_at', 'sent_at', 'error_message', 'payload',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at'      => 'datetime',
        'payload'      => 'array',
    ];

    public function subscription(): BelongsTo { return $this->belongsTo(Subscription::class); }
    public function user(): BelongsTo         { return $this->belongsTo(User::class); }
}
