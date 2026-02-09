<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Str;

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
            ->subject(Lang::get('Verify Your Email Address'))
            ->greeting(Lang::get('Hello :name,', ['name' => $notifiable->name]))
            ->line(Lang::get('Please click the button below to verify your email address.'))
            ->action(
                Lang::get('Verify Email Address'),
                $verificationUrl
            )
            ->line(Lang::get('If you did not create an account, no further action is required.'))
            ->salutation(Lang::get('Best regards,' . "\n" . 'The Vilcom Networks Team'));
    }

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl(object $notifiable): string
    {
        $id = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());

        $url = config('app.frontend_url') . '/auth/verify-email';
        $url .= '?id=' . $id;
        $url .= '&hash=' . $hash;

        return $url;
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

