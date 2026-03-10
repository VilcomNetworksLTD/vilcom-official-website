import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wifi, 
  CreditCard, 
  Ticket, 
  Package,
  ChevronRight,
  Activity,
  Zap,
  AlertCircle,
  Clock,
  Download,
  TrendingUp,
  Radio
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// Circular gauge component for data usage
const CircularGauge = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{percentage}%</span>
        <span className="text-slate-400 text-sm">Used</span>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { hasRole } = useAuth();
  
  // Determine userType from auth context
  const userType = hasRole('admin') ? 'admin' : hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager']) ? 'staff' : 'client';
  
  const [stats] = useState({
    dataUsed: 45.2,
    dataLimit: 100,
    activeSubscriptions: 1,
    pendingInvoices: 2,
    openTickets: 3,
    downloadSpeed: 50,
    uploadSpeed: 25,
    ping: 12
  });

  const dataUsagePercentage = Math.round((stats.dataUsed / stats.dataLimit) * 100);

  // Quick actions for client dashboard with golden/yellow theme
  const quickActions = [
    { icon: Wifi, label: 'My Services', href: '/client/subscriptions', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-500/20' },
    { icon: CreditCard, label: 'Pay Bills', href: '/client/subscriptions', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-500/20' },
    { icon: Ticket, label: 'Support Ticket', href: '/client/subscriptions', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/20' },
    { icon: Package, label: 'Upgrade Plan', href: '/plans', color: 'from-amber-600 to-yellow-600', bgColor: 'bg-amber-600/20' },
  ];

  // Recent activities (mock data)
  const recentActivities = [
    { id: 1, action: 'Payment Received', description: 'Invoice #INV-2024-001 paid successfully', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Ticket Updated', description: 'Your support ticket #TKT-123 was replied to', time: '1 day ago', type: 'info' },
    { id: 3, action: 'Service Activated', description: 'Fiber 50Mbps plan activated', time: '3 days ago', type: 'success' },
  ];

  return (
    <DashboardLayout userType="client">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's your account overview.</p>
      </div>

      {/* Stats Cards - Glassmorphic with Golden Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Services */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Active Services</p>
              <p className="text-3xl font-bold text-white">{stats.activeSubscriptions}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border border-amber-500/30">
              <Wifi className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <Link to="/client/services" className="text-sm text-amber-400 hover:text-amber-300 mt-3 inline-flex items-center">
            View details <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Pending Invoices</p>
              <p className="text-3xl font-bold text-white">{stats.pendingInvoices}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center border border-orange-500/30">
              <CreditCard className="w-7 h-7 text-orange-400" />
            </div>
          </div>
          <Link to="/client/invoices" className="text-sm text-orange-400 hover:text-orange-300 mt-3 inline-flex items-center">
            Pay now <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Open Tickets */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Open Tickets</p>
              <p className="text-3xl font-bold text-white">{stats.openTickets}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center border border-yellow-500/30">
              <Ticket className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
          <Link to="/client/tickets" className="text-sm text-yellow-400 hover:text-yellow-300 mt-3 inline-flex items-center">
            View tickets <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Connection</p>
              <p className="text-3xl font-bold text-green-400">Online</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center border border-green-500/30">
              <Radio className="w-7 h-7 text-green-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-green-400">● Live</span>
            <span className="text-xs text-slate-500">• {stats.ping}ms ping</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Usage Gauge - Hero Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Data Usage</h2>
              <span className="text-slate-400 text-sm">{stats.dataUsed} GB / {stats.dataLimit} GB</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <CircularGauge percentage={dataUsagePercentage} color="#F59E0B" />
              <div className="flex-1 space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </span>
                    <span className="text-white font-semibold">{stats.downloadSpeed} Mbps</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Upload
                    </span>
                    <span className="text-white font-semibold">{stats.uploadSpeed} Mbps</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/10`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Current Plan */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
              <Link to="/plans" className="text-sm text-amber-400 hover:text-amber-300">Upgrade</Link>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">Fiber 50Mbps</p>
                  <p className="text-slate-400">KES 3,500/month</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">Active</span>
                <Link to="/client/services" className="p-2 text-slate-400 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Pay */}
          <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Pay</h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-slate-300">
                <span>Current Balance</span>
                <span className="font-semibold text-white">KES 2,500</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Due Date</span>
                <span className="font-semibold text-white">Feb 15, 2025</span>
              </div>
            </div>
            <Link
              to="/client/invoices"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25"
            >
              <CreditCard className="w-5 h-5" />
              Pay Now
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-b border-white/10 last:border-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{activity.action}</p>
                    <p className="text-slate-400 text-sm">{activity.description}</p>
                    <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/client/activity" className="block text-center text-sm text-amber-400 hover:text-amber-300 mt-4">
              View All Activity
            </Link>
          </div>

          {/* Account Status */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member Since</span>
                <span className="text-white font-medium">{new Date().getFullYear()}</span>
              </div>
            </div>
            <Link to="/client/settings" className="block text-center text-sm text-amber-400 hover:text-amber-300 mt-4">
              Manage Account
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

