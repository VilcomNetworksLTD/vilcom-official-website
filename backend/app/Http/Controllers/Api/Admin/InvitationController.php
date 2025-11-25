<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaffInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Notifications\StaffInvitationNotification;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * List all invitations (pending, accepted, expired)
     */
    public function index(Request $request)
    {
        $query = StaffInvitation::with('inviter:id,name,email');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $invitations = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($invitations);
    }

    /**
     * Send invitation to a staff member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email|unique:staff_invitations,email,NULL,id,status,pending',
            'role' => 'required|in:admin,staff,sales,technical_support',
            'expires_days' => 'nullable|integer|min:1|max:30',
        ]);

        // Check if user already exists with this email
        $existingUser = \App\Models\User::where('email', $validated['email'])->first();
        
        if ($existingUser) {
            // If user exists, just assign the role directly
            $existingUser->assignRole($validated['role']);
            
            return response()->json([
                'message' => 'User already exists. Role has been assigned directly.',
                'user' => $existingUser,
            ], 200);
        }

        // Check for existing pending invitation
        $existingInvitation = StaffInvitation::valid()
            ->where('email', $validated['email'])
            ->first();

        if ($existingInvitation) {
            return response()->json([
                'message' => 'A pending invitation already exists for this email.',
            ], 422);
        }

        // Create invitation
        $invitation = StaffInvitation::create([
            'email' => $validated['email'],
            'role' => $validated['role'],
            'token' => Str::random(64),
            'invited_by' => auth()->id(),
            'expires_at' => now()->addDays($validated['expires_days'] ?? 7),
            'status' => StaffInvitation::STATUS_PENDING,
        ]);

        // Send invitation email
        try {
            Notification::send(
                (object) ['email' => $validated['email'], 'routeNotificationForMail' => fn() => $validated['email']],
                new StaffInvitationNotification($invitation)
            );
        } catch (\Exception $e) {
            // Log error but don't fail the operation
            \Illuminate\Support\Facades\Log::error('Failed to send invitation email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Invitation sent successfully.',
            'invitation' => $invitation->load('inviter:id,name'),
        ], 201);
    }

    /**
     * Resend invitation
     */
    public function resend(StaffInvitation $invitation)
    {
        abort_if($invitation->status !== StaffInvitation::STATUS_PENDING, 404, 'Invitation is not pending');
        abort_if(!$invitation->isValid(), 400, 'Invitation has expired');

        // Generate new token
        $invitation->update([
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
        ]);

        // Send invitation email
        try {
            Notification::send(
                (object) ['email' => $invitation->email, 'routeNotificationForMail' => fn() => $invitation->email],
                new StaffInvitationNotification($invitation)
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to resend invitation email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Invitation resent successfully.',
        ]);
    }

    /**
     * Cancel/Revoke invitation
     */
    public function destroy(StaffInvitation $invitation)
    {
        abort_if($invitation->status !== StaffInvitation::STATUS_PENDING, 400, 'Can only cancel pending invitations');

        $invitation->update(['status' => StaffInvitation::STATUS_EXPIRED]);

        return response()->json([
            'message' => 'Invitation cancelled successfully.',
        ]);
    }

    /**
     * Get invitation statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => StaffInvitation::count(),
            'pending' => StaffInvitation::where('status', StaffInvitation::STATUS_PENDING)->count(),
            'accepted' => StaffInvitation::where('status', StaffInvitation::STATUS_ACCEPTED)->count(),
            'expired' => StaffInvitation::where('status', StaffInvitation::STATUS_EXPIRED)->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Accept invitation and create/register staff user
     */
    public function accept(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Find invitation by token
        $invitation = StaffInvitation::where('token', $validated['token'])->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Invalid invitation token.',
            ], 404);
        }

        if ($invitation->status !== StaffInvitation::STATUS_PENDING) {
            return response()->json([
                'message' => 'This invitation has already been ' . $invitation->status,
            ], 400);
        }

        if (!$invitation->isValid()) {
            $invitation->markAsExpired();
            return response()->json([
                'message' => 'This invitation has expired.',
            ], 400);
        }

        // Check if user already exists
        $existingUser = \App\Models\User::where('email', $invitation->email)->first();

        if ($existingUser) {
            // User exists - just assign the role
            $existingUser->assignRole($invitation->role);
            $invitation->markAsAccepted();

            return response()->json([
                'message' => 'Your account has been updated with staff access.',
                'user' => $existingUser,
            ]);
        }

        // Create new user with staff role
        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $invitation->email,
            'phone' => $validated['phone'],
            'password' => $validated['password'],
            'email_verified_at' => now(),
        ]);

        // Assign the invited role
        $user->assignRole($invitation->role);

        // Mark invitation as accepted
        $invitation->markAsAccepted();

        return response()->json([
            'message' => 'Staff account created successfully.',
            'user' => $user,
        ], 201);
    }
}

