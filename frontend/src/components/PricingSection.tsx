import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const homePlans = [
  {
    name: "Basic",
    speed: "20 Mbps",
    price: "1,500",
    features: ["Unlimited Data", "Free Router", "24/7 Support", "Same-Day Install"],
    popular: false,
    blob: "bg-[hsl(340,80%,55%)/0.4]",
    accent: "text-[hsl(340,80%,55%)]",
    priceGradient: "text-gradient-royal",
    checkColor: "text-[hsl(340,80%,55%)]",
  },
  {
    name: "Standard",
    speed: "50 Mbps",
    price: "2,500",
    features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"],
    popular: true,
    blob: "bg-[hsl(30,100%,50%)/0.4]",
    accent: "text-[hsl(30,100%,50%)]",
    priceGradient: "text-[hsl(30,100%,45%)]",
    checkColor: "text-[hsl(30,100%,50%)]",
  },
  {
    name: "Premium",
    speed: "100 Mbps",
    price: "4,000",
    features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"],
    popular: false,
    blob: "bg-[#0070BB]/0.4]",
    accent: "text-[#0070BB]",
    priceGradient: "text-[#0070BB]",
    checkColor: "text-[#0070BB]",
  },
  {
    name: "Ultra",
    speed: "1 Gbps",
    price: "7,500",
    features: ["Unlimited Data", "WiFi 6 Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain", "Free Hosting"],
    popular: false,
    blob: "bg-[hsl(45,100%,50%)/0.4]",
    accent: "text-[hsl(45,100%,50%)]",
    priceGradient: "text-[hsl(45,100%,45%)]",
    checkColor: "text-[hsl(45,100%,50%)]",
  },
];

