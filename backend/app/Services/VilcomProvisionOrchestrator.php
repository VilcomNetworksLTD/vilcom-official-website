<?php
// app/Services/VilcomProvisionOrchestrator.php
//
// Synchronous provisioning chain for the Vilcom production API.
//
// Full flow (each step uses data from the previous):
//   1. Fetch bearer token
//   2. Create MBR customer          → capture record_id, customer_id
//   3. Add internet service          → capture account_id (requires record_id from step 2)
//   4. Find available warehouse
//   5. Search Homes_Tracker inventory in that warehouse
//   6. Assign inventory to customer  → capture assignment_id (requires record_id + inv_item_id)
//   7. Persist all IDs on the User model
//
// Called from: EmeraldBillingOrchestrator::provisionNewSubscriber()
// Does NOT replace old Emerald provisioning — runs AFTER it succeeds.

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class VilcomProvisionOrchestrator
{
    public function __construct(
        protected VilcomSafetikaService $safetika
    ) {}

    /**
     * Run the full synchronous provisioning chain.
     *
     * @param User   $user        The newly provisioned user
     * @param string $accountType e.g. "FTTH Home" — resolved from product mapping
     * @param string $serviceCategory e.g. "Internet"
     * @return VilcomProvisionResult
     */
    public function provision(
        User   $user,
        string $accountType     = 'FTTH Home',
        string $serviceCategory = 'Internet'
    ): VilcomProvisionResult {

        Log::info('VilcomProvisionOrchestrator: Starting full provision', [
            'user_id'          => $user->id,
            'account_type'     => $accountType,
            'service_category' => $serviceCategory,
        ]);

        try {
            // ── Step 1: Get fresh bearer token ───────────────────────────────
            $token = $this->safetika->getToken();

            // ── Step 2: Create MBR customer ──────────────────────────────────
            $mbrData   = $this->safetika->createMbrCustomer($user, $token);
            $recordId  = (int)   ($mbrData['record_id']   ?? 0);
            $customerId = (string)($mbrData['customer_id'] ?? '');
            $addressId  = (string)($mbrData['address_id']  ?? '');

            if (!$recordId) {
                throw new \RuntimeException('VilcomSafetika: create-mbr returned no record_id.');
            }

            Log::info('VilcomProvisionOrchestrator: Step 2 done — MBR created', [
                'user_id'     => $user->id,
                'record_id'   => $recordId,
                'customer_id' => $customerId,
                'address_id'  => $addressId,
            ]);

            // ── Step 3: Add service (uses record_id from step 2) ─────────────
            // Fetch a fresh token per API docs
            $token          = $this->safetika->getToken();
            $serviceData    = $this->safetika->addService($recordId, $token, $accountType, $serviceCategory);
            $serviceAccountId = (string)($serviceData['account_id'] ?? '');

            Log::info('VilcomProvisionOrchestrator: Step 3 done — Service added', [
                'user_id'           => $user->id,
                'service_account_id'=> $serviceAccountId,
                'service_category'  => $serviceData['service_category'] ?? $serviceCategory,
                'account_type'      => $serviceData['account_type'] ?? $accountType,
            ]);

            // ── Step 4: Get first available warehouse ────────────────────────
            $token     = $this->safetika->getToken();
            $warehouse = $this->safetika->getFirstWarehouse($token);

            Log::info('VilcomProvisionOrchestrator: Step 4 done — Warehouse resolved', [
                'user_id'   => $user->id,
                'warehouse' => $warehouse,
            ]);

            // ── Step 5: Find Homes_Tracker inventory ─────────────────────────
            $token    = $this->safetika->getToken();
            $invItem  = $this->safetika->findAvailableHomeTracker($warehouse, $token);

            Log::info('VilcomProvisionOrchestrator: Step 5 done — Inventory item found', [
                'user_id'       => $user->id,
                'inv_item_id'   => $invItem['inv_item_id'],
                'serial_number' => $invItem['serial_number'] ?? 'N/A',
            ]);

            // ── Step 6: Assign inventory to customer ──────────────────────────
            $token          = $this->safetika->getToken();
            $assignmentData = $this->safetika->assignInventory($invItem, $recordId, $token);
            $assignmentId   = (int)($assignmentData['assignment_id'] ?? 0);

            Log::info('VilcomProvisionOrchestrator: Step 6 done — Inventory assigned', [
                'user_id'       => $user->id,
                'assignment_id' => $assignmentId,
                'serial_number' => $assignmentData['serial_number'] ?? ($invItem['serial_number'] ?? 'N/A'),
            ]);

            // ── Step 7: Persist all Safetika IDs on user ─────────────────────
            $user->update([
                'vilcom_safetika_customer_id'   => $customerId,
                'vilcom_safetika_record_id'      => $recordId,
                'vilcom_safetika_address_id'     => $addressId,
                'vilcom_safetika_service_acc_id' => $serviceAccountId,
                'vilcom_safetika_assignment_id'  => $assignmentId,
                'vilcom_safetika_serial_number'  => $assignmentData['serial_number'] ?? ($invItem['serial_number'] ?? null),
                'vilcom_safetika_provisioned_at' => now(),
            ]);

            Log::info('VilcomProvisionOrchestrator: Full provision complete', [
                'user_id'           => $user->id,
                'customer_id'       => $customerId,
                'service_account_id'=> $serviceAccountId,
                'assignment_id'     => $assignmentId,
            ]);

            return VilcomProvisionResult::success(
                customerId:        $customerId,
                recordId:          $recordId,
                serviceAccountId:  $serviceAccountId,
                assignmentId:      $assignmentId,
                serialNumber:      $assignmentData['serial_number'] ?? ($invItem['serial_number'] ?? null)
            );

        } catch (\Exception $e) {
            Log::error('VilcomProvisionOrchestrator: Provision failed', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
            ]);

            return VilcomProvisionResult::failed($e->getMessage());
        }
    }
}


// ════════════════════════════════════════════════════════════════════════
// Value Object — Vilcom Provisioning Result
// ════════════════════════════════════════════════════════════════════════

class VilcomProvisionResult
{
    private function __construct(
        public readonly string  $status,            // success | failed
        public readonly ?string $customerId     = null,
        public readonly ?int    $recordId       = null,
        public readonly ?string $serviceAccountId = null,
        public readonly ?int    $assignmentId   = null,
        public readonly ?string $serialNumber   = null,
        public readonly ?string $message        = null,
    ) {}

    public static function success(
        string  $customerId,
        int     $recordId,
        string  $serviceAccountId,
        int     $assignmentId,
        ?string $serialNumber = null
    ): self {
        return new self(
            status:          'success',
            customerId:      $customerId,
            recordId:        $recordId,
            serviceAccountId:$serviceAccountId,
            assignmentId:    $assignmentId,
            serialNumber:    $serialNumber,
        );
    }

    public static function failed(string $message): self
    {
        return new self('failed', message: $message);
    }

    public function isSuccess(): bool { return $this->status === 'success'; }
    public function isFailed(): bool  { return $this->status === 'failed'; }
}
