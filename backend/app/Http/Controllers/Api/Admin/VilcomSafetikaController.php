<?php
// app/Http/Controllers/Api/Admin/VilcomSafetikaController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\VilcomProvisionOrchestrator;
use App\Services\VilcomSafetikaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VilcomSafetikaController extends Controller
{
    public function __construct(
        protected VilcomProvisionOrchestrator $vilcomOrchestrator
    ) {}

    // ── GET /api/v1/admin/vilcom-safetika ─────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = User::role('client')
            ->select([
                'id', 'name', 'email', 'phone', 'status',
                'emerald_mbr_id', 'emerald_account_id',
                'vilcom_safetika_customer_id',
                'vilcom_safetika_record_id',
                'vilcom_safetika_service_acc_id',
                'vilcom_safetika_assignment_id',
                'vilcom_safetika_serial_number',
                'vilcom_safetika_provisioned_at',
                'created_at',
            ]);

        if ($request->filter === 'pending') {
            $query->whereNotNull('emerald_mbr_id')
                  ->whereNull('vilcom_safetika_provisioned_at');
        }

        if ($request->filter === 'provisioned') {
            $query->whereNotNull('vilcom_safetika_provisioned_at');
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'LIKE', "%{$s}%")
                  ->orWhere('email', 'LIKE', "%{$s}%")
                  ->orWhere('vilcom_safetika_serial_number', 'LIKE', "%{$s}%")
                  ->orWhere('vilcom_safetika_customer_id', $s);
            });
        }

        return response()->json(
            $query->latest()->paginate($request->per_page ?? 25)
        );
    }

    // ── GET /api/v1/admin/vilcom-safetika/statistics ──────────────────────
    public function statistics(): JsonResponse
    {
        $clients = User::role('client');

        return response()->json([
            'emerald_provisioned'   => (clone $clients)->whereNotNull('emerald_mbr_id')->count(),
            'safetika_provisioned'  => (clone $clients)->whereNotNull('vilcom_safetika_provisioned_at')->count(),
            'safetika_pending'      => (clone $clients)->whereNotNull('emerald_mbr_id')
                                                       ->whereNull('vilcom_safetika_provisioned_at')->count(),
            'not_provisioned_at_all'=> (clone $clients)->whereNull('emerald_mbr_id')->count(),
        ]);
    }

    // ── Dropdown endpoints (proxy to Safetika API) ────────────────────────

    public function salesPersons(VilcomSafetikaService $service): JsonResponse
    {
        try {
            $data = $service->getSalesPersons($service->getToken());
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Safetika salesPersons: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch sales persons.'], 500);
        }
    }

    public function serviceCategories(VilcomSafetikaService $service): JsonResponse
    {
        try {
            $data = $service->getServiceCategories($service->getToken());
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Safetika serviceCategories: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch service categories.'], 500);
        }
    }

    public function accountTypes(VilcomSafetikaService $service): JsonResponse
    {
        try {
            $data = $service->getAccountTypes($service->getToken());
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Safetika accountTypes: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch account types.'], 500);
        }
    }

    public function customerTypes(VilcomSafetikaService $service): JsonResponse
    {
        try {
            $data = $service->getCustomerTypes($service->getToken());
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Safetika customerTypes: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch customer types.'], 500);
        }
    }

    public function accountTypesByCategory(Request $request, VilcomSafetikaService $service): JsonResponse
    {
        $request->validate(['service_category' => 'required|string']);

        try {
            $data = $service->getAccountTypesByCategory($service->getToken(), $request->service_category);
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Safetika accountTypesByCategory: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch account types.'], 500);
        }
    }

    // ── Portal: MBR customers from Safetika ──────────────────────────────

    /** GET /api/v1/admin/vilcom-safetika/mbr-customers */
    public function mbrCustomers(Request $request, VilcomSafetikaService $service): JsonResponse
    {
        try {
            $params = $request->only(['status', 'customer_id', 'email', 'per_page']);
            $data   = $service->getMbrCustomers($service->getToken(), $params);
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Safetika getMbrCustomers: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /** GET /api/v1/admin/vilcom-safetika/mbr-customers/{id} */
    public function mbrCustomer(string $id, VilcomSafetikaService $service): JsonResponse
    {
        try {
            $data = $service->getMbrCustomer($service->getToken(), $id);
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Safetika getMbrCustomer: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Portal: provisioned clients (local DB) for Add Service select ─────

    /** GET /api/v1/admin/vilcom-safetika/provisioned-clients */
    public function provisionedClients(Request $request): JsonResponse
    {
        $clients = User::role('client')
            ->whereNotNull('vilcom_safetika_customer_id')
            ->select([
                'id', 'name', 'email', 'phone', 'customer_type',
                'vilcom_safetika_customer_id',
                'vilcom_safetika_service_acc_id',
                'vilcom_safetika_provisioned_at',
            ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($q2) use ($request) {
                    $s = $request->search;
                    $q2->where('name', 'like', "%{$s}%")
                       ->orWhere('email', 'like', "%{$s}%")
                       ->orWhere('vilcom_safetika_customer_id', $s);
                });
            })
            ->latest()
            ->paginate(50);

        return response()->json($clients);
    }

    // ── Portal: add service to existing provisioned client ────────────────

    /** POST /api/v1/admin/vilcom-safetika/add-service */
    public function addService(Request $request, VilcomSafetikaService $service): JsonResponse
    {
        $request->validate([
            'user_id'         => 'required|integer|exists:users,id',
            'AccountType'     => 'required|string',
            'ServiceCategory' => 'required|string',
            'SalesPerson'     => 'nullable|string',
            'setupcharge'     => 'nullable|string',
        ]);

        $user = User::find($request->user_id);

        if (!$user->vilcom_safetika_customer_id) {
            return response()->json([
                'success' => false,
                'message' => 'Client is not yet provisioned in Safetika (no Safetika Customer ID).',
            ], 422);
        }

        try {
            $token        = $service->getToken();
            $customerType = match (strtolower($user->customer_type ?? '')) {
                'business'   => 'Business',
                'enterprise' => 'Enterprise',
                default      => 'Residential',
            };

            $data = $service->addService(
                $user->vilcom_safetika_customer_id,
                $token,
                $request->AccountType,
                $request->ServiceCategory,
                $customerType,
                $request->SalesPerson
            );

            Log::info('Admin added Safetika service', [
                'user_id'      => $user->id,
                'account_type' => $request->AccountType,
                'service_cat'  => $request->ServiceCategory,
                'triggered_by' => $request->user()->id,
            ]);

            return response()->json(['success' => true, 'message' => 'Service added successfully.', 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Safetika addService failed', ['user_id' => $request->user_id, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    // ── Portal: inventory assignments ─────────────────────────────────────

    /** GET /api/v1/admin/vilcom-safetika/inventory-assignments */
    public function inventoryAssignments(Request $request, VilcomSafetikaService $service): JsonResponse
    {
        try {
            $params = $request->only(['status', 'from_date', 'to_date', 'search']);
            $data   = $service->getInventoryAssignments($service->getToken(), $params);
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Safetika inventoryAssignments: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /** POST /api/v1/admin/vilcom-safetika/unassign-inventory */
    public function unassignInventory(Request $request, VilcomSafetikaService $service): JsonResponse
    {
        $request->validate(['inv_item_id' => 'required|string']);

        try {
            $data = $service->unassignInventory($service->getToken(), $request->inv_item_id);

            Log::info('Admin unassigned inventory', [
                'inv_item_id'  => $request->inv_item_id,
                'triggered_by' => $request->user()->id,
            ]);

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Safetika unassignInventory: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    // ── GET /api/v1/admin/vilcom-safetika/{user} ──────────────────────────
    public function show(User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'user_id'                        => $user->id,
                'name'                           => $user->name,
                'email'                          => $user->email,
                'emerald_mbr_id'                 => $user->emerald_mbr_id,
                'emerald_account_id'             => $user->emerald_account_id,
                'vilcom_safetika_customer_id'    => $user->vilcom_safetika_customer_id,
                'vilcom_safetika_record_id'      => $user->vilcom_safetika_record_id,
                'vilcom_safetika_address_id'     => $user->vilcom_safetika_address_id,
                'vilcom_safetika_service_acc_id' => $user->vilcom_safetika_service_acc_id,
                'vilcom_safetika_assignment_id'  => $user->vilcom_safetika_assignment_id,
                'vilcom_safetika_serial_number'  => $user->vilcom_safetika_serial_number,
                'vilcom_safetika_provisioned_at' => $user->vilcom_safetika_provisioned_at,
                'fully_provisioned'              => !is_null($user->vilcom_safetika_provisioned_at),
            ],
        ]);
    }

    // ── POST /api/v1/admin/vilcom-safetika/{user}/reprovision ────────────
    public function reprovision(Request $request, User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        if (!$user->emerald_mbr_id) {
            return response()->json([
                'success' => false,
                'message' => 'User does not have an Emerald MBR ID yet. Complete Emerald provisioning first.',
            ], 422);
        }

        if ($user->vilcom_safetika_provisioned_at && !$request->boolean('force')) {
            return response()->json([
                'success'        => false,
                'message'        => 'User is already provisioned in Vilcom Safetika. Pass force=true to re-provision.',
                'provisioned_at' => $user->vilcom_safetika_provisioned_at,
            ], 422);
        }

        Log::info('Admin manually triggering Vilcom Safetika re-provision', [
            'user_id'      => $user->id,
            'triggered_by' => $request->user()->id,
            'forced'       => $request->boolean('force'),
        ]);

        $accountType     = $request->input('account_type', config('vilcom_safetika.defaults.account_type', 'FTTH Home'));
        $serviceCategory = $request->input('service_category', config('vilcom_safetika.defaults.service_category', 'Internet'));
        $salesPerson     = $request->input('sales_person');

        $result = $this->vilcomOrchestrator->provision($user, $accountType, $serviceCategory, 'Residential', $salesPerson);

        if ($result->isSuccess()) {
            return response()->json([
                'success'            => true,
                'message'            => 'Vilcom Safetika provisioning completed successfully.',
                'customer_id'        => $result->customerId,
                'record_id'          => $result->recordId,
                'service_account_id' => $result->serviceAccountId,
                'assignment_id'      => $result->assignmentId,
                'serial_number'      => $result->serialNumber,
                'user'               => $user->fresh([]),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Safetika provisioning failed: ' . $result->message,
        ], 422);
    }
}
