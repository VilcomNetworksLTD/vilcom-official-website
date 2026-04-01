<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\EmeraldBillingOrchestrator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        protected EmeraldBillingOrchestrator $orchestrator
    ) {}

    // ════════════════════════════════════════════════════════════════════
    // LIST / SEARCH
    // ════════════════════════════════════════════════════════════════════

    /**
     * List users with role-based filtering.
     *
     * Admin  → all users
     * Staff  → clients only
     * Sales  → clients only
     */
    public function index(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $query       = User::with(['roles', 'subscriptions']);

        // ── Role filter ──────────────────────────────────────────────────
        if ($request->has('roles') && is_array($request->roles)) {
            $query->whereHas('roles', fn($q) =>
                $q->whereIn('name', $request->roles)
            );
        } elseif ($request->has('role')) {
            $query->role($request->role);
        } elseif (!$currentUser->hasRole('admin')) {
            $query->whereHas('roles', fn($q) =>
                $q->whereIn('name', ['client', 'staff', 'sales', 'technical_support'])
            );
        }

        // ── Filters ──────────────────────────────────────────────────────
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('customer_type')) {
            $query->where('customer_type', $request->customer_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) =>
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
            );
        }

        if ($request->filled('department')) {
            $query->byDepartment($request->department);
        }

        // ── Has / has-not Emerald account ────────────────────────────────
        if ($request->filled('has_emerald')) {
            if ($request->boolean('has_emerald')) {
                $query->whereNotNull('emerald_mbr_id');
            } else {
                $query->whereNull('emerald_mbr_id');
            }
        }

        // ── Sort & paginate ──────────────────────────────────────────────
        $query->orderBy(
            $request->sort_by    ?? 'created_at',
            $request->sort_order ?? 'desc'
        );

        $users = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data'    => UserResource::collection($users),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }


    // ════════════════════════════════════════════════════════════════════
    // UPDATE CURRENT (own profile via PUT /v1/auth/user)
    // ════════════════════════════════════════════════════════════════════

    /**
     * Update the currently-authenticated user's own profile.
     *
     * Accessible via:  PUT /v1/auth/user
     *
     * Allowed fields (same restricted set as the own-profile branch in update()):
     *   name, phone, address, city, county, country, postal_code
     *
     * Returns the updated UserResource so the frontend can refresh its
     * cached user object without a second GET /v1/auth/user call.
     */
    public function updateCurrent(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'address'     => 'nullable|string|max:500',
            'city'        => 'nullable|string|max:100',
            'county'      => 'nullable|string|max:100',
            'country'     => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => new UserResource($user->load('roles.permissions')),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════════════════════════════════

    /**
     * Create a user (Staff/Admin only).
     * Staff can only create clients.
     * Admin can create any role.
     */
    public function store(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        $allowedRoles = match (true) {
            $currentUser->hasRole('admin')           => ['client', 'staff', 'sales', 'technical_support', 'web_developer', 'content_manager', 'hr'],
            $currentUser->hasAnyRole(['staff','sales']) => ['client'],
            default                                  => [],
        };

        if (empty($allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create users.',
            ], 403);
        }

        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'email'                => 'required|email|unique:users,email',
            'password'             => 'required|string|min:8|confirmed',
            'phone'                => 'nullable|string|max:20',
            'customer_type'        => 'required|in:individual,business',
            'company_name'         => 'nullable|string|max:255',
            'company_registration' => 'nullable|string|max:100',
            'tax_pin'              => 'nullable|string|max:50',
            'address'              => 'nullable|string|max:500',
            'city'                 => 'nullable|string|max:100',
            'county'               => 'nullable|string|max:100',
            'country'              => 'nullable|string|max:100',
            'postal_code'          => 'nullable|string|max:20',
            'role'                 => ['required', Rule::in($allowedRoles)],
            'product_id'           => 'nullable|exists:products,id', // optional Emerald provision
        ]);

        $newUser = User::create([
            'name'                 => $validated['name'],
            'email'                => $validated['email'],
            'password'             => $validated['password'],
            'phone'                => $validated['phone'] ?? null,
            'customer_type'        => $validated['customer_type'],
            'company_name'         => $validated['company_name'] ?? null,
            'company_registration' => $validated['company_registration'] ?? null,
            'tax_pin'              => $validated['tax_pin'] ?? null,
            'address'              => $validated['address'] ?? null,
            'city'                 => $validated['city'] ?? null,
            'county'               => $validated['county'] ?? null,
            'country'              => $validated['country'] ?? 'Kenya',
            'postal_code'          => $validated['postal_code'] ?? null,
            'status'               => 'active',
        ]);

        $newUser->assignRole($validated['role']);

        // Optionally provision Emerald if product provided
        if (!empty($validated['product_id'])) {
            $result = $this->orchestrator->provisionNewSubscriber(
                $newUser,
                (int) $validated['product_id']
            );

            if ($result->isFailed()) {
                Log::warning('Emerald provisioning failed on manual user create', [
                    'user_id'    => $newUser->id,
                    'product_id' => $validated['product_id'],
                    'reason'     => $result->message,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data'    => new UserResource($newUser->load('roles.permissions')),
        ], 201);
    }

    // ════════════════════════════════════════════════════════════════════
    // READ
    // ════════════════════════════════════════════════════════════════════

    /**
     * Show a single user.
     * Own profile / admin / staff-viewing-client.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        $canView = $currentUser->id === $user->id
            || $currentUser->hasRole('admin')
            || ($currentUser->hasAnyRole(['staff', 'sales', 'technical_support'])
                && $user->hasRole('client'));

        if (!$canView) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this user.',
            ], 403);
        }

        $user->load(['roles.permissions', 'subscriptions', 'invoices', 'tickets']);

        return response()->json([
            'success' => true,
            'data'    => new UserResource($user),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // UPDATE
    // ════════════════════════════════════════════════════════════════════

    /**
     * Update a user.
     *
     * Own profile  → limited fields
     * Admin        → all fields + role change
     * Staff/Sales  → client fields only
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $currentUser  = $request->user();
        $isOwnProfile = $currentUser->id === $user->id;

        if ($isOwnProfile) {
            $validated = $request->validate([
                'name'        => 'sometimes|string|max:255',
                'phone'       => 'nullable|string|max:20',
                'address'     => 'nullable|string|max:500',
                'city'        => 'nullable|string|max:100',
                'county'      => 'nullable|string|max:100',
                'country'     => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
            ]);

        } elseif ($currentUser->hasRole('admin')) {
            $validated = $request->validate([
                'name'                 => 'sometimes|string|max:255',
                'email'                => 'sometimes|email|unique:users,email,' . $user->id,
                'phone'                => 'nullable|string|max:20',
                'company_name'         => 'nullable|string|max:255',
                'company_registration' => 'nullable|string|max:100',
                'tax_pin'              => 'nullable|string|max:50',
                'address'              => 'nullable|string|max:500',
                'city'                 => 'nullable|string|max:100',
                'county'               => 'nullable|string|max:100',
                'country'              => 'nullable|string|max:100',
                'postal_code'          => 'nullable|string|max:20',
                'customer_type'        => 'sometimes|in:individual,business',
                'status'               => 'sometimes|in:active,inactive,suspended,pending_verification',
                'role'                 => 'sometimes|exists:roles,name',
            ]);

            if (isset($validated['role'])) {
                $user->syncRoles([$validated['role']]);
                unset($validated['role']);
            }

        } elseif ($currentUser->hasAnyRole(['staff', 'sales']) && $user->hasRole('client')) {
            $validated = $request->validate([
                'name'                 => 'sometimes|string|max:255',
                'phone'                => 'nullable|string|max:20',
                'company_name'         => 'nullable|string|max:255',
                'company_registration' => 'nullable|string|max:100',
                'address'              => 'nullable|string|max:500',
                'city'                 => 'nullable|string|max:100',
                'county'               => 'nullable|string|max:100',
                'country'              => 'nullable|string|max:100',
                'postal_code'          => 'nullable|string|max:20',
                'status'               => 'sometimes|in:active,inactive,suspended',
            ]);

        } else {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this user.',
            ], 403);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => new UserResource($user->load('roles.permissions')),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // DELETE
    // ════════════════════════════════════════════════════════════════════

    /**
     * Delete a user (Admin only).
     * Cannot delete: yourself, other admins, users with active subscriptions.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete users.',
            ], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete administrator accounts.',
            ], 422);
        }

        if ($user->subscriptions()->where('status', 'active')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with active subscriptions. Cancel them first.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // SUSPEND / ACTIVATE
    // ════════════════════════════════════════════════════════════════════

    /**
     * Suspend a user and their subscriptions.
     * Syncs suspension to Emerald via orchestrator.
     */
    public function suspend(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($user->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot suspend your own account.',
            ], 422);
        }

        if ($user->hasRole('admin') && !$currentUser->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot suspend administrator accounts.',
            ], 422);
        }

        if ($currentUser->hasAnyRole(['staff', 'sales']) && !$user->hasRole('client')) {
            return response()->json([
                'success' => false,
                'message' => 'Staff can only suspend client accounts.',
            ], 422);
        }

        if ($user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'User is already suspended.',
            ], 422);
        }

        // Suspend in local DB
        $user->suspend($validated['reason']);

        $user->subscriptions()->where('status', 'active')->update([
            'status'       => 'suspended',
            'suspended_at' => now(),
        ]);

        // Sync to Emerald via orchestrator
        $this->orchestrator->suspendSubscriber($user);

        Log::info('User suspended', [
            'suspended_by' => $currentUser->id,
            'user_id'      => $user->id,
            'reason'       => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User suspended successfully.',
            'data'    => new UserResource($user),
        ]);
    }

    /**
     * Reactivate a suspended user.
     * Syncs activation to Emerald via orchestrator.
     */
    public function activate(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->hasAnyRole(['staff', 'sales']) && !$user->hasRole('client')) {
            return response()->json([
                'success' => false,
                'message' => 'Staff can only activate client accounts.',
            ], 422);
        }

        if (!$user->isSuspended()) {
            return response()->json([
                'success' => false,
                'message' => 'User is not suspended.',
            ], 422);
        }

        // Reactivate in local DB
        $user->activate();

        $user->subscriptions()->where('status', 'suspended')->update([
            'status'       => 'active',
            'suspended_at' => null,
        ]);

        // Sync to Emerald via orchestrator
        $this->orchestrator->activateSubscriber($user);

        Log::info('User activated', [
            'activated_by' => $currentUser->id,
            'user_id'      => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully.',
            'data'    => new UserResource($user),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // EMERALD PROVISIONING
    // ════════════════════════════════════════════════════════════════════

    /**
     * Manually provision an Emerald MBR for a user.
     * Used when:
     * - User registered without selecting a product
     * - Provisioning failed at signup
     * - Staff creates a user manually
     *
     * Admin / Staff only.
     */
    public function provisionEmerald(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasAnyRole(['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions.',
            ], 403);
        }

        if ($user->emerald_mbr_id) {
            return response()->json([
                'success' => false,
                'message' => "User already provisioned (MBR ID: {$user->emerald_mbr_id}).",
            ], 422);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $result = $this->orchestrator->provisionNewSubscriber(
            $user,
            (int) $request->product_id
        );

        if ($result->isSuccess()) {
            return response()->json([
                'success'     => true,
                'message'     => 'Emerald MBR provisioned successfully.',
                'customer_id' => $result->customerId,
                'account_id'  => $result->accountId,
                'data'        => new UserResource($user->fresh()),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Provisioning failed: ' . ($result->message ?? 'Unknown error'),
        ], 422);
    }

    // ════════════════════════════════════════════════════════════════════
    // IMPERSONATION
    // ════════════════════════════════════════════════════════════════════

    /**
     * Impersonate a user (Admin only).
     *
     * Creates a separate token so admin can see exactly what the user sees.
     * Tracks original admin ID in session for audit trail.
     */
    public function impersonate(Request $request, User $user): JsonResponse
    {
        $admin = $request->user();

        if (!$admin->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can impersonate users.',
            ], 403);
        }

        if ($user->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot impersonate yourself.',
            ], 422);
        }

        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot impersonate administrator accounts.',
            ], 422);
        }

        $request->session()->put('impersonator_id', $admin->id);

        Log::info('Admin impersonating user', [
            'admin_id'               => $admin->id,
            'admin_email'            => $admin->email,
            'impersonated_user_id'   => $user->id,
            'impersonated_user_email'=> $user->email,
            'ip_address'             => $request->ip(),
        ]);

        $token = $user->createToken('impersonation_' . $user->id)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'You are now impersonating ' . $user->name,
            'data'    => [
                'token'              => $token,
                'user'               => new UserResource($user),
                'impersonator_id'    => $admin->id,
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
                'message' => 'You are not impersonating anyone.',
            ], 422);
        }

        $admin = User::find($impersonatorId);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Original admin account not found.',
            ], 422);
        }

        $request->user()->currentAccessToken()->delete();

        $token = $admin->createToken('auth_token')->plainTextToken;

        $request->session()->forget('impersonator_id');

        Log::info('Stopped impersonating', [
            'admin_id'    => $admin->id,
            'admin_email' => $admin->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Returned to your admin account.',
            'data'    => [
                'token' => $token,
                'user'  => new UserResource($admin),
            ],
        ]);
    }

    /**
     * Check current impersonation status.
     */
    public function impersonationStatus(Request $request): JsonResponse
    {
        $impersonatorId = $request->session()->get('impersonator_id');

        if ($impersonatorId) {
            $impersonator = User::find($impersonatorId);
            return response()->json([
                'success' => true,
                'data'    => [
                    'is_impersonating' => true,
                    'impersonator'     => $impersonator ? [
                        'id'    => $impersonator->id,
                        'name'  => $impersonator->name,
                        'email' => $impersonator->email,
                    ] : null,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'is_impersonating' => false,
                'impersonator'     => null,
            ],
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // STATISTICS & METADATA
    // ════════════════════════════════════════════════════════════════════

    /**
     * User statistics overview (Admin only).
     */
    public function statistics(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'total'               => User::count(),
                'active'              => User::active()->count(),
                'inactive'            => User::inactive()->count(),
                'suspended'           => User::suspended()->count(),
                'pending_verification'=> User::pendingVerification()->count(),

                // Roles
                'clients' => User::clients()->count(),
                'staff'   => User::staff()->count(),
                'admins'  => User::admins()->count(),

                // Type
                'individuals' => User::individuals()->count(),
                'businesses'  => User::businesses()->count(),

                // Verification
                'verified' => User::verified()->count(),

                // Emerald status
                'provisioned_in_emerald'   => User::whereNotNull('emerald_mbr_id')->count(),
                'unprovisioned_in_emerald' => User::whereNull('emerald_mbr_id')
                                                   ->role('client')
                                                   ->count(),

                // Growth
                'registered_last_30_days' => User::where('created_at', '>=', now()->subDays(30))->count(),
                'registered_last_7_days'  => User::where('created_at', '>=', now()->subDays(7))->count(),
            ],
        ]);
    }

    /**
     * Get available roles (based on caller's permissions).
     */
    public function roles(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        $roles = match (true) {
            $currentUser->hasRole('admin')              => Role::whereNotIn('name', ['admin'])->get(),
            $currentUser->hasAnyRole(['staff', 'sales'])=> Role::where('name', 'client')->get(),
            default                                     => collect(),
        };

        if ($roles->isEmpty() && !$currentUser->hasAnyRole(['admin', 'staff', 'sales'])) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view roles.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $roles,
        ]);
    }

    /**
     * Get distinct departments (for staff filtering).
     */
    public function departments(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => User::whereNotNull('department')
                             ->where('department', '!=', '')
                             ->distinct()
                             ->pluck('department'),
        ]);
    }
}
