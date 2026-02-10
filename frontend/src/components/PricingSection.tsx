import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    speed: "20 Mbps",
    price: "1,500",
    features: ["Unlimited Data", "Free Router", "24/7 Support", "Same-Day Install"],
    popular: false,
    blob: "bg-[hsl(340,80%,65%)/0.5]",
    accent: "text-[hsl(340,80%,70%)]",
    priceGradient: "text-gradient-pink",
    checkColor: "text-[hsl(340,80%,70%)]",
  },
  {
    name: "Family",
    speed: "50 Mbps",
    price: "2,500",
    features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"],
    popular: true,
    blob: "bg-[hsl(30,100%,65%)/0.5]",
    accent: "text-[hsl(30,100%,70%)]",
    priceGradient: "text-gradient-warm",
    checkColor: "text-[hsl(30,100%,70%)]",
  },
  {
    name: "Premium",
    speed: "100 Mbps",
    price: "4,000",
    features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"],
    popular: false,
    blob: "bg-[hsl(200,90%,60%)/0.5]",
    accent: "text-[hsl(200,90%,70%)]",
    priceGradient: "text-gradient-cyan",
    checkColor: "text-[hsl(200,90%,70%)]",
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[hsl(225,50%,8%)]">
      {/* Multi-color background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-[20%] w-80 h-80 bg-[hsl(340,80%,55%)] opacity-20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-[20%] w-72 h-72 bg-[hsl(30,100%,60%)] opacity-18 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-64 h-64 bg-[hsl(200,90%,50%)] opacity-12 rounded-full blur-[90px]" />
        <div className="absolute top-[30%] left-[5%] w-56 h-56 bg-[hsl(45,100%,60%)] opacity-12 rounded-full blur-[80px]" />
        <div className="absolute top-[60%] left-[40%] w-96 h-96 bg-[hsl(320,70%,50%)] opacity-8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[40%] w-60 h-60 bg-[hsl(0,0%,100%)] opacity-5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[hsl(30,100%,70%)] text-sm font-semibold uppercase tracking-widest">Pricing</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Simple, Transparent <span className="text-gradient-warm">Pricing</span>
          </h2>
          <p className="text-white/60 mt-4 max-w-lg mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-dark rounded-2xl p-8 relative transition-all duration-500 hover:caustic-glow overflow-hidden ${
                plan.popular ? "ring-2 ring-[hsl(30,100%,60%)]/30 scale-[1.03] warm-glow" : ""
              }`}
            >
              <div className={`absolute -bottom-10 -right-10 w-44 h-44 ${plan.blob} rounded-full blur-[50px]`} />

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[hsl(30,100%,55%)] to-[hsl(340,80%,55%)] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="relative z-10">
                <div className="mb-6">
                  <h3 className="font-heading text-lg font-bold text-white">{plan.name}</h3>
                  <p className={`${plan.accent} text-sm font-medium mt-1`}>{plan.speed}</p>
                </div>

                <div className="mb-8">
                  <span className={`text-4xl font-heading font-bold ${plan.priceGradient}`}>KES {plan.price}</span>
                  <span className="text-white/50 text-sm">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className={`w-4 h-4 ${plan.checkColor} shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full font-semibold border-0 rounded-xl py-5 transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-[hsl(30,100%,55%)] to-[hsl(340,80%,55%)] text-white hover:scale-[1.02]"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <Link to="/plans">Pick This Plan</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
