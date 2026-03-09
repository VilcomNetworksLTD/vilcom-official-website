import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import QuoteRequestForm from "@/components/QuoteRequestForm";

// Service type mapping from URL slugs
const SERVICE_TYPE_MAP: Record<string, string> = {
  "fiber": "internet_plan",
  "internet": "internet_plan",
  "hosting": "hosting_package",
  "web-development": "web_development",
  "cloud-solutions": "cloud_services",
  "cyber-security": "cyber_security",
  "smart-integration": "smart_integration",
  "software-development": "software_development",
  "erp-service": "erp_services",
  "isp-billing": "isp_services",
  "isp-cpe": "cpe_device",
  "isp-device-management": "cpe_device",
  "firewall-solutions": "cyber_security",
  "deep-packet-inspection": "cyber_security",
  "satellite-connectivity": "satellite_connectivity",
  "domains": "other",
  "media": "media_services",
  "certifications": "other",
};

const SERVICE_NAME_MAP: Record<string, string> = {
  "internet_plan": "Internet Plan",
  "hosting_package": "Hosting Package",
  "web_development": "Web Development",
  "cloud_services": "Cloud Services",
  "cyber_security": "Cyber Security",
  "network_infrastructure": "Network Infrastructure",
  "isp_services": "ISP Services",
  "cpe_device": "CPE Device",
  "satellite_connectivity": "Satellite Connectivity",
  "media_services": "Media Services",
  "erp_services": "ERP Services",
  "smart_integration": "Smart Integration",
  "software_development": "Software Development",
};

const Quote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [preselectedProductId, setPreselectedProductId] = useState<number | undefined>();
  const [preselectedProductName, setPreselectedProductName] = useState<string>("");

  useEffect(() => {
    // Parse query params from URL
    const params = new URLSearchParams(location.search);
    const service = params.get("service");
    const productId = params.get("product_id");
    const productName = params.get("product_name");

    if (service) {
      // Try to map URL slug to service type
      const serviceType = SERVICE_TYPE_MAP[service] || service;
      setPreselectedService(serviceType);
    }

    if (productId) {
      setPreselectedProductId(parseInt(productId, 10));
    }

    if (productName) {
      setPreselectedProductName(decodeURIComponent(productName));
    }
  }, [location]);

  const handleSuccess = (quoteNumber: string) => {
    // Could redirect to a thank you page or show success message
    console.log("Quote submitted successfully:", quoteNumber);
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]" />
      
      {/* Animated fluid shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
        <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px]" />
      </div>

      <Navbar />
      
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Request a <span className="text-cyan-300">Quote</span>
            </h1>
            <p className="text-blue-100/80 max-w-2xl mx-auto text-lg">
              Tell us about your project requirements and we'll provide a customized quote 
              tailored to your needs within 24-48 hours.
            </p>
          </div>

          {/* Quote Form */}
          <QuoteRequestForm 
            productId={preselectedProductId}
            productName={preselectedProductName || undefined}
            serviceType={preselectedService || undefined}
            onSuccess={handleSuccess}
            onCancel={() => navigate(-1)}
          />

          {/* Contact Alternative */}
          <div className="mt-12 text-center">
            <p className="text-blue-100/70">
              Prefer to talk directly?{' '}
              <a 
                href="/contact-us" 
                className="text-cyan-300 hover:text-cyan-200 underline font-medium"
              >
                Contact us
              </a>
              {' '}or call{' '}
              <span className="text-cyan-300 font-medium">+254 700 000 000</span>
            </p>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Quote;

