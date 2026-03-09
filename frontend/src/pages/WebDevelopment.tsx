import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Layout, ShoppingCart, Smartphone, Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Product, productsApi } from "@/services/products";

const services = [
  {
    icon: Layout,
    title: "Website Design",
    description: "Beautiful, modern website designs that capture your brand identity.",
    features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Easy CMS"]
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Solutions",
    description: "Full-featured online stores with secure payment integration.",
    features: ["Product Management", "Payment Gateway", "Order Tracking", "Inventory System"]
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications for your business.",
    features: ["iOS & Android", "Push Notifications", "Offline Support", "App Store Setup"]
  },
  {
    icon: Search,
    title: "SEO & Marketing",
    description: "Boost your online visibility with our SEO services.",
    features: ["Keyword Research", "On-Page SEO", "Content Strategy", "Analytics"]
  }
];

// Helper to convert API product to service format
const productToService = (product: Product) => {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.short_description || product.description,
    features: product.features || [],
    price: product.price_one_time,
    delivery_days: product.delivery_days,
    pages_included: product.pages_included,
    popular: product.badge === "Best Value" || product.badge === "Popular",
  };
};

const process = [
  { step: "01", title: "Discovery", desc: "We learn about your business goals and requirements" },
  { step: "02", title: "Design", desc: "Create stunning visual designs for your approval" },
  { step: "03", title: "Development", desc: "Build your project with modern technologies" },
  { step: "04", title: "Launch", desc: "Deploy and support your live project" }
];

const WebDevelopment = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch web development products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getAll({
          type: "web_development",
          is_active: true,
          per_page: 20,
        });
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching web development products:", err);
        setError("Unable to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Get services from products
  const getServices = () => {
    // If loading or error, show loading/error state
    if (loading || error) {
      return [];
    }
    
    // If no products from API, use fallback services
    if (products.length === 0) {
      return services;
    }
    
    return products.map(productToService);
  };

  const serviceList = getServices();
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Background: Same as Plans/Signup - Dark Blue Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]" />
      
      {/* Animated fluid shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
        <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px]" />
      </div>

      <Navbar />
      
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Web <span className="text-cyan-300">Development</span>
            </h1>
            <p className="text-blue-100/80 max-w-2xl mx-auto text-lg">
              Transform your digital presence with our expert web development services. 
              From stunning websites to powerful web applications.
            </p>
          </div>

          {/* Services Grid - Glass Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-3 text-blue-200">Loading services...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-400 mb-4">{error}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
              {serviceList.map((service, idx) => (
                <div 
                  key={service.name}
                  className="glass-dark backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                    {idx === 0 ? <Layout className="w-6 h-6 text-white" /> :
                     idx === 1 ? <ShoppingCart className="w-6 h-6 text-white" /> :
                     idx === 2 ? <Smartphone className="w-6 h-6 text-white" /> :
                     <Search className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-3 uppercase">
                    {service.name}
                  </h3>
                  <p className="text-blue-200/70 text-sm mb-4">
                    {service.description}
                  </p>
                  <Link
                    to={`/quote?service=web-development&product_id=${service.id}&product_name=${encodeURIComponent(service.name)}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm mt-auto"
                  >
                    GET QUOTE
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Process Section - Animated Glass Cards with Vibrating String Effect */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">
              Our Development Process
            </h2>
            
            {/* Animated connecting line - vibrating string effect */}
            <div className="relative max-w-5xl mx-auto mb-8 px-4 lg:px-16">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/60 to-purple-500/0 animate-string-pulse rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/40 to-pink-500/0 animate-string-pulse delay-75 rounded-full" />
                {/* Water drop particles */}
                <div className="absolute top-1/2 left-[25%] w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-[50%] w-2 h-2 bg-purple-400 rounded-full animate-ping delay-100" />
                <div className="absolute top-1/2 left-[75%] w-2 h-2 bg-pink-400 rounded-full animate-ping delay-200" />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {process.map((item, index) => (
                <div key={item.step} className="relative">
                  {/* Animated glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse-process" style={{ animationDelay: `${index * 0.3}s` }} />
                  
                  <div className="relative text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10 ${
                      index === 0 ? 'animate-vibrate' : 
                      index === 1 ? 'animate-vibrate-delay-1' : 
                      index === 2 ? 'animate-vibrate-delay-2' : 
                      'animate-vibrate'
                    }`}>
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <h4 className="font-heading text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-blue-200/60 text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies - Glass Card */}
          <div className="mb-20">
            <div className="glass-dark backdrop-blur-xl rounded-3xl p-10 max-w-4xl mx-auto border border-white/10">
              <h3 className="font-heading text-2xl font-bold text-white text-center mb-8">
                Technologies We Use
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "React", "Vue.js", "Node.js", "PHP", "Python", 
                  "WordPress", "WooCommerce", "Laravel", "MongoDB", 
                  "PostgreSQL", "AWS", "Docker"
                ].map((tech) => (
                  <span 
                    key={tech}
                    className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-blue-200 text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section - Glass Card */}
          <div className="text-center">
            <div className="glass-dark backdrop-blur-xl rounded-3xl p-10 max-w-3xl mx-auto border border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">
                Ready to Start Your Project?
              </h3>
              <p className="text-blue-200/70 mb-6">
                Contact us today for a free consultation and quote. 
                Let's bring your digital vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/quote?service=web-development"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  Get Free Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default WebDevelopment;

