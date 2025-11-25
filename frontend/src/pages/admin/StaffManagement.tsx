
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Send,
  RefreshCw,
  UserPlus,
  Shield,
  Users
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import invitationsService, { StaffInvitation, InvitationStats } from '@/services/invitations';

const StaffManagement = () => {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    role: 'staff' as 'admin' | 'staff' | 'sales' | 'technical_support',
    expires_days: 7,
  });

  useEffect(() => {
    loadInvitations();
    loadStats();
  }, [searchQuery, statusFilter]);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const response = await invitationsService.getAll({
        status: statusFilter || undefined,
      });
      setInvitations(response.data || []);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setInvitations([]);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await invitationsService.create({
        email: formData.email,
        role: formData.role,
        expires_days: formData.expires_days,
      });
      setShowModal(false);
      resetForm();
      loadInvitations();
      loadStats();
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      alert(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (id: string) => {
    if (!confirm('Are you sure you want to resend this invitation?')) return;
    
    try {
      await invitationsService.resend(id);
      loadInvitations();
      alert('Invitation resent successfully');
    } catch (error) {
      console.error('Failed to resend:', error);
      alert('Failed to resend invitation');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;
    
    try {
      await invitationsService.cancel(id);
      loadInvitations();
      loadStats();
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert('Failed to cancel invitation');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'staff',
      expires_days: 7,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      staff: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      sales: 'bg-green-500/20 text-green-300 border-green-500/30',
      technical_support: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    };
    
    return (
      <span className={`px-2 py-1 rounded-lg text-xs border ${colors[role] || colors.staff}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  const filteredInvitations = invitations.filter(inv => 
    inv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-slate-400">Invite and manage staff members</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 backdrop-blur-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      {/* Stats Cards - Glassmorphism */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Invitations</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Expired</p>
                <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
          >
            <option value="" className="bg-slate-900">All Status</option>
            <option value="pending" className="bg-slate-900">Pending</option>
            <option value="accepted" className="bg-slate-900">Accepted</option>
            <option value="expired" className="bg-slate-900">Expired</option>
          </select>
        </div>
      </div>

      {/* Invitations List - Glassmorphism */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{invitation.email}</h3>
                    {getRoleBadge(invitation.role)}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
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

                {/* Status & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invitation.status)}
                    <span className={`text-sm ${
                      invitation.status === 'pending' ? 'text-yellow-400' :
                      invitation.status === 'accepted' ? 'text-green-400' :
                      'text-red-400'
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

      {/* Modal - Glassmorphism */}
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
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  required
                >
                  <option value="admin" className="bg-slate-900">Admin</option>
                  <option value="staff" className="bg-slate-900">Staff</option>
                  <option value="sales" className="bg-slate-900">Sales</option>
                  <option value="technical_support" className="bg-slate-900">Technical Support</option>
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
                  <option value={3} className="bg-slate-900">3 days</option>
                  <option value={7} className="bg-slate-900">7 days</option>
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
                      The invited person will receive an email with a link to create their account and set their password.
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
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

