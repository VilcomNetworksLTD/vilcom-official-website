<?php
// app/Services/VilcomSafetikaService.php
//
// HTTP client for the Vilcom production API (apisafetika.vilcom.co.ke).
// Handles authentication, MBR creation, service addition and inventory assignment.
//
// NOTE: Per API docs, a fresh token is fetched before each request.

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VilcomSafetikaService
{
    protected string $baseUrl;
    protected string $username;
    protected string $password;
    protected int    $timeout;

    public function __construct()
    {
        $this->baseUrl  = rtrim(config('vilcom_safetika.base_url', 'https://apisafetika.vilcom.co.ke/api'), '/');
        $this->username = config('vilcom_safetika.username', 'sales.api');
        $this->password = config('vilcom_safetika.password', 'sales.api@2026');
        $this->timeout  = (int) config('vilcom_safetika.timeout', 30);
    }

    // ── Authentication ────────────────────────────────────────────────────

    /**
     * Fetch a fresh bearer token from the Vilcom API.
     * Per API docs: "Call this API each time you make a request to get the token."
     */
    public function getToken(): string
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->baseUrl}/login", [
                'username' => $this->username,
                'password' => $this->password,
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException(
                "VilcomSafetika: Login failed (HTTP {$response->status()}): " . $response->body()
            );
        }

        $data = $response->json();

        if (empty($data['token'])) {
            throw new \RuntimeException(
                'VilcomSafetika: Login response missing token. Response: ' . json_encode($data)
            );
        }

        Log::debug('VilcomSafetika: Token acquired', ['expires_in' => $data['expires_in'] ?? 'unknown']);

        return $data['token'];
    }

    // ── MBR Customer Management ───────────────────────────────────────────

    /**
     * Step 1 — Create an MBR customer record for a registered user.
     *
     * Returns: ['customer_id' => '2159259', 'address_id' => '60458', 'record_id' => 123]
     */
    public function createMbrCustomer(
        User   $user, 
        string $token, 
        string $accountType  = 'FTTH Home', 
        string $customerType = 'Residential'
    ): array {
        [$firstName, $lastName] = $this->splitName($user->name);

        $defaults = config('vilcom_safetika.defaults', []);

        $payload = [
            'first_name'    => $firstName,
            'last_name'     => $lastName,
            'email'         => $user->email,
            'phone_mobile'  => $this->formatPhone($user->phone ?? ''),
            'address1'      => $user->address ?? '',
            'city'          => $user->city ?? 'Nairobi',
            'tax_number'    => $user->tax_pin ?? '',
            'id_number'     => '',
            'group_name'    => $defaults['group_name'] ?? 'Vilcom',
            'region'        => $this->resolveRegion($user->county ?? ''),
            'comments'      => 'Auto-provisioned via Vilcom Portal',
            'customer_type' => $customerType,
            'account_type'  => $accountType,
            'SalesPerson'   => $defaults['sales_person'] ?? 'John Sales',
        ];

        $response = Http::timeout($this->timeout)
            ->withToken($token)
            ->post("{$this->baseUrl}/vilcom/create-mbr", $payload);

        $data = $response->json();

        Log::info('VilcomSafetika: create-mbr response', [
            'user_id'  => $user->id,
            'status'   => $response->status(),
            'response' => $data,
        ]);

        if (!$response->successful() || empty($data['success'])) {
            throw new \RuntimeException(
                'VilcomSafetika: create-mbr failed: ' . ($data['message'] ?? $response->body())
            );
        }

        return $data['data'] ?? $data;
    }

    // ── Service Management ────────────────────────────────────────────────

    /**
     * Step 2 — Add an internet service to an existing MBR customer.
     *
     * @param int    $localRecordId  The 'record_id' returned by create-mbr (our local ID in their system)
     * @param string $accountType    e.g. "FTTH Home" — from /dropdowns/account-types
     * @param string $serviceCategory e.g. "Internet" — from /dropdowns/service-categories
     * @return array ['account_id' => '123456', 'service_category' => ..., 'account_type' => ...]
     */
    public function addService(
        int    $localRecordId,
        string $token,
        string $accountType     = 'FTTH Home',
        string $serviceCategory = 'Internet',
        string $customerType    = 'Residential'
    ): array {
        $defaults = config('vilcom_safetika.defaults', []);

        $payload = [
            'emerald_customer_id' => $localRecordId,
            'AccountType'         => $accountType,
            'account_type'        => $accountType,
            'customer_type'       => $customerType,
            'ServiceCategory'     => $serviceCategory,
            'Domain'              => $defaults['domain'] ?? 'Vilcom',
            'setupcharge'         => $defaults['setup_charge'] ?? '0',
            'SalesPerson'         => $defaults['sales_person'] ?? 'Yvonne Nyarangi',
        ];

        $response = Http::timeout($this->timeout)
            ->withToken($token)
            ->post("{$this->baseUrl}/vilcom/add-service", $payload);

        $data = $response->json();

        Log::info('VilcomSafetika: add-service response', [
            'record_id' => $localRecordId,
            'status'    => $response->status(),
            'response'  => $data,
        ]);

        if (!$response->successful() || empty($data['success'])) {
            throw new \RuntimeException(
                'VilcomSafetika: add-service failed: ' . ($data['message'] ?? $response->body())
            );
        }

        return $data['data'] ?? $data;
    }

    // ── Inventory Management ──────────────────────────────────────────────

    /**
     * Step 3a — Fetch available warehouses and return the first one (or a configured default).
     */
    public function getFirstWarehouse(string $token): string
    {
        $configWarehouse = config('vilcom_safetika.warehouse', 'Main Warehouse');

        try {
            $response = Http::timeout($this->timeout)
                ->withToken($token)
                ->get("{$this->baseUrl}/dropdowns/warehouse");

            $data = $response->json();

            if ($response->successful() && !empty($data['data'])) {
                // Prefer the configured warehouse if it exists in the list
                foreach ($data['data'] as $warehouse) {
                    if (isset($warehouse['name']) && $warehouse['name'] === $configWarehouse) {
                        return $warehouse['name'];
                    }
                }
                // Fall back to the first warehouse returned
                return $data['data'][0]['name'] ?? $configWarehouse;
            }
        } catch (\Exception $e) {
            Log::warning('VilcomSafetika: getFirstWarehouse failed, using default', [
                'error'   => $e->getMessage(),
                'default' => $configWarehouse,
            ]);
        }

        return $configWarehouse;
    }

    /**
     * Step 3b — Search for available Homes_Tracker inventory in a given warehouse.
     *
     * Returns the first available item or throws if none found.
     */
    public function findAvailableHomeTracker(string $warehouse, string $token): array
    {
        $response = Http::timeout($this->timeout)
            ->withToken($token)
            ->post("{$this->baseUrl}/dropdowns/inventory/search", [
                'warehouse' => $warehouse,
            ]);

        $data = $response->json();

        Log::info('VilcomSafetika: inventory search response', [
            'warehouse'      => $warehouse,
            'status'         => $response->status(),
            'total_filtered' => $data['data']['total_items_filtered'] ?? 0,
        ]);

        if (!$response->successful() || empty($data['success'])) {
            throw new \RuntimeException(
                'VilcomSafetika: inventory search failed: ' . ($data['message'] ?? $response->body())
            );
        }

        $items = $data['data']['items'] ?? [];

        if (empty($items)) {
            throw new \RuntimeException(
                "VilcomSafetika: No Homes_Tracker inventory available in warehouse '{$warehouse}'."
            );
        }

        // Pick the first available item
        return $items[0];
    }

    /**
     * Step 4 — Assign a Homes_Tracker inventory item to a customer.
     *
     * @param array $item       The inventory item from findAvailableHomeTracker()
     * @param int   $customerId Our local customer record ID (record_id from create-mbr)
     * @return array Assignment data including assignment_id
     */
    public function assignInventory(array $item, int $customerId, string $token): array
    {
        $payload = [
            'inv_item_id'    => $item['inv_item_id'],
            'customer_id'    => $customerId,
            'inv_product_id' => $item['inv_product_id'] ?? null,
            'title'          => $item['title'] ?? 'Homes_Tracker',
            'serial_number'  => $item['serial_number'] ?? null,
            'inv_warehouse'  => $item['inv_warehouse'] ?? null,
        ];

        $response = Http::timeout($this->timeout)
            ->withToken($token)
            ->post("{$this->baseUrl}/dropdowns/assign-inventory", $payload);

        $data = $response->json();

        Log::info('VilcomSafetika: assign-inventory response', [
            'customer_id'  => $customerId,
            'inv_item_id'  => $item['inv_item_id'],
            'status'       => $response->status(),
            'response'     => $data,
        ]);

        if (!$response->successful() || empty($data['success'])) {
            throw new \RuntimeException(
                'VilcomSafetika: assign-inventory failed: ' . ($data['message'] ?? $response->body())
            );
        }

        return $data['data'] ?? $data;
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function splitName(string $name): array
    {
        $parts = explode(' ', trim($name), 2);
        return [$parts[0], $parts[1] ?? $parts[0]];
    }

    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (str_starts_with($phone, '+254')) {
            return '0' . substr($phone, 4); // API expects 07XXXXXXXX format
        }

        if (str_starts_with($phone, '254')) {
            return '0' . substr($phone, 3);
        }

        return $phone;
    }

    /**
     * Resolve user customer_type → Vilcom API customer_type name.
     */
    private function resolveCustomerType(string $type): string
    {
        return match(strtolower($type)) {
            'business'   => 'Business',
            'enterprise' => 'Enterprise',
            default      => 'Residential',
        };
    }

    private function resolveRegion(string $county): string
    {
        // Live valid regions from /api/dropdowns/regions
        $map = [
            'nairobi'    => 'Nairobi_Westlands (Area 1)',
            'westlands'  => 'Westlands',
            'karen'      => 'Karen (Area 1)',
            'kileleshwa' => 'Nairobi_Kileleshwa',
            'kilimani'   => 'Nairobi_Kilimani',
            'nakuru'     => 'Nakuru_Pipeline (Area 2 & 4)',
            'eldoret'    => 'Eldoret_Roadblock (Area 2)',
            'mombasa'    => 'Mombasa_Buxton (Area 1)',
            'kitale'     => 'Kitale_Area_1',
            'kiambu'     => 'Kiambu Runda (Area 1)',
        ];

        $countyKey = strtolower(trim($county));

        return $map[$countyKey]
            ?? config('vilcom_safetika.defaults.region', 'Nairobi_Westlands (Area 1)');
    }
}
