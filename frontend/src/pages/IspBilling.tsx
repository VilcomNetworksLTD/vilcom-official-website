import { CreditCard } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const IspBilling = () => {
  const features = [
    { text: "Fully automated, zero-touch recurring billing and high-volume invoice generation" },
    { text: "Global multi-payment gateway integration supporting localized mobile money and credit cards" },
    { text: "Dynamic usage-based billing logic with customizable bandwidth quota management" },
    { text: "Branded customer self-service portals allowing users to view history and self-activate plans" },
    { text: "Automated subscription lifecycle management including prorated upgrades and downgrades" },
    { text: "Granular financial reporting, MRR analytics, and predictive revenue modeling dashboards" },
    { text: "Customizable automated late payment reminders and systematic soft suspension protocols" },
    { text: "Built-in regulatory tax compliance handling adapted for diverse regional jurisdictions" },
  ];

  const detailedContent = (
    <>
      <p>
        Revenue leakage and billing disputes are two of the most significant hurdles for growing ISPs. Our ISP Billing As A Service platform directly addresses these challenges by automating the entire financial lifecycle of your subscriber base. Moving away from manual spreadsheets and legacy accounting software drastically reduces administrative overhead and eliminates human error.
      </p>
      <p>
        Designed exclusively for the telecommunications sector, this platform supports complex billing scenarios—from simple flat-rate broadband packages to complex, tiered usage models for enterprise leased lines. With robust self-service customer portals, you empower your clients to manage their accounts independently, thereby reducing support ticket volumes while drastically improving cash flow through integrated payment gateways.
      </p>
    </>
  );

  return (
    <ServicePage
      title="ISP Billing As A Service"
      subtitle="Smart Billing, Seamless Growth"
      description="Modernize your financial operations with our telco-grade ISP billing solutions. Automate exhaustive invoicing cycles, manage complicated prepaid and postpaid subscriptions accurately, and provide your subscriber base with an intuitive, frictionless digital payment experience."
      detailedContent={detailedContent}
      features={features}
      technologies={["Stripe", "M-Pesa API", "FreeRadius", "PostgreSQL", "Node.js", "Redis", "Docker", "GraphQL API"]}
      icon={<CreditCard className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      serviceType="isp_services"
    />
  );
};

export default IspBilling;
