<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PortfolioProject::with(['media'])->published();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        $perPage = $request->input('per_page', 50);
        $projects = $query->orderBy('sort_order')->latest()->paginate($perPage);

        return response()->json($projects);
    }

    public function categories(): JsonResponse
    {
        $categories = PortfolioProject::published()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }
}
