<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule subscription commands
app()->booted(function () {
    $schedule = app(Schedule::class);
    
    // Process subscription renewals daily at 00:05
    $schedule->command('subscriptions:renew')
        ->dailyAt('00:05')
        ->withoutOverlapping()
        ->appendOutputTo(storage_path('logs/subscriptions-renew.log'));
    
    // Process subscription reminders every 30 minutes
    $schedule->command('subscriptions:reminders')
        ->everyThirtyMinutes()
        ->withoutOverlapping()
        ->appendOutputTo(storage_path('logs/subscriptions-reminders.log'));
    
    // Process expired grace subscriptions daily at 01:00
    $schedule->command('subscriptions:expire-grace')
        ->dailyAt('01:00')
        ->withoutOverlapping()
        ->appendOutputTo(storage_path('logs/subscriptions-expire-grace.log'));
});
