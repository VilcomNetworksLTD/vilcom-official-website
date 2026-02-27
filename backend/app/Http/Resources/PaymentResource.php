<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                      => $this->id,
            'payment_number'          => $this->payment_number,
            'status'                  => $this->status,
            'payment_method'          => $this->payment_method,
            'gateway'                 => $this->gateway,
            
            // Amounts
            'currency'                => $this->currency,
            'amount'                  => $this->amount,
            'net_amount'              => $this->net_amount,
            'refunded_amount'         => $this->refunded_amount,
            
            // Transaction details
            'transaction_id'          => $this->transaction_id,
            'gateway_reference'       => $this->gateway_reference,
            'mpesa_receipt_number'    => $this->mpesa_receipt_number,
            'mpesa_checkout_request_id' => $this->mpesa_checkout_request_id,
            
            // Bank details (for manual payments)
            'bank_name'               => $this->bank_name,
            'bank_reference'          => $this->bank_reference,
            'bank_transfer_date'      => $this->bank_transfer_date?->toDateString(),
            
            // Notes
            'notes'                   => $this->notes,
            'refund_reason'           => $this->when(
                $request->user()?->hasAnyRole(['admin', 'staff']),
                $this->refund_reason
            ),
            
            // Dates
            'paid_at'                 => $this->paid_at?->toDateTimeString(),
            'refunded_at'             => $this->refunded_at?->toDateTimeString(),
            
            // Relations
            'user'                    => new UserResource($this->whenLoaded('user')),
            'invoice'                 => $this->whenLoaded('invoice', fn() => [
                'id'               => $this->invoice->id,
                'invoice_number'   => $this->invoice->invoice_number,
                'total_amount'     => $this->invoice->total_amount,
                'amount_due'       => $this->invoice->amount_due,
            ]),
            'recordedBy'              => new UserResource($this->whenLoaded('recordedBy')),
            'refundedBy'              => new UserResource($this->whenLoaded('refundedBy')),
            
            'created_at'              => $this->created_at?->toDateTimeString(),
            'updated_at'              => $this->updated_at?->toDateTimeString(),
        ];
    }
}

