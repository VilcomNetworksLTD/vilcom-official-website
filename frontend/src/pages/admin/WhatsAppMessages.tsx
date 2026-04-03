import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Search,
  RefreshCw,
  Eye,
  PhoneCall,
  CheckCircle2,
  Trash2,
  X,
  Clock,
  ChevronDown,
  ExternalLink,
  AtSign,
  Phone,
  Calendar,
  Globe,
  Monitor,
  Ban,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  Loader2
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import whatsappService, { WhatsAppMessage } from '@/services/whatsapp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ─── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-amber-300',  bg: 'bg-amber-500/20',  border: 'border-amber-500/30',  icon: Clock },
  contacted: { label: 'Contacted', color: 'text-blue-300',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   icon: PhoneCall },
  converted: { label: 'Converted', color: 'text-green-300',  bg: 'bg-green-500/20',  border: 'border-green-500/30',  icon: CheckCircle2 },
  failed:    { label: 'Failed',    color: 'text-red-300',    bg: 'bg-red-500/20',    border: 'border-red-500/30',    icon: Ban },
};

const TYPE_CONFIG = {
  predefined: { label: 'Predefined', color: 'text-purple-300', bg: 'bg-purple-500/20' },
  custom:     { label: 'Custom',     color: 'text-cyan-300',   bg: 'bg-cyan-500/20' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const waUrl = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;

const tryPathname = (url: string | null) => {
  if (!url) return '-';
  try { return new URL(url).pathname; } catch { return url; }
};

const makeGlassCard = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl';

// ─── WhatsApp SVG icon ─────────────────────────────────────────────────────────

const WaIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Badges ────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: WhatsAppMessage['status'] }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      <span className="hidden xs:inline">{cfg.label}</span>
    </span>
  );
};

