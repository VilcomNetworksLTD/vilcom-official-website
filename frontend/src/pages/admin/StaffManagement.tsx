import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import invitationsService, { StaffInvitation, InvitationStats } from '@/services/invitations';
import { usersApi, User } from '@/services/users';

// All internal roles that count as "staff" (everyone except admin)
const STAFF_ROLES = ['staff', 'sales', 'technical_support'] as const;
type StaffRole = typeof STAFF_ROLES[number];

type Tab = 'staff' | 'invitations';

const ROLE_COLORS: Record<string, string> = {
  admin:             'bg-purple-500/20 text-purple-300 border-purple-500/30',
  staff:             'bg-blue-500/20 text-blue-300 border-blue-500/30',
  sales:             'bg-green-500/20 text-green-300 border-green-500/30',
  technical_support: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-500/20 text-green-300 border-green-500/30',
  inactive:  'bg-slate-500/20 text-slate-300 border-slate-500/30',
  suspended: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const getRoleBadge = (role: string) => (
  <span className={`px-2 py-1 rounded-lg text-xs border ${ROLE_COLORS[role] || ROLE_COLORS.staff}`}>
    {role.replace('_', ' ')}
  </span>
);

const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-lg text-xs border ${STATUS_COLORS[status] || STATUS_COLORS.inactive}`}>
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
  const [activeTab, setActiveTab] = useState<Tab>('staff');
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending]     = useState(false);
  const [formData, setFormData]   = useState({
    email:        '',
    role:         'staff' as StaffRole,
    expires_days: 7,
  });

  // ── Loaders ──────────────────────────────────────────────────────────────────

  const loadStaffUsers = async () => {
    setStaffLoading(true);
    try {
      const response = await usersApi.list({
        roles: [...STAFF_ROLES],
      });
      // Safely resolve array regardless of nesting depth
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
      const response = await invitationsService.getAll({
        status: statusFilter || undefined,
      });
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
    const matchesRole = roleFilter
      ? u.roles.some((r) => r.name === roleFilter)
      : true;
    return matchesSearch && matchesRole;
  });

  const filteredInvitations = invitations.filter((inv) =>
    inv.email.toLowerCase().includes(inviteSearch.toLowerCase())
  );

  // ── Role counts for stat cards ────────────────────────────────────────────────
  const roleCounts = STAFF_ROLES.reduce<Record<string, number>>((acc, role) => {
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
          <p className="text-slate-400">
            Manage staff, sales &amp; technical support members
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Staff</p>
              <p className="text-2xl font-bold text-white">{staffUsers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Sales</p>
              <p className="text-2xl font-bold text-green-400">{roleCounts.sales ?? 0}</p>
            </div>
            <Briefcase className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Tech Support</p>
              <p className="text-2xl font-bold text-orange-400">{roleCounts.technical_support ?? 0}</p>
            </div>
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pending Invites</p>
              <p className="text-2xl font-bold text-yellow-400">{stats?.pending ?? 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Main tabs */}
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

      {/* ── STAFF TAB ─────────────────────────────────────────────────────────── */}
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
                <option value=""                  className="bg-slate-900">All Roles</option>
                <option value="staff"             className="bg-slate-900">Staff</option>
                <option value="sales"             className="bg-slate-900">Sales</option>
                <option value="technical_support" className="bg-slate-900">Technical Support</option>
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0 text-sm font-bold text-white">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── INVITATIONS TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'invitations' && (
        <>
          {/* Filters */}
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

          {/* Invitations list */}
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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-400" />
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
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
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
                  <option value="staff"             className="bg-slate-900">Staff — General operations</option>
                  <option value="sales"             className="bg-slate-900">Sales — Client acquisition</option>
                  <option value="technical_support" className="bg-slate-900">Technical Support — Tickets &amp; hosting</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  The role determines what permissions the staff member will have
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Invitation Expires In (days)
                </label>
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

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium">Invitation will be sent via email</p>
                    <p className="text-xs text-slate-400 mt-1">
                      The invited person will receive a link to create their account and set their password.
                    </p>
                  </div>
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
    </DashboardLayout>
  );
};

export default StaffManagement;