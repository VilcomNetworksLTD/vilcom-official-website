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
        // Always register InvoiceService
        $this->app->singleton(InvoiceService::class);

        // Register payment services conditionally using deferred resolution
        // These will only be instantiated when actually needed
        $this->app->singleton(MpesaService::class);
        $this->app->singleton(PesapalService::class);
        $this->app->singleton(FlutterwaveService::class);

        // Register PaymentService as a lazy proxy
        $this->app->singleton(PaymentService::class);
    }

    public function boot(): void
    {
        //
    }
}

