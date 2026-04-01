<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class NewNewsletterSubscriptionAdminNotification extends Notification
{
    use Queueable;

    protected $email;
    protected $leadId;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $email, int $leadId)
    {
        $this->email = $email;
        $this->leadId = $leadId;
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
            ->subject(Lang::get('New Newsletter Subscription'))
            ->greeting(Lang::get('Hello Admin,'))
            ->line(Lang::get('A new user has subscribed to the newsletter: ' . $this->email))
            ->action(
                Lang::get('View Lead'),
                config('app.frontend_url') . '/admin/leads/' . $this->leadId
            )
            ->line(Lang::get('Please ensure they are properly added to the subscription management tools.'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'email' => $this->email,
            'lead_id' => $this->leadId,
        ];
    }
}
