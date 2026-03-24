<?php
// config/mpesa.php

return [

    // ── Environment ──────────────────────────────────────────────────────
    // 'sandbox' | 'production'
    'env' => env('MPESA_ENV', 'sandbox'),

    // ── API Credentials ──────────────────────────────────────────────────
    // https://developer.safaricom.co.ke → My Apps → your app
    'consumer_key'    => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),

    // ── Shortcode / Paybill ──────────────────────────────────────────────
    // Sandbox default: 174379
    // Production: your actual Paybill number
    'shortcode' => env('MPESA_SHORTCODE', '174379'),

    // Alias used by dashboard/frontend
    'paybill'   => env('MPESA_SHORTCODE', '174379'),

    // ── STK Push Passkey ─────────────────────────────────────────────────
    // Sandbox: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
    // Production: get from Daraja portal → Go Live → Lipa na M-Pesa
    'passkey' => env('MPESA_PASSKEY'),

    // ── Callback URLs ────────────────────────────────────────────────────
    // Must be HTTPS + publicly reachable (use ngrok for local dev)

    // STK Push — customer enters PIN
    'stk_callback_url' => env('MPESA_STK_CALLBACK_URL',
        env('APP_URL') . '/api/webhooks/mpesa/callback'),

    // C2B Paybill — customer pays directly via M-Pesa menu
    'c2b_confirmation_url' => env('MPESA_C2B_CONFIRMATION_URL',
        env('APP_URL') . '/api/webhooks/mpesa/c2b/confirmation'),

    'c2b_validation_url' => env('MPESA_C2B_VALIDATION_URL',
        env('APP_URL') . '/api/webhooks/mpesa/c2b/validation'),

];
