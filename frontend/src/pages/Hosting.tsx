import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Check, ArrowRight, Zap, Globe, Database, Server, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const blobColors = [
  "bg-[hsl(200,90%,85%)/0.5]",
  "bg-[hsl(45,100%,80%)/0.5]",
  "bg-[hsl(280,70%,82%)/0.5]",
  "bg-[hsl(170,70%,78%)/0.45]",
];

const webHostingPlans = [
  { name: "Starter", price: "4,500", features: ["35GB NVMe SSD", "2GB RAM", "Free .co.ke domain", "Unlimited Bandwidth", "Free SSL", "Softaculous WordPress"] },
  { name: "Standard", price: "5,500", features: ["100GB NVMe SSD", "4GB RAM", "Free .co.ke domain", "Unlimited Bandwidth", "Free SSL", "Softaculous WordPress"], popular: true },
  { name: "Executive", price: "12,800", features: ["Unlimited NVMe SSD", "8GB RAM", "Free .co.ke domain", "Unlimited Bandwidth", "Free SSL", "Priority Support"] },
  { name: "Hosting Only", price: "2,999", features: ["35GB NVMe SSD", "2GB RAM", "No free domain", "Unlimited Bandwidth", "Free SSL", "Softaculous WordPress"] },
];

const resellerPlans = [
  { name: "Alpha", price: "7,500", features: ["100 cPanel Accounts", "Unlimited Domains", "100GB SSD", "Priority Support", "Free WHMCS"], popular: true },
  { name: "Beta", price: "12,000", features: ["300 cPanel Accounts", "Unlimited Domains", "500GB SSD", "Priority Support", "Free WHMCS", "White Label"] },
  { name: "Gamma", price: "20,000", features: ["Unlimited cPanel", "Unlimited Domains", "1TB SSD", "24/7 Dedicated Support", "Free WHMCS", "White Label", "Reseller API"] },
];

const vpsPlans = [
  { name: "Basic VPS", price: "2,000", features: ["1 Core CPU", "2GB RAM", "20GB SSD", "KVM Virtualization", "200Mbit Port", "DDoS Protection"], popular: true },
  { name: "Advanced VPS", price: "4,000", features: ["2 Core CPU", "8GB RAM", "80GB SSD", "KVM Virtualization", "400Mbit Port", "DDoS Protection"] },
  { name: "Business VPS", price: "6,000", features: ["4 Core CPU", "16GB RAM", "160GB SSD", "KVM Virtualization", "600Mbit Port", "DDoS Protection"] },
  { name: "Enterprise VPS", price: "8,000", features: ["8 Core CPU", "32GB RAM", "240GB SSD", "KVM Virtualization", "1000Mbit Port", "DDoS Protection"] },
];

const domainPrices = [
  { ext: ".com", price: "1,800" },
  { ext: ".co.ke", price: "1,200" },
  { ext: ".org", price: "2,000" },
  { ext: ".net", price: "2,200" },
  { ext: ".biz", price: "1,500" },
  { ext: ".io", price: "4,500" },
];

const Hosting = () => {
  const [tab, setTab] = useState<"web" | "reseller" | "vps">("web");
  const [domainSearch, setDomainSearch] = useState("");
  const [domainResult, setDomainResult] = useState<"available" | "taken" | null>(null);
  
  const plans = tab === "web" ? webHostingPlans : tab === "reseller" ? resellerPlans : vpsPlans;

  const handleDomainSearch = () => {
    if (domainSearch.trim()) {
      // Simulate domain check - in real app, this would call API
      setDomainResult(Math.random() > 0.5 ? "available" : "taken");
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Gradient background: White to Sky Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      
      {/* Sky blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/20 via-transparent to-white/20" />
      
      {/* Animated blobs - lighter and brighter */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-cyan-300 via-sky-300 to-blue-300 rounded-full blur-[100px] opacity-50" />
      </div>

      {/* Watermark - Removed */}
      {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-600/15 via-sky-500/8 to-sky-400/5 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          HOSTING
        </h1>
      </div> */}

      <Navbar />
      
      <main className="pt-28 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
              Web <span className="text-sky-700">Hosting</span>
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">
              Powerful, secure, and scalable hosting solutions. Choose the perfect plan for your needs.
            </p>
          </div>

          {/* Domain Search Card - Split Design - Brighter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="glass-sky backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden shadow-xl">
              <div className="grid md:grid-cols-2">
                {/* Left: Domain Search */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-sky-200/30">
                  <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">
                    Find Your Perfect Domain
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Check availability and register your domain today
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Enter domain name"
                        value={domainSearch}
                        onChange={(e) => {
                          setDomainSearch(e.target.value);
                          setDomainResult(null);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-sky-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                      />
                    </div>
                    <Button 
                      onClick={handleDomainSearch}
                      className="bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl px-6"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  {domainResult && (
                    <div className={`mt-4 p-3 rounded-xl ${domainResult === "available" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"}`}>
                      <p className={`text-sm font-medium ${domainResult === "available" ? "text-green-700" : "text-red-700"}`}>
                        {domainResult === "available" 
                          ? `✓ ${domainSearch}.com is available!` 
                          : `✗ ${domainSearch}.com is already taken`}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Right: Domain Prices - Brighter */}
                <div className="p-8 bg-gradient-to-br from-sky-100 to-cyan-50">
                  <h3 className="font-heading text-lg font-bold text-slate-800 mb-3">
                    Popular Extensions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {domainPrices.map((domain) => (
                      <div key={domain.ext} className="flex justify-between items-center p-2 rounded-lg bg-white/60">
                        <span className="text-slate-700 text-sm font-medium">{domain.ext}</span>
                        <span className="text-sky-600 text-sm font-bold">KSh. {domain.price}</span>
                      </div>
                    ))}
                  </div>
                  <Link 
                    to="/domains" 
                    className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 mt-3 transition-colors font-medium"
                  >
                    View all extensions <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex glass-crystal rounded-full p-1">
              {([
                { key: "web", label: "Web Hosting", icon: Globe },
                { key: "reseller", label: "Reseller", icon: Server },
                { key: "vps", label: "VPS", icon: Database },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                    tab === t.key
                      ? "gradient-royal text-primary-foreground shadow-lg"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`glass-sky rounded-2xl p-6 relative transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? "golden-glow-sky" : ""
                }`}
              >
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[i % blobColors.length]} rounded-full blur-[40px]`} />

                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                    <Zap className="w-3.5 h-3.5" /> Best Value
                  </div>
                )}
                <div className="relative z-10">
                  <h3 className="font-heading text-lg font-bold text-slate-800">{plan.name}</h3>
                  <div className="mb-4 mt-2">
                    <span className="text-3xl font-heading font-bold text-gradient-royal">KSh. {plan.price}</span>
                    <span className="text-slate-500 text-xs">
                      {tab === "vps" ? "/mo" : "/yr"}
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-700/90">
                        <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full text-sm font-semibold border-0 rounded-xl py-5 transition-all btn-golden ${
                      plan.popular ? "royal-glow" : ""
                    }`}
                  >
                    <Link to={`/signup?plan=${tab}-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-slate-800 text-center mb-8">
              All Plans Include
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {[
                "Free SSL Certificate",
                "24/7 Technical Support",
                "99.9% Uptime Guarantee",
                "Automated Backups",
                "DDoS Protection",
                "Instant Setup",
                "Money Back Guarantee",
                "Free Site Migration"
              ].map((feature) => (
                <div 
                  key={feature}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-sky-200/30"
                >
                  <Gift className="w-4 h-4 text-sky-500" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Hosting;

