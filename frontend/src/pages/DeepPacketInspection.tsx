import { Shield } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const DeepPacketInspection = () => {
  const features = [
    { text: "Real-time traffic analysis" },
    { text: "Deep visibility into network traffic" },
    { text: "Threat detection and prevention" },
    { text: "Bandwidth optimization" },
    { text: "Application-level monitoring" },
    { text: "Network forensics" },
    { text: "Quality of Service (QoS)" },
    { text: "Compliance reporting" },
  ];

  return (
    <ServicePage
      title="Deep Packet Inspection"
      subtitle="See Deeper. Secure Smarter."
      description="Gain complete visibility into your network traffic with our Deep Packet Inspection (DPI) service. Analyze network flows in real-time to optimize performance, detect threats, and ensure security while maintaining network efficiency."
      features={features}
      icon={<Shield className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
    />
  );
};

export default DeepPacketInspection;

