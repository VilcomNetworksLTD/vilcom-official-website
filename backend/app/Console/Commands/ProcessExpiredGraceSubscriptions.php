<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ProcessExpiredGraceSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:expire-grace';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Suspend subscriptions that have missed payment and grace period has expired.';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $service): int
    {
        $this->info('Processing expired grace subscriptions...');
        
        $service->processExpiredGrace();
        
        $this->info('Expired grace processing completed.');
        
        return self::SUCCESS;
    }
}

