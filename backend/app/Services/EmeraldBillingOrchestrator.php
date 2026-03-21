<?php
// app/Services/EmeraldBillingOrchestrator.php

namespace App\Services;

use App\Models\EmeraldProductMapping;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class EmeraldBillingOrchestrator
{
    public function __construct(
        protected EmeraldService $emerald
    ) {}

    // ── Provisioning ──────────────────────────────────────────────────────

    /**
     * Full provisioning flow after signup.
     *
     * 1. Looks up EmeraldProductMapping for the selected product
     * 2. Applies any per-product overrides (pay period, billing cycle)
     * 3. Calls Emerald account_add API
     * 4. Stores CustomerID (MBR ID = M-Pesa account number) on user
     *
     * Called from: RegisterController, UserController::store
     */
    public function provisionNewSubscriber(User $user, int $productId): ProvisionResult
    {
        // ── 1. Find the mapping ──────────────────────────────────────────
        $mapping = EmeraldProductMapping::where('product_id', $productId)
            ->active()
            ->autoProvision()
            ->first();

        if (!$mapping) {
            Log::warning('No Emerald mapping found for product', [
                'product_id' => $productId,
                'user_id'    => $user->id,
            ]);
            return ProvisionResult::skipped('No Emerald mapping configured for this product');
        }

        // ── 2. Apply per-mapping overrides ───────────────────────────────
        // Service category — required, comes from mapping
        config(['emerald.service_category_id' => $mapping->emerald_service_category_id]);

        // Billing cycle name — mapping can override global default
        config(['emerald.billing_cycle_name' => $mapping->getBillingCycleName()]);

        // Pay period — mapping can override global default (Monthly)
        config(['emerald.pay_period_name' => $mapping->getResolvedPayPeriodName()]);

        Log::info('Emerald provisioning starting', [
            'user_id'              => $user->id,
            'product_id'           => $productId,
            'service_type_id'      => $mapping->emerald_service_type_id,
            'service_category_id'  => $mapping->emerald_service_category_id,
            'billing_cycle'        => $mapping->getBillingCycleName(),
            'pay_period_name'      => $mapping->getResolvedPayPeriodName(),
        ]);

        // ── 3. Call Emerald API ──────────────────────────────────────────
        try {
            $result = $this->emerald->createSubscriber(
                $user->toArray(),
                $mapping->emerald_service_type_id
            );

            if (empty($result['CustomerID'])) {
                throw new \RuntimeException('Emerald returned no CustomerID');
            }

            // ── 4. Store Emerald IDs ─────────────────────────────────────
            $user->update([
                'emerald_mbr_id'     => $result['CustomerID'],
                'emerald_account_id' => $result['AccountID'] ?? null,
            ]);

            // ── 5. Update sync timestamp ─────────────────────────────────
            $mapping->update(['last_synced_at' => now()]);

            Log::info('Emerald provisioning successful', [
                'user_id'     => $user->id,
                'customer_id' => $result['CustomerID'],
                'account_id'  => $result['AccountID'] ?? null,
                'service_type'=> $mapping->emerald_service_type_id,
                'mbr_is_mpesa_account' => true,
            ]);

            return ProvisionResult::success(
                (int) $result['CustomerID'],
                isset($result['AccountID']) ? (int) $result['AccountID'] : null
            );

        } catch (\Exception $e) {
            Log::error('Emerald provisioning failed', [
                'user_id'    => $user->id,
                'product_id' => $productId,
                'error'      => $e->getMessage(),
            ]);

            return ProvisionResult::failed($e->getMessage());
        }
    }

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
