<?php

return [
    /* Core Laravel Providers (DISABLED - these are auto-loaded by Laravel 11+ bootstrap/app.php to prevent DI conflicts and cache corruption)
    // Core Laravel Providers (essential for config, logging, database, etc.)
    Illuminate\Foundation\Providers\ConfigurationServiceProvider::class,
    Illuminate\Log\LogServiceProvider::class,
    Illuminate\Database\DatabaseServiceProvider::class,
    Illuminate\Cache\CacheServiceProvider::class,
    Illuminate\Session\SessionServiceProvider::class,
    Illuminate\View\ViewServiceProvider::class,
    Illuminate\Auth\AuthServiceProvider::class,
    Illuminate\Notifications\NotificationServiceProvider::class,
    Illuminate\Validation\ValidationServiceProvider::class,
    Illuminate\Pagination\PaginationServiceProvider::class,
    Illuminate\Routing\RoutingServiceProvider::class,
    Laravel\Sanctum\SanctumServiceProvider::class,
    */

    // Custom Providers (already registered in bootstrap/app.php, kept for reference)
    App\Providers\AppServiceProvider::class,
    App\Providers\BillingServiceProvider::class,
];

