<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionAddon;
use App\Models\SubscriptionReminder;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Addon;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    // ─── Create ──────────────────────────────────────────────────────────────

    /**
     * Create a brand-new subscription.
     *
     * @param  array{
     *   user_id: int,
     *   product_id: int,
     *   product_variant_id?: int|null,
     *   coverage_zone_id?: int|null,
     *   billing_cycle: string,
     *   addon_ids?: array<int>,
     *   setup_fee?: float,
     *   discount_amount?: float,
     *   trial_days?: int,
     *   auto_renew?: bool,
     *   created_by?: int,
     *   managed_by?: int,
     *   metadata?: array,
     * } $data
     */
    public function create(array $data): Subscription
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);
            $variant = isset($data['product_variant_id'])
                ? ProductVariant::find($data['product_variant_id'])
                : null;

            $cycle     = $data['billing_cycle'];
            $basePrice = $this->resolvePrice($product, $variant, $cycle);
            $setupFee  = $data['setup_fee'] ?? ($variant?->setup_fee ?? $product->setup_fee ?? 0);
            $discount  = $data['discount_amount'] ?? 0;

            // Compute addon totals
            $addonIds    = $data['addon_ids'] ?? [];
            $addonsTotal = $this->computeAddonsTotal($addonIds, $cycle);

            // Trial or live?
            $trialDays   = $data['trial_days'] ?? 0;
            $isTrial     = $trialDays > 0;
            $periodStart = now()->toDateString();
            $periodEnd   = $isTrial
                ? now()->addDays($trialDays)->subDay()->toDateString()
                : $this->nextPeriodEnd(now(), $cycle);

            $subscription = Subscription::create([
                'user_id'              => $data['user_id'],
                'product_id'           => $product->id,
                'product_variant_id'   => $variant?->id,
                'coverage_zone_id'     => $data['coverage_zone_id'] ?? null,
                'billing_cycle'        => $cycle,
                'base_price'           => $basePrice,
                'addons_total'         => $addonsTotal,
                'discount_amount'      => $discount,
                'setup_fee'            => $setupFee,
                'total_amount'         => $basePrice + $addonsTotal - $discount,
                'currency'             => 'KES',
                'status'               => $isTrial ? 'trial' : 'pending',
                'is_trial'             => $isTrial,
                'trial_days'           => $trialDays,
                'trial_ends_at'        => $isTrial ? now()->addDays($trialDays)->toDateString() : null,
                'current_period_start' => $periodStart,
                'current_period_end'   => $periodEnd,
                'next_renewal_at'      => $periodEnd,
                'auto_renew'           => $data['auto_renew'] ?? true,
                'created_by'           => $data['created_by'] ?? auth()->id(),
                'managed_by'           => $data['managed_by'] ?? null,
                'metadata'             => $data['metadata'] ?? null,
            ]);

            // Attach add-ons
            if ($addonIds) {
                $this->attachAddons($subscription, $addonIds);
            }

            // Schedule welcome / first reminder
            $this->scheduleReminder($subscription, 'renewal_upcoming', now()->subDay()); // fire "soon"

            \App\Events\SubscriptionCreated::dispatch($subscription);

            return $subscription;
        });
    }

    // ─── Renewal ─────────────────────────────────────────────────────────────

    /**
     * Process renewals for all subscriptions due today.
     * Designed to be called by a daily scheduled command.
     */
    public function processRenewals(): array
    {
        $results = ['renewed' => [], 'failed' => [], 'cancelled' => []];

        // Subscriptions ending today or already overdue
        $due = Subscription::where('status', 'active')
            ->where('auto_renew', true)
            ->where('current_period_end', '<=', now()->toDateString())
            ->with('user', 'product')
            ->get();

        foreach ($due as $sub) {
            try {
                DB::transaction(function () use ($sub, &$results) {
                    // Check for pending cancellation
                    if ($sub->cancel_at_period_end) {
                        $sub->update([
                            'status'       => 'cancelled',
                            'cancelled_at' => now()->toDateString(),
                        ]);
                        $this->scheduleReminder($sub, 'cancellation_confirmed');
                        $results['cancelled'][] = $sub->subscription_number;
                        return;
                    }

                    // Attempt renewal (invoice generation happens in InvoiceService)
                    $sub->renew();
                    $this->scheduleRenewalReminders($sub);
                    $results['renewed'][] = $sub->subscription_number;
                });
            } catch (\Exception $e) {
                Log::error("Renewal failed for {$sub->subscription_number}: " . $e->getMessage());
                $results['failed'][] = $sub->subscription_number;
            }
        }

        return $results;
    }

    // ─── Suspension & Grace ───────────────────────────────────────────────────

    /**
     * Suspend subscriptions that have missed payment and grace period has expired.
     */
    public function processExpiredGrace(): void
    {
        Subscription::expiredGrace()->each(function (Subscription $sub) {
            $sub->update(['status' => 'expired']);
            $this->scheduleReminder($sub, 'suspended');
        });
    }

    // ─── Add-ons Management ───────────────────────────────────────────────────

    public function addAddon(Subscription $sub, int $addonId, int $quantity = 1): SubscriptionAddon
    {
        return DB::transaction(function () use ($sub, $addonId, $quantity) {
            $addon     = Addon::findOrFail($addonId);
            $unitPrice = $this->resolveAddonPrice($addon, $sub->billing_cycle);
            $total     = round($unitPrice * $quantity, 2);

            $sa = SubscriptionAddon::create([
                'subscription_id' => $sub->id,
                'addon_id'        => $addonId,
                'quantity'        => $quantity,
                'unit_price'      => $unitPrice,
                'total_price'     => $total,
                'billing_cycle'   => $sub->billing_cycle,
                'status'          => 'active',
                'added_at'        => now()->toDateString(),
            ]);

            // Update subscription totals
            $newAddonTotal = $sub->activeAddons()->sum('total_price');
            $sub->update([
                'addons_total' => $newAddonTotal,
                'total_amount' => $sub->base_price + $newAddonTotal - $sub->discount_amount,
            ]);

            return $sa;
        });
    }

    // ─── Proration Preview ────────────────────────────────────────────────────

    /**
     * Calculate proration without applying it — used by frontend preview.
     */
    public function previewProration(
        Subscription $sub,
        int $toProductId,
        ?int $toVariantId,
        string $newCycle
    ): array {
        $toProduct = Product::findOrFail($toProductId);
        $toVariant = $toVariantId ? ProductVariant::find($toVariantId) : null;
        $toPrice   = $this->resolvePrice($toProduct, $toVariant, $newCycle);

        $proration  = $sub->calculateProration($toPrice, $newCycle);
        $changeType = $sub->changePlan(...[]); // dry-run classify only

        return [
            'current_plan'      => $sub->product->name,
            'new_plan'          => $toProduct->name,
            'current_price'     => $sub->base_price,
            'new_price'         => $toPrice,
            'days_remaining'    => $proration['days_remaining'],
            'days_in_cycle'     => $proration['days_in_cycle'],
            'credit_amount'     => $proration['credit'],
            'charge_amount'     => $proration['charge'],
            'net_amount'        => $proration['net'],  // positive = customer pays; negative = credit
            'net_label'         => $proration['net'] >= 0 ? 'Amount Due' : 'Credit Applied',
            'effective_date'    => now()->toDateString(),
            'next_renewal_date' => $sub->computeNextPeriodEnd(now(), $newCycle),
        ];
    }

    // ─── Reminders ────────────────────────────────────────────────────────────

    /**
     * Schedule all renewal reminders for a freshly-renewed subscription.
     */
    public function scheduleRenewalReminders(Subscription $sub): void
    {
        $reminderDays = [7, 3, 1]; // Days before renewal to remind

        foreach ($reminderDays as $daysBefore) {
            $scheduledAt = Carbon::parse($sub->current_period_end)
                ->subDays($daysBefore)
                ->setTime(8, 0); // 8am

            if ($scheduledAt->isFuture()) {
                $this->scheduleReminder($sub, 'renewal_upcoming', $scheduledAt);
            }
        }
    }

    /**
     * Check and fire any due reminders — call from scheduler.
     */
    public function processDueReminders(): void
    {
        SubscriptionReminder::where('status', 'pending')
            ->where('scheduled_at', '<=', now())
            ->with('subscription.user')
            ->each(function (SubscriptionReminder $reminder) {
                try {
                    // Dispatch notification — wire to your Notification classes
                    // Notification::send($reminder->user, new SubscriptionReminderNotification($reminder));
                    $reminder->update(['status' => 'sent', 'sent_at' => now()]);
                } catch (\Exception $e) {
                    $reminder->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                }
            });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function resolvePrice(Product $product, ?ProductVariant $variant, string $cycle): float
    {
        $field = "price_{$cycle}";
        return (float) ($variant?->$field ?? $product->$field ?? $product->price_monthly ?? 0);
    }

    private function resolveAddonPrice(Addon $addon, string $cycle): float
    {
        $field = "price_{$cycle}";
        return (float) ($addon->$field ?? $addon->price_monthly ?? $addon->price_one_time ?? 0);
    }

    private function computeAddonsTotal(array $addonIds, string $cycle): float
    {
        if (empty($addonIds)) return 0.0;
        return Addon::whereIn('id', $addonIds)->get()
            ->sum(fn ($addon) => $this->resolveAddonPrice($addon, $cycle));
    }

    private function attachAddons(Subscription $sub, array $addonIds): void
    {
        foreach ($addonIds as $addonId) {
            $this->addAddon($sub, $addonId);
        }
    }

    private function nextPeriodEnd(Carbon $from, string $cycle): string
    {
        return $sub = (new Subscription)->computeNextPeriodEnd($from, $cycle);
    }

    private function scheduleReminder(
        Subscription $sub,
        string $type,
        ?Carbon $scheduledAt = null
    ): void {
        SubscriptionReminder::create([
            'subscription_id' => $sub->id,
            'user_id'         => $sub->user_id,
            'type'            => $type,
            'channel'         => 'email',
            'status'          => 'pending',
            'scheduled_at'    => $scheduledAt ?? now(),
        ]);
    }
}

