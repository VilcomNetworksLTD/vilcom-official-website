import { Database } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const DataAiWorkflows = () => {
  const features = [
    { text: "End-to-end AI Pipeline Architecture" },
    { text: "ETL: Seamless Data Extraction, Transformation, and Load" },
    { text: "ML: Automated Predictive Machine Learning Models" },
    { text: "NLP: Advanced Natural Language Processing Agents" },
    { text: "RESTful and GraphQL API Integrations" },
    { text: "Continuous Monitoring & Model Retraining" },
    { text: "Flexible Pricing Tiers (Startup, Enterprise, Custom)" },
    { text: "Proven Use Cases (Finance, Healthcare, Retail)" },
  ];

  const detailedContent = (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Overview & AI Pipeline</h3>
          <p>
            In the modern era, data is your most valuable asset. Our Data & AI Workflows service is designed to transform raw, unstructured data into actionable intelligence. We construct robust AI pipelines that automate the entire lifecycle of machine learning—from initial data ingestion to deployment in production environments.
          </p>
        </div>

        <div>
           <h3 className="text-xl font-bold text-white mb-2">Core Components</h3>
           <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li><strong className="text-white">ETL (Extract, Transform, Load):</strong> We build highly scalable data lakes and warehouses to aggregate disparate data sources cleanly.</li>
              <li><strong className="text-white">Machine Learning (ML):</strong> Custom predictive models tuned precisely for your industry, optimizing everything from supply chains to customer churn.</li>
              <li><strong className="text-white">Natural Language Processing (NLP):</strong> Implement intelligent chatbots, sentiment analysis, and automated document processing systems.</li>
              <li><strong className="text-white">APIs & Integrations:</strong> Expose your AI models through secure, highly available endpoints for your existing software to consume.</li>
              <li><strong className="text-white">Monitoring & Maintenance:</strong> Continuous MLOps ensuring models don't drift and remain highly accurate over time.</li>
           </ul>
        </div>

        <div>
           <h3 className="text-xl font-bold text-white mb-2">Use Cases & Pricing</h3>
           <p className="mb-2">
             Our solutions are industry-agnostic, having empowered financial institutions with fraud detection, healthcare providers with predictive diagnostics, and e-commerce platforms with hyper-personalized recommendation engines.
           </p>
           <p>
             <strong className="text-white">Pricing Tiers:</strong> We offer tiered engagement models. <em className="text-cyan-300">Startup:</em> Rapid prototyping and basic ML pipelines. <em className="text-cyan-300">Professional:</em> High-volume NLP and custom dashboards. <em className="text-cyan-300">Enterprise:</em> Full-scale MLOps, private infrastructure, and 24/7 dedicated data engineering support.
           </p>
        </div>
      </div>
    </>
  );

  return (
    <ServicePage
      title="Data & AI Workflows"
      subtitle="Transform Data into Decisive Intelligence"
      description="Architect enterprise-grade Data & AI workflows. We build comprehensive, scalable pipelines integrating rigorous ETL processes, advanced Machine Learning, and NLP capabilities designed to elevate operational efficiency and automate complex decision-making."
      detailedContent={detailedContent}
      features={features}
      technologies={["Python", "TensorFlow", "PyTorch", "Apache Kafka", "Snowflake", "Databricks", "AWS SageMaker", "Docker"]}
      icon={<Database className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(280,80%,50%)]"
      iconColor="text-white"
      serviceType="service"
    />
  );
};

export default DataAiWorkflows;
