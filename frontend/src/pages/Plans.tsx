import { useState } from "react";
import { Check, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const blobColors = [
  "bg-[hsl(200,90%,85%)/0.5]",
  "bg-[hsl(45,100%,80%)/0.5]",
  "bg-[hsl(280,70%,82%)/0.5]",
  "bg-[hsl(170,70%,78%)/0.45]",
];

const homePlans = [
  { name: "Lite", speed: "10 Mbps", price: "999", features: ["Unlimited Data", "Free Router", "Email Support", "48hr Install"] },
  { name: "Starter", speed: "20 Mbps", price: "1,500", features: ["Unlimited Data", "Free Router", "24/7 Support", "Same-Day Install"] },
  { name: "Family", speed: "50 Mbps", price: "2,500", features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"], popular: true },
  { name: "Premium", speed: "100 Mbps", price: "4,000", features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"] },
];

const businessPlans = [
  { name: "Startup", speed: "50 Mbps", price: "5,000", features: ["Unlimited Data", "Free Router", "SLA 99.5%", "Same-Day Install", "Static IP"] },
  { name: "Growth", speed: "100 Mbps", price: "8,000", features: ["Unlimited Data", "Managed Router", "SLA 99.9%", "4hr Install", "Static IP Block", "DDoS Protection"], popular: true },
  { name: "Enterprise", speed: "500 Mbps", price: "15,000", features: ["Unlimited Data", "Managed Network", "SLA 99.99%", "Priority Install", "IP Block /28", "DDoS Protection", "Dedicated Account Manager"] },
  { name: "Datacenter", speed: "1 Gbps", price: "25,000", features: ["Unlimited Data", "Full Network Mgmt", "SLA 99.99%", "Priority Install", "IP Block /24", "Advanced Security", "24/7 NOC", "Custom SLA"] },
];

const fiberPlans = [
  { name: "8 Mbps", speed: "8 Mbps", price: "2,499", features: ["Unlimited Data", "Free Router", "Standard Support", "48hr Install"] },
  { name: "18 Mbps", speed: "18 Mbps", price: "3,299", features: ["Unlimited Data", "Free Router", "Standard Support", "Same-Day Install"], popular: true },
  { name: "30 Mbps", speed: "30 Mbps", price: "4,999", features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"] },
  { name: "60 Mbps", speed: "60 Mbps", price: "7,499", features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"] },
  { name: "100 Mbps", speed: "100 Mbps", price: "9,999", features: ["Unlimited Data", "Premium Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain", "DDoS Protection"] },
];

const Plans = () => {
  const [tab, setTab] = useState<"home" | "business">("home");
  const location = useLocation();
  const isFiberRoute = location.pathname === "/fiber";
  
  const plans = tab === "home" ? homePlans : businessPlans;

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Gradient background: White to Deep Sky Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      
      {/* Deep sky blue gradient overlay for richness */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/40 via-transparent to-white/30" />
      
      {/* Vibrant background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep sky blue circle */}
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-[120px] opacity-50" />
        {/* Purple/violet playful circle */}
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 rounded-full blur-[120px] opacity-35" />
        {/* Coral/orange playful circle */}
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-rose-400 via-orange-300 to-sky-400 rounded-full blur-[100px] opacity-40" />
        {/* Teal playful accent */}
        <div className="absolute top-[70%] left-[60%] w-64 h-64 bg-gradient-to-bl from-teal-400 via-cyan-300 to-sky-300 rounded-full blur-[90px] opacity-40" />
        {/* Yellow/gold playful spot */}
        <div className="absolute top-[25%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-yellow-300 via-amber-200 to-orange-300 rounded-full blur-[60px] opacity-30" />
        {/* Blue gradient accent */}
        <div className="absolute bottom-[40%] right-[30%] w-[380px] h-[380px] bg-gradient-to-t from-blue-400 via-sky-400 to-cyan-300 rounded-full blur-[80px] opacity-35" />
      </div>

      {/* Artistic VILCOM text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-600/12 via-sky-500/8 to-sky-400/5 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-slate-800 mb-4">
              {isFiberRoute ? "Fibre Solutions" : "Choose Your"} <span className="text-sky-700">{isFiberRoute ? "" : "Plan"}</span>
            </h1>
            <p className="text-slate-600 max-w-lg mx-auto mb-8 text-lg font-medium">
              {isFiberRoute 
                ? "High-speed fibre internet solutions for homes and businesses. Experience lightning-fast connectivity with reliable service."
                : "Flexible plans for every need. All plans include free installation and no hidden fees."}
            </p>

            {!isFiberRoute && (
              /* Toggle for non-fiber routes */
              <div className="inline-flex glass-crystal rounded-full p-1">
                {(["home", "business"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      tab === t
                        ? "gradient-royal text-primary-foreground shadow-lg"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {t === "home" ? "Home Fiber" : "Business Fiber"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`grid gap-6 ${isFiberRoute ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto'}`}>
            {(isFiberRoute ? fiberPlans : plans).map((plan, i) => (
              <div
                key={plan.name}
                className={`glass-sky rounded-2xl p-6 relative transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? "golden-glow-sky" : ""
                }`}
              >
                {/* Color blob behind glass */}
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[i % blobColors.length]} rounded-full blur-[40px]`} />

                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                    <Zap className="w-3.5 h-3.5" /> Best Value
                  </div>
                )}
                <div className="relative z-10">
                  <h3 className="font-heading text-lg font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-sky-600 text-sm font-medium mb-4">{plan.speed}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                    <span className="text-slate-500 text-xs">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-700/90">
                        <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full text-sm font-semibold border-0 rounded-xl py-5 transition-all btn-golden ${
                      plan.popular ? "royal-glow" : ""
                    }`}
                  >
                    <Link to={`/signup/${plan.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Plans;

