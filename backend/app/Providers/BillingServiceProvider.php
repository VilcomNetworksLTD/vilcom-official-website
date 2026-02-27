<?php

namespace App\Providers;

use App\Services\Billing\FlutterwaveService;
use App\Services\Billing\InvoiceService;
use App\Services\Billing\MpesaService;
use App\Services\Billing\PaymentService;
use App\Services\Billing\PesapalService;
use Illuminate\Support\ServiceProvider;

class BillingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(MpesaService::class);
        $this->app->singleton(PesapalService::class);
        $this->app->singleton(FlutterwaveService::class);
        $this->app->singleton(InvoiceService::class);

        $this->app->singleton(PaymentService::class, fn($app) => new PaymentService(
            $app->make(MpesaService::class),
            $app->make(PesapalService::class),
            $app->make(FlutterwaveService::class),
        ));
    }

    public function boot(): void
    {
        //
    }
}

