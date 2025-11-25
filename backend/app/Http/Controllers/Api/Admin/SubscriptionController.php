<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(protected SubscriptionService $service) {}

    // GET /api/v1/admin/subscriptions
    public function index(Request $request)
    {
        $query = Subscription::with(['user', 'product', 'variant', 'coverageZone'])
            ->withCount('activeAddons');

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('billing_cycle')) {
            $query->where('billing_cycle', $request->billing_cycle);
        }
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('subscription_number', 'LIKE', "%{$q}%")
                   ->orWhereHas('user', fn ($u) => $u->where('email', 'LIKE', "%{$q}%")
                       ->orWhere('name', 'LIKE', "%{$q}%"));
            });
        }
        if ($request->filled('due_soon')) {
            $query->dueForRenewal((int) $request->due_soon);
        }

        return response()->json($query->latest()->paginate(25));
    }

    // GET /api/v1/admin/subscriptions/{id}
    public function show(Subscription $subscription)
    {
        return response()->json(
            $subscription->load([
                'user', 'product', 'variant', 'coverageZone',
                'activeAddons.addon', 'planChanges.toProduct',
                'statusHistory.changedBy', 'reminders',
                'pendingProduct', 'pendingVariant',
                'createdBy', 'managedBy',
            ])
        );
    }

    // POST /api/v1/admin/subscriptions
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'            => 'required|exists:users,id',
            'product_id'         => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'coverage_zone_id'   => 'nullable|exists:coverage_zones,id',
            'billing_cycle'      => 'required|in:monthly,quarterly,semi_annually,annually',
            'addon_ids'          => 'nullable|array',
            'addon_ids.*'        => 'exists:addons,id',
            'discount_amount'    => 'nullable|numeric|min:0',
            'setup_fee'          => 'nullable|numeric|min:0',
            'trial_days'         => 'nullable|integer|min:0',
            'auto_renew'         => 'boolean',
            'managed_by'         => 'nullable|exists:users,id',
            'internal_notes'     => 'nullable|string',
            'metadata'           => 'nullable|array',
        ]);

        $validated['created_by'] = auth()->id();
        $sub = $this->service->create($validated);

        return response()->json($sub->load('user', 'product'), 201);
    }

    // POST /api/v1/admin/subscriptions/{id}/activate
    public function activate(Subscription $subscription)
    {
        abort_if(!$subscription->isPending(), 422, 'Only pending subscriptions can be activated.');
        $subscription->activate();
        return response()->json(['message' => 'Activated.', 'subscription' => $subscription->fresh()]);
    }

    // POST /api/v1/admin/subscriptions/{id}/suspend
    public function suspend(Request $request, Subscription $subscription)
    {
        $request->validate(['reason' => 'required|string|max:255']);
        $subscription->suspend($request->reason);
        return response()->json(['message' => 'Suspended.', 'subscription' => $subscription->fresh()]);
    }

    // POST /api/v1/admin/subscriptions/{id}/reactivate
    public function reactivate(Subscription $subscription)
    {
        $subscription->reactivate(auth()->id());
        return response()->json(['message' => 'Reactivated.', 'subscription' => $subscription->fresh()]);
    }

    // POST /api/v1/admin/subscriptions/{id}/change-plan
    public function changePlan(Request $request, Subscription $subscription)
    {
        $request->validate([
            'to_product_id' => 'required|exists:products,id',
            'to_variant_id' => 'nullable|exists:product_variants,id',
            'billing_cycle' => 'required|in:monthly,quarterly,semi_annually,annually',
            'immediate'     => 'boolean',
            'notes'         => 'nullable|string',
        ]);

        $change = $subscription->changePlan(
            $request->to_product_id,
            $request->to_variant_id,
            $request->billing_cycle,
            $request->boolean('immediate', true),
            auth()->id()
        );

        if ($request->filled('notes')) {
            $change->update(['notes' => $request->notes]);
        }

        return response()->json([
            'message'      => 'Plan change applied.',
            'change'       => $change,
            'subscription' => $subscription->fresh()->load('product', 'variant'),
        ]);
    }

    // GET /api/v1/admin/subscriptions/analytics
    public function analytics(Request $request)
    {
        $from = $request->from ? now()->parse($request->from) : now()->subDays(30);
        $to   = $request->to   ? now()->parse($request->to)   : now();

        return response()->json([
            'summary' => [
                'total'              => Subscription::count(),
                'active'             => Subscription::where('status', 'active')->count(),
                'pending'            => Subscription::where('status', 'pending')->count(),
                'suspended'          => Subscription::where('status', 'suspended')->count(),
                'cancelled'          => Subscription::where('status', 'cancelled')->count(),
                'pending_cancellation' => Subscription::where('status', 'pending_cancellation')->count(),
                'trial'              => Subscription::where('status', 'trial')->count(),
            ],
            'mrr' => Subscription::where('status', 'active')
                ->selectRaw("
                    SUM(CASE
                        WHEN billing_cycle = 'monthly'       THEN total_amount
                        WHEN billing_cycle = 'quarterly'     THEN total_amount / 3
                        WHEN billing_cycle = 'semi_annually' THEN total_amount / 6
                        WHEN billing_cycle = 'annually'      THEN total_amount / 12
                        ELSE 0
                    END) as mrr
                ")->value('mrr'),

            'due_this_week'  => Subscription::dueForRenewal(7)->count(),
            'due_today'      => Subscription::dueForRenewal(0)->count(),
            'in_grace'       => Subscription::inGracePeriod()->count(),

            'by_billing_cycle' => Subscription::where('status', 'active')
                ->selectRaw('billing_cycle, count(*) as count, sum(total_amount) as revenue')
                ->groupBy('billing_cycle')
                ->get(),

            'by_product' => Subscription::where('status', 'active')
                ->selectRaw('product_id, count(*) as count')
                ->with('product:id,name')
                ->groupBy('product_id')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),

            'new_this_period' => Subscription::whereBetween('created_at', [$from, $to])->count(),

            'churn_this_period' => Subscription::where('status', 'cancelled')
                ->whereBetween('cancelled_at', [$from->toDateString(), $to->toDateString()])
                ->count(),

            'top_cancel_reasons' => Subscription::whereNotNull('cancel_reason')
                ->selectRaw('cancel_reason, count(*) as count')
                ->groupBy('cancel_reason')
                ->orderByDesc('count')
                ->get(),
        ]);
    }
}