<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Booking $booking;
    public string $oldStatus;
    public string $newStatus;

    public function __construct(Booking $booking, string $newStatus, string $oldStatus = null)
    {
        $this->booking = $booking->load(['product', 'assignedStaff', 'user']);
        $this->newStatus = $newStatus;
        $this->oldStatus = $oldStatus ?? $booking->getOriginal('status');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('bookings'),
        ];

        // Notify the specific client if they have an account
        if ($this->booking->user_id) {
            $channels[] = new PrivateChannel('bookings.user.' . $this->booking->user_id);
        }

        // Notify the assigned staff member
        if ($this->booking->assigned_to) {
            $channels[] = new PrivateChannel('staff.' . $this->booking->assigned_to);
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->booking->id,
            'reference' => $this->booking->reference,
            'client_name' => $this->booking->client_name,
            'client_email' => $this->booking->email,
            'product_name' => $this->booking->product?->name,
            'meeting_purpose' => $this->booking->meeting_purpose,
            'booking_date' => $this->booking->booking_date->format('Y-m-d'),
            'booking_time' => $this->booking->booking_time,
            'duration_minutes' => $this->booking->duration_minutes,
            'meeting_type' => $this->booking->meeting_type,
            'meeting_link' => $this->booking->meeting_link,
            'old_status' => $this->oldStatus,
            'status' => $this->newStatus,
            'assigned_to' => $this->booking->assigned_to,
            'staff_name' => $this->booking->assignedStaff?->name,
            'confirmed_at' => $this->booking->confirmed_at?->toIso8601String(),
            'cancelled_at' => $this->booking->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->booking->cancellation_reason,
            'updated_at' => $this->booking->updated_at->toIso8601String(),
            'message' => $this->getStatusMessage(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'booking.status.updated';
    }

    /**
     * Get human-readable status message
     */
    private function getStatusMessage(): string
    {
        return match($this->newStatus) {
            'confirmed' => 'Your booking has been confirmed: ' . $this->booking->reference,
            'cancelled' => 'Your booking has been cancelled: ' . $this->booking->reference,
            'completed' => 'Your booking has been marked as completed: ' . $this->booking->reference,
            'rescheduled' => 'Your booking has been rescheduled: ' . $this->booking->reference,
            'no_show' => 'Booking marked as no-show: ' . $this->booking->reference,
            default => 'Booking status updated: ' . $this->booking->reference,
        };
    }
}

