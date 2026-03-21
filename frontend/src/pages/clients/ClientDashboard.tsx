import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Wifi, 
  CreditCard, 
  Ticket, 
  Package,
  ChevronRight,
  Zap,
  Download,
  TrendingUp,
  Radio,
  Loader2,
  AlertTriangle,
  WifiOff
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PaymentInfo from '@/components/PaymentInfo';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

// ── Circular gauge — UNCHANGED ────────────────────────────────────────────
const CircularGauge = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
        <circle cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{percentage}%</span>
        <span className="text-slate-400 text-sm">Used</span>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { user, hasRole, isAuthenticated } = useAuth();

  // ── Access control — UNCHANGED ────────────────────────────────────────
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (hasRole('admin')) return <Navigate to="/admin/dashboard" replace />;
  if (hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager'])) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // ── Live data from API ────────────────────────────────────────────────
  const { data, loading, error } = useDashboard(60_000);

  const service     = data?.service     ?? null;
  const paymentInfo = data?.payment_info ?? null;
  const liveStats   = data?.stats       ?? null;

  // Derived values
  const isOnline      = service?.is_active ?? false;
  const planName      = service?.plan_name ?? 'N/A';
  const daysLeft      = service?.days_left ?? null;
  const serviceStatus = service?.status   ?? 'active';

  // Speed from plan name e.g. "Fibre 60Mbps" → 60
  const downloadSpeed = Number(service?.plan_name?.match(/(\d+)\s*[Mm]bps/)?.[1] ?? 0);
  const uploadSpeed   = downloadSpeed > 0 ? Math.round(downloadSpeed / 2) : 0;

  // Quick actions — UNCHANGED
  const quickActions = [
    { icon: Wifi,       label: 'My Services',    href: '/client/services',                    color: 'from-amber-500 to-yellow-500',  bgColor: 'bg-amber-500/20'  },
    { icon: CreditCard, label: 'Pay Bills',       href: '/client/services',                    color: 'from-orange-500 to-amber-500',  bgColor: 'bg-orange-500/20' },
    { icon: Ticket,     label: 'Support Ticket',  href: '/client/tickets',                     color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/20' },
    { icon: Package,    label: 'Upgrade Plan',    href: '/client/services#available-services', color: 'from-amber-600 to-yellow-600',  bgColor: 'bg-amber-600/20'  },
  ];

  // Recent activities — derived from live service data
  const recentActivities = [
    {
      id: 1,
      action: service ? `Plan: ${planName}` : 'Account Active',
      description: service?.expire_date
        ? `Expires: ${new Date(service.expire_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Service is active',
      time: daysLeft !== null ? `${daysLeft} days remaining` : '',
      type: service?.is_expiring_soon ? 'warning' : 'success',
    },
    {
      id: 2,
      action: 'Account Status',
      description: `Your account is ${data?.user?.status ?? 'active'}`,
      time: 'Current',
      type: 'info',
    },
    {
      id: 3,
      action: 'Emerald MBR',
      description: data?.user?.emerald_mbr_id
        ? `Account #${data.user.emerald_mbr_id}`
        : 'Account being provisioned',
      time: 'Billing reference',
      type: 'info',
    },
  ];

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-slate-400 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-white font-medium">Could not load dashboard</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="client">
      {/* Page Header — UNCHANGED */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's your account overview.</p>
      </div>

      {/* Expiry / suspension banners — non-intrusive additions */}
      {service?.is_expiring_soon && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            Your service expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>. Pay via M-Pesa to avoid interruption.
          </p>
        </div>
      )}
      {service?.needs_renewal && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">Your service has expired. Please make a payment to restore access.</p>
        </div>
      )}

      {/* Stats Cards — UNCHANGED layout, live values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Active Services</p>
              <p className="text-3xl font-bold text-white">{liveStats?.active_subscriptions ?? 0}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border border-amber-500/30">
              <Wifi className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <Link to="/client/services" className="text-sm text-amber-400 hover:text-amber-300 mt-3 inline-flex items-center">
            View details <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Balance Due</p>
              <p className="text-3xl font-bold text-white">
                {liveStats?.outstanding_balance && liveStats.outstanding_balance > 0
                  ? `KES ${liveStats.outstanding_balance.toLocaleString()}`
                  : '0'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center border border-orange-500/30">
              <CreditCard className="w-7 h-7 text-orange-400" />
            </div>
          </div>
          <Link to="/client/invoices" className="text-sm text-orange-400 hover:text-orange-300 mt-3 inline-flex items-center">
            Pay now <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Open Tickets</p>
              <p className="text-3xl font-bold text-white">{liveStats?.open_tickets ?? 0}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center border border-yellow-500/30">
              <Ticket className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
          <Link to="/client/tickets" className="text-sm text-yellow-400 hover:text-yellow-300 mt-3 inline-flex items-center">
            View tickets <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-1">Connection</p>
              <p className={`text-3xl font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : serviceStatus === 'suspended' ? 'Suspended' : 'Offline'}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
              isOnline
                ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-500/30'
                : 'bg-gradient-to-br from-red-500/30 to-rose-500/30 border-red-500/30'
            }`}>
              {isOnline
                ? <Radio className="w-7 h-7 text-green-400 animate-pulse" />
                : <WifiOff className="w-7 h-7 text-red-400" />}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? '● Live' : '● Offline'}
            </span>
            {daysLeft !== null && (
              <span className="text-xs text-slate-500">• {daysLeft}d left</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Data Usage — UNCHANGED UI */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Data Usage</h2>
              <span className="text-slate-400 text-sm">Unlimited</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <CircularGauge percentage={0} color="#F59E0B" />
              <div className="flex-1 space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </span>
                    <span className="text-white font-semibold">
                      {downloadSpeed > 0 ? `${downloadSpeed} Mbps` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Upload
                    </span>
                    <span className="text-white font-semibold">
                      {uploadSpeed > 0 ? `${uploadSpeed} Mbps` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions — UNCHANGED */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className={`w-14 h-14 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/10`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Current Plan — live from Emerald */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
              <Link to="/client/services#available-services" className="text-sm text-amber-400 hover:text-amber-300">Upgrade</Link>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{planName}</p>
                  <p className="text-slate-400 text-sm">
                    {service?.pay_period ?? 'Monthly'}
                    {service?.billing_cycle ? ` · ${service.billing_cycle}` : ''}
                  </p>
                  {service?.expire_date && (
                    <p className="text-slate-500 text-xs mt-0.5">
                      Expires {new Date(service.expire_date).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 text-sm font-medium rounded-full border ${
                  isOnline
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {isOnline ? 'Active' : 'Inactive'}
                </span>
                <Link to="/client/services" className="p-2 text-slate-400 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — UNCHANGED structure */}
        <div className="lg:col-span-1 space-y-6">

          {/* M-Pesa Paybill — pass live MBR ID + paybill */}
          <PaymentInfo
            emeraldMbrId={data?.user?.emerald_mbr_id ?? user?.emerald_mbr_id}
            paybill={paymentInfo?.paybill}
          />

          {/* Recent Activity — live-ish */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-b border-white/10 last:border-0">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{activity.action}</p>
                    <p className="text-slate-400 text-sm">{activity.description}</p>
                    {activity.time && <p className="text-slate-500 text-xs mt-1">{activity.time}</p>}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/client/activity" className="block text-center text-sm text-amber-400 hover:text-amber-300 mt-4">
              View All Activity
            </Link>
          </div>

          {/* Account Status — live */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                  isOnline
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {isOnline ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">MBR ID</span>
                <span className="text-white font-mono text-sm">
                  {data?.user?.emerald_mbr_id ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member Since</span>
                <span className="text-white font-medium">
                  {user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                </span>
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