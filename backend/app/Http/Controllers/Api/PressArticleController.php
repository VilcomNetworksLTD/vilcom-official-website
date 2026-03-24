<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PressArticle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PressArticleController extends Controller
{
    /**
     * GET /api/v1/press-articles
     *
     * Filterable by:
     *   ?type=press|blog   ← new
     *   ?category=...
     *   ?search=...
     *   ?per_page=12
     */
    public function index(Request $request): JsonResponse
    {
        $query = PressArticle::with('thumbnailMedia')
            ->published()
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $articles = $query->paginate($request->integer('per_page', 12));

        $articles->getCollection()->transform(function ($article) {
            $article->thumbnail = $article->thumbnail;
            return $article;
        });

        return response()->json([
            'success' => true,
            'data'    => $articles,
        ]);
    }

    /**
     * GET /api/v1/press-articles/featured
     *
     * Filterable by:
     *   ?type=press|blog   ← new
     */
    public function featured(Request $request): JsonResponse
    {
        $query = PressArticle::with('thumbnailMedia')
            ->published()
            ->featured()
            ->latest('published_at');

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        $article = $query->first();

        if ($article) {
            $article->thumbnail = $article->thumbnail;
        }

        return response()->json([
            'success' => true,
            'data'    => $article,
        ]);
    }

    /**
     * GET /api/v1/press-articles/categories
     *
     * Filterable by:
     *   ?type=press|blog   ← new (returns categories only for that type)
     */
    public function categories(Request $request): JsonResponse
    {
        $query = PressArticle::published();

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        $categories = $query->distinct()->pluck('category')->filter()->values();

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }
}
