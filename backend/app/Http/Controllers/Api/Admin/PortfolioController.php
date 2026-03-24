<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PortfolioProject::with(['media', 'creator']);

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('location', 'like', "%{$term}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $perPage = $request->input('per_page', 24);
        $projects = $query->orderBy('sort_order')->latest()->paginate($perPage);

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'category'     => 'nullable|string|max:255',
            'location'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'media_id'     => 'nullable|exists:media,id',
            'stats_value'  => 'nullable|string|max:255',
            'stats_label'  => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'sort_order'   => 'integer',
        ]);

        $validated['created_by'] = $request->user()->id ?? null;

        $project = PortfolioProject::create($validated);
        $project->load(['media', 'creator']);

        return response()->json([
            'message' => 'Portfolio project created successfully.',
            'data'    => $project
        ], 201);
    }

    public function show(PortfolioProject $portfolio): JsonResponse
    {
        return response()->json([
            'data' => $portfolio->load(['media', 'creator'])
        ]);
    }

    public function update(Request $request, PortfolioProject $portfolio): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'category'     => 'nullable|string|max:255',
            'location'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'media_id'     => 'nullable|exists:media,id',
            'stats_value'  => 'nullable|string|max:255',
            'stats_label'  => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'sort_order'   => 'integer',
        ]);

        $portfolio->update($validated);

        return response()->json([
            'message' => 'Portfolio project updated successfully.',
            'data'    => $portfolio->load(['media', 'creator'])
        ]);
    }

    public function destroy(PortfolioProject $portfolio): JsonResponse
    {
        $portfolio->delete();

        return response()->json([
            'message' => 'Portfolio project deleted successfully.'
        ]);
    }

    public function togglePublish(PortfolioProject $portfolio): JsonResponse
    {
        $portfolio->update([
            'is_published' => !$portfolio->is_published
        ]);

        return response()->json([
            'message' => $portfolio->is_published ? 'Project published.' : 'Project unpublished.',
            'data'    => $portfolio
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'      => 'required|array',
            'items.*.id' => 'required|exists:portfolio_projects,id',
            'items.*.order' => 'required|integer'
        ]);

        foreach ($validated['items'] as $item) {
            PortfolioProject::where('id', $item['id'])->update(['sort_order' => $item['order']]);
        }

        return response()->json([
            'message' => 'Portfolio projects reordered successfully.'
        ]);
    }
}