const businessPlans = [
  {
    name: "Startup",
    speed: "100 Mbps",
    price: "5,000",
    features: ["Unlimited Data", "Business Router", "24/7 Priority Support", "Same-Day Install", "Static IP", "SLA Guarantee"],
    popular: false,
    blob: "bg-[#0070BB]/0.4]",
    accent: "text-[#0070BB]",
    priceGradient: "text-[#0070BB]",
    checkColor: "text-[#0070BB]",
  },
  {
    name: "Growth",
    speed: "500 Mbps",
    price: "12,000",
    features: ["Unlimited Data", "Dual Router", "24/7 Priority Support", "Same-Day Install", "Static IPs (5)", "SLA Guarantee", "Cloud Backup"],
    popular: true,
    blob: "bg-[hsl(30,100%,50%)/0.4]",
    accent: "text-[hsl(30,100%,50%)]",
    priceGradient: "text-[hsl(30,100%,45%)]",
    checkColor: "text-[hsl(30,100%,50%)]",
  },
  {
    name: "Enterprise",
    speed: "1 Gbps",
    price: "20,000",
    features: ["Unlimited Data", "Enterprise Router", "24/7 VIP Support", "Same-Day Install", "Static IPs (10)", "SLA Guarantee", "Cloud Backup", "Dedicated Line"],
    popular: false,
    blob: "bg-[hsl(340,80%,55%)/0.4]",
    accent: "text-[hsl(340,80%,55%)]",
    priceGradient: "text-gradient-royal",
    checkColor: "text-[hsl(340,80%,55%)]",
  },
  {
    name: "Corporate",
    speed: "10 Gbps",
    price: "50,000",
    features: ["Unlimited Data", "Custom Setup", "24/7 VIP Support", "Same-Day Install", "Unlimited Static IPs", "SLA Guarantee", "Cloud Backup", "Dedicated Line", "24/7 On-Site Support"],
    popular: false,
    blob: "bg-[hsl(45,100%,50%)/0.4]",
    accent: "text-[hsl(45,100%,50%)]",
    priceGradient: "text-[hsl(45,100%,45%)]",
    checkColor: "text-[hsl(45,100%,50%)]",
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0070BB] via-[#005a91] to-[#004475]" />
      
      {/* Geometric patterns overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Horizontal lines */}
        <div className="absolute top-[15%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute top-[35%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute top-[55%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute top-[75%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Vertical lines */}
        <div className="absolute top-0 bottom-0 left-[20%] w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 bottom-0 left-[40%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        <div className="absolute top-0 bottom-0 left-[60%] w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 bottom-0 left-[80%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-[#0070BB] opacity-25 rounded-full blur-[100px]" />
        <div className="absolute top-60 right-[15%] w-72 h-72 bg-[hsl(200,90%,60%)] opacity-20 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 left-[30%] w-96 h-96 bg-[#0070BB] opacity-15 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-[10%] w-64 h-64 bg-[hsl(200,90%,60%)] opacity-20 rounded-full blur-[80px]" />
        <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-[#0070BB] opacity-12 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] left-[60%] w-60 h-60 bg-sky-300 opacity-25 rounded-full blur-[80px]" />
        
        {/* Geometric shapes - Triangles */}
        <div className="absolute top-[25%] right-[25%] w-0 h-0 border-l-[40px] border-l-transparent border-b-[70px] border-b-white/10 border-r-[40px] border-r-transparent" />
        <div className="absolute bottom-[30%] left-[15%] w-0 h-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-white/08 border-r-[30px] border-r-transparent" />
        
        {/* Geometric shapes - Squares/Rectangles */}
        <div className="absolute top-[40%] left-[8%] w-20 h-20 border border-white/10 rotate-45 rounded-lg" />
        <div className="absolute bottom-[15%] right-[30%] w-16 h-16 border border-white/08 rotate-12 rounded-lg" />
        <div className="absolute top-[65%] right-[5%] w-24 h-12 border border-white/06 rotate-[-15deg] rounded-lg" />
        <div className="absolute bottom-[45%] left-[25%] w-14 h-14 border border-white/10 rotate-[-30deg] rounded-lg" />
        
        {/* Dots pattern */}
        <div className="absolute top-[28%] left-[45%] w-1.5 h-1.5 bg-white/30 rounded-full" />
        <div className="absolute bottom-[28%] right-[45%] w-1.5 h-1.5 bg-white/25 rounded-full" />
        <div className="absolute top-[48%] left-[15%] w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute bottom-[48%] right-[15%] w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute top-[68%] left-[35%] w-1.5 h-1.5 bg-white/25 rounded-full" />
        <div className="absolute bottom-[68%] left-[65%] w-1 h-1 bg-white/30 rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-[hsl(200,90%,75%)] text-sm font-bold uppercase tracking-[0.3em]">Home Fibre</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-4 tracking-wide">
              Perfect for <span className="text-[hsl(200,90%,75%)]">Your Home</span>
            </h2>
            <p className="text-white/80 mt-5 max-w-lg mx-auto text-lg font-medium">
              Reliable internet for streaming, gaming, and working from home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {homePlans.map((plan) => (
              <div
                key={plan.name}
                className="glass-crystal rounded-2xl p-8 group transition-all duration-500 cursor-pointer relative overflow-hidden border border-white/25"
              >
                {/* Enhanced glassmorphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-tl from-white/15 via-transparent to-transparent rounded-2xl" />
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 opacity-50">
                  <div className="absolute top-3 left-5 w-8 h-0.5 bg-white/45 rotate-45" />
                  <div className="absolute top-10 left-2 w-0.5 h-14 bg-white/35 -rotate-12" />
                  <div className="absolute top-5 left-12 w-7 h-0.5 bg-white/40 rotate-[30deg]" />
                  <div className="absolute bottom-14 right-5 w-12 h-0.5 bg-white/30 -rotate-6" />
                  <div className="absolute bottom-8 right-10 w-0.5 h-10 bg-white/25 rotate-20" />
                </div>
                
                {/* Animated sparkle dots */}
                <div className="absolute top-4 right-5 w-2.5 h-2.5 rounded-full bg-white/70 backdrop-blur-sm animate-pulse shadow-lg shadow-white/50" />
                <div className="absolute top-9 left-9 w-1.5 h-1.5 rounded-full bg-white/60 backdrop-blur-sm animate-pulse" style={{ animationDelay: "0.3s" }} />
                <div className="absolute bottom-18 left-5 w-2 h-2 rounded-full bg-white/55 backdrop-blur-sm animate-pulse" style={{ animationDelay: "0.7s" }} />
                <div className="absolute bottom-10 right-14 w-1.5 h-1.5 rounded-full bg-white/65 backdrop-blur-sm animate-pulse" style={{ animationDelay: "1s" }} />
                
                {/* Color blob */}
                <div className={`absolute -bottom-8 -left-8 w-44 h-44 ${plan.blob} rounded-full blur-[70px]`} />
                
                {/* Top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-b from-white/25 to-transparent rounded-full blur-[50px]" />
                
                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/20 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/20 rounded-bl-xl" />
                
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0070BB] to-[hsl(200,90%,50%)] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                    <Zap className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-5">
                    <h3 className="font-heading text-2xl font-bold text-white drop-shadow-lg tracking-wide">{plan.name}</h3>
                    <p className={`${plan.accent} text-base font-semibold mt-1.5 drop-shadow-md`}>{plan.speed}</p>
                  </div>
                  
                  {/* Enhanced price section with glass background */}
                  <div className="mb-6 bg-gradient-to-r from-white/15 to-white/05 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                    <span className={`text-4xl font-heading font-bold text-white drop-shadow-lg ${plan.priceGradient}`}>KES {plan.price}</span>
                    <span className="text-white/90 text-sm font-semibold ml-1">/mo</span>
                  </div>
                  
                  <ul className="space-y-3.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-base text-white/95 font-medium">
                        <div className="w-5.5 h-5.5 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/35 shadow-sm">
                          <Check className={`w-3.5 h-3.5 ${plan.checkColor}`} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full font-semibold border-0 rounded-xl py-4.5 transition-all text-base ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#0070BB] to-[hsl(200,90%,50%)] text-white hover:scale-[1.02] shadow-lg shadow-[#0070BB]/40 hover:shadow-[#0070BB]/50"
                        : "bg-white/25 backdrop-blur-sm text-white hover:bg-white/35 border border-white/30 hover:border-white/40"
                    }`}
                  >
                    <Link to="/plans">Get Started</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <span className="text-[hsl(200,90%,75%)] text-sm font-bold uppercase tracking-[0.3em]">Business Fibre</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-4 tracking-wide">
              Power Your <span className="text-[hsl(200,90%,75%)]">Business</span>
            </h2>
            <p className="text-white/80 mt-5 max-w-lg mx-auto text-lg font-medium">
              Scalable solutions with guaranteed uptime and dedicated support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {businessPlans.map((plan) => (
              <div
                key={plan.name}
                className="glass-crystal rounded-2xl p-8 group transition-all duration-500 cursor-pointer relative overflow-hidden border border-white/25"
              >
                {/* Enhanced glassmorphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-tl from-white/15 via-transparent to-transparent rounded-2xl" />
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 opacity-50">
                  <div className="absolute top-3 left-5 w-8 h-0.5 bg-white/45 rotate-45" />
                  <div className="absolute top-10 left-2 w-0.5 h-14 bg-white/35 -rotate-12" />
                  <div className="absolute top-5 left-12 w-7 h-0.5 bg-white/40 rotate-[30deg]" />
                  <div className="absolute bottom-14 right-5 w-12 h-0.5 bg-white/30 -rotate-6" />
                  <div className="absolute bottom-8 right-10 w-0.5 h-10 bg-white/25 rotate-20" />
                </div>
                
                {/* Animated sparkle dots */}
                <div className="absolute top-4 right-5 w-2.5 h-2.5 rounded-full bg-white/70 backdrop-blur-sm animate-pulse shadow-lg shadow-white/50" />
                <div className="absolute top-9 left-9 w-1.5 h-1.5 rounded-full bg-white/60 backdrop-blur-sm animate-pulse" style={{ animationDelay: "0.3s" }} />
                <div className="absolute bottom-18 left-5 w-2 h-2 rounded-full bg-white/55 backdrop-blur-sm animate-pulse" style={{ animationDelay: "0.7s" }} />
                <div className="absolute bottom-10 right-14 w-1.5 h-1.5 rounded-full bg-white/65 backdrop-blur-sm animate-pulse" style={{ animationDelay: "1s" }} />
                
                {/* Color blob */}
                <div className={`absolute -bottom-8 -left-8 w-44 h-44 ${plan.blob} rounded-full blur-[70px]`} />
                
                {/* Top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-b from-white/25 to-transparent rounded-full blur-[50px]" />
                
                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/20 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/20 rounded-bl-xl" />
                
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0070BB] to-[hsl(200,90%,50%)] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                    <Zap className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-5">
                    <h3 className="font-heading text-2xl font-bold text-white drop-shadow-lg tracking-wide">{plan.name}</h3>
                    <p className={`${plan.accent} text-base font-semibold mt-1.5 drop-shadow-md`}>{plan.speed}</p>
                  </div>
                  
                  {/* Enhanced price section with glass background */}
                  <div className="mb-6 bg-gradient-to-r from-white/15 to-white/05 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                    <span className={`text-4xl font-heading font-bold text-white drop-shadow-lg ${plan.priceGradient}`}>KES {plan.price}</span>
                    <span className="text-white/90 text-sm font-semibold ml-1">/mo</span>
                  </div>
                  
                  <ul className="space-y-3.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-base text-white/95 font-medium">
                        <div className="w-5.5 h-5.5 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/35 shadow-sm">
                          <Check className={`w-3.5 h-3.5 ${plan.checkColor}`} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full font-semibold border-0 rounded-xl py-4.5 transition-all text-base ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#0070BB] to-[hsl(200,90%,50%)] text-white hover:scale-[1.02] shadow-lg shadow-[#0070BB]/40 hover:shadow-[#0070BB]/50"
                        : "bg-white/25 backdrop-blur-sm text-white hover:bg-white/35 border border-white/30 hover:border-white/40"
                    }`}
                  >
                    <Link to="/plans">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

