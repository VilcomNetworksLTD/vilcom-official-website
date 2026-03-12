import { useState, useEffect, useMemo } from "react";
import { Check, Zap, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product, getInternetPlans } from "@/services/products";

// Glassmorphism style matching ContactUs and CookieConsent - Lighter version for visibility
const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.15)'
};

const blobColors = [
  "bg-[hsl(232, 89%, 55%)/0.5]",
  "bg-[hsl(38, 83%, 54%)/0.5]",
  "bg-[hsl(280,70%,82%)/0.5]",
  "bg-[hsl(226, 84%, 29%)/0.45]",
];

// Helper function to get dynamic grid classes based on number of items
// Returns grid classes and whether we need offset for pyramid layout
const getDynamicGridClasses = (itemCount: number): { gridClasses: string; isPyramid: boolean } => {
  if (itemCount <= 1) {
    return { gridClasses: "grid grid-cols-1 max-w-md mx-auto", isPyramid: false };
  }
  if (itemCount === 2) {
    return { gridClasses: "grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto", isPyramid: false };
  }
  if (itemCount === 3) {
    return { gridClasses: "grid grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto", isPyramid: false };
  }
  if (itemCount === 4) {
    return { gridClasses: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto", isPyramid: false };
  }
  if (itemCount === 5) {
    return { gridClasses: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto", isPyramid: true };
  }
  if (itemCount === 6) {
    return { gridClasses: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto", isPyramid: false };
  }
  if (itemCount === 7) {
    return { gridClasses: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto", isPyramid: true };
  }
  if (itemCount === 8) {
    return { gridClasses: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto", isPyramid: false };
  }
  // 9+ items
  return { gridClasses: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto", isPyramid: false };
};

// Helper to determine if a card should be offset for pyramid layout
const isOffsetCard = (index: number, totalCount: number, isPyramid: boolean, cols: number): boolean => {
  if (!isPyramid) return false;
  
  // For pyramid layout, offset cards in the second row to center them
  const firstRowCount = Math.min(cols, totalCount);
  const secondRowStartIndex = firstRowCount;
  
  // If this card is in the second row, check if it needs offset
  if (index >= secondRowStartIndex) {
    const secondRowCount = totalCount - firstRowCount;
    const offsetAmount = (cols - secondRowCount) / 2;
    const cardPositionInRow = index - secondRowStartIndex;
    return cardPositionInRow < offsetAmount;
  }
  return false;
};

const PricingSection = () => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [businessProducts, setBusinessProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "business">("home");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch home and business plans in parallel
        const [home, business] = await Promise.all([
          getInternetPlans("home"),
          getInternetPlans("business"),
        ]);
        setHomeProducts(home || []);
        setBusinessProducts(business || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Unable to load plans");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleExpand = (planKey: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [planKey]: !prev[planKey]
    }));
  };

  // Helper to convert API product to plan format
  const productToPlan = (product: Product, prefix: string) => {
    const price = product.price_monthly ? product.price_monthly.toLocaleString() : "0";
    const features = product.features || [];
    
    return {
      id: product.id,
      name: product.name,
      speed: product.speed_mbps ? `${product.speed_mbps} Mbps` : "N/A",
      price: price,
      features: features,
      popular: product.badge === "Best Value" || product.badge === "Popular",
      slug: product.slug,
      titleColor: prefix === "home" ? "text-orange-500" : "text-orange-500",
    };
  };

  // Use API data if available, otherwise show loading
  const displayHomePlans = homeProducts.length > 0 
    ? homeProducts.map((p, i) => ({ ...productToPlan(p, "home"), colorIndex: i }))
    : [];
    
  const displayBusinessPlans = businessProducts.length > 0 
    ? businessProducts.map((p, i) => ({ ...productToPlan(p, "business"), colorIndex: i }))
    : [];

  // Compute dynamic grid classes based on plan count
  const homeGridConfig = useMemo(() => getDynamicGridClasses(displayHomePlans.length), [displayHomePlans.length]);
  const businessGridConfig = useMemo(() => getDynamicGridClasses(displayBusinessPlans.length), [displayBusinessPlans.length]);
  
  // Get number of columns for pyramid offset calculation
  const homeCols = useMemo(() => {
    const count = displayHomePlans.length;
    if (count <= 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    if (count === 4) return 4;
    if (count === 5) return 3;
    if (count === 6) return 3;
    if (count === 7) return 4;
    return 4;
  }, [displayHomePlans.length]);
  
  const businessCols = useMemo(() => {
    const count = displayBusinessPlans.length;
    if (count <= 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    if (count === 4) return 4;
    if (count === 5) return 3;
    if (count === 6) return 3;
    if (count === 7) return 4;
    return 4;
  }, [displayBusinessPlans.length]);

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
        <div className="relative z-10 container mx-auto px-4 flex items-center justify-center min-h-[600px]">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <span className="text-slate-600 text-lg">Loading plans...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error || (displayHomePlans.length === 0 && displayBusinessPlans.length === 0)) {
    return null; // Don't render section if no products
  }

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
        {/* Tab Toggle Buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full p-1.5 backdrop-blur-md" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <button
              onClick={() => setActiveTab("home")}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] text-white shadow-lg"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/20 bg-white/10"
              }`}
            >
              Home Fibre
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === "business"
                  ? "bg-gradient-to-r from-[hsl(220,80%,50%)] to-[hsl(220,60%,40%)] text-white shadow-lg"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/20 bg-white/10"
              }`}
            >
              Business Fibre
            </button>
          </div>
        </div>

        {/* Plans based on active tab */}
        {activeTab === "home" && displayHomePlans.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <span className="text-slate-600 text-sm font-bold uppercase tracking-[0.3em]">Home Fibre</span>
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-4 tracking-wide">
                Perfect for <span className="text-slate-800">Your Home</span>
              </h2>
              <p className="text-slate-600 mt-5 max-w-lg mx-auto text-lg font-medium">
                Reliable internet for streaming, gaming, and working from home.
              </p>
            </div>

            <div className={`${homeGridConfig.gridClasses} gap-6`}>
              {displayHomePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-8 relative transition-all duration-300 hover:scale-[1.02] backdrop-blur-md ${
                    plan.popular ? "golden-glow-sky" : ""
                  }`}
                  style={glassCardStyle}
                >
                  {/* Color blob behind glass */}
                  <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[plan.colorIndex % blobColors.length]} rounded-full blur-[40px]`} />

                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                      <Zap className="w-3.5 h-3.5" /> Most Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="mb-5">
                      <h3 className={`font-heading text-2xl font-bold ${plan.titleColor} drop-shadow-lg tracking-wide`}>{plan.name}</h3>
                      <p className="text-slate-800 text-base font-medium mt-1.5"> {plan.speed}</p>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                      <span className="text-slate-600 text-xs ml-1">/mo</span>
                    </div>
                    
                    <ul className="space-y-2.5 mb-4 min-h-[196px]">
                      {(() => {
                        const isExpanded = expandedCards[`home-${plan.id}`] || false;
                        const displayFeatures = isExpanded ? plan.features : plan.features.slice(0, 7);
                        return displayFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-slate-700 shrink-0" /> {feature}
                          </li>
                        ));
                      })()}
                    </ul>
                    {plan.features.length > 7 && (
                      <button
                        onClick={() => toggleExpand(`home-${plan.id}`)}
                        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 font-medium mb-4 transition-colors"
                      >
                        {expandedCards[`home-${plan.id}`] ? (
                          <>Show less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Show {plan.features.length - 7} more <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                    <Button
                      asChild
                      className={`w-full font-semibold border-0 rounded-xl py-5 transition-all text-base btn-golden ${
                        plan.popular ? "royal-glow hover:scale-[1.02]" : ""
                      }`}
                    >
                      <Link to={`/plans?plan=${plan.slug}`}>Get Started</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "business" && displayBusinessPlans.length > 0 && (
          <div>
            <div className="text-center mb-12">
              <span className="text-slate-600 text-sm font-bold uppercase tracking-[0.3em]">Business Fibre</span>
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-800 mt-4 tracking-wide">
                Power Your <span className="text-slate-800">Business</span>
              </h2>
              <p className="text-slate-600 mt-5 max-w-lg mx-auto text-lg font-medium">
                Scalable solutions with guaranteed uptime and dedicated support.
              </p>
            </div>

            <div className={`${businessGridConfig.gridClasses} gap-6`}>
              {displayBusinessPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-8 relative transition-all duration-300 hover:scale-[1.02] backdrop-blur-md ${
                    plan.popular ? "golden-glow-sky" : ""
                  }`}
                  style={glassCardStyle}
                >
                  {/* Color blob behind glass */}
                  <div className={`absolute -bottom-8 -right-8 w-36 h-36 ${blobColors[plan.colorIndex % blobColors.length]} rounded-full blur-[40px]`} />

                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
                      <Zap className="w-3.5 h-3.5" /> Most Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="mb-5">
                      <h3 className={`font-heading text-2xl font-bold ${plan.titleColor} drop-shadow-lg tracking-wide`}>{plan.name}</h3>
                      <p className="text-slate-800 text-base font-medium mt-1.5"> {plan.speed}</p>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-heading font-bold text-gradient-royal">KES {plan.price}</span>
                      <span className="text-slate-600 text-xs ml-1">/mo</span>
                    </div>
                    
                    <ul className="space-y-2.5 mb-4 min-h-[168px]">
                      {(() => {
                        const isExpanded = expandedCards[`business-${plan.id}`] || false;
                        const displayFeatures = isExpanded ? plan.features : plan.features.slice(0, 6);
                        return displayFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-slate-700 shrink-0" /> {feature}
                          </li>
                        ));
                      })()}
                    </ul>
                    {plan.features.length > 6 && (
                      <button
                        onClick={() => toggleExpand(`business-${plan.id}`)}
                        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 font-medium mb-4 transition-colors"
                      >
                        {expandedCards[`business-${plan.id}`] ? (
                          <>Show less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Show {plan.features.length - 6} more <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                    <Button
                      asChild
                      className={`w-full font-semibold border-0 rounded-xl py-5 transition-all text-base btn-golden ${
                        plan.popular ? "royal-glow hover:scale-[1.02]" : ""
                      }`}
                    >
                      <Link to={`/plans?plan=${plan.slug}`}>Contact Sales</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;

