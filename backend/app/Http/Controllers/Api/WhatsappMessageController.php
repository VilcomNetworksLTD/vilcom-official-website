<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class WhatsappMessageController extends Controller
{
    /**
     * Store a new WhatsApp message lead (Dual Storage)
     *
     * 1. Saves to 'whatsapp_messages' table (Specific Message History).
     * 2. Saves to 'leads' table (CRM, Scoring, Auto-Assignment).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validate Request (Added vlc_vid and device_type for Lead tracking)
        $validator = Validator::make($request->all(), [
            'vlc_vid'       => 'nullable|string',
            'phone'         => 'nullable|string|max:20',
            'name'          => 'nullable|string|max:255',
            'email'         => 'nullable|email|max:255',
            'message'       => 'required|string|max:1000',
            'message_type'  => 'nullable|in:predefined,custom',
            'page_url'      => 'nullable|string|max:500',
            'device_type'   => 'nullable|string|in:desktop,mobile,tablet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // 2. Save to WhatsApp Messages Table (Primary Source for the specific chat)
        $messageType = $data['message_type'] ?? 'custom';
        $userId = auth()->check() ? auth()->id() : null;
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        $whatsappMessage = WhatsappMessage::create([
            'phone'       => $data['phone'] ?? null,
            'name'        => $data['name'] ?? null,
            'email'       => $data['email'] ?? null,
            'message'     => $data['message'],
            'message_type'=> $messageType,
            'status'      => 'pending',
            'source'      => 'website',
            'page_url'    => $data['page_url'] ?? url()->previous(),
            'ip_address'  => $ipAddress,
            'user_agent'  => $userAgent,
            'user_id'     => $userId,
        ]);

        \App\Models\Activity::create([
            'action' => 'WhatsApp Message',
            'description' => 'New WhatsApp message received from ' . ($data['name'] ?? $data['phone'] ?? 'a visitor'),
            'type' => 'info',
        ]);

        // 3. Save to Leads Table (Secondary Source for CRM Logic)
        try {
            // Check for duplicate lead by email or phone
            $lead = Lead::where('email', $data['email'] ?? null)
                ->orWhere('phone', $data['phone'] ?? null)
                ->first();

            $leadData = [
                'vlc_vid'     => $data['vlc_vid'] ?? Lead::generateVisitorId(),
                'name'        => $data['name'] ?? null,
                'email'       => $data['email'] ?? null,
                'phone'       => $data['phone'] ?? null,
                'source'      => 'whatsapp', // Identify source
                'message'     => $data['message'],
                'device_type' => $data['device_type'] ?? 'desktop',
            ];

            if ($lead) {
                // Update existing lead (Merge data)
                $lead->update(array_filter($leadData));
            } else {
                // Create new lead
                $lead = Lead::create(array_merge($leadData, ['status' => 'new']));
            }

            // Trigger Lead Scoring Logic
            $lead->calculateScore();

            // Trigger Auto-Assignment Logic
            if (!$lead->assigned_staff_id) {
                $lead->autoAssign();
            }

        } catch (\Exception $e) {
            // If Lead creation fails, log it but DON'T stop the WhatsApp message from saving
            // This ensures your WhatsApp dashboard always works even if Lead logic has a bug.
            Log::error('WhatsApp Dual-Write to Leads Failed: ' . $e->getMessage());
        }

        // 4. Return Response
        return response()->json([
            'success' => true,
            'message' => 'WhatsApp message logged successfully',
            'data'    => $whatsappMessage,
        ], 201);
    }

    /**
     * Get predefined message options (Public endpoint)
     * Used by the React widget to populate the initial selection buttons.
     *
     * @return JsonResponse
     */
    public function options(): JsonResponse
    {
        $predefinedMessages = [
            [
                'id' => 'coverage',
                'title' => 'Check Coverage',
                'description' => 'I want to check if my area is covered',
                'icon' => 'map-pin',
            ],
            [
                'id' => 'plans',
                'title' => 'View Plans',
                'description' => 'I want to see available internet plans',
                'icon' => 'list',
            ],
            [
                'id' => 'quote',
                'title' => 'Get Quote',
                'description' => 'I need a custom quote for my needs',
                'icon' => 'file-text',
            ],
            [
                'id' => 'support',
                'title' => 'Technical Support',
                'description' => 'I need help with my connection',
                'icon' => 'help-circle',
            ],
            [
                'id' => 'billing',
                'title' => 'Billing Inquiry',
                'description' => 'I have a question about billing',
                'icon' => 'credit-card',
            ],
            [
                'id' => 'other',
                'title' => 'General Inquiry',
                'description' => 'I have another question',
                'icon' => 'message-circle',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $predefinedMessages,
            'whatsapp_number' => '0726888777',
        ]);
    }
}
