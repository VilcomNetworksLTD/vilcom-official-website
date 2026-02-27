<?php

return [
    /*
    |--------------------------------------------------------------------------
    | M-Pesa Environment
    |--------------------------------------------------------------------------
    |
    | Set to 'sandbox' for testing or 'production' for live transactions.
    |
    */
    'env' => env('MPESA_ENV', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Credentials
    |--------------------------------------------------------------------------
    |
    | Your M-Pesa consumer key and secret from Safaricom Developer Portal.
    |
    */
    'consumer_key' => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Shortcode
    |--------------------------------------------------------------------------
    |
    | Your M-Pesa shortcode (business paybill or till number).
    |
    */
    'shortcode' => env('MPESA_SHORTCODE'),

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Passkey
    |--------------------------------------------------------------------------
    |
    | Your M-Pesa passkey from Safaricom Developer Portal.
    |
    */
    'passkey' => env('MPESA_PASSKEY'),

    /*
    |--------------------------------------------------------------------------
    | STK Push Callback URL
    |--------------------------------------------------------------------------
    |
    | URL where STK push payment results will be sent.
    |
    */
    'stk_callback_url' => env('MPESA_STK_CALLBACK_URL'),

    /*
    |--------------------------------------------------------------------------
    | C2B Validation URL
    |--------------------------------------------------------------------------
    |
    | URL for C2B validation (optional - for premium shortcodes).
    |
    */
    'c2b_validation_url' => env('MPESA_C2B_VALIDATION_URL'),

    /*
    |--------------------------------------------------------------------------
    | C2B Confirmation URL
    |--------------------------------------------------------------------------
    |
    | URL for C2B confirmation - receives payment notifications.
    |
    */
    'c2b_confirmation_url' => env('MPESA_C2B_CONFIRMATION_URL'),

    /*
    |--------------------------------------------------------------------------
    | Transaction Timeout
    |--------------------------------------------------------------------------
    |
    | Maximum time to wait for M-Pesa response in seconds.
    |
    */
    'timeout' => env('MPESA_TIMEOUT', 120),

    /*
    |--------------------------------------------------------------------------
    | Initiator Username
    |--------------------------------------------------------------------------
    |
    | Username for M-Pesa B2C and B2B transactions.
    |
    */
    'initiator_username' => env('MPESA_INITIATOR_USERNAME'),

    /*
    |--------------------------------------------------------------------------
    | Initiator Password
    |--------------------------------------------------------------------------
    |
    | Password for M-Pesa B2C and B2B transactions (encrypted).
    |
    */
    'initiator_password' => env('MPESA_INITIATOR_PASSWORD'),
];

