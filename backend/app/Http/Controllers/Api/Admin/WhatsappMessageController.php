<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WhatsappMessageController extends Controller
{
    /**
     * Display a listing of WhatsApp messages (Admin/Staff)
     */
    public function index(Request $request): JsonResponse
    {
        $query = WhatsappMessage::with(['user:id,name,email'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by message type
        if ($request->has('message_type') && $request->message_type !== 'all') {
            $query->where('message_type', $request->message_type);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by name, email, phone, or message
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
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
     * Display WhatsApp message details (Admin/Staff)
     */
    public function show(int $id): JsonResponse
    {
        $message = WhatsappMessage::with(['user:id,name,email,phone'])
            ->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp message not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    /**
     * Update WhatsApp message status (Admin/Staff)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $message = WhatsappMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp message not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,contacted,converted,failed',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message->update([
            'status' => $request->input('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp message updated successfully',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Mark message as contacted (Admin/Staff)
     */
    public function markContacted(int $id): JsonResponse
    {
        $message = WhatsappMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp message not found',
            ], 404);
        }

        $message->update(['status' => 'contacted']);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as contacted',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Mark message as converted (Admin/Staff)
     */
    public function markConverted(Request $request, int $id): JsonResponse
    {
        $message = WhatsappMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp message not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'subscription_id' => 'nullable|exists:subscriptions,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message->update(['status' => 'converted']);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as converted',
            'data' => $message->fresh(),
        ]);
    }

    /**
     * Delete WhatsApp message (Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $message = WhatsappMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp message not found',
            ], 404);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp message deleted successfully',
        ]);
    }

    /**
     * Get WhatsApp message statistics (Admin/Staff)
     */
    public function statistics(): JsonResponse
    {
        $totalMessages = WhatsappMessage::count();
        $pendingMessages = WhatsappMessage::where('status', 'pending')->count();
        $contactedMessages = WhatsappMessage::where('status', 'contacted')->count();
        $convertedMessages = WhatsappMessage::where('status', 'converted')->count();
        $failedMessages = WhatsappMessage::where('status', 'failed')->count();

        // This month's messages
        $thisMonthMessages = WhatsappMessage::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Last month's messages for comparison
        $lastMonthMessages = WhatsappMessage::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        // Messages by type
        $byMessageType = WhatsappMessage::select('message_type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('message_type')
            ->pluck('count', 'message_type');

        // Messages by status
        $byStatus = WhatsappMessage::select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Top pages where messages originated
        $topPages = WhatsappMessage::select('page_url')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('page_url')
            ->orderByDesc('count')
            ->limit(10)
            ->pluck('count', 'page_url');

        // Conversion rate
        $conversionRate = $totalMessages > 0
            ? round(($convertedMessages / $totalMessages) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total' => $totalMessages,
                    'pending' => $pendingMessages,
                    'contacted' => $contactedMessages,
                    'converted' => $convertedMessages,
                    'failed' => $failedMessages,
                    'this_month' => $thisMonthMessages,
                    'last_month' => $lastMonthMessages,
                    'conversion_rate' => $conversionRate,
                ],
                'by_message_type' => $byMessageType,
                'by_status' => $byStatus,
                'top_pages' => $topPages,
            ],
        ]);
    }
}

