<?php

namespace App\Notifications;

use App\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QuoteReadyNotification extends Notification implements ShouldQueue
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
        $quotedPrice = $this->quoteRequest->quoted_price 
            ? 'KES ' . number_format($this->quoteRequest->quoted_price, 2) 
            : 'Custom quote';
        
        return (new MailMessage)
            ->subject("Your Quote #{$this->quoteRequest->quote_number} is Ready!")
            ->greeting("Hello {$this->quoteRequest->contact_name}!")
            ->line('Great news! Your quote request has been processed and is ready for your review.')
            ->line('**Quote Summary:**')
            ->line("- Quote #: {$this->quoteRequest->quote_number}")
            ->line("- Service: {$serviceType}")
            ->line("- Quoted Price: {$quotedPrice}")
            ->line("- Valid Until: " . ($this->quoteRequest->quote_valid_until ? $this->quoteRequest->quote_valid_until->format('F j, Y') : 'N/A'))
            ->line('')
            ->line('**Our Response:**')
            ->line($this->quoteRequest->admin_response ?? 'Please log in to view the full quote details.')
            ->action('View & Accept Quote', url('/quotes/' . $this->quoteRequest->quote_number))
            ->line('')
            ->line('If you have any questions about this quote, please don\'t hesitate to contact us.')
            ->line('Thank you for considering Vilcom for your needs!')
            ->line('')
            ->line('Best regards,')
            ->line('The Vilcom Team');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $serviceType = $this->quoteRequest->getServiceTypeLabel();
        
        return [
            'title' => 'Your Quote is Ready!',
            'message' => "Quote #{$this->quoteRequest->quote_number} for {$serviceType} is ready for your review",
            'quote_id' => $this->quoteRequest->id,
            'quote_number' => $this->quoteRequest->quote_number,
            'service_type' => $this->quoteRequest->service_type,
            'quoted_price' => $this->quoteRequest->quoted_price,
            'status' => $this->quoteRequest->status,
        ];
    }
}
