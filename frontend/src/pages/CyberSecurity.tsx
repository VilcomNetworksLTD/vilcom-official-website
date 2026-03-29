import { Shield } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const CyberSecurity = () => {
  const features = [
    { text: "Threat detection and prevention" },
    { text: "Vulnerability assessment and penetration testing" },
    { text: "Security audit and compliance" },
    { text: "Endpoint protection" },
    { text: "24/7 security monitoring" },
    { text: "Incident response and recovery" },
    { text: "Employee security training" },
    { text: "Data encryption and backup solutions" },
  ];

  return (
    <ServicePage
      title="Cyber Security"
      subtitle="Protect Your Digital Assets"
      description="Our comprehensive cyber security solutions safeguard your data, people, and business against digital threats. We provide enterprise-grade protection with advanced threat detection, real-time monitoring, and incident response capabilities to keep your business secure."
      features={features}
      icon={<Shield className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,30%,50%)]"
      iconColor="text-white"
      blobColor="bg-blue-500/20"
      serviceType="cyber_security"
    />
  );
};

export default CyberSecurity;

