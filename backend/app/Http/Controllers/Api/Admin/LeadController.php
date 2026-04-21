<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    /**
     * Get all leads with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lead::with(['product:id,name,slug', 'assignedStaff:id,name,email']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->status($request->status);
        }

        // Filter by source
        if ($request->has('source') && $request->source !== 'all') {
            $query->source($request->source);
        }

        // Filter by assigned staff
        if ($request->has('assigned_staff_id')) {
            $query->assignedTo($request->assigned_staff_id);
        }

        // Filter by unassigned
        if ($request->has('unassigned') && $request->unassigned === 'true') {
            $query->unassigned();
        }

        // Filter hot leads
        if ($request->has('hot') && $request->hot === 'true') {
            $query->hot();
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $leads = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ],
        ]);
    }

    /**
     * Get single lead details
     */
    public function show(int $id): JsonResponse
    {
        $lead = Lead::with([
            'product:id,name,slug',
            'assignedStaff:id,name,email',
            'visits' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(50);
            }
        ])->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $lead,
        ]);
    }

    /**
     * Update lead
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'product_id' => 'nullable|exists:products,id',
            'source' => 'nullable|string|in:' . implode(',', array_keys(Lead::SOURCES)),
            'status' => 'nullable|string|in:' . implode(',', array_keys(Lead::STATUSES)),
            'is_business' => 'nullable|boolean',
            'message' => 'nullable|string',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
            'utm_content' => 'nullable|string',
            'utm_term' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $lead->update($request->all());
        $lead->calculateScore();

        return response()->json([
            'success' => true,
            'message' => 'Lead updated successfully',
            'data' => $lead,
        ]);
    }

    /**
     * Update lead status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:' . implode(',', array_keys(Lead::STATUSES)),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = $request->status;

        switch ($status) {
            case 'contacted':
                $lead->markAsContacted();
                break;
            case 'qualified':
                $lead->markAsQualified();
                break;
            case 'proposal':
                $lead->markAsProposal();
                break;
            case 'converted':
                $lead->markAsConverted();
                break;
            case 'lost':
                $lead->markAsLost();
                break;
            default:
                $lead->update(['status' => $status]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead status updated successfully',
            'data' => $lead,
        ]);
    }

    /**
     * Assign lead to staff
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'assigned_staff_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $lead->assignTo($request->assigned_staff_id);

        return response()->json([
            'success' => true,
            'message' => 'Lead assigned successfully',
            'data' => $lead->load('assignedStaff:id,name,email'),
        ]);
    }

    /**
     * Auto-assign lead to available staff
     */
    public function autoAssign(int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        if ($lead->assigned_staff_id) {
            return response()->json([
                'success' => false,
                'message' => 'Lead is already assigned',
            ], 400);
        }

        $success = $lead->autoAssign();

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Lead auto-assigned successfully',
                'data' => $lead->load('assignedStaff:id,name,email'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No available staff members found',
        ], 400);
    }

    /**
     * Convert lead to customer/booking
     */
    public function convert(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        // Mark as converted
        $lead->markAsConverted();

        return response()->json([
            'success' => true,
            'message' => 'Lead converted successfully. You can now create a subscription or booking for this lead.',
            'data' => $lead,
        ]);
    }

    /**
     * Delete lead
     */
    public function destroy(int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        // Delete associated visits
        $lead->visits()->delete();

        $lead->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lead deleted successfully',
        ]);
    }

    /**
     * Get lead statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Lead::query();

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        $totalLeads = (clone $query)->count();
        $newLeads = (clone $query)->where('status', 'new')->count();
        $contactedLeads = (clone $query)->where('status', 'contacted')->count();
        $qualifiedLeads = (clone $query)->where('status', 'qualified')->count();
        $proposalLeads = (clone $query)->where('status', 'proposal')->count();
        $convertedLeads = (clone $query)->where('status', 'converted')->count();
        $lostLeads = (clone $query)->where('status', 'lost')->count();

        // Calculate conversion rate
        $conversionRate = $totalLeads > 0
            ? round(($convertedLeads / $totalLeads) * 100, 2)
            : 0;

        // Average score
        $avgScore = (clone $query)->avg('score') ?? 0;

        // Hot leads (score >= 50)
        $hotLeads = (clone $query)->where('score', '>=', 50)->count();

        // Leads by source
        $bySource = Lead::selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->pluck('count', 'source')
            ->toArray();

        // This month vs last month
        $thisMonth = Lead::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $lastMonth = Lead::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total' => $totalLeads,
                    'new' => $newLeads,
                    'contacted' => $contactedLeads,
                    'qualified' => $qualifiedLeads,
                    'proposal' => $proposalLeads,
                    'converted' => $convertedLeads,
                    'lost' => $lostLeads,
                    'conversion_rate' => $conversionRate,
                    'average_score' => round($avgScore, 1),
                    'hot_leads' => $hotLeads,
                ],
                'by_source' => $bySource,
                'this_month' => $thisMonth,
                'last_month' => $lastMonth,
            ],
        ]);
    }

    /**
     * Bulk assign leads to staff
     */
    public function bulkAssign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id',
            'assigned_staff_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $leadIds = $request->lead_ids;
        $staffId = $request->assigned_staff_id;

        Lead::whereIn('id', $leadIds)->update([
            'assigned_staff_id' => $staffId,
            'status' => 'contacted', // Auto-update status to contacted
            'last_contacted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => count($leadIds) . ' leads assigned successfully',
        ]);
    }

    /**
     * Get available staff for assignment
     */
    public function staff(): JsonResponse
    {
        $staff = \App\Models\User::role(['admin', 'staff', 'sales'])
            ->where(function ($q) {
                // Include users who are explicitly active (true) OR where is_active is NULL (default state)
                $q->where('is_active', true)->orWhereNull('is_active');
            })
            ->select('id', 'name', 'email')
            ->withCount(['leads' => function ($query) {
                $query->whereIn('status', ['new', 'contacted', 'qualified', 'proposal']);
            }])
            ->orderBy('leads_count', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    /**
     * Find duplicates for a lead
     */
    public function duplicates(int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $duplicates = Lead::findDuplicates($lead->email, $lead->phone)
            ->where('id', '!=', $lead->id);

        return response()->json([
            'success' => true,
            'data' => $duplicates,
        ]);
    }

    /**
     * Merge lead with duplicate
     */
    public function merge(Request $request, int $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'duplicate_id' => 'required|exists:leads,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $duplicate = Lead::find($request->duplicate_id);

        if ($duplicate->id === $lead->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot merge lead with itself',
            ], 400);
        }

        $lead->mergeWith($duplicate);
        $lead->calculateScore();

        return response()->json([
            'success' => true,
            'message' => 'Leads merged successfully',
            'data' => $lead->fresh(),
        ]);
    }
}

