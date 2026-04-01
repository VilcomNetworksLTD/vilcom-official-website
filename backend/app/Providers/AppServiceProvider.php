<?php

namespace App\Providers;

use App\Models\Subscription;
use App\Policies\SubscriptionPolicy;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Role;

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
                $app->make(\App\Services\EmeraldService::class),
                $app->make(\App\Services\VilcomProvisionOrchestrator::class)
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

        // Allow {role} route parameter to resolve by name OR by numeric id.
        // Frontend sends role names (e.g. "content_manager"), not integer ids.
        Route::bind('role', function (string $value) {
            // Try by name first, then fall back to id
            return Role::where('name', $value)
                ->orWhere('id', is_numeric($value) ? (int) $value : -1)
                ->firstOrFail();
        });
    }
}
