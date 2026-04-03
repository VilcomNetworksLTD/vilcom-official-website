import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, ScrollRestoration, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import VisitorTracker from "./components/VisitorTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import Unauthorized from "./pages/Unauthorized";
import Index from "./pages/Index";
import Plans from "./pages/Plans";
import Coverage from "./pages/Coverage";
import SpeedTest from "./pages/SpeedTest";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import Quote from "./pages/Quote";
import Booking from "./pages/Booking";
import StaffInviteAccept from "./pages/StaffInviteAccept";
import NotFound from "./pages/NotFound";
import Hosting from "./pages/Hosting";
import WebDevelopment from "./pages/WebDevelopment";
import CloudSolutions from "./pages/CloudSolutions";
import CyberSecurity from "./pages/CyberSecurity";
import SmartIntegration from "./pages/SmartIntegration";
import SoftwareDevelopment from "./pages/SoftwareDevelopment";
import ErpService from "./pages/ErpService";
import IspBilling from "./pages/IspBilling";
import IspCpe from "./pages/IspCpe";
import IspDeviceManagement from "./pages/IspDeviceManagement";
import FirewallSolutions from "./pages/FirewallSolutions";
import DeepPacketInspection from "./pages/DeepPacketInspection";
import SatelliteConnectivity from "./pages/SatelliteConnectivity";
import Domains from "./pages/Domains";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Certifications from "./pages/Certifications";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import About from "./pages/About";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import EmailVerify from "./pages/EmailVerify";
import Portfolio from "./pages/Portfolio";
import Gallery from "./pages/Gallery";
import Media from "./pages/Media";
import ClientDashboard from "./pages/clients/ClientDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import TicketManagement from "./pages/admin/TicketManagement";
import MyTickets from "./pages/clients/MyTickets";
import InvoiceManagement from "./pages/admin/InvoiceManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardRedirect from "./pages/DashboardRedirect";
import CookieConsent from "./components/CookieConsent";
import WhatsAppButton from "./components/WhatsAppButton";
import CategoryManagement from "./pages/admin/CategoryManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import ProductManagement from "./pages/admin/ProductManagement";
import BannerManagement from "./pages/admin/BannerManagement";
import TestimonialManagement from "./pages/admin/TestimonialManagement";
import FaqManagement from "./pages/admin/FaqManagement";
import MediaLibrary from "./pages/admin/MediaLibrary";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import QuoteManagement from "./pages/admin/QuoteManagement";
import WhatsAppMessages from "./pages/admin/WhatsAppMessages";
import MySubscriptions from "./pages/clients/MySubscriptions";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import MyServices from "./pages/clients/MyServices";
import CoverageManagement from "./pages/admin/CoverageManagement";
import Users from "./pages/admin/Users";
import Clients from "./pages/admin/Clients";
import ContactMessages from "./pages/admin/ContactMessages";
import LeadManagement from "./pages/admin/LeadManagement";
// ── NEW: CMS admin pages ──────────────────────────────────────────────────────
import AdminPressArticles from "./pages/admin/PressArticles";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminCareerManagement from "./pages/admin/AdminCareerManagement";
import EmeraldApprovals from "./pages/admin/EmeraldApprovals";
import SafetikaPortal from "./pages/admin/SafetikaPortal";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import ClientInvoices from "./pages/clients/ClientInvoices";
import ClientPayments from "./pages/clients/ClientPayments";

// ── Role-specific profile pages ───────────────────────────────────────────────
import AdminProfile  from "./pages/admin/AdminProfile";
import StaffProfile  from "./pages/staff/StaffProfile";
import ClientProfile from "./pages/clients/ClientProfile";

// Password reset flow (public pages)
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";
import ServicesSlug from "./pages/Services/Slug";

const queryClient = new QueryClient();

const DASHBOARD_PREFIXES = ["/admin", "/staff", "/client"];

const DashboardGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isStaff } = useAuth();
  const location = useLocation();
  const isDashboardPath = DASHBOARD_PREFIXES.some((p) =>
    location.pathname.startsWith(p)
  );

  if (isAdmin || isStaff || isDashboardPath) return null;
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <VisitorTracker />
            <DashboardGuard>
              <CookieConsent />
            <WhatsAppButton />
          </DashboardGuard>
          <ScrollToTop />
          <Routes>
            
            {/* ── Public ── */}
            <Route path="/"                         element={<Index />} />
            <Route path="/plans"                    element={<Plans />} />
            <Route path="/fiber"                    element={<Plans />} />
            <Route path="/coverage"                 element={<Coverage />} />
            <Route path="/speed-test"               element={<SpeedTest />} />
            <Route path="/services/:slug"           element={<ServicesSlug />} />
            <Route path="/hosting"                  element={<Hosting />} />
            <Route path="/web-development"          element={<Navigate to="/services/web-development-enterprise" replace />} />
            <Route path="/cloud-solutions"          element={<Navigate to="/services/cloud-solutions" replace />} />
            <Route path="/cyber-security"           element={<Navigate to="/services/cyber-security" replace />} />
            <Route path="/smart-integration"        element={<Navigate to="/services/smart-integration" replace />} />
            <Route path="/software-development"     element={<Navigate to="/services/web-development-enterprise" replace />} />
            <Route path="/erp-service"              element={<Navigate to="/services/erp-service" replace />} />
            <Route path="/isp-billing"              element={<Navigate to="/services/isp-billing" replace />} />
            <Route path="/isp-cpe"                  element={<Navigate to="/services/isp-cpe" replace />} />
            <Route path="/isp-device-management"    element={<Navigate to="/services/isp-device-management" replace />} />
            <Route path="/firewall-solutions"       element={<Navigate to="/services/firewall-solutions" replace />} />
            <Route path="/deep-packet-inspection"   element={<Navigate to="/services/deep-packet-inspection" replace />} />
            <Route path="/satellite-connectivity"   element={<Navigate to="/services/satellite-connectivity" replace />} />
            <Route path="/domains"                  element={<Domains />} />
            <Route path="/blog"                     element={<Blog />} />
            <Route path="/auth"                     element={<Auth />} />
            <Route path="/quote"                    element={<Quote />} />
            <Route path="/book"                     element={<Booking />} />
            <Route path="/booking"                  element={<Booking />} />
            <Route path="/signup"                   element={<Signup />} />
            <Route path="/signup/:planId"           element={<Signup />} />
            <Route path="/invite/:token"            element={<StaffInviteAccept />} />
            <Route path="/careers"                  element={<Careers />} />
            <Route path="/certifications"           element={<Certifications />} />
            <Route path="/contact-us"               element={<ContactUs />} />
            <Route path="/faqs"                     element={<FAQs />} />
            <Route path="/about"                    element={<About />} />
            <Route path="/terms"                    element={<Terms />} />
            <Route path="/privacy"                  element={<PrivacyPolicy />} />
            <Route path="/auth/verify-email"        element={<EmailVerify />} />
            <Route path="/portfolio"                element={<Portfolio />} />
            <Route path="/gallery"                  element={<Gallery />} />
            <Route path="/media"                    element={<Media />} />

            <Route path="/forgot-password"          element={<ForgotPassword />} />
            <Route path="/auth/reset-password"      element={<ResetPassword />} />

            {/* ── Dashboard redirect ── */}
            <Route path="/dashboard"                element={<DashboardRedirect />} />

            {/* ══════════════════════════════════════════════════════════
                ADMIN
            ══════════════════════════════════════════════════════════ */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/admin/dashboard"          element={<ProtectedRoute requireRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/profile"            element={<ProtectedRoute requireRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
            <Route path="/admin/categories"         element={<ProtectedRoute requireRoles={['admin']}><CategoryManagement /></ProtectedRoute>} />
            <Route path="/admin/products"           element={<ProtectedRoute requireRoles={['admin']}><ProductManagement /></ProtectedRoute>} />
            <Route path="/admin/subscriptions"      element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><SubscriptionManagement /></ProtectedRoute>} />
            <Route path="/admin/quotes"             element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><QuoteManagement /></ProtectedRoute>} />
            <Route path="/admin/whatsapp-messages"  element={<ProtectedRoute requireRoles={['admin', 'staff']}><WhatsAppMessages /></ProtectedRoute>} />
            <Route path="/admin/tickets"            element={<ProtectedRoute requireRoles={['admin', 'staff', 'technical_support']}><TicketManagement /></ProtectedRoute>} />
            <Route path="/admin/staff"              element={<ProtectedRoute requireRoles={['admin']}><StaffManagement /></ProtectedRoute>} />
            <Route path="/admin/roles"              element={<ProtectedRoute requireRoles={['admin']}><RolesManagement /></ProtectedRoute>} />
            <Route path="/admin/banners"            element={<ProtectedRoute requireRoles={['admin', 'web_developer', 'content_manager']}><BannerManagement /></ProtectedRoute>} />
            <Route path="/admin/testimonials"       element={<ProtectedRoute requireRoles={['admin', 'content_manager']}><TestimonialManagement /></ProtectedRoute>} />
            <Route path="/admin/faqs"               element={<ProtectedRoute requireRoles={['admin', 'content_manager', 'technical_support']}><FaqManagement /></ProtectedRoute>} />
            <Route path="/admin/media"              element={<ProtectedRoute requireRoles={['admin', 'web_developer', 'content_manager']}><MediaLibrary /></ProtectedRoute>} />
            <Route path="/admin/portfolio-manager" element={<ProtectedRoute requireRoles={['admin', 'web_developer', 'content_manager']}><AdminPortfolio /></ProtectedRoute>} />
            <Route path="/admin/coverage"           element={<ProtectedRoute requireRoles={['admin', 'staff']}><CoverageManagement /></ProtectedRoute>} />
            <Route path="/admin/invoices"           element={<ProtectedRoute requireRoles={['admin', 'staff']}><InvoiceManagement /></ProtectedRoute>} />
            <Route path="/admin/users"              element={<ProtectedRoute requireRoles={['admin']}><Users /></ProtectedRoute>} />
            <Route path="/admin/clients"            element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><Clients /></ProtectedRoute>} />
            <Route path="/admin/leads"              element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><LeadManagement /></ProtectedRoute>} />
            {/* ── NEW CMS routes ── */}
            <Route path="/admin/press-articles"     element={<ProtectedRoute requireRoles={['admin', 'content_manager']}><AdminPressArticles /></ProtectedRoute>} />
            <Route path="/admin/gallery-manager"    element={<ProtectedRoute requireRoles={['admin', 'web_developer', 'content_manager']}><AdminGallery /></ProtectedRoute>} />
            <Route path="/admin/contact-messages"   element={<ProtectedRoute requireRoles={['admin', 'staff']}><ContactMessages /></ProtectedRoute>} />
            <Route path="/admin/careers"            element={<ProtectedRoute requireRoles={['admin', 'staff', 'hr']}><AdminCareerManagement /></ProtectedRoute>} />
            <Route path="/admin/emerald-approvals"  element={<ProtectedRoute requireRoles={['admin', 'staff']}><EmeraldApprovals /></ProtectedRoute>} />
            <Route path="/admin/safetika-portal"    element={<ProtectedRoute requireRoles={['admin', 'staff']}><SafetikaPortal /></ProtectedRoute>} />
            <Route path="/admin/analytics"          element={<ProtectedRoute requireRoles={['admin']}><AnalyticsDashboard /></ProtectedRoute>} />

            {/* ══════════════════════════════════════════════════════════
                STAFF
            ══════════════════════════════════════════════════════════ */}
            <Route path="/staff/dashboard"          element={<ProtectedRoute requireRoles={['staff', 'sales', 'technical_support', 'hr', 'web_developer', 'content_manager']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/profile"            element={<ProtectedRoute requireRoles={['staff', 'sales', 'technical_support', 'hr', 'web_developer', 'content_manager']}><StaffProfile /></ProtectedRoute>} />
            <Route path="/staff/contact-messages" element={<ProtectedRoute requireRoles={['staff']}><ContactMessages /></ProtectedRoute>} />

            {/* ══════════════════════════════════════════════════════════
                CLIENT
            ══════════════════════════════════════════════════════════ */}
            <Route path="/client/dashboard"         element={<ProtectedRoute requireRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
            <Route path="/client/profile"           element={<ProtectedRoute requireRoles={['client']}><ClientProfile /></ProtectedRoute>} />
            <Route path="/client/subscriptions"     element={<ProtectedRoute requireRoles={['client']}><MyServices /></ProtectedRoute>} />
            <Route path="/client/services"          element={<ProtectedRoute requireRoles={['client']}><MyServices /></ProtectedRoute>} />
            <Route path="/client/tickets"           element={<ProtectedRoute requireRoles={['client']}><MyTickets /></ProtectedRoute>} />
            <Route path="/client/invoices"          element={<ProtectedRoute requireRoles={['client']}><ClientInvoices /></ProtectedRoute>} />
            <Route path="/client/payments"          element={<ProtectedRoute requireRoles={['client']}><ClientPayments /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*"                         element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;