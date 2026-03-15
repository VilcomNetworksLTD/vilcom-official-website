import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Loader2, RefreshCw, LifeBuoy, Search, X, MoreHorizontal,
  Eye, UserCheck, CheckCircle2, XCircle, RotateCcw, MessageSquare,
  ChevronLeft, ChevronRight, AlertTriangle, Clock, StickyNote,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { adminTicketsApi, type Ticket, type TicketReply } from '@/services/tickets';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open:        { label: 'Open',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: 'bg-blue-400 shadow-[0_0_6px_#3b82f6]' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' },
  resolved:    { label: 'Resolved',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
  closed:      { label: 'Closed',      color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: 'bg-slate-500' },
};

const PRIORITY_META: Record<string, { color: string; bg: string }> = {
  urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  high:   { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  medium: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  low:    { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: React.ElementType; accent: string; sub?: React.ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:bg-white/[0.05] transition-colors">
    <div className="flex items-start justify-between">
      <p className="text-xs sm:text-sm font-medium text-slate-400">{label}</p>
      <div className="p-1.5 sm:p-2 rounded-xl" style={{ background: `${accent}18` }}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: accent }} /></div>
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <div className="mt-1 sm:mt-1.5 text-xs text-slate-500">{sub}</div>}
    </div>
    <div className="absolute bottom-0 left-0 h-0.5 w-1/3 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const m = STATUS_META[status] ?? STATUS_META.open;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: m.color, background: m.bg }}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{m.label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const m = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ color: m.color, background: m.bg }}>
      {priority}
    </span>
  );
};

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────

