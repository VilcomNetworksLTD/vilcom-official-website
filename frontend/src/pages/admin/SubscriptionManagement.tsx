import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Eye,
  MoreVertical,
  Package,
  Wifi,
  DollarSign,
  Calendar,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  Pause,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Activity,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  subscriptionApi,
  adminSubscriptionApi,
  Subscription,
  SubscriptionStatus,
  BillingCycle,
  SubscriptionAnalytics,
} from '@/services/subscriptions';

// Status badge colors
const getStatusColor = (status: SubscriptionStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'suspended':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'cancelled':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'expired':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'trial':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

// Billing cycle label
const getBillingCycleLabel = (cycle: BillingCycle) => {
  switch (cycle) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'semi_annually':
      return 'Semi-Annual';
    case 'annually':
      return 'Annual';
    default:
      return cycle;
  }
};

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [billingCycleFilter, setBillingCycleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  useEffect(() => {
    loadSubscriptions();
    loadAnalytics();
  }, [searchQuery, statusFilter, billingCycleFilter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (billingCycleFilter) params.billing_cycle = billingCycleFilter;

      const response = await adminSubscriptionApi.list(params);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await adminSubscriptionApi.analytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await adminSubscriptionApi.activate(id);
      loadSubscriptions();
      loadAnalytics();
    } catch (error) {
      console.error('Failed to activate:', error);
    }
  };

  const handleSuspend = async (id: number) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      await adminSubscriptionApi.suspend(id, reason);
      loadSubscriptions();
      loadAnalytics();
    } catch (error) {
      console.error('Failed to suspend:', error);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await adminSubscriptionApi.reactivate(id);
      loadSubscriptions();
      loadAnalytics();
    } catch (error) {
      console.error('Failed to reactivate:', error);
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-slate-400">Manage client subscriptions and billing</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Grid3X3 className="w-4 h-4 inline-block mr-2" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Activity className="w-4 h-4 inline-block mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Subscriptions</p>
                  <p className="text-2xl font-bold text-white">{analytics.summary.active || 0}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                <span className="text-green-400">{analytics.summary.active || 0} active</span> ·{' '}
                <span className="text-yellow-400">{analytics.summary.pending || 0} pending</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.mrr || 0)}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                <span className="text-green-400">+{analytics.new_this_period || 0} new</span> this period
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Due Today</p>
                  <p className="text-2xl font-bold text-white">{analytics.due_today || 0}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                <span className="text-yellow-400">{analytics.due_this_week || 0} due this week</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Churn Rate</p>
                  <p className="text-2xl font-bold text-white">{analytics.churn_this_period || 0}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Cancelled this period
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subscription Status</h3>
              <div className="space-y-3">
                {Object.entries(analytics.summary).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(status as SubscriptionStatus)}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-white font-medium">{count as number || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">By Billing Cycle</h3>
              <div className="space-y-3">
                {analytics.by_billing_cycle.map((item) => (
                  <div key={item.billing_cycle} className="flex items-center justify-between">
                    <span className="text-slate-300">{getBillingCycleLabel(item.billing_cycle)}</span>
                    <div className="text-right">
                      <span className="text-white font-medium">{item.count}</span>
                      <span className="text-slate-400 ml-2">({formatCurrency(item.revenue)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions List Tab */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by subscription number or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="" className="bg-slate-900">All Status</option>
                <option value="active" className="bg-slate-900">Active</option>
                <option value="pending" className="bg-slate-900">Pending</option>
                <option value="suspended" className="bg-slate-900">Suspended</option>
                <option value="cancelled" className="bg-slate-900">Cancelled</option>
                <option value="expired" className="bg-slate-900">Expired</option>
                <option value="trial" className="bg-slate-900">Trial</option>
              </select>
              <select
                value={billingCycleFilter}
                onChange={(e) => setBillingCycleFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              >
                <option value="" className="bg-slate-900">All Cycles</option>
                <option value="monthly" className="bg-slate-900">Monthly</option>
                <option value="quarterly" className="bg-slate-900">Quarterly</option>
                <option value="semi_annually" className="bg-slate-900">Semi-Annual</option>
                <option value="annually" className="bg-slate-900">Annual</option>
              </select>
              <div className="flex rounded-lg border border-white/20 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    viewMode === 'grid' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    viewMode === 'list' ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">No subscriptions found</h3>
              <p className="text-slate-400">Subscriptions will appear here once clients sign up</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Subscription</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cycle</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Next Renewal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <h3 className="font-medium text-white">{sub.subscription_number || `#${sub.id}`}</h3>
                          <p className="text-sm text-slate-400">ID: {sub.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <h3 className="font-medium text-white">User #{sub.user_id}</h3>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <h3 className="font-medium text-white">{sub.product?.name || 'N/A'}</h3>
                          <p className="text-sm text-slate-400">{sub.product?.type || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">{formatCurrency(sub.total_amount)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 capitalize">{getBillingCycleLabel(sub.billing_cycle)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">
                          {sub.next_renewal_at ? formatDate(sub.next_renewal_at) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(sub)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {sub.status === 'pending' && (
                            <button
                              onClick={() => handleActivate(sub.id)}
                              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                              title="Activate"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleSuspend(sub.id)}
                              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-all"
                              title="Suspend"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          {(sub.status === 'suspended' || sub.status === 'cancelled') && (
                            <button
                              onClick={() => handleReactivate(sub.id)}
                              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                              title="Reactivate"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{sub.subscription_number || `#${sub.id}`}</h3>
                        <p className="text-sm text-slate-400">User #{sub.user_id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-slate-400">Plan</p>
                      <p className="font-medium text-white">{sub.product?.name || 'N/A'}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Amount</p>
                        <p className="text-xl font-bold text-blue-400">{formatCurrency(sub.total_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Cycle</p>
                        <p className="text-slate-300">{getBillingCycleLabel(sub.billing_cycle)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleViewDetails(sub)}
                        className="flex-1 py-2 text-sm bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Subscription Details
              </h3>
              <button
                onClick={() => setSelectedSubscription(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Subscription ID</span>
                <span className="text-white font-medium">{selectedSubscription.subscription_number || `#${selectedSubscription.id}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(selectedSubscription.status)}`}>
                  {selectedSubscription.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plan</span>
                <span className="text-white">{selectedSubscription.product?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Billing Cycle</span>
                <span className="text-white">{getBillingCycleLabel(selectedSubscription.billing_cycle)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-medium">{formatCurrency(selectedSubscription.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Period Start</span>
                <span className="text-white">{selectedSubscription.current_period_start ? formatDate(selectedSubscription.current_period_start) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Period End</span>
                <span className="text-white">{selectedSubscription.current_period_end ? formatDate(selectedSubscription.current_period_end) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Next Renewal</span>
                <span className="text-white">{selectedSubscription.next_renewal_at ? formatDate(selectedSubscription.next_renewal_at) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Auto Renew</span>
                <span className="text-white">{selectedSubscription.auto_renew ? 'Yes' : 'No'}</span>
              </div>

              {/* Active Add-ons */}
              {selectedSubscription.active_addons && selectedSubscription.active_addons.length > 0 && (
                <div className="border-t border-white/20 pt-4 mt-4">
                  <h4 className="font-medium text-white mb-2">Active Add-ons</h4>
                  <div className="space-y-2">
                    {selectedSubscription.active_addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                        <span className="text-slate-300">{addon.addon?.name || `Addon #${addon.addon_id}`}</span>
                        <span className="text-white">{formatCurrency(addon.total_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-white/20 pt-4 mt-4 flex gap-2">
                {selectedSubscription.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleActivate(selectedSubscription.id);
                      setSelectedSubscription(null);
                    }}
                    className="flex-1 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30"
                  >
                    Activate
                  </button>
                )}
                {selectedSubscription.status === 'active' && (
                  <button
                    onClick={() => {
                      handleSuspend(selectedSubscription.id);
                      setSelectedSubscription(null);
                    }}
                    className="flex-1 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30"
                  >
                    Suspend
                  </button>
                )}
                {(selectedSubscription.status === 'suspended' || selectedSubscription.status === 'cancelled') && (
                  <button
                    onClick={() => {
                      handleReactivate(selectedSubscription.id);
                      setSelectedSubscription(null);
                    }}
                    className="flex-1 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubscriptionManagement;

