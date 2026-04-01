<?php

namespace App\Listeners;

use App\Events\SubscriptionCreated;
use App\Models\Activity;

class LogSubscriptionCreated
{
    public function handle(SubscriptionCreated $event)
    {
        Activity::create([
            'action' => 'New Subscription',
            'description' => 'A new subscription for ' . ($event->subscription->product->name ?? 'a product') . ' was created',
            'type' => 'success',
        ]);
    }
}
