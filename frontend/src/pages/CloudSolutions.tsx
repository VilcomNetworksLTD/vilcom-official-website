import { Cloud } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const CloudSolutions = () => {
  const features = [
    { text: "Vilcom Drive - Military-grade secure cloud storage for sensitive corporate documents and personal files" },
    { text: "Vilcom Photos - Intelligent backup and sharing platform specifically designed for high-resolution optical memories" },
    { text: "Highly scalable, redundant storage solutions built to seamlessly grow with your business demands without hardware investment" },
    { text: "Unified collaborative workspace tailored for distributed teams to edit, comment, and manage real-time workflows" },
    { text: "Intelligent automatic backup systems with instantaneous cross-device synchronization and disaster recovery mechanisms" },
    { text: "Enterprise-grade AES-256 encryption applied at rest and in transit, ensuring maximum data sovereignty compliance" },
    { text: "Ironclad 99.99% operational uptime guarantee backed by geographically distributed datacenter infrastructure" },
    { text: "Access to dedicated 24/7 technical support experts via priority channels for enterprise configurations" },
  ];

  const detailedContent = (
    <>
      <p>
        In today's fast-paced digital ecosystem, managing data efficiently and securely is paramount. Our Cloud Solutions are engineered to provide an unparalleled balance of accessibility, robust security, and seamless collaboration capabilities. Whether you're a burgeoning startup or an established enterprise, our infrastructure adapts to your specific operational scale.
      </p>
      <p>
        We eliminate the complexities associated with traditional on-premise hardware storage. By leveraging distributed, fault-tolerant infrastructure, Vilcom guarantees that your critical business data is not only protected against hardware failures and cyber contingencies but also instantly accessible to authorized personnel worldwide, enhancing organizational agility.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Cloud Solutions"
      subtitle="Scalable Storage, Remote Collaboration & Digital Growth"
      description="Vilcom Cloud Solutions provide comprehensive, enterprise-level cloud services including Vilcom Drive and Photos. Our cloud infrastructure is purposely designed to help forward-thinking businesses and digital natives store, collaborate, and grow systematically with uncompromised enterprise-grade security and uncompromising reliability."
      detailedContent={detailedContent}
      features={features}
      technologies={["AWS S3", "Azure Blob Storage", "Kubernetes", "Docker", "Node.js", "React", "PostgreSQL", "AES-256"]}
      icon={<Cloud className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      blobColor="bg-orange-500/20"
      serviceType="cloud_services"
    />
  );
};

export default CloudSolutions;
