<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;
use App\Models\Product;
use App\Models\Category;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products (PUBLIC)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants']);

        // Only show active for public
        if (!auth()->check() || !auth()->user()->hasRole(['admin', 'staff'])) {
            $query->active();
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('category_slug')) {
            $category = Category::where('slug', $request->category_slug)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by plan category (home/business)
        if ($request->has('plan_category')) {
            $query->planCategory($request->plan_category);
        }

        // Filter by speed (for internet plans)
        if ($request->has('speed')) {
            $query->bySpeed($request->speed);
        }

        // Filter featured products
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Filter promotional products
        if ($request->boolean('on_promotion')) {
            $query->onPromotion();
        }

        // Filter by coverage area
        if ($request->has('coverage_area')) {
            $query->availableIn($request->coverage_area);
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price_monthly', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price_monthly', '<=', $request->max_price);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');

        $validSortFields = ['name', 'price_monthly', 'speed_mbps', 'created_at', 'sort_order'];
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        // Pagination
        $perPage = $request->get('per_page', 12);

        if ($perPage === 'all') {
            $products = $query->get();
            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products),
            ]);
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Store a newly created product (ADMIN/STAFF)
     *
     * @param StoreProductRequest $request
     * @return JsonResponse
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('products.create');

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        // Auto-publish non-fibre services/products
        if (isset($data['type']) && $data['type'] !== 'internet_plan') {
            $data['is_active'] = true;
            $data['is_featured'] = true;
            \Log::info('Auto-published non-fibre product', ['type' => $data['type'], 'name' => $data['name']]);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Handle gallery
        if ($request->hasFile('gallery')) {
            $gallery = [];
            foreach ($request->file('gallery') as $file) {
                $gallery[] = $file->store('products/gallery', 'public');
            }
            $data['gallery'] = $gallery;
        }

        $product = Product::create($data);

        // Attach addons if provided
        if ($request->has('addons')) {
            $addons = [];
            foreach ($request->addons as $addon) {
                $addons[$addon['id']] = [
                    'custom_price' => $addon['custom_price'] ?? null,
                    'discount_percent' => $addon['discount_percent'] ?? null,
                    'is_required' => $addon['is_required'] ?? false,
                    'is_default' => $addon['is_default'] ?? false,
                    'sort_order' => $addon['sort_order'] ?? 0,
                ];
            }
            $product->addons()->attach($addons);
        }

        UserActivity::log(
            auth()->user(),
            'product_created',
            'Product created',
            $product,
            null,
            $product->toArray(),
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => new ProductResource($product->load(['category', 'variants', 'addons'])),
        ], 201);
    }

    /**
     * Display the specified product (PUBLIC)
     *
     * @param string $slug
     * @return JsonResponse
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->with(['category', 'variants', 'addons'])
            ->firstOrFail();

        // Check if active for public
        if (!auth()->check() || !auth()->user()->hasRole(['admin', 'staff'])) {
            if (!$product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Update the specified product (ADMIN/STAFF)
     *
     * @param UpdateProductRequest $request
     * @param Product $product
     * @return JsonResponse
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('products.edit');

        $data = $request->validated();

        // Update slug if name changed
        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                \Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Handle gallery
        if ($request->hasFile('gallery')) {
            // Delete old gallery
            if ($product->gallery) {
                foreach ($product->gallery as $image) {
                    \Storage::disk('public')->delete($image);
                }
            }

            $gallery = [];
            foreach ($request->file('gallery') as $file) {
                $gallery[] = $file->store('products/gallery', 'public');
            }
            $data['gallery'] = $gallery;
        }

        $product->update($data);

        // Update addons if provided
        if ($request->has('addons')) {
            $addons = [];
            foreach ($request->addons as $addon) {
                $addons[$addon['id']] = [
                    'custom_price' => $addon['custom_price'] ?? null,
                    'discount_percent' => $addon['discount_percent'] ?? null,
                    'is_required' => $addon['is_required'] ?? false,
                    'is_default' => $addon['is_default'] ?? false,
                    'sort_order' => $addon['sort_order'] ?? 0,
                ];
            }
            $product->addons()->sync($addons);
        }

        UserActivity::log(
            auth()->user(),
            'product_updated',
            'Product updated',
            $product,
            null,
            $product->fresh()->toArray(),
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product->fresh()->load(['category', 'variants', 'addons'])),
        ]);
    }

    /**
     * Remove the specified product (ADMIN)
     *
     * @param Product $product
     * @return JsonResponse
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('products.delete');

        // Check if product has active subscriptions
        if ($product->activeSubscriptions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete product with active subscriptions.',
            ], 422);
        }

        // Delete images
        if ($product->image) {
            \Storage::disk('public')->delete($product->image);
        }

        if ($product->gallery) {
            foreach ($product->gallery as $image) {
                \Storage::disk('public')->delete($image);
            }
        }

        UserActivity::log(
            auth()->user(),
            'product_deleted',
            'Product deleted',
            $product,
            null,
            null,
            request()
        );

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Get products by category (PUBLIC)
     *
     * @param Request $request
     * @param string $categorySlug
     * @return JsonResponse
     */
    public function byCategory(Request $request, string $categorySlug): JsonResponse
    {
        $category = Category::where('slug', $categorySlug)->firstOrFail();

        $request->merge(['category_id' => $category->id]);

        return $this->index($request);
    }

    /**
     * Get featured products (PUBLIC)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 6);

        $products = Product::active()
            ->featured()
            ->with(['category'])
            ->orderBy('sort_order')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * Get promotional products (PUBLIC)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function onPromotion(Request $request): JsonResponse
    {
        $products = Product::active()
            ->onPromotion()
            ->with(['category'])
            ->orderBy('sort_order')
            ->paginate($request->get('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Check product availability in area (PUBLIC)
     *
     * @param Request $request
     * @param Product $product
     * @return JsonResponse
     */
    public function checkAvailability(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'area' => 'required|string',
        ]);

        $isAvailable = $product->isAvailableIn($request->area);
        $hasCapacity = $product->hasAvailableCapacity();
        $inStock = $product->isInStock();

        $available = $isAvailable && $hasCapacity && $inStock;

        return response()->json([
            'success' => true,
            'data' => [
                'available' => $available,
                'coverage_available' => $isAvailable,
                'has_capacity' => $hasCapacity,
                'in_stock' => $inStock,
                'message' => $available
                    ? 'Product is available in your area'
                    : 'Product is not currently available in your area',
            ],
        ]);
    }

    /**
     * Get related products (PUBLIC)
     *
     * @param Product $product
     * @return JsonResponse
     */
    public function related(Product $product): JsonResponse
    {
        $related = Product::active()
            ->where('id', '!=', $product->id)
            ->where(function($query) use ($product) {
                $query->where('category_id', $product->category_id)
                      ->orWhere('type', $product->type);
            })
            ->inStock()
            ->hasCapacity()
            ->take(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($related),
        ]);
    }
}

