import api from '@/lib/axios';

// ============================================
// TYPES
// ============================================

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  permissions_count: number;
  users_count: number;
  created_at: string;
  updated_at?: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedUsers {
  current_page: number;
  data: Array<{
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
  }>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all roles with their permissions
 */
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<ApiResponse<Role[]>>('/admin/roles');
  return response.data.data;
};

/**
 * Get a single role with its details
 */
export const getRole = async (roleName: string): Promise<Role & { available_permissions: PermissionGroup[] }> => {
  const response = await api.get<ApiResponse<Role & { available_permissions: PermissionGroup[] }>>(`/admin/roles/${roleName}`);
  return response.data.data;
};

/**
 * Get all available permissions grouped by category
 */
export const getPermissions = async (): Promise<PermissionGroup[]> => {
  const response = await api.get<ApiResponse<PermissionGroup[]>>('/admin/roles/permissions');
  return response.data.data;
};

/**
 * Create a new role
 */
export const createRole = async (data: RoleFormData): Promise<Role> => {
  const response = await api.post<ApiResponse<Role>>('/admin/roles', data);
  return response.data.data;
};

/**
 * Update an existing role
 */
export const updateRole = async (roleName: string, data: Partial<RoleFormData>): Promise<Role> => {
  const response = await api.put<ApiResponse<Role>>(`/admin/roles/${roleName}`, data);
  return response.data.data;
};

/**
 * Delete a role
 */
export const deleteRole = async (roleName: string): Promise<void> => {
  await api.delete(`/admin/roles/${roleName}`);
};

/**
 * Assign permissions to a role
 */
export const assignPermissions = async (roleName: string, permissions: string[]): Promise<Role> => {
  const response = await api.post<ApiResponse<Role>>(`/admin/roles/${roleName}/permissions`, {
    permissions,
  });
  return response.data.data;
};

/**
 * Revoke permissions from a role
 */
export const revokePermissions = async (roleName: string, permissions: string[]): Promise<Role> => {
  const response = await api.delete<ApiResponse<Role>>(`/admin/roles/${roleName}/permissions`, {
    data: { permissions },
  });
  return response.data.data;
};

/**
 * Get users with a specific role
 */
export const getRoleUsers = async (roleName: string, page = 1): Promise<PaginatedUsers> => {
  const response = await api.get<ApiResponse<PaginatedUsers>>(`/admin/roles/${roleName}/users`, {
    params: { page },
  });
  return response.data.data;
};

// ============================================
// EXPORT DEFAULT
// ============================================

const rolesService = {
  getRoles,
  getRole,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  revokePermissions,
  getRoleUsers,
};

export default rolesService;

