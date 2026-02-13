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

const About = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/40 via-transparent to-white/30" />
      
      {/* Vibrant background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 rounded-full blur-[120px] opacity-35" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-rose-400 via-orange-300 to-sky-400 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-[70%] left-[60%] w-64 h-64 bg-gradient-to-bl from-teal-400 via-cyan-300 to-sky-300 rounded-full blur-[90px] opacity-40" />
        <div className="absolute top-[25%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-yellow-300 via-amber-200 to-orange-300 rounded-full blur-[60px] opacity-30" />
        <div className="absolute bottom-[40%] right-[30%] w-[380px] h-[380px] bg-gradient-to-t from-blue-400 via-sky-400 to-cyan-300 rounded-full blur-[80px] opacity-35" />
      </div>

      {/* Artistic VILCOM text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-600/12 via-sky-500/8 to-sky-400/5 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              About <span className="text-sky-700">Vilcom Networks</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              Connecting Kenya with high-speed fiber internet and innovative technology solutions
            </p>
          </div>

          {/* Company Overview */}
          <div className="mb-20">
            <div className="glass-sky rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-8">
                Company <span className="text-sky-700">Overview</span>
              </h2>
              
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  <strong className="text-sky-700">Vilcom Networks Limited</strong> is a Nairobi-based telecommunications company founded in 2021, dedicated to delivering high-speed fiber internet to homes and businesses across all 47 Kenyan counties. With a commitment to bridging the digital divide, we have rapidly expanded our network infrastructure to ensure that every community has access to reliable, fast, and affordable internet connectivity.
                </p>
                
                <p>
                  Our mission is to <strong className="text-sky-700">empower communities</strong> with fast, affordable internet, reliable operations, and exceptional customer care. We believe that connectivity is a fundamental right in today's digital age, and we strive to make it accessible to all Kenyans regardless of their location. Our team of skilled professionals works tirelessly to deploy cutting-edge fiber technology that meets the evolving needs of our customers.
                </p>
                
                <p>
                  Our vision is to be a <strong className="text-sky-700">leading technology solutions provider in Africa</strong>. We envision a future where Vilcom Networks is synonymous with innovation, reliability, and excellence in telecommunications across the continent. This drives us to continuously expand our services, invest in new technologies, and build strategic partnerships that enhance our capabilities.
                </p>
                
                <p>
                  At Vilcom Networks, our core values are embodied in <strong className="text-sky-700">C.O.R.I.P</strong>: <strong>Customer Focus</strong> - placing our customers at the heart of everything we do; <strong>Ownership</strong> - taking responsibility for our actions and outcomes; <strong>Responsiveness</strong> - acting swiftly to address customer needs; <strong>Integrity</strong> - conducting business with honesty and transparency; and <strong>Professionalism</strong> - maintaining the highest standards in all our interactions.
                </p>
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-12">
              Our Core <span className="text-sky-700">Values</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Customer Focus</h3>
                <p className="text-slate-600 text-sm">Putting customers at the heart of everything we do</p>
              </div>
              
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BadgeCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Ownership</h3>
                <p className="text-slate-600 text-sm">Taking responsibility for our actions and outcomes</p>
              </div>
              
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Responsiveness</h3>
                <p className="text-slate-600 text-sm">Acting swiftly to address customer needs</p>
              </div>
              
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Integrity</h3>
                <p className="text-slate-600 text-sm">Conducting business with honesty and transparency</p>
              </div>
              
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Professionalism</h3>
                <p className="text-slate-600 text-sm">Maintaining the highest standards in all interactions</p>
              </div>
            </div>
          </div>

          {/* Navigation Cards Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-4">
              Discover <span className="text-sky-700">More About Us</span>
            </h2>
            <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
              Explore our portfolio, view our gallery, learn about our certifications, and stay updated with media features
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* Portfolio Projects */}
              <Link 
                to="/portfolio" 
                className="glass-sky rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">Portfolio Projects</h3>
                <p className="text-slate-600 text-sm mb-4">Showcase of fiber deployments, business installations, and hotspot networks</p>
                <span className="inline-flex items-center text-sky-600 font-semibold text-sm group-hover:text-sky-700">
                  Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Gallery */}
              <Link 
                to="/gallery" 
                className="glass-sky rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Images className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">Gallery</h3>
                <p className="text-slate-600 text-sm mb-4">Photo grid of team, installations, coverage areas, and events</p>
                <span className="inline-flex items-center text-sky-600 font-semibold text-sm group-hover:text-sky-700">
                  View Photos <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Media Features */}
              <Link 
                to="/media" 
                className="glass-sky rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">Media Features</h3>
                <p className="text-slate-600 text-sm mb-4">Featured articles and news about Vilcom Networks</p>
                <span className="inline-flex items-center text-sky-600 font-semibold text-sm group-hover:text-sky-700">
                  Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Careers */}
              <Link 
                to="/careers" 
                className="glass-sky rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">Careers</h3>
                <p className="text-slate-600 text-sm mb-4">Join our team and grow your career with Vilcom Networks</p>
                <span className="inline-flex items-center text-sky-600 font-semibold text-sm group-hover:text-sky-700">
                  Join Us <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>

          {/* Media Features Section - Featured Articles */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-4">
              Media <span className="text-sky-700">Features</span>
            </h2>
            <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
              Latest news and articles about Vilcom Networks
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {mediaFeatures.map((article) => (
                <div 
                  key={article.id}
                  className="glass-sky rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.thumbnail} 
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <span className="font-medium text-sky-600">{article.source}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-slate-800 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg hover:bg-sky-200 transition-colors text-sm"
                    >
                      Learn More <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Policies Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-4">
              Certifications & <span className="text-sky-700">Policies</span>
            </h2>
            <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
              Our commitment to quality and security standards
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* ISO 9001 */}
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">ISO 9001</h3>
                <p className="text-slate-600 text-sm">
                  Quality Management System certification ensuring consistent delivery of high-quality services.
                </p>
              </div>

              {/* ISO 27001 */}
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">ISO 27001</h3>
                <p className="text-slate-600 text-sm">
                  Information Security Management System certification protecting customer data and network infrastructure.
                </p>
              </div>

              {/* Health Safety & Well Being Policy */}
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Health & Safety Policy</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Our commitment to ensuring the health, safety, and well-being of our employees and stakeholders.
                </p>
                <a 
                  href="/downloads/health-safety-policy.pdf" 
                  download
                  className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm hover:text-sky-700"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>

              {/* Quality & Information Security Policy */}
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Quality & InfoSec Policy</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Our policies for maintaining quality standards and information security management.
                </p>
                <a 
                  href="/downloads/quality-info-security-policy.pdf" 
                  download
                  className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm hover:text-sky-700"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">
                Ready to Get Connected?
              </h2>
              <p className="text-slate-600 mb-6">
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-sky text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Us
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

export default About;
