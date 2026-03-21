<?php

namespace App\Console\Commands;

use App\Services\Billing\MpesaService;
use Illuminate\Console\Command;

class MpesaRegisterUrls extends Command
{
    protected $signature   = 'mpesa:register-urls';
    protected $description = 'Register M-Pesa C2B confirmation and validation URLs with Safaricom';

    public function handle(MpesaService $mpesa): int
    {
        $env = strtoupper(config('mpesa.env', 'sandbox'));

        $this->info("Registering M-Pesa C2B URLs [{$env}]");
        $this->line('  Shortcode:    ' . config('mpesa.shortcode'));
        $this->line('  Confirmation: ' . config('mpesa.c2b_confirmation_url'));
        $this->line('  Validation:   ' . config('mpesa.c2b_validation_url'));
        $this->newLine();

        try {
            $result = $mpesa->registerC2BUrls();

            $desc = $result['ResponseDescription']
                 ?? $result['errorMessage']
                 ?? json_encode($result);

            if (isset($result['errorCode'])) {
                $this->error("❌ {$desc}");
                return self::FAILURE;
            }

            $this->info("✅ {$desc}");
            $this->table(
                ['Field', 'Value'],
                collect($result)
                    ->map(fn($v, $k) => [$k, is_array($v) ? json_encode($v) : $v])
                    ->values()
                    ->toArray()
            );

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
