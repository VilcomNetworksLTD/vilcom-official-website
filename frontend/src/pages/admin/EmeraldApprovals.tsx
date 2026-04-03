import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  MapPin,
  Loader2,
  Package,
  Eye,
  RefreshCw,
  ChevronDown,
  AlertTriangle,
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
interface PendingProduct {
  id: number;
  name: string;
  price_monthly: number;
  slug: string;
}

interface Reviewer {
  id: number;
  name: string;
  email: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  company_name: string | null;
  address: string | null;
  city: string | null;
  emerald_approval_status: "none" | "pending" | "approved" | "rejected";
  emerald_pending_product_id: number | null;
  emerald_approval_notes: string | null;
  emerald_approval_reviewed_at: string | null;
  created_at: string;
  pending_product?: PendingProduct;
  emerald_approval_reviewer?: Reviewer;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const glass = "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl";

function SelectField({
  label,
  value,
  options,
  loading,
  placeholder,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  loading?: boolean;
  placeholder?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || options.length === 0}
        >
          <option value="" className="bg-slate-900 text-slate-300">
            {loading ? "Loading…" : placeholder ?? `Select ${label}`}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.name} className="bg-slate-900 text-white">
              {o.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EmeraldApprovals() {
  const { hasRole, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── List state ────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, none: 0 });
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Modal state ───────────────────────────────────────────────────────────
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectNotes, setShowRejectNotes] = useState(false);

  // ── Dropdown state ────────────────────────────────────────────────────────
  const [dropdowns, setDropdowns] = useState<SafetikaDropdowns>({
    salesPersons: [],
    serviceCategories: [],
    accountTypes: [],
    customerTypes: [],
  });
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [filteredAccountTypes, setFilteredAccountTypes] = useState<DropdownOption[]>([]);
  const [accountTypesLoading, setAccountTypesLoading] = useState(false);

