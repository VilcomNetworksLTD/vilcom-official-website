import { Satellite } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const SatelliteConnectivity = () => {
  const features = [
    { text: "Amazon Leo/Starlink services" },
    { text: "Remote area connectivity" },
    { text: "High-speed satellite internet" },
    { text: "Global coverage" },
    { text: "Quick deployment" },
    { text: "Backup connectivity solutions" },
    { text: "Enterprise satellite solutions" },
    { text: "24/7 technical support" },
  ];

  return (
    <ServicePage
      title="Satellite Connectivity"
      subtitle="Connecting the Underserved, Everywhere"
      description="Bring reliable internet to the most remote locations with our satellite connectivity solutions. Partnering with Amazon Leo and Starlink, we deliver high-speed satellite internet to areas where traditional connectivity is unavailable."
      features={features}
      icon={<Satellite className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)]"
      iconColor="text-white"
    />
  );
};

export default SatelliteConnectivity;

