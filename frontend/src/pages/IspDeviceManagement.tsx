import { Monitor } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const IspDeviceManagement = () => {
  const features = [
    { text: "Centralized device monitoring" },
    { text: "Real-time network visibility" },
    { text: "Performance analytics" },
    { text: "Automatic故障 detection" },
    { text: "Remote troubleshooting" },
    { text: "Bandwidth management" },
    { text: "Firmware version tracking" },
    { text: "Alert and notification system" },
  ];

  return (
    <ServicePage
      title="ISP Device Management"
      subtitle="Control Every Device, Anywhere"
      description="Take complete control of your ISP network with our centralized device management solution. Monitor, configure, and troubleshoot all your network devices from a single platform, ensuring optimal performance and minimal downtime."
      features={features}
      icon={<Monitor className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)]"
      iconColor="text-white"
      serviceType="cpe_device"
    />
  );
};

export default IspDeviceManagement;

