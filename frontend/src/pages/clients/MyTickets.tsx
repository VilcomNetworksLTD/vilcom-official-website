import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Loader2, LifeBuoy, Plus, Search, X, Eye, MessageSquare,
  CheckCircle2, Clock, XCircle, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { ticketsApi, type Ticket } from '@/services/tickets';

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
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ color: m.color, background: m.bg }}>{priority}</span>
  );
};

// ─── New Ticket Modal ─────────────────────────────────────────────────────────

const NewTicketModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: '' });
  const [saving, setSaving] = useState(false);
  const ic = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition text-sm";

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    try { await ticketsApi.create(form); onCreated(); onClose(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-400" /> New Support Ticket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div><Label className="text-slate-400 text-sm mb-1.5 block">Subject *</Label>
            <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} placeholder="Briefly describe your issue" className={ic} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-400 text-sm mb-1.5 block">Priority</Label>
              <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))} className={ic}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select></div>
            <div><Label className="text-slate-400 text-sm mb-1.5 block">Category</Label>
              <input value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))} placeholder="e.g. Billing, Technical" className={ic} /></div>
          </div>
          <div><Label className="text-slate-400 text-sm mb-1.5 block">Description *</Label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} rows={5}
              placeholder="Describe your issue in detail…" className={`${ic} resize-none`} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !form.title || !form.description}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 rounded-xl">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Submit Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── View Ticket Modal ────────────────────────────────────────────────────────

const ViewTicketModal = ({ ticketId, onClose, onUpdate }: { ticketId: number; onClose: () => void; onUpdate: () => void }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const ic = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition text-sm";

  useEffect(() => {
    ticketsApi.get(ticketId).then(r => setTicket(r.data ?? r)).finally(() => setLoading(false));
  }, [ticketId]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketsApi.reply(ticketId, reply);
      setReply('');
      const r = await ticketsApi.get(ticketId);
      setTicket(r.data ?? r);
      onUpdate();
    } catch (e) { console.error(e); } finally { setSending(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <LifeBuoy className="w-5 h-5 text-blue-400" />
            <div>
              <DialogTitle className="text-white font-bold text-lg">Support Ticket</DialogTitle>
              {ticket && <p className="text-slate-400 text-sm truncate max-w-xs">{ticket.title}</p>}
            </div>
          </div>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
        ) : ticket ? (
          <div className="space-y-4 py-2">
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.assignedTo && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Assigned to {ticket.assignedTo.name}
                </span>
              )}
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Your Request</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            {/* Thread */}
            {(ticket.replies ?? []).filter(r => !r.is_internal).length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Conversation</p>
                {(ticket.replies ?? []).filter(r => !r.is_internal).map(r => (
                  <div key={r.id} className={`rounded-xl p-3 text-sm ${r.user_id === ticket.user?.id ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{r.user?.name} {r.user_id !== ticket.user?.id ? '· Support' : ''}</span>
                      <span className="text-slate-600 text-xs">{new Date(r.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Reply input */}
            {!['closed'].includes(ticket.status) && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Add Reply</p>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
                  placeholder="Describe the issue further or provide updates…" className={`${ic} resize-none`} />
                <Button size="sm" onClick={sendReply} disabled={!reply.trim() || sending}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <MessageSquare className="w-3.5 h-3.5 mr-1.5" />} Send Reply
                </Button>
              </div>
            )}
          </div>
        ) : <p className="text-slate-500 text-sm py-8 text-center">Ticket not found.</p>}
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white h-9 ml-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyTickets() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [viewId, setViewId]       = useState<number | null>(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const params: any = { page: pagination.current_page, per_page: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search)       params.search = search;
      const res = await ticketsApi.getAll(params);
      setTickets(res.data ?? []);
      setPagination(p => ({ ...p, current_page: res.meta?.current_page ?? 1, last_page: res.meta?.last_page ?? 1, total: res.meta?.total ?? 0 }));
    } catch (e) { console.error(e); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [statusFilter, search, pagination.current_page]);

  return (
    <DashboardLayout userType="client">
      <div className="w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase">Support</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Tickets</h1>
            <p className="text-slate-400 mt-1 text-sm">Track your support requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => load(true)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setShowNew(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-500/30 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Ticket
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <span className="text-xs text-slate-600 ml-auto">{pagination.total} tickets</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[{v:'',l:'All'},{v:'open',l:'Open'},{v:'in_progress',l:'In Progress'},{v:'resolved',l:'Resolved'},{v:'closed',l:'Closed'}].map(({v,l}) => (
              <button key={v} onClick={() => setStatusFilter(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter===v ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading tickets…</span></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 rounded-2xl border border-white/[0.07] bg-white/[0.01]">
              <LifeBuoy className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium text-slate-500">No tickets yet</p>
              <p className="text-sm mt-1 mb-5">Submit a ticket if you need help</p>
              <Button onClick={() => setShowNew(true)} size="sm"
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold h-9 px-4 rounded-lg">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Ticket
              </Button>
            </div>
          ) : tickets.map(t => (
            <div key={t.id} onClick={() => setViewId(t.id)}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    {t.category && <span className="text-xs text-slate-500 capitalize">{t.category}</span>}
                  </div>
                  <h3 className="text-white font-semibold text-sm">{t.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 truncate">{t.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-slate-600 text-xs">{new Date(t.created_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</span>
                  {(t.replies_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MessageSquare className="w-3 h-3" />{t.replies_count}
                    </span>
                  )}
                  <Eye className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors mt-1" />
                </div>
              </div>
              {t.assignedTo && (
                <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Handled by {t.assignedTo.name}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {((pagination.current_page-1)*15)+1}–{Math.min(pagination.current_page*15,pagination.total)} of {pagination.total}</p>
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

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={() => load(true)} />}
      {viewId && <ViewTicketModal ticketId={viewId} onClose={() => setViewId(null)} onUpdate={() => load(true)} />}
    </DashboardLayout>
  );
}