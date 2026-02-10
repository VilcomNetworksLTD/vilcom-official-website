import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, MapPin, Phone, Mail, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const allPlans: Record<string, { name: string; speed: string; price: string; features: string[] }> = {
  lite: { name: "Lite", speed: "10 Mbps", price: "999", features: ["Unlimited Data", "Free Router", "Email Support", "48hr Install"] },
  starter: { name: "Starter", speed: "20 Mbps", price: "1,500", features: ["Unlimited Data", "Free Router", "24/7 Support", "Same-Day Install"] },
  family: { name: "Family", speed: "50 Mbps", price: "2,500", features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"] },
  premium: { name: "Premium", speed: "100 Mbps", price: "4,000", features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"] },
  startup: { name: "Startup", speed: "50 Mbps", price: "5,000", features: ["Unlimited Data", "Free Router", "SLA 99.5%", "Same-Day Install", "Static IP"] },
  growth: { name: "Growth", speed: "100 Mbps", price: "8,000", features: ["Unlimited Data", "Managed Router", "SLA 99.9%", "4hr Install", "Static IP Block", "DDoS Protection"] },
  enterprise: { name: "Enterprise", speed: "500 Mbps", price: "15,000", features: ["Unlimited Data", "Managed Network", "SLA 99.99%", "Priority Install", "IP Block /28", "DDoS Protection"] },
  datacenter: { name: "Datacenter", speed: "1 Gbps", price: "25,000", features: ["Unlimited Data", "Full Network Mgmt", "SLA 99.99%", "Priority Install", "IP Block /24", "Advanced Security"] },
};

const Signup = () => {
  const { planId } = useParams<{ planId: string }>();
  const plan = allPlans[planId || ""] || allPlans.starter;

  const [form, setForm] = useState({ name: "", location: "", phone: "", email: "" });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rich vibrant background with multiple color blobs */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,90%,94%)] via-[hsl(210,60%,96%)] to-[hsl(230,50%,94%)]" />
        <div className="absolute top-20 left-[5%] w-96 h-96 bg-[hsl(340,80%,82%)] opacity-35 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[8%] w-80 h-80 bg-[hsl(45,100%,75%)] opacity-30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[25%] w-96 h-96 bg-[hsl(280,65%,82%)] opacity-30 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] right-[30%] w-72 h-72 bg-[hsl(170,70%,78%)] opacity-25 rounded-full blur-[90px]" />
        <div className="absolute top-[10%] left-[50%] w-64 h-64 bg-[hsl(220,80%,80%)] opacity-25 rounded-full blur-[80px]" />
      </div>

      <Navbar />

      <main className="pt-28 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            to="/plans"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </Link>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8 max-w-5xl mx-auto">
            {/* Frosted Glass Slate - Sign Up Form */}
            <div className="glass-crystal rounded-3xl p-10 relative overflow-hidden">
              {/* Colored accents behind the glass */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-[hsl(200,90%,80%)/0.4] rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[hsl(340,80%,85%)/0.3] rounded-full blur-[60px]" />

              <div className="relative z-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Get Connected
                </h1>
                <p className="text-muted-foreground mb-10">
                  Fill in your details to activate your <span className="text-primary font-semibold">{plan.name}</span> plan.
                </p>

                {/* Carved Input Slate Fields */}
                <div className="space-y-5">
                  {[
                    { key: "name", label: "Full Name", icon: User, placeholder: "John Kamau", type: "text" },
                    { key: "location", label: "Estate / Location", icon: MapPin, placeholder: "Westlands, Nairobi", type: "text" },
                    { key: "phone", label: "Mobile Number", icon: Phone, placeholder: "0712 345 678", type: "tel" },
                    { key: "email", label: "Email Address", icon: Mail, placeholder: "john@example.com", type: "email" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-medium text-foreground/80 mb-2 block">
                        {field.label}
                      </label>
                      {/* Carved / inset glass input */}
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors">
                          <field.icon className="w-4 h-4" />
                        </div>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => update(field.key, e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60
                            bg-[hsl(0,0%,100%,0.12)] backdrop-blur-sm
                            border border-[hsl(0,0%,100%,0.25)]
                            shadow-[inset_0_2px_6px_hsl(220,80%,50%/0.06),inset_0_1px_2px_hsl(0,0%,0%/0.04)]
                            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                            transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Glowing Royal Blue Gemstone CTA */}
                <Button
                  className="w-full mt-10 py-6 text-base font-bold rounded-2xl border-0
                    gradient-royal text-primary-foreground
                    shadow-[0_8px_30px_hsl(220,80%,50%/0.4),0_0_60px_hsl(220,80%,50%/0.15),inset_0_1px_0_hsl(0,0%,100%/0.3)]
                    hover:shadow-[0_12px_40px_hsl(220,80%,50%/0.5),0_0_80px_hsl(220,80%,50%/0.2)]
                    hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-300"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  GET CONNECTED
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Our team will reach out within 24 hours to schedule installation.
                </p>
              </div>
            </div>

            {/* Plan Summary Card */}
            <div className="glass-crystal rounded-3xl p-8 h-fit lg:sticky lg:top-28 relative overflow-hidden">
              {/* Color accent behind */}
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[hsl(45,100%,75%)/0.4] rounded-full blur-[50px]" />

              <div className="relative z-10">
                <h2 className="font-heading text-xl font-bold text-foreground mb-1">
                  {plan.name} Plan
                </h2>
                <p className="text-primary text-sm font-medium mb-6">{plan.speed}</p>

                <div className="mb-6 pb-6 border-b border-[hsl(0,0%,100%,0.3)]">
                  <span className="text-4xl font-heading font-bold text-gradient-royal">
                    KES {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 glass rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">Free installation included</p>
                  <p className="text-xs text-muted-foreground mt-1">No contracts, cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Signup;
