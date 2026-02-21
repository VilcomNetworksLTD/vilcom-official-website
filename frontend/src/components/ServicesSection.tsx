import { Link } from "react-router-dom";
import { Wifi, Server, Globe, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Wifi,
    title: "Fiber Internet",
    description: "Ultra-fast fiber optic connections for homes and businesses with speeds from 20Mbps to 1Gbps.",
    blob: "bg-[hsl(340,80%,55%)/0.35]",
    iconColor: "text-[hsl(340,80%,55%)]",
    to: "/fiber",
  },
  {
    icon: Server,
    title: "Web Hosting",
    description: "Reliable cloud hosting solutions with 99.9% uptime, SSL certificates, and dedicated support.",
    blob: "bg-[hsl(30,100%,55%)/0.3]",
    iconColor: "text-[hsl(30,100%,55%)]",
    to: "/hosting",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Custom websites and web applications built with modern technologies tailored to your brand.",
    blob: "bg-[hsl(170,70%,45%)/0.3]",
    iconColor: "text-[hsl(170,70%,45%)]",
    to: "/web-development",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Vibrant multi-color background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-[hsl(340,80%,55%)] opacity-20 rounded-full blur-[100px]" />
        <div className="absolute top-60 right-[15%] w-80 h-80 bg-[hsl(30,100%,55%)] opacity-18 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 left-[30%] w-96 h-96 bg-[hsl(200,90%,50%)] opacity-12 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-[10%] w-64 h-64 bg-[hsl(320,70%,50%)] opacity-15 rounded-full blur-[80px]" />
        <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-[hsl(45,100%,50%)] opacity-10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] left-[60%] w-60 h-60 bg-sky-200 opacity-30 rounded-full blur-[80px]" />
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
          <span className="text-[hsl(200,90%,45%)] text-sm font-semibold uppercase tracking-widest">Our Services</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-3">
            Everything You Need to{" "}
            <span className="text-sky-500">Stay Connected</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.to}
              className="glass rounded-2xl p-8 group hover:caustic-glow transition-all duration-500 cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute -bottom-6 -left-6 w-40 h-40 ${service.blob} rounded-full blur-[50px]`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-white/70 transition-colors border border-white/50">
                  <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(30,100%,45%)] group-hover:text-[hsl(30,100%,55%)] transition-colors">
                  Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

