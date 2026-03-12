<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification
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
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Email Address - Vilcom Network')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Thank you for registering with Vilcom Network!')
            ->line('Please verify your email address by clicking the button below:')
            ->action('Verify Email Address', $verificationUrl)
            ->line('This verification link will expire in 60 minutes.')
            ->line('If you did not create an account with Vilcom Network, please ignore this email.')
            ->salutation('Best regards,' . "\n" . 'The Vilcom Network Team');
    }

    /**
     * Get the verification URL for the given notifiable.
     *
     * This points to the FRONTEND, which then calls the backend:
     *   GET /api/v1/auth/email/verify/{id}/{hash}
     */
    protected function verificationUrl(object $notifiable): string
    {
        $id   = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());

        return rtrim(config('app.frontend_url'), '/')
            . '/auth/verify-email'
            . '?id=' . $id
            . '&hash=' . $hash;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
