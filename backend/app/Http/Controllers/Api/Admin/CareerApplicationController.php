<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareerApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CareerApplicationController extends Controller
{
    /**
     * Get all career applications (Admin/HR only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = CareerApplication::with(['reviewedBy:id,name,email'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by job title
        if ($request->has('job_title') && $request->job_title) {
            $query->where('job_title', 'like', "%{$request->job_title}%");
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->where('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->where('created_at', '<=', $request->to_date . ' 23:59:59');
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('application_number', 'like', "%{$search}%");
            });
        }

        $applications = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    /**
     * Get application statistics (Admin/HR only)
     */
    public function statistics(): JsonResponse
    {
        $total = CareerApplication::count();
        $pending = CareerApplication::where('status', 'pending')->count();
        $underReview = CareerApplication::where('status', 'under_review')->count();
        $shortlisted = CareerApplication::where('status', 'shortlisted')->count();
        $interviewed = CareerApplication::where('status', 'interviewed')->count();
        $rejected = CareerApplication::where('status', 'rejected')->count();
        $hired = CareerApplication::where('status', 'hired')->count();

        // Applications by job title
        $byJobTitle = CareerApplication::select('job_title')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('job_title')
            ->orderByDesc('count')
            ->get();

        // Applications by status
        $byStatus = CareerApplication::select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Recent applications (last 7 days)
        $recentCount = CareerApplication::where('created_at', '>=', now()->subDays(7))->count();

        // This month
        $thisMonth = CareerApplication::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'under_review' => $underReview,
                'shortlisted' => $shortlisted,
                'interviewed' => $interviewed,
                'rejected' => $rejected,
                'hired' => $hired,
                'recent_count' => $recentCount,
                'this_month' => $thisMonth,
                'by_job_title' => $byJobTitle,
                'by_status' => $byStatus,
            ],
        ]);
    }

    /**
     * Get single application details (Admin/HR only)
     */
    public function show(int $id): JsonResponse
    {
        $application = CareerApplication::with(['reviewedBy:id,name,email'])
            ->find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Update application status (Admin/HR only)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $application = CareerApplication::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'status' => 'required|string|in:' . implode(',', array_keys(CareerApplication::STATUSES)),
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $status = $request->status;
        $notes = $request->notes;

        switch ($status) {
            case 'under_review':
                $application->markAsUnderReview($user->id);
                break;
            case 'shortlisted':
                $application->shortlist($user->id, $notes);
                break;
            case 'interviewed':
                $application->markInterviewed($user->id, $notes);
                break;
            case 'rejected':
                $application->reject($user->id, $notes);
                break;
            case 'hired':
                $application->markHired($user->id, $notes);
                break;
            default:
                $application->update([
                    'status' => $status,
                    'reviewed_by' => $user->id,
                    'reviewed_at' => now(),
                    'hr_notes' => $notes,
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Application status updated successfully',
            'data' => [
                'id' => $application->id,
                'status' => $application->status,
                'status_label' => $application->status_label,
                'reviewed_at' => $application->reviewed_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Update application notes (Admin/HR only)
     */
    public function updateNotes(Request $request, int $id): JsonResponse
    {
        $application = CareerApplication::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'hr_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application->update([
            'hr_notes' => $request->hr_notes,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notes updated successfully',
        ]);
    }

    /**
     * Download CV file (Admin/HR only)
     */
    public function downloadCv(int $id): JsonResponse
    {
        $application = CareerApplication::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        if (!$application->cv_path || !Storage::disk('public')->exists($application->cv_path)) {
            return response()->json([
                'success' => false,
                'message' => 'CV file not found',
            ], 404);
        }

        $filePath = storage_path('app/public/' . $application->cv_path);
        $fileName = $application->application_number . '_cv.' . pathinfo($application->cv_path, PATHINFO_EXTENSION);

        return response()->download($filePath, $fileName);
    }

    /**
     * Download certificates file (Admin/HR only)
     */
    public function downloadCertificates(int $id): JsonResponse
    {
        $application = CareerApplication::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        if (!$application->certificates_path || !Storage::disk('public')->exists($application->certificates_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Certificates file not found',
            ], 404);
        }

        $filePath = storage_path('app/public/' . $application->certificates_path);
        $fileName = $application->application_number . '_certificates.' . pathinfo($application->certificates_path, PATHINFO_EXTENSION);

        return response()->download($filePath, $fileName);
    }

    /**
     * Download additional documents file (Admin/HR only)
     */
    public function downloadAdditionalDocuments(int $id): JsonResponse
    {
        $application = CareerApplication::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        if (!$application->additional_documents_path || !Storage::disk('public')->exists($application->additional_documents_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Additional documents file not found',
            ], 404);
        }

        $filePath = storage_path('app/public/' . $application->additional_documents_path);
        $fileName = $application->application_number . '_additional.' . pathinfo($application->additional_documents_path, PATHINFO_EXTENSION);

        return response()->download($filePath, $fileName);
    }

    /**
     * Delete application (Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $application = CareerApplication::find($id);

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        // Delete associated files
        if ($application->cv_path) {
            Storage::disk('public')->delete($application->cv_path);
        }
        if ($application->certificates_path) {
            Storage::disk('public')->delete($application->certificates_path);
        }
        if ($application->additional_documents_path) {
            Storage::disk('public')->delete($application->additional_documents_path);
        }

        $application->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application deleted successfully',
        ]);
    }

    /**
     * Bulk update status (Admin/HR only)
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'application_ids' => 'required|array',
            'application_ids.*' => 'required|integer|exists:career_applications,id',
            'status' => 'required|string|in:' . implode(',', array_keys(CareerApplication::STATUSES)),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        CareerApplication::whereIn('id', $request->application_ids)
            ->update([
                'status' => $request->status,
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Applications updated successfully',
        ]);
    }

    /**
     * Get unique job titles (Admin/HR only)
     */
    public function jobTitles(): JsonResponse
    {
        $titles = CareerApplication::select('job_title')
            ->distinct()
            ->orderBy('job_title')
            ->pluck('job_title');

        return response()->json([
            'success' => true,
            'data' => $titles,
        ]);
    }
}

