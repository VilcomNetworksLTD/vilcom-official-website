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
  DollarSign,
  Activity,
  BarChart3,
  Building2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const StaffDashboard = () => {
  const { hasRole } = useAuth();
  
  // Determine userType from auth context
  const userType = hasRole('admin') ? 'admin' : hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager']) ? 'staff' : 'client';
  
  const [stats] = useState({
    totalClients: 156,
    activeSubscriptions: 142,
    monthlyRevenue: 2450000,
    openTickets: 28,
  });

  // Quick actions for staff dashboard
  const quickActions = [
    { icon: Users, label: 'Manage Clients', href: '/admin/clients', color: 'bg-blue-500' },
    { icon: Package, label: 'Manage Plans', href: '/admin/plans', color: 'bg-purple-500' },
    { icon: Ticket, label: 'Support Tickets', href: '/admin/tickets', color: 'bg-orange-500' },
    { icon: CreditCard, label: 'Invoices', href: '/admin/invoices', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports', color: 'bg-cyan-500' },
    { icon: Building2, label: 'Coverage', href: '/admin/coverage', color: 'bg-indigo-500' },
  ];

  // Recent activities (mock data)
  const recentActivities = [
    { id: 1, action: 'New Subscription', description: 'John Doe subscribed to Fiber 100Mbps', time: '5 minutes ago', type: 'success' },
    { id: 2, action: 'Payment Received', description: 'KES 15,000 payment from Jane Smith', time: '1 hour ago', type: 'success' },
    { id: 3, action: 'Ticket Created', description: 'New support ticket #TKT-456 from corporate client', time: '2 hours ago', type: 'warning' },
    { id: 4, action: 'Account Activated', description: 'Business account for Tech Solutions Ltd activated', time: '3 hours ago', type: 'info' },
  ];

  // Top performing plans
  const topPlans = [
    { name: 'Fiber 50Mbps', subscribers: 89, revenue: 311500 },
    { name: 'Fiber 100Mbps', subscribers: 42, revenue: 630000 },
    { name: 'Fiber 200Mbps', subscribers: 18, revenue: 360000 },
    { name: 'Home Basic 10Mbps', subscribers: 34, revenue: 102000 },
  ];

  return (
    <DashboardLayout userType="staff">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your operations.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
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
              <p className="text-sm text-gray-500 mb-1">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +8% this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">KES {(stats.monthlyRevenue / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +15% this month
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Top Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

          {/* Top Plans */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Performing Plans</h2>
              <Link to="/admin/plans" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subscribers</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlans.map((plan, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Wifi className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{plan.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{plan.subscribers}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">KES {plan.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
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

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">Pending Invoices</span>
                </div>
                <span className="font-bold text-orange-600">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Open Tickets</span>
                </div>
                <span className="font-bold text-blue-600">28</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">New Clients</span>
                </div>
                <span className="font-bold text-green-600">+12</span>
              </div>
            </div>
            <Link to="/admin/tasks" className="block text-center text-sm text-blue-600 hover:underline mt-4">
              View All Tasks
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;

