<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadVisit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    /**
     * Track a page visit (used by navigator.sendBeacon)
     */
    public function trackVisit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vlc_vid' => 'required|string',
            'url' => 'nullable|string',
            'page_title' => 'nullable|string',
            'time_on_page' => 'nullable|integer|min:0',
            'scroll_depth' => 'nullable|integer|min:0|max:100',
            'referrer' => 'nullable|string',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
            'utm_content' => 'nullable|string',
            'utm_term' => 'nullable|string',
            'device_type' => 'nullable|string|in:desktop,mobile,tablet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Find or create lead by visitor ID
        $lead = Lead::where('vlc_vid', $data['vlc_vid'])->first();

        if (!$lead) {
            // Create new lead with visitor ID
            $lead = Lead::create([
                'vlc_vid' => $data['vlc_vid'],
                'source' => 'organic',
                'device_type' => $data['device_type'] ?? 'desktop',
            ]);

            // Set initial UTM params if provided
            if (!empty($data['utm_source'])) {
                $lead->update([
                    'utm_source' => $data['utm_source'],
                    'utm_medium' => $data['utm_medium'] ?? null,
                    'utm_campaign' => $data['utm_campaign'] ?? null,
                    'utm_content' => $data['utm_content'] ?? null,
                    'utm_term' => $data['utm_term'] ?? null,
                ]);
            }
        }

        // Update lead tracking data
        $lead->update([
            'page_views' => $lead->page_views + 1,
            'time_on_site' => ($lead->time_on_site ?? 0) + ($data['time_on_page'] ?? 0),
            'scroll_depth' => max($lead->scroll_depth ?? 0, $data['scroll_depth'] ?? 0),
        ]);

        // Create visit record
        LeadVisit::create([
            'lead_id' => $lead->id,
            'vlc_vid' => $data['vlc_vid'],
            'url' => $data['url'] ?? null,
            'page_title' => $data['page_title'] ?? null,
            'time_on_page' => $data['time_on_page'] ?? 0,
            'scroll_depth' => $data['scroll_depth'] ?? 0,
            'referrer' => $data['referrer'] ?? null,
            'utm_params' => [
                'source' => $data['utm_source'] ?? null,
                'medium' => $data['utm_medium'] ?? null,
                'campaign' => $data['utm_campaign'] ?? null,
                'content' => $data['utm_content'] ?? null,
                'term' => $data['utm_term'] ?? null,
            ],
            'device_type' => $data['device_type'] ?? 'desktop',
        ]);

        // Recalculate score
        $lead->calculateScore();

        return response()->json([
            'success' => true,
            'message' => 'Visit tracked',
            'data' => [
                'vlc_vid' => $lead->vlc_vid,
                'lead_id' => $lead->id,
            ],
        ]);
    }

    /**
     * Capture a lead from CTA buttons (Plan CTA)
     */
    public function capture(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vlc_vid' => 'nullable|string',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'product_id' => 'nullable|exists:products,id',
            'source' => 'required|string|in:plan_cta,quote_form,contact_form,whatsapp,referral',
            'message' => 'nullable|string',
            'is_business' => 'nullable|boolean',
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

        $data = $validator->validated();

        // Check for duplicate leads
        $duplicates = Lead::findDuplicates($data['email'] ?? null, $data['phone'] ?? null);

        if ($duplicates->isNotEmpty()) {
            // Update existing lead instead of creating new
            $lead = $duplicates->first();

            // Merge new data
            $lead->update(array_filter([
                'name' => $data['name'],
                'phone' => $data['phone'] ?? $lead->phone,
                'company_name' => $data['company_name'] ?? $lead->company_name,
                'product_id' => $data['product_id'] ?? $lead->product_id,
                'source' => $data['source'],
                'message' => $data['message'] ?? $lead->message,
                'is_business' => $data['is_business'] ?? $lead->is_business,
                'utm_source' => $data['utm_source'] ?? $lead->utm_source,
                'utm_medium' => $data['utm_medium'] ?? $lead->utm_medium,
                'utm_campaign' => $data['utm_campaign'] ?? $lead->utm_campaign,
                'utm_content' => $data['utm_content'] ?? $lead->utm_content,
                'utm_term' => $data['utm_term'] ?? $lead->utm_term,
            ]));

            $lead->calculateScore();
        } else {
            // Create new lead
            $lead = Lead::create([
                'vlc_vid' => $data['vlc_vid'] ?? Lead::generateVisitorId(),
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'company_name' => $data['company_name'] ?? null,
                'product_id' => $data['product_id'] ?? null,
                'source' => $data['source'],
                'message' => $data['message'] ?? null,
                'is_business' => $data['is_business'] ?? false,
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
                'utm_content' => $data['utm_content'] ?? null,
                'utm_term' => $data['utm_term'] ?? null,
                'status' => 'new',
            ]);

            $lead->calculateScore();
        }

        // Auto-assign to staff if not assigned
        if (!$lead->assigned_staff_id) {
            $lead->autoAssign();
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead captured successfully',
            'data' => [
                'lead_id' => $lead->id,
                'score' => $lead->score,
                'status' => $lead->status,
            ],
        ], 201);
    }

    /**
     * Register interest for coverage waitlist
     */
    public function waitlist(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vlc_vid' => 'nullable|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'area' => 'nullable|string|max:255',
            'device_type' => 'nullable|string|in:desktop,mobile,tablet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Check for duplicate leads
        $duplicates = Lead::findDuplicates($data['email'] ?? null, $data['phone'] ?? null);

        if ($duplicates->isNotEmpty()) {
            $lead = $duplicates->first();
            $lead->update(array_filter([
                'name' => $data['name'],
                'phone' => $data['phone'] ?? $lead->phone,
                'device_type' => $data['device_type'] ?? $lead->device_type,
            ]));
            $lead->calculateScore();
        } else {
            $lead = Lead::create([
                'vlc_vid' => $data['vlc_vid'] ?? Lead::generateVisitorId(),
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'source' => 'coverage_checker',
                'message' => 'Interest in area: ' . ($data['area'] ?? 'Not specified'),
                'device_type' => $data['device_type'] ?? 'desktop',
                'status' => 'new',
            ]);

            $lead->calculateScore();
        }

        // Auto-assign
        if (!$lead->assigned_staff_id) {
            $lead->autoAssign();
        }

        return response()->json([
            'success' => true,
            'message' => 'You have been added to our waitlist. We will notify you when coverage is available in your area.',
            'data' => [
                'lead_id' => $lead->id,
            ],
        ], 201);
    }

    /**
     * Newsletter signup
     */
    public function newsletter(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vlc_vid' => 'nullable|string',
            'email' => 'required|email|max:255',
            'device_type' => 'nullable|string|in:desktop,mobile,tablet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Check for duplicate leads
        $duplicates = Lead::findDuplicates($data['email'] ?? null, null);

        if ($duplicates->isNotEmpty()) {
            $lead = $duplicates->first();
            $lead->update([
                'device_type' => $data['device_type'] ?? $lead->device_type,
            ]);
            $lead->calculateScore();
        } else {
            $lead = Lead::create([
                'vlc_vid' => $data['vlc_vid'] ?? Lead::generateVisitorId(),
                'email' => $data['email'],
                'source' => 'newsletter',
                'device_type' => $data['device_type'] ?? 'desktop',
                'status' => 'new',
            ]);

            $lead->calculateScore();
        }

        // Auto-assign lead to staff (so it shows in lead management properly assigned)
        if (!$lead->assigned_staff_id) {
            $lead->autoAssign();
        }

        // Send welcome email to the subscriber and notify admin
        try {
            // To the subscriber
            \Illuminate\Support\Facades\Notification::route('mail', $data['email'])
                ->notify(new \App\Notifications\NewsletterSubscriptionNotification());
                
            // To the admin/subscription management
            $adminEmail = config('mail.from.address', 'customercare@vilcom.co.ke');
            \Illuminate\Support\Facades\Notification::route('mail', $adminEmail)
                ->notify(new \App\Notifications\NewNewsletterSubscriptionAdminNotification($data['email'], $lead->id));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send newsletter emails: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for subscribing to our newsletter!',
            'data' => [
                'lead_id' => $lead->id,
            ],
        ], 201);
    }

    /**
     * Capture booking abandonment (partial lead)
     */
    public function captureAbandonment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'vlc_vid' => 'nullable|string',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'product_id' => 'nullable|exists:products,id',
            'booking_data' => 'nullable|array',
            'device_type' => 'nullable|string|in:desktop,mobile,tablet',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Check for duplicate leads
        $duplicates = Lead::findDuplicates($data['email'] ?? null, $data['phone'] ?? null);

        if ($duplicates->isNotEmpty()) {
            $lead = $duplicates->first();
            $lead->update(array_filter([
                'name' => $data['name'] ?? $lead->name,
                'phone' => $data['phone'] ?? $lead->phone,
                'product_id' => $data['product_id'] ?? $lead->product_id,
                'message' => 'Booking abandonment - Partial data: ' . json_encode($data['booking_data'] ?? []),
                'device_type' => $data['device_type'] ?? $lead->device_type,
                'utm_source' => $data['utm_source'] ?? $lead->utm_source,
                'utm_medium' => $data['utm_medium'] ?? $lead->utm_medium,
                'utm_campaign' => $data['utm_campaign'] ?? $lead->utm_campaign,
            ]));
            $lead->calculateScore();
        } else {
            $lead = Lead::create([
                'vlc_vid' => $data['vlc_vid'] ?? Lead::generateVisitorId(),
                'name' => $data['name'] ?? 'Unknown',
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'product_id' => $data['product_id'] ?? null,
                'source' => 'booking_partial',
                'message' => 'Booking abandonment - Partial data: ' . json_encode($data['booking_data'] ?? []),
                'device_type' => $data['device_type'] ?? 'desktop',
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
                'status' => 'new',
            ]);

            $lead->calculateScore();
        }

        // Auto-assign
        if (!$lead->assigned_staff_id) {
            $lead->autoAssign();
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead captured',
            'data' => [
                'lead_id' => $lead->id,
                'score' => $lead->score,
            ],
        ], 201);
    }

    /**
     * Generate a new visitor ID
     */
    public function generateVisitorId(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'vlc_vid' => Lead::generateVisitorId(),
            ],
        ]);
    }
}

