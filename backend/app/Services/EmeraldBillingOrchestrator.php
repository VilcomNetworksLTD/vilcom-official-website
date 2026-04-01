<?php
// app/Services/EmeraldBillingOrchestrator.php

namespace App\Services;

use App\Models\SafetikaProductMapping;
use App\Models\User;
use App\Services\VilcomProvisionOrchestrator;
use Illuminate\Support\Facades\Log;

class EmeraldBillingOrchestrator
{
    public function __construct(
        protected EmeraldService            $emerald,
        protected VilcomProvisionOrchestrator $vilcomOrchestrator
    ) {}

    // ── Provisioning ──────────────────────────────────────────────────────

    /**
     * Full provisioning flow — 100% Vilcom Safetika (production API).
     *
     * 1. Looks up SafetikaProductMapping for account_type & customer_type
     * 2. Falls back to config defaults if no mapping exists
     * 3. Calls VilcomProvisionOrchestrator (MBR → Service → Inventory)
     * 4. All Safetika IDs are stored on the user by the orchestrator
     *
     * Called from: EmeraldApprovalController::approve
     */
    public function provisionNewSubscriber(User $user, int $productId): ProvisionResult
    {
        // ── 1. Look up Safetika product mapping ──────────────────────────
        $mapping = SafetikaProductMapping::where('product_id', $productId)
            ->active()
            ->autoProvision()
            ->first();

        if ($mapping) {
            $accountType     = $mapping->account_type;
            $serviceCategory = $mapping->service_category;
            $customerType    = $mapping->customer_type;
            $mapping->update(['last_provisioned_at' => now()]);
        } else {
            // Graceful fallback — use config defaults so provisioning
            // always works even for products not yet mapped.
            $accountType     = config('vilcom_safetika.defaults.account_type',     'FTTH Home');
            $serviceCategory = config('vilcom_safetika.defaults.service_category', 'Internet');
            $customerType    = config('vilcom_safetika.defaults.customer_type',    'Residential');

            Log::warning('No Safetika mapping found for product — using config defaults', [
                'product_id'     => $productId,
                'user_id'        => $user->id,
                'account_type'   => $accountType,
                'customer_type'  => $customerType,
            ]);
        }

        Log::info('Safetika provisioning starting', [
            'user_id'          => $user->id,
            'product_id'       => $productId,
            'account_type'     => $accountType,
            'service_category' => $serviceCategory,
            'customer_type'    => $customerType,
        ]);

        // ── 2. Run full Safetika chain ───────────────────────────────────
        $result = $this->vilcomOrchestrator->provision(
            $user,
            $accountType,
            $serviceCategory,
            $customerType
        );

        if ($result->isSuccess()) {
            Log::info('Safetika provisioning completed successfully', [
                'user_id'            => $user->id,
                'customer_id'        => $result->customerId,
                'record_id'          => $result->recordId,
                'service_account_id' => $result->serviceAccountId,
                'assignment_id'      => $result->assignmentId,
                'serial_number'      => $result->serialNumber,
            ]);

            return ProvisionResult::success(
                (int) $result->customerId,
                null  // no legacy Emerald AccountID
            );
        }

        Log::error('Safetika provisioning failed', [
            'user_id'    => $user->id,
            'product_id' => $productId,
            'reason'     => $result->message,
        ]);

        return ProvisionResult::failed($result->message);
    }

    // ── Internal helpers ──────────────────────────────────────────────────

    // ── Payments ──────────────────────────────────────────────────────────

    /**
     * Post a confirmed M-Pesa / card payment to Emerald.
     * Called from MpesaController webhook after payment confirmed.
     *
     * The MBR ID (emerald_mbr_id) IS the M-Pesa Paybill account number.
     */
    public function processPayment(
        int    $mbrId,
        float  $amount,
        string $transRef
    ): bool {
        try {
            $this->emerald->postPayment($mbrId, $amount, $transRef);

            Log::info('Emerald payment posted', [
                'mbr_id'    => $mbrId,
                'amount'    => $amount,
                'trans_ref' => $transRef,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Emerald payment post failed', [
                'mbr_id' => $mbrId,
                'error'  => $e->getMessage(),
            ]);
            return false;
        }
    }

    // ── Service Lifecycle ─────────────────────────────────────────────────

    /**
     * Suspend a subscriber's Emerald service.
     * Called from UserController::suspend, SubscriptionController::suspend.
     */
    public function suspendSubscriber(User $user): bool
    {
        if (!$user->emerald_account_id) {
            Log::info('Suspend skipped — no Emerald account', ['user_id' => $user->id]);
            return false;
        }

        try {
            $this->emerald->suspendService((int) $user->emerald_account_id);

            Log::info('Emerald service suspended', [
                'user_id'    => $user->id,
                'account_id' => $user->emerald_account_id,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Emerald suspend failed', [
                'user_id'    => $user->id,
                'account_id' => $user->emerald_account_id,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Reactivate a subscriber's Emerald service.
     * Called from UserController::activate, MpesaController (after payment).
     */
    public function activateSubscriber(User $user): bool
    {
        if (!$user->emerald_account_id) {
            Log::info('Activate skipped — no Emerald account', ['user_id' => $user->id]);
            return false;
        }

        try {
            $this->emerald->activateService((int) $user->emerald_account_id);

            Log::info('Emerald service activated', [
                'user_id'    => $user->id,
                'account_id' => $user->emerald_account_id,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Emerald activate failed', [
                'user_id'    => $user->id,
                'account_id' => $user->emerald_account_id,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }
}


// ════════════════════════════════════════════════════════════════════════
// Value Object — Provisioning Result
// Clean result type — no exceptions leaking into controllers
// ════════════════════════════════════════════════════════════════════════

class ProvisionResult
{
    private function __construct(
        public readonly string  $status,      // success | failed | skipped
        public readonly ?int    $customerId = null,
        public readonly ?int    $accountId  = null,
        public readonly ?string $message    = null,
    ) {}

    public static function success(int $customerId, ?int $accountId): self
    {
        return new self('success', $customerId, $accountId);
    }

    public static function failed(string $message): self
    {
        return new self('failed', message: $message);
    }

    public static function skipped(string $message): self
    {
        return new self('skipped', message: $message);
    }

    public function isSuccess(): bool { return $this->status === 'success'; }
    public function isFailed(): bool  { return $this->status === 'failed';  }
    public function isSkipped(): bool { return $this->status === 'skipped'; }
}
