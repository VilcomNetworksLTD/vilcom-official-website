import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, ArrowLeft, Loader2, User, Mail, Phone,
  Building, MapPin, Lock, Eye, EyeOff, ShieldCheck,
  Package, ChevronDown, AlertTriangle, CheckCircle, Zap,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { clientsApi, ProductOption } from '@/services/clients';
import { safetikaDropdownsApi, SafetikaDropdowns, DropdownOption } from '@/services/safetikaDropdowns';

// ── helpers ───────────────────────────────────────────────────────────────────
const glass = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl';

function Field({
  label, required, children, hint,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TextInput({
  id, value, onChange, placeholder, type = 'text', disabled, icon: Icon,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50`}
      />
    </div>
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
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreateClient() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic fields
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('individual');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress]         = useState('');
  const [city, setCity]               = useState('');
  const [county, setCounty]           = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email/verification preferences
  const [autoVerify, setAutoVerify]   = useState(true);
  const [sendWelcome, setSendWelcome] = useState(true);

  // Flag: assign service at creation
  const [assignService, setAssignService] = useState(false);

  // Product + emerald
  const [products, setProducts]           = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selProduct, setSelProduct]       = useState('');

  // Safetika dropdowns
  const [dropdowns, setDropdowns]         = useState<SafetikaDropdowns>({
    salesPersons: [], serviceCategories: [], accountTypes: [], customerTypes: [],
  });
  const [ddLoading, setDdLoading]         = useState(false);
  const [filteredAcctTypes, setFilteredAcctTypes] = useState<DropdownOption[]>([]);
  const [acctLoading, setAcctLoading]     = useState(false);
  const [selSalesPerson, setSelSalesPerson] = useState('');
  const [selServiceCat, setSelServiceCat] = useState('');
  const [selAcctType, setSelAcctType]     = useState('');
  const [selSafetikaType, setSelSafetikaType] = useState('');

  const [submitting, setSubmitting]       = useState(false);

  // Load products + dropdowns when "Assign Service" is toggled on
  useEffect(() => {
    if (!assignService || products.length > 0) return;
    setProductsLoading(true);
    setDdLoading(true);
    Promise.all([clientsApi.listProducts(), safetikaDropdownsApi.fetchAll()])
      .then(([prods, dd]) => {
        setProducts(prods);
        setDropdowns(dd);
        setFilteredAcctTypes(dd.accountTypes);
      })
      .catch(() => toast({ title: 'Warning', description: 'Could not load all options.', variant: 'destructive' }))
      .finally(() => { setProductsLoading(false); setDdLoading(false); });
  }, [assignService]);

  // Reload account types when service category changes
  useEffect(() => {
    if (!selServiceCat) { setFilteredAcctTypes(dropdowns.accountTypes); setSelAcctType(''); return; }
    let cancelled = false;
    setAcctLoading(true); setSelAcctType('');
    safetikaDropdownsApi.getAccountTypesByCategory(selServiceCat)
      .then((data) => { if (!cancelled) setFilteredAcctTypes(data.length ? data : dropdowns.accountTypes); })
      .finally(() => { if (!cancelled) setAcctLoading(false); });
    return () => { cancelled = true; };
  }, [selServiceCat, dropdowns.accountTypes]);

  const validate = () => {
    if (!name.trim())     { toast({ title: 'Required', description: 'Full name is required.',      variant: 'destructive' }); return false; }
    if (!email.trim())    { toast({ title: 'Required', description: 'Email address is required.',  variant: 'destructive' }); return false; }
    if (!password.trim()) { toast({ title: 'Required', description: 'Password is required.',       variant: 'destructive' }); return false; }
    if (password.length < 8) { toast({ title: 'Password too short', description: 'Minimum 8 characters.', variant: 'destructive' }); return false; }
    if (assignService && !selProduct) { toast({ title: 'Required', description: 'Please select a service/product.', variant: 'destructive' }); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      // 1. Create the client account
      const res = await clientsApi.create({
        name,
        email,
        phone:         phone     || undefined,
        customer_type: customerType,
        company_name:  companyName || undefined,
        address:       address   || undefined,
        city:          city      || undefined,
        county:        county    || undefined,
        password,
        auto_verify:   autoVerify,
        send_welcome:  sendWelcome,
      } as any);

      const newClient = (res as any).data?.client ?? (res as any).client ?? (res as any).data;
      const clientId = newClient?.id;

      // 2. Optionally push to Emerald
      if (assignService && selProduct && clientId) {
        const hasSafetika = selSalesPerson || selServiceCat || selAcctType || selSafetikaType;
        await clientsApi.pushToEmerald(clientId, {
          product_id:       parseInt(selProduct),
          account_type:     selAcctType      || undefined,
          service_category: selServiceCat    || undefined,
          customer_type:    selSafetikaType  || undefined,
          sales_person:     selSalesPerson   || undefined,
        });

        toast({
          title: '✅ Client Created & ' + (hasSafetika ? 'Provisioned!' : 'Queued for Approval'),
          description: `${name} has been created and ${hasSafetika ? 'provisioned in Emerald.' : 'added to the Emerald Approvals queue.'}`,
        });
      } else {
        toast({
          title: '✅ Client Created',
          description: `${name}'s account has been created successfully.`,
        });
      }

      navigate('/admin/clients');
    } catch (err: any) {
      const msg = err.response?.data?.message
        ?? (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null)
        ?? 'Failed to create client.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const hasSafetikaOverrides = selSalesPerson || selServiceCat || selAcctType || selSafetikaType;

  return (
    <DashboardLayout userType={hasRole('admin') ? 'admin' : 'staff'}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/clients')}
            className="p-2 rounded-lg bg-white/10 border border-white/20 text-slate-400 hover:text-white hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              Add New Client
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Create a new client account manually</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Personal Info ─────────────────────────────────────────── */}
          <div className={`${glass} p-5 space-y-4`}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <TextInput id="name" value={name} onChange={setName} placeholder="Jane Doe" icon={User} />
              </Field>
              <Field label="Email Address" required>
                <TextInput id="email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" icon={Mail} />
              </Field>
              <Field label="Phone Number">
                <TextInput id="phone" value={phone} onChange={setPhone} placeholder="+254 7XX XXX XXX" icon={Phone} />
              </Field>
              <Field label="Account Type" required>
                <div className="flex gap-2">
                  {(['individual', 'business'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomerType(t)}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all capitalize ${
                        customerType === t
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'bg-white/5 border-white/20 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {t === 'business' ? <Building className="w-3.5 h-3.5 inline mr-1.5" /> : <User className="w-3.5 h-3.5 inline mr-1.5" />}
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {customerType === 'business' && (
              <Field label="Company Name">
                <TextInput id="company" value={companyName} onChange={setCompanyName} placeholder="Acme Ltd." icon={Building} />
              </Field>
            )}
          </div>

          {/* ── Location ──────────────────────────────────────────────── */}
          <div className={`${glass} p-5 space-y-4`}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Location (Optional)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <Field label="Address">
                  <TextInput id="address" value={address} onChange={setAddress} placeholder="123 Main Street" icon={MapPin} />
                </Field>
              </div>
              <Field label="City">
                <TextInput id="city" value={city} onChange={setCity} placeholder="Nairobi" />
              </Field>
              <Field label="County">
                <TextInput id="county" value={county} onChange={setCounty} placeholder="Nairobi County" />
              </Field>
            </div>
          </div>

          {/* ── Password & Preferences ────────────────────────────────── */}
          <div className={`${glass} p-5 space-y-5`}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> Account Security & Preferences
            </h2>
            
            <Field label="Password" required hint="Minimum 8 characters. Client can reset via email.">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${autoVerify ? 'bg-cyan-500 border-cyan-500' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                  {autoVerify && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={autoVerify} onChange={(e) => setAutoVerify(e.target.checked)} />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Auto-verify email address</span>
                  <span className="text-xs text-slate-400">If unchecked, the user will receive an email verification link.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${sendWelcome ? 'bg-cyan-500 border-cyan-500' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                  {sendWelcome && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={sendWelcome} onChange={(e) => setSendWelcome(e.target.checked)} />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Send welcome email</span>
                  <span className="text-xs text-slate-400">Send an introductory welcome email automatically after creation.</span>
                </div>
              </label>
            </div>
          </div>

          {/* ── Assign Service / Emerald ───────────────────────────────── */}
          <div className={`${glass} p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" /> Service Assignment (Optional)
              </h2>
              <button
                type="button"
                onClick={() => setAssignService((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  assignService ? 'bg-cyan-600' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  assignService ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {!assignService ? (
              <p className="text-xs text-slate-500">
                Toggle on to assign a service/product now and optionally push the client to Emerald Provision.
                You can also do this later from the client list.
              </p>
            ) : (
              <div className="space-y-4">

                {/* Product selector */}
                <Field label="Service / Product" required>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={selProduct}
                      onChange={(e) => setSelProduct(e.target.value)}
                      disabled={productsLoading}
                      className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
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
                </Field>

                {/* Safetika provisioning block */}
                {selProduct && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                        Safetika Provisioning Overrides
                      </p>
                      {ddLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 ml-auto" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      All fields optional — leave blank to use product mapping defaults.
                      Fill any field to attempt <strong className="text-white">immediate</strong> provisioning.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SafetikaSelect label="Sales Person"     value={selSalesPerson}  options={dropdowns.salesPersons}    loading={ddLoading}              placeholder="— Use default —" onChange={setSelSalesPerson} />
                      <SafetikaSelect label="Customer Type"    value={selSafetikaType} options={dropdowns.customerTypes}   loading={ddLoading}              placeholder="— Use default —" onChange={setSelSafetikaType} />
                      <SafetikaSelect label="Service Category" value={selServiceCat}   options={dropdowns.serviceCategories} loading={ddLoading}            placeholder="— Use default —" onChange={setSelServiceCat} />
                      <SafetikaSelect label="Account Type"     value={selAcctType}     options={filteredAcctTypes}         loading={ddLoading || acctLoading} placeholder={selServiceCat ? 'Select account type' : '— Use default —'} onChange={setSelAcctType} />
                    </div>

                    {!hasSafetikaOverrides ? (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                          No overrides — client will be placed in the <strong>Emerald Approvals queue</strong> after creation.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-green-300">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                          Overrides set — Emerald provisioning will be <strong>attempted immediately</strong> after creation.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/admin/clients')}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : assignService && selProduct && hasSafetikaOverrides ? (
                <><ShieldCheck className="w-4 h-4" /> Create &amp; Provision to Emerald</>
              ) : assignService && selProduct ? (
                <><Zap className="w-4 h-4" /> Create &amp; Queue for Emerald</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Client</>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
