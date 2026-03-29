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
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import whatsappService, { WhatsAppMessage } from '@/services/whatsapp';
import { useAuth } from '@/contexts/AuthContext';

// ─── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-amber-400',  bg: 'bg-amber-500/20',  border: 'border-amber-500/30',  icon: Clock },
  contacted: { label: 'Contacted', color: 'text-blue-400',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   icon: PhoneCall },
  converted: { label: 'Converted', color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/30',  icon: CheckCircle2 },
  failed:    { label: 'Failed',    color: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/30',    icon: Ban },
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
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const TypeBadge = ({ type }: { type: WhatsAppMessage['message_type'] }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.custom;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, color, sub, icon: Icon
}: { label: string; value: string | number; color: string; sub?: string; icon: any }) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
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

  const act = async (fn: () => Promise<unknown>) => {
    setActing(true);
    try { await fn(); onUpdate(); onClose(); }
    finally { setActing(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl flex flex-col overflow-hidden max-h-[90vh] shadow-2xl relative">
        <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">WhatsApp Lead #{msg.id}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <StatusBadge status={msg.status} />
              <TypeBadge type={msg.message_type} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <WaIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{msg.name || 'Anonymous'}</p>
                {msg.user && <p className="text-xs text-blue-400">Registered user #{msg.user.id}</p>}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {msg.phone && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="break-all">{msg.phone}</span>
                  </div>
                  <a
                    href={waUrl(msg.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-all flex-shrink-0"
                  >
                    <WaIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Chat</span>
                  </a>
                </div>
              )}
              {msg.email && (
                <a href={`mailto:${msg.email}`} className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors text-xs sm:text-sm break-all">
                  <AtSign className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  {msg.email}
                </a>
              )}
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="break-all">{fmtDateTime(msg.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Message Sent</p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical Info</p>
            {msg.page_url && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                  <Globe className="w-4 h-4 flex-shrink-0 text-slate-500" />
                  <span className="break-all">{tryPathname(msg.page_url)}</span>
                </div>
                <a href={msg.page_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-blue-400 hover:text-blue-300">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
            {msg.ip_address && (
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <Monitor className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-mono break-all">{msg.ip_address}</span>
              </div>
            )}
            {msg.source && (
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <ArrowUpRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                Source: <span className="text-slate-300">{msg.source}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 space-y-2 sm:space-y-2.5 flex flex-col">
          {msg.phone && (
            <a
              href={waUrl(msg.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-xs sm:text-sm font-medium"
            >
              <WaIcon className="w-4 h-4" />
              Reply on WhatsApp
            </a>
          )}
          {msg.status === 'pending' && (
            <button
              onClick={() => act(() => whatsappService.markContacted(msg.id))}
              disabled={acting}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4" />
              Mark as Contacted
            </button>
          )}
          {msg.status === 'contacted' && (
            <button
              onClick={() => act(() => whatsappService.markConverted(msg.id))}
              disabled={acting}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Converted
            </button>
          )}
          {msg.status !== 'failed' && (
            <button
              onClick={() => act(() => whatsappService.updateMessage(msg.id, { status: 'failed' }))}
              disabled={acting}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-xs sm:text-sm disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              Mark as Failed
            </button>
          )}
          {/* Convert to Client */}
          {convertMsg && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
              convertMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
            }`}>
              {convertMsg.type === 'success' ? <UserPlus className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {convertMsg.text}
            </div>
          )}
          <button
            disabled={convertingClient}
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
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/25 transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
          >
            {convertingClient ? <><span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> Provisioning...</> : <><UserPlus className="w-4 h-4" /> Convert to Client</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const WhatsAppMessages = () => {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <WaIcon className="w-6 h-6 text-green-400" />
            WhatsApp Messages
          </h1>
          <p className="text-slate-400 mt-1">Track and manage WhatsApp chat leads from the website</p>
        </div>
        <button
          onClick={() => { load(); loadStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all text-sm w-full sm:w-auto justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats?.overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard label="Total"      value={stats.overview.total}                      color="text-white" icon={MessageCircle} />
          <StatCard label="Pending"    value={stats.overview.pending}                    color="text-amber-400" icon={Clock} />
          <StatCard label="Contacted"  value={stats.overview.contacted}                  color="text-blue-400" icon={PhoneCall} />
          <StatCard label="Converted"  value={stats.overview.converted}                  color="text-green-400" icon={CheckCircle2} />
          <StatCard label="Failed"     value={stats.overview.failed}                     color="text-red-400" icon={Ban} />
          <StatCard label="This Month" value={stats.overview.this_month}                 color="text-purple-400" icon={Calendar} />
          <StatCard label="Conversion" value={`${stats.overview.conversion_rate}%`}      color="text-cyan-400" icon={TrendingUp} sub="converted / total" />
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={filters.search}
              onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 outline-none text-sm transition-all"
            />
          </div>
          <select
            value={filters.message_type}
            onChange={(e) => { setFilters(f => ({ ...f, message_type: e.target.value })); setPage(1); }}
            className="w-full sm:w-48 px-4 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-sm outline-none sm:flex-shrink-0 transition-all"
          >
            <option value="">All Types</option>
            <option value="predefined">Predefined</option>
            <option value="custom">Custom</option>
          </select>
          {(filters.status || filters.message_type || filters.search) && (
            <button
               onClick={() => { setFilters({ status: '', message_type: '', search: '' }); setPage(1); }}
               className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/30 transition-colors sm:flex-shrink-0"
             >
               <X className="w-3 h-3" /> Clear
             </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 bg-white/5 rounded-xl p-1 w-full sm:w-fit scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => { setFilters(f => ({ ...f, status: t.value })); setPage(1); }}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                filters.status === t.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filters.status === t.value ? 'bg-white/20' : 'bg-white/10'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CARD LIST (replaces the table — works on all screen sizes) ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-20 text-center">
          <WaIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No WhatsApp leads found</p>
          <p className="text-slate-600 text-sm mt-1">Leads appear when visitors click the WhatsApp button</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-5 hover:bg-white/15 hover:border-white/30 transition-all flex flex-col relative"
            >
              {/* Top row: avatar + name + contact + date */}
              <div className="flex sm:flex-row flex-col gap-2 sm:gap-3 mb-2 sm:mb-3 overflow-hidden">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                  <WaIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate" title={msg.name || 'Anonymous'}>{msg.name || 'Anonymous'}</p>
                  {msg.phone ? (
                    <a
                      href={waUrl(msg.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-green-400 hover:text-green-300 transition-colors truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{msg.phone}</span>
                    </a>
                  ) : (
                    <p className="text-[11px] text-slate-500 truncate">{msg.email ?? 'No contact'}</p>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">{fmtDate(msg.created_at)}</p>
              </div>

              {/* Message preview */}
              <div className="bg-green-500/5 rounded-lg border border-green-500/10 p-3 mb-4 flex-1">
                <p className="text-xs sm:text-xs text-slate-300 line-clamp-3 break-words leading-relaxed">{msg.message}</p>
              </div>

              {/* Badges + page origin */}
              <div className="flex flex-wrap items-center gap-1.5 mt-auto mb-3">
                <StatusBadge status={msg.status} />
                <TypeBadge type={msg.message_type} />
              </div>
              {msg.page_url && (
                <p className="text-[10px] text-slate-500 font-mono truncate mb-2" title={tryPathname(msg.page_url)}>
                  {tryPathname(msg.page_url)}
                </p>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 mt-auto">
                <button
                  onClick={() => setSelected(msg)}
                  className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all"
                >
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden sm:block" /> View
                </button>
                {msg.phone && (
                  <button
                    onClick={() => window.open(waUrl(msg.phone), '_blank')}
                    className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                  >
                    <WaIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden sm:block" /> Chat
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all col-span-2 sm:col-span-1"
                    title="Delete"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <p className="text-xs sm:text-sm text-slate-400">
            Showing {((pagination.current_page - 1) * 15) + 1}–{Math.min(pagination.current_page * 15, pagination.total)} of {pagination.total}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
            <button
              onClick={() => setPage(Math.max(1, pagination.current_page - 1))}
              disabled={pagination.current_page === 1}
              className="px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-all font-medium border border-transparent hover:border-white/10"
            >Prev</button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const p = pagination.current_page <= 3
                ? i + 1
                : pagination.current_page >= pagination.last_page - 2
                  ? pagination.last_page - 4 + i
                  : pagination.current_page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[28px] sm:min-w-[32px] h-8 px-1 sm:px-2 rounded text-xs sm:text-sm font-medium transition-all ${
                    p === pagination.current_page
                      ? 'bg-green-500/30 text-green-300 border border-green-500/40'
                      : 'text-slate-400 hover:bg-white/10 border border-transparent hover:border-white/10'
                  }`}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(pagination.last_page, pagination.current_page + 1))}
              disabled={pagination.current_page === pagination.last_page}
              className="px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-all font-medium border border-transparent hover:border-white/10"
            >Next</button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          msg={selected}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onUpdate={() => { load(); loadStats(); }}
        />
      )}
    </DashboardLayout>
  );
};

export default WhatsAppMessages;