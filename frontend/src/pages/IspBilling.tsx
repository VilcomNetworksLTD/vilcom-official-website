import { CreditCard } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const IspBilling = () => {
  const features = [
    { text: "Automated billing and invoicing" },
    { text: "Multi-payment gateway integration" },
    { text: "Usage-based billing" },
    { text: "Customer self-service portal" },
    { text: "Subscription management" },
    { text: "Financial reporting and analytics" },
    { text: "Late payment reminders" },
    { text: "Tax and compliance handling" },
  ];

  return (
    <ServicePage
      title="ISP Billing As A Service"
      subtitle="Smart Billing, Seamless Growth"
      description="Simplify your billing operations with our comprehensive ISP billing solutions. Automate invoicing, manage subscriptions, and provide your customers with a seamless payment experience while growing your ISP business."
      features={features}
      icon={<CreditCard className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="isp_services"
    />
  );
};

export default IspBilling;

