<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'description'     => $this->description,
            'type'            => $this->type,
            'quantity'        => $this->quantity,
            'unit_price'      => $this->unit_price,
            'discount_amount' => $this->discount_amount,
            'tax_amount'      => $this->tax_amount,
            'total'           => $this->total,
            'product_id'      => $this->product_id,
            'addon_id'        => $this->addon_id,
            'sort_order'      => $this->sort_order,
        ];
    }
}

