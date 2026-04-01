<?php
// config/vilcom_safetika.php
// Configuration for the Vilcom production API
// Base URL: https://apisafetika.vilcom.co.ke/api

return [

    // ── Connection ──────────────────────────────────────────────────────
    'base_url'  => env('VILCOM_SAFETIKA_BASE_URL', 'https://apisafetika.vilcom.co.ke/api'),

    // ── Auth (token fetched fresh on every request) ─────────────────────
    'username'  => env('VILCOM_SAFETIKA_USERNAME', 'sales.api'),
    'password'  => env('VILCOM_SAFETIKA_PASSWORD', 'sales.api@2026'),

    // ── Provisioning Defaults ────────────────────────────────────────────
    // These can be overridden per product via EmeraldProductMapping in future
    'defaults'  => [
        'account_type'     => env('VILCOM_SAFETIKA_ACCOUNT_TYPE', 'FTTH Home'),
        'service_category' => env('VILCOM_SAFETIKA_SERVICE_CATEGORY', 'Internet'),
        'domain'           => 'Vilcom',          // Non-editable per API docs
        'setup_charge'     => '0',
        'sales_person'     => env('VILCOM_SAFETIKA_SALES_PERSON', 'John Sales'),
        'customer_type'    => env('VILCOM_SAFETIKA_CUSTOMER_TYPE', 'Residential'),
        'region'           => env('VILCOM_SAFETIKA_REGION', 'Nairobi_CBD'),
        'group_name'       => 'Vilcom',
    ],

    // ── Inventory ────────────────────────────────────────────────────────
    // Warehouse to search for Homes_Tracker devices
    'warehouse' => env('VILCOM_SAFETIKA_WAREHOUSE', 'Main Warehouse'),

    // ── Timeouts ─────────────────────────────────────────────────────────
    'timeout'   => env('VILCOM_SAFETIKA_TIMEOUT', 30),
];
