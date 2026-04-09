import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import VideosSection from "@/components/VideosSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO 
        title="Home" 
        description="Experience lightning-fast unlimited fiber internet with Vilcom Networks in Kenya. Reliable home and business connectivity with 24/7 support."
        keywords="fiber internet, fast internet, vilcom networks, kenya internet provider, unlimited internet"
      />
      {/* Royal Blue Background #153aee with orange radiance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#02066F] via-[#021a5e] to-[#030d4f]">
        {/* Static fluid shapes - orange radiance splash (no animate-pulse for mobile perf) */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large blobs - blue base */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-600/40 to-blue-500/30 blur-[100px]" />
          <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-500/35 to-purple-400/25 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-700/30 to-cyan-500/20 blur-[100px]" />

          {/* Orange radiance splash */}
          <div className="absolute top-[15%] right-[20%] w-48 h-48 rounded-full bg-gradient-to-br from-orange-400/30 to-amber-300/20 blur-[80px]" />
          <div className="absolute bottom-[30%] left-[10%] w-60 h-60 rounded-full bg-gradient-to-br from-orange-500/25 to-amber-400/15 blur-[100px]" />
          <div className="absolute top-[50%] left-[40%] w-40 h-40 rounded-full bg-gradient-to-br from-orange-300/20 to-yellow-200/10 blur-[60px]" />
        </div>
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <ServicesSection />
          <PricingSection />
          <TestimonialsSection />
          <VideosSection />
        </main>
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
