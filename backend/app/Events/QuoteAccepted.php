<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\QuoteRequest;

class QuoteAccepted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $quoteRequest;

    /**
     * Create a new event instance.
     */
    public function __construct(QuoteRequest $quoteRequest)
    {
        $this->quoteRequest = $quoteRequest;
    }
}
