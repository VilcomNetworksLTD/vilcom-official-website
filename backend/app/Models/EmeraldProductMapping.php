<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmeraldProductMapping extends Model
{
    protected $fillable = [
        'product_id',
        'emerald_service_type_id',
        'emerald_service_category_id',
        'emerald_service_type_name',
        'auto_provision',
        'sync_price',
        'is_active',
        'billing_cycle_id',
        'pay_period_id',
        'last_synced_at',
    ];

    protected $casts = [
        'auto_provision'   => 'boolean',
        'sync_price'       => 'boolean',
        'is_active'        => 'boolean',
        'last_synced_at'   => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
