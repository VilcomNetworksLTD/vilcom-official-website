<?php

namespace App\Providers;

use App\Models\Subscription;
use App\Policies\SubscriptionPolicy;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
{
    $this->app->bind(
        \App\Services\EmeraldBillingOrchestrator::class,
        fn($app) => new \App\Services\EmeraldBillingOrchestrator(
            $app->make(\App\Services\EmeraldService::class)
        )
    );
}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the SubscriptionPolicy
        \Gate::policy(Subscription::class, SubscriptionPolicy::class);
    }
}
