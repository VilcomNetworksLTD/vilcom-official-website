import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowDownRight
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { hasRole } = useAuth();
  
  // Determine userType from auth context - use admin dashboard for admins, staff for staff, client for clients
  const userType = hasRole('admin') ? 'admin' : hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager']) ? 'staff' : 'client';
  
  const [stats] = useState({
    totalClients: 156,
    activeSubscriptions: 142,
    monthlyRevenue: 2450000,
    annualRevenue: 29400000,
    openTickets: 28,
    resolvedTickets: 892,
    pendingInvoices: 45,
    coverageAreas: 12,
    totalStaff: 18,
    churnRate: 2.3,
    avgRevenuePerUser: 15705
  });

  // Quick actions for admin dashboard
  const quickActions = [
    { icon: Users, label: 'All Users', href: '/admin/users', color: 'bg-blue-500' },
    { icon: Package, label: 'Plans & Pricing', href: '/admin/plans', color: 'bg-purple-500' },
    { icon: Ticket, label: 'All Tickets', href: '/admin/tickets', color: 'bg-orange-500' },
    { icon: CreditCard, label: 'Invoices', href: '/admin/invoices', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports', color: 'bg-cyan-500' },
    { icon: Database, label: 'Backups', href: '/admin/backups', color: 'bg-red-500' },
    { icon: Settings, label: 'Settings', href: '/admin/settings', color: 'bg-gray-500' },
    { icon: Layers, label: 'Roles & Permissions', href: '/admin/roles', color: 'bg-indigo-500' },
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
    { name: 'Fiber 100Mbps', percentage: 28, color: 'bg-purple-500' },
    { name: 'Fiber 200Mbps', percentage: 18, color: 'bg-green-500' },
    { name: 'Others', percentage: 19, color: 'bg-gray-400' },
  ];

  // System status
  const systemStatus = [
    { name: 'API Server', status: 'online', uptime: '99.9%' },
    { name: 'Database', status: 'online', uptime: '99.8%' },
    { name: 'Email Service', status: 'online', uptime: '99.5%' },
    { name: 'Payment Gateway', status: 'online', uptime: '100%' },
  ];

  return (
    <DashboardLayout userType="admin">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System Overview & Management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12% this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">KES {(stats.monthlyRevenue / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +15% vs last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
              <p className="text-xs text-orange-600 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> 5 high priority
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.churnRate}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-1" /> -0.5% vs last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Revenue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue by Plan</h2>
              <Link to="/admin/reports" className="text-sm text-blue-600 hover:underline">Detailed Report</Link>
            </div>
            <div className="space-y-4">
              {revenueByPlan.map((plan, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{plan.name}</span>
                    <span className="text-sm text-gray-500">{plan.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${plan.color}`} 
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Annual Revenue</p>
                  <p className="text-xl font-bold text-gray-900">KES {(stats.annualRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ARPU</p>
                  <p className="text-xl font-bold text-gray-900">KES {stats.avgRevenuePerUser.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${system.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{system.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{system.uptime}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 
                    activity.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/activity" className="block text-center text-sm text-blue-600 hover:underline mt-4">
              View All Activity
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">At a Glance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Active Subs</p>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Coverage Areas</p>
                <p className="text-xl font-bold">{stats.coverageAreas}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Staff Members</p>
                <p className="text-xl font-bold">{stats.totalStaff}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-100">Resolved Tickets</p>
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

