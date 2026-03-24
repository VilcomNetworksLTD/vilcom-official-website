<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryItem::with(['media'])->published();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        $items = $query->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = GalleryItem::published()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }
}
