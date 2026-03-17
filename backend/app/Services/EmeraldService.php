<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmeraldService
{
    protected string $baseUrl;
    protected string $adminUser;
    protected string $adminPass;
    protected int    $groupId;
    protected int    $billingCycleId;
    protected int    $payPeriodId;
    protected int    $addressTypeId;
    protected int    $sendMethodId;
    protected int    $domainId;

    public function __construct()
    {
        $this->baseUrl        = config('emerald.base_url');
        $this->adminUser      = config('emerald.admin_user');
        $this->adminPass      = config('emerald.admin_password');
        $this->groupId        = config('emerald.group_id');
        $this->billingCycleId = config('emerald.billing_cycle_id');
        $this->payPeriodId    = config('emerald.pay_period_id');
        $this->addressTypeId  = config('emerald.address_type_id');
        $this->sendMethodId   = config('emerald.send_method_id');
        $this->domainId       = config('emerald.domain_id');
    }

    protected function post(array $params): array
    {
        $response = Http::withBasicAuth($this->adminUser, $this->adminPass)
            ->asForm()
            ->timeout(15)
            ->post($this->baseUrl . '/emerald/api.pl', $params);

        $result = $response->json();

        Log::info('Emerald API', [
            'action'   => $params['action'],
            'status'   => $response->status(),
            'response' => $result,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Emerald API error: HTTP ' . $response->status()
            );
        }

        return $result ?? [];
    }

    /**
     * Create MBR + service in Emerald (account_add)
     * Returns: ['CustomerID' => ..., 'AccountID' => ...]
     */
    public function createSubscriber(array $user, int $serviceTypeId): array
    {
        [$firstName, $lastName] = $this->splitName($user['name']);

        return $this->post([
            'action'          => 'account_add',
            'FirstName'       => $firstName,
            'LastName'        => $lastName,
            'Email'           => $user['email'],
            'PhoneMobile'     => $this->formatPhone($user['phone'] ?? ''),
            'Address1'        => $user['address'] ?? '',
            'City'            => $user['city'] ?? '',
            'Zip'             => $user['postal_code'] ?? '',
            'Company'         => $user['company_name'] ?? '',
            'GroupID'         => $this->groupId,
            'BillingCycleID'  => $this->billingCycleId,
            'PayPeriodID'     => $this->payPeriodId,
            'AddressTypeID'   => $this->addressTypeId,
            'SendMethodID'    => $this->sendMethodId,
            'DomainID'        => $this->domainId,
            'AccountTypeID'   => $serviceTypeId,
            'Region'          => $this->resolveRegion($user['county'] ?? ''),
            'Login'           => $this->generateLogin($user['email']),
            'Password'        => $this->generateServicePassword(),
            'Active'          => 1,
            'Recurring'       => 1,
            'PayMethod'       => 'Renewal',
            'ExternalRef'     => (string) $user['id'],
        ]);
    }

    /**
     * Post a payment to an MBR (payment_add)
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

    /**
     * Get MBR details (mbr_detail)
     */
    public function getSubscriber(int $mbrId): array
    {
        return $this->post([
            'action'     => 'mbr_detail',
            'CustomerID' => $mbrId,
        ]);
    }

    /**
     * Suspend a service
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
     * Activate a service
     */
    public function activateService(int $accountId): array
    {
        return $this->post([
            'action'    => 'service_change',
            'AccountID' => $accountId,
            'Active'    => 1,
        ]);
    }

    // ── Helpers ─────────────────────────────────────────

    private function splitName(string $name): array
    {
        $parts = explode(' ', trim($name), 2);
        return [$parts[0], $parts[1] ?? $parts[0]];
    }

    private function formatPhone(string $phone): string
    {
        // Convert 07XX → 2547XX for Emerald
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }
        return $phone;
    }

    private function generateLogin(string $email): string
    {
        $base = strtolower(explode('@', $email)[0]);
        $base = preg_replace('/[^a-z0-9]/', '', $base);
        return substr($base, 0, 12) . rand(10, 99);
    }

    private function generateServicePassword(): string
    {
        return bin2hex(random_bytes(6)); // 12-char hex
    }

    private function resolveRegion(string $county): string
    {
        // Maps your signup form county → Emerald region name
        $map = [
            'nairobi'  => 'Nairobi_Kilimani',
            'nakuru'   => 'Nakuru_Pipeline',
            'eldoret'  => 'Eldoret_Elgonview',
            'mombasa'  => 'Mombasa_Buxton',
            'kisumu'   => 'Nairobi_Kilimani',  // no Kisumu region yet — fallback
            'other'    => 'Nairobi_Kilimani',
        ];
        return $map[strtolower($county)] ?? 'Nairobi_Kilimani';
    }
}
