import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export interface PageHeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  showStats?: boolean;
  stats?: { value: string; label: string }[];
  backgroundImage?: string;
  children?: React.ReactNode;
}

const PageHero = ({
  title,
  subtitle,
  ctaText = "Get Started",
  ctaLink = "/plans",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "/about",
  showStats = true,
  stats = [
    { value: "47+", label: "Counties Covered" },
    { value: "2021", label: "Year Founded" },
    { value: "100+", label: "Team Members" },
    { value: "24/7", label: "Support" },
  ],
  backgroundImage = "/image (1).jpg",
  children,
}: PageHeroProps) => {
  return (
<section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
      {/* ── Background Image ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('${backgroundImage}')`,
        }}
      />

      {/* ── Orange Overlay ── */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(234, 88, 12, 0.85) 0%, rgba(249, 115, 22, 0.75) 50%, rgba(251, 146, 60, 0.7) 100%)",
        }}
      />
      
      {/* ── Secondary gradient for depth ── */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* ── Ambient glow effects ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div 
          className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

{/* ── Content ── */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-md border border-white/30"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white/90 font-semibold text-sm tracking-wide">
              VILCOM NETWORKS
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* CTA Buttons - Glassmorphic Style */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              asChild
              className="group px-8 py-4 text-lg font-bold rounded-2xl border-0 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                color: "white",
              }}
            >
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button 
              asChild
              variant="outline"
              className="group px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                color: "white",
              }}
            >
              <Link to={secondaryCtaLink}>
                {secondaryCtaText}
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>ISO 9001 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>ISO 27001 Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>ICTA Licensed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlapping Cards / Floating Cards ──
          These cards break out of the hero section and overlap the next section.
          This is the "card overlap" / "floating cards" pattern.
      ── */}
      {showStats && (
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/3 md:translate-y-1/2 z-20">
          <div className="container mx-auto px-4">
            <div 
              className="relative rounded-3xl p-6 md:p-8 max-w-5xl mx-auto backdrop-blur-xl"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                  filter: "blur(30px)",
                }}
              />
              
              <div className="relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  {stats.map((stat, index) => (
                    <div 
                      key={index} 
                      className="text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105"
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-white/70 text-sm font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom children for additional content */}
      {children}
    </section>
  );
};

export default PageHero;

