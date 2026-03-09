<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking->load(['product', 'assignedStaff']);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('New Booking Received - ' . $this->booking->reference)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A new booking has been received and requires your attention.')
            ->line('**Booking Details:**')
            ->line('Reference: ' . $this->booking->reference)
            ->line('Client: ' . $this->booking->client_display)
            ->line('Email: ' . $this->booking->email)
            ->line('Phone: ' . $this->booking->phone)
            ->line('Service: ' . $this->booking->meeting_purpose)
            ->line('Date: ' . $this->booking->booking_date->format('l, F j, Y'))
            ->line('Time: ' . $this->booking->booking_time)
            ->line('Duration: ' . $this->booking->duration_minutes . ' minutes')
            ->line('Meeting Type: ' . ucfirst($this->booking->meeting_type));

        if ($this->booking->notes) {
            $mail->line('Notes: ' . $this->booking->notes);
        }

        if ($this->booking->assignedStaff) {
            $mail->line('Assigned To: ' . $this->booking->assignedStaff->name);
        }

        return $mail
            ->action('View Booking', url('/admin/bookings/' . $this->booking->id))
            ->line('Please process this booking at your earliest convenience.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking_received',
            'title' => 'New Booking Received',
            'message' => $this->booking->client_name . ' has booked a consultation for ' . $this->booking->meeting_purpose,
            'booking_id' => $this->booking->id,
            'reference' => $this->booking->reference,
            'booking_date' => $this->booking->booking_date->format('Y-m-d'),
            'booking_time' => $this->booking->booking_time,
            'client_name' => $this->booking->client_name,
            'client_email' => $this->booking->email,
            'url' => '/admin/bookings/' . $this->booking->id,
        ];
    }
}

