<?php

namespace App\Notifications;

use App\Models\StaffInvitation;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class StaffInvitationNotification extends Notification
{
    public function __construct(
        public StaffInvitation $invitation
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $acceptUrl = $this->getAcceptUrl();

        return (new MailMessage)
            ->subject('You have been invited to join Vilcom Networks')
            ->greeting('Hello!')
            ->line('You have been invited to join the Vilcom Networks team.')
            ->line('Your role: ' . ucfirst($this->invitation->role))
            ->line('Invited by: ' . $this->invitation->inviter?->name ?? 'Administrator')
            ->action('Accept Invitation', $acceptUrl)
            ->line('This invitation will expire on: ' . $this->invitation->expires_at->format('F j, Y'))
            ->line('If you did not expect this invitation, please ignore this email.');
    }

    protected function getAcceptUrl(): string
    {
        // Use frontend URL for invitation acceptance
        $frontendUrl = config('app.frontend_url', config('app.url'));
        return rtrim($frontendUrl, '/') . '/invite/' . $this->invitation->token;
    }

}

