<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Validation\Rule;

/**
 * RoleController - API Controller for Role Management
 * 
 * Handles CRUD operations for roles and permission assignments.
 * Only accessible to admin users.
 */
class RoleController extends Controller
{
    /**
     * Constructor - Apply admin middleware
     */
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    /**
     * Get all roles with their permissions
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $roles = Role::with('permissions')
                ->orderBy('name')
                ->get()
                ->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'guard_name' => $role->guard_name,
                        'permissions' => $role->permissions->map(function ($permission) {
                            return [
                                'id' => $permission->id,
                                'name' => $permission->name,
                            ];
                        }),
                        'permissions_count' => $role->permissions->count(),
                        'users_count' => $role->users()->count(),
                        'created_at' => $role->created_at,
                        'updated_at' => $role->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Roles retrieved successfully',
                'data' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single role with its permissions
     * 
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Role $role)
    {
        try {
            $role->load('permissions');

            // Get all available permissions grouped by category
            $allPermissions = Permission::all()->groupBy(function ($permission) {
                return explode('.', $permission->name)[0] ?? 'other';
            });

            return response()->json([
                'success' => true,
                'message' => 'Role retrieved successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'users_count' => $role->users()->count(),
                    'available_permissions' => $allPermissions,
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new role
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:roles,name',
                    'regex:/^[a-z_]+$/',
                ],
                'description' => 'nullable|string|max:500',
                'permissions' => 'nullable|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            // Prevent creating protected roles
            $protectedRoles = ['admin', 'staff', 'client'];
            if (in_array($validated['name'], $protectedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot create protected role: ' . implode(', ', $protectedRoles),
                ], 422);
            }

            // Create role
            $role = Role::create([
                'name' => $validated['name'],
                'guard_name' => 'web',
            ]);

            // Assign permissions if provided
            if (!empty($validated['permissions'])) {
                $permissions = Permission::whereIn('name', $validated['permissions'])->get();
                $role->givePermissionTo($permissions);
            }

            $role->load('permissions');

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'permissions_count' => $role->permissions->count(),
                    'created_at' => $role->created_at,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing role
     * 
     * @param Request $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('roles', 'name')->ignore($role->id),
                    'regex:/^[a-z_]+$/',
                ],
                'permissions' => 'nullable|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            // Prevent modifying protected roles
            $protectedRoles = ['admin', 'staff', 'client'];
            if (in_array($role->name, $protectedRoles) && $role->name !== ($validated['name'] ?? $role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify protected role: ' . implode(', ', $protectedRoles),
                ], 422);
            }

            // Update role name if provided
            if (isset($validated['name'])) {
                $role->name = $validated['name'];
                $role->save();
            }

            // Update permissions if provided
            if (isset($validated['permissions'])) {
                // For protected roles, ensure they always have all permissions
                if (in_array($role->name, $protectedRoles)) {
                    $role->syncPermissions(Permission::all());
                } else {
                    $permissions = Permission::whereIn('name', $validated['permissions'])->get();
                    $role->syncPermissions($permissions);
                }
            }

            $role->load('permissions');

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'permissions_count' => $role->permissions->count(),
                    'users_count' => $role->users()->count(),
                    'updated_at' => $role->updated_at,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a role
     * 
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Role $role)
    {
        try {
            // Prevent deleting protected roles
            $protectedRoles = ['admin', 'staff', 'client'];
            if (in_array($role->name, $protectedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete protected role: ' . implode(', ', $protectedRoles),
                ], 422);
            }

            // Check if role has users
            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role with existing users. Please reassign users first.',
                ], 422);
            }

            // Remove all permissions
            $role->revokePermissionTo($role->permissions);
            
            // Delete role
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign permissions to a role
     * 
     * @param Request $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignPermissions(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            // Only admin is immutable (always gets all permissions)
            if ($role->name === 'admin') {
                $role->syncPermissions(Permission::all());
            } else {
                // SYNC: replace the entire permission set with what was submitted
                $permissions = Permission::whereIn('name', $validated['permissions'])->get();
                $role->syncPermissions($permissions);
            }

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            $role->load('permissions');


            return response()->json([
                'success' => true,
                'message' => 'Permissions assigned successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'permissions_count' => $role->permissions->count(),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke permissions from a role
     * 
     * @param Request $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function revokePermissions(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            // Prevent modifying protected roles
            $protectedRoles = ['admin', 'staff', 'client'];
            if (in_array($role->name, $protectedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify permissions for protected roles',
                ], 422);
            }

            $permissions = Permission::whereIn('name', $validated['permissions'])->get();
            $role->revokePermissionTo($permissions);
            $role->load('permissions');

            return response()->json([
                'success' => true,
                'message' => 'Permissions revoked successfully',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];
                    }),
                    'permissions_count' => $role->permissions->count(),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all available permissions grouped by category
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function permissions()
    {
        try {
            $permissions = Permission::all()
                ->groupBy(function ($permission) {
                    return explode('.', $permission->name)[0] ?? 'other';
                })
                ->map(function ($group, $category) {
                    return [
                        'category' => $category,
                        'permissions' => $group->map(function ($permission) {
                            return [
                                'id' => $permission->id,
                                'name' => $permission->name,
                                'description' => $this->getPermissionDescription($permission->name),
                            ];
                        })->values(),
                    ];
                })
                ->values();

            return response()->json([
                'success' => true,
                'message' => 'Permissions retrieved successfully',
                'data' => $permissions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve permissions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get users with a specific role
     * 
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function users(Role $role)
    {
        try {
            $users = $role->users()
                ->select('id', 'name', 'email', 'phone', 'status', 'created_at')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'message' => 'Users retrieved successfully',
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a user's permissions (role-based + directly assigned)
     *
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function userPermissions(\App\Models\User $user)
    {
        try {
            $user->load('roles.permissions');

            // All permissions the user has (via roles + direct)
            $allPermissions = $user->getAllPermissions();

            // Only direct permissions (not via role)
            $directPermissions = $user->getDirectPermissions();

            // Permissions via role (inferred)
            $rolePermissions = $user->getPermissionsViaRoles();

            // All available permissions grouped by category
            $available = Permission::all()->groupBy(function ($p) {
                return explode('.', $p->name)[0] ?? 'other';
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id'    => $user->id,
                        'name'  => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles->pluck('name'),
                    ],
                    'all_permissions'    => $allPermissions->pluck('name'),
                    'direct_permissions' => $directPermissions->pluck('name'),
                    'role_permissions'   => $rolePermissions->pluck('name'),
                    'available_permissions' => $available,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user permissions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign direct permissions to a specific user (on top of their role)
     *
     * @param Request $request
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignUserPermissions(Request $request, \App\Models\User $user)
    {
        try {
            // Prevent assigning permissions to other admins
            if ($user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify permissions for admin users.',
                ], 422);
            }

            $validated = $request->validate([
                'permissions'   => 'required|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            $permissions = Permission::whereIn('name', $validated['permissions'])->get();
            $user->givePermissionTo($permissions);

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'success' => true,
                'message' => count($validated['permissions']) . ' permission(s) assigned to ' . $user->name,
                'data' => [
                    'direct_permissions' => $user->fresh()->getDirectPermissions()->pluck('name'),
                    'all_permissions'    => $user->fresh()->getAllPermissions()->pluck('name'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign permissions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke direct permissions from a specific user
     *
     * @param Request $request
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function revokeUserPermissions(Request $request, \App\Models\User $user)
    {
        try {
            $validated = $request->validate([
                'permissions'   => 'required|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            $permissions = Permission::whereIn('name', $validated['permissions'])->get();
            $user->revokePermissionTo($permissions);

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'success' => true,
                'message' => count($validated['permissions']) . ' direct permission(s) revoked from ' . $user->name,
                'data' => [
                    'direct_permissions' => $user->fresh()->getDirectPermissions()->pluck('name'),
                    'all_permissions'    => $user->fresh()->getAllPermissions()->pluck('name'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke permissions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync (replace all) direct permissions for a specific user
     *
     * @param Request $request
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncUserPermissions(Request $request, \App\Models\User $user)
    {
        try {
            if ($user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify permissions for admin users.',
                ], 422);
            }

            $validated = $request->validate([
                'permissions'   => 'required|array',
                'permissions.*' => 'exists:permissions,name',
            ]);

            $permissions = Permission::whereIn('name', $validated['permissions'])->get();
            $user->syncPermissions($permissions);

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'success' => true,
                'message' => 'Direct permissions updated for ' . $user->name,
                'data' => [
                    'direct_permissions' => $user->fresh()->getDirectPermissions()->pluck('name'),
                    'all_permissions'    => $user->fresh()->getAllPermissions()->pluck('name'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync permissions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change a user's role (admin only)
     *
     * @param Request $request
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUserRole(Request $request, \App\Models\User $user)
    {
        try {
            if ($user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot change role of admin users.',
                ], 422);
            }

            $validated = $request->validate([
                'role' => 'required|exists:roles,name',
            ]);

            if ($validated['role'] === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot promote a user to admin via this endpoint.',
                ], 422);
            }

            // Sync role (replaces all current roles)
            $user->syncRoles([$validated['role']]);

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'success' => true,
                'message' => $user->name . '\'s role updated to ' . $validated['role'],
                'data' => [
                    'user'  => $user->only(['id', 'name', 'email']),
                    'roles' => $user->fresh()->roles->pluck('name'),
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a human-readable description for a permission name.
     * Falls back to ucwords(str_replace) for unknown permissions.
     */
    private function getPermissionDescription(string $permissionName): string
    {
        $descriptions = [
            // User Management
            'users.view'              => 'View all users',
            'users.view.own'          => 'View own profile',
            'users.view.clients'      => 'View client profiles',
            'users.view.staff'        => 'View staff profiles',
            'users.view.all'          => 'View all users',
            'users.create'            => 'Create new users',
            'users.edit.own'          => 'Edit own profile',
            'users.edit.clients'      => 'Edit client profiles',
            'users.edit.staff'        => 'Edit staff profiles',
            'users.edit.all'          => 'Edit any user',
            'users.delete'            => 'Delete users',
            'users.suspend'           => 'Suspend users',
            'users.activate'          => 'Activate users',
            'users.impersonate'       => 'Impersonate users',

            // Roles & Permissions
            'roles.view'              => 'View roles',
            'roles.create'            => 'Create roles',
            'roles.edit'              => 'Edit roles',
            'roles.delete'            => 'Delete roles',
            'permissions.view'        => 'View permissions',
            'permissions.assign'      => 'Assign permissions',

            // Categories
            'categories.view'         => 'View categories',
            'categories.create'       => 'Create categories',
            'categories.edit'         => 'Edit categories',
            'categories.delete'       => 'Delete categories',

            // Products
            'products.view'           => 'View products',
            'products.view.all'       => 'View all products (incl. inactive)',
            'products.create'         => 'Create products',
            'products.edit'           => 'Edit products',
            'products.delete'         => 'Delete products',
            'products.manage.pricing' => 'Manage product pricing',
            'products.manage.features'=> 'Manage product features',

            // Subscriptions
            'subscriptions.view.own'  => 'View own subscriptions',
            'subscriptions.view.all'  => 'View all subscriptions',
            'subscriptions.create'    => 'Create subscriptions',
            'subscriptions.edit.own'  => 'Edit own subscriptions',
            'subscriptions.edit.all'  => 'Edit any subscription',
            'subscriptions.cancel.own'=> 'Cancel own subscriptions',
            'subscriptions.cancel.all'=> 'Cancel any subscription',
            'subscriptions.suspend'   => 'Suspend subscriptions',
            'subscriptions.activate'  => 'Activate subscriptions',
            'subscriptions.upgrade'   => 'Upgrade subscriptions',
            'subscriptions.downgrade' => 'Downgrade subscriptions',

            // Invoices
            'invoices.view.own'       => 'View own invoices',
            'invoices.view.all'       => 'View all invoices',
            'invoices.create'         => 'Create invoices',
            'invoices.edit'           => 'Edit invoices',
            'invoices.delete'         => 'Delete invoices',
            'invoices.send'           => 'Send invoices',
            'invoices.mark.paid'      => 'Mark invoices as paid',
            'invoices.void'           => 'Void invoices',
            'invoices.download'       => 'Download invoices',

            // Payments
            'payments.view.own'       => 'View own payments',
            'payments.view.all'       => 'View all payments',
            'payments.process'        => 'Process payments',
            'payments.refund'         => 'Refund payments',
            'payments.verify'         => 'Verify payments',

            // Tickets
            'tickets.view.own'        => 'View own tickets',
            'tickets.view.assigned'   => 'View assigned tickets',
            'tickets.view.all'        => 'View all tickets',
            'tickets.create'          => 'Create tickets',
            'tickets.edit.own'        => 'Edit own tickets',
            'tickets.edit.all'        => 'Edit any ticket',
            'tickets.delete'          => 'Delete tickets',
            'tickets.assign'          => 'Assign tickets to staff',
            'tickets.resolve'         => 'Resolve tickets',
            'tickets.close'           => 'Close tickets',
            'tickets.reopen'          => 'Reopen tickets',
            'tickets.internal.notes'  => 'Add internal notes to tickets',

            // Media
            'media.view'              => 'View media library',
            'media.upload'            => 'Upload media files',
            'media.edit'              => 'Edit media metadata',
            'media.delete'            => 'Delete media files',

            // Banners
            'banners.view'            => 'View banners',
            'banners.create'          => 'Create banners',
            'banners.edit'            => 'Edit banners',
            'banners.delete'          => 'Delete banners',

            // Testimonials
            'testimonials.view'       => 'View testimonials',
            'testimonials.create'     => 'Create testimonials',
            'testimonials.edit'       => 'Edit testimonials',
            'testimonials.delete'     => 'Delete testimonials',
            'testimonials.approve'    => 'Approve testimonials',
            'testimonials.reject'     => 'Reject testimonials',

            // FAQs
            'faqs.view'               => 'View FAQs',
            'faqs.create'             => 'Create FAQs',
            'faqs.edit'               => 'Edit FAQs',
            'faqs.delete'             => 'Delete FAQs',

            // Knowledge Base
            'kb.view'                 => 'View knowledge base',
            'kb.create'               => 'Create KB articles',
            'kb.edit'                 => 'Edit KB articles',
            'kb.delete'               => 'Delete KB articles',
            'kb.publish'              => 'Publish KB articles',

            // Coverage
            'coverage.view'           => 'View coverage zones',
            'coverage.create'         => 'Create coverage zones',
            'coverage.edit'           => 'Edit coverage zones',
            'coverage.delete'         => 'Delete coverage zones',
            'coverage.check'          => 'Check coverage for an address',

            // Pages & Blog
            'pages.view'              => 'View CMS pages',
            'pages.create'            => 'Create pages',
            'pages.edit'              => 'Edit pages',
            'pages.delete'            => 'Delete pages',
            'pages.publish'           => 'Publish pages',
            'blog.view'               => 'View blog posts',
            'blog.create'             => 'Create blog posts',
            'blog.edit'               => 'Edit blog posts',
            'blog.delete'             => 'Delete blog posts',
            'blog.publish'            => 'Publish blog posts',

            // Hosting & Domains
            'hosting.view.own'        => 'View own hosting accounts',
            'hosting.view.all'        => 'View all hosting accounts',
            'hosting.create'          => 'Create hosting accounts',
            'hosting.edit'            => 'Edit hosting accounts',
            'hosting.delete'          => 'Delete hosting accounts',
            'hosting.suspend'         => 'Suspend hosting accounts',
            'hosting.manage.packages' => 'Manage hosting packages',
            'domains.view.own'        => 'View own domains',
            'domains.view.all'        => 'View all domains',
            'domains.register'        => 'Register domains',
            'domains.transfer'        => 'Transfer domains',
            'domains.renew'           => 'Renew domains',

            // Portfolio
            'portfolio.view'          => 'View portfolio projects',
            'portfolio.create'        => 'Create portfolio projects',
            'portfolio.edit'          => 'Edit portfolio projects',
            'portfolio.delete'        => 'Delete portfolio projects',

            // Settings
            'settings.view'           => 'View system settings',
            'settings.edit'           => 'Edit system settings',
            'settings.email.templates'=> 'Manage email templates',
            'settings.system'         => 'Manage system configuration',

            // Reports & Analytics
            'reports.view'            => 'View reports',
            'reports.revenue'         => 'View revenue reports',
            'reports.subscriptions'   => 'View subscription reports',
            'reports.tickets'         => 'View ticket reports',
            'reports.export'          => 'Export reports',
            'analytics.view'          => 'View analytics',
            'analytics.clients'       => 'View client analytics',
            'analytics.staff'         => 'View staff analytics',

            // Audit
            'audit.view'              => 'View audit logs',
            'audit.delete'            => 'Delete audit logs',

            // Notifications
            'notifications.view.own'      => 'View own notifications',
            'notifications.send'          => 'Send notifications',
            'notifications.manage.templates' => 'Manage notification templates',

            // HR
            'hr.view.staff'           => 'View staff HR records',
            'hr.edit.staff'           => 'Edit staff HR records',
            'hr.manage.leaves'        => 'Manage leave requests',
            'hr.manage.payroll'       => 'Manage payroll records',
            'hr.view.departments'     => 'View department structure',
            'hr.view.reports'         => 'View HR reports',

            // Dashboard
            'dashboard.client'        => 'Access client dashboard',
            'dashboard.staff'         => 'Access staff dashboard',
            'dashboard.admin'         => 'Access admin dashboard',
        ];

        return $descriptions[$permissionName] ?? ucwords(str_replace('.', ' ', $permissionName));
    }
}


