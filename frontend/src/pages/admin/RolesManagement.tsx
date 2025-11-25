import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  Users,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Settings,
  Eye,
  Save,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import rolesService, { Role, Permission, PermissionGroup } from '@/services/roles';

// Protected role names that cannot be modified
const PROTECTED_ROLES = ['admin', 'staff', 'client'];

// Format role name for display (e.g., "technical_support" -> "Technical Support")
const formatRoleName = (name: string): string => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get color based on role name
const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    admin: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300',
    staff: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300',
    client: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-300',
    sales: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300',
    technical_support: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300',
    web_developer: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-300',
    content_manager: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-300',
  };
  return (
    colors[roleName] ||
    'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300'
  );
};

const RolesManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Load data on mount
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await rolesService.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  // Filter roles based on search
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create role
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await rolesService.createRole({
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        permissions: formData.permissions,
      });
      setShowCreateModal(false);
      resetForm();
      loadRoles();
    } catch (error: any) {
      console.error('Failed to create role:', error);
      alert(error.response?.data?.message || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  // Handle update role
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSaving(true);
    try {
      await rolesService.updateRole(selectedRole.name, {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
      });
      setShowEditModal(false);
      setSelectedRole(null);
      resetForm();
      loadRoles();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert(error.response?.data?.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete role
  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the "${formatRoleName(role.name)}" role?`)) {
      return;
    }
    try {
      await rolesService.deleteRole(role.name);
      loadRoles();
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      alert(error.response?.data?.message || 'Failed to delete role');
    }
  };

  // Handle permission changes
  const handlePermissionChange = async (role: Role, permissionName: string, granted: boolean) => {
    try {
      if (granted) {
        await rolesService.assignPermissions(role.name, [permissionName]);
      } else {
        await rolesService.revokePermissions(role.name, [permissionName]);
      }
      loadRoles();
      if (selectedRole?.name === role.name) {
        const updated = await rolesService.getRole(role.name);
        setSelectedRole(updated);
      }
    } catch (error: any) {
      console.error('Failed to update permissions:', error);
      alert(error.response?.data?.message || 'Failed to update permissions');
    }
  };

  // Open edit modal
  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: formatRoleName(role.name),
      description: '',
      permissions: role.permissions.map((p) => p.name),
    });
    setShowEditModal(true);
  };

  // Open permissions modal
  const openPermissionsModal = async (role: Role) => {
    try {
      const data = await rolesService.getRole(role.name);
      setSelectedRole(data);
      setFormData({
        ...formData,
        permissions: data.permissions.map((p: Permission) => p.name),
      });
      setShowPermissionsModal(true);
    } catch (error) {
      console.error('Failed to load role details:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  // Check if role is protected
  const isProtected = (roleName: string) => PROTECTED_ROLES.includes(roleName);

  // Toggle permission in form
  const togglePermission = (permissionName: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName],
    }));
  };

  // Select all permissions in a category
  const toggleAllInCategory = (category: string, granted: boolean) => {
    const categoryPermissions = permissions
      .find((p) => p.category === category)
      ?.permissions.map((p) => p.name) || [];

    setFormData((prev) => ({
      ...prev,
      permissions: granted
        ? [...new Set([...prev.permissions, ...categoryPermissions])]
        : prev.permissions.filter((p) => !categoryPermissions.includes(p)),
    }));
  };

  return (
    <DashboardLayout userType="admin">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-slate-400">Manage user roles and their permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className={`bg-gradient-to-br ${getRoleColor(role.name)} border rounded-xl p-5 backdrop-blur-sm`}
            >
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{formatRoleName(role.name)}</h3>
                    <span className="text-xs text-slate-400">{role.users_count} users</span>
                  </div>
                </div>
                {isProtected(role.name) && (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Lock className="w-3 h-3" />
                    Protected
                  </div>
                )}
              </div>

              {/* Permissions Count */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Permissions</span>
                  <span className="text-white font-medium">{role.permissions_count}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((perm) => (
                    <span
                      key={perm.id}
                      className="px-2 py-0.5 text-xs bg-white/10 rounded text-slate-300"
                    >
                      {perm.name}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="px-2 py-0.5 text-xs bg-white/10 rounded text-slate-400">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => openPermissionsModal(role)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <Settings className="w-4 h-4" />
                  Permissions
                </button>
                <button
                  onClick={() => openEditModal(role)}
                  disabled={isProtected(role.name)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isProtected(role.name) ? 'Protected role cannot be edited' : 'Edit role'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  disabled={isProtected(role.name)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isProtected(role.name) ? 'Protected role cannot be deleted' : 'Delete role'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Create New Role
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                  placeholder="e.g., Moderator"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Will be saved as lowercase with underscores (e.g., "moderator")
                </p>
              </div>

              {/* Permissions Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Assign Permissions
                </label>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {permissions.map((group) => (
                    <div key={group.category} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white capitalize">
                          {group.category}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected = group.permissions.every((p) =>
                              formData.permissions.includes(p.name)
                            );
                            toggleAllInCategory(group.category, !allSelected);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {group.permissions.every((p) =>
                            formData.permissions.includes(p.name)
                          )
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.permissions.map((perm) => (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.name)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              formData.permissions.includes(perm.name)
                                ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            {perm.name.split('.')[1] || perm.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Edit Role
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRole(null);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                  required
                />
              </div>

              {isProtected(selectedRole.name) && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-300">
                    This is a protected role. You can only change the name.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Management Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Manage Permissions
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {formatRoleName(selectedRole.name)} role • {selectedRole.users_count} users
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedRole(null);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isProtected(selectedRole.name) && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-300">
                    This is a protected role with all permissions. Permission changes are not allowed.
                  </p>
                </div>
              )}

              {permissions.map((group) => {
                const allSelected = group.permissions.every((p) =>
                  formData.permissions.includes(p.name)
                );
                const someSelected = group.permissions.some((p) =>
                  formData.permissions.includes(p.name)
                );

                return (
                  <div key={group.category} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white capitalize flex items-center gap-2">
                        {group.category === 'dashboard' && <Settings className="w-4 h-4" />}
                        {group.category}
                      </h4>
                      {!isProtected(selectedRole.name) && (
                        <button
                          type="button"
                          onClick={() => toggleAllInCategory(group.category, !allSelected)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.permissions.map((perm) => {
                        const isGranted = formData.permissions.includes(perm.name);
                        return (
                          <button
                            key={perm.id}
                            type="button"
                            disabled={isProtected(selectedRole.name)}
                            onClick={() => togglePermission(perm.name)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                              isGranted
                                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            } ${isProtected(selectedRole.name) ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            <div className="flex items-center gap-1.5">
                              {isGranted && <CheckCircle2 className="w-3 h-3" />}
                              {perm.name.split('.').slice(1).join('.') || perm.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {formData.permissions.length} permissions selected
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPermissionsModal(false);
                      setSelectedRole(null);
                    }}
                    className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  {!isProtected(selectedRole.name) && (
                    <button
                      type="button"
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await rolesService.updateRole(selectedRole.name, {
                            permissions: formData.permissions,
                          });
                          setShowPermissionsModal(false);
                          setSelectedRole(null);
                          loadRoles();
                        } catch (error: any) {
                          console.error('Failed to save permissions:', error);
                          alert(error.response?.data?.message || 'Failed to save permissions');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Permissions
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RolesManagement;

