import { useState, useEffect } from "react";
import { Check, Zap, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Product, getInternetPlans } from "@/services/products";

// Color blobs for plan cards
const blobColors = [
  "bg-[hsl(200,90%,85%)/0.5]",
  "bg-[hsl(45,100%,80%)/0.5]",
  "bg-[hsl(280,70%,82%)/0.5]",
  "bg-[hsl(170,70%,78%)/0.45]",
];

// Static fallback plans in case API fails
const fallbackHomePlans = [
  { name: "Lite", speed: "10 Mbps", price: "999", slug: "lite", features: ["Unlimited Data", "Free Router", "Email Support", "48hr Install"] },
  { name: "Starter", speed: "20 Mbps", price: "1,500", slug: "starter", features: ["Unlimited Data", "Free Router", "24/7 Support", "Same-Day Install"] },
  { name: "Family", speed: "50 Mbps", price: "2,500", slug: "family", features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"], popular: true },
  { name: "Premium", speed: "100 Mbps", price: "4,000", slug: "premium", features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"] },
];

const fallbackBusinessPlans = [
  { name: "Startup", speed: "50 Mbps", price: "5,000", slug: "startup", features: ["Unlimited Data", "Free Router", "SLA 99.5%", "Same-Day Install", "Static IP"] },
  { name: "Growth", speed: "100 Mbps", price: "8,000", slug: "growth", features: ["Unlimited Data", "Managed Router", "SLA 99.9%", "4hr Install", "Static IP Block", "DDoS Protection"], popular: true },
  { name: "Enterprise", speed: "500 Mbps", price: "15,000", slug: "enterprise", features: ["Unlimited Data", "Managed Network", "SLA 99.99%", "Priority Install", "IP Block /28", "DDoS Protection", "Dedicated Account Manager"] },
  { name: "Datacenter", speed: "1 Gbps", price: "25,000", slug: "datacenter", features: ["Unlimited Data", "Full Network Mgmt", "SLA 99.99%", "Priority Install", "IP Block /24", "Advanced Security", "24/7 NOC", "Custom SLA"] },
];

const fallbackFiberPlans = [
  { name: "8 Mbps", speed: "8 Mbps", price: "2,499", slug: "8mbps", features: ["Unlimited Data", "Free Router", "Standard Support", "48hr Install"] },
  { name: "18 Mbps", speed: "18 Mbps", price: "3,299", slug: "18mbps", features: ["Unlimited Data", "Free Router", "Standard Support", "Same-Day Install"], popular: true },
  { name: "30 Mbps", speed: "30 Mbps", price: "4,999", slug: "30mbps", features: ["Unlimited Data", "Free Router", "Priority Support", "Same-Day Install", "Static IP"] },
  { name: "60 Mbps", speed: "60 Mbps", price: "7,499", slug: "60mbps", features: ["Unlimited Data", "Free Mesh Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain"] },
  { name: "100 Mbps", speed: "100 Mbps", price: "9,999", slug: "100mbps", features: ["Unlimited Data", "Premium Router", "VIP Support", "Same-Day Install", "Static IP", "Free Domain", "DDoS Protection"] },
];

// Convert API product to plan format
const productToPlan = (product: Product, index: number) => {
  const price = product.promotional_price || product.price_monthly || 0;
  
  return {
    id: product.id,
    slug: product.slug,
    name: product.speed_mbps ? `${product.speed_mbps} Mbps` : product.name,
    speed: product.speed_mbps ? `${product.speed_mbps} Mbps` : "N/A",
    price: price.toLocaleString(),
    features: product.features || [],
    popular: product.badge === "Popular" || product.badge === "Best Value",
    is_featured: product.is_featured,
    description: product.short_description || product.description,
  };
};

const Plans = () => {
  const [tab, setTab] = useState<"home" | "business">("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const isFiberRoute = location.pathname === "/fiber";

  const toggleExpand = (planKey: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [planKey]: !prev[planKey]
    }));
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const planCategory = isFiberRoute ? undefined : tab;
        const fetchedProducts = await getInternetPlans(planCategory);
        
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          console.log("No products from API, using fallback data");
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Unable to load plans. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [tab, isFiberRoute]);

  // Determine which plans to display
  const getPlans = () => {
    if (loading || error || products.length === 0) {
      if (isFiberRoute) return fallbackFiberPlans;
      return tab === "home" ? fallbackHomePlans : fallbackBusinessPlans;
    }

    return products.map((product, index) => productToPlan(product, index));
  };

  const plans = getPlans();

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/40 via-transparent to-white/30" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 rounded-full blur-[120px] opacity-35" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-rose-400 via-orange-300 to-sky-400 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-[70%] left-[60%] w-64 h-64 bg-gradient-to-bl from-teal-400 via-cyan-300 to-sky-300 rounded-full blur-[90px] opacity-40" />
        <div className="absolute top-[25%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-yellow-300 via-amber-200 to-orange-300 rounded-full blur-[60px] opacity-30" />
        <div className="absolute bottom-[40%] right-[30%] w-[380px] h-[380px] bg-gradient-to-t from-blue-400 via-sky-400 to-cyan-300 rounded-full blur-[80px] opacity-35" />
      </div>

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

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              <span className="ml-3 text-slate-600">Loading plans...</span>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className={`grid gap-6 ${isFiberRoute ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto'}`}>
              {(plans as unknown as Array<{name: string; speed: string; price: string; slug: string; features: string[]; popular?: boolean}>).map((plan, i) => (
                <div
                  key={plan.slug || plan.name + i}
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
                    <p className="text-sky-600 text-sm font-medium mb-4">{plan.speed}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                      <span className="text-slate-500 text-xs">/mo</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {(() => {
                        const features = plan.features || [];
                        const isExpanded = expandedCards[plan.slug || plan.name + i] || false;
                        const displayFeatures = isExpanded ? features : features.slice(0, 7);
                        return displayFeatures.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-slate-700/90">
                            <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" /> {f}
                          </li>
                        ));
                      })()}
                      {(plan.features || []).length === 0 && (
                        <>
                          <li className="flex items-center gap-2 text-xs text-slate-700/90">
                            <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" /> Unlimited Data
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-700/90">
                            <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" /> Free Router
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-700/90">
                            <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" /> 24/7 Support
                          </li>
                        </>
                      )}
                    </ul>
                    {(plan.features || []).length > 7 && (
                      <button
                        onClick={() => toggleExpand(plan.slug || plan.name + i)}
                        className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium mb-4 transition-colors"
                      >
                        {expandedCards[plan.slug || plan.name + i] ? (
                          <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Show {(plan.features || []).length - 7} more <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    )}
                    <Button
                      asChild
                      className={`w-full text-sm font-semibold border-0 rounded-xl py-5 transition-all btn-golden ${
                        plan.popular ? "royal-glow" : ""
                      }`}
                    >
                      <Link to={`/signup?product=${plan.slug}`}>
                        Get Started <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Plans;

