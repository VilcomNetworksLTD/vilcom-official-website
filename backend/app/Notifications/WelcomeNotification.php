<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class WelcomeNotification extends Notification
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
            ->subject(Lang::get('Welcome to Vilcom Networks!'))
            ->greeting(Lang::get('Hello :name,', ['name' => $notifiable->name]))
            ->line(Lang::get('Welcome to Vilcom Networks! We\'re excited to have you on board.'))
            ->line(Lang::get('Your account has been created successfully.'))
            ->action(
                Lang::get('Explore Services'),
                config('app.frontend_url')
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

