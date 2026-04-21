import { Shield } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const DeepPacketInspection = () => {
  const features = [
    { text: "Advanced real-time traffic analysis inspecting headers and precise data payloads instantly" },
    { text: "Complete, unimpeded visibility across all OSI network layers, uncovering concealed protocols" },
    { text: "Automated threat detection blocking zero-day exploits, ransomware, and covert data exfiltration" },
    { text: "Intelligent bandwidth optimization prioritizing critical enterprise applications over casual traffic" },
    { text: "Granular application-level monitoring detailing user-specific network behavioral patterns" },
    { text: "Comprehensive network forensics retaining historical metadata for rigorous compliance investigations" },
    { text: "Stringent Quality of Service (QoS) enforcement guaranteeing VOIP and video conferencing stability" },
    { text: "Automated compliance reporting mapped to GDPR, HIPAA, and PCI-DSS regulatory standards" },
  ];

  const detailedContent = (
    <>
      <p>
        In modern networking, traditional packet filtering is no longer sufficient. Our Next-Generation Deep Packet Inspection (DPI) transcends standard port and protocol analysis by scrutinizing the absolute contents of every data packet seamlessly traversing your network. This unparalleled visibility empowers administrators to pinpoint and resolve network anomalies before they impact end-user experience.
      </p>
      <p>
        By leveraging highly optimized DPI appliances and sophisticated artificial intelligence, Vilcom enables you to decode application signatures definitively. Whether managing complex multi-tenant environments or demanding enterprise infrastructures, DPI secures your intellectual properties while drastically reducing unnecessary bandwidth consumption, lowering operational overhead.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Deep Packet Inspection"
      subtitle="See Deeper. Secure Smarter."
      description="Gain absolute, forensic-level visibility into your data streams with our Advanced Deep Packet Inspection (DPI) services. Analyze complex network behavioral flows in microscopic real-time to optimize mission-critical performance, unilaterally detect sophisticated threats, and enforce definitive security protocols."
      detailedContent={detailedContent}
      features={features}
      technologies={["Cisco Firepower", "Palo Alto Networks", "Suricata", "Zeek", "Wireshark", "Machine Learning", "QoS Engines", "NetFlow"]}
      icon={<Shield className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="cyber_security"
    />
  );
};

export default DeepPacketInspection;
