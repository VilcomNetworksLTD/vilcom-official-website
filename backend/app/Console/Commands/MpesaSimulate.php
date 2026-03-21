<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Billing\MpesaService;
use Illuminate\Console\Command;

class MpesaSimulate extends Command
{
    protected $signature = 'mpesa:simulate
                            {amount : Amount in KES e.g. 3799}
                            {--mbr=  : Emerald MBR ID. Defaults to first provisioned user.}
                            {--phone= : Customer phone 254XXXXXXXXX.}';

    protected $description = 'Simulate a C2B Paybill payment (sandbox only)';

    public function handle(MpesaService $mpesa): int
    {
        if (config('mpesa.env') !== 'sandbox') {
            $this->error('Only works in sandbox (MPESA_ENV=sandbox).');
            return self::FAILURE;
        }

        $amount = (float) $this->argument('amount');
        $phone  = $this->option('phone') ?? '254708374149';

        $mbrId = $this->option('mbr');
        if (!$mbrId) {
            $user = User::whereNotNull('emerald_mbr_id')->first();
            if (!$user) {
                $this->error('No provisioned users found. Register a user first.');
                return self::FAILURE;
            }
            $mbrId = $user->emerald_mbr_id;
            $this->line("Auto-selected MBR: {$mbrId} ({$user->email})");
        }

        $this->info("Simulating C2B payment...");
        $this->table(['Field', 'Value'], [
            ['Amount',  "KES {$amount}"],
            ['Account', $mbrId],
            ['Phone',   $phone],
        ]);

        try {
            $result = $mpesa->simulateC2B($amount, $phone, (string) $mbrId);

            $desc = $result['ResponseDescription']
                 ?? $result['errorMessage']
                 ?? json_encode($result);

            if (isset($result['errorCode'])) {
                $this->error("❌ {$desc}");
                return self::FAILURE;
            }

            $this->info("✅ {$desc}");
            $this->newLine();
            $this->line('Watch for callback:');
            $this->line('  tail -f storage/logs/mpesa.log');

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
