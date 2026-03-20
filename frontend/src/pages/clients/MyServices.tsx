import { useState, useEffect } from 'react';
import { 
  Wifi, 
  Package, 
  Zap, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  Plus,
  Monitor,
  Shield,
  Smartphone,
  ChevronRight,
  RefreshCw,
  X,
  CreditCard,
  Download,
  TrendingUp,
  Settings,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { subscriptionApi, Subscription, SubscriptionStatus, BillingCycle } from '@/services/subscriptions';
import { productsApi, Product } from '@/services/products';
import { Link } from 'react-router-dom';

// Status Badge Component
const StatusBadge = ({ status }: { status: SubscriptionStatus }) => {
  const styles = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    suspended: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    expired: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pending_cancellation: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    pending_upgrade: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.cancelled}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Service Card Component
const ServiceCard = ({ subscription, onManage }: { subscription: Subscription; onManage: (s: Subscription) => void }) => {
  const isInternet = subscription.product?.type === 'internet_plan';
  
  return (
    <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Service Core Info */}
        <div className="flex items-start gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
            subscription.status === 'active' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-slate-500/20 border-slate-500/30'
          }`}>
            <Wifi className={`w-7 h-7 ${subscription.status === 'active' ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                {subscription.product?.name || 'Standard Service'}
              </h3>
              <StatusBadge status={subscription.status} />
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              {subscription.product?.type || 'Service'} 
              {subscription.variant && <span className="text-slate-500">• {subscription.variant.name}</span>}
              <span className="text-slate-600 ml-1">#{subscription.subscription_number}</span>
            </p>
          </div>
        </div>

        {/* Speed/Stats for Internet Plans */}
        {isInternet && subscription.status === 'active' && (
          <div className="flex items-center gap-8 px-6 border-x border-white/10">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Speed</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{subscription.product?.speed_mbps || 0}</span>
                <span className="text-slate-400 text-xs">Mbps</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Connection</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">Stable</span>
              </div>
            </div>
          </div>
        )}

        {/* Billing Info */}
        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Due</p>
            <p className="text-white font-bold text-lg">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(subscription.total_amount)}
            </p>
            <p className="text-slate-400 text-xs capitalize">{subscription.billing_cycle}</p>
          </div>
          <button 
            onClick={() => onManage(subscription)}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-amber-400 transition-all group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </button>
        </div>
      </div>

      {/* Footer Info: Expiry / Renewal */}
      <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-amber-500/60" />
            Next Renewal: <span className="text-white">{subscription.next_renewal_at ? new Date(subscription.next_renewal_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          {subscription.auto_renew && (
            <div className="flex items-center gap-2 text-slate-400">
              <RefreshCw className="w-4 h-4 text-emerald-500/60" />
              Auto-renew <span className="text-emerald-400 font-medium italic">Active</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {subscription.active_addons && subscription.active_addons.length > 0 && (
            <div className="flex -space-x-2">
              {subscription.active_addons.map((addon, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center" title={addon.addon.name}>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
              ))}
              <span className="text-xs text-slate-500 ml-4 self-center">+{subscription.active_addons.length} Add-ons</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyServices = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchData();
    // Scroll to available services if hash is present
    if (window.location.hash === '#available-services') {
      setTimeout(scrollToAvailable, 500); // Wait for load
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, prodRes] = await Promise.all([
        subscriptionApi.list(),
        productsApi.getAll({ is_active: true })
      ]);
      setSubscriptions(subRes.data || []);
      setAvailableProducts(prodRes || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Unable to load your services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToAvailable = () => {
    document.getElementById('available-services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DashboardLayout userType="client">
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">My Services</h1>
            <p className="text-slate-400 text-lg">Manage and monitor your active internet and tech services.</p>
          </div>
          <button 
            onClick={scrollToAvailable}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-5 h-5" />
            Add New Service
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-500/20 border border-rose-500/40 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-4">{error}</p>
            <button onClick={fetchData} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Retry</button>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
              <Package className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" id="available-services">No Active Services</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              It looks like you haven't subscribed to any services yet. Check out our high-speed fiber internet plans to get started.
            </p>
            <button onClick={scrollToAvailable} className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-amber-500 hover:text-white transition-all">
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <ServiceCard key={sub.id} subscription={sub} onManage={setSelectedSub} />
            ))}
          </div>
        )}

        {/* Upgrade / Explore Section */}
        {!loading && availableProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-white/5" id="available-services">
            <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                <PlusCircle className="w-6 h-6 text-amber-500" />
              </div>
              Explore Available Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableProducts.map((product) => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/40 transition-all group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-all">
                    <Zap className="w-6 h-6 text-slate-400 group-hover:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-white font-bold">
                      {product.price_monthly ? `KES ${product.price_monthly}/mo` : 'Custom Quote'}
                    </span>
                    <Link to={`/signup/${product.id}`} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail/Manage Slide-over/Modal would go here */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-2xl font-bold text-white">Manage {selectedSub.product?.name}</h3>
              <button 
                onClick={() => setSelectedSub(null)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <p className="text-slate-500 text-xs uppercase mb-1">Status</p>
                    <StatusBadge status={selectedSub.status} />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <p className="text-slate-500 text-xs uppercase mb-1">Billing Cycle</p>
                    <p className="text-white font-bold capitalize">{selectedSub.billing_cycle}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-rose-400">
                    <p className="text-slate-500 text-xs uppercase mb-1">Current Balance Due</p>
                    <p className="text-2xl font-black">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(selectedSub.total_amount)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <p className="text-slate-500 text-xs uppercase mb-1">Renewal Date</p>
                    <p className="text-white font-bold">
                      {selectedSub.next_renewal_at ? new Date(selectedSub.next_renewal_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                 <button className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20">
                   Pay Now & Renew
                 </button>
                 <div className="grid grid-cols-2 gap-3">
                   <Link to="/plans" className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-center text-white font-bold rounded-2xl transition-all">
                     Change Plan
                   </Link>
                   <button className="py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-2xl transition-all">
                     Request Cancellation
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyServices;

// Additional Icons components
const PlusCircle = Plus;
