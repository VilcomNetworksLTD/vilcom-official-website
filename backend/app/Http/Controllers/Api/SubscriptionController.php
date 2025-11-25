<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(protected SubscriptionService $service) {}

    // GET /api/v1/subscriptions
    public function index(Request $request)
    {
        $subs = Subscription::where('user_id', auth()->id())
            ->with(['product', 'variant', 'activeAddons.addon', 'coverageZone'])
            ->latest()
            ->paginate(10);

        return response()->json($subs);
    }

    // GET /api/v1/subscriptions/{id}
    public function show(Subscription $subscription)
    {
        $this->authorize('view', $subscription);

        return response()->json(
            $subscription->load([
                'product', 'variant', 'coverageZone',
                'activeAddons.addon',
                'planChanges.toProduct',
                'statusHistory',
                'reminders',
            ])
        );
    }

    // POST /api/v1/subscriptions
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'         => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'coverage_zone_id'   => 'nullable|exists:coverage_zones,id',
            'billing_cycle'      => 'required|in:monthly,quarterly,semi_annually,annually',
            'addon_ids'          => 'nullable|array',
            'addon_ids.*'        => 'exists:addons,id',
            'auto_renew'         => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();

        $subscription = $this->service->create($validated);

        return response()->json([
            'message'      => 'Subscription created successfully.',
            'subscription' => $subscription->load('product', 'activeAddons.addon'),
        ], 201);
    }

    // GET /api/v1/subscriptions/{id}/proration-preview
    public function prorationPreview(Request $request, Subscription $subscription)
    {
        $this->authorize('view', $subscription);

        $request->validate([
            'to_product_id'   => 'required|exists:products,id',
            'to_variant_id'   => 'nullable|exists:product_variants,id',
            'billing_cycle'   => 'required|in:monthly,quarterly,semi_annually,annually',
        ]);

        $preview = $this->service->previewProration(
            $subscription,
            $request->to_product_id,
            $request->to_variant_id,
            $request->billing_cycle
        );

        return response()->json($preview);
    }

    // POST /api/v1/subscriptions/{id}/change-plan
    public function changePlan(Request $request, Subscription $subscription)
    {
        $this->authorize('update', $subscription);

        $request->validate([
            'to_product_id'   => 'required|exists:products,id',
            'to_variant_id'   => 'nullable|exists:product_variants,id',
            'billing_cycle'   => 'required|in:monthly,quarterly,semi_annually,annually',
            'immediate'       => 'boolean',
        ]);

        abort_if(!$subscription->isActive(), 422, 'Only active subscriptions can be changed.');

        $change = $subscription->changePlan(
            $request->to_product_id,
            $request->to_variant_id,
            $request->billing_cycle,
            $request->boolean('immediate', true),
            auth()->id()
        );

        return response()->json([
            'message' => $request->boolean('immediate')
                ? 'Plan changed immediately. Proration applied.'
                : 'Plan change queued for next billing cycle.',
            'change'       => $change,
            'subscription' => $subscription->fresh()->load('product', 'variant'),
        ]);
    }

    // POST /api/v1/subscriptions/{id}/cancel
    public function cancel(Request $request, Subscription $subscription)
    {
        $this->authorize('update', $subscription);

        $request->validate([
            'reason'         => 'required|in:too_expensive,switching_provider,no_longer_needed,poor_service,moving_area,other',
            'notes'          => 'nullable|string|max:500',
            'at_period_end'  => 'boolean',
        ]);

        abort_if($subscription->isCancelled(), 422, 'Subscription is already cancelled.');

        $subscription->cancel(
            $request->reason,
            $request->notes ?? '',
            $request->boolean('at_period_end', true),
            auth()->id()
        );

        return response()->json([
            'message'      => $request->boolean('at_period_end', true)
                ? "Subscription will cancel on {$subscription->current_period_end->format('M j, Y')}."
                : 'Subscription cancelled immediately.',
            'subscription' => $subscription->fresh(),
        ]);
    }

    // POST /api/v1/subscriptions/{id}/reactivate
    public function reactivate(Subscription $subscription)
    {
        $this->authorize('update', $subscription);

        abort_if(
            !in_array($subscription->status, ['suspended', 'pending_cancellation', 'cancelled']),
            422,
            'This subscription cannot be reactivated.'
        );

        $subscription->reactivate(auth()->id());

        return response()->json([
            'message'      => 'Subscription reactivated successfully.',
            'subscription' => $subscription->fresh()->load('product', 'variant'),
        ]);
    }

    // POST /api/v1/subscriptions/{id}/addons
    public function addAddon(Request $request, Subscription $subscription)
    {
        $this->authorize('update', $subscription);

        $request->validate([
            'addon_id' => 'required|exists:addons,id',
            'quantity' => 'integer|min:1|max:10',
        ]);

        $sa = $this->service->addAddon(
            $subscription,
            $request->addon_id,
            $request->integer('quantity', 1)
        );

        return response()->json([
            'message'          => 'Add-on added successfully.',
            'subscription_addon' => $sa->load('addon'),
            'new_total'        => $subscription->fresh()->total_amount,
        ], 201);
    }

    // DELETE /api/v1/subscriptions/{id}/addons/{addonId}
    public function removeAddon(Subscription $subscription, int $addonId)
    {
        $this->authorize('update', $subscription);

        $sa = $subscription->activeAddons()->where('addon_id', $addonId)->firstOrFail();
        $sa->cancel();

        return response()->json([
            'message'   => 'Add-on removed.',
            'new_total' => $subscription->fresh()->total_amount,
        ]);
    }
}