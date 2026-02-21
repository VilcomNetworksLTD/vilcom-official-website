<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    /**
     * Get all banners
     */
    public function index(Request $request): JsonResponse
    {
        $query = Banner::with('creator');

        // Filter by position
        if ($request->has('position')) {
            $query->byPosition($request->position);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->currentlyActive();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->has('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $banners = $query->orderBy('order', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    /**
     * Get all positions
     */
    public function positions(): JsonResponse
    {
        $positions = [
            'homepage_hero' => 'Homepage Hero',
            'homepage_banner' => 'Homepage Banner',
            'coverage_page' => 'Coverage Page',
            'plans_page' => 'Plans Page',
            'blog_page' => 'Blog Page',
            'sidebar' => 'Sidebar',
            'popup' => 'Popup',
        ];

        return response()->json([
            'success' => true,
            'data' => $positions,
        ]);
    }

    /**
     * Get active banners for public display
     */
    public function active(Request $request): JsonResponse
    {
        $banners = Banner::currentlyActive()
            ->byPosition($request->position ?? 'homepage_hero')
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    /**
     * Create new banner
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|image|max:5120', // 5MB max
            'position' => 'required|string|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'target_logged_in' => 'nullable|boolean',
            'target_guests' => 'nullable|boolean',
            'target_roles' => 'nullable|array',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $imagePath = $file->storeAs('banners', $filename, 'public');
        }

        $banner = Banner::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'image' => $imagePath,
            'position' => $request->position,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'target_logged_in' => $request->boolean('target_logged_in', true),
            'target_guests' => $request->boolean('target_guests', true),
            'target_roles' => $request->target_roles ?? [],
            'cta_text' => $request->cta_text,
            'cta_url' => $request->cta_url,
            'order' => $request->input('order', 0),
            'is_active' => $request->boolean('is_active', true),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Banner created successfully',
            'data' => $banner->load('creator'),
        ], 201);
    }

    /**
     * Get single banner
     */
    public function show(Banner $banner): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $banner->load('creator'),
        ]);
    }

    /**
     * Update banner
     */
    public function update(Request $request, Banner $banner): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'position' => 'sometimes|string|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'target_logged_in' => 'nullable|boolean',
            'target_guests' => 'nullable|boolean',
            'target_roles' => 'nullable|array',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data = $request->except(['image']);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($banner->image && Storage::disk('public')->exists($banner->image)) {
                Storage::disk('public')->delete($banner->image);
            }
            
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $data['image'] = $file->storeAs('banners', $filename, 'public');
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner updated successfully',
            'data' => $banner->load('creator'),
        ]);
    }

    /**
     * Delete banner
     */
    public function destroy(Banner $banner): JsonResponse
    {
        // Delete image
        if ($banner->image && Storage::disk('public')->exists($banner->image)) {
            Storage::disk('public')->delete($banner->image);
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully',
        ]);
    }

    /**
     * Toggle banner status
     */
    public function toggleStatus(Banner $banner): JsonResponse
    {
        $banner->update(['is_active' => !$banner->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Banner status updated',
            'data' => $banner,
        ]);
    }

    /**
     * Reorder banners
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.order' => 'required|integer',
        ]);

        foreach ($request->banners as $bannerData) {
            Banner::where('id', $bannerData['id'])->update(['order' => $bannerData['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Banners reordered successfully',
        ]);
    }

    /**
     * Duplicate banner
     */
    public function duplicate(Banner $banner): JsonResponse
    {
        $newBanner = $banner->replicate();
        $newBanner->title = $banner->title . ' (Copy)';
        $newBanner->is_active = false;
        $newBanner->save();

        return response()->json([
            'success' => true,
            'message' => 'Banner duplicated successfully',
            'data' => $newBanner,
        ]);
    }
}

