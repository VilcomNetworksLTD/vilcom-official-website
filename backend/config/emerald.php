<?php
// config/emerald.php

return [

    // ── Connection ──────────────────────────────────────────────────────
    'base_url'     => env('EMERALD_BASE_URL', 'https://developer.vilcom-net.co.ke'),
    'admin_user'   => env('EMERALD_ADMIN_USER'),
    'admin_password' => env('EMERALD_ADMIN_PASSWORD'),

    // ── Billing Group ───────────────────────────────────────────────────
    // General → Billing Groups → Vilcom → URL: GroupID=2
    'group_id'     => env('EMERALD_GROUP_ID', 2),

    // ── Domain ──────────────────────────────────────────────────────────
    // General → Domains → vilcom.co.ke → URL: DomainID=1
    'domain_id'    => env('EMERALD_DOMAIN_ID', 1),

    // ── Address Type ────────────────────────────────────────────────────
    // Geography → Address Types → Billing Address → ID=1
    'address_type_id' => env('EMERALD_ADDRESS_TYPE_ID', 1),

    // ── Billing Cycle ────────────────────────────────────────────────────
    // Accounting → Billing Cycles → "Vilcom Billing Cycle"
    // We use the NAME (not ID) — immune to ID changes across installations
    'billing_cycle_name' => env('EMERALD_BILLING_CYCLE_NAME', 'Vilcom Billing Cycle'),
    'billing_cycle_id'   => env('EMERALD_BILLING_CYCLE_ID', 9),

    // All billing cycle IDs for reference
    'billing_cycles' => [
        'vilcom'                   => 9,  //  custom cycle — use this for all plans
        'anniversary_renewal'      => 1,
        'monthly_renewal'          => 2,
        'calendar_renewal'         => 3,
        'anniversary_balance_fwd'  => 4,
        'monthly_balance_fwd'      => 5,
        'calendar_balance_fwd'     => 6,
        'non_recurring'            => 7,
    ],
    // ── Pay Periods ──────────────────────────────────────────────────────
    // Accounting → Pay Periods (confirmed IDs)
    // Monthly=1, Quarterly=2, Six Months=3, Yearly=4, Two Weeks=5, Weekly=6
    // Pay period — use NAME for Vilcom Billing Cycle compatibility
    'pay_period_name' => env('EMERALD_PAY_PERIOD_NAME', 'Monthly'),
    'pay_period_id'   => env('EMERALD_PAY_PERIOD_ID', 1), // kept for reference only

    'pay_periods' => [
        'monthly'    => 1,
        'quarterly'  => 2,
        'six_months' => 3,
        'yearly'     => 4,
        'two_weeks'  => 5,
        'weekly'     => 6,
    ],

    // ── Send Method ─────────────────────────────────────────────────────
    // Accounting → Send Methods → Email HTML → ID=2
    'send_method_id' => env('EMERALD_SEND_METHOD_ID', 2),

    // ── Service Category ────────────────────────────────────────────────
    // Services → Service Categories
    // Home Fibre=1, Business Fibre=3, MSME Fibre=14
    // This is the DEFAULT — overridden per product via EmeraldProductMapping
    'service_category_id' => env('EMERALD_SERVICE_CATEGORY_ID', 1),

    // ── Service Categories Map ───────────────────────────────────────────
    // Used by EmeraldMappingSeeder and orchestrator
    'service_categories' => [
        'home_fibre'      => 1,
        'business_fibre'  => 3,
        'msme_fibre'      => 14,
        'lulu_homes'      => 11,
        'dia_main'        => 9,
        'dia_other'       => 10,
        'layer2'          => 8,
        'layer2_alt'      => 13,
    ],

];
