import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wifi, Users, Package, Search, RefreshCw, Loader2, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, PlusCircle, Unlink, Globe,
  DollarSign, UserCheck, Building2, Phone, Mail, Hash,
  CalendarDays, ShieldCheck, Eye, X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import {
  safetikaDropdownsApi,
  SafetikaDropdowns,
  DropdownOption,
} from "@/services/safetikaDropdowns";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MbrCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_mobile?: string;
  city?: string;
  customer_id?: string;
  address_id?: string;
  service_account_id?: string;
  service_status?: string;
  created_at?: string;
}

interface ProvisionedClient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  customer_type?: string;
  vilcom_safetika_customer_id: string;
  vilcom_safetika_service_acc_id?: string;
  vilcom_safetika_provisioned_at?: string;
}

interface InventoryAssignment {
  id: number;
  customer?: { first_name: string; last_name: string };
  inv_item_id: string;
  serial_number?: string;
  status?: string;
  assigned_at?: string;
}

// ── Shared Helpers ─────────────────────────────────────────────────────────────
const glass = "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl";

function SelectField({
  label, value, options, loading = false, placeholder, onChange, required,
}: {
  label: string; value: string; options: DropdownOption[]; loading?: boolean;
  placeholder?: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || options.length === 0}
          className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="bg-slate-900 text-slate-300">
            {loading ? "Loading…" : placeholder ?? `Select ${label}`}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.name} className="bg-slate-900 text-white">{o.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, Icon, color,
}: {
  label: string; value: number | string; Icon: React.ElementType; color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", gradient: "from-emerald-500/10" },
    green:   { bg: "bg-green-500/10",   text: "text-green-400",   gradient: "from-green-500/10"   },
    amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   gradient: "from-amber-500/10"   },
    red:     { bg: "bg-red-500/10",     text: "text-red-400",     gradient: "from-red-500/10"     },
    cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    gradient: "from-cyan-500/10"    },
    blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    gradient: "from-blue-500/10"    },
  };
  const c = colorMap[color] ?? colorMap.cyan;

  return (
    <div className={`${glass} p-3 sm:p-4 relative overflow-hidden group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex justify-between items-start relative">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-400 mb-0.5 sm:mb-1 truncate">{label}</p>
          <h3 className="text-xl sm:text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-2 sm:p-3 ${c.bg} rounded-xl ${c.text} shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — MBR Customers
// ══════════════════════════════════════════════════════════════════════════════
function MbrCustomersTab({ onAddService }: { onAddService?: (email: string) => void }) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<MbrCustomer[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails]       = useState<any>(null);
  const [detailsLoading, setDetailsLoading]         = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.email  = search;
      if (status) params.status = status;
      const res  = await api.get("/admin/vilcom-safetika/mbr-customers", { params });
      const raw  = res.data;
      const list = raw?.data?.data ?? raw?.data ?? [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message ?? "Failed to load MBR customers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const fetchCustomerDetails = async (id: string | number) => {
    setSelectedCustomerId(String(id));
    setDetailsLoading(true);
    setCustomerDetails(null);
    try {
      const res = await api.get(`/admin/vilcom-safetika/mbr-customers/${id}`);
      setCustomerDetails(res.data?.data ?? res.data);
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message ?? "Failed to load customer details", variant: "destructive" });
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null);
  };

  const statusBadge = (s?: string) => {
    if (!s) return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    if (s.includes("active") || s.includes("mbr")) return "bg-green-500/20 text-green-300 border-green-500/30";
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
          {(["", "success", "pending", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                status === s
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 outline-none text-sm"
          />
        </div>

        <button
          onClick={fetchCustomers}
          className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:text-white transition-colors self-end sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className={`${glass} p-8 sm:p-12 text-center`}>
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1 text-sm sm:text-base">No MBR customers found</p>
          <p className="text-slate-400 text-xs sm:text-sm">Customers will appear here once available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {customers.map((c, i) => (
            <div key={c.id ?? i} className={`${glass} p-4 sm:p-5 hover:border-cyan-500/30 transition-all group`}>
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate group-hover:text-cyan-300 transition-colors text-sm sm:text-base">
                    {[c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown Name"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{c.email || "No Email"}</p>
                  <p className="text-slate-500 text-xs truncate">{c.phone_mobile ?? "No Phone"}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs border ${statusBadge(c.service_status)}`}>
                  {c.service_status ?? "unknown"}
                </span>
              </div>

              <div className="mb-3">
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-cyan-300 font-medium text-xs sm:text-sm flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {c.customer_id ?? "No ID"}
                  </p>
                  <p className="text-slate-400 text-xs">{c.city ?? "No City"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  <Building2 className="w-3 h-3" />
                  <span className="capitalize truncate">{c.city ?? "—"}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  <CalendarDays className="w-3 h-3" />
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => fetchCustomerDetails(c.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all text-xs sm:text-sm font-medium"
                >
                  <Eye className="w-4 h-4" /> View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className={`${glass} w-full max-w-2xl my-4 sm:my-8 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]`}>
            {/* Sticky Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span className="truncate">Customer Details</span>
              </h2>
              <button onClick={closeModal} className="text-white/60 hover:text-white transition-colors shrink-0 p-1">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-slate-400 text-sm">Fetching detailed client profile…</p>
                </div>
              ) : customerDetails ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Customer Identifier</p>
                      <p className="text-cyan-300 font-mono text-base sm:text-lg break-all">{customerDetails.customer_id ?? "—"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">System Record ID</p>
                      <p className="text-slate-300 font-mono text-sm break-all">{customerDetails.id ?? "—"}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-4 sm:px-5 py-3 border-b border-white/10 bg-white/5">
                      <h4 className="text-sm font-semibold text-white">Full Record Details</h4>
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-6">
                      {Object.entries(customerDetails).map(([key, value]) => {
                        if (typeof value === "object" && value !== null) return null;
                        const readableKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                        return (
                          <div key={key}>
                            <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5">{readableKey}</p>
                            <p className="text-white text-xs sm:text-sm break-all">
                              {value === null || value === "" ? (
                                <span className="text-slate-600">—</span>
                              ) : String(value)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <details className="group border border-white/10 rounded-xl bg-white/5">
                    <summary className="px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-white transition">
                      View Raw API Payload
                    </summary>
                    <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950 rounded-b-xl overflow-x-auto">
                      <pre className="text-[10px] sm:text-xs text-slate-400 font-mono whitespace-pre-wrap break-words">
                        {JSON.stringify(customerDetails, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="py-12 text-center text-red-400 text-sm">Failed to load customer details.</div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/50 sticky bottom-0 z-10 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (onAddService && customerDetails?.email) {
                    onAddService(customerDetails.email);
                    closeModal();
                  }
                }}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors text-sm"
              >
                Add Service
              </button>
              <button
                onClick={closeModal}
                className="w-full sm:w-auto px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — Add Service
// ══════════════════════════════════════════════════════════════════════════════
function AddServiceTab({ initialSearch }: { initialSearch?: string }) {
  const { toast } = useToast();

  const [clientSearch, setClientSearch]     = useState(initialSearch || "");
  const [clients, setClients]               = useState<ProvisionedClient[]>([]);

  useEffect(() => {
    if (initialSearch) {
      setClientSearch(initialSearch);
      setClientsLoading(true);
      api.get("/admin/vilcom-safetika/provisioned-clients", { params: { search: initialSearch } })
        .then((res) => {
          const matches = res.data?.data ?? [];
          setClients(matches);
          if (matches.length === 1) {
            setSelectedClient(matches[0]);
          }
        })
        .finally(() => setClientsLoading(false));
    }
  }, [initialSearch]);
  const [selectedClient, setSelectedClient] = useState<ProvisionedClient | null>(null);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [dropdowns, setDropdowns]           = useState<SafetikaDropdowns>({ salesPersons: [], serviceCategories: [], accountTypes: [], customerTypes: [] });
  const [filteredAccountTypes, setFilteredAccountTypes] = useState<DropdownOption[]>([]);
  const [dropdownsLoading, setDropdownsLoading] = useState({
    salesPersons: false,
    serviceCategories: false,
    accountTypes: false,
    customerTypes: false,
  });
  const [acctTypesLoading, setAcctTypesLoading] = useState(false);

  const [serviceCategory, setServiceCategory] = useState("");
  const [accountType, setAccountType]         = useState("");
  const [salesPerson, setSalesPerson]         = useState("");
  const [setupcharge, setSetupcharge]         = useState("0");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState<any>(null);

  useEffect(() => {
    setDropdownsLoading({
      salesPersons: true,
      serviceCategories: true,
      accountTypes: true,
      customerTypes: true,
    });

    safetikaDropdownsApi.fetchAll()
      .then((d) => { 
        setDropdowns(d); 
        setFilteredAccountTypes(d.accountTypes); 
      })
      .finally(() => setDropdownsLoading({
        salesPersons: false,
        serviceCategories: false,
        accountTypes: false,
        customerTypes: false,
      }));
  }, [toast]);

  useEffect(() => {
    if (!serviceCategory) { setFilteredAccountTypes(dropdowns.accountTypes); setAccountType(""); return; }
    let cancelled = false;
    setAcctTypesLoading(true);
    setAccountType("");
    safetikaDropdownsApi.getAccountTypesByCategory(serviceCategory).then((d) => {
      if (!cancelled) setFilteredAccountTypes(d);
    }).finally(() => { if (!cancelled) setAcctTypesLoading(false); });
    return () => { cancelled = true; };
  }, [serviceCategory, dropdowns.accountTypes]);

  const searchClients = useCallback(async () => {
    if (!clientSearch.trim()) return;
    setClientsLoading(true);
    try {
      const res = await api.get("/admin/vilcom-safetika/provisioned-clients", { params: { search: clientSearch } });
      setClients(res.data?.data ?? []);
    } finally {
      setClientsLoading(false);
    }
  }, [clientSearch]);

  const handleSubmit = async () => {
    if (!selectedClient)   return toast({ title: "Error", description: "Select a client", variant: "destructive" });
    if (!serviceCategory)  return toast({ title: "Error", description: "Select a service category", variant: "destructive" });
    if (!accountType)      return toast({ title: "Error", description: "Select an account type", variant: "destructive" });

    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post("/admin/vilcom-safetika/add-service", {
        user_id: selectedClient.id,
        AccountType: accountType,
        ServiceCategory: serviceCategory,
        SalesPerson: salesPerson || undefined,
        setupcharge,
      });
      setResult({ success: true, data: res.data });
      toast({ title: "Service Added", description: `Service added successfully for ${selectedClient.name}` });
    } catch (e: any) {
      const msg = e.response?.data?.message ?? "Failed to add service";
      setResult({ success: false, message: msg });
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
      {/* Left — client search */}
      <div className="lg:col-span-2 space-y-4">
        <div className={`${glass} p-4 sm:p-5 space-y-4`}>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Select Client
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search name or email…"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchClients()}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 outline-none text-sm"
              />
            </div>
            <button
              onClick={searchClients}
              disabled={clientsLoading}
              className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm transition disabled:opacity-60 shrink-0"
            >
              {clientsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>

          <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                  selectedClient?.id === c.id
                    ? "bg-cyan-500/20 border-cyan-500/50 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-slate-400 truncate">{c.email}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-cyan-400 font-mono truncate">ID: {c.vilcom_safetika_customer_id}</span>
                  <span className="text-xs text-slate-500 capitalize">{c.customer_type}</span>
                </div>
              </button>
            ))}
            {clients.length === 0 && clientSearch && !clientsLoading && (
              <p className="text-slate-500 text-xs text-center py-4">No provisioned clients found</p>
            )}
          </div>
        </div>

        {selectedClient && (
          <div className={`${glass} p-3 sm:p-4 border-cyan-500/30 bg-cyan-500/5`}>
            <p className="text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wider">Selected Client</p>
            <p className="text-white font-semibold text-sm sm:text-base truncate">{selectedClient.name}</p>
            <p className="text-slate-400 text-xs truncate">{selectedClient.email}</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-slate-400">Safetika ID: <span className="text-cyan-300 font-mono break-all">{selectedClient.vilcom_safetika_customer_id}</span></p>
              {selectedClient.vilcom_safetika_service_acc_id && (
                <p className="text-xs text-slate-400">Existing Svc Acc: <span className="text-amber-300 font-mono break-all">{selectedClient.vilcom_safetika_service_acc_id}</span></p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right — service form */}
      <div className="lg:col-span-3 space-y-4">
        <div className={`${glass} p-4 sm:p-5 space-y-4 sm:space-y-5`}>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            Service Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <SelectField
              label="Service Category"
              value={serviceCategory}
              options={dropdowns.serviceCategories}
              loading={dropdownsLoading.serviceCategories}
              onChange={setServiceCategory}
              required
            />
            <SelectField
              label="Account Type"
              value={accountType}
              options={filteredAccountTypes}
              loading={dropdownsLoading.accountTypes || acctTypesLoading}
              placeholder={serviceCategory ? "Select account type" : "Select service category first"}
              onChange={setAccountType}
              required
            />
            <SelectField
              label="Sales Person"
              value={salesPerson}
              options={dropdowns.salesPersons}
              loading={dropdownsLoading.salesPersons}
              placeholder="— Select sales person —"
              onChange={setSalesPerson}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Domain
              </label>
              <div className="flex items-center px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm">
                <span className="text-slate-400 mr-2">🔒</span>
                Vilcom
                <span className="ml-auto text-xs text-slate-500">Fixed</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Setup Charge (KES)
              </label>
              <input
                type="number"
                min="0"
                value={setupcharge}
                onChange={(e) => setSetupcharge(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          {!selectedClient && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Select a provisioned client from the {window.innerWidth < 1024 ? "above" : "left"} panel first.</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedClient || !serviceCategory || !accountType}
            className="w-full py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-900/40 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Add Service
          </button>

          {result && (
            <div className={`p-3 sm:p-4 rounded-xl border text-sm ${result.success ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
              {result.success ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Service added successfully!</p>
                    {result.data?.data?.account_id && (
                      <p className="text-xs mt-1">Account ID: <span className="font-mono break-all">{result.data.data.account_id || result.data.data.service_account_id}</span></p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 3 — Inventory Assignments
// ══════════════════════════════════════════════════════════════════════════════
function InventoryTab() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<InventoryAssignment[]>([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [fromDate, setFromDate]       = useState("");
  const [toDate, setToDate]           = useState("");
  const [unassigning, setUnassigning] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search)   params.search    = search;
      if (status)   params.status    = status;
      if (fromDate) params.from_date = fromDate;
      if (toDate)   params.to_date   = toDate;
      const res  = await api.get("/admin/vilcom-safetika/inventory-assignments", { params });
      const list = res.data?.data ?? res.data ?? [];
      setAssignments(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message ?? "Failed to load inventory", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, status, fromDate, toDate, toast]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleUnassign = async (invItemId: string) => {
    if (!confirm(`Unassign inventory item ${invItemId}? It will be returned to stock.`)) return;
    setUnassigning(invItemId);
    try {
      await api.post("/admin/vilcom-safetika/unassign-inventory", { inv_item_id: invItemId });
      toast({ title: "Unassigned", description: `Item ${invItemId} returned to stock` });
      fetchAssignments();
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message ?? "Failed to unassign", variant: "destructive" });
    } finally {
      setUnassigning(null);
    }
  };

  const statusBadge = (s?: string) => {
    if (s === "assigned") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (s === "returned") return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center">
        <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
          {(["", "assigned", "returned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                status === s
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search serial / item ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 outline-none text-sm"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="flex-1 sm:flex-none sm:w-[130px] px-2 sm:px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-300 text-xs sm:text-sm focus:border-cyan-400 outline-none"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="flex-1 sm:flex-none sm:w-[130px] px-2 sm:px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-300 text-xs sm:text-sm focus:border-cyan-400 outline-none"
          />
          <button
            onClick={fetchAssignments}
            className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className={`${glass} p-8 sm:p-12 text-center`}>
          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1 text-sm sm:text-base">No inventory assignments found</p>
          <p className="text-slate-400 text-xs sm:text-sm">Assignments will appear here once available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {assignments.map((a) => (
            <div key={a.id} className={`${glass} p-4 sm:p-5 hover:border-cyan-500/30 transition-all group`}>
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold flex items-center gap-2 group-hover:text-cyan-300 transition-colors text-sm sm:text-base">
                    <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">Item #{a.inv_item_id}</span>
                  </h3>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs border ${statusBadge(a.status)}`}>
                  {a.status ?? "unknown"}
                </span>
              </div>

              <div className="mb-3">
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-white font-medium text-xs sm:text-sm">
                    {a.customer ? `${a.customer.first_name} ${a.customer.last_name}` : "—"}
                  </p>
                  <p className="text-slate-400 text-xs font-mono truncate">{a.serial_number ?? "No Serial"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  <Hash className="w-3 h-3" /> ID: {a.id}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  <CalendarDays className="w-3 h-3" />
                  {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString() : "—"}
                </span>
              </div>

              {a.status === "assigned" && (
                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleUnassign(a.inv_item_id)}
                    disabled={unassigning === a.inv_item_id}
                    className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all text-xs sm:text-sm font-medium disabled:opacity-60"
                  >
                    {unassigning === a.inv_item_id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Unlink className="w-4 h-4" />}
                    Unassign from Customer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════
type Tab = "customers" | "add-service" | "inventory";

export default function SafetikaPortal() {
  const { hasRole, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("customers");
  const [initialSearch, setInitialSearch] = useState("");

  const handleAddService = (email: string) => {
    setInitialSearch(email);
    setTab("add-service");
  };

  const [stats, setStats] = useState({ safetika_provisioned: 0, safetika_pending: 0, not_provisioned_at_all: 0 });

  useEffect(() => {
    if (!isAdmin && !isStaff) navigate("/");
    api.get("/admin/vilcom-safetika/statistics")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [isAdmin, isStaff, navigate]);

  const tabs: { key: Tab; label: string; shortLabel: string; Icon: React.ElementType }[] = [
    { key: "customers",   label: "MBR Customers",        shortLabel: "Customers",  Icon: Users      },
    { key: "add-service", label: "Add Service",           shortLabel: "Service",    Icon: PlusCircle },
    { key: "inventory",   label: "Inventory Assignments", shortLabel: "Inventory",  Icon: Package    },
  ];

  return (
    <DashboardLayout userType={hasRole("admin") ? "admin" : "staff"}>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />
          Safetika ISP Portal
        </h1>
        <p className="text-slate-400 mt-1 text-xs sm:text-sm">
          Manage MBR customers, services, and inventory via the Safetika API
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Fully Provisioned" value={stats.safetika_provisioned}   Icon={CheckCircle}   color="green" />
        <StatCard label="Pending Safetika"  value={stats.safetika_pending}        Icon={AlertTriangle} color="amber" />
        <StatCard label="Not Provisioned"   value={stats.not_provisioned_at_all}  Icon={XCircle}       color="red" />
      </div>

      {/* Tab bar */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-4 sm:mb-6 overflow-x-auto gap-1 scrollbar-hide">
        {tabs.map(({ key, label, shortLabel, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              tab === key
                ? "bg-cyan-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "customers"   && <MbrCustomersTab onAddService={handleAddService} />}
      {tab === "add-service" && <AddServiceTab initialSearch={initialSearch} />}
      {tab === "inventory"   && <InventoryTab />}
    </DashboardLayout>
  );
}
