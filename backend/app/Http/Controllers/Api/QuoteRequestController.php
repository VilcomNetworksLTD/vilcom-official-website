<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
use App\Models\Product;
use App\Models\User;
use App\Notifications\NewQuoteRequestNotification;
use App\Http\Requests\QuoteRequest\StoreQuoteRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class QuoteRequestController extends Controller
{
    /**
     * Submit a new quote request (Public API)
     */
    public function store(StoreQuoteRequest $request): JsonResponse
    {
        // Log incoming request for debugging
        Log::channel('quotes')->info('Quote request received', $request->all());

        $data = $request->validated();

        // Generate unique quote number
        $data['quote_number'] = QuoteRequest::generateQuoteNumber();

        // Map product type to service type if product is provided
        if (!empty($data['product_id'])) {
            $product = Product::find($data['product_id']);
            if ($product && empty($data['service_type'])) {
                $data['service_type'] = $this->mapProductTypeToServiceType($product->type);
            }
        }

        // Map service type based on product
        if (empty($data['service_type'])) {
            $data['service_type'] = 'other';
        }

        // Associate with user if authenticated
        if (auth()->check()) {
            $data['user_id'] = auth()->id();
        }

        // Set default urgency
        $data['urgency'] = $data['urgency'] ?? 'medium';
        $data['source'] = $data['source'] ?? 'web';
        $data['status'] = $data['status'] ?? 'pending';

        // Create quote request
        $quoteRequest = QuoteRequest::create($data);

        // Send notification to all admin/staff users
        $this->notifyStaffOfNewQuote($quoteRequest);

        return response()->json([
            'success' => true,
            'message' => 'Quote request submitted successfully',
            'data' => [
                'quote_number' => $quoteRequest->quote_number,
                'id' => $quoteRequest->id,
                'service_type' => $quoteRequest->service_type,
                'status' => $quoteRequest->status ?? 'pending',
                'submitted_at' => $quoteRequest->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Notify staff members of new quote request
     */
    private function notifyStaffOfNewQuote(QuoteRequest $quoteRequest): void
    {
        // Get all admin and staff users
        $staffMembers = User::role(['admin', 'staff', 'sales'])
            ->where('is_active', true)
            ->get();

        foreach ($staffMembers as $staff) {
            $staff->notify(new NewQuoteRequestNotification($quoteRequest));
        }
    }

    /**
     * Get user's quote requests (Authenticated)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = QuoteRequest::where('user_id', $user->id)
            ->with(['product:id,name,slug'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by service type
        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        $quotes = $query->paginate($request->get('per_page', 10));

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
     * Get single quote request details (Authenticated - owner or admin)
     */
    public function show(Request $request, string $quoteNumber): JsonResponse
    {
        $user = $request->user();

        $quote = QuoteRequest::where('quote_number', $quoteNumber)
            ->with(['product:id,name,slug', 'assignedStaff:id,name,email'])
            ->first();

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        // Check authorization - owner or admin/staff
        if ($quote->user_id !== $user->id && !$user->hasRole(['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $quote,
        ]);
    }

    /**
     * Customer responds to a quote (Accept/Reject)
     */
    public function respond(Request $request, string $quoteNumber): JsonResponse
    {
        $user = $request->user();

        $quote = QuoteRequest::where('quote_number', $quoteNumber)->first();

        if (!$quote) {
            return response()->json([
                'success' => false,
                'message' => 'Quote request not found',
            ], 404);
        }

        // Check authorization
        if ($quote->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$quote->canCustomerRespond()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be responded to at this time',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'response' => 'required|in:accepted,rejected',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $response = $request->input('response');
        $notes = $request->input('notes');

        if ($response === 'accepted') {
            $quote->accept($notes);

            return response()->json([
                'success' => true,
                'message' => 'Quote accepted! Our team will contact you shortly to proceed with the service.',
                'data' => [
                    'quote_number' => $quote->quote_number,
                    'status' => $quote->status,
                    'quoted_price' => $quote->quoted_price,
                ],
            ]);
        } else {
            $quote->reject($notes);

            return response()->json([
                'success' => true,
                'message' => 'Quote rejected. We appreciate your feedback.',
                'data' => [
                    'quote_number' => $quote->quote_number,
                    'status' => $quote->status,
                ],
            ]);
        }
    }

    /**
     * Get available service types (Public)
     */
    public function serviceTypes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => QuoteRequest::SERVICE_TYPES,
        ]);
    }

    /**
     * Get technical fields for a specific service type (Public)
     */
    public function technicalFields(Request $request): JsonResponse
    {
        $serviceType = $request->get('service_type', 'other');

        $fields = QuoteRequest::getTechnicalFieldsForType($serviceType);

        return response()->json([
            'success' => true,
            'data' => [
                'service_type' => $serviceType,
                'service_type_label' => QuoteRequest::SERVICE_TYPES[$serviceType] ?? 'Other',
                'fields' => $fields,
            ],
        ]);
    }

    /**
     * Get budget ranges and timeline options (Public)
     */
    public function options(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'budget_ranges' => QuoteRequest::BUDGET_RANGES,
                'timeline_options' => QuoteRequest::TIMELINE_OPTIONS,
                'urgency_levels' => QuoteRequest::URGENCY_LEVELS,
            ],
        ]);
    }

    /**
     * Map product type to service type
     */
    private function mapProductTypeToServiceType(string $productType): string
    {
        $mapping = [
            'internet_plan' => 'internet_plan',
            'hosting_package' => 'hosting_package',
            'domain' => 'hosting_package',
            'web_development' => 'web_development',
            'cloud_services' => 'cloud_services',
            'cyber_security' => 'cyber_security',
            'network_infrastructure' => 'network_infrastructure',
            'isp_services' => 'isp_services',
            'cpe_device' => 'cpe_device',
            'satellite_connectivity' => 'satellite_connectivity',
            'media_services' => 'media_services',
            'erp_services' => 'erp_services',
            'smart_integration' => 'smart_integration',
        ];

        return $mapping[$productType] ?? 'other';
    }
}

