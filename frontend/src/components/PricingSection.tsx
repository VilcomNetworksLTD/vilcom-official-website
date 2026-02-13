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
    titleColor: "text-yellow-400",
  },
  {
    name: "Standard",
    speed: "50 Mbps",
    price: "2,500",
    features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"],
    popular: true,
    titleColor: "text-violet-400",
  },
  {
    name: "Premium",
    speed: "100 Mbps",
    price: "4,000",
    features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"],
    popular: false,
    titleColor: "text-purple-400",
  },
  {
    name: "Ultra",
    speed: "1 Gbps",
    price: "7,500",
    features: ["Unlimited Data", "WiFi 6 Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain", "Free Hosting"],
    popular: false,
    titleColor: "text-purple-500",
  },
];

const businessPlans = [
  {
    name: "Startup",
    speed: "100 Mbps",
    price: "5,000",
    features: ["Unlimited Data", "Business Router", "24/7 Priority Support", "Same-Day Install", "Static IP", "SLA Guarantee"],
    popular: false,
    titleColor: "text-yellow-400",
  },
  {
    name: "Growth",
    speed: "500 Mbps",
    price: "12,000",
    features: ["Unlimited Data", "Dual Router", "24/7 Priority Support", "Same-Day Install", "Static IPs (5)", "SLA Guarantee", "Cloud Backup"],
    popular: true,
    titleColor: "text-violet-400",
  },
  {
    name: "Enterprise",
    speed: "1 Gbps",
    price: "20,000",
    features: ["Unlimited Data", "Enterprise Router", "24/7 VIP Support", "Same-Day Install", "Static IPs (10)", "SLA Guarantee", "Cloud Backup", "Dedicated Line"],
    popular: false,
    titleColor: "text-purple-400",
  },
  {
    name: "Corporate",
    speed: "10 Gbps",
    price: "50,000",
    features: ["Unlimited Data", "Custom Setup", "24/7 VIP Support", "Same-Day Install", "Unlimited Static IPs", "SLA Guarantee", "Cloud Backup", "Dedicated Line", "24/7 On-Site Support"],
    popular: false,
    titleColor: "text-purple-500",
  },
];

const blobColors = [
  "bg-[hsl(200,90%,85%)/0.5]",
  "bg-[hsl(45,100%,80%)/0.5]",
  "bg-[hsl(280,70%,82%)/0.5]",
  "bg-[hsl(170,70%,78%)/0.45]",
];

const PricingSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background: White to Deep Sky Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      
      {/* Deep sky blue gradient overlay for richness */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/40 via-transparent to-white/30" />
      
      {/* Playful color gradient circles */}
      <div className="absolute inset-0">
        {/* Deep sky blue circle */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-[120px] opacity-50" />
        {/* Coral/orange playful circle */}
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-rose-400 via-orange-300 to-sky-400 rounded-full blur-[100px] opacity-40" />
        {/* Purple/violet playful circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 rounded-full blur-[120px] opacity-35" />
        {/* Teal playful accent */}
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-gradient-to-bl from-teal-400 via-cyan-300 to-sky-300 rounded-full blur-[80px] opacity-40" />
        {/* Pink playful accent */}
        <div className="absolute bottom-[15%] left-[10%] w-[450px] h-[450px] bg-gradient-to-tr from-pink-400 via-rose-300 to-orange-300 rounded-full blur-[90px] opacity-35" />
        {/* Indigo deep accent */}
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-gradient-to-l from-indigo-500 via-violet-400 to-purple-400 rounded-full blur-[70px] opacity-30" />
        {/* Yellow/gold playful spot */}
        <div className="absolute top-[25%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-yellow-300 via-amber-200 to-orange-300 rounded-full blur-[60px] opacity-30" />
        {/* Blue gradient accent */}
        <div className="absolute bottom-[40%] right-[30%] w-[380px] h-[380px] bg-gradient-to-t from-blue-400 via-sky-400 to-cyan-300 rounded-full blur-[80px] opacity-35" />
      </div>

      {/* Artistic VILCOM text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[12rem] lg:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-600/12 via-sky-500/8 to-sky-400/5 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      {/* Subtle contrast overlay */}
      <div className="absolute inset-0 bg-sky-100/20 backdrop-blur-[2px]" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Home Fibre Plans */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-sky-700 text-sm font-bold uppercase tracking-[0.3em]">Home Fibre</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-4 tracking-wide">
              Perfect for <span className="text-sky-700">Your Home</span>
            </h2>
            <p className="text-slate-600 mt-5 max-w-lg mx-auto text-lg font-medium">
              Reliable internet for streaming, gaming, and working from home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {homePlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-sky rounded-2xl p-8 relative transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? "golden-glow-sky" : ""
                }`}
              >
                {/* Color blob behind glass */}
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[homePlans.indexOf(plan) % blobColors.length]} rounded-full blur-[40px]`} />

                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                    <Zap className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-5">
                    <h3 className={`font-heading text-2xl font-bold ${plan.titleColor} drop-shadow-lg tracking-wide`}>{plan.name}</h3>
                    <p className="text-primary text-base font-medium mt-1.5"> {plan.speed}</p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                    <span className="text-muted-foreground text-xs ml-1">/mo</span>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground/90">
                        <Check className="w-4 h-4 text-primary shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full font-semibold border-0 rounded-xl py-5 transition-all text-base btn-golden ${
                      plan.popular ? "royal-glow hover:scale-[1.02]" : ""
                    }`}
                  >
                    <Link to="/plans">Get Started</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Fibre Plans */}
        <div>
          <div className="text-center mb-12">
            <span className="text-sky-700 text-sm font-bold uppercase tracking-[0.3em]">Business Fibre</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-4 tracking-wide">
              Power Your <span className="text-sky-700">Business</span>
            </h2>
            <p className="text-slate-600 mt-5 max-w-lg mx-auto text-lg font-medium">
              Scalable solutions with guaranteed uptime and dedicated support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {businessPlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-sky rounded-2xl p-8 relative transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? "golden-glow-sky" : ""
                }`}
              >
                {/* Color blob behind glass */}
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[businessPlans.indexOf(plan) % blobColors.length]} rounded-full blur-[40px]`} />

                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                    <Zap className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-5">
                    <h3 className={`font-heading text-2xl font-bold ${plan.titleColor} drop-shadow-lg tracking-wide`}>{plan.name}</h3>
                    <p className="text-primary text-base font-medium mt-1.5"> {plan.speed}</p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                    <span className="text-muted-foreground text-xs ml-1">/mo</span>
                  </div>
                  
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground/90">
                        <Check className="w-4 h-4 text-primary shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full font-semibold border-0 rounded-xl py-5 transition-all text-base btn-golden ${
                      plan.popular ? "royal-glow hover:scale-[1.02]" : ""
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

