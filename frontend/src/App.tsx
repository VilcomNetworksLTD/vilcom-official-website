import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import VisitorTracker from "./components/VisitorTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import CookieConsent from "./components/CookieConsent";
import WhatsAppButton from "./components/WhatsAppButton";

// ── Always-needed (tiny, no lazy needed) ────────────────────────────────────
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";

// ── Public pages (lazy loaded) ───────────────────────────────────────────────
const Index              = lazy(() => import("./pages/Index"));
const Plans              = lazy(() => import("./pages/Plans"));
const Coverage           = lazy(() => import("./pages/Coverage"));
const SpeedTest          = lazy(() => import("./pages/SpeedTest"));
const Signup             = lazy(() => import("./pages/Signup"));
const Auth               = lazy(() => import("./pages/Auth"));
const Quote              = lazy(() => import("./pages/Quote"));
const Booking            = lazy(() => import("./pages/Booking"));
const StaffInviteAccept  = lazy(() => import("./pages/StaffInviteAccept"));
const Hosting            = lazy(() => import("./pages/Hosting"));
const WebDevelopment     = lazy(() => import("./pages/WebDevelopment"));
const CloudSolutions     = lazy(() => import("./pages/CloudSolutions"));
const CyberSecurity      = lazy(() => import("./pages/CyberSecurity"));
const SmartIntegration   = lazy(() => import("./pages/SmartIntegration"));
const SoftwareDevelopment= lazy(() => import("./pages/SoftwareDevelopment"));
const ErpService         = lazy(() => import("./pages/ErpService"));
const IspBilling         = lazy(() => import("./pages/IspBilling"));
const IspCpe             = lazy(() => import("./pages/IspCpe"));
const IspDeviceManagement= lazy(() => import("./pages/IspDeviceManagement"));
const FirewallSolutions  = lazy(() => import("./pages/FirewallSolutions"));
const DeepPacketInspection=lazy(() => import("./pages/DeepPacketInspection"));
const SatelliteConnectivity=lazy(()=> import("./pages/SatelliteConnectivity"));
const DataAiWorkflows    = lazy(() => import("./pages/DataAiWorkflows"));
const TechnologyEvents   = lazy(() => import("./pages/TechnologyEvents"));
const Domains            = lazy(() => import("./pages/Domains"));
const Blog               = lazy(() => import("./pages/Blog"));
const Careers            = lazy(() => import("./pages/Careers"));
const Certifications     = lazy(() => import("./pages/Certifications"));
const ContactUs          = lazy(() => import("./pages/ContactUs"));
const FAQs               = lazy(() => import("./pages/FAQs"));
const About              = lazy(() => import("./pages/About"));
const Terms              = lazy(() => import("./pages/Terms"));
const PrivacyPolicy      = lazy(() => import("./pages/PrivacyPolicy"));
const EmailVerify        = lazy(() => import("./pages/EmailVerify"));
const Portfolio          = lazy(() => import("./pages/Portfolio"));
const Gallery            = lazy(() => import("./pages/Gallery"));
const Media              = lazy(() => import("./pages/Media"));
const ServicesSlug       = lazy(() => import("./pages/Services/Slug"));
const ForgotPassword     = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword      = lazy(() => import("./pages/auth/ResetPassword"));

// ── Admin pages (lazy) ───────────────────────────────────────────────────────
const AdminDashboard        = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProfile          = lazy(() => import("./pages/admin/AdminProfile"));
const CategoryManagement    = lazy(() => import("./pages/admin/CategoryManagement"));
const ProductManagement     = lazy(() => import("./pages/admin/ProductManagement"));
const SubscriptionManagement= lazy(() => import("./pages/admin/SubscriptionManagement"));
const QuoteManagement       = lazy(() => import("./pages/admin/QuoteManagement"));
const WhatsAppMessages      = lazy(() => import("./pages/admin/WhatsAppMessages"));
const TicketManagement      = lazy(() => import("./pages/admin/TicketManagement"));
const StaffManagement       = lazy(() => import("./pages/admin/StaffManagement"));
const RolesManagement       = lazy(() => import("./pages/admin/RolesManagement"));
const BannerManagement      = lazy(() => import("./pages/admin/BannerManagement"));
const TestimonialManagement = lazy(() => import("./pages/admin/TestimonialManagement"));
const FaqManagement         = lazy(() => import("./pages/admin/FaqManagement"));
const MediaLibrary          = lazy(() => import("./pages/admin/MediaLibrary"));
const AdminPortfolio        = lazy(() => import("./pages/admin/AdminPortfolio"));
const CoverageManagement    = lazy(() => import("./pages/admin/CoverageManagement"));
const InvoiceManagement     = lazy(() => import("./pages/admin/InvoiceManagement"));
const Users                 = lazy(() => import("./pages/admin/Users"));
const Clients               = lazy(() => import("./pages/admin/Clients"));
const CreateClient          = lazy(() => import("./pages/admin/CreateClient"));
const LeadManagement        = lazy(() => import("./pages/admin/LeadManagement"));
const ContactMessages       = lazy(() => import("./pages/admin/ContactMessages"));
const AdminPressArticles    = lazy(() => import("./pages/admin/PressArticles"));
const AdminGallery          = lazy(() => import("./pages/admin/AdminGallery"));
const AdminCareerManagement = lazy(() => import("./pages/admin/AdminCareerManagement"));
const EmeraldApprovals      = lazy(() => import("./pages/admin/EmeraldApprovals"));
const SafetikaPortal        = lazy(() => import("./pages/admin/SafetikaPortal"));
const AnalyticsDashboard    = lazy(() => import("./pages/admin/AnalyticsDashboard"));

