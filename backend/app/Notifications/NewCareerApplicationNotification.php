<?php

namespace App\Notifications;

use App\Models\CareerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCareerApplicationNotification extends Notification
{
    use Queueable;

    public CareerApplication $application;

    /**
     * Create a new notification instance.
     */
    public function __construct(CareerApplication $application)
    {
        $this->application = $application;
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
        return (new MailMessage)
            ->subject('New Career Application - ' . $this->application->job_title)
            ->greeting('Hello!')
            ->line('A new job application has been received.')
            ->line('**Application Details:**')
            ->line('• **Position:** ' . $this->application->job_title)
            ->line('• **Applicant:** ' . $this->application->full_name)
            ->line('• **Email:** ' . $this->application->email)
            ->line('• **Phone:** ' . ($this->application->phone ?? 'Not provided'))
            ->line('• **Application Number:** ' . $this->application->application_number)
            ->line('• **Submitted:** ' . $this->application->created_at->format('F j, Y g:i A'))
            ->action('View Application', url('/admin/career-applications/' . $this->application->id))
            ->line('Please review this application at your earliest convenience.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Career Application',
            'message' => $this->application->full_name . ' applied for ' . $this->application->job_title,
            'application_id' => $this->application->id,
            'application_number' => $this->application->application_number,
            'job_title' => $this->application->job_title,
            'applicant_name' => $this->application->full_name,
            'applicant_email' => $this->application->email,
            'status' => $this->application->status,
        ];
    }
}

