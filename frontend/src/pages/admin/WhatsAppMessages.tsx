import { useState, useEffect } from 'react';
import whatsappService, { WhatsAppMessage, type WhatsAppOption } from '@/services/whatsapp';

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  converted: 'bg-green-500/20 text-green-400 border-green-500/40',
  failed: 'bg-red-500/20 text-red-400 border-red-500/40',
};

// Status labels
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  converted: 'Converted',
  failed: 'Failed',
};

// Message type labels
const MESSAGE_TYPE_LABELS: Record<string, string> = {
  predefined: 'Predefined',
  custom: 'Custom',
};

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    message_type: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  useEffect(() => {
    loadMessages();
    loadStatistics();
  }, [filters, pagination.current_page]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.current_page,
        per_page: 15,
      };
      if (filters.status) params.status = filters.status;
      if (filters.message_type) params.message_type = filters.message_type;
      if (filters.search) params.search = filters.search;

      const response = await whatsappService.getMessages(params);
      const result = response.data;
      setMessages(result.data);
      setPagination({
        current_page: result.meta.current_page,
        last_page: result.meta.last_page,
        total: result.meta.total,
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await whatsappService.getStatistics();
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleMarkContacted = async (id: number) => {
    try {
      await whatsappService.markContacted(id);
      loadMessages();
      loadStatistics();
    } catch (error) {
      console.error('Failed to mark contacted:', error);
    }
  };

  const handleMarkConverted = async (id: number) => {
    try {
      await whatsappService.markConverted(id);
      loadMessages();
      loadStatistics();
    } catch (error) {
      console.error('Failed to mark converted:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await whatsappService.deleteMessage(id);
      loadMessages();
      loadStatistics();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
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

  const getWhatsAppUrl = (phone: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">WhatsApp Messages</h1>
        <p className="text-slate-400">Track and manage WhatsApp chat leads</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{statistics.overview.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-yellow-400">{statistics.overview.pending}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{statistics.overview.contacted}</div>
            <div className="text-sm text-slate-400">Contacted</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">{statistics.overview.converted}</div>
            <div className="text-sm text-slate-400">Converted</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-red-400">{statistics.overview.failed}</div>
            <div className="text-sm text-slate-400">Failed</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">{statistics.overview.this_month}</div>
            <div className="text-sm text-slate-400">This Month</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-cyan-400">{statistics.overview.conversion_rate}%</div>
            <div className="text-sm text-slate-400">Conversion</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, phone, message..."
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
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filters.message_type}
            onChange={(e) => setFilters({ ...filters, message_type: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="">All Types</option>
            <option value="predefined">Predefined</option>
            <option value="custom">Custom</option>
          </select>
          <button
            onClick={() => {
              setFilters({ status: '', message_type: '', search: '' });
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Message</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Page</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No WhatsApp messages found
                  </td>
                </tr>
              ) : (
                messages.map((message, index) => (
                  <tr key={message.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-slate-400">
                      {(pagination.current_page - 1) * 15 + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">{message.name || '-'}</div>
                      {message.user && (
                        <div className="text-xs text-slate-500">User ID: {message.user.id}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {message.phone && (
                        <a
                          href={getWhatsAppUrl(message.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                          {message.phone}
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      )}
                      {message.email && (
                        <div className="text-sm text-slate-400">{message.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white max-w-xs truncate">{message.message}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        message.message_type === 'predefined' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {MESSAGE_TYPE_LABELS[message.message_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_COLORS[message.status]}`}>
                        {STATUS_LABELS[message.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={message.page_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs truncate max-w-[150px] block"
                        title={message.page_url || ''}
                      >
                        {message.page_url ? new URL(message.page_url).pathname : '-'}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          View
                        </button>
                        {message.status === 'pending' && (
                          <button
                            onClick={() => handleMarkContacted(message.id)}
                            className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                          >
                            Contact
                          </button>
                        )}
                        {message.status === 'contacted' && (
                          <button
                            onClick={() => handleMarkConverted(message.id)}
                            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            Convert
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

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Message Details</h2>
                  <p className="text-slate-400 text-sm">ID: #{selectedMessage.id}</p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-slate-400">Status</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[selectedMessage.status]}`}>
                        {STATUS_LABELS[selectedMessage.status]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Message Type</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedMessage.message_type === 'predefined' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {MESSAGE_TYPE_LABELS[selectedMessage.message_type]}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Name</label>
                    <p className="text-white">{selectedMessage.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <p className="text-white">{selectedMessage.email || '-'}</p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-slate-400">Phone</label>
                  <div className="flex items-center gap-2">
                    <p className="text-white">{selectedMessage.phone || '-'}</p>
                    {selectedMessage.phone && (
                      <a
                        href={getWhatsAppUrl(selectedMessage.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Open WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm text-slate-400">Message</label>
                  <div className="bg-slate-700 rounded p-3 mt-1">
                    <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Page URL */}
                <div>
                  <label className="text-sm text-slate-400">Page Origin</label>
                  <p className="text-white">
                    {selectedMessage.page_url ? (
                      <a
                        href={selectedMessage.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {selectedMessage.page_url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>

                {/* IP & User Agent */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">IP Address</label>
                    <p className="text-white font-mono text-sm">{selectedMessage.ip_address || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Created</label>
                    <p className="text-white">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  {selectedMessage.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleMarkContacted(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                    >
                      Mark as Contacted
                    </button>
                  )}
                  {selectedMessage.status === 'contacted' && (
                    <button
                      onClick={() => {
                        handleMarkConverted(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Mark as Converted
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
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
    </div>
  );
}

