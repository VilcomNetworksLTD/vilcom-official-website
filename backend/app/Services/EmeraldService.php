<?php
// app/Services/EmeraldService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmeraldService
{
    protected string $baseUrl;
    protected string $adminUser;
    protected string $adminPass;
    protected int    $groupId;
    protected string $billingCycleName; // Use name — safer than ID
    protected string $payPeriodName;
    protected int    $addressTypeId;
    protected int    $sendMethodId;
    protected int    $domainId;
    protected int    $serviceCategoryId;

    // Pay Period IDs confirmed from Emerald
    // Accounting → Pay Periods
    public const PAY_PERIODS = [
        'monthly'    => 1,
        'quarterly'  => 2,
        'six_months' => 3,
        'yearly'     => 4,
        'two_weeks'  => 5,
        'weekly'     => 6,
    ];

    public function __construct()
    {
        $this->baseUrl           = config('emerald.base_url');
        $this->adminUser         = config('emerald.admin_user');
        $this->adminPass         = config('emerald.admin_password');
        $this->groupId           = config('emerald.group_id');
        $this->billingCycleName  = config('emerald.billing_cycle_name', 'Vilcom Billing Cycle');
        $this->payPeriodName = config('emerald.pay_period_name', 'Monthly');
        $this->addressTypeId     = config('emerald.address_type_id');
        $this->sendMethodId      = config('emerald.send_method_id');
        $this->domainId          = config('emerald.domain_id');
        $this->serviceCategoryId = config('emerald.service_category_id');
    }

    // ── Core API method ──────────────────────────────────────────────────

    protected function post(array $params): array
    {
        $params['login_user']     = $this->adminUser;
        $params['login_password'] = $this->adminPass;
        $params['format']         = 'json';

        $response = Http::asForm()
            ->timeout(15)
            ->post($this->baseUrl . '/api.ews', $params);

        $result = $response->json();

        Log::info('Emerald API', [
            'action'   => $params['action'],
            'status'   => $response->status(),
            'response' => $result,
        ]);

        // retcode -1 WITH CustomerID = partial success (setup charge warning only)
        // Only throw on genuine failures where no CustomerID was returned
        if (isset($result['retcode'])
            && (int) $result['retcode'] !== 0
            && empty($result['CustomerID'])
        ) {
            throw new \RuntimeException(
                'Emerald error: ' . ($result['message'] ?? 'Unknown error')
            );
        }

        return $result ?? [];
    }

    // ── Account Management ───────────────────────────────────────────────

    /**
     * Create MBR + service in Emerald.
     * Uses BillingCycle name (not ID) for reliability.
     * PayPeriodID defaults to Monthly (1).
     *
     * Returns: ['CustomerID' => ..., 'AccountID' => ...]
     */
    public function createSubscriber(array $user, int $serviceTypeId): array
    {
        [$firstName, $lastName] = $this->splitName($user['name']);

        return $this->post([
            'action'            => 'account_add',
            'FirstName'         => $firstName,
            'LastName'          => $lastName,
            'Email'             => $user['email'],
            'PhoneMobile'       => $this->formatPhone($user['phone'] ?? ''),
            'Address1'          => $user['address'] ?? '',
            'City'              => $user['city'] ?? '',
            'Zip'               => $user['postal_code'] ?? '',
            'Company'           => $user['company_name'] ?? '',
            'GroupID'           => $this->groupId,

            // Use name-based lookup for BillingCycle — immune to ID changes
            'BillingCycle'      => $this->billingCycleName,

            'PayPeriod'         => $this->payPeriodName,

            'AddressTypeID'     => $this->addressTypeId,
            'SendMethodID'      => $this->sendMethodId,
            'DomainID'          => $this->domainId,
            'AccountTypeID'     => $serviceTypeId,
            'ServiceCategoryID' => $this->serviceCategoryId,
            'Region'            => $this->resolveRegion($user['county'] ?? ''),
            'Login'             => $this->generateLogin($user['email']),
            'Password'          => $this->generateServicePassword(),
            'SetupCharge'       => 0,
            'Active'            => 1,
            'Recurring'         => 1,
            'PayMethod'         => 'Renewal',
            'ExternalRef'       => (string) ($user['id'] ?? ''),
        ]);
    }

    /**
     * Get full MBR details.
     */
    public function getSubscriber(int $mbrId): array
    {
        return $this->post([
            'action'     => 'mbr_detail',
            'CustomerID' => $mbrId,
        ]);
    }

    // ── Payments ─────────────────────────────────────────────────────────

    /**
     * Post a payment to an MBR after M-Pesa / card confirmation.
     */
    public function postPayment(int $mbrId, float $amount, string $transRef): array
    {
        return $this->post([
            'action'     => 'payment_add',
            'CustomerID' => $mbrId,
            'Amount'     => number_format($amount, 2, '.', ''),
            'TransID'    => $transRef,
            'PayType'    => 'Cash',
            'Comment'    => 'M-Pesa: ' . $transRef,
        ]);
    }

    // ── Service Lifecycle ────────────────────────────────────────────────

    /**
     * Suspend a service (e.g. non-payment, admin action).
     */
    public function suspendService(int $accountId): array
    {
        return $this->post([
            'action'    => 'service_change',
            'AccountID' => $accountId,
            'Active'    => 0,
        ]);
    }

    /**
     * Reactivate a previously suspended service.
     */
    public function activateService(int $accountId): array
    {
        return $this->post([
            'action'    => 'service_change',
            'AccountID' => $accountId,
            'Active'    => 1,
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function splitName(string $name): array
    {
        $parts = explode(' ', trim($name), 2);
        return [$parts[0], $parts[1] ?? $parts[0]];
    }

    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);

        if (str_starts_with($phone, '0')) {
            return '254' . substr($phone, 1);
        }
        if (str_starts_with($phone, '+')) {
            return ltrim($phone, '+');
        }

        return $phone;
    }

    private function generateLogin(string $email): string
    {
        $base = strtolower(explode('@', $email)[0]);
        $base = preg_replace('/[^a-z0-9]/', '', $base);
        return substr($base, 0, 10) . rand(100, 999);
    }

    private function generateServicePassword(): string
    {
        return bin2hex(random_bytes(6)); // 12-char hex, no special characters
    }

    /**
     * Resolve county (from signup form) → Emerald region name.
     * Region names must match exactly as configured in Emerald.
     */
    public function resolveRegion(string $county): string
    {
        $map = [
            // Nairobi
            'nairobi'    => 'Nairobi_Kilimani',
            'westlands'  => 'Westlands',
            'karen'      => 'Nairobi_Karen (Area 1)',
            'kileleshwa' => 'Nairobi_Kileleshwa',
            'kilimani'   => 'Nairobi_Kilimani',
            'ruaraka'    => 'Nairobi_Ruaraka (Area 1)',
            'buruburu'   => 'Nairobi_Buruburu (Area 1)',
            'south_c'    => 'Nairobi_South_C (Area 5)',

            // Rift Valley
            'nakuru'     => 'Nakuru_Pipeline',
            'eldoret'    => 'Eldoret_Elgonview',

            // Coast
            'mombasa'    => 'Mombasa_Buxton (Area 1)',

            // Mt Kenya
            'meru'       => 'Meru_Milimani (Area 2)',
            'isiolo'     => 'Isiolo Area 1',

            // Kajiado / Rongai
            'rongai'     => 'Rongai_Cleanshelf (Area 1 & 3)',
            'kajiado'    => 'Rongai_Cleanshelf (Area 1 & 3)',

            // Western
            'kakamega'   => 'Kakamega_Naivas (Area 1)',
            'bungoma'    => 'Bungoma_Town (Area 2)',
            'kitale'     => 'Kitale_Area_1',

            // Kiambu
            'kiambu'     => 'Kiambu Runda (Area 1)',
            'ruiru'      => 'Ruiru_Corner (Area 3)',
            'thika'      => 'Ruiru_Corner (Area 3)',

            // Default fallback
            'other'      => 'Nairobi_Kilimani',
        ];

        return $map[strtolower(trim($county))] ?? 'Nairobi_Kilimani';
    }
}
