import { Link } from "react-router-dom";
import { 
  Briefcase, 
  Images, 
  Award, 
  Shield, 
  FileText, 
  Download, 
  ExternalLink,
  Heart,
  Users,
  Zap,
  BadgeCheck,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AnimatedSection from "@/components/AnimatedSection"; 

const mediaFeatures = [
  {
    id: 1,
    title: "How Vilcom Network's staff empowerment will drive customer satisfaction",
    source: "businessnow.co.ke",
    date: "August 18, 2025",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    url: "https://businessnow.co.ke/how-vilcom-networks-staff-empowerment-will-drive-customer-satisfaction",
    excerpt: "Vilcom Networks emphasizes staff training and empowerment as key drivers of exceptional customer service."
  },
  {
    id: 2,
    title: "Vilcom Networks Concludes 4-Cohort Customer Service & Experience Training for All Staff",
    source: "nipashebiz.co.ke",
    date: "August 18, 2025",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop",
    url: "https://nipashebiz.co.ke/vilcom-networks-concludes-4-cohort-customer-service-experience-training",
    excerpt: "All Vilcom Networks staff completed comprehensive customer service and experience training across 4 cohorts."
  }
];

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
};

const glassCardStyleEnhanced = {
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 20px 50px rgba(0,0,0,0.3), 0 0 100px rgba(6, 182, 212, 0.1)'
};

