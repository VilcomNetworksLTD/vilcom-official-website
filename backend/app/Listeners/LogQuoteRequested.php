<?php

namespace App\Listeners;

use App\Events\QuoteRequested;
use App\Models\Activity;

class LogQuoteRequested
{
    public function handle(QuoteRequested $event)
    {
        Activity::create([
            'action' => 'New Quote Request',
            'description' => 'A new quote request was submitted for ' . $event->quoteRequest->service_type,
            'type' => 'info',
        ]);
    }
}
