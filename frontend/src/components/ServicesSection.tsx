import { Wifi, Server, Globe, ArrowRight, Gauge, Shield, Headset } from "lucide-react";

const gallery = [
  { label: "Sokoni", subtitle: "Market connectivity", gradient: "from-[hsl(340,75%,70%)] to-[hsl(320,70%,55%)]" },
  { label: "Nyumbani", subtitle: "Home fiber solutions", gradient: "from-[hsl(30,100%,70%)] to-[hsl(40,100%,55%)]" },
  { label: "Shuleni", subtitle: "School networks", gradient: "from-[hsl(200,85%,70%)] to-[hsl(220,80%,55%)]" },
];

const features = [
  { icon: Gauge, title: "Ultra Speed", description: "Up to 1Gbps symmetric fiber for seamless streaming and gaming.", accent: "bg-[hsl(30,100%,60%)/0.3]", iconGradient: "bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(45,100%,50%)]" },
  { icon: Shield, title: "Always Secure", description: "Enterprise-grade security protecting every connection 24/7.", accent: "bg-[hsl(340,80%,60%)/0.3]", iconGradient: "bg-gradient-to-br from-[hsl(340,80%,55%)] to-[hsl(320,70%,50%)]" },
  { icon: Headset, title: "Expert Support", description: "Dedicated local support team available around the clock.", accent: "bg-[hsl(200,90%,55%)/0.25]", iconGradient: "gradient-royal" },
];

const services = [
  {
    icon: Wifi,
    title: "Fiber Internet",
    description: "Ultra-fast fiber optic connections for homes and businesses with speeds from 20Mbps to 1Gbps.",
    blob: "bg-[hsl(340,80%,60%)/0.35]",
    iconColor: "text-[hsl(340,80%,70%)]",
  },
  {
    icon: Server,
    title: "Web Hosting",
    description: "Reliable cloud hosting solutions with 99.9% uptime, SSL certificates, and dedicated support.",
    blob: "bg-[hsl(30,100%,60%)/0.3]",
    iconColor: "text-[hsl(30,100%,70%)]",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Custom websites and web applications built with modern technologies tailored to your brand.",
    blob: "bg-[hsl(170,70%,50%)/0.3]",
    iconColor: "text-[hsl(170,70%,65%)]",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[hsl(225,50%,10%)]">
      {/* Vibrant multi-color background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-[hsl(340,80%,55%)] opacity-20 rounded-full blur-[100px]" />
        <div className="absolute top-60 right-[15%] w-80 h-80 bg-[hsl(30,100%,60%)] opacity-18 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 left-[30%] w-96 h-96 bg-[hsl(200,90%,50%)] opacity-12 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-[10%] w-64 h-64 bg-[hsl(320,70%,55%)] opacity-15 rounded-full blur-[80px]" />
        <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-[hsl(45,100%,55%)] opacity-10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] left-[60%] w-60 h-60 bg-[hsl(0,0%,100%)] opacity-5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Connectivity Gallery */}
        <div className="text-center mb-16">
          <span className="text-[hsl(30,100%,70%)] text-sm font-semibold uppercase tracking-widest">Connectivity Everywhere</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Connecting <span className="text-gradient-warm">Kenya</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
          {gallery.map((item) => (
            <div
              key={item.label}
              className="glass-dark rounded-3xl p-1 group hover:caustic-glow transition-all duration-500"
            >
              <div className={`bg-gradient-to-br ${item.gradient} rounded-2xl h-48 flex items-end p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl font-bold text-white">{item.label}</h3>
                  <p className="text-white/80 text-sm">{item.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Tiles */}
        <div className="text-center mb-12">
          <span className="text-[hsl(340,80%,70%)] text-sm font-semibold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Built for <span className="text-gradient-pink">Performance</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-dark rounded-2xl p-8 text-center group hover:royal-glow transition-all duration-500 relative overflow-hidden"
            >
              <div className={`absolute -top-8 -right-8 w-32 h-32 ${feature.accent} rounded-full blur-[40px]`} />
              <div className="relative z-10">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.iconGradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Services Cards */}
        <div className="text-center mb-12">
          <span className="text-[hsl(200,90%,70%)] text-sm font-semibold uppercase tracking-widest">Our Services</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Everything You Need to{" "}
            <span className="text-gradient-cyan">Stay Connected</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service) => (
            <div
              key={service.title}
              className="glass-dark rounded-2xl p-8 group hover:caustic-glow transition-all duration-500 cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute -bottom-6 -left-6 w-40 h-40 ${service.blob} rounded-full blur-[50px]`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-white/15 transition-colors border border-white/10">
                  <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(30,100%,70%)] group-hover:text-[hsl(30,100%,80%)] transition-colors">
                  Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
