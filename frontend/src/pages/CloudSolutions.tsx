import { Cloud } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const CloudSolutions = () => {
  const features = [
    { text: "Vilcom Drive - Secure cloud storage for your files" },
    { text: "Vilcom Photos - Backup and share your memories" },
    { text: "Scalable storage solutions for businesses" },
    { text: "Collaborative workspace for teams" },
    { text: "Automatic backup and sync across devices" },
    { text: "Enterprise-grade security with encryption" },
    { text: "99.9% uptime guarantee" },
    { text: "24/7 technical support" },
  ];

  return (
    <ServicePage
      title="Cloud Solutions"
      subtitle="Storage, Collaboration & Digital Growth"
      description="Vilcom Cloud Solutions provide comprehensive cloud services including Vilcom Drive and Photos. Our cloud infrastructure is designed to help businesses and individuals store, collaborate, and grow digitally with enterprise-grade security and reliability."
      features={features}
      icon={<Cloud className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
    />
  );
};

export default CloudSolutions;