  // ── Provision selections ──────────────────────────────────────────────────
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedCustomerType, setSelectedCustomerType] = useState("");

  // Auth guard
  useEffect(() => {
    if (!isAdmin && !isStaff) navigate("/");
  }, [isAdmin, isStaff, navigate]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        api.get("/admin/emerald-approvals/statistics"),
        api.get(
          `/admin/emerald-approvals?status=${filter === "all" ? "" : filter}&search=${searchTerm}`
        ),
      ]);
      setStats(statsRes.data);
      setClients(listRes.data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load Emerald approvals data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Fetch all dropdowns when modal opens ──────────────────────────────────
  const loadDropdowns = useCallback(async () => {
    setDropdownsLoading(true);
    try {
      const data = await safetikaDropdownsApi.fetchAll();
      setDropdowns(data);
      setFilteredAccountTypes(data.accountTypes); // start with all account types
    } catch {
      toast({ title: "Warning", description: "Could not load Safetika dropdowns. Using defaults.", variant: "destructive" });
    } finally {
      setDropdownsLoading(false);
    }
  }, [toast]);

  // ── Re-fetch account types when service category changes ──────────────────
  useEffect(() => {
    if (!selectedServiceCategory) {
      setFilteredAccountTypes(dropdowns.accountTypes);
      setSelectedAccountType("");
      return;
    }
    let cancelled = false;
    setAccountTypesLoading(true);
    setSelectedAccountType("");
    safetikaDropdownsApi
      .getAccountTypesByCategory(selectedServiceCategory)
      .then((data) => {
        if (!cancelled) {
          setFilteredAccountTypes(data.length ? data : dropdowns.accountTypes);
        }
      })
      .finally(() => { if (!cancelled) setAccountTypesLoading(false); });

    return () => { cancelled = true; };
  }, [selectedServiceCategory, dropdowns.accountTypes]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openModal = (client: Client) => {
    setSelectedClient(client);
    setNotes(client.emerald_approval_notes || "");
    setShowRejectNotes(false);
    setSelectedSalesPerson("");
    setSelectedServiceCategory("");
    setSelectedAccountType("");
    setSelectedCustomerType("");
    setIsModalOpen(true);
    loadDropdowns();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setNotes("");
    setShowRejectNotes(false);
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      await api.post(`/admin/emerald-approvals/${selectedClient.id}/approve`, {
        notes,
        sales_person:     selectedSalesPerson     || undefined,
        service_category: selectedServiceCategory || undefined,
        account_type:     selectedAccountType     || undefined,
        customer_type:    selectedCustomerType    || undefined,
      });
      toast({ title: "Success", description: `Emerald account provisioned for ${selectedClient.name}` });
      closeModal();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Failed to provision Emerald account",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedClient) return;
    if (!notes.trim()) {
      toast({ title: "Error", description: "Rejection notes are required", variant: "destructive" });
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/admin/emerald-approvals/${selectedClient.id}/reject`, { notes });
      toast({ title: "Rejected", description: `Request for ${selectedClient.name} rejected` });
      closeModal();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":  return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "approved": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-300 border-red-500/30";
      default:         return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout userType={hasRole("admin") ? "admin" : "staff"}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          Emerald Approvals
        </h1>
        <p className="text-slate-400 mt-1">
          Review and approve new client signups for Safetika provisioning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Approval", value: stats.pending, Icon: Clock, color: "amber" },
          { label: "Approved", value: stats.approved, Icon: CheckCircle, color: "emerald" },
          { label: "Rejected", value: stats.rejected, Icon: XCircle, color: "red" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className={`${glass} p-4 relative overflow-hidden group`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
              </div>
              <div className={`p-3 bg-${color}-500/10 rounded-xl text-${color}-400`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filter === s
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 outline-none text-sm"
          />
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className={`${glass} p-12 text-center`}>
          <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">
            No {filter !== "all" ? filter : ""} requests found
          </p>
          <p className="text-slate-400 text-sm">
            Approvals will appear here when users register for Emerald.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`${glass} p-5 hover:border-cyan-500/30 transition-all group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate group-hover:text-cyan-300 transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">{client.email}</p>
                  <p className="text-slate-500 text-xs">{client.phone || "N/A"}</p>
                </div>
                <span
                  className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs border ${getStatusBadge(client.emerald_approval_status)}`}
                >
                  {client.emerald_approval_status}
                </span>
              </div>

              <div className="mb-3">
                {client.pending_product ? (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-cyan-300 font-medium text-sm flex items-center gap-1">
                      <Package className="w-3 h-3" /> {client.pending_product.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      KES {client.pending_product.price_monthly.toLocaleString()}/mo
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-slate-500 text-xs text-center border-dashed">
                    No product selected
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                  {client.customer_type === "business" ? (
                    <Building className="w-3 h-3" />
                  ) : (
                    <UserIcon className="w-3 h-3" />
                  )}
                  <span className="capitalize">{client.customer_type}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" />
                  {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => openModal(client)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all text-sm font-medium"
                >
                  <Eye className="w-4 h-4" /> Review Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className={`${glass} w-full max-w-2xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Review Provisioning Request
              </h2>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Client + product info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                    Client Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { Icon: UserIcon, label: "Name", value: selectedClient.name },
                      { Icon: Mail, label: "Email", value: selectedClient.email },
                      { Icon: Phone, label: "Phone", value: selectedClient.phone || "N/A" },
                      {
                        Icon: Building,
                        label: "Type",
                        value:
                          selectedClient.customer_type +
                          (selectedClient.company_name
                            ? ` (${selectedClient.company_name})`
                            : ""),
                      },
                      {
                        Icon: MapPin,
                        label: "Location",
                        value:
                          [selectedClient.address, selectedClient.city]
                            .filter(Boolean)
                            .join(", ") || "N/A",
                      },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="font-medium text-white capitalize break-all">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product + status */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                    Requested Product
                  </h3>

                  {selectedClient.pending_product ? (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-cyan-400" />
                        <p className="font-semibold text-white">
                          {selectedClient.pending_product.name}
                        </p>
                      </div>
                      <p className="text-cyan-300 text-lg font-bold">
                        KES {selectedClient.pending_product.price_monthly.toLocaleString()}
                        <span className="text-sm text-slate-400 font-normal">/month</span>
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-slate-400 bg-white/5 rounded-xl border border-dashed border-white/10 text-sm">
                      No product selected during signup.
                    </div>
                  )}

                  {selectedClient.emerald_approval_status !== "pending" && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                        Approval Status
                      </h3>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <span
                          className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedClient.emerald_approval_status)}`}
                        >
                          <span className="capitalize">
                            {selectedClient.emerald_approval_status}
                          </span>
                        </span>
                        {selectedClient.emerald_approval_reviewer && (
                          <p className="text-sm text-slate-400">
                            By:{" "}
                            <span className="text-white">
                              {selectedClient.emerald_approval_reviewer.name}
                            </span>
                          </p>
                        )}
                        {selectedClient.emerald_approval_reviewed_at && (
                          <p className="text-sm text-slate-400">
                            On:{" "}
                            <span className="text-white">
                              {new Date(
                                selectedClient.emerald_approval_reviewed_at
                              ).toLocaleString()}
                            </span>
                          </p>
                        )}
                        {selectedClient.emerald_approval_notes && (
                          <div className="mt-3 text-sm text-slate-300 bg-white/5 p-3 rounded border border-white/5">
                            <span className="text-slate-500 block mb-1">Notes:</span>
                            {selectedClient.emerald_approval_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Safetika Provisioning Dropdowns ── */}
              {selectedClient.emerald_approval_status === "pending" && (
                <div className="space-y-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                      Safetika Provisioning Options
                    </h3>
                    {dropdownsLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    All fields are optional — leave blank to use the product mapping defaults.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sales Person */}
                    <SelectField
                      label="Sales Person"
                      value={selectedSalesPerson}
                      options={dropdowns.salesPersons}
                      loading={dropdownsLoading}
                      placeholder="— Use default —"
                      onChange={setSelectedSalesPerson}
                    />

                    {/* Customer Type */}
                    <SelectField
                      label="Customer Type"
                      value={selectedCustomerType}
                      options={dropdowns.customerTypes}
                      loading={dropdownsLoading}
                      placeholder="— Use default —"
                      onChange={setSelectedCustomerType}
                    />

                    {/* Service Category — triggers account type reload */}
                    <SelectField
                      label="Service Category"
                      value={selectedServiceCategory}
                      options={dropdowns.serviceCategories}
                      loading={dropdownsLoading}
                      placeholder="— Use default —"
                      onChange={setSelectedServiceCategory}
                    />

                    {/* Account Type — filtered by selected service category */}
                    <SelectField
                      label="Account Type"
                      value={selectedAccountType}
                      options={filteredAccountTypes}
                      loading={dropdownsLoading || accountTypesLoading}
                      placeholder={
                        accountTypesLoading
                          ? "Loading…"
                          : selectedServiceCategory
                          ? "Select account type"
                          : "— Use default —"
                      }
                      onChange={setSelectedAccountType}
                    />
                  </div>

                  {/* Info banner when nothing is selected */}
                  {!selectedSalesPerson &&
                    !selectedServiceCategory &&
                    !selectedAccountType &&
                    !selectedCustomerType && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                          No overrides selected — provisioning will use the product mapping
                          or system defaults (SalesPerson, AccountType, ServiceCategory,
                          CustomerType).
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Rejection notes */}
              {showRejectNotes && selectedClient.emerald_approval_status === "pending" && (
                <div className="pt-2">
                  <label className="block text-sm text-white mb-2">
                    Rejection Notes <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none text-sm"
                    rows={3}
                    placeholder="Provide a reason for rejection…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}

              {/* Internal notes for approve */}
              {!showRejectNotes && selectedClient.emerald_approval_status === "pending" && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Internal Notes (optional)
                  </label>
                  <textarea
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-sm"
                    rows={2}
                    placeholder="Add any internal notes for this approval…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-slate-900/50 sticky bottom-0 z-10 flex flex-wrap-reverse sm:flex-nowrap gap-3 items-center justify-end">
              {selectedClient.emerald_approval_status === "pending" ? (
                <>
                  <button
                    onClick={closeModal}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-5 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors order-3 sm:order-none text-sm"
                  >
                    Cancel
                  </button>

                  {!showRejectNotes ? (
                    <button
                      onClick={() => setShowRejectNotes(true)}
                      disabled={actionLoading || !selectedClient.pending_product}
                      className="w-full sm:w-auto px-5 py-2 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  ) : (
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-5 py-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Confirm Rejection"
                      )}
                    </button>
                  )}

                  {!showRejectNotes && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading || !selectedClient.pending_product}
                      className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/40 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      Approve &amp; Provision
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
