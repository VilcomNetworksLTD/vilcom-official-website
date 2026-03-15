<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'user_id', 'title', 'description', 'status',
        'priority', 'assigned_to', 'category',
        'resolved_at', 'closed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at'   => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class)->orderBy('created_at');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeOpen($q)       { return $q->where('status', 'open'); }
    public function scopeInProgress($q) { return $q->where('status', 'in_progress'); }
    public function scopeResolved($q)   { return $q->where('status', 'resolved'); }
    public function scopeClosed($q)     { return $q->where('status', 'closed'); }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}
