import { Lock } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const FirewallSolutions = () => {
  const features = [
    { text: "Next-generation firewall (NGFW)" },
    { text: "Enterprise-grade protection" },
    { text: "Intrusion prevention system (IPS)" },
    { text: "Application control" },
    { text: "Web filtering" },
    { text: "VPN support" },
    { text: "DDoS mitigation" },
    { text: "24/7 threat monitoring" },
  ];

  return (
    <ServicePage
      title="Firewall Solutions"
      subtitle="Your Digital Shield, Always On"
      description="Protect your business with our enterprise-grade firewall solutions. We provide advanced network security that safeguards your data, applications, and infrastructure against evolving cyber threats for businesses and homes alike."
      features={features}
      icon={<Lock className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
    />
  );
};

export default FirewallSolutions;

