<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ContactMessageController extends Controller
{
    /**
     * Store a new contact message (public endpoint)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|in:sales,support,billing,other',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If user is logged in, associate with user
        $userId = auth()->check() ? auth()->id() : null;

        // Get IP and user agent
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        $contactMessage = ContactMessage::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'department' => $request->input('department', 'other'),
            'subject' => $request->input('subject'),
            'message' => $request->input('message'),
            'status' => 'pending',
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);

        // TODO: Send email notification to admin/staff
        // You can dispatch a job or use notification here

        return response()->json([
            'success' => true,
            'message' => 'Thank you for contacting us! We will get back to you shortly.',
            'data' => $contactMessage,
        ], 201);
    }

    /**
     * Get departments list (public endpoint)
     */
    public function departments(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['value' => 'sales', 'label' => 'Sales'],
                ['value' => 'support', 'label' => 'Support'],
                ['value' => 'billing', 'label' => 'Billing'],
                ['value' => 'other', 'label' => 'Other'],
            ],
        ]);
    }
}

