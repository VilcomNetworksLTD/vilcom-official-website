import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Wifi, 
  CreditCard, 
  Ticket, 
  Settings, 
  User,
  Package,
  Bell,
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
  ShoppingCart
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

// Theme configurations for different dashboard types with glassmorphism
const getThemeConfig = (userType: 'client' | 'staff' | 'admin') => {
  switch (userType) {
    case 'client':
      return {
        // Dark glassmorphism background with golden sidebar
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900',
        // Multicolor blurred background elements for client
        meshGradient: true,
        meshColors: ['from-amber-500/20', 'from-yellow-500/20', 'from-orange-500/10'],
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        // Golden/Yellow glassmorphism sidebar
        sidebarBg: 'bg-gradient-to-b from-amber-900/80 to-yellow-900/70 backdrop-blur-xl border-r border-amber-500/30',
        sidebarText: 'text-amber-100',
        sidebarActive: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-l-2 border-amber-400',
        sidebarHover: 'hover:bg-white/10',
        // Accent colors
        accentColor: 'amber',
        accentPrimary: '#F59E0B',
        accentSecondary: '#D97706',
      };
    case 'admin':
      return {
        // Moroccan blue glassmorphism background with multicolor
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        // Multicolor blurred background elements
        meshGradient: true,
        meshColors: ['from-blue-500/20', 'from-indigo-500/20', 'from-cyan-500/10', 'from-purple-500/10'],
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        // Moroccan blue glassmorphism sidebar
        sidebarBg: 'bg-gradient-to-b from-blue-900/80 to-indigo-900/70 backdrop-blur-xl border-r border-blue-500/30',
        sidebarText: 'text-blue-100',
        sidebarActive: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-2 border-blue-400',
        sidebarHover: 'hover:bg-white/10',
        // Accent colors
        accentColor: 'blue',
        accentPrimary: '#0047AB',
        accentSecondary: '#003380',
      };
    case 'staff':
    default:
      return {
        // Moroccan blue glassmorphism background with multicolor
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        // Multicolor blurred background elements
        meshGradient: true,
        meshColors: ['from-blue-500/20', 'from-indigo-500/20', 'from-cyan-500/10', 'from-purple-500/10'],
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        // Moroccan blue glassmorphism sidebar
        sidebarBg: 'bg-gradient-to-b from-blue-900/80 to-indigo-900/70 backdrop-blur-xl border-r border-blue-500/30',
        sidebarText: 'text-blue-100',
        sidebarActive: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-2 border-blue-400',
        sidebarHover: 'hover:bg-white/10',
        // Accent colors
        accentColor: 'blue',
        accentPrimary: '#0047AB',
        accentSecondary: '#003380',
      };
  }
};

// Client sidebar items
const clientSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home, label: 'Home', href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard' },
    ]
  },
  {
    title: 'Services',
    items: [
      { icon: Wifi, label: 'My Services', href: '/client/services' },
      { icon: Package, label: 'Upgrade Plan', href: '/plans' },
    ]
  },
  {
    title: 'Billing',
    items: [
      { icon: CreditCard, label: 'Invoices', href: '/client/invoices' },
      { icon: DollarSign, label: 'Payment History', href: '/client/payments' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: Ticket, label: 'My Tickets', href: '/client/tickets', badge: 2 },
      { icon: HeadphonesIcon, label: 'Support', href: '/support' },
    ]
  },
];

// Staff sidebar items
const staffSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home, label: 'Home', href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/staff/dashboard' },
    ]
  },
  {
    title: 'Management',
    items: [
      { icon: Users, label: 'Clients', href: '/admin/clients' },
      { icon: Wifi, label: 'Subscriptions', href: '/admin/subscriptions' },
      { icon: FileText, label: 'Quotes', href: '/admin/quotes' },
      { icon: Ticket, label: 'Tickets', href: '/admin/tickets', badge: 12 },
    ]
  },
  {
    title: 'Billing',
    items: [
      { icon: CreditCard, label: 'Invoices', href: '/admin/invoices' },
      { icon: DollarSign, label: 'Payments', href: '/admin/payments' },
    ]
  },
  {
    title: 'Content',
    items: [
      { icon: Package, label: 'Plans', href: '/admin/plans' },
      { icon: Building2, label: 'Coverage', href: '/admin/coverage' },
    ]
  },
];

