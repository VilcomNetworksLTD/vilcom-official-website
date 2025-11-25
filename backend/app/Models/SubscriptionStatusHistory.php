<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionStatusHistory extends Model
{
    protected $table = 'subscription_status_history';

    protected $fillable = [
        'subscription_id',
        'changed_by',
        'from_status',
        'to_status',
        'reason',
        'metadata',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
        'metadata'   => 'array',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}