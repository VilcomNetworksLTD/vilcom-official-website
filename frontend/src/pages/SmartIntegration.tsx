import { Cpu } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const SmartIntegration = () => {
  const features = [
    { text: "Comprehensive IoT device lifecycle management mapping endpoints to unified control hubs" },
    { text: "Intelligent smart building automation regulating HVAC, lighting, and biometric physical security" },
    { text: "Industrial IoT (IIoT) frameworks optimizing manufacturing floors and robotic telemetry" },
    { text: "Real-time big data analytics and 3D digital twin visualization of physical environments" },
    { text: "Unrestricted remote monitoring allowing off-site facility supervision via mobile applications" },
    { text: "Bespoke RESTful and GraphQL API bridges connecting new IoT hardware with legacy software" },
    { text: "Custom highly performant IoT dashboard development tailored to specific operational KPIs" },
    { text: "Horizontally scalable IoT architecture utilizing powerful edge-computing data aggregation" },
  ];

  const detailedContent = (
    <>
      <p>
        The physical and digital worlds are converging. Our Smart Integration services act as the connective tissue between hardware environments and enterprise software. We design, deploy, and manage dense networks of Internet of Things (IoT) sensors that extract actionable telemetry from your physical assets—whether that is a commercial skyscraper, a manufacturing plant, or an agricultural grid.
      </p>
      <p>
        Data without context is noise. Vilcom ensures that every endpoint is securely authenticated, and the massive throughput of sensor data is processed heavily at the Edge before being transported to localized or cloud databases. By integrating this intelligence directly into your existing ERP or management systems via custom APIs, we transform passive physical environments into highly responsive, self-optimizing digital ecosystems.
      </p>
    </>
  );

  return (
    <ServicePage
      title="Smart Integration"
      subtitle="IoT & Digital Transformation"
      description="Modernize your physical infrastructure with our comprehensive Internet of Things (IoT) and smart integration capabilities. We bridge the gap between complex hardware endpoints and enterprise software logic, driving unprecedented autonomous efficiency, actionable oversight, and industrial automation."
      detailedContent={detailedContent}
      features={features}
      technologies={["MQTT", "Node-RED", "AWS IoT Core", "InfluxDB", "Grafana", "GraphQL", "Edge Computing", "React Native"]}
      icon={<Cpu className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(220,80%,50%)]"
      iconColor="text-white"
      blobColor="bg-orange-500/20"
      serviceType="smart_integration"
    />
  );
};

export default SmartIntegration;
