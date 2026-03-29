import { Smartphone } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const SoftwareDevelopment = () => {
  const features = [
    { text: "Android app development" },
    { text: "iOS app development" },
    { text: "Custom web applications" },
    { text: "E-commerce solutions" },
    { text: "API development and integration" },
    { text: "Database design and management" },
    { text: "UI/UX design services" },
    { text: "Maintenance and support" },
  ];

  return (
    <ServicePage
      title="Software Development"
      subtitle="Android, iOS & Web Development"
      description="We build custom mobile applications and web solutions tailored to your business needs. Our experienced team delivers high-quality, scalable, and secure software solutions across Android, iOS, and web platforms."
      features={features}
      icon={<Smartphone className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,30%,50%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="web_development"
    />
  );
};

export default SoftwareDevelopment;

