import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { clientsApi } from '@/services/clients';
import { Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Wifi, 
  CreditCard, 
  Ticket, 
  Package,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Building2,
  AlertCircle,
  Database,
  Globe,
  Mail,
  Settings,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  HardDrive,
  Cpu,
  Gauge,
  Zap,
  MapPin
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// Network Uptime Heat Map Component
const NetworkHeatMap = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Generate random uptime data (98-100%)
  const generateUptime = () => 98 + Math.random() * 2;
  
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <div className="w-10"></div>
        {hours.map(h => (
          <div key={h} className="flex-1 text-center text-xs text-gray-500">{h}</div>
        ))}
      </div>
      {days.map((day, dayIndex) => (
        <div key={day} className="flex items-center gap-1">
          <div className="w-10 text-xs text-gray-500">{day}</div>
          <div className="flex-1 flex gap-0.5">
            {hours.map(h => {
              const uptime = generateUptime();
              const color = uptime >= 99.5 ? 'bg-blue-500' : uptime >= 99 ? 'bg-blue-400' : uptime >= 98 ? 'bg-yellow-400' : 'bg-red-400';
              return (
                <div key={h} className={`flex-1 h-4 rounded-sm ${color} opacity-80`} title={`${day} ${h}:00 - ${uptime.toFixed(1)}%`}></div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Revenue Line Chart Component (simulated y=f(x))
const RevenueChart = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [1.2, 1.5, 1.8, 1.6, 2.0, 2.3, 2.1, 2.5, 2.8, 2.6, 3.0, 3.2];
  const maxVal = Math.max(...data);
  
  return (
    <div className="space-y-4">
      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>{maxVal}M</span>
          <span>{(maxVal/2).toFixed(1)}M</span>
          <span>0</span>
        </div>
        {/* Chart area */}
        <div className="ml-10 h-full flex items-end gap-1">
          {data.map((val, i) => {
            const height = (val / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-400">{months[i].slice(0,1)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm text-gray-500">Revenue Growth (in Millions KES)</span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { hasRole, isAuthenticated } = useAuth();
  
  // Access Control: Only allow admin users to access this dashboard
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!hasRole('admin')) {
    // Redirect non-admin users to their appropriate dashboard
    if (hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager'])) {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/client/dashboard" replace />;
  }
  
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingInvoices: 0,
    coverageAreas: 12,
    totalStaff: 0,
    churnRate: 2.3,
    avgRevenuePerUser: 0,
    totalUsers: 0,
    activeClients: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, clientRes] = await Promise.all([
          api.get('/v1/users/statistics'),
          clientsApi.statistics()
        ]);

        const userStats = userRes.data.data;
        const clientStats = clientRes.data.data;

        setStats({
          totalClients: userStats.clients || 0,
          totalUsers: userStats.total || 0,
          totalStaff: (userStats.staff || 0) + (userStats.admins || 0),
          activeClients: userStats.active || 0,
          activeSubscriptions: 0, // Fetch separately if needed
          monthlyRevenue: 0,
          annualRevenue: 0,
          openTickets: 0,
          resolvedTickets: 0,
          pendingInvoices: 0,
          coverageAreas: 12,
          churnRate: 2.3,
          avgRevenuePerUser: 0
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Quick actions for admin dashboard with blue/moroccan theme
  const quickActions = [
    { icon: Users, label: 'Staff Management', href: '/admin/staff', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/20' },
    { icon: Package, label: 'Products', href: '/admin/products', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-500/20' },
    { icon: Ticket, label: 'Subscriptions', href: '/admin/subscriptions', color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/20' },
    { icon: CreditCard, label: 'Quotes', href: '/admin/quotes', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20' },
    { icon: BarChart3, label: 'Coverage Zones', href: '/admin/coverage', color: 'from-purple-500 to-indigo-500', bgColor: 'bg-purple-500/20' },
    { icon: Database, label: 'Media Library', href: '/admin/media', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/20' },
    { icon: Layers, label: 'Roles & Permissions', href: '/admin/roles', color: 'from-blue-600 to-indigo-600', bgColor: 'bg-blue-600/20' },
    { icon: Settings, label: 'Categories', href: '/admin/categories', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-500/20' },
  ];

  // Additional quick actions for more modules
  const additionalActions = [
    { icon: Building2, label: 'Banners', href: '/admin/banners', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/20' },
    { icon: MapPin, label: 'Testimonials', href: '/admin/testimonials', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-500/20' },
    { icon: Mail, label: 'FAQs', href: '/admin/faqs', color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-500/20' },
    { icon: Globe, label: 'WhatsApp Messages', href: '/admin/whatsapp-messages', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20' },
  ];

  // Recent activities (mock data)
  const recentActivities = [
    { id: 1, action: 'New Subscription', description: 'John Doe subscribed to Fiber 100Mbps', time: '5 minutes ago', type: 'success' },
    { id: 2, action: 'Payment Received', description: 'KES 15,000 payment from Jane Smith', time: '1 hour ago', type: 'success' },
    { id: 3, action: 'Ticket Created', description: 'New support ticket #TKT-456 from corporate client', time: '2 hours ago', type: 'warning' },
    { id: 4, action: 'Account Activated', description: 'Business account for Tech Solutions Ltd activated', time: '3 hours ago', type: 'info' },
    { id: 5, action: 'Plan Updated', description: 'Fiber 200Mbps plan pricing updated', time: '5 hours ago', type: 'info' },
  ];

  // Revenue by plan
  const revenueByPlan = [
    { name: 'Fiber 50Mbps', percentage: 35, color: 'bg-blue-500' },
    { name: 'Fiber 100Mbps', percentage: 28, color: 'bg-indigo-500' },
    { name: 'Fiber 200Mbps', percentage: 18, color: 'bg-cyan-500' },
    { name: 'Others', percentage: 19, color: 'bg-gray-400' },
  ];

  // System status with icons
  const systemStatus = [
    { name: 'API Server', status: 'online', uptime: '99.9%', icon: Server },
    { name: 'Database', status: 'online', uptime: '99.8%', icon: HardDrive },
    { name: 'Email Service', status: 'online', uptime: '99.5%', icon: Mail },
    { name: 'Payment Gateway', status: 'online', uptime: '100%', icon: CreditCard },
    { name: 'Network Core', status: 'online', uptime: '99.99%', icon: Wifi },
    { name: 'CDN', status: 'online', uptime: '99.7%', icon: Globe },
  ];

  return (
    <DashboardLayout userType="admin">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">System Overview & Management</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-white/20 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-white/20 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-8">
          <p className="text-red-300">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Cards - Glassmorphic with Moroccan Blue Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Clients</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                  <p className="text-xs text-green-400 mt-1 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> +12% this month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">KES {(stats.monthlyRevenue / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-green-400 mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +15% vs last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <DollarSign className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Open Tickets</p>
              <p className="text-2xl font-bold text-white">{stats.openTickets}</p>
              <p className="text-xs text-orange-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> 5 high priority
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Ticket className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Churn Rate</p>
              <p className="text-2xl font-bold text-white">{stats.churnRate}%</p>
              <p className="text-xs text-green-400 mt-1 flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-1" /> -0.5% vs last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <TrendingDown className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/10`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Additional Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Content Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {additionalActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/10`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Network Uptime Heat Map */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-400" />
                Network Uptime Heat Map
              </h2>
              <span className="text-xs text-slate-500">Last 7 days</span>
            </div>
            <NetworkHeatMap />
          </div>

          {/* Revenue Analytics */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Revenue Growth (y = f(x))
              </h2>
              <Link to="/admin/reports" className="text-sm text-blue-400 hover:underline">Detailed Report</Link>
            </div>
            <RevenueChart />
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Annual Revenue</p>
                  <p className="text-xl font-bold text-white">KES {(stats.annualRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">ARPU</p>
                  <p className="text-xl font-bold text-white">KES {stats.avgRevenuePerUser.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Plan Bars */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h2>
            <div className="space-y-4">
              {revenueByPlan.map((plan, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-300">{plan.name}</span>
                    <span className="text-sm text-slate-500">{plan.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${plan.color}`} 
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* System Status */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              System Status
            </h2>
            <div className="space-y-3">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <system.icon className={`w-4 h-4 ${system.status === 'online' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-sm font-medium text-slate-300">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${system.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-500">{system.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-b border-white/10 last:border-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 
                    activity.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{activity.action}</p>
                    <p className="text-slate-400 text-sm">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/activity" className="block text-center text-sm text-blue-400 hover:underline mt-4">
              View All Activity
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600/30 to-indigo-600/30 backdrop-blur-md rounded-xl border border-white/20 p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">At a Glance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-300">Active Subs</p>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-300">Coverage Areas</p>
                <p className="text-xl font-bold">{stats.coverageAreas}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-300">Staff Members</p>
                <p className="text-xl font-bold">{stats.totalStaff}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-300">Resolved Tickets</p>
                <p className="text-xl font-bold">{stats.resolvedTickets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

