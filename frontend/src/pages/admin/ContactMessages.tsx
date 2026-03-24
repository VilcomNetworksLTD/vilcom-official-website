import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Search,
  Eye,
  CheckCircle2,
  PhoneCall,
  Trash2,
  UserCheck,
  X,
  Clock,
  Building2,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  RefreshCw,
  Ban,
  StickyNote,
  Calendar,
  Phone,
  AtSign,
  Users,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { contactService } from '@/services/contact';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  subject: string;
  message: string;
  status: 'pending' | 'contacted' | 'resolved' | 'spam';
  admin_notes?: string;
  user_id?: number;
  assigned_staff_id?: number;
  contacted_at?: string;
  resolved_at?: string;
  ip_address?: string;
  created_at: string;
  user?: { id: number; name: string; email: string };
  assignedStaff?: { id: number; name: string; email: string };
}

interface Stats {
  overview: {
    total: number;
    pending: number;
    contacted: number;
    resolved: number;
    spam: number;
    this_month: number;
    last_month: number;
    resolution_rate: number;
    response_rate: number;
  };
  by_department: Record<string, number>;
}

interface Staff {
  id: number;
  name: string;
  email: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-amber-400',  bg: 'bg-amber-500/20',  border: 'border-amber-500/30',  icon: Clock },
  contacted: { label: 'Contacted', color: 'text-blue-400',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   icon: PhoneCall },
  resolved:  { label: 'Resolved',  color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/30',  icon: CheckCircle2 },
  spam:      { label: 'Spam',      color: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/30',    icon: Ban },
};

const DEPT_CONFIG: Record<string, { color: string; bg: string }> = {
  sales:   { color: 'text-indigo-300', bg: 'bg-indigo-500/20' },
  support: { color: 'text-cyan-300',   bg: 'bg-cyan-500/20' },
  billing: { color: 'text-emerald-300',bg: 'bg-emerald-500/20' },
  other:   { color: 'text-slate-300',  bg: 'bg-slate-500/20' },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ─── Badges ───────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: ContactMessage['status'] }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const DeptBadge = ({ dept }: { dept: string }) => {
  const cfg = DEPT_CONFIG[dept] ?? DEPT_CONFIG.other;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${cfg.bg} ${cfg.color}`}>
      {dept}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; sub?: string;
}) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center border flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDrawer = ({
  msg, staff, onClose, onUpdate, isAdmin,
}: {
  msg: ContactMessage;
  staff: Staff[];
  onClose: () => void;
  onUpdate: () => void;
  isAdmin: boolean;
}) => {
  const [notes, setNotes] = useState(msg.admin_notes ?? '');
  const [assignedId, setAssignedId] = useState<number | ''>(msg.assigned_staff_id ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (newStatus?: string) => {
    setSaving(true);
    try {
      await contactService.updateAdminMessage(msg.id!, {
        status: (newStatus ?? msg.status) as string,
        admin_notes: notes,
        assigned_staff_id: assignedId !== '' ? Number(assignedId) : undefined,
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const quickAction = async (action: 'contacted' | 'resolved') => {
    setSaving(true);
    try {
      if (action === 'contacted') await contactService.markContacted(msg.id!);
      else await contactService.markResolved(msg.id!);
      onUpdate();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-l border-white/20 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Message #{msg.id}</p>
            <h3 className="text-lg font-semibold text-white leading-tight">{msg.subject}</h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={msg.status} />
              <DeptBadge dept={msg.department} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sender</p>
            <div className="flex items-center gap-2 text-sm text-white">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {msg.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{msg.name}</span>
              {msg.user && <span className="text-xs text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">Registered</span>}
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <a href={`mailto:${msg.email}`} className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors">
                <AtSign className="w-4 h-4 text-slate-500" />
                {msg.email}
              </a>
              {msg.phone && (
                <a href={`tel:${msg.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {msg.phone}
                </a>
              )}
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" />
                Received {fmtDateTime(msg.created_at)}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Message</p>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          {(msg.contacted_at || msg.resolved_at) && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Timeline</p>
              {msg.contacted_at && (
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <PhoneCall className="w-4 h-4" />
                  Contacted on {fmtDateTime(msg.contacted_at)}
                </div>
              )}
              {msg.resolved_at && (
                <div className="flex items-center gap-2 text-sm text-green-300">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolved on {fmtDateTime(msg.resolved_at)}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Assign Staff
            </label>
            <select
              value={assignedId}
              onChange={(e) => setAssignedId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="" className="bg-slate-900">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
              ))}
            </select>
            {msg.assignedStaff && (
              <p className="text-xs text-slate-500 mt-1">Currently: {msg.assignedStaff.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <StickyNote className="w-3.5 h-3.5 inline mr-1" />
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Internal notes (not visible to sender)..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          <button
            onClick={() => save()}
            disabled={saving}
            className="w-full py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 text-sm hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Notes & Assignment'}
          </button>
        </div>

        <div className="px-6 py-4 border-t border-white/10 space-y-2">
          {msg.status !== 'contacted' && msg.status !== 'resolved' && (
            <button
              onClick={() => quickAction('contacted')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4" />
              Mark as Contacted
            </button>
          )}
          {msg.status !== 'resolved' && (
            <button
              onClick={() => quickAction('resolved')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Resolved
            </button>
          )}
          {msg.status !== 'spam' && (
            <button
              onClick={() => save('spam')}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              Mark as Spam
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ContactMessages = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactService.getAdminMessages({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        department: deptFilter !== 'all' ? deptFilter : undefined,
        search: search || undefined,
        page,
        per_page: 15,
      });
      setMessages(res.data ?? []);
      if (res.meta) setMeta(res.meta);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, deptFilter, search, page]);

  const loadStats = useCallback(async () => {
    try {
      const res = await contactService.getStatistics();
      setStats(res.data);
    } catch { /* silent */ }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await contactService.getStaff();
      setStaff(res.data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); loadStaff(); }, [loadStats, loadStaff]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message permanently?')) return;
    try {
      await contactService.deleteMessage(id);
      load(); loadStats();
    } catch { /* silent */ }
  };

  const tabs = [
    { value: 'all',       label: 'All',       count: stats?.overview.total ?? 0 },
    { value: 'pending',   label: 'Pending',   count: stats?.overview.pending ?? 0 },
    { value: 'contacted', label: 'Contacted', count: stats?.overview.contacted ?? 0 },
    { value: 'resolved',  label: 'Resolved',  count: stats?.overview.resolved ?? 0 },
    { value: 'spam',      label: 'Spam',      count: stats?.overview.spam ?? 0 },
  ];

  return (
    <DashboardLayout userType={isAdmin ? 'admin' : 'staff'}>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-400" />
            Contact Messages
          </h1>
          <p className="text-slate-400 mt-1">Manage and respond to enquiries from the website</p>
        </div>
        <button
          onClick={() => { load(); loadStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={stats.overview.total} icon={MessageSquare}
            color="bg-blue-500/20 border-blue-500/30 text-blue-400"
            sub={`${stats.overview.this_month} this month`} />
          <StatCard label="Pending" value={stats.overview.pending} icon={Clock}
            color="bg-amber-500/20 border-amber-500/30 text-amber-400" />
          <StatCard label="Contacted" value={stats.overview.contacted} icon={PhoneCall}
            color="bg-blue-500/20 border-blue-500/30 text-blue-400" />
          <StatCard label="Resolved" value={stats.overview.resolved} icon={CheckCircle2}
            color="bg-green-500/20 border-green-500/30 text-green-400"
            sub={`${stats.overview.resolution_rate}% rate`} />
          <StatCard label="Response Rate" value={`${stats.overview.response_rate}%`} icon={TrendingUp}
            color="bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
            sub={`Spam: ${stats.overview.spam}`} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6 space-y-4">
        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => { setStatusFilter(t.value); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === t.value
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === t.value ? 'bg-blue-500/40' : 'bg-white/10'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Search + dept filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, subject, message…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none w-full sm:w-auto"
            >
              <option value="all" className="bg-slate-900">All Departments</option>
              <option value="sales" className="bg-slate-900">Sales</option>
              <option value="support" className="bg-slate-900">Support</option>
              <option value="billing" className="bg-slate-900">Billing</option>
              <option value="other" className="bg-slate-900">Other</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── CARD LIST (replaces the table — works on all screen sizes) ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-20 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No messages found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 hover:border-white/30 transition-all"
            >
              {/* Top row: avatar + sender info + date */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {msg.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{msg.name}</p>
                      <p className="text-xs text-slate-500 truncate">{msg.email}</p>
                    </div>
                    <p className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{fmtDate(msg.created_at)}</p>
                  </div>

                  {/* Subject + message preview */}
                  <p className="text-sm font-medium text-white mt-2">{msg.subject}</p>
                  <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{msg.message}</p>

                  {/* Badges row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={msg.status} />
                    <DeptBadge dept={msg.department} />
                    {msg.assignedStaff && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <UserCheck className="w-3.5 h-3.5" />
                        {msg.assignedStaff.name}
                      </span>
                    )}
                  </div>

                  {/* Actions — flex-wrap so they reflow on small screens */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <button
                      onClick={() => setSelected(msg)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    {msg.status !== 'contacted' && msg.status !== 'resolved' && (
                      <button
                        onClick={async () => { await contactService.markContacted(msg.id); load(); loadStats(); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-all"
                      >
                        <PhoneCall className="w-4 h-4" /> Contacted
                      </button>
                    )}
                    {msg.status !== 'resolved' && (
                      <button
                        onClick={async () => { await contactService.markResolved(msg.id); load(); loadStats(); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolve
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-all"
            >Prev</button>
            {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
              const p = meta.current_page <= 3
                ? i + 1
                : meta.current_page >= meta.last_page - 2
                  ? meta.last_page - 4 + i
                  : meta.current_page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    p === meta.current_page
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:bg-white/10'
                  }`}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page === meta.last_page}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-all"
            >Next</button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer
          msg={selected}
          staff={staff}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onUpdate={() => { load(); loadStats(); setSelected(null); }}
        />
      )}
    </DashboardLayout>
  );
};

export default ContactMessages;