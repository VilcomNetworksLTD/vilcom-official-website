<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking->load(['product', 'assignedStaff']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('bookings'),
            new PrivateChannel('staff.' . $this->booking->assigned_to),
        ];
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
            'status' => $this->booking->status,
            'assigned_to' => $this->booking->assigned_to,
            'staff_name' => $this->booking->assignedStaff?->name,
            'created_at' => $this->booking->created_at->toIso8601String(),
            'message' => 'New booking received: ' . $this->booking->reference,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'booking.created';
    }
}

