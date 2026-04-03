import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download,
  Eye,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '@/lib/axios';

const ClientInvoices = () => {
  const { hasRole, isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices');
      setInvoices(response.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load your invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!hasRole('client')) return <Navigate to="/unauthorized" replace />;

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      case 'pending':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'overdue':
      case 'unpaid':
        return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'void':
      case 'cancelled':
        return { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
      default:
        return { icon: Clock, color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10' };
    }
  };

  return (
    <DashboardLayout userType="client">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-500" />
          My Invoices
        </h1>
        <p className="text-slate-400 mt-2">View and manage all your billing statements.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending/Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading invoices...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-white font-medium mb-2">{error}</p>
            <button onClick={fetchInvoices} className="text-amber-500 hover:underline">Try again</button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-t border-white/5">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Invoices Found</h3>
            <p className="text-slate-400 max-w-sm mx-auto">You don't have any billing history on your account yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-white/10 uppercase text-xs font-semibold text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invoices.map((inv) => {
                  const statusInfo = getStatusConfig(inv.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6 font-mono text-white text-sm">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        {new Date(inv.invoice_date || inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-sm">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-6 font-medium text-white">
                        KES {Number(inv.total_amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">{inv.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== 'paid' && (
                            <button className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors" title="Pay Now">
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <a href={`/api/v1/invoices/${inv.id}/download`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientInvoices;
