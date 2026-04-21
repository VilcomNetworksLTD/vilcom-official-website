import { Satellite } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const SatelliteConnectivity = () => {
  const features = [
    { text: "Low Earth Orbit (LEO) constellations integration including Amazon Kuiper and Starlink networks" },
    { text: "Unrestricted remote area connectivity bridging the digital divide in unserved geographies" },
    { text: "High-throughput satellite internet with specialized low-latency configurations" },
    { text: "Guaranteed global coverage facilitating ubiquitous cross-border enterprise operations" },
    { text: "Ultra-fast deployment capabilities requiring no underground fiber infrastructure" },
    { text: "Redundant SD-WAN backup solutions ensuring 100% terrestrial network fallback" },
    { text: "Dedicated enterprise satellite links offering strictly uncontended bandwidth ratios" },
    { text: "24/7 dedicated engineering support for critical satellite array realignments and metrics" },
  ];

  const detailedContent = (
    <>
      <p>
        Geographical barriers should no longer dictate operational limits. Our Satellite Connectivity solutions leverage next-generation Low Earth Orbit (LEO) technology, redefining what is possible in remote communications. By partnering with leading aerospace networks like Starlink and Amazon Kuiper, we deliver fiber-like latency and bandwidth to extreme rural environments, maritime operations, and mobile exploration units.
      </p>
      <p>
        For urban enterprises, satellite links provide the ultimate fail-safe. Terrestrial lines are susceptible to physical damage and natural disasters; LEO satellite arrays are entirely insulated from ground-level disruptions. We seamlessly integrate these satellite arrays into your existing SD-WAN infrastructure, establishing an unbreakable backup continuum that guarantees continuous business uptime regardless of terrestrial failures.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Satellite Connectivity"
      subtitle="Connecting the Underserved, Everywhere"
      description="Break geographical constraints with our advanced Low Earth Orbit (LEO) satellite connectivity frameworks. We deliver unparalleled, high-speed, and low-latency internet to profoundly remote locations while providing urban enterprises with absolute, disaster-proof network redundancy."
      detailedContent={detailedContent}
      features={features}
      technologies={["Starlink LEO", "Amazon Kuiper", "VSAT Arrays", "BGP Routing", "SD-WAN Integration", "Cisco Meraki", "Peplink", "Telemetry APIs"]}
      icon={<Satellite className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)]"
      iconColor="text-white"
      serviceType="satellite_connectivity"
    />
  );
};

export default SatelliteConnectivity;
