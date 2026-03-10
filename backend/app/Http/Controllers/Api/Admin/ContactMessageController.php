<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ContactMessageController extends Controller
{
    /**
     * Display a listing of contact messages (Admin/Staff)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::with(['user:id,name,email', 'assignedStaff:id,name,email'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by department
        if ($request->has('department') && $request->department !== 'all') {
            $query->where('department', $request->department);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by name, email, phone, subject, or message
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $messages = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    /**
     * Display contact message details (Admin/Staff)
     */
    public function show(int $id): JsonResponse
    {
        $message = ContactMessage::with(['user:id,name,email,phone', 'assignedStaff:id,name,email'])
            ->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    /**
     * Update contact message (Admin/Staff)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,contacted,resolved,spam',
            'admin_notes' => 'nullable|string',
            'assigned_staff_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = [
            'status' => $request->input('status'),
            'admin_notes' => $request->input('admin_notes'),
        ];

        // Handle assigned staff
        if ($request->has('assigned_staff_id')) {
            $updateData['assigned_staff_id'] = $request->input('assigned_staff_id');
        }

        // Auto-update timestamps based on status
        if ($request->input('status') === 'contacted' && $message->status !== 'contacted') {
            $updateData['contacted_at'] = now();
        }

        if ($request->input('status') === 'resolved' && $message->status !== 'resolved') {
            $updateData['resolved_at'] = now();
        }

        $message->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Contact message updated successfully',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Mark message as contacted (Admin/Staff)
     */
    public function markContacted(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        $message->markAsContacted();

        return response()->json([
            'success' => true,
            'message' => 'Message marked as contacted',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Mark message as resolved (Admin/Staff)
     */
    public function markResolved(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        $message->markAsResolved();

        return response()->json([
            'success' => true,
            'message' => 'Message marked as resolved',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Delete contact message (Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contact message deleted successfully',
        ]);
    }

    /**
     * Get contact message statistics (Admin/Staff)
     */
    public function statistics(): JsonResponse
    {
        $totalMessages = ContactMessage::count();
        $pendingMessages = ContactMessage::where('status', 'pending')->count();
        $contactedMessages = ContactMessage::where('status', 'contacted')->count();
        $resolvedMessages = ContactMessage::where('status', 'resolved')->count();
        $spamMessages = ContactMessage::where('status', 'spam')->count();

        // This month's messages
        $thisMonthMessages = ContactMessage::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Last month's messages for comparison
        $lastMonthMessages = ContactMessage::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        // Messages by department
        $byDepartment = ContactMessage::select('department')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('department')
            ->pluck('count', 'department');

        // Messages by status
        $byStatus = ContactMessage::select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Resolution rate
        $resolutionRate = $totalMessages > 0
            ? round(($resolvedMessages / $totalMessages) * 100, 2)
            : 0;

        // Response rate (contacted + resolved)
        $responseRate = $totalMessages > 0
            ? round((($contactedMessages + $resolvedMessages) / $totalMessages) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total' => $totalMessages,
                    'pending' => $pendingMessages,
                    'contacted' => $contactedMessages,
                    'resolved' => $resolvedMessages,
                    'spam' => $spamMessages,
                    'this_month' => $thisMonthMessages,
                    'last_month' => $lastMonthMessages,
                    'resolution_rate' => $resolutionRate,
                    'response_rate' => $responseRate,
                ],
                'by_department' => $byDepartment,
                'by_status' => $byStatus,
            ],
        ]);
    }

    /**
     * Get available staff for assignment (Admin/Staff)
     */
    public function staff(): JsonResponse
    {
        $staff = \App\Models\User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff', 'support']);
        })
        ->select('id', 'name', 'email')
        ->orderBy('name')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }
}

