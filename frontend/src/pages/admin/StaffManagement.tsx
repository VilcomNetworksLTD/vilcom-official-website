import { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Search,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Send,
  RefreshCw,
  UserPlus,
  Shield,
  Users,
  Briefcase,
  Settings,
  Lock,
  CheckCircle2,
  ChevronDown,
  Edit2,
  Save,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import invitationsService, { StaffInvitation, InvitationStats } from '@/services/invitations';
import { usersApi, User } from '@/services/users';
import rolesService, { PermissionGroup, UserPermissionsData } from '@/services/roles';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALL_STAFF_ROLES = [
  'staff',
  'sales',
  'technical_support',
  'web_developer',
  'content_manager',
  'hr',
] as const;

type StaffRole = typeof ALL_STAFF_ROLES[number];
type Tab = 'staff' | 'invitations';

const ROLE_META: Record<string, { label: string; color: string; description: string }> = {
  admin:             { label: 'Admin',           color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',  description: 'Full system access' },
  staff:             { label: 'Staff',            color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',        description: 'General operations' },
  sales:             { label: 'Sales',            color: 'bg-green-500/20 text-green-300 border-green-500/30',     description: 'Client acquisition' },
  technical_support: { label: 'Tech Support',     color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', description: 'Tickets & hosting' },
  web_developer:     { label: 'Web Developer',    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',       description: 'Portfolio & hosting' },
  content_manager:   { label: 'Content Manager',  color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',       description: 'CMS & media' },
  hr:                { label: 'HR',               color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',        description: 'Staff management' },
};

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-500/20 text-green-300 border-green-500/30',
  inactive:  'bg-slate-500/20 text-slate-300 border-slate-500/30',
  suspended: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const getRoleBadge = (role: string) => (
  <span className={`px-2 py-1 rounded-lg text-xs border ${ROLE_META[role]?.color ?? ROLE_META.staff.color}`}>
    {ROLE_META[role]?.label ?? role.replace('_', ' ')}
  </span>
);

const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-lg text-xs border ${STATUS_COLORS[status] ?? STATUS_COLORS.inactive}`}>
    {status}
  </span>
);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':  return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'accepted': return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'expired':  return <XCircle className="w-4 h-4 text-red-400" />;
    default:         return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// User Permissions Modal
// ─────────────────────────────────────────────────────────────────────────────

interface UserPermissionsModalProps {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}

const UserPermissionsModal = ({ user, onClose, onUpdated }: UserPermissionsModalProps) => {
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [data, setData]             = useState<UserPermissionsData | null>(null);
  const [permGroups, setPermGroups] = useState<PermissionGroup[]>([]);
  const [directPerms, setDirectPerms] = useState<string[]>([]);
  const [activeRole, setActiveRole]   = useState('');
  const [roleChanging, setRoleChanging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [permsData, groupsData] = await Promise.all([
        rolesService.getUserPermissions(user.id),
        rolesService.getPermissions(),
      ]);
      setData(permsData);
      setDirectPerms(permsData.direct_permissions);
      setActiveRole(permsData.user.roles[0] ?? '');
      setPermGroups(groupsData);
    } catch (e) {
      console.error('Failed to load user permissions:', e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const toggleDirect = (name: string) => {
    setDirectPerms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const isViaRole = (name: string) => data?.role_permissions.includes(name) ?? false;

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await rolesService.syncUserPermissions(user.id, directPerms);
      onUpdated();
      onClose();
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === activeRole) return;
    if (!confirm(`Change ${user.name}'s role to "${ROLE_META[newRole]?.label ?? newRole}"?`)) return;
    setRoleChanging(true);
    try {
      await rolesService.updateUserRole(user.id, newRole);
      setActiveRole(newRole);
      await load(); // reload permissions after role change
      onUpdated();
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to change role');
    } finally {
      setRoleChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Manage Permissions — {user.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            </div>
          ) : (
            <>
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  Role
                  {roleChanging && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400" />}
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_STAFF_ROLES.map((r) => (
                    <button
                      key={r}
                      disabled={roleChanging}
                      onClick={() => handleRoleChange(r)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        activeRole === r
                          ? ROLE_META[r]?.color ?? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                      } ${roleChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {ROLE_META[r]?.label ?? r}
                    </button>
                  ))}
                </div>
                {activeRole && (
                  <p className="text-xs text-slate-500 mt-1">
                    Current: <span className="text-slate-300">{ROLE_META[activeRole]?.label ?? activeRole}</span>
                    {' — '}{ROLE_META[activeRole]?.description}
                  </p>
                )}
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/50" />
                  <span className="text-slate-400">Direct (extra)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/30" />
                  <span className="text-slate-400">Via role (inherited)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
                  <span className="text-slate-400">Not granted</span>
                </span>
              </div>

              {/* Permissions grid */}
              <div className="space-y-4">
                {permGroups.map((group) => (
                  <div key={group.category} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white capitalize">{group.category}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const names = group.permissions.map((p) => p.name);
                          const allDirect = names.every((n) => directPerms.includes(n));
                          setDirectPerms((prev) =>
                            allDirect
                              ? prev.filter((p) => !names.includes(p))
                              : [...new Set([...prev, ...names])]
                          );
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {group.permissions.every((p) => directPerms.includes(p.name)) ? 'Remove All' : 'Add All'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.permissions.map((perm) => {
                        const isDirect = directPerms.includes(perm.name);
                        const viaRole  = isViaRole(perm.name);
                        return (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => toggleDirect(perm.name)}
                            title={viaRole ? 'Inherited via role' : perm.name}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 ${
                              isDirect
                                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                                : viaRole
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                            }`}
                          >
                            {isDirect && <CheckCircle2 className="w-3 h-3" />}
                            {!isDirect && viaRole && <Lock className="w-3 h-3" />}
                            {perm.name.split('.').slice(1).join('.') || perm.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            <span className="text-green-400 font-medium">{directPerms.length}</span> direct permission{directPerms.length !== 1 ? 's' : ''}
            {data && (
              <span className="ml-2 text-slate-500">
                ({data.role_permissions.length} via role)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving || loading}
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
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const StaffManagement = () => {
  // ── Staff users ─────────────────────────────────────────────────────────────
  const [staffUsers, setStaffUsers]     = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffSearch, setStaffSearch]   = useState('');
  const [roleFilter, setRoleFilter]     = useState<StaffRole | ''>('');

  // ── Invitations ─────────────────────────────────────────────────────────────
  const [invitations, setInvitations]               = useState<StaffInvitation[]>([]);
  const [stats, setStats]                           = useState<InvitationStats | null>(null);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [inviteSearch, setInviteSearch]             = useState('');
  const [statusFilter, setStatusFilter]             = useState('');

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<Tab>('staff');
  const [showModal, setShowModal]       = useState(false);
  const [sending, setSending]           = useState(false);
  const [permTarget, setPermTarget]     = useState<User | null>(null);
  const [formData, setFormData]         = useState({
    email:        '',
    role:         'staff' as StaffRole,
    expires_days: 7,
  });

  // ── Loaders ──────────────────────────────────────────────────────────────────

  const loadStaffUsers = async () => {
    setStaffLoading(true);
    try {
      const response = await usersApi.list({ roles: [...ALL_STAFF_ROLES] });
      const arr = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any)?.data)
        ? (response.data as any).data
        : [];
      setStaffUsers(arr);
    } catch (error) {
      console.error('Failed to load staff users:', error);
      setStaffUsers([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const loadInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const response = await invitationsService.getAll({ status: statusFilter || undefined });
      setInvitations(response.data || []);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await invitationsService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => { loadStaffUsers(); }, []);
  useEffect(() => { loadInvitations(); loadStats(); }, [statusFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await invitationsService.create({
        email:        formData.email,
        role:         formData.role,
        expires_days: formData.expires_days,
      });
      setShowModal(false);
      resetForm();
      loadInvitations();
      loadStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (id: string) => {
    if (!confirm('Resend this invitation?')) return;
    try {
      await invitationsService.resend(id);
      loadInvitations();
      alert('Invitation resent successfully');
    } catch {
      alert('Failed to resend invitation');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this invitation?')) return;
    try {
      await invitationsService.cancel(id);
      loadInvitations();
      loadStats();
    } catch {
      alert('Failed to cancel invitation');
    }
  };

  const resetForm = () => setFormData({ email: '', role: 'staff', expires_days: 7 });

  // ── Derived lists ─────────────────────────────────────────────────────────────

  const filteredStaff = staffUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesRole = roleFilter ? u.roles.some((r) => r.name === roleFilter) : true;
    return matchesSearch && matchesRole;
  });

  const filteredInvitations = invitations.filter((inv) =>
    inv.email.toLowerCase().includes(inviteSearch.toLowerCase())
  );

  // ── Role counts ───────────────────────────────────────────────────────────────
  const roleCounts = ALL_STAFF_ROLES.reduce<Record<string, number>>((acc, role) => {
    acc[role] = staffUsers.filter((u) => u.roles.some((r) => r.name === role)).length;
    return acc;
  }, {});

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout userType="admin">

      {/* Page header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-slate-400">Manage all internal staff roles & permissions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      {/* Stats grid — all 6 roles + pending invites */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Total Staff</p>
              <p className="text-2xl font-bold text-white">{staffUsers.length}</p>
            </div>
            <Users className="w-7 h-7 text-blue-400" />
          </div>
        </div>
        {ALL_STAFF_ROLES.map((role) => (
          <div key={role} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <p className="text-slate-400 text-xs truncate">{ROLE_META[role]?.label}</p>
            <p className="text-xl font-bold text-white mt-1">{roleCounts[role] ?? 0}</p>
          </div>
        ))}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Pending Invites</p>
              <p className="text-xl font-bold text-yellow-400">{stats?.pending ?? 0}</p>
            </div>
            <Clock className="w-7 h-7 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'staff' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Members
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs">
            {staffUsers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'invitations' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          Invitations
          {(stats?.pending ?? 0) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 text-xs">
              {stats!.pending}
            </span>
          )}
        </button>
      </div>

      {/* ── STAFF TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === 'staff' && (
        <>
          {/* Search + role filter */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as StaffRole | '')}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="" className="bg-slate-900">All Roles</option>
                {ALL_STAFF_ROLES.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">{ROLE_META[r]?.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff list */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
            {staffLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No staff members found</h3>
                <p className="text-slate-400">
                  {staffSearch || roleFilter
                    ? 'Try adjusting your search or filter'
                    : 'Invite staff members using the button above'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredStaff.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0 text-sm font-bold text-white">
                      {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        {user.roles.map((r) => (
                          <span key={r.id}>{getRoleBadge(r.name)}</span>
                        ))}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        {user.phone && <span>{user.phone}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => setPermTarget(user)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-all"
                      title="Manage permissions"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Permissions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── INVITATIONS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'invitations' && (
        <>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value=""         className="bg-slate-900">All Status</option>
                <option value="pending"  className="bg-slate-900">Pending</option>
                <option value="accepted" className="bg-slate-900">Accepted</option>
                <option value="expired"  className="bg-slate-900">Expired</option>
              </select>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
            {invitationsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No invitations found</h3>
                <p className="text-slate-400">Invite your first staff member to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{invitation.email}</h3>
                        {getRoleBadge(invitation.role)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </span>
                        {invitation.inviter && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            by {invitation.inviter.name}
                          </span>
                        )}
                        {invitation.accepted_at && (
                          <span className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Accepted {new Date(invitation.accepted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invitation.status)}
                        <span className={`text-sm ${
                          invitation.status === 'pending'  ? 'text-yellow-400' :
                          invitation.status === 'accepted' ? 'text-green-400'  : 'text-red-400'
                        }`}>
                          {invitation.status}
                        </span>
                      </div>
                      {invitation.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleResend(invitation.id)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Resend invitation"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(invitation.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Cancel invitation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── INVITE MODAL ──────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Invite Staff Member
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                    placeholder="staff@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  required
                >
                  {ALL_STAFF_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-900">
                      {ROLE_META[r]?.label} — {ROLE_META[r]?.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  The role determines the default permissions. You can fine-tune later.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expires In</label>
                <select
                  value={formData.expires_days}
                  onChange={(e) => setFormData({ ...formData, expires_days: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                >
                  <option value={3}  className="bg-slate-900">3 days</option>
                  <option value={7}  className="bg-slate-900">7 days</option>
                  <option value={14} className="bg-slate-900">14 days</option>
                  <option value={30} className="bg-slate-900">30 days</option>
                </select>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Invitation will be sent via email</p>
                  <p className="text-xs text-slate-400 mt-1">
                    The invited person will receive a link to create their account and set their password.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── USER PERMISSIONS MODAL ────────────────────────────────────────────── */}
      {permTarget && (
        <UserPermissionsModal
          user={permTarget}
          onClose={() => setPermTarget(null)}
          onUpdated={loadStaffUsers}
        />
      )}
    </DashboardLayout>
  );
};

export default StaffManagement;