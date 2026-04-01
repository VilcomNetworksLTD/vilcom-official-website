<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class NewsletterSubscriptionNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(Lang::get('Thank you for subscribing to Vilcom Networks!'))
            ->greeting(Lang::get('Hello there,'))
            ->line(Lang::get('Thank you for subscribing to our newsletter! We are thrilled to have you.'))
            ->line(Lang::get('You will now receive updates on our latest plans, offers, and news right in your inbox.'))
            ->action(
                Lang::get('Visit Our Website'),
                config('app.frontend_url') ?? 'https://vilcom.co.ke'
            )
            ->line(Lang::get('If you have any questions, feel free to reach out to our support team.'))
            ->salutation(Lang::get('Best regards,' . "\n" . 'The Vilcom Networks Team'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