const TypeBadge = ({ type }: { type: WhatsAppMessage['message_type'] }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.custom;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, color, sub, icon: Icon
}: { label: string; value: string | number; color: string; sub?: string; icon: any }) => (
  <div className={`${makeGlassCard} p-3 sm:p-4`}>
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-[10px] sm:text-xs mb-0.5 truncate">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-white truncate">{value}</p>
        {sub && <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
      <Icon className={`w-5 h-5 sm:w-8 sm:h-8 ${color} opacity-70 shrink-0`} />
    </div>
  </div>
);

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

const DetailDrawer = ({
  msg, onClose, onUpdate, isAdmin,
}: {
  msg: WhatsAppMessage;
  onClose: () => void;
  onUpdate: () => void;
  isAdmin: boolean;
}) => {
  const [acting, setActing] = useState(false);
  const [convertMsg, setConvertMsg] = useState<{ type: 'success'|'error'; text: string } | null>(null);
  const [convertingClient, setConvertingClient] = useState(false);
  const { toast } = useToast();

  const act = async (fn: () => Promise<unknown>) => {
    setActing(true);
    try {
      await fn();
      toast({ title: 'Success', description: 'Action completed.' });
      onUpdate();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to complete action.', variant: 'destructive' });
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`${makeGlassCard} w-full max-w-2xl bg-slate-900/95 flex flex-col overflow-hidden max-h-[95vh] sm:max-h-[90vh] shadow-2xl relative my-4 sm:my-8`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 mb-1">WhatsApp Lead #{msg.id}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <StatusBadge status={msg.status} />
              <TypeBadge type={msg.message_type} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 space-y-3">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Details</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <WaIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm truncate">{msg.name || 'Anonymous'}</p>
                {msg.user && <p className="text-xs text-blue-400 mt-0.5">Registered user #{msg.user.id}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 text-sm mt-3">
              {msg.phone && (
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm truncate flex-1">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{msg.phone}</span>
                  </div>
                  <a
                    href={waUrl(msg.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-[10px] sm:text-xs hover:bg-green-500/30 transition-all flex-shrink-0"
                  >
                    <WaIcon className="w-3 h-3" />
                    <span>Chat</span>
                  </a>
                </div>
              )}
              {msg.email && (
                <a href={`mailto:${msg.email}`} className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors text-xs sm:text-sm truncate">
                  <AtSign className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{msg.email}</span>
                </a>
              )}
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{fmtDateTime(msg.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Message Preview</p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Information</p>
            {msg.page_url && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm overflow-hidden">
                  <Globe className="w-4 h-4 flex-shrink-0 text-slate-500" />
                  <span className="truncate">{tryPathname(msg.page_url)}</span>
                </div>
                <a href={msg.page_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-blue-400 hover:text-blue-300">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
            {msg.ip_address && (
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm truncate">
                <Monitor className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-mono truncate">{msg.ip_address}</span>
              </div>
            )}
            {msg.source && (
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm truncate">
                <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>Source: <span className="text-slate-300">{msg.source}</span></span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 space-y-3 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {msg.phone && (
              <a
                href={waUrl(msg.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-xs sm:text-sm font-medium sm:col-span-2"
              >
                <WaIcon className="w-4 h-4" />
                Reply on WhatsApp
              </a>
            )}
            {msg.status === 'pending' && (
              <button
                onClick={() => act(() => whatsappService.markContacted(msg.id))}
                disabled={acting}
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
              >
                <PhoneCall className="w-4 h-4" />
                Mark as Contacted
              </button>
            )}
            {msg.status === 'contacted' && (
              <button
                onClick={() => act(() => whatsappService.markConverted(msg.id))}
                disabled={acting}
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Converted
              </button>
            )}
            {msg.status !== 'failed' && (
              <button
                onClick={() => act(() => whatsappService.updateMessage(msg.id, { status: 'failed' }))}
                disabled={acting}
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-xs sm:text-sm disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                Mark as Failed
              </button>
            )}
          </div>
          
          <div className="border-t border-white/10 pt-3 mt-1">
            {convertMsg && (
              <div className={`flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg mb-3 ${
                convertMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
              }`}>
                {convertMsg.type === 'success' ? <UserPlus className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                <span className="break-words">{convertMsg.text}</span>
              </div>
            )}
            <button
              disabled={convertingClient || msg.status === 'converted'}
              onClick={async () => {
                setConvertingClient(true);
                setConvertMsg(null);
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/admin/clients/convert`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                    body: JSON.stringify({ source_type: 'whatsapp', source_id: msg.id }),
                  });
                  const data = await res.json();
                  setConvertMsg({ type: res.ok ? 'success' : 'error', text: data.message ?? (res.ok ? 'Client provisioned!' : 'Failed.') });
                  if (res.ok) onUpdate();
                } catch { setConvertMsg({ type: 'error', text: 'Network error.' }); }
                finally { setConvertingClient(false); }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/25 transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              {convertingClient ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</> : <><UserPlus className="w-4 h-4" /> Convert to Client</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WhatsAppMessages() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WhatsAppMessage | null>(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', message_type: '', search: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.current_page,
        per_page: 15,
        ...(filters.status && { status: filters.status }),
        ...(filters.message_type && { message_type: filters.message_type }),
        ...(filters.search && { search: filters.search }),
      };
      const res = await whatsappService.getMessages(params);
      const result = res.data;
      setMessages(result.data ?? []);
      if (result.meta) {
        setPagination(p => ({
          ...p,
          current_page: result.meta.current_page,
          last_page: result.meta.last_page,
          total: result.meta.total,
        }));
      }
    } catch { setMessages([]); }
    finally { setLoading(false); }
  }, [filters, pagination.current_page]);

  const loadStats = useCallback(async () => {
    try {
      const res = await whatsappService.getStatistics();
      setStats(res.data?.data ?? res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this WhatsApp lead permanently?')) return;
    try { await whatsappService.deleteMessage(id); load(); loadStats(); }
    catch { /* silent */ }
  };

  const setPage = (p: number) => setPagination(prev => ({ ...prev, current_page: p }));

  const tabs = [
    { value: '',          label: 'All',       count: stats?.overview?.total ?? 0 },
    { value: 'pending',   label: 'Pending',   count: stats?.overview?.pending ?? 0 },
    { value: 'contacted', label: 'Contacted', count: stats?.overview?.contacted ?? 0 },
    { value: 'converted', label: 'Converted', count: stats?.overview?.converted ?? 0 },
    { value: 'failed',    label: 'Failed',    count: stats?.overview?.failed ?? 0 },
  ];

  return (
    <DashboardLayout userType={isAdmin ? 'admin' : 'staff'}>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <WaIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          WhatsApp Messages
        </h1>
        <p className="text-slate-400 mt-1 text-xs sm:text-sm">Track and manage WhatsApp chat leads from the website</p>
      </div>

      {/* Stats */}
      {stats?.overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatCard label="Total Leads"  value={stats.overview.total}                      color="text-green-400" icon={MessageCircle} />
          <StatCard label="Pending"    value={stats.overview.pending}                    color="text-amber-400" icon={Clock} />
          <StatCard label="Contacted"  value={stats.overview.contacted}                  color="text-blue-400" icon={PhoneCall} />
          <StatCard label="Conversion" value={`${stats.overview.conversion_rate}%`}      color="text-cyan-400" icon={TrendingUp} sub="converted / total" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 bg-white/5 rounded-xl p-1 mb-4 sm:mb-6 scrollbar-hide w-full sm:w-fit max-w-full">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { setFilters(f => ({ ...f, status: t.value })); setPage(1); }}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 flex-1 sm:flex-none ${
              filters.status === t.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{t.label}</span>
            <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${filters.status === t.value ? 'bg-white/20' : 'bg-white/10'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 w-full">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filters.message_type}
            onChange={(e) => { setFilters(f => ({ ...f, message_type: e.target.value })); setPage(1); }}
            className="flex-1 sm:flex-none sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-sm outline-none transition-all"
          >
            <option value="">All Types</option>
            <option value="predefined">Predefined</option>
            <option value="custom">Custom</option>
          </select>
          {(filters.status || filters.message_type || filters.search) && (
            <button
               onClick={() => { setFilters({ status: '', message_type: '', search: '' }); setPage(1); }}
               className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs sm:text-sm hover:bg-blue-500/30 transition-colors shrink-0"
             >
               <X className="w-3 h-3" /> Clear
             </button>
          )}
          <button onClick={() => { load(); loadStats(); }} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:text-white transition-colors shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-green-500 w-8 h-8" />
        </div>
      ) : messages.length === 0 ? (
        <div className={`${makeGlassCard} py-8 sm:py-12 text-center`}>
          <WaIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1 text-sm sm:text-base">No WhatsApp leads found</p>
          <p className="text-slate-400 text-xs sm:text-sm">Leads appear when visitors click the WhatsApp button</p>
        </div>
      ) : (
        <>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${makeGlassCard} p-3 sm:p-5 hover:border-green-500/30 transition-all flex flex-col group cursor-pointer`}
                onClick={() => setSelected(msg)}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <WaIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-green-300 transition-colors" title={msg.name || 'Anonymous'}>{msg.name || 'Anonymous'}</p>
                      {msg.phone ? (
                        <a
                          href={waUrl(msg.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-green-400 hover:text-green-300 transition-colors truncate mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="truncate font-medium">{msg.phone}</span>
                        </a>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">{msg.email ?? 'No contact'}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0 hidden sm:block">{fmtDate(msg.created_at)}</p>
                </div>

                <div className="bg-green-500/5 rounded-lg border border-green-500/10 p-2 sm:p-3 mb-3 sm:mb-4 flex-1">
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 break-words leading-relaxed">{msg.message}</p>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-white/10 flex flex-col gap-2 sm:gap-3 mt-auto">
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <StatusBadge status={msg.status} />
                    {msg.page_url && (
                      <p className="text-[9px] sm:text-[11px] text-slate-500 font-mono truncate max-w-[80px] sm:max-w-[120px]" title={tryPathname(msg.page_url)}>
                        {tryPathname(msg.page_url)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(msg); }}
                      className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all"
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> View
                    </button>
                    {msg.phone && (
                      <button
                        onClick={(e) => { e.stopPropagation(); window.open(waUrl(msg.phone), '_blank'); }}
                        className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"
                      >
                        <WaIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Chat
                      </button>
                    )}
                    {isAdmin && !msg.phone && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                        className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-auto pt-6 pb-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6 sm:mt-8 pb-4">
                <button disabled={pagination.current_page === 1} onClick={() => setPage(pagination.current_page - 1)} className="w-full sm:w-auto px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-40 hover:bg-white/10 transition-colors text-sm font-medium">Previous</button>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-slate-300 text-sm font-medium">Page {pagination.current_page} of {pagination.last_page}</span>
                </div>
                <button disabled={pagination.current_page === pagination.last_page} onClick={() => setPage(pagination.current_page + 1)} className="w-full sm:w-auto px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-40 hover:bg-white/10 transition-colors text-sm font-medium">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && <DetailDrawer msg={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} onUpdate={() => { load(); loadStats(); }} />}
    </DashboardLayout>
  );
}
