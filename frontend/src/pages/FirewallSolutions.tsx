import { Lock } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const FirewallSolutions = () => {
  const features = [
    { text: "State-of-the-Art Next-Generation Firewall (NGFW) executing deep packet semantic inspections" },
    { text: "Multi-layered Enterprise-grade protection mitigating sophisticated Layer 7 application attacks" },
    { text: "Proactive Intrusion Prevention System (IPS) stopping exploiting vulnerability attempts automatically" },
    { text: "Granular Application Control permitting zero-trust policing of unauthorized user software endpoints" },
    { text: "Adaptive Web Filtering shielding networks from phishing, malware, and undesirable domain categories" },
    { text: "Encrypted IPsec/SSL VPN support enabling highly secure, seamless remote workforce connectivity" },
    { text: "Volumetric DDoS mitigation frameworks absorbing immense, sudden malicious traffic spikes" },
    { text: "24/7 Threat Monitoring synchronized with real-time global cyber intelligence databases" },
  ];

  const detailedContent = (
    <>
      <p>
        The perimeter of your digital enterprise is under constant siege. Basic routers and legacy firewalls are completely inadequate against modern, coordinated cyber-attacks. Our Next-Generation Firewall (NGFW) solutions transform the edge of your network from a passive gateway into an intelligent, militarized boundary capable of distinguishing malicious payloads from legitimate operations.
      </p>
      <p>
        We deploy hardware and virtualized firewall clusters that integrate seamlessly with your existing infrastructure. Beyond initial installation, Vilcom provides continuous management, defining bespoke security policies, optimizing routing logic, and ensuring that firmware is fortified against newly discovered exploits. This allows your organization to operate with absolute confidence.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Firewall Solutions"
      subtitle="Your Digital Shield, Always On"
      description="Fortify your digital borders unconditionally with our high-performance firewall architectures. We architect resilient, adaptable network security perimeters designed to intercept zero-day vulnerabilities, neutralize aggressive incursions, and strictly govern data traversal for corporate enterprises and critical infrastructure."
      detailedContent={detailedContent}
      features={features}
      technologies={["Palo Alto NGFW", "Fortinet FortiGate", "Cisco Meraki", "Sophos XG", "IPsec/SSL VPN", "DDoS Mitigation", "Zero Trust Architecture"]}
      icon={<Lock className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="cyber_security"
    />
  );
};

export default FirewallSolutions;
