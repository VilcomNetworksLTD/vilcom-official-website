import { Monitor } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const IspDeviceManagement = () => {
  const features = [
    { text: "Centralized pan-network device monitoring presented via intuitive GIS mapped dashboards" },
    { text: "Microscopic real-time network visibility analyzing packet loss, jitter, and latency metrics" },
    { text: "Deep performance analytics generating predictive insights via machine learning algorithms" },
    { text: "Instantaneous automated fault detection isolating physical fiber breaks or logical routing errors" },
    { text: "Advanced remote troubleshooting toolkits including CLI access and diagnostic ping/traceroute" },
    { text: "Dynamic bandwidth management adjusting to network congestion and enforcing fair usage policies" },
    { text: "Exhaustive firmware version tracking ensuring network-wide compliance and security patching" },
    { text: "Intelligent alert and multi-channel notification systems integrated with Slack, SMS, and Email" },
  ];

  const detailedContent = (
    <>
      <p>
        Visibility is the cornerstone of network reliability. When an outage occurs, seconds dictate customer satisfaction. Our unified ISP Device Management solution aggregates telemetry from vast arrays of vendor-agnostic network elements—routers, switches, OLTs, and wireless access points—into a single pane of glass. This holistic overview eliminates the necessity of juggling multiple proprietary management interfaces.
      </p>
      <p>
        Moving beyond passive monitoring, this platform acts as an active administrative cockpit. Utilizing SNMP and RESTful APIs, network engineers can execute sweeping configuration changes, analyze historical throughput data, and preemptively resolve hardware degradation before customers even notice an impact. It represents true proactive network orchestration.
      </p>
    </>
  );

  return (
    <ServicePage
      title="ISP Device Management"
      subtitle="Control Every Device, Anywhere"
      description="Assume absolute command over your telecommunications infrastructure with our centralized device management solution. Aggressively monitor, remotely configure, and instantly troubleshoot thousands of varied network nodes from a unified cloud platform, guaranteeing exceptional Service Level Agreements (SLAs)."
      detailedContent={detailedContent}
      features={features}
      technologies={["SNMP v2c/v3", "Zabbix", "Prometheus", "Grafana", "InfluxDB", "Python", "Netmiko", "Syslog"]}
      icon={<Monitor className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(220,80%,50%)] to-[hsl(30,100%,55%)]"
      iconColor="text-white"
      serviceType="cpe_device"
    />
  );
};

export default IspDeviceManagement;
