<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WhatsappMessageController extends Controller
{
    /**
     * Store a new WhatsApp message lead (public endpoint)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'nullable|string|max:20',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'message' => 'required|string|max:1000',
            'message_type' => 'nullable|in:predefined,custom',
            'page_url' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Determine message type
        $messageType = $request->input('message_type', 'custom');

        // If user is logged in, associate with user
        $userId = auth()->check() ? auth()->id() : null;

        // Get IP and user agent
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        $whatsappMessage = WhatsappMessage::create([
            'phone' => $request->input('phone'),
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'message' => $request->input('message'),
            'message_type' => $messageType,
            'status' => 'pending',
            'source' => $request->header('User-Agent') ? 'website' : 'website',
            'page_url' => $request->input('page_url', url()->previous()),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp message logged successfully',
            'data' => $whatsappMessage,
        ], 201);
    }

    /**
     * Get predefined message options (public endpoint)
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

