<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use App\Models\Activity;

class LogUserRegistered
{
    public function handle(Registered $event)
    {
        Activity::create([
            'action' => 'New User Registered',
            'description' => $event->user->name . ' signed up',
            'type' => 'success',
        ]);
    }
}
