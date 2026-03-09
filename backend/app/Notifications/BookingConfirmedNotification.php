<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmedNotification extends Notification implements ShouldQueue
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
            ->subject('Booking Confirmed - ' . $this->booking->reference)
            ->greeting('Hello ' . $this->booking->first_name . ',')
            ->line('Great news! Your booking has been confirmed.')
            ->line('**Booking Details:**')
            ->line('Reference: ' . $this->booking->reference)
            ->line('Service: ' . $this->booking->meeting_purpose)
            ->line('Date: ' . $this->booking->booking_date->format('l, F j, Y'))
            ->line('Time: ' . $this->booking->booking_time)
            ->line('Duration: ' . $this->booking->duration_minutes . ' minutes')
            ->line('Meeting Type: ' . ucfirst($this->booking->meeting_type));

        if ($this->booking->meeting_type === 'virtual' && $this->booking->meeting_link) {
            $mail->line('Meeting Link: ' . $this->booking->meeting_link)
                 ->action('Join Meeting', $this->booking->meeting_link);
        }

        if ($this->booking->meeting_type === 'in_person' && $this->booking->meeting_location) {
            $mail->line('Location: ' . $this->booking->meeting_location);
        }

        if ($this->booking->assignedStaff) {
            $mail->line('Consultant: ' . $this->booking->assignedStaff->name);
        }

        return $mail
            ->line('We look forward to meeting with you!')
            ->line('If you need to reschedule or cancel, please contact us at least 24 hours in advance.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking_confirmed',
            'title' => 'Booking Confirmed',
            'message' => 'Your booking for ' . $this->booking->meeting_purpose . ' on ' .
                        $this->booking->booking_date->format('F j, Y') . ' has been confirmed.',
            'booking_id' => $this->booking->id,
            'reference' => $this->booking->reference,
            'booking_date' => $this->booking->booking_date->format('Y-m-d'),
            'booking_time' => $this->booking->booking_time,
            'status' => $this->booking->status,
            'url' => '/bookings/track/' . $this->booking->reference,
        ];
    }
}

