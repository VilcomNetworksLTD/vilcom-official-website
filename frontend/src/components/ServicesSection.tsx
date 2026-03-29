import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { productsApi, Product } from '@/services/products';
import { getIconByType, getBlobColorByType, getColorByType } from './helperFunctions';

// First, update your helperFunctions.tsx (see note below)
const ServicesSection = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const initialVisibleCount = 9;
  const visibleServices = showAll ? services : services.slice(0, initialVisibleCount);
  const hiddenCount = services.length - initialVisibleCount;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const nonFibreServices: Product[] = await productsApi.getByCategory('enterprise-services', {
          is_active: true,
          is_featured: true,
          per_page: 'all',
          sort_by: 'sort_order',
          sort_order: 'asc'
        });

        const mappedServices = nonFibreServices.map(product => ({
          id: product.id,
          icon: getIconByType(product.type),           // Now returns component
          title: product.name,
          description: product.short_description,
          blob: getBlobColorByType(product.type),
          iconColor: getColorByType(product.type),
          to: `/services/${product.slug}`,
          badge: product.badge,
          priceDisplay: product.price_display,
          slug: product.slug,
        }));

        setServices(mappedServices);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />

      {/* Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />

      {/* Concentric Rings */}
      <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] border border-white/5 rounded-full opacity-30" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] border border-white/3 rounded-full opacity-20" />
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] border border-white/2 rounded-full opacity-15" />
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] border border-white/5 rounded-full opacity-25" />
      <div className="absolute bottom-[10%] right-[20%] w-[200px] h-[200px] border border-white/3 rounded-full opacity-15" />

      {/* Floating Ghost Blobs */}
      <div className="absolute top-[20%] left-[15%] w-[100px] h-[100px] rounded-full bg-white/5 blur-[30px]" />
      <div className="absolute top-[50%] left-[70%] w-[80px] h-[80px] rounded-full bg-white/3 blur-[25px]" />
      <div className="absolute bottom-[30%] left-[25%] w-[120px] h-[120px] rounded-full bg-white/4 blur-[35px]" />
      <div className="absolute top-[70%] right-[35%] w-[60px] h-[60px] rounded-full bg-white/3 blur-[20px]" />

      {/* Wave Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-40" />
        <div className="absolute top-[28%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-30" />
        <div className="absolute top-[44%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-35" />
        <div className="absolute top-[60%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-25" />
        <div className="absolute top-[76%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[3px] opacity-30" />
        <div className="absolute top-[92%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px] opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Our Services</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Everything You Need to{" "}
            <span className="text-white">Stay Connected</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {visibleServices.map((service, index) => {
              const IconComponent = service.icon as React.ComponentType<any>;
              const isConnectivity = service.slug === 'internet-connectivity';

              const cardContent = (
                <>
                  {/* Inner glow */}
                  <div 
                    className="absolute inset-0 rounded-3xl" 
                    style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} 
                  />
                  
                  {/* Blob background */}
                  <div className={`absolute -bottom-4 -left-4 w-32 h-32 ${service.blob} rounded-full blur-[80px]`} />

                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors border border-white/20"
                         style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                      <IconComponent className={`w-7 h-7 ${service.iconColor}`} />
                    </div>

                    <h3 className="font-heading text-xl font-bold text-white mb-3">
                      {service.title}
                    </h3>
                    
                    <p className="text-white/80 text-sm leading-relaxed mb-6 flex-grow">
                      {service.description}
                    </p>

                    {isConnectivity ? (
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <Link 
                          to="/plans?category=home-fiber"
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white text-sm font-medium group/btn"
                        >
                          Home <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                          to="/plans?category=business-fiber"
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white text-sm font-medium group/btn"
                        >
                          Biz <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-white/70 group-hover:text-white transition-colors mt-auto">
                        Learn More 
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </div>
                </>
              );

              const cardStyles = {
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
              };

              if (isConnectivity) {
                return (
                  <div
                    key={service.slug || index}
                    className="relative rounded-3xl p-8 group transition-all duration-300 overflow-hidden backdrop-blur-md"
                    style={cardStyles}
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={service.to || index}
                  to={service.to}
                  className="relative rounded-3xl p-8 group hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md"
                  style={cardStyles}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}

        {/* Show More / Show Less Button */}
        {hiddenCount > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="w-5 h-5" />
                </>
              ) : (
                <>
                  View Full List ({hiddenCount} more) <ChevronDown className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;