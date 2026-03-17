<?php

namespace App\Mail;

use App\Models\StaffInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public StaffInvitation $invitation
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You have been invited to join Vilcom Networks',
        );
    }

    public function content(): Content
    {
        $frontendUrl = config('app.frontend_url', config('app.url'));
        $acceptUrl = rtrim($frontendUrl, '/') . '/invite/' . $this->invitation->token;

        return new Content(
            view: 'emails.staff-invitation', // Optional: create blade view later
            with: [
                'acceptUrl' => $acceptUrl,

                'role' => ucfirst($this->invitation->role),
                'inviter' => $this->invitation->inviter?->name ?? 'Administrator',
                'expiresAt' => $this->invitation->expires_at->format('F j, Y'),
            ],
        );
    }

    public function build()
    {
        $frontendUrl = config('app.frontend_url', config('app.url'));
        $acceptUrl = rtrim($frontendUrl, '/') . '/invite/' . $this->invitation->token;

        return $this->subject('You have been invited to join Vilcom Networks')
            ->view('emails.staff-invitation')
            ->with([
                'acceptUrl' => $acceptUrl,
                'role' => ucfirst($this->invitation->role),
                'inviter' => $this->invitation->inviter?->name ?? 'Administrator',
                'expiresAt' => $this->invitation->expires_at->format('F j, Y'),
            ]);
    }
}

