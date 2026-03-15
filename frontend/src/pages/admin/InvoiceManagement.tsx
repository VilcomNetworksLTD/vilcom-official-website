import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Loader2, RefreshCw, FileText, DollarSign, Clock, CheckCircle2,
  AlertCircle, XCircle, Search, X, MoreHorizontal, Eye, Send,
  Download, CreditCard, Ban, ChevronLeft, ChevronRight, Plus, TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { adminInvoicesApi, type Invoice, type InvoiceAnalytics } from '@/services/invoices';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, {
  label: string; color: string; bg: string; icon: React.ElementType; dot: string;
}> = {
  draft:         { label: 'Draft',          color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: FileText,    dot: 'bg-slate-500' },
  sent:          { label: 'Sent',           color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: Send,        dot: 'bg-blue-400 shadow-[0_0_6px_#3b82f6]' },
  paid:          { label: 'Paid',           color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle2,dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]' },
  partial:       { label: 'Partial',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock,       dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' },
  overdue:       { label: 'Overdue',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: AlertCircle, dot: 'bg-red-400 shadow-[0_0_6px_#ef4444]' },
  void:          { label: 'Void',           color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: XCircle,     dot: 'bg-slate-600' },
  refunded:      { label: 'Refunded',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: CreditCard,  dot: 'bg-violet-400' },
  uncollectible: { label: 'Uncollectible',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: Ban,         dot: 'bg-red-500' },
};

const TYPE_LABELS: Record<string, string> = {
  subscription: 'Subscription', one_time: 'One-time',
  prorated: 'Prorated', credit_note: 'Credit Note', setup_fee: 'Setup Fee',
};

const fmt = (n?: number, currency = 'KES') =>
  n !== undefined && n !== null
    ? `${currency} ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: React.ElementType; accent: string; sub?: React.ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 hover:bg-white/[0.05] transition-colors">
    <div className="flex items-start justify-between">
      <p className="text-xs sm:text-sm font-medium text-slate-400">{label}</p>
      <div className="p-1.5 sm:p-2 rounded-xl" style={{ background: `${accent}18` }}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: accent }} />
      </div>
    </div>
    <div>
      <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <div className="mt-1 sm:mt-1.5 text-xs text-slate-500">{sub}</div>}
    </div>
    <div className="absolute bottom-0 left-0 h-0.5 w-1/3 rounded-full"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const m = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: m.color, background: m.bg }}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

// ─── Invoice Card (mobile) ────────────────────────────────────────────────────
const InvoiceCard = ({ inv, onView, onQuickAction }: {
  inv: Invoice;
  onView: () => void;
  onQuickAction: (action: string, id: number) => void;
}) => (
  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-mono text-blue-400 text-sm font-semibold">{inv.invoice_number}</p>
        <p className="text-white font-semibold text-sm mt-0.5 truncate">{inv.user?.name ?? '—'}</p>
        <p className="text-slate-500 text-xs truncate">{inv.user?.email}</p>
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
          <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8"
            onClick={() => adminInvoicesApi.download(inv.id)}>
            <Download className="w-3.5 h-3.5" /> Download PDF
          </DropdownMenuItem>
          {inv.status === 'draft' && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-blue-500/10"
                onClick={() => onQuickAction('send', inv.id)}>
                <Send className="w-3.5 h-3.5" /> Send to Client
              </DropdownMenuItem>
            </>
          )}
          {['sent', 'partial', 'overdue'].includes(inv.status) && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
                onClick={() => onQuickAction('paid', inv.id)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
              </DropdownMenuItem>
            </>
          )}
          {!['paid', 'void'].includes(inv.status) && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
                onClick={() => onQuickAction('void', inv.id)}>
                <Ban className="w-3.5 h-3.5" /> Void
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <StatusBadge status={inv.status} />
      <span className="text-xs font-medium text-slate-400 capitalize px-2 py-1 rounded-lg bg-white/5 border border-white/[0.06]">
        {TYPE_LABELS[inv.type] ?? inv.type}
      </span>
    </div>
    <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
      <div>
        <p className="text-white font-semibold text-sm">{fmt(inv.total_amount, inv.currency)}</p>
        {inv.amount_due > 0 && inv.status !== 'void' && (
          <p className="text-xs text-amber-400">{fmt(inv.amount_due, inv.currency)} due</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-slate-400 text-xs">Due {fmtDate(inv.due_date)}</p>
      </div>
    </div>
  </div>
);

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────

const InvoiceDetailModal = ({ invoiceId, onClose, onAction }: {
  invoiceId: number;
  onClose: () => void;
  onAction: () => void;
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null);

  useEffect(() => {
    adminInvoicesApi.get(invoiceId)
      .then(r => setInvoice(r.data ?? r))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const act = async (action: string, fn: () => Promise<any>) => {
    setActing(action);
    try { await fn(); onAction(); onClose(); }
    catch (e) { console.error(e); }
    finally { setActing(null); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-2xl mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <DialogTitle className="text-white font-bold text-lg">Invoice Details</DialogTitle>
              {invoice && <p className="text-blue-400 font-mono text-sm">{invoice.invoice_number}</p>}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
        ) : invoice ? (
          <div className="space-y-4 sm:space-y-5 py-2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Type</p>
                <span className="text-sm font-medium text-white capitalize">
                  {TYPE_LABELS[invoice.type] ?? invoice.type}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Customer</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  ['Name',    invoice.user?.name],
                  ['Email',   invoice.user?.email],
                  ['Phone',   invoice.user?.phone],
                  ['Company', invoice.user?.company_name],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-xs text-slate-500 mb-0.5">{k as string}</p>
                    <p className="text-sm text-white font-medium break-all">{v as string}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                ['Invoice Date', fmtDate(invoice.invoice_date)],
                ['Due Date',     fmtDate(invoice.due_date)],
                ['Paid At',      fmtDate(invoice.paid_at)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 sm:p-3">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-xs sm:text-sm text-white font-medium">{v || '—'}</p>
                </div>
              ))}
            </div>

            {invoice.items && invoice.items.length > 0 && (
              <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr] gap-3 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
                  {['Description','Qty','Unit Price','Total'].map(h => (
                    <div key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
                  ))}
                </div>
                {invoice.items.map(item => (
                  <div key={item.id} className="px-4 py-3 border-b border-white/[0.04] last:border-0">
                    {/* Desktop row */}
                    <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr] gap-3 items-center">
                      <div>
                        <p className="text-sm text-white">{item.description}</p>
                        {item.product && <p className="text-xs text-slate-500">{item.product.name}</p>}
                      </div>
                      <span className="text-sm text-slate-300">{item.quantity}</span>
                      <span className="text-sm text-slate-300">{fmt(item.unit_price, invoice.currency)}</span>
                      <span className="text-sm text-white font-semibold">{fmt(item.total, invoice.currency)}</span>
                    </div>
                    {/* Mobile row */}
                    <div className="sm:hidden space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-white">{item.description}</p>
                          {item.product && <p className="text-xs text-slate-500">{item.product.name}</p>}
                        </div>
                        <span className="text-sm text-white font-semibold flex-shrink-0">{fmt(item.total, invoice.currency)}</span>
                      </div>
                      <p className="text-xs text-slate-500">Qty: {item.quantity} × {fmt(item.unit_price, invoice.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:p-4 space-y-2.5">
              {[
                ['Subtotal',   fmt(invoice.subtotal, invoice.currency), 'text-slate-300'],
                ['Discount',   invoice.discount_amount ? `-${fmt(invoice.discount_amount, invoice.currency)}` : '—', 'text-emerald-400'],
                ['Tax',        fmt(invoice.tax_amount, invoice.currency), 'text-slate-300'],
                ['Setup Fee',  invoice.setup_fee ? fmt(invoice.setup_fee, invoice.currency) : '—', 'text-slate-300'],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className={cls as string}>{v}</span>
                </div>
              ))}
              <div className="border-t border-white/[0.08] pt-2.5 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold text-base sm:text-lg">{fmt(invoice.total_amount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Amount Due</span>
                <span className={`font-semibold ${invoice.amount_due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {fmt(invoice.amount_due, invoice.currency)}
                </span>
              </div>
            </div>

            {invoice.notes && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-sm text-slate-300 bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm py-8 text-center">Invoice not found.</p>
        )}

        {invoice && (
          <DialogFooter className="flex gap-2 flex-wrap">
            {invoice.status === 'draft' && (
              <Button size="sm" disabled={acting === 'send'}
                onClick={() => act('send', () => adminInvoicesApi.send(invoice.id))}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                {acting === 'send' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                Send
              </Button>
            )}
            {['sent', 'partial', 'overdue'].includes(invoice.status) && (
              <Button size="sm" disabled={acting === 'paid'}
                onClick={() => act('paid', () => adminInvoicesApi.markPaid(invoice.id))}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                {acting === 'paid' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                Mark Paid
              </Button>
            )}
            {!['paid', 'void'].includes(invoice.status) && (
              <Button size="sm" disabled={acting === 'void'}
                onClick={() => { if (confirm('Void this invoice?')) act('void', () => adminInvoicesApi.void(invoice.id)); }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold h-9 px-4 rounded-lg flex-1 sm:flex-none">
                {acting === 'void' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Ban className="w-3.5 h-3.5 mr-1.5" />}
                Void
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white h-9 w-full sm:w-auto sm:ml-auto">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Create Invoice Modal ─────────────────────────────────────────────────────

const CreateInvoiceModal = ({ onClose, onCreated }: {
  onClose: () => void; onCreated: () => void;
}) => {
  const [form, setForm] = useState({
    user_id: '', type: 'one_time', due_date: '', notes: '',
    discount_amount: '', tax_rate: '',
  });
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit_price: '', type: 'other' },
  ]);
  const [saving, setSaving] = useState(false);

  const addItem = () => setItems(i => [...i, { description: '', quantity: 1, unit_price: '', type: 'other' }]);
  const removeItem = (idx: number) => setItems(i => i.filter((_, n) => n !== idx));
  const updateItem = (idx: number, field: string, value: any) =>
    setItems(i => i.map((item, n) => n === idx ? { ...item, [field]: value } : item));

  const handleCreate = async () => {
    if (!form.user_id || items.some(i => !i.description || !i.unit_price)) return;
    setSaving(true);
    try {
      await adminInvoicesApi.create({
        user_id:         parseInt(form.user_id),
        type:            form.type,
        due_date:        form.due_date || undefined,
        notes:           form.notes || undefined,
        discount_amount: form.discount_amount ? parseFloat(form.discount_amount) : 0,
        tax_rate:        form.tax_rate ? parseFloat(form.tax_rate) : 0,
        items: items.map(i => ({
          description: i.description,
          quantity:    i.quantity,
          unit_price:  parseFloat(i.unit_price as string),
          type:        i.type,
        })),
      });
      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition text-sm";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white w-[calc(100vw-2rem)] max-w-2xl mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" /> Create Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">User ID *</Label>
              <input type="number" value={form.user_id}
                onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                placeholder="User ID" className={inputCls} />
            </div>
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">Type</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className={inputCls}>
                <option value="one_time">One-time</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">Due Date</Label>
              <input type="date" value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">Discount (KES)</Label>
              <input type="number" value={form.discount_amount} min="0"
                onChange={e => setForm(f => ({ ...f, discount_amount: e.target.value }))}
                placeholder="0" className={inputCls} />
            </div>
            <div>
              <Label className="text-slate-400 text-sm mb-1.5 block">Tax Rate (%)</Label>
              <input type="number" value={form.tax_rate} min="0" max="100"
                onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))}
                placeholder="16" className={inputCls} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-400 text-sm">Line Items *</Label>
              <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[3fr_1fr_1.5fr_auto] sm:gap-2 sm:items-center p-2 sm:p-0 bg-white/[0.02] sm:bg-transparent rounded-lg sm:rounded-none border border-white/[0.05] sm:border-0">
                  <input value={item.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    placeholder="Description" className={inputCls} />
                  <div className="grid grid-cols-2 gap-2 sm:contents">
                    <input type="number" value={item.quantity} min="1"
                      onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))}
                      placeholder="Qty" className={inputCls} />
                    <input type="number" value={item.unit_price} min="0"
                      onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                      placeholder="Unit Price" className={inputCls} />
                  </div>
                  <button onClick={() => removeItem(idx)} disabled={items.length === 1}
                    className="text-slate-600 hover:text-red-400 disabled:opacity-20 transition p-1 hidden sm:block">
                    <X className="w-4 h-4" />
                  </button>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)}
                      className="sm:hidden text-xs text-red-400/70 hover:text-red-400 text-right w-full">
                      Remove item
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-400 text-sm mb-1.5 block">Notes</Label>
            <textarea value={form.notes} rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes visible to customer…"
              className={`${inputCls} resize-none`} />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !form.user_id}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 rounded-xl w-full sm:w-auto">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvoiceManagement() {
  const { hasRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole('admin') && !hasRole('staff')) return <Navigate to="/client/dashboard" replace />;

  const [invoices, setInvoices]       = useState<Invoice[]>([]);
  const [analytics, setAnalytics]     = useState<InvoiceAnalytics | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [detailId, setDetailId]       = useState<number | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [filters, setFilters]         = useState({ status: '', type: '', search: '' });
  const [pagination, setPagination]   = useState({ current_page: 1, last_page: 1, total: 0 });

  const loadInvoices = async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const params: any = { page: pagination.current_page, per_page: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.type)   params.type   = filters.type;
      if (filters.search) params.search = filters.search;

      const res = await adminInvoicesApi.getAll(params);
      setInvoices(res.data ?? []);
      setPagination(p => ({
        ...p,
        current_page: res.meta?.current_page ?? 1,
        last_page:    res.meta?.last_page    ?? 1,
        total:        res.meta?.total        ?? 0,
      }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const loadAnalytics = async () => {
    try {
      const res = await adminInvoicesApi.getAnalytics();
      setAnalytics(res.data ?? res);
    } catch (e) { console.error(e); }
  };

  const refresh = () => { loadInvoices(true); loadAnalytics(); };
  useEffect(() => { loadInvoices(); loadAnalytics(); }, [filters, pagination.current_page]);

  const quickAction = async (action: string, id: number) => {
    try {
      if (action === 'send') await adminInvoicesApi.send(id);
      if (action === 'paid') await adminInvoicesApi.markPaid(id);
      if (action === 'void') { if (!confirm('Void this invoice?')) return; await adminInvoicesApi.void(id); }
      refresh();
    } catch (e) { console.error(e); }
  };

  const statusFilters = [
    { v: '',        l: 'All' },
    { v: 'draft',   l: 'Draft' },
    { v: 'sent',    l: 'Sent' },
    { v: 'paid',    l: 'Paid' },
    { v: 'overdue', l: 'Overdue' },
    { v: 'partial', l: 'Partial' },
    { v: 'void',    l: 'Void' },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase hidden sm:inline">Billing</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Invoice Management</h1>
            <p className="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm hidden sm:block">Create, send, and track client invoices</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={refresh}
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-3 sm:px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-500/30 flex items-center gap-1.5 sm:gap-2 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <StatCard label="Total"    value={analytics.summary.total}   icon={FileText}    accent="#3b82f6" />
            <StatCard label="Draft"    value={analytics.summary.draft}   icon={FileText}    accent="#6b7280" />
            <StatCard label="Sent"     value={analytics.summary.sent}    icon={Send}        accent="#3b82f6" />
            <StatCard label="Paid"     value={analytics.summary.paid}    icon={CheckCircle2}accent="#10b981" />
            <StatCard label="Overdue"  value={analytics.summary.overdue} icon={AlertCircle} accent="#ef4444" />
            <StatCard label="Outstanding" value={fmt(analytics.revenue.outstanding)} icon={TrendingUp} accent="#f59e0b"
              sub={<span className="hidden sm:inline">of {fmt(analytics.revenue.total_billed)} billed</span>} />
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Search invoice #, name, email…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition" />
              {filters.search && (
                <button onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition flex-shrink-0 hidden sm:block">
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {(filters.search || filters.type || filters.status) && (
              <button onClick={() => setFilters({ status: '', type: '', search: '' })}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 flex-shrink-0">
                Clear
              </button>
            )}
            <span className="text-xs text-slate-600 ml-auto flex-shrink-0">{pagination.total}</span>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap overflow-x-auto">
            {statusFilters.map(({ v, l }) => (
              <button key={v} onClick={() => setFilters(f => ({ ...f, status: v }))}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  filters.status === v
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1.8fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-white/[0.02] border-b border-white/[0.07]">
            {['Invoice #','Customer','Type','Status','Total','Due Date',''].map((h, i) => (
              <div key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</div>
            ))}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading invoices…</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No invoices found</p>
                <p className="text-sm mt-1">
                  {filters.search || filters.status || filters.type
                    ? 'Try adjusting your search or filters'
                    : 'Create your first invoice to get started'}
                </p>
              </div>
            ) : invoices.map(inv => (
              <div key={inv.id}
                className="grid grid-cols-[1.2fr_1.8fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                <span className="font-mono text-blue-400 text-sm font-semibold truncate">{inv.invoice_number}</span>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{inv.user?.name ?? '—'}</p>
                  <p className="text-slate-500 text-xs truncate">{inv.user?.email}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.06] w-fit">
                  {TYPE_LABELS[inv.type] ?? inv.type}
                </span>
                <StatusBadge status={inv.status} />
                <span className="text-sm font-semibold text-white">{fmt(inv.total_amount, inv.currency)}</span>
                <div>
                  <p className="text-sm text-slate-300">{fmtDate(inv.due_date)}</p>
                  {inv.amount_due > 0 && inv.status !== 'void' && (
                    <p className="text-xs text-amber-400">{fmt(inv.amount_due, inv.currency)} due</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"
                      className="w-8 h-8 rounded-lg text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0f1629] border-white/10 text-white w-44">
                    <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8"
                      onClick={() => setDetailId(inv.id)}>
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-slate-300 hover:text-white cursor-pointer focus:bg-white/8"
                      onClick={() => adminInvoicesApi.download(inv.id)}>
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </DropdownMenuItem>
                    {inv.status === 'draft' && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="gap-2 text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-blue-500/10"
                          onClick={() => quickAction('send', inv.id)}>
                          <Send className="w-3.5 h-3.5" /> Send to Client
                        </DropdownMenuItem>
                      </>
                    )}
                    {['sent', 'partial', 'overdue'].includes(inv.status) && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="gap-2 text-emerald-400 hover:text-emerald-300 cursor-pointer focus:bg-emerald-500/10"
                          onClick={() => quickAction('paid', inv.id)}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                        </DropdownMenuItem>
                      </>
                    )}
                    {!['paid', 'void'].includes(inv.status) && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-500/10"
                          onClick={() => quickAction('void', inv.id)}>
                          <Ban className="w-3.5 h-3.5" /> Void
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading invoices…</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No invoices found</p>
            </div>
          ) : invoices.map(inv => (
            <InvoiceCard key={inv.id} inv={inv}
              onView={() => setDetailId(inv.id)}
              onQuickAction={quickAction} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {((pagination.current_page - 1) * 20) + 1}–{Math.min(pagination.current_page * 20, pagination.total)} of {pagination.total}
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

      {detailId && (
        <InvoiceDetailModal
          invoiceId={detailId}
          onClose={() => setDetailId(null)}
          onAction={refresh}
        />
      )}

      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onCreated={refresh}
        />
      )}
    </DashboardLayout>
  );
}