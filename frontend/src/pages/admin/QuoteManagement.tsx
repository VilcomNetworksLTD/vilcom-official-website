import { useState, useEffect } from 'react';
import { adminQuotesApi, type QuoteRequest, type QuoteStatistics } from '@/services/quotes';

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  under_review: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  quoted: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/40',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/40',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  converted_to_subscription: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
};

// Status labels
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  quoted: 'Quoted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  converted_to_subscription: 'Converted',
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  internet_plan: 'Internet Plan',
  hosting_package: 'Hosting Package',
  web_development: 'Web Development',
  cloud_services: 'Cloud Services',
  cyber_security: 'Cyber Security',
  network_infrastructure: 'Network Infrastructure',
  isp_services: 'ISP Services',
  cpe_device: 'CPE Device',
  satellite_connectivity: 'Satellite Connectivity',
  media_services: 'Media Services',
  erp_services: 'ERP Services',
  smart_integration: 'Smart Integration',
  other: 'Other',
};

export default function QuoteManagement() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [statistics, setStatistics] = useState<QuoteStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    service_type: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  // Quote submission form state
  const [quoteForm, setQuoteForm] = useState({
    quoted_price: '',
    staff_notes: '',
    admin_response: '',
  });

  useEffect(() => {
    loadQuotes();
    loadStatistics();
  }, [filters, pagination.current_page]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.current_page,
        per_page: 15,
      };
      if (filters.status) params.status = filters.status;
      if (filters.service_type) params.service_type = filters.service_type;
      if (filters.search) params.search = filters.search;

      const result = await adminQuotesApi.getAll(params);
      setQuotes(result.data);
      setPagination({
        current_page: result.meta.current_page,
        last_page: result.meta.last_page,
        total: result.meta.total,
      });
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await adminQuotesApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleMarkUnderReview = async (id: number) => {
    try {
      await adminQuotesApi.markUnderReview(id);
      loadQuotes();
      loadStatistics();
    } catch (error) {
      console.error('Failed to mark under review:', error);
    }
  };

  const handleSubmitQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      await adminQuotesApi.submitQuote(selectedQuote.id, {
        quoted_price: parseFloat(quoteForm.quoted_price),
        staff_notes: quoteForm.staff_notes || undefined,
        admin_response: quoteForm.admin_response,
      });
      setShowQuoteModal(false);
      setQuoteForm({ quoted_price: '', staff_notes: '', admin_response: '' });
      setSelectedQuote(null);
      loadQuotes();
      loadStatistics();
    } catch (error) {
      console.error('Failed to submit quote:', error);
    }
  };

  const openQuoteModal = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setQuoteForm({
      quoted_price: quote.quoted_price?.toString() || '',
      staff_notes: '',
      admin_response: '',
    });
    setShowQuoteModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return `KES ${price.toLocaleString()}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quote Management</h1>
        <p className="text-slate-400">Manage and respond to quote requests</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{statistics.overview.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-yellow-400">{statistics.overview.pending}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{statistics.overview.under_review}</div>
            <div className="text-sm text-slate-400">Under Review</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">{statistics.overview.quoted}</div>
            <div className="text-sm text-slate-400">Quoted</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">{statistics.overview.accepted}</div>
            <div className="text-sm text-slate-400">Accepted</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-emerald-400">{statistics.overview.converted}</div>
            <div className="text-sm text-slate-400">Converted</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by quote number, name, email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="converted_to_subscription">Converted</option>
          </select>
          <select
            value={filters.service_type}
            onChange={(e) => setFilters({ ...filters, service_type: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="">All Services</option>
            {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setFilters({ status: '', service_type: '', search: '' });
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quote #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Urgency</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No quote requests found
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-blue-400">{quote.quote_number}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {SERVICE_TYPE_LABELS[quote.service_type] || quote.service_type}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{quote.contact_name}</div>
                      <div className="text-sm text-slate-400">{quote.contact_email}</div>
                      {quote.company_name && (
                        <div className="text-sm text-slate-500">{quote.company_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_COLORS[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {formatPrice(quote.quoted_price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quote.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                        quote.urgency === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        quote.urgency === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {quote.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {formatDate(quote.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          View
                        </button>
                        {quote.status === 'pending' && (
                          <button
                            onClick={() => handleMarkUnderReview(quote.id)}
                            className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                          >
                            Review
                          </button>
                        )}
                        {(quote.status === 'pending' || quote.status === 'under_review') && (
                          <button
                            onClick={() => openQuoteModal(quote)}
                            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded"
                          >
                            Quote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-4 py-3 bg-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {((pagination.current_page - 1) * 15) + 1} to {Math.min(pagination.current_page * 15, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Details Modal */}
      {selectedQuote && !showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Quote Details</h2>
                  <p className="text-blue-400 font-mono">{selectedQuote.quote_number}</p>
                </div>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Status</label>
                    <p>
                      <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_COLORS[selectedQuote.status]}`}>
                        {STATUS_LABELS[selectedQuote.status]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Service Type</label>
                    <p className="text-white">{SERVICE_TYPE_LABELS[selectedQuote.service_type] || selectedQuote.service_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Contact Name</label>
                    <p className="text-white">{selectedQuote.contact_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <p className="text-white">{selectedQuote.contact_email}</p>
                  </div>
                </div>

                {selectedQuote.contact_phone && (
                  <div>
                    <label className="text-sm text-slate-400">Phone</label>
                    <p className="text-white">{selectedQuote.contact_phone}</p>
                  </div>
                )}

                {selectedQuote.company_name && (
                  <div>
                    <label className="text-sm text-slate-400">Company</label>
                    <p className="text-white">{selectedQuote.company_name}</p>
                  </div>
                )}

                {selectedQuote.general_info && Object.keys(selectedQuote.general_info).length > 0 && (
                  <div>
                    <label className="text-sm text-slate-400">Project Overview</label>
                    <div className="bg-slate-700 rounded p-3 mt-1">
                      {Object.entries(selectedQuote.general_info).map(([key, value]) => (
                        value && (
                          <div key={key} className="mb-2">
                            <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}: </span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuote.technical_requirements && Object.keys(selectedQuote.technical_requirements).length > 0 && (
                  <div>
                    <label className="text-sm text-slate-400">Technical Requirements</label>
                    <div className="bg-slate-700 rounded p-3 mt-1">
                      {Object.entries(selectedQuote.technical_requirements).map(([key, value]) => (
                        value && (
                          <div key={key} className="mb-2">
                            <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}: </span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Budget Range</label>
                    <p className="text-white">{selectedQuote.budget_range || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Timeline</label>
                    <p className="text-white">{selectedQuote.timeline || '-'}</p>
                  </div>
                </div>

                {selectedQuote.quoted_price && (
                  <div className="bg-purple-500/20 border border-purple-500/40 rounded p-4">
                    <label className="text-sm text-purple-400">Quoted Price</label>
                    <p className="text-2xl font-bold text-white">{formatPrice(selectedQuote.quoted_price)}</p>
                    {selectedQuote.admin_response && (
                      <div className="mt-2">
                        <label className="text-sm text-slate-400">Response:</label>
                        <p className="text-white">{selectedQuote.admin_response}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {(selectedQuote.status === 'pending' || selectedQuote.status === 'under_review') && (
                    <>
                      <button
                        onClick={() => handleMarkUnderReview(selectedQuote.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                      >
                        Mark Under Review
                      </button>
                      <button
                        onClick={() => openQuoteModal(selectedQuote)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                      >
                        Submit Quote
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Submit Quote</h2>
                  <p className="text-blue-400 font-mono text-sm">{selectedQuote.quote_number}</p>
                </div>
                <button
                  onClick={() => {
                    setShowQuoteModal(false);
                    setSelectedQuote(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quoted Price (KES) *
                  </label>
                  <input
                    type="number"
                    value={quoteForm.quoted_price}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quoted_price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Response Message to Customer *
                  </label>
                  <textarea
                    value={quoteForm.admin_response}
                    onChange={(e) => setQuoteForm({ ...quoteForm, admin_response: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Enter the message to include with the quote..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={quoteForm.staff_notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, staff_notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Internal notes (not visible to customer)..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmitQuote}
                    disabled={!quoteForm.quoted_price || !quoteForm.admin_response}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg"
                  >
                    Send Quote
                  </button>
                  <button
                    onClick={() => {
                      setShowQuoteModal(false);
                      setSelectedQuote(null);
                    }}
                    className="px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