// ── Staff pages (lazy) ───────────────────────────────────────────────────────
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));
const StaffProfile   = lazy(() => import("./pages/staff/StaffProfile"));

// ── Client pages (lazy) ──────────────────────────────────────────────────────
const ClientDashboard = lazy(() => import("./pages/clients/ClientDashboard"));
const ClientProfile   = lazy(() => import("./pages/clients/ClientProfile"));
const MyTickets       = lazy(() => import("./pages/clients/MyTickets"));
const MyServices      = lazy(() => import("./pages/clients/MyServices"));
const MySubscriptions = lazy(() => import("./pages/clients/MySubscriptions"));
const ClientInvoices  = lazy(() => import("./pages/clients/ClientInvoices"));
const ClientPayments  = lazy(() => import("./pages/clients/ClientPayments"));

// ── Minimal page-level loading fallback ─────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#05050A]">
    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
  </div>
);

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
            <Suspense fallback={<PageFallback />}>
              <Routes>

                {/* ── Public ── */}
                <Route path="/"                         element={<Index />} />
                <Route path="/plans"                    element={<Plans />} />
                <Route path="/fiber"                    element={<Plans />} />
                <Route path="/coverage"                 element={<Coverage />} />
                <Route path="/speed-test"               element={<SpeedTest />} />
                <Route path="/services/hosting-packages"          element={<Hosting />} />
                <Route path="/services/web-development-enterprise"          element={<WebDevelopment />} />
                <Route path="/services/cloud-solutions"          element={<CloudSolutions />} />
                <Route path="/services/cyber-security"           element={<CyberSecurity />} />
                <Route path="/services/smart-integration"        element={<SmartIntegration />} />
                <Route path="/services/software-development"     element={<SoftwareDevelopment />} />
                <Route path="/services/erp-service"              element={<ErpService />} />
                <Route path="/services/isp-billing"              element={<IspBilling />} />
                <Route path="/services/isp-cpe"                  element={<IspCpe />} />
                <Route path="/services/isp-device-management"    element={<IspDeviceManagement />} />
                <Route path="/services/firewall-solutions"       element={<FirewallSolutions />} />
                <Route path="/services/deep-packet-inspection"   element={<DeepPacketInspection />} />
                <Route path="/services/satellite-connectivity"   element={<SatelliteConnectivity />} />
                <Route path="/services/data-ai-workflows"        element={<DataAiWorkflows />} />
                <Route path="/services/technology-events"        element={<TechnologyEvents />} />
                <Route path="/services/:slug"           element={<ServicesSlug />} />
                <Route path="/hosting"                  element={<Navigate to="/services/hosting-packages" replace />} />
                <Route path="/web-development"          element={<Navigate to="/services/web-development-enterprise" replace />} />
                <Route path="/cloud-solutions"          element={<Navigate to="/services/cloud-solutions" replace />} />
                <Route path="/cyber-security"           element={<Navigate to="/services/cyber-security" replace />} />
                <Route path="/smart-integration"        element={<Navigate to="/services/smart-integration" replace />} />
                <Route path="/software-development"     element={<Navigate to="/services/software-development" replace />} />
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
                <Route path="/admin/portfolio-manager"  element={<ProtectedRoute requireRoles={['admin', 'web_developer', 'content_manager']}><AdminPortfolio /></ProtectedRoute>} />
                <Route path="/admin/coverage"           element={<ProtectedRoute requireRoles={['admin', 'staff']}><CoverageManagement /></ProtectedRoute>} />
                <Route path="/admin/invoices"           element={<ProtectedRoute requireRoles={['admin', 'staff']}><InvoiceManagement /></ProtectedRoute>} />
                <Route path="/admin/users"              element={<ProtectedRoute requireRoles={['admin']}><Users /></ProtectedRoute>} />
                <Route path="/admin/clients/create"    element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><CreateClient /></ProtectedRoute>} />
                <Route path="/admin/clients"            element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><Clients /></ProtectedRoute>} />
                <Route path="/admin/leads"              element={<ProtectedRoute requireRoles={['admin', 'staff', 'sales']}><LeadManagement /></ProtectedRoute>} />
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
                <Route path="/staff/contact-messages"   element={<ProtectedRoute requireRoles={['staff']}><ContactMessages /></ProtectedRoute>} />

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
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;