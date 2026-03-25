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
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Ban,
  StickyNote,
  Calendar,
  Phone,
  AtSign,
  Users,
  Filter,
  Building2,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { contactService } from '@/services/contact';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types & Helpers ────────────────────────────────────────────────────────────

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

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d: string) => new Date(d).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const makeGlassCard = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl';

// ─── Components ────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: ContactMessage['status'] }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
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

const StatCard = ({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) => (
  <div className={`${makeGlassCard} p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <Icon className={`w-8 h-8 ${color} opacity-70`} />
    </div>
  </div>
);

const DetailDrawer = ({ msg, staff, onClose, onUpdate, isAdmin }: { msg: ContactMessage; staff: Staff[]; onClose: () => void; onUpdate: () => void; isAdmin: boolean; }) => {
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
    } finally { setSaving(false); }
  };

  const quickAction = async (action: 'contacted' | 'resolved') => {
    setSaving(true);
    try {
      if (action === 'contacted') await contactService.markContacted(msg.id!);
      else await contactService.markResolved(msg.id!);
      onUpdate(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl flex flex-col overflow-hidden max-h-[90vh] shadow-2xl relative">
        <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Message #{msg.id}</p>
            <h3 className="text-lg font-semibold text-white leading-tight">{msg.subject}</h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={msg.status} />
              <DeptBadge dept={msg.department} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
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
              <a href={`mailto:${msg.email}`} className="flex items-center gap-2 text-slate-300 hover:text-blue-400"><AtSign className="w-4 h-4" />{msg.email}</a>
              {msg.phone && <a href={`tel:${msg.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-blue-400"><Phone className="w-4 h-4" />{msg.phone}</a>}
              <div className="flex items-center gap-2 text-slate-400"><Calendar className="w-4 h-4" />Received {fmtDateTime(msg.created_at)}</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Message</p>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          {(msg.contacted_at || msg.resolved_at) && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Timeline</p>
              {msg.contacted_at && <div className="flex items-center gap-2 text-sm text-blue-300"><PhoneCall className="w-4 h-4" />Contacted on {fmtDateTime(msg.contacted_at)}</div>}
              {msg.resolved_at && <div className="flex items-center gap-2 text-sm text-green-300"><CheckCircle2 className="w-4 h-4" />Resolved on {fmtDateTime(msg.resolved_at)}</div>}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"><Users className="w-3.5 h-3.5 inline mr-1" />Assign Staff</label>
            <select value={assignedId} onChange={(e) => setAssignedId(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="" className="bg-slate-900">Unassigned</option>
              {staff.map((s) => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
            </select>
            {msg.assignedStaff && <p className="text-xs text-slate-500 mt-1">Currently: {msg.assignedStaff.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"><StickyNote className="w-3.5 h-3.5 inline mr-1" />Admin Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Internal notes..." className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
          </div>

          <button onClick={() => save()} disabled={saving} className="w-full py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 text-sm hover:bg-white/20 transition-all disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Notes & Assignment'}
          </button>
        </div>

        <div className="px-6 py-4 border-t border-white/10 space-y-2.5 flex flex-col">
          {msg.status !== 'contacted' && msg.status !== 'resolved' && (
            <button onClick={() => quickAction('contacted')} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium disabled:opacity-50">
              <PhoneCall className="w-4 h-4" /> Mark as Contacted
            </button>
          )}
          {msg.status !== 'resolved' && (
            <button onClick={() => quickAction('resolved')} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium disabled:opacity-50">
              <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
            </button>
          )}
          {msg.status !== 'spam' && (
            <button onClick={() => save('spam')} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50">
              <Ban className="w-4 h-4" /> Mark as Spam
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
      const res = await contactService.getAdminMessages({ status: statusFilter !== 'all' ? statusFilter : undefined, department: deptFilter !== 'all' ? deptFilter : undefined, search: search || undefined, page, per_page: 15 });
      setMessages(res.data ?? []);
      if (res.meta) setMeta(res.meta);
    } catch { setMessages([]); } finally { setLoading(false); }
  }, [statusFilter, deptFilter, search, page]);

  const loadStats = useCallback(async () => {
    try { const res = await contactService.getStatistics(); setStats(res.data); } catch { /* silent */ }
  }, []);

  const loadStaff = useCallback(async () => {
    try { const res = await contactService.getStaff(); setStaff(res.data ?? []); } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); loadStaff(); }, [loadStats, loadStaff]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message permanently?')) return;
    try { await contactService.deleteMessage(id); load(); loadStats(); } catch { /* silent */ }
  };

  const tabs = [
    { value: 'all', label: 'All', count: stats?.overview.total ?? 0 },
    { value: 'pending', label: 'Pending', count: stats?.overview.pending ?? 0 },
    { value: 'contacted', label: 'Contacted', count: stats?.overview.contacted ?? 0 },
    { value: 'resolved', label: 'Resolved', count: stats?.overview.resolved ?? 0 },
    { value: 'spam', label: 'Spam', count: stats?.overview.spam ?? 0 },
  ];

  return (
    <DashboardLayout userType={isAdmin ? 'admin' : 'staff'}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-400" /> Contact Messages
          </h1>
          <p className="text-slate-400 mt-1">Manage and respond to enquiries from the website</p>
        </div>
        <button
          onClick={() => { load(); loadStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all text-sm w-full sm:w-auto justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total" value={stats.overview.total} icon={MessageSquare} color="text-blue-400" sub={`${stats.overview.this_month} this month`} />
          <StatCard label="Pending" value={stats.overview.pending} icon={Clock} color="text-amber-400" />
          <StatCard label="Contacted" value={stats.overview.contacted} icon={PhoneCall} color="text-blue-400" />
          <StatCard label="Resolved" value={stats.overview.resolved} icon={CheckCircle2} color="text-green-400" sub={`${stats.overview.resolution_rate}% rate`} />
        </div>
      )}

      {/* Tabs - Responsive like Career Page */}
      {/* Tabs - Responsive like Career Page */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-full sm:w-fit overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1); }} className={`shrink-0 px-4 sm:px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === t.value ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            {t.label} <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === t.value ? 'bg-white/20' : 'bg-white/10'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar - Responsive like Career Page */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search name, email, subject..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 outline-none text-sm transition-all" />
        </div>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="w-full sm:w-48 shrink-0 px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-sm outline-none transition-all">
          <option value="all">All Departments</option>
          <option value="sales">Sales</option>
          <option value="support">Support</option>
          <option value="billing">Billing</option>
          <option value="other">Other</option>
        </select>
        {(statusFilter !== 'all' || deptFilter !== 'all' || search) && (
          <button onClick={() => { setStatusFilter('all'); setDeptFilter('all'); setSearch(''); setPage(1); }} className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/30 transition-colors w-full sm:w-auto shrink-0">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* List - Responsive Row Layout like Career Applications */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : messages.length === 0 ? (
        <div className={`${makeGlassCard} p-12 text-center`}><MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" /><p className="text-white font-medium">No messages found</p><p className="text-slate-400 text-sm">Try adjusting your filters</p></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`${makeGlassCard} p-3 sm:p-5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col`} onClick={() => setSelected(msg)}>
                <div className="flex sm:flex-row flex-col gap-2 sm:gap-3 mb-2 sm:mb-3 overflow-hidden">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 hidden sm:flex">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">{msg.name}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">{msg.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3 flex-1 min-w-0">
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">{msg.subject || 'No Subject'}</p>
                  <p className="text-[10px] text-slate-500">{fmtDate(msg.created_at)}</p>
                </div>

                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 mt-auto">
                  <div className="col-span-2 sm:col-span-1 flex items-center">
                    <StatusBadge status={msg.status} />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end">
                    <DeptBadge dept={msg.department} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelected(msg); }} className="col-span-2 flex items-center justify-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] sm:text-xs hover:bg-blue-500/30 transition-all mt-1">
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> View Message
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6">
              <button disabled={meta.current_page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/70 disabled:opacity-40 hover:bg-white/20 transition-colors text-sm">Previous</button>
              <span className="text-slate-400 text-sm px-4">Page {meta.current_page} of {meta.last_page}</span>
              <button disabled={meta.current_page === meta.last_page} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/70 disabled:opacity-40 hover:bg-white/20 transition-colors text-sm">Next</button>
            </div>
          )}
        </>
      )}

      {selected && <DetailDrawer msg={selected} staff={staff} isAdmin={isAdmin} onClose={() => setSelected(null)} onUpdate={() => { load(); loadStats(); setSelected(null); }} />}
    </DashboardLayout>
  );
};

export default ContactMessages;