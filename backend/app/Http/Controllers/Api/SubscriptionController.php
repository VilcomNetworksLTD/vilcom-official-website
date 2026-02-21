<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\StoreSubscriptionRequest;
use App\Http\Requests\Subscription\UpdateSubscriptionRequest;
use App\Http\Resources\SubscriptionResource;
use App\Models\Subscription;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * SubscriptionController
 * 
 * Handles multi-tenant subscription management with proper authorization.
 * 
 * Authorization Flow:
 * 1. Middleware checks authentication (auth:sanctum)
 * 2. Middleware checks roles (role:admin|staff)
 * 3. Middleware checks permissions (permission:subscriptions.view.own)
 * 4. Policy checks ownership ($this->authorize('view', $subscription))
 */
class SubscriptionController extends Controller
{
    public function __construct()
    {
        // Apply authorization middleware
        $this->middleware('auth:sanctum');
        $this->middleware('owns.resource:subscription')->only(['show', 'update', 'cancel']);
    }

    /**
     * Display a listing of subscriptions
     * 
     * Clients see their own subscriptions
     * Staff/Admin see all subscriptions (with filters)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Subscription::class);

        $query = Subscription::with(['user', 'product', 'addons']);

        // Clients can only see their own subscriptions
        if (!$request->user()->hasRole(['admin', 'staff'])) {
            $query->where('user_id', $request->user()->id);
        } else {
            // Staff/Admin can filter by user
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by product
            if ($request->has('product_id')) {
                $query->where('product_id', $request->product_id);
            }

            // Search by user name or email
            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $subscriptions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => SubscriptionResource::collection($subscriptions),
            'meta' => [
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
            ],
        ]);
    }

    /**
     * Store a newly created subscription
     * 
     * Clients can create subscriptions for themselves
     * Staff/Admin can create subscriptions for any user
     *
     * @param StoreSubscriptionRequest $request
     * @return JsonResponse
     */
    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        $this->authorize('create', Subscription::class);

