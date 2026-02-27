<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Flutterwave Environment
    |--------------------------------------------------------------------------
    |
    | Set to 'test' for sandbox testing, 'live' for production.
    |
    */
    'env' => env('FLW_ENV', 'test'),

    /*
    |--------------------------------------------------------------------------
    | Flutterwave Keys
    |--------------------------------------------------------------------------
    |
    | Your Flutterwave public and secret keys from Flutterwave Dashboard.
    |
    */
    'public_key' => env('FLW_PUBLIC_KEY'),
    'secret_key' => env('FLW_SECRET_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Secret Hash
    |--------------------------------------------------------------------------
    |
    | Secret hash for webhook signature verification. Generate this in your
    | Flutterwave dashboard and use it to verify incoming webhooks.
    |
    */
    'secret_hash' => env('FLW_SECRET_HASH'),

    /*
    |--------------------------------------------------------------------------
    | Callback URLs
    |--------------------------------------------------------------------------
    |
    | URLs for payment callbacks and redirects.
    |
    */
    'callback_url' => env('FLW_CALLBACK_URL'),

    /*
    |--------------------------------------------------------------------------
    | Default Currency
    |--------------------------------------------------------------------------
    |
    | Default currency for transactions (KES for Kenya, USD, etc.).
    |
    */
    'currency' => env('FLW_CURRENCY', 'KES'),

    /*
    |--------------------------------------------------------------------------
    | API Base URL
    |--------------------------------------------------------------------------
    |
    | Base URL for Flutterwave API endpoints.
    |
    */
    'api_url' => env('FLW_API_URL', 'https://api.flutterwave.com'),

    /*
    |--------------------------------------------------------------------------
    | Transaction Timeout
    |--------------------------------------------------------------------------
    |
    | Maximum time to wait for Flutterwave response in seconds.
    |
    */
    'timeout' => env('FLW_TIMEOUT', 120),
];

