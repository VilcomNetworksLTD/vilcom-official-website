import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw,
  Loader2 
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { quotesApi, QuoteRequest } from '@/services/quotes';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'under_review': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  quoted: 'bg-green-500/20 text-green-400 border-green-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'converted_to_subscription': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const MyQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesApi.getAll();
      setQuotes(response.data);
    } catch (err) {
      setError('Failed to load your quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (quoteNumber: string) => {
    setResending(prev => ({ ...prev, [quoteNumber]: true }));
    try {
      await quotesApi.resend(quoteNumber);
      setError(null);
      // Reload to show resent_at
      loadQuotes();
    } catch (err) {
      setError('Failed to resend quote. Please try again.');
    } finally {
      setResending(prev => ({ ...prev, [quoteNumber]: false }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="client">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Quotes</h1>
          <p className="text-slate-400 mt-2">View your quote requests and resend quotes if needed</p>
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No quotes found</h3>
            <p className="text-slate-400 mb-6">Get a quote for our services to see it here</p>
            <Link 
              to="/quote" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 rounded-xl text-white font-semibold hover:shadow-lg shadow-amber-500/25 transition-all"
            >
              Request New Quote
              <Send className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-500/20 rounded-xl mt-1">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Quote {quote.quote_number}</h3>
                      <p className="text-slate-400">{quote.getServiceTypeLabel ? quote.getServiceTypeLabel : quote.service_type}</p>
                      <p className="text-sm text-slate-500 mt-1">{new Date(quote.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-slate-400 block mb-1">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[quote.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {quote.status_label || quote.status.replace('_', ' ')}
                      </span>
                    </div>

                    {quote.quoted_price && (
                      <div className="text-right">
                        <span className="text-slate-400 text-sm block">Quoted Price</span>
                        <span className="text-lg font-bold text-green-400">KES {quote.quoted_price?.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResend(quote.quote_number)}
                        disabled={resending[quote.quote_number] || quote.status !== 'quoted'}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50 flex-shrink-0 disabled:cursor-not-allowed"
                      >
                        {resending[quote.quote_number] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Resend
                      </button>
                      <Link 
                        to={`/client/quotes/${quote.quote_number}`} 
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-slate-300 rounded-lg hover:bg-white/20 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>

                {quote.admin_response && (
                  <div className="mt-4 pt-4 border-t border-white/10 bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Admin Notes:</h4>
                    <p className="text-slate-300 whitespace-pre-wrap">{quote.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-300">{error}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyQuotes;

