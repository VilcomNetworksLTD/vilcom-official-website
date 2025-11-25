<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ProcessSubscriptionRenewals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:renew';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process subscription renewals and cancellations due today.';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $service): int
    {
        $this->info('Processing renewals...');
        
        $results = $service->processRenewals();

        $this->info('✓ Renewed:    ' . count($results['renewed']));
        $this->warn('⚠ Failed:     ' . count($results['failed']));
        $this->line('✗ Cancelled:  ' . count($results['cancelled']));

        if ($results['failed']) {
            $this->error('Failed: ' . implode(', ', $results['failed']));
        }

        return self::SUCCESS;
    }
}

