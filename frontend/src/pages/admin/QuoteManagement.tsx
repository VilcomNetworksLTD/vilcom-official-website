import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Loader2, RefreshCw, FileText, MessageCircle, DollarSign,
  Users, Clock, CheckCircle2, MoreHorizontal, Eye, Send,
  ChevronLeft, ChevronRight, Search, X, AlertCircle, UserPlus, MailCheck, XCircle,
} from 'lucide-react';
import { adminQuotesApi, type QuoteRequest, type QuoteStatistics } from '@/services/quotes';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:                    { label: 'Pending',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' },
  under_review:               { label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: 'bg-blue-400 shadow-[0_0_6px_#3b82f6]' },
  quoted:                     { label: 'Quoted',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  dot: 'bg-violet-400 shadow-[0_0_6px_#8b5cf6]' },
  accepted:                   { label: 'Accepted',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
  rejected:                   { label: 'Rejected',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: 'bg-red-400 shadow-[0_0_6px_#ef4444]' },
  expired:                    { label: 'Expired',      color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: 'bg-slate-500' },
  converted_to_subscription:  { label: 'Converted',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
};

const URGENCY_META: Record<string, { color: string; bg: string }> = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  medium:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  low:      { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const SERVICE_LABELS: Record<string, string> = {
  internet_plan: 'Internet Plan', hosting_package: 'Hosting Package',
  web_development: 'Web Development', cloud_services: 'Cloud Services',
  cyber_security: 'Cyber Security', network_infrastructure: 'Network Infrastructure',
  isp_services: 'ISP Services', cpe_device: 'CPE Device',
  satellite_connectivity: 'Satellite Connectivity', media_services: 'Media Services',
  erp_services: 'ERP Services', smart_integration: 'Smart Integration', other: 'Other',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  const m = STATUS_META[status] ?? { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', dot: 'bg-slate-500' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold"
      style={{ color: m.color, background: m.bg }}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  const m = URGENCY_META[urgency] ?? URGENCY_META.low;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold capitalize"
      style={{ color: m.color, background: m.bg }}>
      {urgency}
    </span>
  );
};

// ─── Quote Card (Mobile) ─────────────────────────────────────────────────────
const QuoteCard = ({ quote, onView, onMarkReview, onSubmitQuote, onConvertToClient, onResendQuote, onUpdateStatus }: {
  quote: QuoteRequest;
  onView: () => void;
  onMarkReview: (id: number) => void;
  onSubmitQuote: (quote: QuoteRequest) => void;
  onConvertToClient: (quote: QuoteRequest) => void;
  onResendQuote: (quote: QuoteRequest) => void;
  onUpdateStatus: (id: number, status: 'accepted' | 'rejected') => void;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-blue-400 text-sm font-semibold">{quote.quote_number}</p>
        <p className="text-white font-semibold text-sm mt-1 truncate">{quote.contact_name}</p>
        <p className="text-slate-500 text-xs truncate">{quote.contact_email}</p>
        {quote.company_name && <p className="text-slate-600 text-xs truncate">{quote.company_name}</p>}
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
          {(quote.status === 'pending' || quote.status === 'under_review') && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-amber-400 hover:text-amber-300 cursor-pointer focus:bg-amber-500/10"
                onClick={() => onMarkReview(quote.id)}>
                <Clock className="w-3.5 h-3.5" /> Mark Review
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-violet-400 hover:text-violet-300 cursor-pointer focus:bg-violet-500/10"
                onClick={() => onSubmitQuote(quote)}>
                <Send className="w-3.5 h-3.5" /> Submit Quote
              </DropdownMenuItem>
            </>
          )}
          {quote.status === 'quoted' && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-violet-400 hover:text-violet-300 cursor-pointer focus:bg-violet-500/10"
                onClick={() => onSubmitQuote(quote)}>
                <Send className="w-3.5 h-3.5" /> Update & Resubmit
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-teal-400 hover:text-teal-300 cursor-pointer focus:bg-teal-500/10"
                onClick={() => onResendQuote(quote)}>
                <MailCheck className="w-3.5 h-3.5" /> Resend Email
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
                onClick={() => onUpdateStatus(quote.id, 'accepted')}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Accept Quote
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
                onClick={() => onUpdateStatus(quote.id, 'rejected')}>
                <XCircle className="w-3.5 h-3.5" /> Reject Quote
              </DropdownMenuItem>
            </>
          )}
          {(quote.status === 'quoted' || quote.status === 'accepted') && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
                onClick={() => onConvertToClient(quote)}>
                <UserPlus className="w-3.5 h-3.5" /> Convert to Client
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={quote.status} />
      <UrgencyBadge urgency={quote.urgency ?? 'low'} />
    </div>
    <div className="flex items-center justify-between pt-1 border-t border-white/10">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium text-slate-400 capitalize px-2 py-1 rounded-lg bg-white/5 border border-white/10 w-fit">
          {SERVICE_LABELS[quote.service_type] ?? quote.service_type}
        </span>
        {(quote.product || quote.product_id) && (
          <span className="text-[10px] text-blue-400 pl-1">
            {quote.product?.name ?? `Product #${quote.product_id}`}
          </span>
        )}
      </div>
      <div className="text-right">
         {quote.quoted_price ? (
           <span className="text-emerald-400 font-semibold text-sm">KES {quote.quoted_price.toLocaleString()}</span>
         ) : (
           <span className="text-slate-600 text-xs">No Quote</span>
         )}
      </div>
    </div>
  </div>
);

// ─── Quote Detail Modal ──────────────────────────────────────────────────────

const QuoteDetailModal = ({
  quote, onClose, onMarkReview, onOpenQuoteForm, onConvertToClient, onResendQuote, onUpdateStatus
}: {
  quote: QuoteRequest;
  onClose: () => void;
  onMarkReview: (id: number) => void;
  onOpenQuoteForm: (quote: QuoteRequest) => void;
  onConvertToClient: (quote: QuoteRequest) => void;
  onResendQuote: (quote: QuoteRequest) => void;
  onUpdateStatus: (id: number, status: 'accepted' | 'rejected') => void;
}) => {
  const canAct = quote.status === 'pending' || quote.status === 'under_review';
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <DialogTitle className="text-white font-bold text-lg">Quote Details</DialogTitle>
              <p className="text-blue-400 font-mono text-sm">{quote.quote_number}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Status + Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
              <StatusBadge status={quote.status} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Service Type</p>
              <span className="text-sm font-medium text-white">
                {SERVICE_LABELS[quote.service_type] ?? quote.service_type}
              </span>
            </div>
            {(quote.product || quote.product_id) && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Linked Product</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  {quote.product?.name ?? `Product #${quote.product_id}`}
                  {quote.product_id && (
                    <span className="text-xs text-slate-500 ml-1">(ID: {quote.product_id})</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contact Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Name',    quote.contact_name],
                ['Email',   quote.contact_email],
                ['Phone',   quote.contact_phone],
                ['Company', quote.company_name],
                ['Urgency', quote.urgency],
                ['Budget',  quote.budget_range],
                ['Timeline',quote.timeline],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string}>
                  <p className="text-xs text-slate-500 mb-0.5">{k as string}</p>
                  <p className="text-sm text-white font-medium">{v as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* General Info */}
          {quote.general_info && Object.keys(quote.general_info).length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Project Overview</p>
              <div className="space-y-2">
                {Object.entries(quote.general_info).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-500 text-xs capitalize min-w-[120px] pt-0.5">{k.replace(/_/g, ' ')}:</span>
                    <span className="text-white text-xs">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Requirements */}
          {quote.technical_requirements && Object.keys(quote.technical_requirements).length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Technical Requirements</p>
              <div className="space-y-2">
                {Object.entries(quote.technical_requirements).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-500 text-xs capitalize min-w-[120px] pt-0.5">{k.replace(/_/g, ' ')}:</span>
                    <span className="text-white text-xs">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quoted price */}
          {quote.quoted_price && (
            <div className="rounded-xl border p-4" style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.3)' }}>
              <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Quoted Price</p>
              <p className="text-2xl font-bold text-white">KES {quote.quoted_price.toLocaleString()}</p>
              {quote.admin_response && (
                <p className="text-sm text-slate-300 mt-2">{quote.admin_response}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 flex-wrap">
          {canAct && (
            <>
              <Button size="sm"
                onClick={() => { onMarkReview(quote.id); onClose(); }}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> Mark Review
              </Button>
              <Button size="sm"
                onClick={() => { onClose(); onOpenQuoteForm(quote); }}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Quote
              </Button>
            </>
          )}
          {quote.status === 'quoted' && (
            <>
              <Button size="sm"
                onClick={() => { onResendQuote(quote); onClose(); }}
                className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                <MailCheck className="w-3.5 h-3.5 mr-1.5" /> Resend Email
              </Button>
              <Button size="sm"
                onClick={() => { onUpdateStatus(quote.id, 'accepted'); onClose(); }}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Accept
              </Button>
              <Button size="sm"
                onClick={() => { onUpdateStatus(quote.id, 'rejected'); onClose(); }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
              </Button>
            </>
          )}
          {(quote.status === 'quoted' || quote.status === 'accepted') && (
            <Button size="sm"
              onClick={() => { onClose(); onConvertToClient(quote); }}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Convert to Client
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white h-9 w-full sm:w-auto sm:ml-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Submit Quote Modal ───────────────────────────────────────────────────────

const SubmitQuoteModal = ({
  quote, onClose, onSubmit,
}: {
  quote: QuoteRequest;
  onClose: () => void;
  onSubmit: (id: number, data: { quoted_price: number; staff_notes?: string; admin_response: string }) => Promise<void>;
}) => {
  const [form, setForm] = useState({
    quoted_price: quote.quoted_price?.toString() ?? '',
    admin_response: '',
    staff_notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.quoted_price || !form.admin_response) return;
    setSaving(true);
    try {
      await onSubmit(quote.id, {
        quoted_price:   parseFloat(form.quoted_price),
        admin_response: form.admin_response,
        staff_notes:    form.staff_notes || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-violet-400" />
            <div>
              <DialogTitle className="text-white font-bold text-lg">Submit Quote</DialogTitle>
              <p className="text-blue-400 font-mono text-sm">{quote.quote_number}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-slate-400 text-sm mb-1.5 block">Quoted Price (KES) *</Label>
            <input
              type="number" min="0" step="0.01"
              value={form.quoted_price}
              onChange={e => setForm(f => ({ ...f, quoted_price: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition text-sm"
            />
          </div>
          <div>
            <Label className="text-slate-400 text-sm mb-1.5 block">Response Message to Customer *</Label>
            <textarea
              rows={4}
              value={form.admin_response}
              onChange={e => setForm(f => ({ ...f, admin_response: e.target.value }))}
              placeholder="Message included with the quote…"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none"
            />
          </div>
          <div>
            <Label className="text-slate-400 text-sm mb-1.5 block">Internal Notes <span className="text-slate-600">(not visible to customer)</span></Label>
            <textarea
              rows={3}
              value={form.staff_notes}
              onChange={e => setForm(f => ({ ...f, staff_notes: e.target.value }))}
              placeholder="Internal notes…"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !form.quoted_price || !form.admin_response}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-6 rounded-xl w-full sm:w-auto">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Send Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuoteManagement() {
  const { hasRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole('admin') && !hasRole('staff')) return <Navigate to="/client/dashboard" replace />;

  const [quotes, setQuotes]           = useState<QuoteRequest[]>([]);
  const [statistics, setStatistics]   = useState<QuoteStatistics | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [detailQuote, setDetailQuote] = useState<QuoteRequest | null>(null);
  const [quoteFormFor, setQuoteFormFor] = useState<QuoteRequest | null>(null);
  const [convertingQuote, setConvertingQuote] = useState<QuoteRequest | null>(null);
  const [convertMsg, setConvertMsg]   = useState<{ type: 'success'|'error'; text: string } | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [filters, setFilters]         = useState({ status: '', service_type: '', search: '' });
  const [pagination, setPagination]   = useState({ current_page: 1, last_page: 1, total: 0 });

  const loadQuotes = async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const params: Record<string, unknown> = { page: pagination.current_page, per_page: 15 };
      if (filters.status)       params.status       = filters.status;
      if (filters.service_type) params.service_type = filters.service_type;
      if (filters.search)       params.search       = filters.search;

      const result = await adminQuotesApi.getAll(params);
      setQuotes(result.data ?? []);
      setPagination(p => ({
        ...p,
        current_page: result.meta?.current_page ?? 1,
        last_page:    result.meta?.last_page    ?? 1,
        total:        result.meta?.total        ?? 0,
      }));
    } catch (e: any) {
      console.error('[QuoteManagement] Failed to load quotes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await adminQuotesApi.getStatistics();
      setStatistics(stats);
    } catch (e: any) {
      console.error('[QuoteManagement] Failed to load statistics:', e);
    }
  };

  const refresh = () => { loadQuotes(true); loadStatistics(); };

  useEffect(() => {
    loadQuotes();
    loadStatistics();
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [filters.status, filters.service_type, filters.search, pagination.current_page]);

  const handleMarkReview = async (id: number) => {
    try { await adminQuotesApi.markUnderReview(id); refresh(); }
    catch (e) { console.error(e); }
  };

  const handleResendQuote = async (quote: QuoteRequest) => {
    setResendingId(quote.id);
    try {
      const result = await adminQuotesApi.resend(quote.id);
      setConvertMsg({ type: 'success', text: `Quote email resent to ${result.resent_to} ✓` });
      refresh();
    } catch {
      setConvertMsg({ type: 'error', text: 'Failed to resend quote. Please try again.' });
    } finally {
      setResendingId(null);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      await adminQuotesApi.update(id, { status });
      refresh();
    } catch {
      setConvertMsg({ type: 'error', text: `Failed to mark quote as ${status}.` });
    }
  };

  const handleSubmitQuote = async (id: number, data: {
    quoted_price: number; staff_notes?: string; admin_response: string;
  }) => {
    await adminQuotesApi.submitQuote(id, data);
    refresh();
  };

  const handleConvertToClient = async (quote: QuoteRequest) => {
    if (!confirm(`Convert "${quote.contact_name}" into a Client account?\n\nAn email with a password setup link will be sent to: ${quote.contact_email}`)) return;
    setConvertingQuote(quote);
    setConvertMsg(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/admin/clients/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ source_type: 'quote', source_id: quote.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setConvertMsg({ type: 'success', text: data.message ?? 'Client provisioned successfully!' });
        refresh();
      } else {
        setConvertMsg({ type: 'error', text: data.message ?? 'Conversion failed. Please try again.' });
      }
    } catch {
      setConvertMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setConvertingQuote(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatPrice = (p?: number) => p ? `KES ${p.toLocaleString()}` : '—';

  const statusFilters = [
    { v: '',             l: 'All' },
    { v: 'pending',      l: 'Pending' },
    { v: 'under_review', l: 'Under Review' },
    { v: 'quoted',       l: 'Quoted' },
    { v: 'accepted',     l: 'Accepted' },
    { v: 'rejected',     l: 'Rejected' },
    { v: 'expired',      l: 'Expired' },
    { v: 'converted_to_subscription', l: 'Converted' },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="w-full px-2 sm:px-4 py-4 sm:py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase hidden sm:inline">Sales Pipeline</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Quote Management</h1>
            <p className="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm hidden sm:block">Manage and respond to customer quote requests</p>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh}
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stat Cards */}
        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <StatCard label="Total"       value={statistics.overview.total}       icon={FileText}    accent="#3b82f6" />
            <StatCard label="Pending"     value={statistics.overview.pending}     icon={Clock}       accent="#f59e0b" />
            <StatCard label="Under Review"value={statistics.overview.under_review}icon={Users}       accent="#3b82f6" />
            <StatCard label="Quoted"      value={statistics.overview.quoted}      icon={DollarSign}  accent="#8b5cf6" />
            <StatCard label="Accepted"    value={statistics.overview.accepted}    icon={CheckCircle2}accent="#10b981" />
            <StatCard label="Converted"   value={statistics.overview.converted}   icon={MessageCircle} accent="#10b981" />
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
                placeholder="Search quote #, name, email…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition"
              />
              {filters.search && (
                <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Service type select */}
            <select
              value={filters.service_type}
              onChange={e => setFilters(f => ({ ...f, service_type: e.target.value }))}
              className="w-full sm:flex-shrink-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition">
              <option value="">All Services</option>
              {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            {/* Status filter pills */}
             <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 sm:pb-0">
              {statusFilters.map(({ v, l }) => (
                <button key={v} onClick={() => setFilters(f => ({ ...f, status: v }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                    filters.status === v
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                  }`}>{l}</button>
              ))}
            </div>
             {(filters.search || filters.service_type || filters.status) && (
              <button
                onClick={() => setFilters({ status: '', service_type: '', search: '' })}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 flex-shrink-0">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
           {/* Header row */}
           <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr_auto] gap-3 px-4 sm:px-5 py-3 bg-white/[0.02] border-b border-white/10 min-w-[800px]">
            {['Quote #','Service','Customer','Status','Price','Urgency','Date',''].map((h, i) => (
              <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
            ))}
          </div>

          {/* Body */}
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading quotes…</span>
              </div>
            ) : quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No quote requests found</p>
                <p className="text-sm mt-1">
                  {filters.search || filters.status || filters.service_type
                    ? 'Try adjusting your search or filters'
                    : 'Quote requests from the website will appear here'}
                </p>
              </div>
            ) : quotes.map(quote => (
              <div key={quote.id}
                className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr_auto] gap-3 px-4 sm:px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group min-w-[800px]">

                {/* Quote # */}
                <span className="font-mono text-blue-400 text-sm font-semibold truncate">
                  {quote.quote_number}
                </span>

                {/* Service */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-400 capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 w-fit truncate">
                    {SERVICE_LABELS[quote.service_type] ?? quote.service_type}
                  </span>
                  {(quote.product || quote.product_id) && (
                    <span className="text-[10px] text-blue-400 truncate pl-1">
                      {quote.product?.name ?? `Product #${quote.product_id}`}
                    </span>
                  )}
                </div>

                {/* Customer */}
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{quote.contact_name}</p>
                  <p className="text-slate-500 text-xs truncate">{quote.contact_email}</p>
                  {quote.company_name && (
                    <p className="text-slate-600 text-xs truncate">{quote.company_name}</p>
                  )}
                </div>

                {/* Status */}
                <StatusBadge status={quote.status} />

                {/* Price */}
                <span className={`text-sm font-semibold ${quote.quoted_price ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {formatPrice(quote.quoted_price)}
                </span>

                {/* Urgency */}
                <UrgencyBadge urgency={quote.urgency ?? 'low'} />

                {/* Date */}
                <span className="text-slate-500 text-xs">{formatDate(quote.created_at)}</span>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"
                      className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
                    <DropdownMenuItem
                      className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8 focus:text-white"
                      onClick={() => setDetailQuote(quote)}>
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </DropdownMenuItem>
                    {(quote.status === 'pending' || quote.status === 'under_review') && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="gap-2 text-amber-400 hover:text-amber-300 cursor-pointer focus:bg-amber-500/10 focus:text-amber-300"
                          onClick={() => handleMarkReview(quote.id)}>
                          <Clock className="w-3.5 h-3.5" /> Mark Under Review
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="gap-2 text-violet-400 hover:text-violet-300 cursor-pointer focus:bg-violet-500/10 focus:text-violet-300"
                          onClick={() => setQuoteFormFor(quote)}>
                          <Send className="w-3.5 h-3.5" /> Submit Quote
                        </DropdownMenuItem>
                      </>
                    )}
                    {quote.status === 'quoted' && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="gap-2 text-violet-400 hover:text-violet-300 cursor-pointer focus:bg-violet-500/10 focus:text-violet-300"
                          onClick={() => setQuoteFormFor(quote)}>
                          <Send className="w-3.5 h-3.5" /> Update & Resubmit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={resendingId === quote.id}
                          className="gap-2 text-teal-400 hover:text-teal-300 cursor-pointer focus:bg-teal-500/10 focus:text-teal-300"
                          onClick={() => handleResendQuote(quote)}>
                          {resendingId === quote.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <MailCheck className="w-3.5 h-3.5" />}
                          Resend Quote Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-300"
                          onClick={() => handleUpdateStatus(quote.id, 'accepted')}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Quote
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
                          onClick={() => handleUpdateStatus(quote.id, 'rejected')}>
                          <XCircle className="w-3.5 h-3.5" /> Reject Quote
                        </DropdownMenuItem>
                      </>
                    )}
                    {(quote.status === 'quoted' || quote.status === 'accepted') && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-300"
                          onClick={() => handleConvertToClient(quote)}>
                          <UserPlus className="w-3.5 h-3.5" /> Convert to Client
                        </DropdownMenuItem>
                      </>
                    )}
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
              <span className="text-sm">Loading quotes…</span>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No quote requests found</p>
            </div>
          ) : quotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote}
              onView={() => setDetailQuote(quote)}
              onMarkReview={handleMarkReview}
              onSubmitQuote={(q) => { setDetailQuote(null); setQuoteFormFor(q); }}
              onConvertToClient={handleConvertToClient}
              onResendQuote={handleResendQuote}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {((pagination.current_page - 1) * 15) + 1}–{Math.min(pagination.current_page * 15, pagination.total)} of {pagination.total}
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

      {/* Convert to Client toast */}
      {convertMsg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl transition-all ${
          convertMsg.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
            : 'bg-red-900/90 border-red-500/40 text-red-300'
        }`}>
          {convertMsg.type === 'success' ? <UserPlus className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {convertMsg.text}
          <button onClick={() => setConvertMsg(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Converting overlay */}
      {convertingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-900 rounded-xl border border-white/10 text-white">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Provisioning client account…</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {detailQuote && (
        <QuoteDetailModal
          quote={detailQuote}
          onClose={() => setDetailQuote(null)}
          onMarkReview={handleMarkReview}
          onOpenQuoteForm={q => { setDetailQuote(null); setQuoteFormFor(q); }}
          onConvertToClient={handleConvertToClient}
          onResendQuote={q => { setDetailQuote(null); handleResendQuote(q); }}
          onUpdateStatus={(id, status) => { handleUpdateStatus(id, status); setDetailQuote(null); }}
        />
      )}

      {quoteFormFor && (
        <SubmitQuoteModal
          quote={quoteFormFor}
          onClose={() => setQuoteFormFor(null)}
          onSubmit={handleSubmitQuote}
        />
      )}
    </DashboardLayout>
  );
}