import { Briefcase } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const ErpService = () => {
  const features = [
    { text: "Comprehensive Financial Management automating ledgers, reconciliations, and multi-currency transactions" },
    { text: "AI-enhanced Human Resources tracking payroll, performance, and multi-tiered departmental KPIs" },
    { text: "Dynamic Inventory & Supply Chain Management utilizing predictive procurement analytics" },
    { text: "Omnichannel Customer Relationship Management (CRM) tailored to B2B and B2C operational models" },
    { text: "Agile Project Management frameworks embedded directly into cross-departmental workflows" },
    { text: "Real-time, customizable BI Reporting dashboards visualising complex enterprise data streams" },
    { text: "Agnostic Cloud-based architecture guaranteeing secure access from any geographic location" },
    { text: "Bespoke workflow automation reducing repetitive administrative friction by up to 40%" },
  ];

  const detailedContent = (
    <>
      <p>
        Scaling an enterprise requires moving beyond disjointed software silos. Our ERP As A Service platform consolidates fragmented departmental operations into a singular, unified ecosystem. Designed for maximum configurability, it maps directly to your organization's unique procedural logic without enforcing rigid, unnatural operational constraints.
      </p>
      <p>
        By migrating to a managed ERP model, businesses eliminate prohibitive upfront licensing and infrastructure costs. Vilcom handles the heavy lifting—from continuous updates to rigorous database maintenance and security patching. The result is a highly responsive, future-proof operational nervous system that empowers your executives to make data-driven decisions instantly.
      </p>
    </>
  );

  return (
    <ServicePage
      title="ERP As A Service"
      subtitle="Streamline. Simplify. Succeed."
      description="Vilcom's ERP As A Service delivers highly unified, modular enterprise administration tools engineered for peak operational efficiency. Consolidate complex workflows, eradicate departmental data silos, and leverage real-time business intelligence with a scalable platform tailored exactly to your industry demands."
      detailedContent={detailedContent}
      features={features}
      technologies={["SAP HANA", "Oracle Cloud", "PostgreSQL", "React", "Node.js", "Redis", "Power BI", "AWS/Azure Cloud"]}
      icon={<Briefcase className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)]"
      iconColor="text-white"
      serviceType="erp_services"
    />
  );
};

export default ErpService;
