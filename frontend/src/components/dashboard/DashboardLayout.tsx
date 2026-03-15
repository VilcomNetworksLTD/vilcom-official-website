import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  Users2,
  Wifi,
  CreditCard,
  Settings,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  Building2,
  FileText,
  Shield,
  Layers,
  Database,
  Globe,
  Mail,
  Zap,
  UserCheck,
  TrendingUp,
  DollarSign,
  HeadphonesIcon,
  Menu,
  Image,
  Layout,
  MessageSquare,
  HelpCircle,
  Folder,
  ShoppingCart,
  LifeBuoy,
  Receipt,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'staff' | 'admin';
}

// ─── Theme config ─────────────────────────────────────────────────────────────

const getThemeConfig = (userType: 'client' | 'staff' | 'admin') => {
  switch (userType) {
    case 'client':
      return {
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900',
        meshGradient: true,
        meshColors: ['from-amber-500/20', 'from-yellow-500/20', 'from-orange-500/10'],
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        sidebarBg: 'bg-gradient-to-b from-amber-900/80 to-yellow-900/70 backdrop-blur-xl border-r border-amber-500/30',
        sidebarText: 'text-amber-100',
        sidebarActive: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-l-2 border-amber-400',
        sidebarHover: 'hover:bg-white/10',
        accentColor: 'amber',
        accentPrimary: '#F59E0B',
        accentSecondary: '#D97706',
      };
    case 'admin':
      return {
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        meshGradient: true,
        meshColors: ['from-blue-500/20', 'from-indigo-500/20', 'from-cyan-500/10', 'from-purple-500/10'],
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        sidebarBg: 'bg-gradient-to-b from-blue-900/80 to-indigo-900/70 backdrop-blur-xl border-r border-blue-500/30',
        sidebarText: 'text-blue-100',
        sidebarActive: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-2 border-blue-400',
        sidebarHover: 'hover:bg-white/10',
        accentColor: 'blue',
        accentPrimary: '#0047AB',
        accentSecondary: '#003380',
      };
    case 'staff':
    default:
      return {
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        meshGradient: true,
        meshColors: ['from-blue-500/20', 'from-indigo-500/20', 'from-cyan-500/10', 'from-purple-500/10'],
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        sidebarBg: 'bg-gradient-to-b from-blue-900/80 to-indigo-900/70 backdrop-blur-xl border-r border-blue-500/30',
        sidebarText: 'text-blue-100',
        sidebarActive: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-2 border-blue-400',
        sidebarHover: 'hover:bg-white/10',
        accentColor: 'blue',
        accentPrimary: '#0047AB',
        accentSecondary: '#003380',
      };
  }
};

// ─── Client sidebar ───────────────────────────────────────────────────────────

const clientSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home,          label: 'Home',            href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard',     href: '/client/dashboard' },
    ],
  },
  {
    title: 'Services',
    items: [
      { icon: Wifi,    label: 'My Services',  href: '/client/services' },
      { icon: Package, label: 'Upgrade Plan', href: '/plans' },
      { icon: Wifi,    label: 'Subscriptions',href: '/client/subscriptions' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { icon: Receipt,   label: 'Invoices',        href: '/client/invoices' },
      { icon: DollarSign,label: 'Payment History', href: '/client/payments' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: LifeBuoy,       label: 'My Tickets', href: '/client/tickets' },
      { icon: HeadphonesIcon, label: 'Support',    href: '/support' },
    ],
  },
];

// ─── Staff sidebar ────────────────────────────────────────────────────────────

const staffSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home,            label: 'Home',      href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/staff/dashboard' },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: Users,    label: 'Clients',       href: '/admin/clients' },
      { icon: Wifi,     label: 'Subscriptions', href: '/admin/subscriptions' },
      { icon: FileText, label: 'Quotes',        href: '/admin/quotes' },
      { icon: LifeBuoy, label: 'Tickets',       href: '/admin/tickets' },
      { icon: Users2,   label: 'Leads',         href: '/admin/leads' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { icon: Receipt,   label: 'Invoices', href: '/admin/invoices' },
      { icon: DollarSign,label: 'Payments', href: '/admin/payments' },
    ],
  },
  {
    title: 'Content',
    items: [
      { icon: Package,   label: 'Plans',    href: '/admin/plans' },
      { icon: Building2, label: 'Coverage', href: '/admin/coverage' },
    ],
  },
];

// ─── Admin sidebar ────────────────────────────────────────────────────────────

const adminSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home,            label: 'Home',      href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    ],
  },
  {
    title: 'Users',
    items: [
      { icon: Users,    label: 'All Users',          href: '/admin/users' },
      { icon: UserCheck,label: 'Clients',            href: '/admin/clients' },
      { icon: Shield,   label: 'Staff',              href: '/admin/staff' },
      { icon: Layers,   label: 'Roles & Permissions',href: '/admin/roles' },
    ],
  },
  {
    title: 'Services',
    items: [
      { icon: Folder,      label: 'Categories',    href: '/admin/categories' },
      { icon: ShoppingCart,label: 'Products',      href: '/admin/products' },
      { icon: Package,     label: 'Plans & Pricing',href: '/admin/plans' },
      { icon: Wifi,        label: 'Subscriptions', href: '/admin/subscriptions' },
      { icon: Building2,   label: 'Coverage Areas',href: '/admin/coverage' },
      { icon: Globe,       label: 'Domains',       href: '/admin/domains' },
      { icon: FileText,    label: 'Quote Requests',href: '/admin/quotes' },
      { icon: Users2,      label: 'Leads',         href: '/admin/leads' },
    ],
  },
  {
    title: 'Content',
    items: [
      { icon: Image,       label: 'Media Library', href: '/admin/media' },
      { icon: Layout,      label: 'Banners',       href: '/admin/banners' },
      { icon: MessageSquare,label:'Testimonials',  href: '/admin/testimonials' },
      { icon: HelpCircle,  label: 'FAQs',          href: '/admin/faqs' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { icon: Receipt,    label: 'Invoices', href: '/admin/invoices' },
      { icon: DollarSign, label: 'Payments', href: '/admin/payments' },
      { icon: TrendingUp, label: 'Revenue',  href: '/admin/revenue' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: LifeBuoy,       label: 'Tickets', href: '/admin/tickets' },
      { icon: HeadphonesIcon, label: 'Support', href: '/admin/support' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: BarChart3, label: 'Reports',         href: '/admin/reports' },
      { icon: Database,  label: 'Backups',         href: '/admin/backups' },
      { icon: Settings,  label: 'Settings',        href: '/admin/settings' },
      { icon: Mail,      label: 'Email Templates', href: '/admin/emails' },
    ],
  },
];

// ─── Mesh background ──────────────────────────────────────────────────────────

const MeshGradientBackground = ({ colors }: { colors: string[] }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className={`absolute inset-0 ${colors[0]} opacity-30 blur-[100px]`} style={{ animation: 'meshpulse 8s ease-in-out infinite' }} />
    <div className={`absolute inset-0 ${colors[1]} opacity-30 blur-[100px]`} style={{ animation: 'meshpulse 10s ease-in-out infinite reverse' }} />
    {colors[2] && <div className={`absolute inset-0 ${colors[2]} opacity-20 blur-[120px]`} style={{ animation: 'meshpulse 12s ease-in-out infinite' }} />}
    {colors[3] && <div className={`absolute inset-0 ${colors[3]} opacity-20 blur-[100px]`} style={{ animation: 'meshpulse 14s ease-in-out infinite reverse' }} />}
    <style>{`
      @keyframes meshpulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.5; }
      }
    `}</style>
  </div>
);

// ─── Layout ───────────────────────────────────────────────────────────────────

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const theme = getThemeConfig(userType);

  const sections = userType === 'admin' ? adminSections
                 : userType === 'staff' ? staffSections
                 : clientSections;

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  const logoGradient = userType === 'client'
    ? 'from-amber-500 to-yellow-600'
    : 'from-blue-500 to-indigo-600';

  const borderColor = userType === 'client' ? 'border-amber-500/30' : 'border-blue-500/30';

  return (
    <div className={`min-h-screen flex ${theme.backgroundGradient} ${theme.background}`}>
      {theme.meshGradient && <MeshGradientBackground colors={theme.meshColors} />}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarWidth}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme.sidebarBg} text-white transition-all duration-300 flex flex-col
      `}>
        {/* Logo */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${borderColor}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${logoGradient} flex items-center justify-center`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${theme.textPrimary}`}>VILCOM</span>
            </Link>
          )}
          {collapsed && (
            <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-r ${logoGradient} flex items-center justify-center`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`hidden lg:flex p-1 rounded ${theme.sidebarHover}`}>
            {collapsed
              ? <ChevronRight className={`w-4 h-4 ${theme.sidebarText}`} />
              : <ChevronLeft  className={`w-4 h-4 ${theme.sidebarText}`} />}
          </button>
          <button onClick={() => setMobileOpen(false)} className={`lg:hidden p-1 rounded ${theme.sidebarHover}`}>
            <ChevronLeft className={`w-4 h-4 ${theme.sidebarText}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((section, si) => (
            <div key={si} className="mb-4">
              {!collapsed && (
                <h3 className={`px-4 mb-2 text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1 px-2">
                {section.items.map((item, ii) => (
                  <li key={ii}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${isActive(item.href) ? theme.sidebarActive : `${theme.sidebarText} ${theme.sidebarHover}`}
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className={`border-t p-4 ${borderColor}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${logoGradient} flex items-center justify-center flex-shrink-0`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${theme.textPrimary}`}>{user?.name}</p>
                <p className={`text-xs truncate ${theme.textMuted}`}>{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-r ${logoGradient} flex items-center justify-center mb-3`}>
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Mobile header */}
        <header className={`${theme.headerBg} shadow-sm border-b ${userType === 'client' ? 'border-amber-500/20' : 'border-blue-500/20'} lg:hidden`}>
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
              <Menu className={`w-6 h-6 ${theme.textPrimary}`} />
            </button>
            <span className={`font-bold text-lg ${theme.textPrimary}`}>VILCOM</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;