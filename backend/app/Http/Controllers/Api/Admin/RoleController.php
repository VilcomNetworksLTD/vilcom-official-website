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

            // For protected roles, ensure they always have all permissions
            $protectedRoles = ['admin', 'staff', 'client'];
            if (in_array($role->name, $protectedRoles)) {
                $role->syncPermissions(Permission::all());
            } else {
                $permissions = Permission::whereIn('name', $validated['permissions'])->get();
                $role->givePermissionTo($permissions);
            }

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
     * Get permission description based on name
     * 
     * @param string $permissionName
     * @return string
     */
    private function getPermissionDescription(string $permissionName): string
    {
        $descriptions = [
            'users.view' => 'View users',
            'users.create' => 'Create users',
            'users.edit' => 'Edit users',
            'users.delete' => 'Delete users',
            'users.suspend' => 'Suspend users',
            'users.activate' => 'Activate users',
            'roles.view' => 'View roles',
            'roles.create' => 'Create roles',
            'roles.edit' => 'Edit roles',
            'roles.delete' => 'Delete roles',
            'permissions.view' => 'View permissions',
            'permissions.assign' => 'Assign permissions',
            'categories.view' => 'View categories',
            'categories.create' => 'Create categories',
            'categories.edit' => 'Edit categories',
            'categories.delete' => 'Delete categories',
            'products.view' => 'View products',
            'products.create' => 'Create products',
            'products.edit' => 'Edit products',
            'products.delete' => 'Delete products',
            'subscriptions.view' => 'View subscriptions',
            'subscriptions.create' => 'Create subscriptions',
            'subscriptions.edit' => 'Edit subscriptions',
            'subscriptions.cancel' => 'Cancel subscriptions',
            'subscriptions.suspend' => 'Suspend subscriptions',
            'subscriptions.activate' => 'Activate subscriptions',
            'media.view' => 'View media',
            'media.upload' => 'Upload media',
            'media.edit' => 'Edit media',
            'media.delete' => 'Delete media',
            'banners.view' => 'View banners',
            'banners.create' => 'Create banners',
            'banners.edit' => 'Edit banners',
            'banners.delete' => 'Delete banners',
            'testimonials.view' => 'View testimonials',
            'testimonials.create' => 'Create testimonials',
            'testimonials.edit' => 'Edit testimonials',
            'testimonials.delete' => 'Delete testimonials',
            'testimonials.approve' => 'Approve testimonials',
            'faqs.view' => 'View FAQs',
            'faqs.create' => 'Create FAQs',
            'faqs.edit' => 'Edit FAQs',
            'faqs.delete' => 'Delete FAQs',
            'coverage.view' => 'View coverage areas',
            'coverage.create' => 'Create coverage areas',
            'coverage.edit' => 'Edit coverage areas',
            'coverage.delete' => 'Delete coverage areas',
            'coverage.check' => 'Check coverage',
            'settings.view' => 'View settings',
            'settings.edit' => 'Edit settings',
            'reports.view' => 'View reports',
            'reports.export' => 'Export reports',
            'dashboard.admin' => 'Access admin dashboard',
            'dashboard.staff' => 'Access staff dashboard',
            'dashboard.client' => 'Access client dashboard',
        ];

        return $descriptions[$permissionName] ?? ucwords(str_replace('.', ' ', $permissionName));
    }
}

