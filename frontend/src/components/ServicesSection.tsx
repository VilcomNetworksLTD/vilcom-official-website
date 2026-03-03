import { Link } from "react-router-dom";
import { Wifi, Server, Globe, ArrowRight, Cloud, Shield, Cpu, Smartphone, Briefcase, CreditCard, Plug, Monitor, Lock, Satellite } from "lucide-react";

const services = [
  {
    icon: Wifi,
    title: "Internet Connectivity",
    description: "High-speed fiber internet for homes and businesses with reliable, blazing-fast connections.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/fiber",
    hasSubLinks: true,
    subLinks: [
      { label: "Home", to: "/plans?tab=home" },
      { label: "Business", to: "/plans?tab=business" },
    ],
  },
  {
    icon: Server,
    title: "Enterprise Connectivity",
    description: "Secure, reliable, and scalable network solutions that keep your business seamlessly connected.",
    blob: "bg-[hsl(30,100%,50%)/0.2]",
    iconColor: "text-[hsl(30,100%,50%)]",
    to: "/plans",
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    description: "Vilcom Drive/Photos services for storage, collaboration, and flexible digital growth.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/cloud-solutions",
  },
  {
    icon: Shield,
    title: "Cyber Security",
    description: "Safeguard your data, people, and business against digital threats.",
    blob: "bg-[hsl(30,100%,50%)/0.2]",
    iconColor: "text-[hsl(30,100%,50%)]",
    to: "/cyber-security",
  },
  {
    icon: Cpu,
    title: "Smart Integration",
    description: "IoT and digital tools to streamline and transform business operations.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/smart-integration",
  },
  {
    icon: Smartphone,
    title: "Software Development",
    description: "Android, iOS, & Web Development - Custom app and web solutions tailored for your business needs.",
    blob: "bg-[hsl(30,100%,50%)/0.2]",
    iconColor: "text-[hsl(30,100%,50%)]",
    to: "/software-development",
  },
  {
    icon: Briefcase,
    title: "ERP As A Service",
    description: "Streamline. Simplify. Succeed. Integrated enterprise management tools for efficient business processes.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/erp-service",
  },
  {
    icon: CreditCard,
    title: "ISP Billing As A Service",
    description: "Smart billing, seamless growth. Simplified, automated billing solutions for Internet Service Providers.",
    blob: "bg-[hsl(30,100%,50%)/0.2]",
    iconColor: "text-[hsl(30,100%,50%)]",
    to: "/isp-billing",
  },
  {
    icon: Plug,
    title: "ISP CPE As A Service",
    description: "Plug in. Power up. Provisioned. Automated customer device setup for smooth ISP operations.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/isp-cpe",
  },
  {
    icon: Monitor,
    title: "ISP Device Management",
    description: "Control every device, anywhere. Centralized control and monitoring of ISP devices.",
    blob: "bg-[hsl(30,100%,50%)/0.2]",
    iconColor: "text-[hsl(30,100%,50%)]",
    to: "/isp-device-management",
  },
  {
    icon: Lock,
    title: "Firewall Solutions",
    description: "Your digital shield, always on. Advanced protection against network threats for businesses and homes.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/firewall-solutions",
  },
  {
    icon: Shield,
    title: "Deep Packet Inspection",
    description: "See deeper. Secure smarter. Real-time traffic analysis for optimized network performance and security.",
    blob: "bg-[hsl(30,100%,50%)/0.2]",
    iconColor: "text-[hsl(30,100%,50%)]",
    to: "/deep-packet-inspection",
  },
  {
    icon: Satellite,
    title: "Satellite Connectivity",
    description: "Connecting the unserved, everywhere. Remote area satellite connectivity delivering reliable internet.",
    blob: "bg-[hsl(25,90%,55%)/0.2]",
    iconColor: "text-[hsl(25,90%,55%)]",
    to: "/satellite-connectivity",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Deep royal Blue-to-light navy blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219, 74%, 22%)] via-[hsl(235, 95%, 32%)] to-[hsl(221, 89%, 48%)]" />

      {/* Soft blurred glowing blobs in warm orange, peach, and light teal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      
      {/* Additional warm accent blobs */}
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />

      {/* Concentric rings for geometric depth */}
      <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] border border-white/5 rounded-full opacity-30" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] border border-white/3 rounded-full opacity-20" />
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] border border-white/2 rounded-full opacity-15" />
      
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] border border-white/5 rounded-full opacity-25" />
      <div className="absolute bottom-[10%] right-[20%] w-[200px] h-[200px] border border-white/3 rounded-full opacity-15" />

      {/* Floating ghost blobs */}
      <div className="absolute top-[20%] left-[15%] w-[100px] h-[100px] rounded-full bg-white/5 blur-[30px]" />
      <div className="absolute top-[50%] left-[70%] w-[80px] h-[80px] rounded-full bg-white/3 blur-[25px]" />
      <div className="absolute bottom-[30%] left-[25%] w-[120px] h-[120px] rounded-full bg-white/4 blur-[35px]" />
      <div className="absolute top-[70%] right-[35%] w-[60px] h-[60px] rounded-full bg-white/3 blur-[20px]" />

      {/* Wave lines - visible through glass cards - bright white */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Horizontal wavy lines with gradient and blur - white */}
        <div className="absolute top-[12%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-40" />
        <div className="absolute top-[28%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-30" />
        <div className="absolute top-[44%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-35" />
        <div className="absolute top-[60%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-25" />
        <div className="absolute top-[76%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-30" />
        <div className="absolute top-[92%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* COMMENTED OUT: Connectivity Gallery */}
        {/*
        <div className="text-center mb-16">
          <span className="text-[hsl(30,100%,45%)] text-sm font-semibold uppercase tracking-widest">Connectivity Everywhere</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-3">
            Connecting <span className="text-gradient-royal">Kenya</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
          {gallery.map((item) => (
            <div
              key={item.label}
              className="glass rounded-3xl p-1 group hover:caustic-glow transition-all duration-500"
            >
              <div className={`bg-gradient-to-br ${item.gradient} rounded-2xl h-48 flex items-end p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl font-bold text-slate-800">{item.label}</h3>
                  <p className="text-slate-700 text-sm">{item.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        */}

        {/* COMMENTED OUT: Feature Tiles - Why Choose Us */}
        {/*
        <div className="text-center mb-12">
          <span className="text-[hsl(340,80%,50%)] text-sm font-semibold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-3">
            Built for <span className="text-gradient-royal">Performance</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-8 text-center group hover:royal-glow transition-all duration-500 relative overflow-hidden"
            >
              <div className={`absolute -top-8 -right-8 w-32 h-32 ${feature.accent} rounded-full blur-[40px]`} />
              <div className="relative z-10">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.iconGradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        */}

        {/* Our Services */}
        <div className="text-center mb-12">
          <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Our Services</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Everything You Need to{" "}
            <span className="text-white">Stay Connected</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.to}
              className="relative rounded-3xl p-8 group hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              {/* Inner glow effect for beveled edges */}
              <div className="absolute inset-0 rounded-3xl" style={{
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)'
              }} />
              <div className={`absolute -bottom-4 -left-4 w-32 h-32 ${service.blob} rounded-full blur-[80px]`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors border border-white/20" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'}}>
                  <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">{service.description}</p>
                
                {/* Sub-links for Internet Connectivity */}
                {service.hasSubLinks && service.subLinks ? (
                  <div className="flex gap-3 mt-2">
                    {service.subLinks.map((subLink) => (
                      <Link
                        key={subLink.label}
                        to={subLink.to}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

