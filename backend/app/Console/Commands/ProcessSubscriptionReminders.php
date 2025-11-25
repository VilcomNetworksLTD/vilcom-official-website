<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ProcessSubscriptionReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send due subscription renewal and suspension reminders.';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $service): int
    {
        $this->info('Processing due reminders...');
        
        $service->processDueReminders();
        
        $this->info('Reminders processed successfully.');
        
        return self::SUCCESS;
    }
}

