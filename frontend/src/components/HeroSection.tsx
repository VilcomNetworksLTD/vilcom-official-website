import { ArrowRight, Zap, Shield, Clock, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background image */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Bright overlay for glassmorphism effect */}
        <div className="absolute inset-0 bg-[hsl(220,30%,8%)/0.25]" />
      </div>

      {/* Multi-color radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[hsl(220,80%,40%)] opacity-15 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(340,80%,60%)] opacity-15 blur-[120px]" />
      <div className="absolute top-1/3 left-[10%] w-[350px] h-[350px] rounded-full bg-[hsl(30,100%,60%)] opacity-12 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[300px] h-[300px] rounded-full bg-[hsl(320,70%,60%)] opacity-10 blur-[100px]" />

      {/* Fiber optic lines - mixed colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(340,80%,60%)] to-transparent opacity-30" />
        <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(200,90%,60%)] to-transparent opacity-25" />
        <div className="absolute top-[45%] left-[10%] w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[hsl(30,100%,60%)] to-transparent opacity-25 rotate-[15deg]" />
      </div>

      {/* Bokeh lights - diverse colors */}
      <div className="absolute top-[15%] left-[15%] w-8 h-8 rounded-full bg-[hsl(340,80%,65%)] blur-[12px] animate-bokeh opacity-40" />
      <div className="absolute top-[20%] right-[20%] w-10 h-10 rounded-full bg-[hsl(30,100%,60%)] blur-[15px] animate-bokeh opacity-35" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[35%] left-[8%] w-6 h-6 rounded-full bg-white blur-[10px] animate-bokeh opacity-45" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[50%] right-[10%] w-5 h-5 rounded-full bg-[hsl(200,90%,65%)] blur-[8px] animate-bokeh opacity-40" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-[25%] right-[35%] w-7 h-7 rounded-full bg-[hsl(45,100%,60%)] blur-[11px] animate-bokeh opacity-35" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        {/* The Liquid Glass Bubble */}
        <div className="flex justify-center mb-16">
          <div className="relative animate-float">
            {/* Caustic reflections */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-8 bg-[hsl(340,80%,60%)] opacity-20 blur-[20px] rounded-full" />

            <div className="glass animate-morph w-full max-w-xl lg:max-w-2xl flex flex-col items-center text-center p-8 sm:p-10 lg:p-12 relative">
              {/* Inner refraction highlights */}
              <div className="absolute top-[15%] left-[20%] w-[40%] h-[20%] bg-white/50 rounded-full blur-[25px] rotate-[-20deg]" />
              <div className="absolute bottom-[20%] right-[15%] w-[30%] h-[15%] bg-[hsl(340,80%,60%)] opacity-25 rounded-full blur-[20px] rotate-[10deg]" />
              <div className="absolute top-[60%] left-[10%] w-[20%] h-[12%] bg-[hsl(30,100%,60%)] opacity-20 rounded-full blur-[20px] rotate-[5deg]" />

              {/* Orbiting sparkle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
                <div className="animate-orbit">
                  <div className="w-2 h-2 rounded-full bg-[hsl(340,80%,60%)] shadow-[0_0_8px_hsl(340,80%,60%)]" />
                </div>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 leading-tight mb-3">
                VILCOM NETWORKS LIMITED
              </h1>

              <h2 className="font-heading text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 mb-4">
                Internet solutions that are <span className="text-[hsl(30,100%,45%)]">affordable</span>,{" "}
                <span className="text-[hsl(30,100%,45%)]">reliable</span>,{" "}
                <span className="text-[hsl(30,100%,45%)]">responsive</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg">
                Unlock speedy connectivity with our high-speed internet! Elevate your digital presence with our top-notch hosting and web services.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  asChild
                  className="gradient-royal text-white font-semibold px-6 py-5 rounded-xl royal-glow border-0 hover:scale-105 transition-transform"
                >
                  <Link to="/plans">OUR PLANS</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-slate-700 text-slate-700 font-semibold px-6 py-5 rounded-xl hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Link to="/coverage">OUR COVERAGE</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage search bar - separate rectangle outside bubble */}
        <div className="flex justify-center mb-16">
          <div className="glass rounded-2xl p-2 flex items-center gap-2 max-w-xl w-full">
            <div className="flex items-center gap-2 px-4 flex-1">
              <Wifi className="w-5 h-5 text-[hsl(30,100%,50%)]" />
              <input
                type="text"
                placeholder="Enter your estate to check availability..."
                className="bg-transparent border-0 outline-none text-sm text-slate-700 placeholder:text-slate-500 w-full py-3"
              />
            </div>
            <Button asChild className="gradient-royal text-white font-semibold rounded-xl border-0 px-6">
              <Link to="/coverage">Check Coverage</Link>
            </Button>
          </div>
        </div>

        {/* Trust indicators - accent colors */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
          {[
            { icon: Zap, value: "1Gbps", label: "Max Speed", color: "text-[hsl(30,100%,50%)]" },
            { icon: Shield, value: "99.9%", label: "Uptime SLA", color: "text-[hsl(340,80%,55%)]" },
            { icon: Clock, value: "24/7", label: "Support", color: "text-[hsl(200,90%,50%)]" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 glass rounded-xl px-5 py-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <div className="text-lg font-heading font-bold text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

