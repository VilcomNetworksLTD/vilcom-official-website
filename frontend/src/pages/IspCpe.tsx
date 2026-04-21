import { Plug } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const IspCpe = () => {
  const features = [
    { text: "Absolute Zero-Touch Provisioning (ZTP) eliminating costly on-site technician configurations" },
    { text: "Automated fleet-wide firmware patching executed during defined low-impact maintenance windows" },
    { text: "Comprehensive remote configuration management bypassing the need for physical customer visits" },
    { text: "Extensive multi-vendor CPE compatibility avoiding single-manufacturer hardware lock-in" },
    { text: "Intuitive customer self-installation workflows guided via mobile or web applications" },
    { text: "Proactive device health monitoring tracking optical levels, CPU load, and internal temperatures" },
    { text: "High-speed bulk provisioning capabilities designed for large-scale MDU network deployments" },
    { text: "Native TR-069 and TR-369 (USP) protocol support for standardized device communication" },
  ];

  const detailedContent = (
    <>
      <p>
        Deploying and managing Customer Premises Equipment (CPE) has historically been one of the highest operational expenditures for Internet Service Providers. Our ISP CPE As A Service fundamentally changes this paradigm by introducing full automation to the device lifecycle. We enable providers to ship unconfigured hardware directly to clients, relying on intelligent Zero-Touch Provisioning to self-configure the device immediately upon connection to the network.
      </p>
      <p>
        This platform leverages industry-standard protocols like TR-069 to offer complete remote management of OLTs, ONTs, and edge routers across heterogeneous vendor environments. The ability to push mass firmware updates, diagnose Wi-Fi interference remotely, and adjust configuration parameters on the fly protects your network's integrity while drastically cutting down truck rolls.
      </p>
    </>
  );

  return (
    <ServicePage
      title="ISP CPE As A Service"
      subtitle="Plug In. Power Up. Provisioned."
      description="Automate your entire hardware deployment strategy with our unified CPE Auto-Provisioning service. Execute seamless remote device installations, significantly reduce technical dispatch costs, and empower your end-users with a frictionless, plug-and-play onboarding experience."
      detailedContent={detailedContent}
      features={features}
      technologies={["TR-069 ACS", "TR-369 USP", "GenieACS", "Python", "SNMP", "REST APIs", "Docker", "MongoDB"]}
      icon={<Plug className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="cpe_device"
    />
  );
};

export default IspCpe;
