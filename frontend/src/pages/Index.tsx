import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
