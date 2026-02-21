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

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        ${sidebarWidth} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-slate-900 text-white transition-all duration-300 flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">VILCOM</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-slate-800"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {!collapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
        <div className="border-t border-slate-700 p-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-slate-800 transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">VILCOM</span>
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

