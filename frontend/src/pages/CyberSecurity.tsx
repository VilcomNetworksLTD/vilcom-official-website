import { Shield } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const CyberSecurity = () => {
  const features = [
    { text: "Advanced threat detection and prevention powered by ML-driven behavioral analysis and heuristic scanning" },
    { text: "Comprehensive vulnerability assessments and ethical penetration testing to identify structural weakness" },
    { text: "In-depth security audits ensuring full compliance with international standards (ISO 27001, GDPR, HIPAA)" },
    { text: "Zero-trust endpoint protection covering mobile, desktop, and remote IoT device architectures deployed across borders" },
    { text: "Continuous 24/7 active security monitoring by our dedicated Security Operations Center (SOC) professionals" },
    { text: "Proactive incident response playbooks and rapid recovery frameworks to mitigate operational downtime" },
    { text: "Interactive, scenario-based employee security awareness training to minimize human-error attack surfaces" },
    { text: "State-of-the-art data encryption protocols and immutable backup solutions to neutralize ransomware threats" },
  ];

  const detailedContent = (
    <>
      <p>
        Cyber threats are evolving at an unprecedented pace, rendering traditional security measures increasingly obsolete. At Vilcom, we adopt a proactive, defense-in-depth approach to cybersecurity. Our multi-layered security ecosystem is designed to anticipate, identify, and neutralize sophisticated threats before they can compromise your critical digital infrastructure.
      </p>
      <p>
        From continuous network surveillance to rigorous compliance auditing, our holistic strategy ensures that every vector of your digital presence is fortified. We bridge the gap between technical defense capabilities and organizational security hygiene, providing customized safeguards that guarantee business continuity, safeguard intellectual property, and protect your brand's reputation.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Cyber Security"
      subtitle="Military-Grade Protection for Your Digital Assets"
      description="Our comprehensive cyber security solutions meticulously safeguard your sensitive data, personnel, and business operations against the most advanced digital threats. We deliver proactive, enterprise-grade protection through continuous intelligence gathering, real-time tactical monitoring, and decisive incident response capabilities."
      detailedContent={detailedContent}
      features={features}
      technologies={["SIEM Platforms", "CrowdStrike", "Splunk", "Python", "Snort", "Suricata", "AWS Security Hub", "Check Point"]}
      icon={<Shield className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(220,30%,50%)]"
      iconColor="text-white"
      blobColor="bg-blue-500/20"
      serviceType="cyber_security"
    />
  );
};

export default CyberSecurity;
