import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import MyServices from "./pages/clients/MyServices";
import CoverageManagement from "./pages/admin/CoverageManagement";
import Users from "./pages/admin/Users";
import Clients from "./pages/admin/Clients";
import LeadManagement from "./pages/admin/LeadManagement";


const queryClient = new QueryClient();

const DashboardGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isStaff } = useAuth();
  const location = useLocation();
  const isDashboardPath = location.pathname.startsWith("/admin") || 
                          location.pathname.startsWith("/staff") || 
                          location.pathname.startsWith("/client");
  
  if (isAdmin || isStaff || isDashboardPath) {
    return null;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <DashboardGuard>
            <CookieConsent />
            <WhatsAppButton />
          </DashboardGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/fiber" element={<Plans />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/speed-test" element={<SpeedTest />} />
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/web-development" element={<WebDevelopment />} />
            <Route path="/cloud-solutions" element={<CloudSolutions />} />
            <Route path="/cyber-security" element={<CyberSecurity />} />
            <Route path="/smart-integration" element={<SmartIntegration />} />
            <Route path="/software-development" element={<SoftwareDevelopment />} />
            <Route path="/erp-service" element={<ErpService />} />
            <Route path="/isp-billing" element={<IspBilling />} />
            <Route path="/isp-cpe" element={<IspCpe />} />
            <Route path="/isp-device-management" element={<IspDeviceManagement />} />
            <Route path="/firewall-solutions" element={<FirewallSolutions />} />
            <Route path="/deep-packet-inspection" element={<DeepPacketInspection />} />
            <Route path="/satellite-connectivity" element={<SatelliteConnectivity />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/auth" element={<Auth />} />
<Route path="/quote" element={<Quote />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/:planId" element={<Signup />} />
            <Route path="/invite/:token" element={<StaffInviteAccept />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/auth/verify-email" element={<EmailVerify />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/media" element={<Media />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Admin Management Routes */}
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
            <Route path="/admin/quotes" element={<QuoteManagement />} />
            <Route path="/admin/whatsapp-messages" element={<WhatsAppMessages />} /> 
            <Route path="/admin/tickets"   element={<TicketManagement />} />

            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/roles" element={<RolesManagement />} />
            <Route path="/admin/banners" element={<BannerManagement />} />
            <Route path="/admin/testimonials" element={<TestimonialManagement />} />
            <Route path="/admin/faqs" element={<FaqManagement />} />
            <Route path="/admin/media" element={<MediaLibrary />} />
<Route path="/admin/coverage" element={<CoverageManagement />} />
<Route path="/admin/invoices" element={<InvoiceManagement />} />
  <Route path="/admin/users" element={<Users />} />
  <Route path="/admin/clients" element={<Clients />} />
  <Route path="/admin/leads" element={<LeadManagement />} />
            
            {/* Client Routes */}
            <Route path="/client/subscriptions" element={<MyServices />} />
            <Route path="/client/services" element={<MyServices />} />
           
<Route path="/client/tickets"  element={<MyTickets />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
