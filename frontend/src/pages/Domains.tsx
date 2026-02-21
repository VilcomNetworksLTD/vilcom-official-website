import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Check, ArrowRight, Globe, Shield, Zap, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { productsApi } from "@/services/products";
import type { Product } from "@/services/api";

const domainFeatures = [
  { icon: Shield, title: "Domain Protection", desc: "Privacy protection to keep your info safe" },
  { icon: Zap, title: "Fast DNS", desc: "Lightning fast DNS resolution" },
  { icon: Clock, title: "Instant Setup", desc: "Domains registered instantly" },
  { icon: Globe, title: "Global Reach", desc: "Worldwide domain management" },
];

const Domains = () => {
  const [domainSearch, setDomainSearch] = useState("");
  const [domainResult, setDomainResult] = useState<"available" | "taken" | null>(null);
  const [searchedDomain, setSearchedDomain] = useState("");
  
  const handleDomainSearch = () => {
    if (domainSearch.trim()) {
      setSearchedDomain(domainSearch);
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
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-sky-400/30 to-cyan-400/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-cyan-400/20 to-sky-400/10 blur-[100px]" />
      </div>

      {/* Watermark - Removed */}
      {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-600/15 via-sky-500/8 to-sky-400/5 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          DOMAINS
        </h1>
      </div> */}

      <Navbar />
      
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section with Domain Search */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
              Find Your Perfect <span className="text-sky-700">Domain</span>
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto text-lg mb-8">
              Secure your online identity with our fast and reliable domain registration services.
            </p>

            {/* Domain Search Box */}
            <div className="max-w-2xl mx-auto">
              <div className="glass-sky backdrop-blur-xl rounded-2xl p-2 border border-white/40 shadow-xl">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter your domain name"
                      value={domainSearch}
                      onChange={(e) => {
                        setDomainSearch(e.target.value);
                        setDomainResult(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleDomainSearch()}
                      className="w-full px-6 py-4 rounded-xl bg-white/50 border border-sky-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 text-lg"
                    />
                  </div>
                  <Button 
                    onClick={handleDomainSearch}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl px-8 py-4"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Domain Extensions Quick Select */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[".com", ".co.ke", ".org", ".net", ".io", ".ke"].map((ext) => (
                  <button
                    key={ext}
                    onClick={() => {
                      setDomainSearch(domainSearch + ext.replace(".", ""));
                      setDomainResult(null);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/40 border border-sky-200 text-slate-600 text-sm hover:bg-white/60 transition-colors"
                  >
                    {ext}
                  </button>
                ))}
              </div>

              {/* Search Result - Brighter */}
              {domainResult && searchedDomain && (
                <div className={`mt-6 p-4 rounded-xl ${domainResult === "available" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"}`}>
                  <div className="flex items-center justify-center gap-3">
                    {domainResult === "available" ? (
                      <>
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="text-green-700 text-lg font-medium">
                          ✓ <strong>{searchedDomain}</strong> is available!
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl text-red-600">✗</span>
                        <span className="text-red-700 text-lg font-medium">
                          <strong>{searchedDomain}</strong> is already taken
                        </span>
                      </>
                    )}
                  </div>
                  {domainResult === "available" && (
                    <div className="flex justify-center gap-4 mt-4">
                      <Button className="bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl">
                        Register Now - KSh. 1,800/yr
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Domain Pricing Cards - Brighter */}
          <div className="mb-16">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-8">
              Domain <span className="text-sky-700">Pricing</span>
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {domainExtensions.map((domain) => (
                <div
                  key={domain.ext}
                  className={`glass-sky backdrop-blur-xl rounded-2xl p-6 border transition-all hover:scale-[1.02] ${
                    domain.popular 
                      ? "border-cyan-400/50 golden-glow-sky" 
                      : "border-white/40"
                  }`}
                >
                  {domain.popular && (
                    <div className="text-center mb-3">
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-heading text-3xl font-bold text-slate-800 mb-1">{domain.ext}</h3>
                    <p className="text-slate-500 text-sm mb-4">First Year</p>
                    <div className="mb-4">
                      <span className="text-3xl font-heading font-bold text-gradient-royal">KSh. {domain.price}</span>
                      <span className="text-slate-500 text-sm">/yr</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-4">
                      Renewal: KSh. {domain.renewal}/yr
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl"
                      onClick={() => {
                        setDomainSearch("example" + domain.ext.replace(".", ""));
                        setDomainResult(null);
                      }}
                    >
                      Register
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid - Brighter */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {domainFeatures.map((feature) => (
              <div 
                key={feature.title}
                className="glass-sky backdrop-blur-xl rounded-2xl p-6 border border-white/40 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h4>
                <p className="text-slate-500 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Why Choose Us - Brighter */}
          <div className="glass-sky backdrop-blur-xl rounded-3xl p-10 max-w-4xl mx-auto border border-white/40">
            <h3 className="font-heading text-2xl font-bold text-slate-800 text-center mb-8">
              Why Register Your Domain With Vilcom?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Free DNS Management",
                "Easy Domain Transfer",
                "24/7 Domain Support",
                "Domain Privacy Protection",
                "Auto-Renewal Options",
                "Fast Propagation"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-sky-500 shrink-0" />
                  <span className="text-slate-700">{feature}</span>
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

export default Domains;

