import { Gamepad2 } from "lucide-react";
import ServicePage from "@/components/ServicePage";

const TechnologyEvents = () => {
  const features = [
    { text: "Immersive VR Experience Stations for corporate events" },
    { text: "Fully equipped E-Sports Arenas with broadcast capabilities" },
    { text: "Custom Software-in-VR demonstrations" },
    { text: "Interactive Security Simulation Labs for experiential learning" },
    { text: "Flexible deployment footprints (Pop-up to permanent installations)" },
    { text: "High-throughput local network infrastructure for zero latency" },
    { text: "On-site technical support and dedicated event management" },
    { text: "Tiered Pricing (Exhibition, Tournament, Custom Corporate)" },
  ];

  const detailedContent = (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Overview</h3>
          <p>
            Elevate your corporate gatherings, trade shows, and brand activations with our cutting-edge Technology Events packages. We deploy and manage high-fidelity, interactive tech zones designed to captivate audiences, merging entertainment with powerful technological demonstrations.
          </p>
        </div>

        <div>
           <h3 className="text-xl font-bold text-white mb-2">Core Offerings</h3>
           <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li><strong className="text-white">VR Experience Stations:</strong> Transport your guests into breathtaking virtual worlds using industry-leading headsets, perfect for product showcases or pure entertainment.</li>
              <li><strong className="text-white">E-Sports Arena:</strong> Turnkey competitive gaming setups including high-refresh-rate monitors, elite peripherals, local server hosting, and broadcast-ready spectator screens.</li>
              <li><strong className="text-white">Software-in-VR:</strong> Customly developed virtual reality environments designed to simulate your specific architectural plans, software interfaces, or complex machinery.</li>
              <li><strong className="text-white">Security Simulation Lab:</strong> Interactive "Escape Room" style cybersecurity simulations where teams must work together to thwart simulated cyber-attacks, blending team-building with critical security awareness.</li>
           </ul>
        </div>

        <div>
           <h3 className="text-xl font-bold text-white mb-2">Pricing Tiers</h3>
           <p className="leading-relaxed">
             <strong className="text-white">Exhibition Tier:</strong> 2-4 VR stations, perfect for small booths and localized activations. <br/>
             <strong className="text-white">Tournament Tier:</strong> Full 10-PC E-Sports stage setup + broadcast control desk.<br/>
             <strong className="text-white">Corporate Immersive:</strong> Comprehensive tech takeover including VR Software, Security Labs, and dedicated Network Engineering staff.
           </p>
        </div>
      </div>
    </>
  );

  return (
    <ServicePage
      title="Technology Events (VR & Gaming)"
      subtitle="Immersive Experiences & Competitive Arenas"
      description="Deploy unforgettable interactive technology events. We provide end-to-end management for VR Experience Stations, fully loaded E-Sports Arenas, and custom Security Simulation Labs tailored for high-impact corporate activations and entertainment."
      detailedContent={detailedContent}
      features={features}
      technologies={["Meta Quest Pro", "HTC Vive", "Unreal Engine 5", "Unity", "SteamVR", "10Gbps LAN", "OBS Studio", "vMix"]}
      icon={<Gamepad2 className="w-10 h-10" />}
      iconBgColor="bg-gradient-to-br from-[hsl(280,80%,50%)] to-[hsl(330,80%,50%)]"
      iconColor="text-white"
      serviceType="service"
    />
  );
};

export default TechnologyEvents;
