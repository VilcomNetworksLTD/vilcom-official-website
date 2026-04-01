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

export interface UserPermissionsData {
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  };
  all_permissions: string[];
  direct_permissions: string[];
  role_permissions: string[];
  available_permissions: Record<string, Permission[]>;
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
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// ============================================
// ROLE API FUNCTIONS
// ============================================

/** Get all roles with their permissions */
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<ApiResponse<Role[]>>('/admin/roles');
  return response.data.data;
};

/** Get a single role with full details */
export const getRole = async (
  roleName: string
): Promise<Role & { available_permissions: PermissionGroup[] }> => {
  const response = await api.get<
    ApiResponse<Role & { available_permissions: PermissionGroup[] }>
  >(`/admin/roles/${roleName}`);
  return response.data.data;
};

/** Get all available permissions grouped by category */
export const getPermissions = async (): Promise<PermissionGroup[]> => {
  const response = await api.get<ApiResponse<PermissionGroup[]>>(
    '/admin/roles/permissions'
  );
  return response.data.data;
};

/** Create a new role */
export const createRole = async (data: RoleFormData): Promise<Role> => {
  const response = await api.post<ApiResponse<Role>>('/admin/roles', data);
  return response.data.data;
};

/** Update an existing role (name and/or permissions) */
export const updateRole = async (
  roleName: string,
  data: Partial<RoleFormData>
): Promise<Role> => {
  const response = await api.put<ApiResponse<Role>>(
    `/admin/roles/${roleName}`,
    data
  );
  return response.data.data;
};

/** Delete a role */
export const deleteRole = async (roleName: string): Promise<void> => {
  await api.delete(`/admin/roles/${roleName}`);
};

/** Assign permissions to a role */
export const assignPermissions = async (
  roleName: string,
  permissions: string[]
): Promise<Role> => {
  const response = await api.post<ApiResponse<Role>>(
    `/admin/roles/${roleName}/permissions`,
    { permissions }
  );
  return response.data.data;
};

/** Revoke permissions from a role */
export const revokePermissions = async (
  roleName: string,
  permissions: string[]
): Promise<Role> => {
  const response = await api.delete<ApiResponse<Role>>(
    `/admin/roles/${roleName}/permissions`,
    { data: { permissions } }
  );
  return response.data.data;
};

/** Get users with a specific role */
export const getRoleUsers = async (
  roleName: string,
  page = 1
): Promise<PaginatedUsers> => {
  const response = await api.get<ApiResponse<PaginatedUsers>>(
    `/admin/roles/${roleName}/users`,
    { params: { page } }
  );
  return response.data.data;
};

// ============================================
// USER-LEVEL PERMISSION API FUNCTIONS
// Admin can grant/revoke permissions directly on a specific staff user
// (on top of what their role already provides).
// ============================================

/** Get a user's permission breakdown: all / direct / via-role */
export const getUserPermissions = async (
  userId: number
): Promise<UserPermissionsData> => {
  const response = await api.get<ApiResponse<UserPermissionsData>>(
    `/admin/users/${userId}/permissions`
  );
  return response.data.data;
};

/** Grant individual permissions directly to a user */
export const assignUserPermissions = async (
  userId: number,
  permissions: string[]
): Promise<{ direct_permissions: string[]; all_permissions: string[] }> => {
  const response = await api.post<
    ApiResponse<{ direct_permissions: string[]; all_permissions: string[] }>
  >(`/admin/users/${userId}/permissions`, { permissions });
  return response.data.data;
};

/** Revoke individual direct permissions from a user */
export const revokeUserPermissions = async (
  userId: number,
  permissions: string[]
): Promise<{ direct_permissions: string[]; all_permissions: string[] }> => {
  const response = await api.delete<
    ApiResponse<{ direct_permissions: string[]; all_permissions: string[] }>
  >(`/admin/users/${userId}/permissions`, { data: { permissions } });
  return response.data.data;
};

/** Replace ALL direct permissions for a user (destructive sync) */
export const syncUserPermissions = async (
  userId: number,
  permissions: string[]
): Promise<{ direct_permissions: string[]; all_permissions: string[] }> => {
  const response = await api.post<
    ApiResponse<{ direct_permissions: string[]; all_permissions: string[] }>
  >(`/admin/users/${userId}/permissions/sync`, { permissions });
  return response.data.data;
};

/** Change a staff user's role */
export const updateUserRole = async (
  userId: number,
  role: string
): Promise<{ roles: string[] }> => {
  const response = await api.put<ApiResponse<{ roles: string[] }>>(
    `/admin/users/${userId}/role`,
    { role }
  );
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
  getUserPermissions,
  assignUserPermissions,
  revokeUserPermissions,
  syncUserPermissions,
  updateUserRole,
};

export default rolesService;
