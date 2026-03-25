import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCoverageApi } from "@/services/coverage";
import {
  Loader2, Plus, Pencil, Trash2, MapPin, Package, Users,
  BarChart3, Search, X, CheckCircle, Clock, AlertCircle,
  RefreshCw, Eye, MoreHorizontal, Wifi, TrendingUp, Activity, Globe,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
type ZoneStatus = "active" | "inactive" | "planned";

interface CoverageZone {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: ZoneStatus;
  is_serviceable: boolean;
  center_lat?: number;
  center_lng?: number;
  radius_km?: number;
}

interface InterestSignup {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address: string;
  area_description?: string;
  status: string;
  created_at: string;
}

interface Analytics {
  total_checks: number;
  covered_checks: number;
  uncovered_checks: number;
  interest_signups: number;
  pending_signups: number;
  zones_summary: {
    total: number;
    active: number;
    coming_soon: number;
    inactive: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractArray = (res: any): any[] => {
  if (Array.isArray(res))             return res;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const extractAnalytics = (res: any): Analytics | null => {
  const d = res?.data ?? res;
  if (!d || typeof d !== "object") return null;
  return d as Analytics;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: React.ReactNode;
  icon: React.ElementType; accent: string;
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 sm:p-5 flex flex-col gap-2 hover:bg-white/[0.05] transition-colors">
    <div className="flex items-start justify-between gap-1">
      <p className="text-[11px] sm:text-sm font-medium text-slate-400 leading-tight">{label}</p>
      <div className="p-1.5 rounded-xl flex-shrink-0" style={{ background: `${accent}18` }}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: accent }} />
      </div>
    </div>
    <div>
      <p className="text-lg sm:text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <div className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-tight">{sub}</div>}
    </div>
    <div
      className="absolute bottom-0 left-0 h-0.5 w-1/3 rounded-full"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
    />
  </div>
);

// ─── Badges ───────────────────────────────────────────────────────────────────
const ZoneStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active:   { label: "Active",   color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
    planned:  { label: "Planned",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
    inactive: { label: "Inactive", color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: AlertCircle },
  };
  const cfg = map[status] ?? map.inactive;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const SignupStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string }> = {
    pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    contacted:  { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    covered:    { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    not_viable: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };
  const cfg = map[status] ?? { color: "#6b7280", bg: "rgba(107,114,128,0.12)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize shrink-0"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

// ─── Add Zone Dialog ──────────────────────────────────────────────────────────
const AddZoneDialog = ({
  open, onClose, onSave,
}: {
  open: boolean; onClose: () => void; onSave: (data: any) => Promise<void>;
}) => {
  const [form, setForm] = useState({
    name: "", type: "zone", status: "active", is_serviceable: false,
    center_lat: "", center_lng: "", radius_km: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-lg mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-lg">Add Coverage Zone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-slate-400 text-sm mb-1.5 block">Zone Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Westlands"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0f1629] border-white/10 text-white">
                  {["area", "zone", "region", "county", "sub-county"].map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0f1629] border-white/10 text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { field: "center_lat", label: "Latitude",    placeholder: "-1.2921" },
              { field: "center_lng", label: "Longitude",   placeholder: "36.8219" },
              { field: "radius_km",  label: "Radius (km)", placeholder: "2.0" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <Label className="text-slate-400 text-xs mb-1.5 block">{label}</Label>
                <Input
                  value={(form as any)[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 text-sm"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_serviceable}
              onChange={e => setForm(f => ({ ...f, is_serviceable: e.target.checked }))}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-sm text-slate-300">Mark as serviceable</span>
          </label>
        </div>
        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Zone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Zone Card ────────────────────────────────────────────────────────────────
const ZoneCard = ({
  zone, onViewPackages, onDelete,
}: {
  zone: CoverageZone;
  onViewPackages: (id: number) => void;
  onDelete: (id: number) => void;
}) => (
  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3 transition-colors">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
          zone.status === "active"
            ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
            : zone.status === "planned"
            ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]"
            : "bg-slate-600"
        }`} />
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{zone.name}</p>
          <p className="text-slate-500 text-xs font-mono truncate mt-0.5">{zone.slug}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" size="icon"
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 flex-shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
          <DropdownMenuItem
            className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/[0.08] focus:text-white"
            onClick={() => onViewPackages(zone.id)}
          >
            <Eye className="w-3.5 h-3.5" /> View Packages
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/[0.08] focus:text-white">
            <Pencil className="w-3.5 h-3.5" /> Edit Zone
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
            onClick={() => onDelete(zone.id)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex items-center flex-wrap gap-2">
      <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-300 text-xs capitalize">
        {zone.type}
      </span>
      <ZoneStatusBadge status={zone.status} />
      <span className={`ml-auto flex items-center gap-1 text-xs font-semibold ${zone.is_serviceable ? "text-emerald-400" : "text-slate-500"}`}>
        {zone.is_serviceable
          ? <><CheckCircle className="w-3 h-3" /> Serviceable</>
          : <><X className="w-3 h-3" /> Not Serviceable</>
        }
      </span>
    </div>
  </div>
);

// ─── Signup Card ──────────────────────────────────────────────────────────────
const SignupCard = ({
  signup, onUpdateStatus,
}: {
  signup: InterestSignup;
  onUpdateStatus: (id: number, status: string) => void;
}) => (
  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3 transition-colors">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-sm truncate">{signup.name}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {new Date(signup.created_at).toLocaleDateString("en-KE", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <SignupStatusBadge status={signup.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-40">
            {["pending", "contacted", "covered", "not_viable"].map(s => (
              <DropdownMenuItem
                key={s}
                className="capitalize text-slate-300 hover:text-white cursor-pointer focus:bg-white/[0.08] focus:text-white text-xs"
                onClick={() => onUpdateStatus(signup.id, s)}
              >
                {s.replace(/_/g, " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div className="space-y-1 text-xs">
      <p className="text-slate-300 truncate">{signup.email}</p>
      {signup.phone && <p className="text-slate-400">{signup.phone}</p>}
      <div className="flex items-start gap-1.5 text-slate-500 pt-0.5">
        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <p className="line-clamp-2">{signup.address}</p>
      </div>
    </div>
  </div>
);

// ─── Package Card ─────────────────────────────────────────────────────────────
const PackageCard = ({ pkg }: { pkg: any }) => (
  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-sm">{pkg.package_name}</p>
        {pkg.description && (
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{pkg.description}</p>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-slate-600 hover:text-slate-300">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-slate-600 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-slate-400 text-xs">
        {pkg.formatted_speed ?? `${pkg.speed_mbps_down ?? "—"}/${pkg.speed_mbps_up ?? "—"} Mbps`}
      </span>
      <span className="text-emerald-400 font-semibold text-sm">
        {pkg.formatted_price ?? `${pkg.currency ?? "KES"} ${pkg.monthly_price}/mo`}
      </span>
      <span className={`text-xs font-semibold ${pkg.is_available ? "text-emerald-400" : "text-slate-600"}`}>
        {pkg.is_available ? "Available" : "Unavailable"}
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CoverageManagement = () => {
  const { hasRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole("admin") && !hasRole("staff")) return <Navigate to="/client/dashboard" replace />;

  const [activeTab, setActiveTab]           = useState<"zones" | "packages" | "signups" | "logs">("zones");
  const [zones, setZones]                   = useState<CoverageZone[]>([]);
  const [signups, setSignups]               = useState<InterestSignup[]>([]);
  const [analytics, setAnalytics]           = useState<Analytics | null>(null);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [signupSearch, setSignupSearch]     = useState("");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [showAddZone, setShowAddZone]       = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [zonePackages, setZonePackages]     = useState<any[]>([]);
  const [loadingPkgs, setLoadingPkgs]       = useState(false);
  const [pagination, setPagination]         = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchZones = async () => {
    try {
      const params: Record<string, any> = { page: pagination.current_page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminCoverageApi.getZones(params);
      setZones(res?.data || []);
      const meta = res?.meta || {};
      setPagination({
        current_page: meta.current_page || res?.current_page || 1,
        last_page:    meta.last_page    || res?.last_page    || 1,
        total:        meta.total        || res?.total        || 0,
      });
    } catch (e) {
      console.error("Zones fetch error:", e);
      setZones([]);
    }
  };

  const fetchData = async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const [signupsRes, analyticsRes] = await Promise.allSettled([
        adminCoverageApi.getInterestSignups(),
        adminCoverageApi.getAnalytics(),
      ]);
      if (signupsRes.status === "fulfilled")   setSignups(extractArray(signupsRes.value));
      if (analyticsRes.status === "fulfilled") setAnalytics(extractAnalytics(analyticsRes.value));
      await fetchZones();
    } catch (e) {
      console.error("Coverage fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPackages = async (zoneId: number) => {
    setLoadingPkgs(true);
    try {
      const res = await adminCoverageApi.getZonePackages(zoneId);
      setZonePackages(extractArray(res));
    } catch { setZonePackages([]); }
    finally { setLoadingPkgs(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchZones(); }, [search, statusFilter, pagination.current_page]);
  useEffect(() => {
    if (selectedZoneId) fetchPackages(selectedZoneId);
    else setZonePackages([]);
  }, [selectedZoneId]);

  const handleCreateZone = async (data: any) => {
    await adminCoverageApi.createZone({
      ...data,
      slug:       data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      center_lat: data.center_lat ? parseFloat(data.center_lat) : undefined,
      center_lng: data.center_lng ? parseFloat(data.center_lng) : undefined,
      radius_km:  data.radius_km  ? parseFloat(data.radius_km)  : undefined,
    });
    setPagination(p => ({ ...p, current_page: 1 }));
    await fetchZones();
  };

  const handleDeleteZone = async (id: number) => {
    if (!confirm("Delete this coverage zone? This cannot be undone.")) return;
    await adminCoverageApi.deleteZone(id);
    if (selectedZoneId === id) setSelectedZoneId(null);
    await fetchData(true);
  };

  const handleUpdateSignupStatus = async (id: number, status: string) => {
    await adminCoverageApi.updateSignupStatus(id, { status });
    await fetchData(true);
  };

  const filteredSignups = signups.filter(s => {
    const q = signupSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  const serviceableZones = zones.filter(z => z.status === "active" && z.is_serviceable);

  const tabs = [
    { id: "zones",    label: "Zones",    icon: MapPin,   count: pagination.total },
    { id: "packages", label: "Packages", icon: Package,  count: null },
    { id: "signups",  label: "Signups",  icon: Users,    count: analytics?.pending_signups ?? 0 },
    { id: "logs",     label: "Logs",     icon: Activity, count: null },
  ] as const;

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
            <p className="text-slate-500 text-sm">Loading coverage data…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase hidden sm:inline">
                Network Operations
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Coverage</h1>
            <p className="text-slate-400 mt-0.5 text-xs sm:text-sm hidden sm:block">
              Manage service zones, packages, and expansion leads
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost" size="icon"
              onClick={() => fetchData(true)}
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setShowAddZone(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-3 sm:px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-500/30 flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Zone</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            label="Total Zones"
            value={analytics?.zones_summary.total ?? pagination.total}
            icon={MapPin} accent="#3b82f6"
            sub={analytics && (
              <span className="flex gap-2 flex-wrap">
                <span style={{ color: "#10b981" }}>{analytics.zones_summary.active} active</span>
                <span style={{ color: "#f59e0b" }}>{analytics.zones_summary.coming_soon} planned</span>
              </span>
            )}
          />
          <StatCard
            label="Coverage Checks"
            value={(analytics?.total_checks ?? 0).toLocaleString()}
            icon={BarChart3} accent="#8b5cf6"
            sub={analytics && (
              <span style={{ color: "#10b981" }}>{analytics.covered_checks} covered</span>
            )}
          />
          <StatCard
            label="Signups"
            value={analytics?.interest_signups ?? signups.length}
            icon={Users} accent="#10b981"
            sub={analytics?.pending_signups
              ? <span style={{ color: "#f59e0b" }}>{analytics.pending_signups} pending</span>
              : <span style={{ color: "#10b981" }}>All up to date</span>
            }
          />
          <StatCard
            label="Hit Rate"
            value={analytics && analytics.total_checks > 0
              ? `${Math.round((analytics.covered_checks / analytics.total_checks) * 100)}%`
              : "—"
            }
            icon={TrendingUp} accent="#f59e0b"
            sub={<span>In coverage</span>}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center border-b border-white/[0.07] overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  active
                    ? "text-blue-400 border-blue-400 bg-blue-400/5"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? "bg-blue-500/20 text-blue-300" : "bg-white/10 text-slate-400"
                  }`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══ ZONES ══ */}
        {activeTab === "zones" && (
          <div className="space-y-3">

            {/* Search + filter bar — stacked on mobile */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search zones…"
                  className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
                {[
                  { v: "all",      l: "All" },
                  { v: "active",   l: "Active" },
                  { v: "planned",  l: "Planned" },
                  { v: "inactive", l: "Inactive" },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => { setStatusFilter(v); setPagination(p => ({ ...p, current_page: 1 })); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      statusFilter === v
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Record count */}
            {pagination.total > 0 && (
              <p className="text-xs text-slate-600">
                {((pagination.current_page - 1) * 15) + 1}–{Math.min(pagination.current_page * 15, pagination.total)} of {pagination.total} zones
              </p>
            )}

            {/* Always cards below xl, table at xl+ */}
            <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
              {zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <MapPin className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-medium">No zones found</p>
                  <p className="text-sm mt-1">
                    {search || statusFilter !== "all" ? "Try adjusting your filters" : "Add your first zone"}
                  </p>
                </div>
              ) : zones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onViewPackages={id => { setSelectedZoneId(id); setActiveTab("packages"); }}
                  onDelete={handleDeleteZone}
                />
              ))}
            </div>

            {/* Table — xl+ only, uses minmax(0,…) to prevent overflow */}
            <div className="hidden xl:block bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-4 px-5 py-3 border-b border-white/[0.07]">
                {["Zone Name", "Type", "Serviceable", "Status", ""].map((h, i) => (
                  <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{h}</div>
                ))}
              </div>
              <div className="divide-y divide-white/[0.04]">
                {zones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                    <MapPin className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-medium">No zones found</p>
                  </div>
                ) : zones.map(zone => (
                  <div
                    key={zone.id}
                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        zone.status === "active"
                          ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
                          : zone.status === "planned"
                          ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                          : "bg-slate-600"
                      }`} />
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{zone.name}</p>
                        <p className="text-slate-600 text-xs font-mono truncate">{zone.slug}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.06] w-fit">
                      {zone.type}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${zone.is_serviceable ? "text-emerald-400" : "text-slate-600"}`}>
                      {zone.is_serviceable
                        ? <><CheckCircle className="w-3.5 h-3.5" /> Yes</>
                        : <><X className="w-3.5 h-3.5" /> No</>
                      }
                    </span>
                    <ZoneStatusBadge status={zone.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
                        <DropdownMenuItem
                          className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/[0.08] focus:text-white"
                          onClick={() => { setSelectedZoneId(zone.id); setActiveTab("packages"); }}
                        >
                          <Eye className="w-3.5 h-3.5" /> View Packages
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/[0.08] focus:text-white">
                          <Pencil className="w-3.5 h-3.5" /> Edit Zone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
                          onClick={() => handleDeleteZone(zone.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setPagination(p => ({ ...p, current_page: p.current_page - 1 }))}
                    disabled={pagination.current_page === 1}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 border border-white/20 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setPagination(p => ({ ...p, current_page: p.current_page + 1 }))}
                    disabled={pagination.current_page === pagination.last_page}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 border border-white/20 rounded-lg disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PACKAGES ══ */}
        {activeTab === "packages" && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Select an active serviceable zone to manage its packages.</p>

            {serviceableZones.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] p-10 text-center">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-600" />
                <p className="font-medium text-slate-500">No active serviceable zones</p>
                <p className="text-xs mt-1 text-slate-600">Mark a zone as active + serviceable first</p>
              </div>
            ) : (
              /* flex-wrap pill selector — works on any screen width */
              <div className="flex flex-wrap gap-2">
                {serviceableZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      selectedZoneId === zone.id
                        ? "border-blue-500/50 bg-blue-500/10 text-white"
                        : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      selectedZoneId === zone.id ? "bg-blue-400" : "bg-emerald-400"
                    }`} />
                    <span className="text-xs font-semibold">{zone.name}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedZoneId && (
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-white/[0.02] gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wifi className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">
                      {zones.find(z => z.id === selectedZoneId)?.name} — Packages
                    </span>
                    {loadingPkgs && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 flex-shrink-0" />}
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold px-3 py-1.5 h-auto rounded-lg flex-shrink-0"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>

                {loadingPkgs ? (
                  <div className="p-10 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                  </div>
                ) : zonePackages.length === 0 ? (
                  <div className="p-10 text-center">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-600" />
                    <p className="font-medium text-slate-500 text-sm">No packages yet</p>
                    <p className="text-xs mt-1 text-slate-600">Add internet plans for this zone</p>
                  </div>
                ) : (
                  /* Card grid — 1 col on mobile, 2 on sm, 3 on xl */
                  <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {zonePackages.map((pkg: any) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ SIGNUPS ══ */}
        {activeTab === "signups" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                value={signupSearch}
                onChange={e => setSignupSearch(e.target.value)}
                placeholder="Search signups…"
                className="w-full sm:max-w-sm pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition"
              />
            </div>

            {/* Cards on mobile/tablet */}
            <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSignups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <Users className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-medium">No signups yet</p>
                  <p className="text-sm mt-1">Leads from uncovered areas appear here</p>
                </div>
              ) : filteredSignups.map(signup => (
                <SignupCard
                  key={signup.id}
                  signup={signup}
                  onUpdateStatus={handleUpdateSignupStatus}
                />
              ))}
            </div>

            {/* Table — xl+ only */}
            <div className="hidden xl:block rounded-2xl border border-white/[0.07] overflow-hidden">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_40px] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.07]">
                {["Name", "Contact", "Address", "Status", ""].map((h, i) => (
                  <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{h}</div>
                ))}
              </div>
              <div className="divide-y divide-white/[0.04]">
                {filteredSignups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                    <Users className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-medium">No interest signups yet</p>
                  </div>
                ) : filteredSignups.map(signup => (
                  <div
                    key={signup.id}
                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_40px] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{signup.name}</p>
                      <p className="text-slate-600 text-xs mt-0.5">
                        {new Date(signup.created_at).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-300 text-sm truncate">{signup.email}</p>
                      {signup.phone && <p className="text-slate-600 text-xs mt-0.5">{signup.phone}</p>}
                    </div>
                    <p className="text-slate-400 text-sm truncate min-w-0">{signup.address}</p>
                    <SignupStatusBadge status={signup.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-40">
                        {["pending", "contacted", "covered", "not_viable"].map(s => (
                          <DropdownMenuItem
                            key={s}
                            className="capitalize text-slate-300 hover:text-white cursor-pointer focus:bg-white/[0.08] focus:text-white text-xs"
                            onClick={() => handleUpdateSignupStatus(signup.id, s)}
                          >
                            {s.replace(/_/g, " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ LOGS ══ */}
        {activeTab === "logs" && (
          <div className="rounded-2xl border border-white/[0.07] flex flex-col items-center justify-center py-16 sm:py-20 text-slate-600">
            <Activity className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium text-slate-500">Check Logs</p>
            <p className="text-sm mt-1">Address lookup history will appear here</p>
            <Button
              variant="outline" size="sm"
              className="mt-5 border-white/10 text-slate-400 hover:text-white text-xs"
            >
              Load Logs
            </Button>
          </div>
        )}

      </div>

      <AddZoneDialog
        open={showAddZone}
        onClose={() => setShowAddZone(false)}
        onSave={handleCreateZone}
      />
    </DashboardLayout>
  );
};

export default CoverageManagement;