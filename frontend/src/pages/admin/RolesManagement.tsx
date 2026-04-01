import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Lock,
  AlertCircle,
  CheckCircle2,
  Settings,
  Save,
  RefreshCw,
  Info,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import rolesService, { Role, Permission, PermissionGroup } from '@/services/roles';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// Core system roles that cannot be renamed or deleted (but CAN have permissions edited)
const HARD_PROTECTED = ['admin'];
// These cannot be deleted/renamed, but permissions CAN be adjusted
const RENAME_PROTECTED = ['staff', 'client'];

const ROLE_COLORS: Record<string, string> = {
  admin:             'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  staff:             'from-blue-500/20   to-blue-600/20   border-blue-500/30',
  client:            'from-green-500/20  to-green-600/20  border-green-500/30',
  sales:             'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
  technical_support: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  web_developer:     'from-cyan-500/20   to-cyan-600/20   border-cyan-500/30',
  content_manager:   'from-pink-500/20   to-pink-600/20   border-pink-500/30',
  hr:                'from-rose-500/20   to-rose-600/20   border-rose-500/30',
};

const getRoleColor = (name: string) =>
  ROLE_COLORS[name] ?? 'from-slate-500/20 to-slate-600/20 border-slate-500/30';

const formatRoleName = (name: string) =>
  name.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const RolesManagement = () => {
  const [roles, setRoles]             = useState<Role[]>([]);
  const [permGroups, setPermGroups]   = useState<PermissionGroup[]>([]);
  const [loading, setLoading]         = useState(true);
  const [permLoading, setPermLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [showCreateModal, setShowCreateModal]         = useState(false);
  const [showEditModal, setShowEditModal]             = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving]           = useState(false);

  // local checkbox state for the permissions modal
  const [checkedPerms, setCheckedPerms] = useState<string[]>([]);

  const [formData, setFormData] = useState({ name: '', description: '' });

  // ── loaders ────────────────────────────────────────────────────────────────

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPermissionGroups = useCallback(async () => {
    setPermLoading(true);
    try {
      const data = await rolesService.getPermissions();
      setPermGroups(data);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    } finally {
      setPermLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadPermissionGroups();
  }, [loadRoles, loadPermissionGroups]);

  // ── derived ────────────────────────────────────────────────────────────────

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isHardProtected    = (name: string) => HARD_PROTECTED.includes(name);
  const isRenameProtected  = (name: string) => HARD_PROTECTED.includes(name) || RENAME_PROTECTED.includes(name);

  // ── open permissions modal ──────────────────────────────────────────────────

  const openPermissionsModal = async (role: Role) => {
    try {
      // getRole fetches the role with its full permissions list
      const data = await rolesService.getRole(role.name);
      setSelectedRole(data);
      setCheckedPerms(data.permissions.map((p: Permission) => p.name));
      setShowPermissionsModal(true);
    } catch (err) {
      console.error('Failed to load role details:', err);
      alert('Failed to load role details. Please try again.');
    }
  };

  // ── save role permissions ───────────────────────────────────────────────────

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // Use assignPermissions with the full list — backend does syncPermissions
      await rolesService.assignPermissions(selectedRole.name, checkedPerms);
      setShowPermissionsModal(false);
      setSelectedRole(null);
      loadRoles();
    } catch (err: any) {
      console.error('Failed to save permissions:', err);
      alert(err.response?.data?.message ?? 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // ── create role ─────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await rolesService.createRole({
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        permissions: checkedPerms,
      });
      setShowCreateModal(false);
      resetForm();
      loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  // ── update role name ────────────────────────────────────────────────────────

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSaving(true);
    try {
      await rolesService.updateRole(selectedRole.name, {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
      });
      setShowEditModal(false);
      setSelectedRole(null);
      resetForm();
      loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  // ── delete role ─────────────────────────────────────────────────────────────

  const handleDelete = async (role: Role) => {
    if (!confirm(`Delete the "${formatRoleName(role.name)}" role? This cannot be undone.`)) return;
    try {
      await rolesService.deleteRole(role.name);
      loadRoles();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to delete role');
    }
  };

  // ── helpers ─────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setCheckedPerms([]);
  };

  const togglePerm = (name: string) =>
    setCheckedPerms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );

  const toggleCategory = (group: PermissionGroup) => {
    const names = group.permissions.map((p) => p.name);
    const allChecked = names.every((n) => checkedPerms.includes(n));
    setCheckedPerms((prev) =>
      allChecked
        ? prev.filter((p) => !names.includes(p))
        : [...new Set([...prev, ...names])]
    );
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userType="admin">

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles &amp; Permissions</h1>
          <p className="text-slate-400 text-sm mt-1">
            Define what each staff role can access. Click <strong className="text-white">Permissions</strong> on any card to edit.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadPermissionGroups()}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${permLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-300">
          Click <span className="text-white font-medium">Permissions</span> on any role card to see and toggle
          {' '}<span className="text-white font-medium">all permissions</span> for that role.
          Changes are saved immediately. The <span className="text-amber-400 font-medium">Admin</span> role
          always has all permissions and cannot be restricted.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
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

      {/* Roles grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No roles found. Try a different search or create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className={`bg-gradient-to-br ${getRoleColor(role.name)} border rounded-xl p-5 backdrop-blur-sm flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{formatRoleName(role.name)}</h3>
                    <span className="text-xs text-slate-400">{role.users_count ?? 0} user{role.users_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {isRenameProtected(role.name) && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                    <Lock className="w-3 h-3" />
                    {isHardProtected(role.name) ? 'System' : 'Core'}
                  </span>
                )}
              </div>

              {/* Permission pills preview */}
              <div className="flex-1 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Permissions</span>
                  <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
                    {role.permissions_count ?? role.permissions.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 6).map((perm) => (
                    <span
                      key={perm.id}
                      className="px-2 py-0.5 text-xs bg-white/10 rounded-full text-slate-300 truncate max-w-[140px]"
                      title={perm.name}
                    >
                      {perm.name.split('.').slice(1).join('.') || perm.name}
                    </span>
                  ))}
                  {role.permissions.length > 6 && (
                    <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full text-slate-400">
                      +{role.permissions.length - 6} more
                    </span>
                  )}
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No permissions assigned</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => openPermissionsModal(role)}
                  disabled={isHardProtected(role.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isHardProtected(role.name) ? 'Admin always has all permissions' : 'Edit permissions'}
                >
                  <Settings className="w-4 h-4" />
                  Permissions
                </button>
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setFormData({ name: formatRoleName(role.name), description: '' });
                    setShowEditModal(true);
                  }}
                  disabled={isRenameProtected(role.name)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isRenameProtected(role.name) ? 'Cannot rename this role' : 'Rename role'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  disabled={isRenameProtected(role.name)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isRenameProtected(role.name) ? 'Cannot delete this role' : 'Delete role'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PERMISSIONS MODAL ──────────────────────────────────────────────────── */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 border border-white/20 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  {formatRoleName(selectedRole.name)} — Permissions
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Toggle permissions on/off, then click <strong className="text-white">Save</strong>.
                </p>
              </div>
              <button
                onClick={() => { setShowPermissionsModal(false); setSelectedRole(null); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {permLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
              ) : permGroups.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-amber-400" />
                  <p className="font-medium text-white mb-1">No permissions found in database</p>
                  <p className="text-sm">Run the seeder first:</p>
                  <code className="mt-2 inline-block text-xs bg-white/10 px-3 py-1.5 rounded font-mono text-green-300">
                    php artisan db:seed --class=RoleAndPermissionSeeder
                  </code>
                </div>
              ) : (
                permGroups.map((group) => {
                  const groupNames  = group.permissions.map((p) => p.name);
                  const allChecked  = groupNames.every((n) => checkedPerms.includes(n));
                  const someChecked = groupNames.some((n) => checkedPerms.includes(n));
                  return (
                    <div key={group.category} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white capitalize">{group.category}</h4>
                        <button
                          type="button"
                          onClick={() => toggleCategory(group)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {allChecked ? 'Remove All' : someChecked ? 'Select All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.permissions.map((perm) => {
                          const checked = checkedPerms.includes(perm.name);
                          return (
                            <button
                              key={perm.id}
                              type="button"
                              onClick={() => togglePerm(perm.name)}
                              title={perm.name}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                                checked
                                  ? 'bg-green-500/20 border-green-500/30 text-green-300'
                                  : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                              }`}
                            >
                              {checked && <CheckCircle2 className="w-3 h-3" />}
                              {perm.name.split('.').slice(1).join('.') || perm.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex-shrink-0 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                <span className="text-green-400 font-semibold">{checkedPerms.length}</span> / {permGroups.reduce((s, g) => s + g.permissions.length, 0)} permissions selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPermissionsModal(false); setSelectedRole(null); }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSavePermissions}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Permissions
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE ROLE MODAL ──────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Create New Role
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                  placeholder="e.g., Moderator"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Saved as lowercase_with_underscores
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Initial Permissions
                  <span className="ml-2 text-slate-500">(optional — can be changed later)</span>
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {permGroups.map((group) => (
                    <div key={group.category} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-white capitalize">{group.category}</h4>
                        <button
                          type="button"
                          onClick={() => toggleCategory(group)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {group.permissions.every((p) => checkedPerms.includes(p.name)) ? 'Remove All' : 'Select All'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.permissions.map((perm) => (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePerm(perm.name)}
                            className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                              checkedPerms.includes(perm.name)
                                ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                                : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                            }`}
                          >
                            {perm.name.split('.').slice(1).join('.') || perm.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" /> Creating...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Create Role</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ROLE NAME MODAL ───────────────────────────────────────────────── */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 border border-white/20 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Rename Role
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setSelectedRole(null); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">New Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedRole(null); resetForm(); }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RolesManagement;