const TicketDetailModal = ({ ticketId, onClose, onAction }: {
  ticketId: number; onClose: () => void; onAction: () => void;
}) => {
  const [ticket, setTicket]     = useState<Ticket | null>(null);
  const [loading, setLoading]   = useState(true);
  const [reply, setReply]       = useState('');
  const [note, setNote]         = useState('');
  const [acting, setActing]     = useState<string | null>(null);
  const [staffList, setStaffList] = useState<{id:number;name:string}[]>([]);
  const [assignId, setAssignId] = useState('');
  const [tab, setTab]           = useState<'thread'|'assign'|'note'>('thread');

  useEffect(() => {
    adminTicketsApi.get(ticketId).then(r => setTicket(r.data ?? r)).finally(() => setLoading(false));
    adminTicketsApi.getStaff().then(r => setStaffList(r.data ?? []));
  }, [ticketId]);

  const act = async (action: string, fn: () => Promise<any>) => {
    setActing(action);
    try { await fn(); onAction(); const r = await adminTicketsApi.get(ticketId); setTicket(r.data ?? r); }
    catch (e) { console.error(e); } finally { setActing(null); }
  };

  const sendReply = () => act('reply', async () => { await adminTicketsApi.reply(ticketId, reply); setReply(''); });
  const sendNote  = () => act('note',  async () => { await adminTicketsApi.addInternalNote(ticketId, note); setNote(''); });
  const doAssign  = () => assignId && act('assign', () => adminTicketsApi.assign(ticketId, parseInt(assignId)));

  const inputCls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition text-sm";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <LifeBuoy className="w-5 h-5 text-blue-400" />
            <div>
              <DialogTitle className="text-white font-bold text-lg">Ticket #{ticketId}</DialogTitle>
              {ticket && <p className="text-slate-400 text-sm truncate max-w-xs">{ticket.title}</p>}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
        ) : ticket ? (
          <div className="space-y-5 py-2">
            {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-xs text-slate-500 mb-1">Customer</p>
                <p className="text-sm text-white font-medium">{ticket.user?.name}</p>
                <p className="text-xs text-slate-500">{ticket.user?.email}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-xs text-slate-500 mb-1">Status / Priority</p>
                <div className="flex gap-2 mt-1"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Description</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {([['thread','Thread'],['assign','Assign'],['note','Internal Note']] as const).map(([t,l]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab===t ? 'bg-blue-500/20 text-blue-300' : 'text-slate-500 hover:text-slate-300'}`}>{l}</button>
              ))}
            </div>

            {/* Thread */}
            {tab === 'thread' && (
              <div className="space-y-3">
                {(ticket.replies ?? []).filter(r => !r.is_internal).map(r => (
                  <div key={r.id} className={`rounded-xl p-3 text-sm ${r.user_id === ticket.user?.id ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{r.user?.name}</span>
                      <span className="text-slate-600 text-xs">{fmtDate(r.created_at)}</span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
                {!['closed'].includes(ticket.status) && (
                  <div className="space-y-2">
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                      placeholder="Write a reply to the customer…" className={`${inputCls} resize-none`} />
                    <Button size="sm" onClick={sendReply} disabled={!reply.trim() || acting==='reply'}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                      {acting==='reply' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <MessageSquare className="w-3.5 h-3.5 mr-1.5" />} Send Reply
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Assign */}
            {tab === 'assign' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Currently assigned to: <span className="text-white">{ticket.assignedTo?.name ?? 'Unassigned'}</span></p>
                <select value={assignId} onChange={e => setAssignId(e.target.value)} className={inputCls}>
                  <option value="">Select staff member…</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Button size="sm" onClick={doAssign} disabled={!assignId || acting==='assign'}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                  {acting==='assign' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <UserCheck className="w-3.5 h-3.5 mr-1.5" />} Assign
                </Button>
              </div>
            )}

            {/* Internal note */}
            {tab === 'note' && (
              <div className="space-y-2">
                {(ticket.replies ?? []).filter(r => r.is_internal).map(r => (
                  <div key={r.id} className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-amber-400 text-xs">{r.user?.name} · Internal</span>
                      <span className="text-slate-600 text-xs">{fmtDate(r.created_at)}</span>
                    </div>
                    <p className="text-slate-300">{r.message}</p>
                  </div>
                ))}
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Internal note (not visible to customer)…" className={`${inputCls} resize-none`} />
                <Button size="sm" onClick={sendNote} disabled={!note.trim() || acting==='note'}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                  {acting==='note' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <StickyNote className="w-3.5 h-3.5 mr-1.5" />} Add Note
                </Button>
              </div>
            )}
          </div>
        ) : <p className="text-slate-500 text-sm py-8 text-center">Ticket not found.</p>}

        {ticket && (
          <DialogFooter className="flex gap-2 flex-wrap">
            {['open','in_progress'].includes(ticket.status) && (
              <Button size="sm" disabled={acting==='resolve'}
                onClick={() => act('resolve', () => adminTicketsApi.resolve(ticketId))}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                {acting==='resolve' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />} Resolve
              </Button>
            )}
            {ticket.status === 'resolved' && (
              <Button size="sm" disabled={acting==='close'}
                onClick={() => act('close', () => adminTicketsApi.close(ticketId))}
                className="bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 border border-slate-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                {acting==='close' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />} Close
              </Button>
            )}
            {['resolved','closed'].includes(ticket.status) && (
              <Button size="sm" disabled={acting==='reopen'}
                onClick={() => act('reopen', () => adminTicketsApi.reopen(ticketId))}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                {acting==='reopen' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />} Reopen
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white h-9 ml-auto">Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Ticket Card (Mobile) ─────────────────────────────────────────────────────
const TicketCard = ({ ticket, onView, onResolve, onReopen }: {
  ticket: Ticket;
  onView: () => void;
  onResolve: (id: number) => void;
  onReopen: (id: number) => void;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-sm truncate">{ticket.title}</p>
        {ticket.category && <p className="text-slate-600 text-xs mt-0.5">{ticket.category}</p>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
          <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8" onClick={onView}>
            <Eye className="w-3.5 h-3.5" /> View &amp; Reply
          </DropdownMenuItem>
          {['open','in_progress'].includes(ticket.status) && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
                onClick={() => onResolve(ticket.id)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
              </DropdownMenuItem>
            </>
          )}
          {['resolved','closed'].includes(ticket.status) && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-blue-500/10"
                onClick={() => onReopen(ticket.id)}>
                <RotateCcw className="w-3.5 h-3.5" /> Reopen
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="space-y-0.5">
      <p className="text-slate-300 text-sm truncate">{ticket.user?.name ?? '—'}</p>
      {ticket.user?.email && <p className="text-slate-500 text-xs truncate">{ticket.user.email}</p>}
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-white/10">
      <span className="text-slate-500 text-xs truncate max-w-[60%]">
        {ticket.assignedTo?.name ?? <span className="italic text-slate-600">Unassigned</span>}
      </span>
      <span className="text-slate-500 text-xs">{new Date(ticket.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</span>
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function TicketManagement() {
  const { hasRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole('admin') && !hasRole('staff')) return <Navigate to="/client/dashboard" replace />;

  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailId, setDetailId]   = useState<number | null>(null);
  const [filters, setFilters]     = useState({ status: '', priority: '', search: '' });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const loadTickets = async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const params: any = { page: pagination.current_page, per_page: 20 };
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search)   params.search   = filters.search;
      const res = await adminTicketsApi.getAll(params);
      setTickets(res.data ?? []);
      setPagination(p => ({ ...p, current_page: res.meta?.current_page ?? 1, last_page: res.meta?.last_page ?? 1, total: res.meta?.total ?? 0 }));
    } catch (e) { console.error(e); } finally { setLoading(false); setRefreshing(false); }
  };

  const loadAnalytics = async () => {
    try { const res = await adminTicketsApi.getAnalytics(); setAnalytics(res.data ?? res); } catch (e) { console.error(e); }
  };

  const refresh = () => { loadTickets(true); loadAnalytics(); };
  useEffect(() => { loadTickets(); loadAnalytics(); }, [filters, pagination.current_page]);

  return (
    <DashboardLayout userType="admin">
      <div className="w-full px-2 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase hidden sm:inline">Support</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Ticket Management</h1>
            <p className="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm hidden sm:block">Manage and respond to customer support tickets</p>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total"       value={analytics.summary.total}       icon={LifeBuoy}    accent="#3b82f6" />
            <StatCard label="Open"        value={analytics.summary.open}        icon={Clock}       accent="#3b82f6" />
            <StatCard label="In Progress" value={analytics.summary.in_progress} icon={MessageSquare} accent="#f59e0b" />
            <StatCard label="Resolved"    value={analytics.summary.resolved}    icon={CheckCircle2}accent="#10b981" />
            <StatCard label="Unassigned"  value={analytics.unassigned}          icon={AlertTriangle}accent="#ef4444" />
            <StatCard label="Urgent Open" value={analytics.by_priority.urgent}  icon={AlertTriangle}accent="#ef4444" />
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                placeholder="Search tickets…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition" />
              {filters.search && <button onClick={() => setFilters(f => ({...f,search:''}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <select value={filters.priority} onChange={e => setFilters(f => ({...f, priority: e.target.value}))}
              className="w-full sm:w-auto px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition">
              <option value="">All Priorities</option>
              {['urgent','high','medium','low'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {(filters.search || filters.priority || filters.status) && (
                <button onClick={() => setFilters({ status: '', priority: '', search: '' })} className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2">Clear all</button>
              )}
              <span className="text-xs text-slate-600 ml-auto sm:ml-0">{pagination.total} total</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap">
            {[{v:'',l:'All'},{v:'open',l:'Open'},{v:'in_progress',l:'In Progress'},{v:'resolved',l:'Resolved'},{v:'closed',l:'Closed'}].map(({v,l}) => (
              <button key={v} onClick={() => setFilters(f => ({...f, status: v}))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filters.status===v ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-white/[0.02] border-b border-white/[0.07]">
            {['Title','Customer','Status','Priority','Assigned To','Date',''].map((h,i) => (
              <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
            ))}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading tickets…</span></div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <LifeBuoy className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No tickets found</p>
                <p className="text-sm mt-1">{filters.search||filters.status||filters.priority ? 'Try adjusting your filters' : 'No support tickets yet'}</p>
              </div>
            ) : tickets.map(t => (
              <div key={t.id} className="grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_1fr_1fr_auto] gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                <div>
                  <p className="text-white font-semibold text-sm truncate">{t.title}</p>
                  {t.category && <p className="text-slate-600 text-xs">{t.category}</p>}
                </div>
                <div>
                  <p className="text-slate-300 text-sm truncate">{t.user?.name}</p>
                  <p className="text-slate-500 text-xs truncate">{t.user?.email}</p>
                </div>
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
                <span className="text-slate-400 text-sm">{t.assignedTo?.name ?? <span className="text-slate-600 italic">Unassigned</span>}</span>
                <span className="text-slate-500 text-xs">{new Date(t.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
                    <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8" onClick={() => setDetailId(t.id)}>
                      <Eye className="w-3.5 h-3.5" /> View & Reply
                    </DropdownMenuItem>
                    {['open','in_progress'].includes(t.status) && (<>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
                        onClick={async () => { await adminTicketsApi.resolve(t.id); refresh(); }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                      </DropdownMenuItem>
                    </>)}
                    {['resolved','closed'].includes(t.status) && (<>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="gap-2 text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-blue-500/10"
                        onClick={async () => { await adminTicketsApi.reopen(t.id); refresh(); }}>
                        <RotateCcw className="w-3.5 h-3.5" /> Reopen
                      </DropdownMenuItem>
                    </>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading tickets…</span></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <LifeBuoy className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No tickets found</p>
              <p className="text-sm mt-1">{filters.search||filters.status||filters.priority ? 'Try adjusting your filters' : 'No support tickets yet'}</p>
            </div>
          ) : tickets.map(t => (
            <TicketCard key={t.id} ticket={t}
              onView={() => setDetailId(t.id)}
              onResolve={async (id) => { await adminTicketsApi.resolve(id); refresh(); }}
              onReopen={async (id) => { await adminTicketsApi.reopen(id); refresh(); }} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {((pagination.current_page-1)*20)+1}–{Math.min(pagination.current_page*20,pagination.total)} of {pagination.total}</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled={pagination.current_page===1}
                onClick={() => setPagination(p => ({...p,current_page:p.current_page-1}))}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-xs text-slate-500 px-2">{pagination.current_page} / {pagination.last_page}</span>
              <Button variant="ghost" size="icon" disabled={pagination.current_page===pagination.last_page}
                onClick={() => setPagination(p => ({...p,current_page:p.current_page+1}))}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {detailId && <TicketDetailModal ticketId={detailId} onClose={() => setDetailId(null)} onAction={refresh} />}
    </DashboardLayout>
  );
}