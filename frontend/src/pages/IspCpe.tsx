import { Plug } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const IspCpe = () => {
  const features = [
    { text: "Zero-touch provisioning (ZTP)" },
    { text: "Automatic firmware updates" },
    { text: "Remote configuration management" },
    { text: "Multi-vendor CPE support" },
    { text: "Customer self-installation guides" },
    { text: "Device health monitoring" },
    { text: "Bulk provisioning capabilities" },
    { text: "TR-069 protocol support" },
  ];

  return (
    <ServicePage
      title="ISP CPE As A Service"
      subtitle="Plug In. Power Up. Provisioned."
      description="Automate your customer premises equipment (CPE) setup with our auto-provisioning service. Enable seamless device deployment, reduce installation costs, and provide a smooth onboarding experience for your ISP customers."
      features={features}
      icon={<Plug className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
    />
  );
};

export default IspCpe;

