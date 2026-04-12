import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, UserPlus, Loader2, AlertCircle, ShieldCheck,
  Package, X, ChevronDown, AlertTriangle, Mail, Phone,
  Building, User as UserIcon, MapPin, Clock, CheckCircle,
  XCircle, RefreshCw, Zap, Eye,
} from 'lucide-react';
import {
  clientsApi, Client, ClientStatistics, ClientFilters,
  ProductOption, PushToEmeraldPayload,
} from '@/services/clients';
import {
  safetikaDropdownsApi, SafetikaDropdowns, DropdownOption,
} from '@/services/safetikaDropdowns';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

// ── Helpers ───────────────────────────────────────────────────────────────────
const glass = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl';

function EmeraldStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    none:     { cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30',    label: 'Not Submitted' },
    pending:  { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Pending' },
    approved: { cls: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Provisioned' },
    rejected: { cls: 'bg-red-500/20 text-red-300 border-red-500/30',       label: 'Rejected' },
  };
  const b = map[status] ?? map.none;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${b.cls}`}>
      {b.label}
    </span>
  );
}

function SafetikaSelect({
  label, value, options, loading, placeholder, onChange,
}: {
  label: string; value: string; options: DropdownOption[];
  loading?: boolean; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
        >
          <option value="" className="bg-slate-900 text-slate-300">
            {loading ? 'Loading…' : placeholder ?? `— ${label} —`}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.name} className="bg-slate-900 text-white">
              {o.name}
            </option>
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

// ── Main Component ────────────────────────────────────────────────────────────
const ClientsPage = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // List state
  const [clients, setClients]               = useState<Client[]>([]);
  const [stats, setStats]                   = useState<ClientStatistics | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [filters, setFilters]               = useState<ClientFilters>({});
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());

  // Panel state
  const [panelClient, setPanelClient]       = useState<Client | null>(null);
  const [panelOpen, setPanelOpen]           = useState(false);

  // Push-to-emerald panel state
  const [showEmeraldForm, setShowEmeraldForm] = useState(false);
  const [products, setProducts]             = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Safetika dropdowns
  const [dropdowns, setDropdowns]           = useState<SafetikaDropdowns>({
    salesPersons: [], serviceCategories: [], accountTypes: [], customerTypes: [],
  });
  const [ddLoading, setDdLoading]           = useState(false);
  const [filteredAccountTypes, setFilteredAccountTypes] = useState<DropdownOption[]>([]);
  const [acctLoading, setAcctLoading]       = useState(false);

  // Form selections
  const [selProduct, setSelProduct]         = useState('');
  const [selSalesPerson, setSelSalesPerson] = useState('');
  const [selServiceCat, setSelServiceCat]   = useState('');
  const [selAccountType, setSelAccountType] = useState('');
  const [selCustomerType, setSelCustomerType] = useState('');
  const [notes, setNotes]                   = useState('');
  const [submitting, setSubmitting]         = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await clientsApi.list(filters);
      setClients(response.data.data ?? response.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await clientsApi.statistics();
      setStats((response as any).data?.data ?? (response as any).data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchClients(); fetchStats(); }, [fetchClients]);

  // ── Account types reload when service category changes ────────────────────
  useEffect(() => {
    if (!selServiceCat) { setFilteredAccountTypes(dropdowns.accountTypes); setSelAccountType(''); return; }
    let cancelled = false;
    setAcctLoading(true); setSelAccountType('');
    safetikaDropdownsApi.getAccountTypesByCategory(selServiceCat).then((data) => {
      if (!cancelled) setFilteredAccountTypes(data.length ? data : dropdowns.accountTypes);
    }).finally(() => { if (!cancelled) setAcctLoading(false); });
    return () => { cancelled = true; };
  }, [selServiceCat, dropdowns.accountTypes]);

  // ── Panel helpers ─────────────────────────────────────────────────────────
  const openPanel = (client: Client) => {
    setPanelClient(client);
    setPanelOpen(true);
    setShowEmeraldForm(false);
    resetForm();
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => { setPanelClient(null); setShowEmeraldForm(false); resetForm(); }, 300);
  };

  const resetForm = () => {
    setSelProduct(''); setSelSalesPerson(''); setSelServiceCat('');
    setSelAccountType(''); setSelCustomerType(''); setNotes('');
  };

  const openEmeraldForm = async () => {
    setShowEmeraldForm(true);
    // Load products + dropdowns in parallel
    setProductsLoading(true);
    setDdLoading(true);
    try {
      const [prods, dd] = await Promise.all([
        clientsApi.listProducts(),
        safetikaDropdownsApi.fetchAll(),
      ]);
      setProducts(prods);
      setDropdowns(dd);
      setFilteredAccountTypes(dd.accountTypes);
    } catch {
      toast({ title: 'Warning', description: 'Could not load all options.', variant: 'destructive' });
    } finally {
      setProductsLoading(false);
      setDdLoading(false);
    }
  };

  // ── Submit push-to-emerald ────────────────────────────────────────────────
  const handlePushToEmerald = async () => {
    if (!panelClient || !selProduct) {
      toast({ title: 'Required', description: 'Please select a product/service.', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      const payload: PushToEmeraldPayload = {
        product_id:       parseInt(selProduct),
        account_type:     selAccountType     || undefined,
        service_category: selServiceCat      || undefined,
        customer_type:    selCustomerType    || undefined,
        sales_person:     selSalesPerson     || undefined,
        notes:            notes              || undefined,
      };
      const res = await clientsApi.pushToEmerald(panelClient.id, payload);
      const data = res.data;

      toast({
        title: data.provisioned ? '✅ Emerald Provisioned!' : '📋 Queued for Approval',
        description: data.message,
      });

      // Update the client in local list
      setClients((prev) => prev.map((c) => c.id === panelClient.id ? { ...c, ...(data.client ?? {}) } : c));
      if (data.client) setPanelClient(data.client);
      setShowEmeraldForm(false);
      resetForm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to push client to Emerald.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Misc helpers ──────────────────────────────────────────────────────────
  const handleFilterChange = (key: keyof ClientFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const toggleClientSelection = (clientId: number) => {
    const next = new Set(selectedClients);
    next.has(clientId) ? next.delete(clientId) : next.add(clientId);
    setSelectedClients(next);
  };

  const formatStatus = (status: string) => {
    const badges: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active:    { variant: 'default',     label: 'Active' },
      inactive:  { variant: 'secondary',   label: 'Inactive' },
      suspended: { variant: 'destructive', label: 'Suspended' },
    };
    return badges[status] || badges.inactive!;
  };

  const canPushToEmerald = (c: Client) =>
    !c.emerald_mbr_id && c.emerald_approval_status !== 'approved';

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-7 sm:h-7" />
              Client Management
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Manage client accounts, services and Emerald provisioning
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { fetchClients(); fetchStats(); }}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/admin/clients/create">
                <UserPlus className="w-4 h-4 mr-2" /> New Client
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Total Clients',   value: stats.total_clients,         color: 'text-white' },
              { label: 'Active',          value: stats.active_clients,        color: 'text-green-400' },
              { label: 'Business',        value: stats.business_clients,      color: 'text-blue-400' },
              { label: 'New This Month',  value: stats.new_clients_this_month, color: 'text-indigo-400' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6 px-3 sm:px-6">
                  <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6 px-3 sm:px-6">
                  <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search clients by name, email, phone…"
                  className="pl-10 text-sm"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}>
                  <SelectTrigger className="flex-1 min-w-[120px] text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => handleFilterChange('customer_type', v === 'all' ? '' : v)}>
                  <SelectTrigger className="flex-1 min-w-[120px] text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setFilters({})}>Clear</Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Clients Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
            <CardTitle className="text-white text-base sm:text-lg">
              Clients ({clients.length})
            </CardTitle>
            {selectedClients.size > 0 && (
              <Button variant="outline" size="sm" className="text-xs">
                Bulk Actions ({selectedClients.size})
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {error ? (
              <div className="flex items-center gap-2 text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/20 mx-4 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="block sm:hidden divide-y divide-white/10">
                  {clients.map((client) => (
                    <div key={client.id} className="p-4 hover:bg-white/5 transition-colors">
                      {/* Top row: avatar + info + status badge */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedClients.has(client.id)}
                          onCheckedChange={() => toggleClientSelection(client.id)}
                          className="mt-1 shrink-0"
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {client.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-white font-semibold text-sm leading-tight">{client.name}</div>
                              {client.company_name && (
                                <div className="text-xs text-slate-500 truncate">{client.company_name}</div>
                              )}
                            </div>
                            <Badge {...formatStatus(client.status)} className="text-xs flex-shrink-0">
                              {formatStatus(client.status).label}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400 truncate mt-0.5">{client.email}</div>
                          {client.phone && (
                            <div className="text-xs text-slate-500 mt-0.5">{client.phone}</div>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant={client.customer_type === 'business' ? 'default' : 'secondary'} className="text-xs">
                              {client.customer_type === 'business' ? 'Business' : 'Individual'}
                            </Badge>
                            <EmeraldStatusBadge status={client.emerald_approval_status ?? 'none'} />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons row — always visible on mobile */}
                      <div className="mt-3 flex gap-2 pl-[52px]">
                        <button
                          onClick={() => openPanel(client)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/15 active:scale-95 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                        {canPushToEmerald(client) && (
                          <button
                            onClick={() => { openPanel(client); setTimeout(openEmeraldForm, 60); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/30 active:scale-95 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Push to Emerald
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[48px]">
                          <Checkbox
                            checked={selectedClients.size === clients.length && clients.length > 0}
                            onCheckedChange={(checked) =>
                              setSelectedClients(checked ? new Set(clients.map((c) => c.id)) : new Set())
                            }
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Emerald</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-white/5">
                          <TableCell>
                            <Checkbox
                              checked={selectedClients.has(client.id)}
                              onCheckedChange={() => toggleClientSelection(client.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                                {client.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-white font-medium text-sm">{client.name}</div>
                                <div className="text-xs text-slate-400">{client.company_name || 'Individual'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">{client.email}</TableCell>
                          <TableCell className="text-slate-300 text-sm hidden lg:table-cell">{client.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={client.customer_type === 'business' ? 'default' : 'secondary'}>
                              {client.customer_type === 'business' ? 'Business' : 'Individual'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge {...formatStatus(client.status)}>
                              {formatStatus(client.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <EmeraldStatusBadge status={client.emerald_approval_status ?? 'none'} />
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-400 hidden md:table-cell">
                            {new Date(client.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openPanel(client)}
                                title="View & Manage"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {canPushToEmerald(client) && (
                                <button
                                  onClick={() => { openPanel(client); setTimeout(openEmeraldForm, 50); }}
                                  title="Assign Service / Push to Emerald"
                                  className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                                >
                                  <Zap className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Slide-Over Panel ──────────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[520px] z-50 flex flex-col transition-transform duration-300 ease-out ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(10,18,35,0.99) 100%)', borderLeft: '1px solid rgba(255,255,255,0.12)' }}
      >
        {panelClient && (
          <>
            {/* Panel Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                  {panelClient.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">{panelClient.name}</h2>
                  <p className="text-slate-400 text-xs capitalize">{panelClient.customer_type} client</p>
                </div>
              </div>
              <button onClick={closePanel} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Client Info */}
              <div className={`${glass} p-4 space-y-3`}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                  Client Details
                </h3>
                {[
                  { Icon: Mail,     label: 'Email',   value: panelClient.email },
                  { Icon: Phone,    label: 'Phone',   value: panelClient.phone || 'N/A' },
                  { Icon: Building, label: 'Company', value: panelClient.company_name || 'N/A' },
                  { Icon: MapPin,   label: 'Location',value: [panelClient.address, panelClient.city, panelClient.county].filter(Boolean).join(', ') || 'N/A' },
                  { Icon: Clock,    label: 'Joined',  value: new Date(panelClient.created_at).toLocaleDateString() },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emerald Status */}
              <div className={`${glass} p-4 space-y-3`}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                  Emerald Provisioning Status
                </h3>
                <div className="flex items-center gap-3">
                  <EmeraldStatusBadge status={panelClient.emerald_approval_status ?? 'none'} />
                  {panelClient.emerald_mbr_id && (
                    <span className="text-xs text-green-300">MBR: {panelClient.emerald_mbr_id}</span>
                  )}
                </div>
                {panelClient.pending_product && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-cyan-300 text-sm font-medium flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> {panelClient.pending_product.name}
                    </p>
                    {panelClient.pending_product.price_monthly > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        KES {Number(panelClient.pending_product.price_monthly).toLocaleString()}/mo
                      </p>
                    )}
                  </div>
                )}
                {panelClient.emerald_approval_notes && (
                  <p className="text-xs text-slate-400 bg-white/5 rounded p-2">
                    <span className="text-slate-500">Notes: </span>{panelClient.emerald_approval_notes}
                  </p>
                )}
              </div>

              {/* Push to Emerald CTA or Form */}
              {canPushToEmerald(panelClient) ? (
                !showEmeraldForm ? (
                  <button
                    onClick={openEmeraldForm}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
                  >
                    <Zap className="w-4 h-4" />
                    Assign Service &amp; Push to Emerald Provision
                  </button>
                ) : (
                  /* ── Emerald Assign Form ── */
                  <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                        Assign Service &amp; Push to Emerald
                      </h3>
                      {(productsLoading || ddLoading) && (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-auto" />
                      )}
                    </div>

                    {/* Product / Service selector — Required */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Product / Service <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selProduct}
                          onChange={(e) => setSelProduct(e.target.value)}
                          disabled={productsLoading}
                          className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                        >
                          <option value="" className="bg-slate-900 text-slate-300">
                            {productsLoading ? 'Loading products…' : '— Select a Service/Product —'}
                          </option>
                          {products.map((p) => (
                            <option key={p.id} value={String(p.id)} className="bg-slate-900 text-white">
                              {p.name}{p.price_monthly ? ` — KES ${p.price_monthly.toLocaleString()}/mo` : ''}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          {productsLoading
                            ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Safetika provisioning overrides (optional — leave blank to use product defaults):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SafetikaSelect
                        label="Sales Person"
                        value={selSalesPerson}
                        options={dropdowns.salesPersons}
                        loading={ddLoading}
                        placeholder="— Use default —"
                        onChange={setSelSalesPerson}
                      />
                      <SafetikaSelect
                        label="Customer Type"
                        value={selCustomerType}
                        options={dropdowns.customerTypes}
                        loading={ddLoading}
                        placeholder="— Use default —"
                        onChange={setSelCustomerType}
                      />
                      <SafetikaSelect
                        label="Service Category"
                        value={selServiceCat}
                        options={dropdowns.serviceCategories}
                        loading={ddLoading}
                        placeholder="— Use default —"
                        onChange={setSelServiceCat}
                      />
                      <SafetikaSelect
                        label="Account Type"
                        value={selAccountType}
                        options={filteredAccountTypes}
                        loading={ddLoading || acctLoading}
                        placeholder={selServiceCat ? 'Select account type' : '— Use default —'}
                        onChange={setSelAccountType}
                      />
                    </div>

                    {/* Info hint */}
                    {!selSalesPerson && !selServiceCat && !selAccountType && !selCustomerType && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                          No Safetika overrides selected — the client will be placed in the{' '}
                          <strong>Emerald Approvals queue</strong> for manual review and provisioning.
                          Fill in the fields above to provision immediately.
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Internal Notes (optional)
                      </label>
                      <textarea
                        className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-sm"
                        rows={2}
                        placeholder="Any notes about this assignment…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Form actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setShowEmeraldForm(false); resetForm(); }}
                        className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePushToEmerald}
                        disabled={submitting || !selProduct}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {submitting
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : (selSalesPerson || selServiceCat || selAccountType || selCustomerType)
                            ? <><ShieldCheck className="w-4 h-4" /> Provision Now</>
                            : <><Zap className="w-4 h-4" /> Queue for Approval</>
                        }
                      </button>
                    </div>
                  </div>
                )
              ) : panelClient.emerald_approval_status === 'approved' ? (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-green-300 font-medium text-sm">Provisioned in Emerald</p>
                    {panelClient.emerald_mbr_id && (
                      <p className="text-green-400/70 text-xs">MBR ID: {panelClient.emerald_mbr_id}</p>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Subscriptions */}
              {panelClient.subscriptions && panelClient.subscriptions.length > 0 && (
                <div className={`${glass} p-4`}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2 mb-3">
                    Subscriptions ({panelClient.subscriptions.length})
                  </h3>
                  <div className="space-y-2">
                    {panelClient.subscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-sm text-white capitalize">{sub.billing_cycle}</span>
                        <div className="flex items-center gap-2">
                          {sub.price && (
                            <span className="text-xs text-slate-400">KES {Number(sub.price).toLocaleString()}</span>
                          )}
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-white/10 shrink-0 flex gap-2">
              <button
                onClick={closePanel}
                className="flex-1 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;