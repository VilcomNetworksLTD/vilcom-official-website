import { ArrowRight, Zap, Shield, Clock, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-dark-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark hero background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Overlay to deepen + tint */}
        <div className="absolute inset-0 bg-[hsl(220,60%,8%)/0.55]" />
      </div>

      {/* Multi-color radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[hsl(220,80%,40%)] opacity-10 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(340,80%,60%)] opacity-12 blur-[120px]" />
      <div className="absolute top-1/3 left-[10%] w-[350px] h-[350px] rounded-full bg-[hsl(30,100%,65%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[300px] h-[300px] rounded-full bg-[hsl(320,70%,70%)] opacity-8 blur-[100px]" />

      {/* Fiber optic lines - mixed colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(340,80%,65%)] to-transparent opacity-25" />
        <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(200,90%,60%)] to-transparent opacity-20" />
        <div className="absolute top-[45%] left-[10%] w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[hsl(30,100%,65%)] to-transparent opacity-20 rotate-[15deg]" />
      </div>

      {/* Bokeh lights - diverse colors */}
      <div className="absolute top-[15%] left-[15%] w-8 h-8 rounded-full bg-[hsl(340,80%,70%)] blur-[12px] animate-bokeh opacity-30" />
      <div className="absolute top-[20%] right-[20%] w-10 h-10 rounded-full bg-[hsl(30,100%,65%)] blur-[15px] animate-bokeh opacity-25" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[35%] left-[8%] w-6 h-6 rounded-full bg-[hsl(0,0%,100%)] blur-[10px] animate-bokeh opacity-35" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[50%] right-[10%] w-5 h-5 rounded-full bg-[hsl(200,90%,70%)] blur-[8px] animate-bokeh opacity-30" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-[25%] right-[35%] w-7 h-7 rounded-full bg-[hsl(45,100%,65%)] blur-[11px] animate-bokeh opacity-25" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        {/* The Liquid Glass Bubble */}
        <div className="flex justify-center mb-16">
          <div className="relative animate-float">
            {/* Caustic reflections - pink tinted */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-8 bg-[hsl(340,80%,65%)] opacity-15 blur-[20px] rounded-full" />

            <div className="glass-bubble-dark animate-morph w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[540px] lg:h-[540px] flex flex-col items-center justify-center text-center p-12 relative">
              {/* Inner refraction highlights */}
              <div className="absolute top-[15%] left-[20%] w-[40%] h-[20%] bg-white/30 rounded-full blur-[20px] rotate-[-20deg]" />
              <div className="absolute bottom-[20%] right-[15%] w-[30%] h-[15%] bg-[hsl(340,80%,70%)] opacity-20 rounded-full blur-[15px] rotate-[10deg]" />
              <div className="absolute top-[60%] left-[10%] w-[20%] h-[12%] bg-[hsl(30,100%,70%)] opacity-15 rounded-full blur-[15px] rotate-[5deg]" />

              {/* Orbiting sparkle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
                <div className="animate-orbit">
                  <div className="w-2 h-2 rounded-full bg-[hsl(340,80%,70%)] shadow-[0_0_8px_hsl(340,80%,70%)]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-5 border border-white/25 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-[hsl(30,100%,65%)]" />
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Next-Gen Fiber</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Unlock <span className="text-gradient-pink">Speedy</span>{" "}
                <span className="text-gradient-warm">Connectivity</span>
              </h1>

              <p className="text-sm sm:text-base text-white/70 max-w-xs mx-auto mb-6">
                Experience blazing speeds up to 1Gbps with 99.9% uptime.
              </p>

              <Button
                asChild
                className="gradient-royal text-primary-foreground font-semibold px-8 py-6 rounded-2xl royal-glow border-0 hover:scale-105 transition-transform"
              >
                <Link to="/plans">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Coverage search bar */}
        <div className="flex justify-center mb-16">
          <div className="glass-dark rounded-2xl p-2 flex items-center gap-2 max-w-xl w-full">
            <div className="flex items-center gap-2 px-4 flex-1">
              <Wifi className="w-5 h-5 text-[hsl(30,100%,70%)]" />
              <input
                type="text"
                placeholder="Enter your estate to check availability..."
                className="bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/40 w-full py-3"
              />
            </div>
            <Button asChild className="gradient-royal text-primary-foreground font-semibold rounded-xl border-0 px-6">
              <Link to="/coverage">Check Coverage</Link>
            </Button>
          </div>
        </div>

        {/* Trust indicators - varied accent colors */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
          {[
            { icon: Zap, value: "1Gbps", label: "Max Speed", color: "text-[hsl(30,100%,70%)]" },
            { icon: Shield, value: "99.9%", label: "Uptime SLA", color: "text-[hsl(340,80%,70%)]" },
            { icon: Clock, value: "24/7", label: "Support", color: "text-[hsl(200,90%,70%)]" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 glass-dark rounded-xl px-5 py-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <div className="text-lg font-heading font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
