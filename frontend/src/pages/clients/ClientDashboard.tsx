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
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const ClientDashboard = () => {
  const { hasRole } = useAuth();
  
  // Determine userType from auth context
  const userType = hasRole('admin') ? 'admin' : hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager']) ? 'staff' : 'client';
  
  const [stats] = useState({
    activeSubscriptions: 1,
    pendingInvoices: 2,
    openTickets: 3,
    dataUsed: '45.2 GB'
  });

  // Quick actions for client dashboard
  const quickActions = [
    { icon: Wifi, label: 'My Services', href: '/client/services', color: 'bg-blue-500' },
    { icon: CreditCard, label: 'Pay Bills', href: '/client/invoices', color: 'bg-green-500' },
    { icon: Ticket, label: 'Support Ticket', href: '/client/tickets', color: 'bg-purple-500' },
    { icon: Package, label: 'Upgrade Plan', href: '/plans', color: 'bg-orange-500' },
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
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your account.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link to="/client/services" className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center">
            View details <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <Link to="/client/invoices" className="text-sm text-orange-600 hover:underline mt-2 inline-flex items-center">
            Pay now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link to="/client/tickets" className="text-sm text-purple-600 hover:underline mt-2 inline-flex items-center">
            View tickets <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Data Used</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dataUsed}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Link to="/client/usage" className="text-sm text-green-600 hover:underline mt-2 inline-flex items-center">
            View usage <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Active Services */}
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
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Services</h2>
              <Link to="/client/services" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Fiber 50Mbps</p>
                    <p className="text-sm text-gray-500">Plan • KES 3,500/month</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span>
                  <Link to="/client/services" className="p-2 text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
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
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/client/activity" className="block text-center text-sm text-blue-600 hover:underline mt-4">
              View All Activity
            </Link>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900 font-medium">{new Date().getFullYear()}</span>
              </div>
            </div>
            <Link to="/client/settings" className="block text-center text-sm text-blue-600 hover:underline mt-4">
              Manage Account
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