// Admin sidebar items
const adminSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { icon: Home, label: 'Home', href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    ]
  },
  {
    title: 'Users',
    items: [
      { icon: Users, label: 'All Users', href: '/admin/users' },
      { icon: UserCheck, label: 'Clients', href: '/admin/clients' },
      { icon: Shield, label: 'Staff', href: '/admin/staff' },
      { icon: Layers, label: 'Roles & Permissions', href: '/admin/roles' },
    ]
  },
  {
    title: 'Services',
    items: [
      { icon: Folder, label: 'Categories', href: '/admin/categories' },
      { icon: ShoppingCart, label: 'Products', href: '/admin/products' },
      { icon: Package, label: 'Plans & Pricing', href: '/admin/plans' },
      { icon: Wifi, label: 'Subscriptions', href: '/admin/subscriptions' },
      { icon: Building2, label: 'Coverage Areas', href: '/admin/coverage' },
      { icon: Globe, label: 'Domains', href: '/admin/domains' },
      { icon: FileText, label: 'Quote Requests', href: '/admin/quotes' },
    ]
  },
  {
    title: 'Content',
    items: [
      { icon: Image, label: 'Media Library', href: '/admin/media' },
      { icon: Layout, label: 'Banners', href: '/admin/banners' },
      { icon: MessageSquare, label: 'Testimonials', href: '/admin/testimonials' },
      { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
    ]
  },
  {
    title: 'Billing',
    items: [
      { icon: CreditCard, label: 'Invoices', href: '/admin/invoices' },
      { icon: DollarSign, label: 'Payments', href: '/admin/payments' },
      { icon: TrendingUp, label: 'Revenue', href: '/admin/revenue' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: Ticket, label: 'Tickets', href: '/admin/tickets', badge: 12 },
      { icon: HeadphonesIcon, label: 'Support', href: '/admin/support' },
    ]
  },
  {
    title: 'System',
    items: [
      { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
      { icon: Database, label: 'Backups', href: '/admin/backups' },
      { icon: Settings, label: 'Settings', href: '/admin/settings' },
      { icon: Mail, label: 'Email Templates', href: '/admin/emails' },
    ]
  },
];

// Animated Mesh Gradient Background Component
const MeshGradientBackground = ({ colors }: { colors: string[] }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 ${colors[0]} opacity-30 blur-[100px]`} style={{ animation: 'pulse 8s ease-in-out infinite' }} />
      <div className={`absolute inset-0 ${colors[1]} opacity-30 blur-[100px]`} style={{ animation: 'pulse 10s ease-in-out infinite reverse' }} />
      {colors[2] && <div className={`absolute inset-0 ${colors[2]} opacity-20 blur-[120px]`} style={{ animation: 'pulse 12s ease-in-out infinite' }} />}
      {colors[3] && <div className={`absolute inset-0 ${colors[3]} opacity-20 blur-[100px]`} style={{ animation: 'pulse 14s ease-in-out infinite reverse' }} />}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get theme configuration based on user type
  const theme = getThemeConfig(userType);

  // Get sidebar sections based on user type
  const getSections = () => {
    switch (userType) {
      case 'admin':
        return adminSections;
      case 'staff':
        return staffSections;
      default:
        return clientSections;
    }
  };

  const sections = getSections();

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  // Get logo gradient based on user type
  const getLogoGradient = () => {
    switch (userType) {
      case 'client':
        return 'from-amber-500 to-yellow-600';
      case 'admin':
      case 'staff':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-cyan-500 to-blue-500';
    }
  };

  return (
    <div className={`min-h-screen flex ${theme.backgroundGradient} ${theme.background}`}>
      {/* Mesh Gradient Background for glassmorphism effect */}
      {theme.meshGradient && <MeshGradientBackground colors={theme.meshColors} />}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Glassmorphism Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        ${sidebarWidth} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme.sidebarBg} text-white transition-all duration-300 flex flex-col
      `}>
        {/* Logo */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${userType === 'client' ? 'border-amber-500/30' : 'border-blue-500/30'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getLogoGradient()} flex items-center justify-center`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${theme.textPrimary}`}>VILCOM</span>
            </Link>
          )}
          {collapsed && (
            <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-r ${getLogoGradient()} flex items-center justify-center`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1 rounded ${theme.sidebarHover}`}
          >
            {collapsed ? <ChevronRight className={`w-4 h-4 ${theme.sidebarText}`} /> : <ChevronLeft className={`w-4 h-4 ${theme.sidebarText}`} />}
          </button>
          <button 
            onClick={() => setMobileOpen(false)}
            className={`lg:hidden p-1 rounded ${theme.sidebarHover}`}
          >
            <ChevronLeft className={`w-4 h-4 ${theme.sidebarText}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {!collapsed && (
                <h3 className={`px-4 mb-2 text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1 px-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${isActive(item.href) 
                          ? theme.sidebarActive
                          : `${theme.sidebarText} ${theme.sidebarHover}`
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
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

        {/* User Section */}
        <div className={`border-t p-4 ${userType === 'client' ? 'border-amber-500/30' : 'border-blue-500/30'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getLogoGradient()} flex items-center justify-center`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${theme.textPrimary}`}>{user?.name}</p>
                <p className={`text-xs truncate ${theme.textMuted}`}>{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-r ${getLogoGradient()} flex items-center justify-center mb-3`}>
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top Header */}
        <header className={`${theme.headerBg} shadow-sm border-b ${userType === 'client' ? 'border-amber-500/20' : 'border-blue-500/20'} lg:hidden`}>
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 rounded-lg hover:bg-gray-100/50`}
            >
              <Menu className={`w-6 h-6 ${theme.textPrimary}`} />
            </button>
            <span className={`font-bold text-lg ${theme.textPrimary}`}>VILCOM</span>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

