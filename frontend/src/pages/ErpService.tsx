import { Briefcase } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const ErpService = () => {
  const features = [
    { text: "Financial management module" },
    { text: "Human resources management" },
    { text: "Inventory and supply chain management" },
    { text: "Customer relationship management" },
    { text: "Project management tools" },
    { text: "Reporting and analytics" },
    { text: "Cloud-based access" },
    { text: "Custom workflow automation" },
  ];

  return (
    <ServicePage
      title="ERP As A Service"
      subtitle="Streamline. Simplify. Succeed."
      description="Our ERP solutions provide integrated enterprise management tools for efficient business processes. Streamline operations, improve productivity, and gain real-time insights with our comprehensive ERP platform designed for businesses of all sizes."
      features={features}
      icon={<Briefcase className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)]"
      iconColor="text-white"
    />
  );
};

export default ErpService;

