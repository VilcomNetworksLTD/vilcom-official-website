<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    /**
     * GET /api/v1/admin/gallery
     */
    public function index(Request $request): JsonResponse
    {
        $query = GalleryItem::with(['media', 'creator']);

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $items = $query->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * POST /api/v1/admin/gallery
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'media_id'     => 'required|exists:media,id',
            'title'        => 'required|string|max:255',
            'category'     => 'required|string|max:100',
            'location'     => 'nullable|string|max:255',
            'sort_order'   => 'integer|min:0',
            'is_published' => 'boolean',
        ]);

        $data['created_by'] = $request->user()->id;

        $item = GalleryItem::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Gallery item created',
            'data'    => $item->load('media'),
        ], 201);
    }

    /**
     * GET /api/v1/admin/gallery/{galleryItem}
     */
    public function show(GalleryItem $galleryItem): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $galleryItem->load(['media', 'creator']),
        ]);
    }

    /**
     * PUT /api/v1/admin/gallery/{galleryItem}
     */
    public function update(Request $request, GalleryItem $galleryItem): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'category'     => 'sometimes|string|max:100',
            'location'     => 'nullable|string|max:255',
            'sort_order'   => 'integer|min:0',
            'is_published' => 'boolean',
        ]);

        $galleryItem->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Gallery item updated',
            'data'    => $galleryItem->load('media'),
        ]);
    }

    /**
     * DELETE /api/v1/admin/gallery/{galleryItem}
     * Removes from gallery only — does NOT delete the source media file.
     */
    public function destroy(GalleryItem $galleryItem): JsonResponse
    {
        $galleryItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gallery item removed',
        ]);
    }

    /**
     * POST /api/v1/admin/gallery/{galleryItem}/toggle-publish
     */
    public function togglePublish(GalleryItem $galleryItem): JsonResponse
    {
        $galleryItem->is_published = !$galleryItem->is_published;
        $galleryItem->save();

        return response()->json([
            'success' => true,
            'message' => $galleryItem->is_published ? 'Item published' : 'Item hidden',
            'data'    => $galleryItem,
        ]);
    }

    /**
     * POST /api/v1/admin/gallery/reorder
     * Body: { items: [{ id: 1, sort_order: 0 }, ...] }
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items'              => 'required|array',
            'items.*.id'         => 'required|exists:gallery_items,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            GalleryItem::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Gallery reordered',
        ]);
    }
}
