import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import VideosSection from "@/components/VideosSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Hero background image */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Bright overlay for glassmorphism effect */}
        <div className="absolute inset-0 bg-[hsl(220,30%,8%)/0.35]" />
      </div>

      {/* Multi-color radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[hsl(220,80%,40%)] opacity-15 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(340,80%,60%)] opacity-15 blur-[120px]" />
      <div className="absolute top-1/3 left-[10%] w-[350px] h-[350px] rounded-full bg-[hsl(30,100%,60%)] opacity-12 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[300px] h-[300px] rounded-full bg-[hsl(320,70%,60%)] opacity-10 blur-[100px]" />
      
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
