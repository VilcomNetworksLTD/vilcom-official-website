<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Why Impersonate?
     * 
     * The impersonation feature is critical for:
     * 1. Debugging - Admins can see exactly what a client sees
     * 2. Support - Help customers by viewing their account state
     * 3. Testing - Verify permissions work correctly for different roles
     * 4. Verification - Confirm issue reports from clients
     * 
     * Security: Only admins can impersonate, and it creates a separate
     * auth token while tracking the original admin for audit purposes.
     */

    /**
     * Display a listing of the users.
     * 
     * Multi-tenant filtering:
     * - Admin: can see ALL users (clients + staff)
     * - Staff: can only see clients (not other staff)
     * - Sales: can see clients
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Start query
        $query = User::with(['roles', 'subscriptions']);

        // Role-based filtering (multi-tenant)
        if ($user->hasRole('admin')) {
            // Admin can see all - but can filter
            if ($request->has('role')) {
                $query->role($request->role);
            }
        } elseif ($user->hasAnyRole(['staff', 'sales', 'technical_support'])) {
            // Staff can only see clients, not other staff
            $query->role('client');
        }

        // Status filtering
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Customer type filtering
        if ($request->has('customer_type')) {
            $query->where('customer_type', $request->customer_type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Department filtering (for staff)
        if ($request->has('department')) {
            $query->byDepartment($request->department);
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->per_page ?? 15;
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Store a newly created user (Staff/Admin only).
     * 
     * Staff can only create clients.
     * Admin can create any user type.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Determine what role can be assigned
        if ($user->hasRole('admin')) {
            $allowedRoles = ['client', 'staff', 'sales', 'technical_support', 'web_developer', 'content_manager'];
        } elseif ($user->hasAnyRole(['staff', 'sales'])) {
            // Staff/sales can only create clients
            $allowedRoles = ['client'];
        } else {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create users',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'customer_type' => 'required|in:individual,business',
            'company_name' => 'nullable|string|max:255',
            'company_registration' => 'nullable|string|max:100',
            'tax_pin' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'county' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'role' => ['required', Rule::in($allowedRoles)],
        ]);

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'customer_type' => $validated['customer_type'],
            'company_name' => $validated['company_name'] ?? null,
            'company_registration' => $validated['company_registration'] ?? null,
            'tax_pin' => $validated['tax_pin'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'county' => $validated['county'] ?? null,
            'country' => $validated['country'] ?? 'Kenya',
            'postal_code' => $validated['postal_code'] ?? null,
            'status' => 'active',
        ]);

        // Assign role
        $newUser->assignRole($validated['role']);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => new UserResource($newUser->load('roles')),
        ], 201);
    }

    /**
     * Display the specified user.
     * 
     * Permission-based visibility:
     * - Admin: can view any user
     * - Staff: can view clients
     * - Users can view their own profile
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Users can view their own profile
        if ($currentUser->id === $user->id) {
            $user->load(['roles', 'subscriptions', 'invoices', 'tickets']);
            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ]);
        }

        // Admin can view anyone
        if ($currentUser->hasRole('admin')) {
            $user->load(['roles', 'subscriptions', 'invoices', 'tickets']);
            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ]);
        }

        // Staff can view clients
        if ($currentUser->hasAnyRole(['staff', 'sales', 'technical_support']) && $user->hasRole('client')) {
            $user->load(['roles', 'subscriptions', 'invoices', 'tickets']);
            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'You do not have permission to view this user',
        ], 403);
    }

    /**
     * Update the specified user.
     * 
     * Multi-tenant update rules:
     * - Users can update their own profile (limited fields)
     * - Staff can update clients
     * - Admin can update anyone
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        $isOwnProfile = $currentUser->id === $user->id;

        // Determine editable fields based on role
        if ($isOwnProfile) {
            // Users can update their own profile with limited fields
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'county' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
            ]);
        } elseif ($currentUser->hasRole('admin')) {
            // Admin can update any user with all fields
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'company_name' => 'nullable|string|max:255',
                'company_registration' => 'nullable|string|max:100',
                'tax_pin' => 'nullable|string|max:50',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'county' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'customer_type' => 'sometimes|in:individual,business',
                'status' => 'sometimes|in:active,inactive,suspended,pending_verification',
                'role' => 'sometimes|exists:roles,name',
            ]);

            // Update role if provided
            if (isset($validated['role'])) {
                $user->syncRoles([$validated['role']]);
                unset($validated['role']);
            }
        } elseif ($currentUser->hasAnyRole(['staff', 'sales']) && $user->hasRole('client')) {
            // Staff can update clients
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'nullable|string|max:20',
                'company_name' => 'nullable|string|max:255',
                'company_registration' => 'nullable|string|max:100',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'county' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'status' => 'sometimes|in:active,inactive,suspended',
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this user',
            ], 403);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => new UserResource($user->load('roles')),
        ]);
    }

    /**
     * Remove the specified user (Admin only).
     * 
     * Cannot delete:
     * - Yourself
     * - Users with active subscriptions
     * - Other admins
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Must be admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete users',
            ], 403);
        }

        // Cannot delete yourself
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account',
            ], 422);
        }

        // Cannot delete other admins
        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete administrator accounts',
            ], 422);
        }

        // Check if user has active subscriptions
        if ($user->subscriptions()->where('status', 'active')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with active subscriptions. Cancel subscriptions first.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Suspend the specified user.
     * 
     * Permissions:
     * - Admin: can suspend anyone except other admins
     * - Staff: can suspend clients only
     * 
     * Also suspends user's active subscriptions.
     */
    public function suspend(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Validate reason
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // Cannot suspend yourself
        if ($user->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot suspend your own account',
            ], 422);
        }

        // Cannot suspend other admins
        if ($user->hasRole('admin') && !$currentUser->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot suspend administrator accounts',
            ], 422);
        }

        // Staff can only suspend clients
        if ($currentUser->hasAnyRole(['staff', 'sales']) && !$user->hasRole('client')) {
            return response()->json([
                'success' => false,
                'message' => 'Staff can only suspend client accounts',
            ], 422);
        }

        if ($user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'User is already suspended',
            ], 422);
        }

        $user->suspend($validated['reason']);

        // Suspend active subscriptions
        $user->subscriptions()->where('status', 'active')->update([
            'status' => 'suspended',
            'suspended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User suspended successfully',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Activate/unsuspend the specified user.
     * 
     * Permissions:
     * - Admin: can activate anyone
     * - Staff: can activate clients only
     */
    public function activate(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Staff can only activate clients
        if ($currentUser->hasAnyRole(['staff', 'sales']) && !$user->hasRole('client')) {
            return response()->json([
                'success' => false,
                'message' => 'Staff can only activate client accounts',
            ], 422);
        }

        if (!$user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'User is not suspended',
            ], 422);
        }

        $user->activate();

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Impersonate the specified user (Admin only).
     * 
     * This allows admin to:
     * - See exactly what the user sees
     * - Debug issues reported by users
     * - Test permissions from user perspective
     * - Provide better support
     * 
     * Security: Creates a new token and tracks the original admin.
     */
    public function impersonate(Request $request, User $user): JsonResponse
    {
        $admin = $request->user();

        // Only admins can impersonate
        if (!$admin->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can impersonate users',
            ], 403);
        }

        // Cannot impersonate yourself (use normal auth)
        if ($user->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot impersonate yourself',
            ], 422);
        }

        // Cannot impersonate other admins
        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot impersonate administrator accounts',
            ], 422);
        }

        // Store original admin ID in session for audit
        $request->session()->put('impersonator_id', $admin->id);
        
        // Log impersonation action
        \Log::info('Admin impersonating user', [
            'admin_id' => $admin->id,
            'admin_email' => $admin->email,
            'impersonated_user_id' => $user->id,
            'impersonated_user_email' => $user->email,
            'ip_address' => $request->ip(),
        ]);

        // Create impersonation token
        $token = $user->createToken('impersonation_' . $user->id)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'You are now impersonating ' . $user->name,
            'data' => [
                'token' => $token,
                'user' => new UserResource($user),
                'impersonator_id' => $admin->id,
                'impersonator_email' => $admin->email,
            ],
        ]);
    }

    /**
     * Stop impersonating and return to admin account.
     */
    public function stopImpersonating(Request $request): JsonResponse
    {
        $impersonatorId = $request->session()->get('impersonator_id');

        if (!$impersonatorId) {
            return response()->json([
                'success' => false,
                'message' => 'You are not impersonating anyone',
            ], 422);
        }

        // Get the original admin
        $admin = User::find($impersonatorId);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Original admin account not found',
            ], 422);
        }

        // Revoke current (impersonation) token
        $request->user()->currentAccessToken()->delete();

        // Generate new token for admin
        $token = $admin->createToken('auth_token')->plainTextToken;

        // Clear session
        $request->session()->forget('impersonator_id');

        // Log stop impersonation
        \Log::info('Stopped impersonating user', [
            'admin_id' => $admin->id,
            'admin_email' => $admin->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Returned to your admin account',
            'data' => [
                'token' => $token,
                'user' => new UserResource($admin),
            ],
        ]);
    }

    /**
     * Get user statistics (Admin only).
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => User::count(),
            'active' => User::active()->count(),
            'inactive' => User::inactive()->count(),
            'suspended' => User::suspended()->count(),
            'pending_verification' => User::pendingVerification()->count(),
            
            // Role breakdown
            'clients' => User::clients()->count(),
            'staff' => User::staff()->count(),
            'admins' => User::admins()->count(),
            
            // Customer type
            'individuals' => User::individuals()->count(),
            'businesses' => User::businesses()->count(),
            
            // Verification
            'verified' => User::verified()->count(),
            
            // Growth
            'recent_registrations' => User::where('created_at', '>=', now()->subDays(30))->count(),
            'recent_registrations_7days' => User::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get available roles for user creation.
     * Returns roles based on current user's permissions.
     */
    public function roles(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        
        if ($currentUser->hasRole('admin')) {
            $roles = Role::whereNotIn('name', ['admin'])->get();
        } elseif ($currentUser->hasAnyRole(['staff', 'sales'])) {
            $roles = Role::where('name', 'client')->get();
        } else {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view roles',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Get departments (for staff filtering).
     */
    public function departments(): JsonResponse
    {
        $departments = User::whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->pluck('department');

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    /**
     * Check if current user is impersonating another user.
     */
    public function impersonationStatus(Request $request): JsonResponse
    {
        $impersonatorId = $request->session()->get('impersonator_id');
        
        if ($impersonatorId) {
            $impersonator = User::find($impersonatorId);
            return response()->json([
                'success' => true,
                'data' => [
                    'is_impersonating' => true,
                    'impersonator' => $impersonator ? [
                        'id' => $impersonator->id,
                        'name' => $impersonator->name,
                        'email' => $impersonator->email,
                    ] : null,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'is_impersonating' => false,
                'impersonator' => null,
            ],
        ]);
    }
}

