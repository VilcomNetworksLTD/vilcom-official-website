<?php
// app/Services/EmeraldBillingOrchestrator.php

namespace App\Services;

use App\Models\EmeraldProductMapping;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class EmeraldBillingOrchestrator
{
    public function __construct(
        protected EmeraldService $emerald
    ) {}

    /**
     * Full provisioning flow after signup.
     * Called from RegisterController.
     */
    public function provisionNewSubscriber(User $user, int $productId): ProvisionResult
    {
        // 1. Find the mapping
        $mapping = EmeraldProductMapping::where('product_id', $productId)
            ->where('is_active', true)
            ->where('auto_provision', true)
            ->first();

        if (!$mapping) {
            Log::warning('No Emerald mapping found for product', [
                'product_id' => $productId,
                'user_id'    => $user->id,
            ]);
            return ProvisionResult::skipped('No Emerald mapping configured');
        }

        // 2. Override category/cycle if mapping has specifics
        if ($mapping->billing_cycle_id) {
            config(['emerald.billing_cycle_id' => $mapping->billing_cycle_id]);
        }
        if ($mapping->pay_period_id) {
            config(['emerald.pay_period_id' => $mapping->pay_period_id]);
        }
        config(['emerald.service_category_id' => $mapping->emerald_service_category_id]);

        // 3. Call Emerald API
        try {
            $result = $this->emerald->createSubscriber(
                $user->toArray(),
                $mapping->emerald_service_type_id
            );

            if (empty($result['CustomerID'])) {
                throw new \RuntimeException('Emerald returned no CustomerID');
            }

            // 4. Store Emerald IDs on user
            $user->update([
                'emerald_mbr_id'     => $result['CustomerID'],
                'emerald_account_id' => $result['AccountID'] ?? null,
            ]);

            // 5. Update mapping sync time
            $mapping->update(['last_synced_at' => now()]);

            Log::info('Emerald provisioning successful', [
                'user_id'     => $user->id,
                'customer_id' => $result['CustomerID'],
                'account_id'  => $result['AccountID'] ?? null,
                'service_type'=> $mapping->emerald_service_type_id,
            ]);

            return ProvisionResult::success(
                $result['CustomerID'],
                $result['AccountID'] ?? null
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

    /**
     * Process payment and post to Emerald.
     * Called from MpesaController webhook.
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

    /**
     * Suspend a subscriber's service.
     */
    public function suspendSubscriber(User $user): bool
    {
        if (!$user->emerald_account_id) return false;

        try {
            $this->emerald->suspendService($user->emerald_account_id);
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
     * Reactivate a subscriber's service.
     */
    public function activateSubscriber(User $user): bool
    {
        if (!$user->emerald_account_id) return false;

        try {
            $this->emerald->activateService($user->emerald_account_id);
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


/**
 * Value object for provisioning results.
 * Clean, no exceptions leaking into controllers.
 */
class ProvisionResult
{
    private function __construct(
        public readonly string  $status,   // success | failed | skipped
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
