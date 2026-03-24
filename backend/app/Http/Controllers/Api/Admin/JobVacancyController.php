<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobVacancy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class JobVacancyController extends Controller
{
    /**
     * Get all job vacancies (Admin/Staff)
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobVacancy::with(['createdBy:id,name,email'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('department', 'like', "%{$s}%");
            });
        }

        $vacancies = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $vacancies->items(),
            'meta'    => [
                'current_page' => $vacancies->currentPage(),
                'last_page'    => $vacancies->lastPage(),
                'per_page'     => $vacancies->perPage(),
                'total'        => $vacancies->total(),
            ],
        ]);
    }

    /**
     * Create a new job vacancy (Admin/Staff)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'required|string|max:255',
            'department'   => 'nullable|string|max:100',
            'location'     => 'nullable|string|max:200',
            'type'         => 'required|string|in:Full-time,Part-time,Contract,Internship',
            'description'  => 'required|string',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string',
            'status'       => 'required|string|in:active,closed,draft',
            'deadline'     => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $vacancy = JobVacancy::create([
            ...$validator->validated(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job vacancy created successfully',
            'data'    => $vacancy->load('createdBy:id,name,email'),
        ], 201);
    }

    /**
     * Get single vacancy (Admin/Staff)
     */
    public function show(int $id): JsonResponse
    {
        $vacancy = JobVacancy::with(['createdBy:id,name,email'])->find($id);

        if (!$vacancy) {
            return response()->json(['success' => false, 'message' => 'Vacancy not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $vacancy]);
    }

    /**
     * Update vacancy (Admin/Staff)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $vacancy = JobVacancy::find($id);

        if (!$vacancy) {
            return response()->json(['success' => false, 'message' => 'Vacancy not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'        => 'sometimes|required|string|max:255',
            'department'   => 'nullable|string|max:100',
            'location'     => 'nullable|string|max:200',
            'type'         => 'sometimes|required|string|in:Full-time,Part-time,Contract,Internship',
            'description'  => 'sometimes|required|string',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string',
            'status'       => 'sometimes|required|string|in:active,closed,draft',
            'deadline'     => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $vacancy->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Job vacancy updated successfully',
            'data'    => $vacancy->fresh('createdBy:id,name,email'),
        ]);
    }

    /**
     * Delete vacancy (Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $vacancy = JobVacancy::find($id);

        if (!$vacancy) {
            return response()->json(['success' => false, 'message' => 'Vacancy not found'], 404);
        }

        $vacancy->delete();

        return response()->json(['success' => true, 'message' => 'Vacancy deleted successfully']);
    }
}