const About = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />
      
      {/* Vibrant background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
        <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
        <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
        <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />
      </div>

      {/* Artistic VILCOM watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">

          {/* ── Hero Section ── */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">
                About <span className="text-white">Vilcom Networks</span>
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium mb-8">
                Connecting Kenya with high-speed fiber internet and innovative technology solutions
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#company-overview"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Company Overview
                </a>
                <a
                  href="#core-values"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-md hover:scale-105"
                >
                  Our Values
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Company Overview ── */}
          <AnimatedSection delay={100} className="mb-20" id="company-overview">
            <div 
              className="relative rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto overflow-hidden"
              style={glassCardStyleEnhanced}
            >
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-3xl">
                <div className="absolute inset-0 rounded-3xl border border-cyan-400/20 animate-pulse" />
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0 opacity-50 blur-sm" />
              </div>
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-400/40 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400/40 rounded-br-3xl" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] animate-shimmer" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent to-cyan-400/50 w-20" />
                  <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white text-center">
                    Company <span className="text-cyan-300">Overview</span>
                  </h2>
                  <div className="h-px bg-gradient-to-l from-transparent to-cyan-400/50 w-20" />
                </div>
                
                <div className="space-y-8 text-white/85 text-lg leading-relaxed">
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <p className="relative">
                      <span className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
                      <strong className="text-white text-xl font-bold">Vilcom Networks Limited</strong> is a Nairobi-based telecommunications company founded in 2021, dedicated to delivering high-speed fiber internet to homes and businesses across all 47 Kenyan counties. With a commitment to bridging the digital divide, we have rapidly expanded our network infrastructure to ensure that every community has access to reliable, fast, and affordable internet connectivity.
                    </p>
                  </div>
                  
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <p>
                      Our mission is to <strong className="text-white text-xl font-bold">empower communities</strong> with fast, affordable internet, reliable operations, and exceptional customer care. We believe that connectivity is a fundamental right in today's digital age, and we strive to make it accessible to all Kenyans regardless of their location.
                    </p>
                  </div>
                  
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p>
                      Our vision is to be a <strong className="text-white text-xl font-bold">leading technology solutions provider in Africa</strong>. We envision a future where Vilcom Networks is synonymous with innovation, reliability, and excellence in telecommunications across the continent.
                    </p>
                  </div>
                  
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <p>
                      At Vilcom Networks, our core values are embodied in <strong className="text-cyan-300 text-xl font-bold">C.O.R.I.P</strong>: 
                      Customer Focus - placing our customers at the heart of everything we do; 
                      Ownership - taking responsibility for our actions and outcomes; 
                      Responsiveness - acting swiftly to address customer needs; 
                      Integrity - conducting business with honesty and transparency; and 
                      Professionalism - maintaining the highest standards in all our interactions.
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                      <div className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-1">47+</div>
                      <div className="text-white/60 text-sm">Counties Covered</div>
                    </div>
                    <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                      <div className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-1">2021</div>
                      <div className="text-white/60 text-sm">Year Founded</div>
                    </div>
                    <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                      <div className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-1">100+</div>
                      <div className="text-white/60 text-sm">Team Members</div>
                    </div>
                    <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                      <div className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-1">24/7</div>
                      <div className="text-white/60 text-sm">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Core Values ── */}
          <AnimatedSection delay={200} className="mb-20" id="core-values">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white text-center mb-12">
              Our Core <span className="text-white">Values</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Customer Focus</h3>
                  <p className="text-white/70 text-sm">Putting customers at the heart of everything we do</p>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <BadgeCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Ownership</h3>
                  <p className="text-white/70 text-sm">Taking responsibility for our actions and outcomes</p>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Responsiveness</h3>
                  <p className="text-white/70 text-sm">Acting swiftly to address customer needs</p>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Integrity</h3>
                  <p className="text-white/70 text-sm">Conducting business with honesty and transparency</p>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Professionalism</h3>
                  <p className="text-white/70 text-sm">Maintaining the highest standards in all interactions</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Navigation Cards ── */}
          <AnimatedSection delay={300} className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white text-center mb-4">
              Discover <span className="text-white">More About Us</span>
            </h2>
            <p className="text-white/70 text-center max-w-2xl mx-auto mb-12">
              Explore our portfolio, view our gallery, learn about our certifications, and stay updated with media features
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Link to="/portfolio" className="relative rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">Portfolio Projects</h3>
                  <p className="text-white/70 text-sm mb-4">Showcase of fiber deployments, business installations, and hotspot networks</p>
                  <span className="inline-flex items-center text-sky-300 font-semibold text-sm group-hover:text-sky-200">
                    Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link to="/gallery" className="relative rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Images className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">Gallery</h3>
                  <p className="text-white/70 text-sm mb-4">Photo grid of team, installations, coverage areas, and events</p>
                  <span className="inline-flex items-center text-sky-300 font-semibold text-sm group-hover:text-sky-200">
                    View Photos <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link to="/media" className="relative rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">Media Features</h3>
                  <p className="text-white/70 text-sm mb-4">Featured articles and news about Vilcom Networks</p>
                  <span className="inline-flex items-center text-sky-300 font-semibold text-sm group-hover:text-sky-200">
                    Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link to="/careers" className="relative rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">Careers</h3>
                  <p className="text-white/70 text-sm mb-4">Join our team and grow your career with Vilcom Networks</p>
                  <span className="inline-flex items-center text-sky-300 font-semibold text-sm group-hover:text-sky-200">
                    Join Us <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </AnimatedSection>

          {/* ── Media Features ── */}
          <AnimatedSection delay={400} className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white text-center mb-4">
              Media <span className="text-white">Features</span>
            </h2>
            <p className="text-white/70 text-center max-w-2xl mx-auto mb-12">
              Latest news and articles about Vilcom Networks
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {mediaFeatures.map((article) => (
                <div 
                  key={article.id}
                  className="relative rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 backdrop-blur-md"
                  style={glassCardStyle}
                >
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10 h-48 overflow-hidden">
                    <img 
                      src={article.thumbnail} 
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
                      <span className="font-medium text-sky-300">{article.source}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors text-sm"
                    >
                      Learn More <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Certifications & Policies ── */}
          <AnimatedSection delay={500} className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white text-center mb-4">
              Certifications & <span className="text-white">Policies</span>
            </h2>
            <p className="text-white/70 text-center max-w-2xl mx-auto mb-12">
              Our commitment to quality and security standards
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">ISO 9001</h3>
                  <p className="text-white/70 text-sm">
                    Quality Management System certification ensuring consistent delivery of high-quality services.
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">ISO 27001</h3>
                  <p className="text-white/70 text-sm">
                    Information Security Management System certification protecting customer data and network infrastructure.
                  </p>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Health & Safety Policy</h3>
                  <p className="text-white/70 text-sm mb-3">
                    Our commitment to ensuring the health, safety, and well-being of our employees and stakeholders.
                  </p>
                  <a 
                    href="/downloads/health-safety-policy.pdf" 
                    download
                    className="inline-flex items-center gap-2 text-sky-300 font-semibold text-sm hover:text-sky-200"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                </div>
              </div>

              <div className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2">Quality & InfoSec Policy</h3>
                  <p className="text-white/70 text-sm mb-3">
                    Our policies for maintaining quality standards and information security management.
                  </p>
                  <a 
                    href="/downloads/quality-info-security-policy.pdf" 
                    download
                    className="inline-flex items-center gap-2 text-sky-300 font-semibold text-sm hover:text-sky-200"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── CTA ── */}
          <AnimatedSection delay={600}>
            <div className="text-center">
              <div className="relative rounded-2xl p-8 max-w-2xl mx-auto overflow-hidden backdrop-blur-md" style={glassCardStyle}>
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                <div className="relative z-10">
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">
                    Ready to Get Connected?
                  </h2>
                  <p className="text-white/70 mb-6">
                    Experience the Vilcom Networks difference. Contact us today for high-speed fiber internet in your area.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/coverage"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Check Coverage
                    </Link>
                    <Link
                      to="/contact-us"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-md"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default About;