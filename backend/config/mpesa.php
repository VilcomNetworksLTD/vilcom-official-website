<?php
// config/mpesa.php

return [
    'env'             => env('MPESA_ENV', 'sandbox'),
    'consumer_key'    => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
    'shortcode'       => env('MPESA_SHORTCODE', '174379'),
    'paybill'         => env('MPESA_SHORTCODE', '174379'),
    'passkey'         => env('MPESA_PASSKEY'),

    'stk_callback_url'     => env('MPESA_STK_CALLBACK_URL'),
    'c2b_confirmation_url' => env('MPESA_C2B_CONFIRMATION_URL'),
    'c2b_validation_url'   => env('MPESA_C2B_VALIDATION_URL'),
];
