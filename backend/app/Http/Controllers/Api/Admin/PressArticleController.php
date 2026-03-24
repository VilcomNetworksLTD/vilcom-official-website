<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PressArticle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PressArticleController extends Controller
{
    /**
     * GET /api/v1/admin/press-articles
     */
    public function index(Request $request): JsonResponse
    {
        $query = PressArticle::with(['thumbnailMedia', 'creator']);

        if ($request->filled('search')) {
            $query->search($request->search);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('is_published')) {
            $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
        }

        $articles = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $articles,
        ]);
    }

    /**
     * POST /api/v1/admin/press-articles
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'              => 'required|string|max:255',
            'excerpt'            => 'nullable|string|max:1000',
            'source_name'        => 'required|string|max:255',
            'source_url'         => 'nullable|url|max:500',
            'article_url'        => 'nullable|url|max:500',
            'category'           => 'required|string|max:100',
            'type'               => 'nullable|string|in:press,blog', // ✅ add this
            'thumbnail_url'      => 'nullable|url|max:500',
            'thumbnail_media_id' => 'nullable|exists:media,id',
            'is_featured'        => 'boolean',
            'is_published'       => 'boolean',
            'published_at'       => 'nullable|date',
        ]);

        $data['created_by'] = $request->user()->id;

        if (!empty($data['is_published']) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article = PressArticle::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Press article created',
            'data'    => $article->load('thumbnailMedia'),
        ], 201);
    }

    /**
     * GET /api/v1/admin/press-articles/{pressArticle}
     */
    public function show(PressArticle $pressArticle): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $pressArticle->load(['thumbnailMedia', 'creator']),
        ]);
    }

    /**
     * PUT /api/v1/admin/press-articles/{pressArticle}
     */
    public function update(Request $request, PressArticle $pressArticle): JsonResponse
    {
        $data = $request->validate([
            'title'              => 'sometimes|string|max:255',
            'excerpt'            => 'nullable|string|max:1000',
            'source_name'        => 'sometimes|string|max:255',
            'source_url'         => 'nullable|url|max:500',
            'article_url'        => 'nullable|url|max:500',
            'category'           => 'sometimes|string|max:100',
            'type'               => 'sometimes|string|in:press,blog', // ✅ add this
            'thumbnail_url'      => 'nullable|url|max:500',
            'thumbnail_media_id' => 'nullable|exists:media,id',
            'is_featured'        => 'boolean',
            'is_published'       => 'boolean',
            'published_at'       => 'nullable|date',
        ]);

        if (isset($data['is_published']) && $data['is_published'] && !$pressArticle->published_at) {
            $data['published_at'] = now();
        }

        $pressArticle->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Press article updated',
            'data'    => $pressArticle->load('thumbnailMedia'),
        ]);
    }

    /**
     * DELETE /api/v1/admin/press-articles/{pressArticle}
     */
    public function destroy(PressArticle $pressArticle): JsonResponse
    {
        $pressArticle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Press article deleted',
        ]);
    }

    /**
     * POST /api/v1/admin/press-articles/{pressArticle}/toggle-publish
     */
    public function togglePublish(PressArticle $pressArticle): JsonResponse
    {
        $pressArticle->is_published = !$pressArticle->is_published;

        if ($pressArticle->is_published && !$pressArticle->published_at) {
            $pressArticle->published_at = now();
        }

        $pressArticle->save();

        return response()->json([
            'success' => true,
            'message' => $pressArticle->is_published ? 'Article published' : 'Article unpublished',
            'data'    => $pressArticle,
        ]);
    }

    /**
     * POST /api/v1/admin/press-articles/{pressArticle}/toggle-featured
     * Only one article can be featured at a time.
     */
    public function toggleFeatured(PressArticle $pressArticle): JsonResponse
    {
        if (!$pressArticle->is_featured) {
            PressArticle::where('is_featured', true)->update(['is_featured' => false]);
        }

        $pressArticle->is_featured = !$pressArticle->is_featured;
        $pressArticle->save();

        return response()->json([
            'success' => true,
            'message' => $pressArticle->is_featured ? 'Article featured' : 'Article unfeatured',
            'data'    => $pressArticle,
        ]);
    }
}
