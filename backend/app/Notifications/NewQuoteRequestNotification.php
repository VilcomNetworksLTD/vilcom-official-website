<?php

namespace App\Notifications;

use App\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuoteRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public QuoteRequest $quoteRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(QuoteRequest $quoteRequest)
    {
        $this->quoteRequest = $quoteRequest;
    }

    /**
     * Get the notification's delivery channels.
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
        $serviceType = $this->quoteRequest->getServiceTypeLabel();
        
        return (new MailMessage)
            ->subject("New Quote Request #{$this->quoteRequest->quote_number} - {$serviceType}")
            ->greeting('Hello!')
            ->line('A new quote request has been submitted and requires your attention.')
            ->line('**Quote Details:**')
            ->line("- Quote #: {$this->quoteRequest->quote_number}")
            ->line("- Service Type: {$serviceType}")
            ->line("- Customer: {$this->quoteRequest->contact_name}")
            ->line("- Email: {$this->quoteRequest->contact_email}")
            ->line("- Company: " . ($this->quoteRequest->company_name ?? 'N/A'))
            ->line("- Urgency: " . ucfirst($this->quoteRequest->urgency))
            ->line("- Budget: " . ($this->quoteRequest->budget_range ?? 'Not specified'))
            ->line("- Timeline: " . ($this->quoteRequest->timeline ?? 'Not specified'))
            ->action('View Quote Request', url('/admin/quotes/' . $this->quoteRequest->id))
            ->line('Please review and respond to this quote request as soon as possible.')
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $serviceType = $this->quoteRequest->getServiceTypeLabel();
        
        return [
            'title' => 'New Quote Request',
            'message' => "New quote request #{$this->quoteRequest->quote_number} for {$serviceType}",
            'quote_id' => $this->quoteRequest->id,
            'quote_number' => $this->quoteRequest->quote_number,
            'service_type' => $this->quoteRequest->service_type,
            'customer_name' => $this->quoteRequest->contact_name,
            'customer_email' => $this->quoteRequest->contact_email,
            'urgency' => $this->quoteRequest->urgency,
        ];
    }
}

