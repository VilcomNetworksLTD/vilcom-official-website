import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Plans from "./pages/Plans";
import Coverage from "./pages/Coverage";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Hosting from "./pages/Hosting";
import WebDevelopment from "./pages/WebDevelopment";
import Domains from "./pages/Domains";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Certifications from "./pages/Certifications";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Gallery from "./pages/Gallery";
import Media from "./pages/Media";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/fiber" element={<Plans />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/hosting" element={<Hosting />} />
          <Route path="/web-development" element={<WebDevelopment />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/:planId" element={<Signup />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/media" element={<Media />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
