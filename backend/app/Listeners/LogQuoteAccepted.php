<?php

namespace App\Listeners;

use App\Events\QuoteAccepted;
use App\Models\Activity;

class LogQuoteAccepted
{
    public function handle(QuoteAccepted $event)
    {
        Activity::create([
            'action' => 'Quote Accepted',
            'description' => 'A quote for ' . $event->quoteRequest->service_type . ' was accepted',
            'type' => 'success',
        ]);
    }
}
