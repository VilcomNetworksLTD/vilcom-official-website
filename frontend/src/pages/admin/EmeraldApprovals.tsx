import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  MapPin,
  Loader2,
  Package
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────
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

export default function EmeraldApprovals() {
  const { user: authUser, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, none: 0 });
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectNotes, setShowRejectNotes] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!isAdmin && !isStaff) {
      navigate("/");
    }
  }, [isAdmin, isStaff, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        api.get("/admin/emerald-approvals/statistics"),
        api.get(`/admin/emerald-approvals?status=${filter === "all" ? "" : filter}&search=${searchTerm}`)
      ]);
      setStats(statsRes.data);
      setClients(listRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
      toast({
        title: "Error",
        description: "Failed to load Emerald approvals data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, searchTerm]); // Debounce search in a real app

  const openModal = (client: Client) => {
    setSelectedClient(client);
    setNotes(client.emerald_approval_notes || "");
    setShowRejectNotes(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setNotes("");
    setShowRejectNotes(false);
  };

  const handleApprove = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      await api.post(`/admin/emerald-approvals/${selectedClient.id}/approve`, { notes });
      toast({
        title: "Success",
        description: `Emerald account provisioned for ${selectedClient.name}`,
      });
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

  const handleReject = async () => {
    if (!selectedClient) return;
    if (!notes.trim()) {
      toast({ title: "Error", description: "Rejection notes are required", variant: "destructive" });
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/admin/emerald-approvals/${selectedClient.id}/reject`, { notes });
      toast({
        title: "Rejected",
        description: `Approval request for ${selectedClient.name} rejected`,
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "approved": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "rejected": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center pt-8 pb-20 px-4 sm:px-6">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                Emerald Approvals
              </h1>
              <p className="text-slate-400 mt-1">Review and approve new client signups for provisioning</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Pending Approval</p>
                <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Approved Requests</p>
                <h3 className="text-3xl font-bold text-white">{stats.approved}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Rejected</p>
                <h3 className="text-3xl font-bold text-white">{stats.rejected}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls / Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto">
            {(["pending", "approved", "rejected", "all"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filter === status
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 text-sm font-semibold text-slate-300">Client Details</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Customer Type</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Selected Product</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Date</th>
                  <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="p-4 text-end text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading requests...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No {filter !== "all" ? filter : ""} requests found.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-700/20 transition group">
                      <td className="p-4">
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="text-sm text-slate-400">{client.email}</p>
                        <p className="text-xs text-slate-500">{client.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-sm bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                          {client.customer_type === "business" ? <Building className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                          <span className="capitalize">{client.customer_type}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        {client.pending_product ? (
                          <>
                            <p className="font-medium text-cyan-300">{client.pending_product.name}</p>
                            <p className="text-sm text-slate-400">KES {client.pending_product.price_monthly.toLocaleString()}/mo</p>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500">None selected</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.emerald_approval_status)}`}>
                          <span className="capitalize">{client.emerald_approval_status}</span>
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        <button
                          onClick={() => openModal(client)}
                          className="px-4 py-2 bg-slate-700 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 border border-slate-600 rounded-lg text-sm text-white transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 rounded-t-2xl sticky top-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Review Provisioning Request
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-700 pb-2">
                    Client Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400">Name</p>
                        <p className="font-medium text-white">{selectedClient.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="font-medium text-white">{selectedClient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400">Phone</p>
                        <p className="font-medium text-white">{selectedClient.phone || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400">Type</p>
                        <p className="font-medium text-white capitalize">
                          {selectedClient.customer_type}
                          {selectedClient.company_name && ` (${selectedClient.company_name})`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400">Location</p>
                        <p className="font-medium text-white">
                          {[selectedClient.address, selectedClient.city].filter(Boolean).join(", ") || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-700 pb-2">
                    Requested Product
                  </h3>
                  
                  {selectedClient.pending_product ? (
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-cyan-400" />
                        <p className="font-semibold text-white">{selectedClient.pending_product.name}</p>
                      </div>
                      <p className="text-cyan-300 text-lg font-bold">
                        KES {selectedClient.pending_product.price_monthly.toLocaleString()}<span className="text-sm text-slate-400 font-normal">/month</span>
                      </p>
                    </div>
                  ) : (
                     <div className="p-4 text-slate-400 bg-slate-800 rounded-xl border border-dashed border-slate-600">
                       No product selected during signup.
                     </div>
                  )}

                  {selectedClient.emerald_approval_status !== 'pending' && (
                    <div className="mt-4 space-y-2">
                       <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-700 pb-2">
                        Approval Status
                      </h3>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <span className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedClient.emerald_approval_status)}`}>
                          <span className="capitalize">{selectedClient.emerald_approval_status}</span>
                        </span>
                        {selectedClient.emerald_approval_reviewer && (
                          <p className="text-sm text-slate-400">
                             By: <span className="text-white">{selectedClient.emerald_approval_reviewer.name}</span>
                          </p>
                        )}
                        {selectedClient.emerald_approval_reviewed_at && (
                          <p className="text-sm text-slate-400">
                             On: <span className="text-white">{new Date(selectedClient.emerald_approval_reviewed_at).toLocaleString()}</span>
                          </p>
                        )}
                         {selectedClient.emerald_approval_notes && (
                          <div className="mt-2 text-sm text-slate-300 bg-slate-800 p-3 rounded">
                            <span className="text-slate-500 block mb-1">Notes:</span>
                            {selectedClient.emerald_approval_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reject Notes Field (toggleable) */}
              {(showRejectNotes || selectedClient.emerald_approval_status === "pending") && (
                <div className={`pt-4 border-t border-slate-700 transition-all ${showRejectNotes ? 'block' : 'hidden'} ${selectedClient.emerald_approval_status === "pending" && showRejectNotes ? 'block' : 'hidden'}`}>
                  <label className="block text-sm text-slate-400 mb-2">Rejection Notes / Internal Comment</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    rows={3}
                    placeholder="Provide a reason for rejection or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              )}

            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/80 rounded-b-2xl sticky bottom-0">
               {selectedClient.emerald_approval_status === "pending" ? (
                 <div className="flex items-center gap-3">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <div className="flex-1"></div>
                    
                    {!showRejectNotes ? (
                       <button
                         onClick={() => setShowRejectNotes(true)}
                         className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-medium transition flex items-center gap-2"
                         disabled={actionLoading || !selectedClient.pending_product}
                       >
                         <XCircle className="w-5 h-5" />
                         Reject Request
                       </button>
                    ) : (
                      <button
                         onClick={handleReject}
                         className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow hover:shadow-lg hover:shadow-red-900/50 rounded-xl font-medium transition flex items-center gap-2"
                         disabled={actionLoading}
                       >
                         {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Rejection"}
                       </button>
                    )}

                    {!showRejectNotes && (
                      <button
                        onClick={handleApprove}
                        className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white shadow hover:shadow-lg hover:shadow-cyan-900/50 rounded-xl font-medium transition flex items-center gap-2"
                        disabled={actionLoading || !selectedClient.pending_product}
                      >
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        Approve & Provision
                      </button>
                    )}
                 </div>
               ) : (
                  <div className="flex justify-end">
                     <button
                        onClick={closeModal}
                        className="px-8 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition"
                      >
                        Close
                      </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
