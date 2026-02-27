<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                     => $this->id,
            'invoice_number'         => $this->invoice_number,
            'reference_number'       => $this->reference_number,
            'type'                   => $this->type,
            'status'                 => $this->status,

            // Amounts
            'currency'               => $this->currency,
            'subtotal'               => $this->subtotal,
            'discount_amount'        => $this->discount_amount,
            'tax_rate'               => $this->tax_rate,
            'tax_amount'             => $this->tax_amount,
            'setup_fee'              => $this->setup_fee,
            'total_amount'           => $this->total_amount,
            'amount_paid'            => $this->amount_paid,
            'amount_due'             => $this->amount_due,
            'credit_applied'         => $this->credit_applied,
            'balance_due'            => $this->balance_due,
            'is_overdue'             => $this->is_overdue,

            // Dates
            'invoice_date'           => $this->invoice_date?->toDateString(),
            'due_date'               => $this->due_date?->toDateString(),
            'paid_at'                => $this->paid_at?->toDateString(),
            'billing_period_start'   => $this->billing_period_start?->toDateString(),
            'billing_period_end'     => $this->billing_period_end?->toDateString(),

            // Tax
            'tax_label'              => $this->tax_label,
            'tax_number'             => $this->tax_number,

            // Discount
            'discount_code'          => $this->discount_code,
            'discount_percent'       => $this->discount_percent,

            // Notes
            'notes'                  => $this->notes,
            'internal_notes'         => $this->when(
                $request->user()?->hasAnyRole(['admin', 'staff']),
                $this->internal_notes
            ),

            // Relations
            'user'                   => new UserResource($this->whenLoaded('user')),
            'subscription'           => $this->whenLoaded('subscription', fn() => [
                'id'     => $this->subscription->id,
                'number' => $this->subscription->subscription_number,
                'plan'   => $this->subscription->product?->name,
            ]),
            'items'                  => InvoiceItemResource::collection($this->whenLoaded('items')),
            'payments'               => PaymentResource::collection($this->whenLoaded('payments')),

            'pdf_url'                => $this->pdf_path
                ? route('api.invoices.download', $this->id)
                : null,

            'created_at'             => $this->created_at?->toDateTimeString(),
            'updated_at'             => $this->updated_at?->toDateTimeString(),
        ];
    }
}

