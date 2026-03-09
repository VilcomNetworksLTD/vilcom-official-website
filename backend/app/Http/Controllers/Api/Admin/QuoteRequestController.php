<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Notifications\QuoteReadyNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class QuoteRequestController extends Controller
{
    /**
     * Display a listing of quote requests (Admin/Staff)
     */
    public function index(Request $request): JsonResponse
    {
        $query = QuoteRequest::with([
            'user:id,name,email',
            'product:id,name,slug',
            'assignedStaff:id,name,email'
        ])->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by service type
        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        // Filter by urgency
        if ($request->has('urgency')) {
            $query->where('urgency', $request->urgency);
        }

        // Filter by assigned staff
        if ($request->has('assigned_staff_id')) {
            $query->where('assigned_staff_id', $request->assigned_staff_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by quote number, company name, or contact name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%")
                  ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $quotes = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $quotes->items(),
            'meta' => [
                'current_page' => $quotes->currentPage(),
                'last_page' => $quotes->lastPage(),
                'per_page' => $quotes->perPage(),
                'total' => $quotes->total(),
            ],
        ]);
    }

    /**
     * Display quote request details (Admin/Staff)
     */
    public function show(int $id): JsonResponse
    {
        $quote = QuoteRequest::with([
            'user:id,name,email,phone',
            'product:id,name,slug,type',
            'assignedStaff:id,name,email',
            'subscription:id,status'
        ])->find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $quote,
        ]);
    }

    /**
     * Update quote status - mark as under review (Admin/Staff)
     */
    public function markUnderReview(Request $request, int $id): JsonResponse
    {
        $quote = QuoteRequest::find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        if (!$quote->canEdit()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be edited at this time',
            ], 400);
        }

        $quote->markAsUnderReview(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Quote marked as under review',
            'data' => $quote->fresh(),
        ]);
    }

    /**
     * Submit a quote response (Admin/Staff)
     */
    public function submitQuote(Request $request, int $id): JsonResponse
    {
        $quote = QuoteRequest::find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        if (!$quote->canQuote()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be quoted at this time',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'quoted_price' => 'required|numeric|min:0',
            'staff_notes' => 'nullable|string',
            'admin_response' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $quote->submitQuote(
            $request->input('quoted_price'),
            $request->input('staff_notes'),
            $request->input('admin_response')
        );

        // Send email notification to customer
        $this->notifyCustomerOfQuote($quote);

        return response()->json([
            'success' => true,
            'message' => 'Quote submitted and customer notified',
            'data' => $quote->fresh(),
        ]);
    }

    /**
     * Notify customer that their quote is ready
     */
    private function notifyCustomerOfQuote(QuoteRequest $quote): void
    {
        // If user is logged in, notify through their user account
        if ($quote->user_id) {
            $user = User::find($quote->user_id);
            if ($user) {
                $user->notify(new QuoteReadyNotification($quote));
                return;
            }
        }

        // Otherwise, send notification using the contact email
        // Note: For this to work, User model needs CanSendDirectNotification trait
        // or we need to create a temporary notification channel
        // For now, we'll log that email should be sent
        \Log::info("Quote ready email should be sent to: {$quote->contact_email} for quote #{$quote->quote_number}");
    }

    /**
     * Assign quote to staff member (Admin/Staff)
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        $quote = QuoteRequest::find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
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

        // Verify the user has staff role
        $staff = User::find($request->assigned_staff_id);
        if (!$staff->hasRole(['admin', 'staff', 'sales'])) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user must have staff role',
            ], 422);
        }

        $quote->update([
            'assigned_staff_id' => $request->assigned_staff_id,
            'status' => 'under_review',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quote assigned successfully',
            'data' => $quote->fresh(['assignedStaff']),
        ]);
    }

    /**
     * Update quote details (Admin/Staff)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $quote = QuoteRequest::find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:' . implode(',', array_keys(QuoteRequest::STATUSES)),
            'urgency' => 'nullable|in:low,medium,high,critical',
            'budget_range' => 'nullable|string',
            'timeline' => 'nullable|string',
            'preferred_start_date' => 'nullable|date',
            'staff_notes' => 'nullable|string',
            'additional_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $quote->update($request->only([
            'status',
            'urgency', 
            'budget_range',
            'timeline',
            'preferred_start_date',
            'staff_notes',
            'additional_notes',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Quote updated successfully',
            'data' => $quote->fresh(),
        ]);
    }

    /**
     * Convert quote to subscription (Admin/Staff)
     */
    public function convertToSubscription(Request $request, int $id): JsonResponse
    {
        $quote = QuoteRequest::find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        if ($quote->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Only accepted quotes can be converted to subscriptions',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'subscription_id' => 'required|exists:subscriptions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $quote->convertToSubscription($request->subscription_id);

        return response()->json([
            'success' => true,
            'message' => 'Quote converted to subscription successfully',
            'data' => $quote->fresh(['subscription']),
        ]);
    }

    /**
     * Delete/Archive quote request (Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $quote = QuoteRequest::find($id);

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        // Only allow deletion of pending or rejected quotes
        if (!in_array($quote->status, ['pending', 'rejected', 'expired'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete quote in current status',
            ], 400);
        }

        $quote->delete();

        return response()->json([
            'success' => true,
            'message' => 'Quote request deleted successfully',
        ]);
    }

    /**
     * Get quote statistics (Admin/Staff)
     */
    public function statistics(): JsonResponse
    {
        $totalQuotes = QuoteRequest::count();
        $pendingQuotes = QuoteRequest::where('status', 'pending')->count();
        $underReviewQuotes = QuoteRequest::where('status', 'under_review')->count();
        $quotedQuotes = QuoteRequest::where('status', 'quoted')->count();
        $acceptedQuotes = QuoteRequest::where('status', 'accepted')->count();
        $convertedQuotes = QuoteRequest::where('status', 'converted_to_subscription')->count();

        // This month's quotes
        $thisMonthQuotes = QuoteRequest::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Last month's quotes for comparison
        $lastMonthQuotes = QuoteRequest::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        // Quotes by service type
        $byServiceType = QuoteRequest::select('service_type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('service_type')
            ->pluck('count', 'service_type');

        // Quotes by status
        $byStatus = QuoteRequest::select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Average quoted price
        $avgQuotedPrice = QuoteRequest::whereNotNull('quoted_price')
            ->avg('quoted_price');

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total' => $totalQuotes,
                    'pending' => $pendingQuotes,
                    'under_review' => $underReviewQuotes,
                    'quoted' => $quotedQuotes,
                    'accepted' => $acceptedQuotes,
                    'converted' => $convertedQuotes,
                    'this_month' => $thisMonthQuotes,
                    'last_month' => $lastMonthQuotes,
                ],
                'by_service_type' => $byServiceType,
                'by_status' => $byStatus,
                'average_quoted_price' => $avgQuotedPrice ? round($avgQuotedPrice, 2) : 0,
            ],
        ]);
    }

    /**
     * Get available staff for assignment (Admin/Staff)
     */
    public function staff(): JsonResponse
    {
        $staff = User::role(['admin', 'staff', 'sales'])
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }
}