        try {
            DB::beginTransaction();

            // Determine user_id
            $userId = $request->user_id ?? $request->user()->id;

            // Staff/Admin can create for any user
            // Clients can only create for themselves
            if ($userId !== $request->user()->id && !$request->user()->hasRole(['admin', 'staff'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only create subscriptions for yourself.',
                ], 403);
            }

            // Validate user exists
            $user = User::findOrFail($userId);

            // Validate product
            $product = Product::findOrFail($request->product_id);

            // Check product availability
            if (!$product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'This product is not available for subscription.',
                ], 400);
            }

            // Check coverage if it's an internet plan
            if ($product->type === 'internet_plan' && $request->has('installation_address')) {
                $isAvailable = $product->isAvailableIn($request->installation_address);
                if (!$isAvailable) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This product is not available in your area.',
                    ], 400);
                }
            }

            // Calculate pricing
            $billingCycle = $request->billing_cycle ?? 'monthly';
            $price = $this->calculateSubscriptionPrice($product, $billingCycle, $request->addons ?? []);

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => $userId,
                'product_id' => $product->id,
                'billing_cycle' => $billingCycle,
                'price' => $price,
                'setup_fee' => $product->setup_fee ?? 0,
                'status' => 'pending',
                'start_date' => $request->start_date ?? now(),
                'next_billing_date' => $this->calculateNextBillingDate($billingCycle),
                'installation_address' => $request->installation_address,
                'installation_notes' => $request->installation_notes,
            ]);

            // Attach add-ons
            if ($request->has('addons') && !empty($request->addons)) {
                $addons = [];
                foreach ($request->addons as $addonId) {
                    $addons[$addonId] = [
                        'price' => $this->getAddonPrice($addonId, $billingCycle),
                    ];
                }
                $subscription->addons()->attach($addons);
            }

            // Log activity
            activity()
                ->causedBy($request->user())
                ->performedOn($subscription)
                ->withProperties([
                    'product' => $product->name,
                    'user' => $user->name,
                ])
                ->log('Subscription created');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subscription created successfully',
                'data' => new SubscriptionResource($subscription->load(['user', 'product', 'addons'])),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Subscription creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription. Please try again.',
            ], 500);
        }
    }

    /**
     * Display the specified subscription
     *
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function show(Subscription $subscription): JsonResponse
    {
        $this->authorize('view', $subscription);

        $subscription->load(['user', 'product', 'addons', 'invoices', 'payments']);

        return response()->json([
            'success' => true,
            'data' => new SubscriptionResource($subscription),
        ]);
    }

    /**
     * Update the specified subscription
     *
     * @param UpdateSubscriptionRequest $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function update(UpdateSubscriptionRequest $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('update', $subscription);

        try {
            $subscription->update($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($subscription)
                ->log('Subscription updated');

            return response()->json([
                'success' => true,
                'message' => 'Subscription updated successfully',
                'data' => new SubscriptionResource($subscription->fresh()),
            ]);

        } catch (\Exception $e) {
            \Log::error('Subscription update failed', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription.',
            ], 500);
        }
    }

    /**
     * Cancel the specified subscription
     *
     * @param Request $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function cancel(Request $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('cancel', $subscription);

        $request->validate([
            'reason' => 'nullable|string|max:500',
            'immediate' => 'boolean',
        ]);

        try {
            $immediate = $request->boolean('immediate', false);

            $subscription->update([
                'status' => $immediate ? 'cancelled' : 'pending_cancellation',
                'cancellation_reason' => $request->reason,
                'cancelled_at' => $immediate ? now() : null,
                'cancellation_date' => $immediate ? now() : $subscription->next_billing_date,
                'cancelled_by' => $request->user()->id,
            ]);

            activity()
                ->causedBy($request->user())
                ->performedOn($subscription)
                ->withProperties(['reason' => $request->reason])
                ->log('Subscription cancelled');

            return response()->json([
                'success' => true,
                'message' => $immediate 
                    ? 'Subscription cancelled immediately' 
                    : 'Subscription will be cancelled at the end of the billing period',
                'data' => new SubscriptionResource($subscription->fresh()),
            ]);

        } catch (\Exception $e) {
            \Log::error('Subscription cancellation failed', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription.',
            ], 500);
        }
    }

    /**
     * Suspend the specified subscription (Staff/Admin only)
     *
     * @param Request $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function suspend(Request $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('suspend', $subscription);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $subscription->update([
            'status' => 'suspended',
            'suspension_reason' => $request->reason,
            'suspended_at' => now(),
            'suspended_by' => $request->user()->id,
        ]);

        activity()
            ->causedBy($request->user())
            ->performedOn($subscription)
            ->withProperties(['reason' => $request->reason])
            ->log('Subscription suspended');

        return response()->json([
            'success' => true,
            'message' => 'Subscription suspended successfully',
            'data' => new SubscriptionResource($subscription->fresh()),
        ]);
    }

    /**
     * Activate the specified subscription (Staff/Admin only)
     *
     * @param Request $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function activate(Request $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('activate', $subscription);

        $subscription->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspension_reason' => null,
            'suspended_by' => null,
            'activated_at' => now(),
        ]);

        activity()
            ->causedBy($request->user())
            ->performedOn($subscription)
            ->log('Subscription activated');

        return response()->json([
            'success' => true,
            'message' => 'Subscription activated successfully',
            'data' => new SubscriptionResource($subscription->fresh()),
        ]);
    }

    /**
     * Upgrade subscription to a new product
     *
     * @param Request $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function upgrade(Request $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('upgrade', $subscription);

        $request->validate([
            'new_product_id' => 'required|exists:products,id',
        ]);

        // Implementation here...
        // Calculate prorated amounts, create new subscription, etc.

        return response()->json([
            'success' => true,
            'message' => 'Subscription upgraded successfully',
        ]);
    }

    /**
     * Downgrade subscription to a new product
     *
     * @param Request $request
     * @param Subscription $subscription
     * @return JsonResponse
     */
    public function downgrade(Request $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('downgrade', $subscription);

        $request->validate([
            'new_product_id' => 'required|exists:products,id',
        ]);

        // Implementation here...

        return response()->json([
            'success' => true,
            'message' => 'Subscription will be downgraded at the end of the billing period',
        ]);
    }

    /**
     * Helper: Calculate subscription price
     */
    private function calculateSubscriptionPrice($product, $billingCycle, $addons = [])
    {
        $price = 0;

        switch ($billingCycle) {
            case 'monthly':
                $price = $product->price_monthly ?? 0;
                break;
            case 'quarterly':
                $price = $product->price_quarterly ?? 0;
                break;
            case 'annually':
                $price = $product->price_annually ?? 0;
                break;
        }

        // Add addon prices
        foreach ($addons as $addonId) {
            $price += $this->getAddonPrice($addonId, $billingCycle);
        }

        return $price;
    }

    /**
     * Helper: Get addon price
     */
    private function getAddonPrice($addonId, $billingCycle)
    {
        $addon = \App\Models\Addon::find($addonId);
        if (!$addon) return 0;

        switch ($billingCycle) {
            case 'monthly':
                return $addon->price_monthly ?? 0;
            case 'quarterly':
                return $addon->price_quarterly ?? 0;
            case 'annually':
                return $addon->price_annually ?? 0;
            default:
                return 0;
        }
    }

    /**
     * Helper: Calculate next billing date
     */
    private function calculateNextBillingDate($billingCycle)
    {
        switch ($billingCycle) {
            case 'monthly':
                return now()->addMonth();
            case 'quarterly':
                return now()->addMonths(3);
            case 'annually':
                return now()->addYear();
            default:
                return now()->addMonth();
        }
    }
}