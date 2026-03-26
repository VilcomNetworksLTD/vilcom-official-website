<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Addon\StoreAddonRequest;
use App\Http\Requests\Addon\UpdateAddonRequest;
use App\Http\Resources\AddonResource;
use App\Models\Addon;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AddonController extends Controller
{
    /**
     * Display a listing of addons (PUBLIC)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Addon::query();

        // Only show active for public
        if (!auth()->check() || !auth()->user()->hasRole(['admin', 'staff'])) {
            $query->active();
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by applicable product type
        if ($request->has('applicable_to')) {
            $query->applicableTo($request->applicable_to);
        }

        // Filter recurring/one-time
        if ($request->has('is_recurring')) {
            if ($request->boolean('is_recurring')) {
                $query->recurring();
            } else {
                $query->oneTime();
            }
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        
        if ($perPage === 'all') {
            $addons = $query->get();
            return response()->json([
                'success' => true,
                'data' => AddonResource::collection($addons),
            ]);
        }

        $addons = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => AddonResource::collection($addons),
            'meta' => [
                'current_page' => $addons->currentPage(),
                'last_page' => $addons->lastPage(),
                'per_page' => $addons->perPage(),
                'total' => $addons->total(),
            ],
        ]);
    }

    /**
     * Store a newly created addon (ADMIN/STAFF)
     */
    public function store(StoreAddonRequest $request): JsonResponse
    {
        $this->authorize('products.create');

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('addons', 'public');
        }

        $addon = Addon::create($data);

        UserActivity::log(
            auth()->user(),
            'addon_created',
            'Addon created',
            $addon,
            null,
            $addon->toArray(),
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Addon created successfully',
            'data' => new AddonResource($addon),
        ], 201);
    }

    /**
     * Display the specified addon (PUBLIC)
     */
    public function show(string $slug): JsonResponse
    {
        $addon = Addon::where('slug', $slug)->firstOrFail();

        if (!auth()->check() || !auth()->user()->hasRole(['admin', 'staff'])) {
            if (!$addon->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Addon not found',
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new AddonResource($addon),
        ]);
    }

    /**
     * Update the specified addon (ADMIN/STAFF)
     */
    public function update(UpdateAddonRequest $request, Addon $addon): JsonResponse
    {
        $this->authorize('products.edit');

        $data = $request->validated();

        if (isset($data['name']) && $data['name'] !== $addon->name) {
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        }

        if ($request->hasFile('image')) {
            if ($addon->image) {
                \Storage::disk('public')->delete($addon->image);
            }
            $data['image'] = $request->file('image')->store('addons', 'public');
        }

        $addon->update($data);

        UserActivity::log(
            auth()->user(),
            'addon_updated',
            'Addon updated',
            $addon,
            null,
            $addon->fresh()->toArray(),
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Addon updated successfully',
            'data' => new AddonResource($addon->fresh()),
        ]);
    }

    /**
     * Remove the specified addon (ADMIN)
     */
    public function destroy(Addon $addon): JsonResponse
    {
        $this->authorize('products.delete');

        if ($addon->image) {
            \Storage::disk('public')->delete($addon->image);
        }

        UserActivity::log(
            auth()->user(),
            'addon_deleted',
            'Addon deleted',
            $addon,
            null,
            null,
            request()
        );

        $addon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Addon deleted successfully',
        ]);
    }

    /**
     * Get addons for a specific product (PUBLIC)
     */
    public function forProduct(Request $request, int $productId): JsonResponse
    {
        $product = \App\Models\Product::findOrFail($productId);
        
        $addons = $product->addons()
            ->active()
            ->orderBy('product_addon.sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => AddonResource::collection($addons),
        ]);
    }
}

