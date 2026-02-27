<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CreditWallet extends Model
{
    protected $fillable = ['user_id', 'currency', 'balance', 'total_credited', 'total_debited'];

    protected $casts = [
        'balance'        => 'decimal:2',
        'total_credited' => 'decimal:2',
        'total_debited'  => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CreditWalletTransaction::class)->latest();
    }

    /**
     * Add credit to wallet.
     */
    public function credit(float $amount, string $reason, array $extra = []): CreditWalletTransaction
    {
        $before = $this->balance;
        $this->increment('balance', $amount);
        $this->increment('total_credited', $amount);

        return $this->transactions()->create(array_merge([
            'user_id'        => $this->user_id,
            'type'           => 'credit',
            'reason'         => $reason,
            'amount'         => $amount,
            'balance_before' => $before,
            'balance_after'  => $this->balance,
        ], $extra));
    }

    /**
     * Deduct from wallet. Returns false if insufficient funds.
     */
    public function debit(float $amount, string $reason, array $extra = []): CreditWalletTransaction|false
    {
        if ($this->balance < $amount) {
            return false;
        }

        $before = $this->balance;
        $this->decrement('balance', $amount);
        $this->increment('total_debited', $amount);

        return $this->transactions()->create(array_merge([
            'user_id'        => $this->user_id,
            'type'           => 'debit',
            'reason'         => $reason,
            'amount'         => $amount,
            'balance_before' => $before,
            'balance_after'  => $this->balance,
        ], $extra));
    }
}