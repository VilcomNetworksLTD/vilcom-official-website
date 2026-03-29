import { Cpu } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const SmartIntegration = () => {
  const features = [
    { text: "IoT device management and integration" },
    { text: "Smart building automation" },
    { text: "Industrial IoT solutions" },
    { text: "Data analytics and visualization" },
    { text: "Remote monitoring and control" },
    { text: "API integrations with existing systems" },
    { text: "Custom IoT dashboard development" },
    { text: "Scalable IoT infrastructure" },
  ];

  return (
    <ServicePage
      title="Smart Integration"
      subtitle="IoT & Digital Transformation"
      description="Transform your business operations with our IoT and digital integration solutions. We help streamline processes, improve efficiency, and unlock new possibilities through smart technology integration tailored to your business needs."
      features={features}
      icon={<Cpu className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      blobColor="bg-orange-500/20"
      serviceType="smart_integration"
    />
  );
};

export default SmartIntegration;

