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
        //
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
