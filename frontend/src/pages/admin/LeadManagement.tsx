import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Loader2, RefreshCw, Users, Search, X, MoreHorizontal, Eye,
  UserCheck, TrendingUp, Zap, ChevronLeft, ChevronRight,
  MessageCircle, Star, Globe, Smartphone, Monitor, Tablet,
  CheckCircle2, XCircle, ArrowRightCircle,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { adminLeadsApi, type Lead, type LeadStatistics } from '@/services/leads';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:       { label: 'New',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: 'bg-blue-400 shadow-[0_0_6px_#3b82f6]' },
  contacted: { label: 'Contacted', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' },
  qualified: { label: 'Qualified', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  dot: 'bg-violet-400 shadow-[0_0_6px_#8b5cf6]' },
  proposal:  { label: 'Proposal',  color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   dot: 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' },
  converted: { label: 'Converted', color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
  lost:      { label: 'Lost',      color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: 'bg-slate-500' },
  spam:      { label: 'Spam',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: 'bg-red-500' },
};

const SOURCE_LABELS: Record<string, string> = {
  plan_cta: 'Plan CTA', coverage_checker: 'Coverage Check',
  quote_form: 'Quote Form', newsletter: 'Newsletter',
  booking_partial: 'Booking', contact_form: 'Contact Form',
  whatsapp: 'WhatsApp', phone_call: 'Phone', referral: 'Referral',
  organic: 'Organic', paid_ad: 'Paid Ad', social_media: 'Social',
  other: 'Other',
};

const PIPELINE_STATUSES = ['new','contacted','qualified','proposal','converted','lost','spam'];

const scoreLevel = (s: number) => {
  if (s >= 75) return { label: 'Hot',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  if (s >= 50) return { label: 'Warm', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (s >= 25) return { label: 'Cool', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  return             { label: 'Cold', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

// Identical to Quote Management StatCard for consistency
const StatCard = ({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  accent: string; sub?: React.ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:bg-white/10 transition-all">
    <div className="flex items-start justify-between">
      <p className="text-xs sm:text-sm font-medium text-slate-400">{label}</p>
      <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${accent}18` }}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: accent }} />
      </div>
    </div>
    <div>
      <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <div className="mt-1 sm:mt-1.5 text-xs text-slate-500 hidden sm:block">{sub}</div>}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const m = STATUS_META[status] ?? STATUS_META.new;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
      style={{ color: m.color, background: m.bg }}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

const ScoreBadge = ({ score }: { score: number }) => {
  const l = scoreLevel(score);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold" style={{ color: l.color, background: l.bg }}>
      <Star className="w-2.5 h-2.5" />{score}
      <span className="hidden sm:inline"> · {l.label}</span>
    </span>
  );
};

const DeviceIcon = ({ type }: { type: string }) => {
  if (type === 'mobile')  return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
  if (type === 'tablet')  return <Tablet className="w-3.5 h-3.5 text-slate-500" />;
  return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
};

// ─── Lead Card (Mobile - Styled EXACTLY like Quote Management Card) ─────────
const LeadCard = ({ lead, onView, onQuickStatus, onDelete }: {
  lead: Lead;
  onView: () => void;
  onQuickStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-blue-400 text-sm font-semibold">#{lead.id}</p>
        <p className="text-white font-semibold text-sm mt-1 truncate">{lead.name ?? <span className="text-slate-600 italic">Unknown</span>}</p>
        <p className="text-slate-500 text-xs truncate">{lead.email ?? '—'}</p>
        {lead.company_name && <p className="text-slate-600 text-xs truncate">{lead.company_name}</p>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
          <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8" onClick={onView}>
            <Eye className="w-3.5 h-3.5" /> View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          {lead.status === 'new' && (
            <DropdownMenuItem className="gap-2 text-amber-400 hover:text-amber-300 cursor-pointer focus:bg-amber-500/10"
              onClick={() => onQuickStatus(lead.id, 'contacted')}>
              <MessageCircle className="w-3.5 h-3.5" /> Mark Contacted
            </DropdownMenuItem>
          )}
          {lead.status === 'contacted' && (
            <DropdownMenuItem className="gap-2 text-violet-400 hover:text-violet-300 cursor-pointer focus:bg-violet-500/10"
              onClick={() => onQuickStatus(lead.id, 'qualified')}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Qualified
            </DropdownMenuItem>
          )}
          {!['converted','lost','spam'].includes(lead.status) && (
            <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
              onClick={() => onQuickStatus(lead.id, 'converted')}>
              <ArrowRightCircle className="w-3.5 h-3.5" /> Convert
            </DropdownMenuItem>
          )}
          {lead.status !== 'spam' && (
            <DropdownMenuItem className="gap-2 text-slate-400 hover:text-slate-300 cursor-pointer focus:bg-white/8"
              onClick={() => onQuickStatus(lead.id, 'lost')}>
              <XCircle className="w-3.5 h-3.5" /> Mark Lost
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
            onClick={() => onDelete(lead.id)}>
            <XCircle className="w-3.5 h-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={lead.status} />
      <ScoreBadge score={lead.score} />
      <span className="text-[10px] font-medium text-slate-400 capitalize px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
        {SOURCE_LABELS[lead.source] ?? lead.source}
      </span>
      {lead.is_business && <span className="text-[10px] font-medium text-cyan-400 capitalize px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">Business</span>}
    </div>
    <div className="flex items-center justify-between pt-1 border-t border-white/10">
      <div className="flex items-center gap-1">
         <DeviceIcon type={lead.device_type} />
         <span className="text-xs text-slate-500 truncate max-w-[150px]">
           {lead.assignedStaff?.name ?? <span className="text-slate-600 italic">Unassigned</span>}
         </span>
      </div>
      <span className="text-slate-500 text-xs">{fmtDate(lead.created_at)}</span>
    </div>
  </div>
);

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

const LeadDetailModal = ({ leadId, onClose, onAction }: {
  leadId: number; onClose: () => void; onAction: () => void;
}) => {
  const [lead, setLead]       = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null);
  const [staffList, setStaffList] = useState<{id:number;name:string}[]>([]);
  const [assignId, setAssignId]   = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    adminLeadsApi.get(leadId)
      .then(r => { setLead(r.data ?? r); setNewStatus((r.data ?? r).status); })
      .finally(() => setLoading(false));
    adminLeadsApi.getStaff().then(r => setStaffList(r.data ?? []));
  }, [leadId]);

  const act = async (action: string, fn: () => Promise<any>) => {
    setActing(action);
    try { await fn(); onAction(); const r = await adminLeadsApi.get(leadId); setLead(r.data ?? r); }
    catch (e) { console.error(e); } finally { setActing(null); }
  };

  const ic = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition text-sm";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <DialogTitle className="text-white font-bold text-lg">Lead Details</DialogTitle>
              {lead && <p className="text-slate-400 text-sm">#{lead.id} · {SOURCE_LABELS[lead.source] ?? lead.source}</p>}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
        ) : lead ? (
          <div className="space-y-4 sm:space-y-5 py-2">
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <ScoreBadge score={lead.score} />
              <DeviceIcon type={lead.device_type} />
              {lead.is_business && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-cyan-400 bg-cyan-400/10">Business</span>
              )}
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Contact Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  ['Name',    lead.name],
                  ['Email',   lead.email],
                  ['Phone',   lead.phone],
                  ['Company', lead.company_name],
                  ['Source',  SOURCE_LABELS[lead.source] ?? lead.source],
                  ['Product', lead.product?.name],
                ].filter(([,v]) => v).map(([k,v]) => (
                  <div key={k as string}>
                    <p className="text-xs text-slate-500 mb-0.5">{k as string}</p>
                    <p className="text-sm text-white font-medium break-all">{v as string}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                ['Page Views',   lead.page_views],
                ['Time on Site', `${Math.round(lead.time_on_site / 60)}m`],
                ['Scroll Depth', `${lead.scroll_depth}%`],
              ].map(([k,v]) => (
                <div key={k} className="rounded-xl bg-white/5 border border-white/10 p-2.5 sm:p-3 text-center">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-base sm:text-lg font-bold text-white">{v}</p>
                </div>
              ))}
            </div>

            {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">UTM Tracking</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {[['Source', lead.utm_source],['Medium', lead.utm_medium],['Campaign', lead.utm_campaign]]
                    .filter(([,v]) => v).map(([k,v]) => (
                      <div key={k as string}>
                        <p className="text-xs text-slate-500 mb-0.5">{k as string}</p>
                        <p className="text-xs sm:text-sm text-white font-medium truncate">{v as string}</p>
                      </div>
                  ))}
                </div>
              </div>
            )}

            {lead.message && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Message</p>
                <p className="text-sm text-slate-300 bg-white/5 rounded-lg p-3 border border-white/10 whitespace-pre-wrap">{lead.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
              {[
                ['Created',      fmtDate(lead.created_at)],
                ['Last Contact', fmtDate(lead.last_contacted_at)],
                ['Converted',   fmtDate(lead.converted_at)],
              ].map(([k,v]) => (
                <div key={k} className="rounded-xl bg-white/5 border border-white/10 p-2.5 sm:p-3">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-xs text-white font-medium">{v}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-400 text-sm mb-1.5 block">Update Status</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={`${ic} flex-1`}>
                    {PIPELINE_STATUSES.map(s => <option key={s} value={s} className="capitalize">{STATUS_META[s]?.label ?? s}</option>)}
                  </select>
                  <Button size="sm" disabled={newStatus === lead.status || acting === 'status'}
                    onClick={() => act('status', () => adminLeadsApi.updateStatus(lead.id, newStatus))}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 h-9 px-3 rounded-lg text-xs font-semibold shrink-0">
                    {acting === 'status' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Set'}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-slate-400 text-sm mb-1.5 block">
                  Assign to {lead.assignedStaff ? <span className="text-white">({lead.assignedStaff.name})</span> : null}
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={assignId} onChange={e => setAssignId(e.target.value)} className={`${ic} flex-1`}>
                    <option value="">Select staff…</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <Button size="sm" disabled={!assignId || acting === 'assign'}
                    onClick={() => act('assign', () => adminLeadsApi.assign(lead.id, parseInt(assignId)))}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 h-9 px-3 rounded-lg text-xs font-semibold shrink-0">
                    {acting === 'assign' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : <p className="text-slate-500 text-sm py-8 text-center">Lead not found.</p>}

        {lead && (
          <DialogFooter className="flex gap-2 flex-wrap">
            {lead.status !== 'converted' && (
              <Button size="sm" disabled={acting === 'convert'}
                onClick={() => act('convert', () => adminLeadsApi.convert(lead.id))}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                {acting === 'convert' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <ArrowRightCircle className="w-3.5 h-3.5 mr-1.5" />} Convert
              </Button>
            )}
            <Button size="sm" disabled={acting === 'auto-assign'}
              onClick={() => act('auto-assign', () => adminLeadsApi.autoAssign(lead.id))}
              className="bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 border border-slate-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
              {acting === 'auto-assign' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />} Auto-assign
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white h-9 w-full sm:w-auto sm:ml-auto">Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeadManagement() {
  const { hasRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole('admin') && !hasRole('staff')) return <Navigate to="/client/dashboard" replace />;

  const [leads, setLeads]           = useState<Lead[]>([]);
  const [stats, setStats]           = useState<LeadStatistics | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailId, setDetailId]     = useState<number | null>(null);
  const [filters, setFilters]       = useState({ status: '', source: '', search: '' });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const loadLeads = async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const params: any = { page: pagination.current_page, per_page: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.search) params.search = filters.search;
      const res = await adminLeadsApi.getAll(params);
      setLeads(res.data ?? []);
      setPagination(p => ({
        ...p,
        current_page: res.meta?.current_page ?? 1,
        last_page: res.meta?.last_page ?? 1,
        total: res.meta?.total ?? 0,
      }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const loadStats = async () => {
    try { const r = await adminLeadsApi.getStatistics(); setStats(r.data ?? r); }
    catch (e) { console.error(e); }
  };

  const refresh = () => { loadLeads(true); loadStats(); };
  useEffect(() => { loadLeads(); loadStats(); }, [filters, pagination.current_page]);

  const quickStatus = async (id: number, status: string) => {
    try { await adminLeadsApi.updateStatus(id, status); refresh(); }
    catch (e) { console.error(e); }
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    try { await adminLeadsApi.delete(id); refresh(); }
    catch (e) { console.error(e); }
  };

  const conversionRate = stats ? Math.round(((stats.overview.converted) / Math.max(stats.overview.total, 1)) * 100) : 0;

  return (
    <DashboardLayout userType="admin">
      <div className="w-full px-2 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase hidden sm:inline">Sales</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Lead Management</h1>
            <p className="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm hidden sm:block">Track and manage your sales pipeline</p>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh}
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats - Grid matches Quote Management */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <StatCard label="Total"     value={stats.overview.total}     icon={Users}          accent="#3b82f6" />
            <StatCard label="New"       value={stats.overview.new}       icon={Star}           accent="#3b82f6" />
            <StatCard label="Contacted" value={stats.overview.contacted} icon={MessageCircle}  accent="#f59e0b" />
            <StatCard label="Qualified" value={stats.overview.qualified} icon={CheckCircle2}   accent="#8b5cf6" />
            <StatCard label="Converted" value={stats.overview.converted} icon={ArrowRightCircle} accent="#10b981" />
            <StatCard label="Conv. Rate" value={`${conversionRate}%`}   icon={TrendingUp}     accent="#10b981"
              sub={<span className="text-slate-500">of {stats.overview.total} leads</span>} />
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Search name, email, phone…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition"
              />
              {filters.search && (
                <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Source select */}
            <select
              value={filters.source}
              onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
              className="w-full sm:flex-shrink-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition">
              <option value="">All Sources</option>
              {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            {/* Status filter pills */}
             <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 sm:pb-0">
              {[{v:'',l:'All'}, ...PIPELINE_STATUSES.map(s => ({ v:s, l: STATUS_META[s]?.label ?? s }))].map(({v, l}) => (
                <button key={v} onClick={() => setFilters(f => ({ ...f, status: v }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                    filters.status === v
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                  }`}>{l}</button>
              ))}
            </div>
             {(filters.search || filters.source || filters.status) && (
              <button
                onClick={() => setFilters({ status: '', source: '', search: '' })}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 flex-shrink-0">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table - Scrollable */}
        <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
           {/* Header row */}
           <div className="grid grid-cols-[1.2fr_1.8fr_1fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 px-4 sm:px-5 py-3 bg-white/[0.02] border-b border-white/10 min-w-[900px]">
            {['Lead ID','Contact','Source','Status','Score','Assigned','Date',''].map((h, i) => (
              <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
            ))}
          </div>

          {/* Body */}
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading leads…</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No leads found</p>
                <p className="text-sm mt-1">
                  {filters.search || filters.status || filters.source
                    ? 'Try adjusting your search or filters'
                    : 'Leads will appear as visitors interact with your site'}
                </p>
              </div>
            ) : leads.map(lead => (
              <div key={lead.id}
                className="grid grid-cols-[1.2fr_1.8fr_1fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 px-4 sm:px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group min-w-[900px]">

                {/* Lead ID */}
                <div>
                  <p className="font-mono text-blue-400 text-sm font-semibold">#{lead.id}</p>
                  <p className="text-white font-semibold text-sm truncate mt-0.5">{lead.name ?? <span className="text-slate-600 italic">Unknown</span>}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <DeviceIcon type={lead.device_type} />
                    {lead.is_business && <span className="text-xs text-cyan-500">Biz</span>}
                  </div>
                </div>

                {/* Contact */}
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{lead.email ?? '—'}</p>
                  <p className="text-slate-500 text-xs truncate">{lead.phone ?? ''}</p>
                </div>

                {/* Source */}
                <span className="text-xs font-medium text-slate-400 capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 w-fit truncate">
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </span>

                {/* Status */}
                <StatusBadge status={lead.status} />

                {/* Score */}
                <ScoreBadge score={lead.score} />

                {/* Assigned */}
                <span className="text-slate-400 text-sm truncate">
                  {lead.assignedStaff?.name ?? <span className="text-slate-600 italic text-xs">Unassigned</span>}
                </span>

                {/* Date */}
                <span className="text-slate-500 text-xs">{fmtDate(lead.created_at)}</span>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"
                      className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
                    <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8 focus:text-white"
                      onClick={() => setDetailId(lead.id)}>
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {lead.status === 'new' && (
                      <DropdownMenuItem className="gap-2 text-amber-400 hover:text-amber-300 cursor-pointer focus:bg-amber-500/10 focus:text-amber-300"
                        onClick={() => quickStatus(lead.id, 'contacted')}>
                        <MessageCircle className="w-3.5 h-3.5" /> Mark Contacted
                      </DropdownMenuItem>
                    )}
                    {lead.status === 'contacted' && (
                      <DropdownMenuItem className="gap-2 text-violet-400 hover:text-violet-300 cursor-pointer focus:bg-violet-500/10 focus:text-violet-300"
                        onClick={() => quickStatus(lead.id, 'qualified')}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Qualified
                      </DropdownMenuItem>
                    )}
                    {!['converted','lost','spam'].includes(lead.status) && (
                      <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-300"
                        onClick={() => quickStatus(lead.id, 'converted')}>
                        <ArrowRightCircle className="w-3.5 h-3.5" /> Convert
                      </DropdownMenuItem>
                    )}
                    {lead.status !== 'spam' && (
                      <DropdownMenuItem className="gap-2 text-slate-400 hover:text-slate-300 cursor-pointer focus:bg-white/8"
                        onClick={() => quickStatus(lead.id, 'lost')}>
                        <XCircle className="w-3.5 h-3.5" /> Mark Lost
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
                      onClick={() => deleteLead(lead.id)}>
                      <XCircle className="w-3.5 h-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading leads…</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No leads found</p>
            </div>
          ) : leads.map(lead => (
            <LeadCard key={lead.id} lead={lead}
              onView={() => setDetailId(lead.id)}
              onQuickStatus={quickStatus}
              onDelete={deleteLead} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {((pagination.current_page - 1) * 20) + 1}–{Math.min(pagination.current_page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(p => ({ ...p, current_page: p.current_page - 1 }))}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-slate-500 px-2">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <Button variant="ghost" size="icon"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(p => ({ ...p, current_page: p.current_page + 1 }))}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {detailId && (
        <LeadDetailModal
          leadId={detailId}
          onClose={() => setDetailId(null)}
          onAction={refresh}
        />
      )}
    </DashboardLayout>
  );
}