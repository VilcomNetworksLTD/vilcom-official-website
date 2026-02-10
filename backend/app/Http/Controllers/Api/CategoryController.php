<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategoryCollection;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories (PUBLIC)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        // Apply filters
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->boolean('in_menu')) {
            $query->inMenu();
        }

        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null' || $request->parent_id === null) {
                $query->roots();
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Only show active for public
        if (!auth()->check() || !auth()->user()->hasRole(['admin', 'staff'])) {
            $query->active();
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
        
        if ($sortBy === 'name') {
            $query->orderBy('name', $sortOrder);
        } else {
            $query->defaultOrder(); // Nested set default order
        }

        // Return tree structure or flat list
        if ($request->boolean('tree')) {
            $categories = $query->get()->toTree();
            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($categories),
            ]);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        
        if ($perPage === 'all') {
            $categories = $query->get();
            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($categories),
            ]);
        }

        $categories = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => new CategoryCollection($categories),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    /**
     * Store a newly created category (ADMIN/STAFF)
     *
     * @param StoreCategoryRequest $request
     * @return JsonResponse
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('categories.create');

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        // Handle parent category
        if ($request->parent_id) {
            $parent = Category::findOrFail($request->parent_id);
            $category = $parent->children()->create($data);
        } else {
            $category = Category::create($data);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $category->update(['image' => $path]);
        }

        // Handle banner upload
        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('categories/banners', 'public');
            $category->update(['banner' => $path]);
        }

        activity()
            ->causedBy(auth()->user())
            ->performedOn($category)
            ->log('Category created');

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => new CategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified category (PUBLIC)
     *
     * @param string $slug
     * @return JsonResponse
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        // Check if active for public
        if (!auth()->check() || !auth()->user()->hasRole(['admin', 'staff'])) {
            if (!$category->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found',
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category->load([
                'children' => function($query) {
                    $query->active()->defaultOrder();
                },
                'products' => function($query) {
                    $query->active()->take(10);
                }
            ])),
        ]);
    }

    /**
     * Update the specified category (ADMIN/STAFF)
     *
     * @param UpdateCategoryRequest $request
     * @param Category $category
     * @return JsonResponse
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $this->authorize('categories.edit');

        $data = $request->validated();

        // Update slug if name changed
        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        }

        // Handle parent change
        if ($request->has('parent_id') && $request->parent_id != $category->parent_id) {
            if ($request->parent_id) {
                $parent = Category::findOrFail($request->parent_id);
                
                // Prevent circular reference
                if ($parent->isDescendantOf($category)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot move category under its own descendant',
                    ], 422);
                }
                
                $category->parent_id = $request->parent_id;
                $category->save();
                $category->appendToNode($parent)->save();
            } else {
                $category->parent_id = null;
                $category->saveAsRoot();
            }
            
            unset($data['parent_id']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($category->image) {
                \Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        // Handle banner upload
        if ($request->hasFile('banner')) {
            if ($category->banner) {
                \Storage::disk('public')->delete($category->banner);
            }
            $data['banner'] = $request->file('banner')->store('categories/banners', 'public');
        }

        $category->update($data);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($category)
            ->log('Category updated');

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => new CategoryResource($category->fresh()),
        ]);
    }

    /**
     * Remove the specified category (ADMIN)
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('categories.delete');

        // Check if category has products
        if ($category->hasProducts()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with products. Please reassign or delete products first.',
            ], 422);
        }

        // Check if category has children
        if ($category->hasChildren()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with subcategories. Please delete subcategories first.',
            ], 422);
        }

        activity()
            ->causedBy(auth()->user())
            ->performedOn($category)
            ->log('Category deleted');

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }

    /**
     * Get category tree (PUBLIC)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function tree(Request $request): JsonResponse
    {
        $query = Category::active();

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $categories = $query->defaultOrder()->get()->toTree();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Get products in category (PUBLIC)
     *
     * @param string $slug
     * @param Request $request
     * @return JsonResponse
     */
    public function products(string $slug, Request $request): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        // Get products including from subcategories if requested
        if ($request->boolean('include_subcategories')) {
            $query = $category->allProducts();
        } else {
            $query = $category->products();
        }

        $query->active();

        // Apply additional filters
        if ($request->has('plan_category')) {
            $query->where('plan_category', $request->plan_category);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Reorder categories (ADMIN)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function reorder(Request $request): JsonResponse
    {
        $this->authorize('categories.edit');

        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->categories as $item) {
            Category::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Categories reordered successfully',
        ]);
    }
}

