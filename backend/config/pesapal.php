<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pesapal Environment
    |--------------------------------------------------------------------------
    |
    | Set to true for sandbox testing, false for production.
    |
    */
    'sandbox' => env('PESAPAL_SANDBOX', true),

    /*
    |--------------------------------------------------------------------------
    | Pesapal Credentials
    |--------------------------------------------------------------------------
    |
    | Your Pesapal consumer key and secret from Pesapal Developer Portal.
    |
    */
    'consumer_key' => env('PESAPAL_CONSUMER_KEY'),
    'consumer_secret' => env('PESAPAL_CONSUMER_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | IPN Notification URL
    |--------------------------------------------------------------------------
    |
    | URL where Pesapal will send payment status notifications.
    |
    */
    'ipn_url' => env('PESAPAL_IPN_URL'),

    /*
    |--------------------------------------------------------------------------
    | Callback URL
    |--------------------------------------------------------------------------
    |
    | URL where users will be redirected after payment.
    |
    */
    'callback_url' => env('PESAPAL_CALLBACK_URL'),

    /*
    |--------------------------------------------------------------------------
    | Pesapal API URL
    |--------------------------------------------------------------------------
    |
    | Base URL for Pesapal API endpoints.
    |
    */
    'api_url' => env('PESAPAL_API_URL', 'https://pesapal.com/api'),

    /*
    |--------------------------------------------------------------------------
    | Default Currency
    |--------------------------------------------------------------------------
    |
    | Default currency for transactions (KES for Kenya).
    |
    */
    'currency' => env('PESAPAL_CURRENCY', 'KES'),
];

