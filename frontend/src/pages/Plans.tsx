import { useState } from "react";
import { Check, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const blobColors = [
  "bg-[hsl(340,80%,85%)/0.5]",
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

const Plans = () => {
  const [tab, setTab] = useState<"home" | "business">("home");
  const plans = tab === "home" ? homePlans : businessPlans;

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Vibrant background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-[hsl(340,80%,85%)] opacity-30 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-[hsl(280,70%,85%)] opacity-25 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-[hsl(45,100%,80%)] opacity-25 rounded-full blur-[100px]" />
        <div className="absolute top-[70%] left-[60%] w-64 h-64 bg-[hsl(170,70%,80%)] opacity-20 rounded-full blur-[90px]" />
      </div>

      <Navbar />
      <main className="pt-28 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-foreground mb-4">
              Choose Your <span className="text-gradient-royal">Plan</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Flexible plans for every need. All plans include free installation and no hidden fees.
            </p>

            {/* Toggle */}
            <div className="inline-flex glass-crystal rounded-full p-1">
              {(["home", "business"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    tab === t
                      ? "gradient-royal text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "home" ? "Home Fiber" : "Business Fiber"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`glass-crystal rounded-2xl p-6 relative transition-all duration-500 hover:caustic-glow overflow-hidden ${
                  plan.popular ? "ring-2 ring-primary/20 royal-glow" : ""
                }`}
              >
                {/* Color blob behind glass */}
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[i % blobColors.length]} rounded-full blur-[40px]`} />

                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-royal text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Zap className="w-3 h-3" /> Best Value
                  </div>
                )}
                <div className="relative z-10">
                  <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-primary text-sm font-medium mb-4">{plan.speed}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                    <span className="text-muted-foreground text-xs">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-foreground/90">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full text-sm font-semibold border-0 rounded-xl py-5 ${
                      plan.popular ? "gradient-royal text-primary-foreground royal-glow" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    <Link to={`/signup/${plan.name.toLowerCase()}`}>
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
