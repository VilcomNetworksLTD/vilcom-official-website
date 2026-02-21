<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\FaqCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class FaqController extends Controller
{
    /**
     * Get all FAQs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faq::with(['creator', 'category']);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('question', 'like', "%{$request->search}%")
                  ->orWhere('answer', 'like', "%{$request->search}%");
            });
        }

        $faqs = $query->ordered()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Get FAQs for public display
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Faq::with('category')->active();

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('question', 'like', "%{$request->search}%")
                  ->orWhere('answer', 'like', "%{$request->search}%");
            });
        }

        $faqs = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Get all categories
     */
    public function categories(): JsonResponse
    {
        $categories = FaqCategory::withCount('faqs')->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Create new FAQ
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'question' => 'required|string|max:500',
            'answer' => 'required|string|min:10',
            'category_id' => 'nullable|exists:faq_categories,id',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $faq = Faq::create([
            'question' => $request->question,
            'answer' => $request->answer,
            'category_id' => $request->category_id,
            'order' => $request->input('order', 0),
            'is_active' => $request->boolean('is_active', true),
            'views' => 0,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'FAQ created successfully',
            'data' => $faq->load(['creator', 'category']),
        ], 201);
    }

    /**
     * Get single FAQ
     */
    public function show(Faq $faq): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $faq->load(['creator', 'category']),
        ]);
    }

    /**
     * Update FAQ
     */
    public function update(Request $request, Faq $faq): JsonResponse
    {
        $request->validate([
            'question' => 'sometimes|string|max:500',
            'answer' => 'sometimes|string|min:10',
            'category_id' => 'nullable|exists:faq_categories,id',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $faq->update($request->only(['question', 'answer', 'category_id', 'order', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'FAQ updated successfully',
            'data' => $faq->load(['creator', 'category']),
        ]);
    }

    /**
     * Delete FAQ
     */
    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQ deleted successfully',
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(Faq $faq): JsonResponse
    {
        $faq->update(['is_active' => !$faq->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'FAQ status updated',
            'data' => $faq,
        ]);
    }

    /**
     * Increment view count
     */
    public function view(Faq $faq): JsonResponse
    {
        $faq->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $faq,
        ]);
    }

    /**
     * Reorder FAQs
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'faqs' => 'required|array',
            'faqs.*.id' => 'required|exists:faqs,id',
            'faqs.*.order' => 'required|integer',
        ]);

        foreach ($request->faqs as $faqData) {
            Faq::where('id', $faqData['id'])->update(['order' => $faqData['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'FAQs reordered successfully',
        ]);
    }

    /**
     * Bulk delete FAQs
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:faqs,id',
        ]);

        Faq::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQs deleted successfully',
        ]);
    }

    // ========== CATEGORY METHODS ==========

    /**
     * Create new category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:faq_categories,name',
            'description' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
        ]);

        $category = FaqCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'order' => $request->input('order', 0),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Update category
     */
    public function updateCategory(Request $request, FaqCategory $faqCategory): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:faq_categories,name,' . $faqCategory->id,
            'description' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
        ]);

        $data = $request->only(['name', 'description', 'order']);
        $data['slug'] = Str::slug($request->name ?? $faqCategory->name);
        
        $faqCategory->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $faqCategory,
        ]);
    }

    /**
     * Delete category
     */
    public function destroyCategory(FaqCategory $faqCategory): JsonResponse
    {
        // Move FAQs to uncategorized
        $faqCategory->faqs()->update(['category_id' => null]);

        $faqCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_faqs' => Faq::count(),
            'active_faqs' => Faq::active()->count(),
            'inactive_faqs' => Faq::where('is_active', false)->count(),
            'total_views' => Faq::sum('views'),
            'total_categories' => FaqCategory::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

