<?php
return [
    'base_url'            => env('EMERALD_BASE_URL', 'https://developer.vilcom-net.co.ke'),
    'admin_user'          => env('EMERALD_ADMIN_USER'),
    'admin_password'      => env('EMERALD_ADMIN_PASSWORD'),
    'group_id'            => env('EMERALD_GROUP_ID', 2),
    'domain_id'           => env('EMERALD_DOMAIN_ID', 1),
    'address_type_id'     => env('EMERALD_ADDRESS_TYPE_ID', 1),
    'billing_cycle_id'    => env('EMERALD_BILLING_CYCLE_ID', 1),
    'pay_period_id'       => env('EMERALD_PAY_PERIOD_ID', 1),
    'send_method_id'      => env('EMERALD_SEND_METHOD_ID', 2),
    'service_category_id' => env('EMERALD_SERVICE_CATEGORY_ID', 1),
];
