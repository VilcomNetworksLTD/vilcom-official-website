<?php

namespace App\Console\Commands;

use App\Services\Billing\InvoiceService;
use Illuminate\Console\Command;

class ProcessBillingCycle extends Command
{
    protected $signature   = 'billing:process-cycle';
    protected $description = 'Generate renewal invoices, mark overdue, send reminders';

    public function __construct(protected InvoiceService $invoiceService) 
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Marking overdue invoices...');
        $count = $this->invoiceService->markOverdueInvoices();
        $this->info("Marked {$count} invoices as overdue.");

        // TODO: Add renewal invoice generation logic
        // Subscription::where('next_renewal_at', today())->chunk(100, fn($subs) => ...)

        // TODO: Send reminder emails

        return Command::SUCCESS;
    }
}

