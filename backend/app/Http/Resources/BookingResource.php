<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Client information
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->client_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company_name' => $this->company_name,
            'customer_type' => $this->customer_type,
            'client_display' => $this->client_display,

            // Product information
            'product_id' => $this->product_id,
            'product_snapshot' => $this->product_snapshot,
            'meeting_purpose' => $this->meeting_purpose,
            'product' => $this->whenLoaded('product', function() {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'type' => $this->product->type,
                    'category' => $this->product->category?->name,
                ];
            }),

            // Assignment
            'assigned_to' => $this->assigned_to,
            'assigned_staff' => $this->whenLoaded('assignedStaff', function() {
                return [
                    'id' => $this->assignedStaff->id,
                    'name' => $this->assignedStaff->name,
                    'email' => $this->assignedStaff->email,
                ];
            }),

            // Booking details
            'reference' => $this->reference,
            'booking_date' => $this->booking_date->format('Y-m-d'),
            'booking_date_formatted' => $this->booking_date->format('l, F j, Y'),
            'booking_time' => $this->booking_time,
            'booking_time_formatted' => \Carbon\Carbon::parse($this->booking_time)->format('h:i A'),
            'duration_minutes' => $this->duration_minutes,
            'meeting_type' => $this->meeting_type,
            'meeting_type_label' => match($this->meeting_type) {
                'in_person' => 'In Person',
                'virtual' => 'Virtual Meeting',
                'phone' => 'Phone Call',
                default => 'Unknown',
            },
            'meeting_link' => $this->meeting_link,
            'meeting_location' => $this->meeting_location,
            'notes' => $this->notes,
            'internal_notes' => $this->internal_notes,

            // Status
            'status' => $this->status,
            'status_label' => match($this->status) {
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'cancelled' => 'Cancelled',
                'completed' => 'Completed',
                'rescheduled' => 'Rescheduled',
                'no_show' => 'No Show',
                default => 'Pending',
            },
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,

            // Rescheduling
            'rescheduled_from' => $this->rescheduled_from,
            'original_date' => $this->original_date?->format('Y-m-d'),
            'original_time' => $this->original_time,

            // Notifications
            'reminder_sent' => $this->reminder_sent,
            'reminder_sent_at' => $this->reminder_sent_at?->toIso8601String(),

            // Timestamps
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),

            // Actions available for current user
            'can_cancel' => $this->canCancel($request->user()),
            'can_reschedule' => $this->canReschedule($request->user()),
            'can_update_status' => $this->canUpdateStatus($request->user()),
        ];
    }

    /**
     * Check if the booking can be cancelled by the given user
     */
    private function canCancel($user): bool
    {
        if (!$user) {
            return false;
        }

        // Allow if user owns the booking
        if ($this->user_id === $user->id || $this->email === $user->email) {
            return in_array($this->status, ['pending', 'confirmed']);
        }

        // Allow if user is admin/staff
        if ($user->hasAnyRole(['admin', 'staff'])) {
            return in_array($this->status, ['pending', 'confirmed']);
        }

        return false;
    }

    /**
     * Check if the booking can be rescheduled by the given user
     */
    private function canReschedule($user): bool
    {
        if (!$user) {
            return false;
        }

        // Allow if user owns the booking
        if ($this->user_id === $user->id || $this->email === $user->email) {
            return in_array($this->status, ['pending', 'confirmed']);
        }

        // Allow if user is admin/staff
        if ($user->hasAnyRole(['admin', 'staff'])) {
            return in_array($this->status, ['pending', 'confirmed']);
        }

        return false;
    }

    /**
     * Check if the booking status can be updated by the given user
     */
    private function canUpdateStatus($user): bool
    {
        if (!$user) {
            return false;
        }

        return $user->hasAnyRole(['admin', 'staff', 'technical_support']);
    }
}

