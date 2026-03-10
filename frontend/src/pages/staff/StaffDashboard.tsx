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
  AlertCircle,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  Phone,
  Map,
  Globe,
  Mail,
  Database
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// Ticket Card Component with color-coded status
const TicketCard = ({ ticket }: { ticket: any }) => {
  const statusColors = {
    urgent: 'bg-red-500/10 border-red-500/20 hover:border-red-500/40',
    pending: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
    in_progress: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
    completed: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40',
  };
  
  const statusIcons = {
    urgent: <XCircle className="w-4 h-4 text-red-400" />,
    pending: <Clock className="w-4 h-4 text-orange-400" />,
    in_progress: <Wrench className="w-4 h-4 text-blue-400" />,
    completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  };

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all hover:shadow-lg ${statusColors[ticket.status as keyof typeof statusColors] || statusColors.pending}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusIcons[ticket.status as keyof typeof statusIcons] || statusIcons.pending}
          <span className="font-medium text-white text-sm">{ticket.id}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          ticket.status === 'urgent' ? 'bg-red-500/20 text-red-400' :
          ticket.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
          'bg-orange-500/20 text-orange-400'
        }`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-2">{ticket.title}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {ticket.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {ticket.time}
        </span>
      </div>
    </div>
  );
};

// Performance Score Component
const PerformanceScore = ({ score }: { score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${score * 2.83} 283`}
          className={`${getScoreColor(score)} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-slate-400">Score</span>
      </div>
    </div>
  );
};

const StaffDashboard = () => {
  const { hasRole } = useAuth();
  
  // Determine userType from auth context
  const userType = hasRole('admin') ? 'admin' : hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager']) ? 'staff' : 'client';
  
  const [stats] = useState({
    totalClients: 156,
    activeSubscriptions: 142,
    monthlyRevenue: 2450000,
    openTickets: 28,
    performanceScore: 87,
    completedToday: 12,
    avgResponseTime: '18 min'
  });

  // Quick actions for staff dashboard with blue/moroccan theme
  const quickActions = [
    { icon: Users, label: 'Manage Clients', href: '/admin/staff', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/20' },
    { icon: Package, label: 'Products', href: '/admin/products', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-500/20' },
    { icon: Ticket, label: 'Subscriptions', href: '/admin/subscriptions', color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/20' },
    { icon: CreditCard, label: 'Quotes', href: '/admin/quotes', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20' },
    { icon: BarChart3, label: 'Coverage', href: '/admin/coverage', color: 'from-purple-500 to-indigo-500', bgColor: 'bg-purple-500/20' },
    { icon: Building2, label: 'Media', href: '/admin/media', color: 'from-blue-600 to-indigo-600', bgColor: 'bg-blue-600/20' },
  ];

  // Additional staff actions
  const additionalActions = [
    { icon: Globe, label: 'WhatsApp', href: '/admin/whatsapp-messages', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20' },
    { icon: Mail, label: 'FAQs', href: '/admin/faqs', color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-500/20' },
    { icon: MapPin, label: 'Testimonials', href: '/admin/testimonials', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-500/20' },
    { icon: Database, label: 'Categories', href: '/admin/categories', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/20' },
  ];

  // Assigned tickets with different statuses
  const assignedTickets = [
    { id: '#TKT-456', title: 'Internet down in Westlands', status: 'urgent', location: 'Westlands', time: '10 min ago' },
    { id: '#TKT-457', title: 'Installation request - Karen', status: 'in_progress', location: 'Karen', time: '25 min ago' },
    { id: '#TKT-458', title: 'Slow connection complaint', status: 'pending', location: 'Kilimani', time: '1 hour ago' },
    { id: '#TKT-459', title: 'Router configuration', status: 'completed', location: 'CBD', time: '2 hours ago' },
    { id: '#TKT-460', title: 'New fiber line setup', status: 'pending', location: 'Runda', time: '3 hours ago' },
  ];

  // Top performing plans
  const topPlans = [
    { name: 'Fiber 50Mbps', subscribers: 89, revenue: 311500 },
    { name: 'Fiber 100Mbps', subscribers: 42, revenue: 630000 },
    { name: 'Fiber 200Mbps', subscribers: 18, revenue: 360000 },
    { name: 'Home Basic 10Mbps', subscribers: 34, revenue: 102000 },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, action: 'Ticket Resolved', description: 'Completed #TKT-455 installation', time: '10 min ago', type: 'success' },
    { id: 2, action: 'Payment Collected', description: 'KES 15,000 from Jane Smith', time: '1 hour ago', type: 'success' },
    { id: 3, action: 'New Ticket', description: 'Created #TKT-460 for Runda client', time: '2 hours ago', type: 'warning' },
    { id: 4, action: 'Client Meeting', description: 'Follow-up with Tech Solutions Ltd', time: '3 hours ago', type: 'info' },
  ];

  return (
    <DashboardLayout userType="staff">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your operations overview.</p>
      </div>

      {/* Stats Cards - Glassmorphic with Blue Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
              <p className="text-xs text-green-400 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Users className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-white">{stats.activeSubscriptions}</p>
              <p className="text-xs text-green-400 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +8% this month
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Wifi className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Open Tickets</p>
              <p className="text-3xl font-bold text-white">{stats.openTickets}</p>
              <p className="text-xs text-orange-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> 5 high priority
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Ticket className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Completed Today</p>
              <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
              <p className="text-xs text-green-400 mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> Great work!
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <Activity className="w-7 h-7 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/10`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Content Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {additionalActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/10`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Assigned Tickets - Color Coded */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Assigned Tickets</h2>
              <Link to="/admin/tickets" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {assignedTickets.map((ticket, index) => (
                <TicketCard key={index} ticket={ticket} />
              ))}
            </div>
          </div>

          {/* Top Plans */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Top Performing Plans</h2>
              <Link to="/admin/plans" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Subscribers</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlans.map((plan, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Wifi className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="font-medium text-white">{plan.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{plan.subscribers}</td>
                      <td className="py-3 px-4 text-white font-medium">KES {plan.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Map Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-blue-400" />
              Live Map
            </h2>
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl h-48 flex items-center justify-center border border-white/10">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300">View active jobs</p>
                <p className="text-xs text-slate-500">5 technicians in field</p>
              </div>
            </div>
            <Link to="/admin/map" className="block text-center text-sm text-blue-400 hover:underline mt-3">
              Open Full Map
            </Link>
          </div>

          {/* Technician Performance */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Performance Score
            </h2>
            <div className="flex flex-col items-center">
              <PerformanceScore score={stats.performanceScore} />
              <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-xs text-slate-400">Avg Response</p>
                  <p className="font-semibold text-white">{stats.avgResponseTime}</p>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs text-slate-400">Satisfaction</p>
                  <p className="font-semibold text-white">4.8/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
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

          {/* Quick Contact */}
          <div className="bg-gradient-to-br from-blue-600/30 to-indigo-600/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Quick Support
            </h2>
            <p className="text-blue-200 text-sm mb-4">Need help? Contact the support team instantly.</p>
            <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Call Support
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;

