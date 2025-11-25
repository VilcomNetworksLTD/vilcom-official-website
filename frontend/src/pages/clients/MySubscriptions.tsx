import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Package,
  Wifi,
  DollarSign,
  Calendar,
  Clock,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  CreditCard,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  ChevronRight,
  Activity,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  subscriptionApi,
  Subscription,
  SubscriptionStatus,
  BillingCycle,
  ProrationPreview,
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

const ClientSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await subscriptionApi.list();
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedSubscription || !cancelReason) return;

    try {
      await subscriptionApi.cancel(selectedSubscription.id, {
        reason: cancelReason as any,
        at_period_end: cancelAtPeriodEnd,
      });
      setShowCancelModal(false);
      setSelectedSubscription(null);
      setCancelReason('');
      loadSubscriptions();
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await subscriptionApi.reactivate(id);
      loadSubscriptions();
    } catch (error) {
      console.error('Failed to reactivate:', error);
    }
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

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <DashboardLayout userType="client">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
        <p className="text-slate-400">Manage your internet service subscriptions</p>
      </div>

      {/* Active Subscription Summary */}
      {subscriptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Monthly Cost</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    subscriptions
                      .filter(s => s.status === 'active')
                      .reduce((sum, s) => sum + s.total_amount, 0)
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Next Renewal</p>
                <p className="text-2xl font-bold text-white">
                  {subscriptions.find(s => s.status === 'active' && s.next_renewal_at)
                    ? getDaysRemaining(subscriptions.find(s => s.status === 'active' && s.next_renewal_at)!.next_renewal_at!)
                    : 0} days
                </p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No subscriptions yet</h3>
          <p className="text-slate-400 mb-4">Browse our internet plans and subscribe to get started</p>
          <a
            href="/plans"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30"
          >
            <Wifi className="w-4 h-4" />
            View Plans
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Plan Info */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Wifi className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {subscription.product?.name || 'Internet Plan'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {subscription.product?.type || 'Internet Service'}
                      {subscription.variant && ` - ${subscription.variant.name}`}
                    </p>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Billing Cycle</p>
                    <p className="text-white font-medium">{getBillingCycleLabel(subscription.billing_cycle)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Amount</p>
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(subscription.total_amount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Next Renewal</p>
                    <p className="text-white font-medium">
                      {subscription.next_renewal_at ? formatDate(subscription.next_renewal_at) : 'N/A'}
                    </p>
                    {subscription.next_renewal_at && subscription.status === 'active' && (
                      <p className="text-xs text-slate-400">
                        {getDaysRemaining(subscription.next_renewal_at)} days remaining
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSubscription(subscription)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {(subscription.status === 'suspended' || subscription.status === 'cancelled') && (
                    <button
                      onClick={() => handleReactivate(subscription.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reactivate
                    </button>
                  )}
                  {subscription.status === 'active' && (
                    <button
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setShowCancelModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Active Add-ons */}
              {subscription.active_addons && subscription.active_addons.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-slate-400 text-sm mb-2">Active Add-ons:</p>
                  <div className="flex flex-wrap gap-2">
                    {subscription.active_addons.map((addon) => (
                      <span
                        key={addon.id}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300"
                      >
                        {addon.addon?.name || `Addon #${addon.addon_id}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Subscription Details Modal */}
      {selectedSubscription && !showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Subscription Details</h3>
              <button
                onClick={() => setSelectedSubscription(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plan</span>
                <span className="text-white font-medium">{selectedSubscription.product?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(selectedSubscription.status)}`}>
                  {selectedSubscription.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Billing Cycle</span>
                <span className="text-white">{getBillingCycleLabel(selectedSubscription.billing_cycle)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Base Price</span>
                <span className="text-white">{formatCurrency(selectedSubscription.base_price)}</span>
              </div>
              {selectedSubscription.addons_total > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Add-ons</span>
                  <span className="text-white">+{formatCurrency(selectedSubscription.addons_total)}</span>
                </div>
              )}
              {selectedSubscription.discount_amount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-green-400">-{formatCurrency(selectedSubscription.discount_amount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-white font-medium">Total</span>
                <span className="text-xl font-bold text-blue-400">{formatCurrency(selectedSubscription.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Period</span>
                <span className="text-white">
                  {selectedSubscription.current_period_start ? formatDate(selectedSubscription.current_period_start) : 'N/A'} -{' '}
                  {selectedSubscription.current_period_end ? formatDate(selectedSubscription.current_period_end) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Auto Renew</span>
                <span className="text-white">{selectedSubscription.auto_renew ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Cancel Subscription</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSubscription(null);
                  setCancelReason('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400">
                Are you sure you want to cancel your subscription to{' '}
                <span className="text-white font-medium">{selectedSubscription.product?.name}</span>?
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                >
                  <option value="" className="bg-slate-900">Select a reason</option>
                  <option value="too_expensive" className="bg-slate-900">Too expensive</option>
                  <option value="switching_provider" className="bg-slate-900">Switching to another provider</option>
                  <option value="no_longer_needed" className="bg-slate-900">No longer needed</option>
                  <option value="poor_service" className="bg-slate-900">Poor service quality</option>
                  <option value="moving_area" className="bg-slate-900">Moving to another area</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cancelAtPeriodEnd}
                  onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10"
                />
                <span className="text-slate-300">Cancel at end of billing period</span>
              </label>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedSubscription(null);
                    setCancelReason('');
                  }}
                  className="flex-1 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/10 transition-all"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientSubscriptions;

