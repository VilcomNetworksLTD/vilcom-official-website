import { Award, Shield, Globe, CheckCircle, Star, Zap, BadgeCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const certifications = [
  {
    name: "ISO 9001:2015",
    issuer: "International Organization for Standardization",
    description: "Quality Management System certification ensuring consistent delivery of high-quality services.",
    year: "2023",
    icon: Award,
    color: "from-amber-400 to-yellow-600",
  },
  {
    name: "ISO 27001:2022",
    issuer: "International Organization for Standardization",
    description: "Information Security Management System certification protecting customer data and network infrastructure.",
    year: "2024",
    icon: Shield,
    color: "from-blue-400 to-cyan-600",
  },
  {
    name: "ICTA License",
    issuer: "Information and Communications Technology Authority",
    description: "Licensed Internet Service Provider operating under Kenya's regulatory framework.",
    year: "2020",
    icon: Globe,
    color: "from-green-400 to-emerald-600",
  },
  {
    name: "Cisco Partner Certification",
    issuer: "Cisco Systems",
    description: "Certified partner status demonstrating expertise in Cisco networking solutions.",
    year: "2022",
    icon: Zap,
    color: "from-sky-400 to-blue-600",
  },
];

const awards = [
  {
    title: "Best ISP in Kenya 2024",
    organization: "Tech Awards Africa",
    description: "Recognized for outstanding network performance and customer satisfaction.",
    year: "2024",
  },
  {
    title: "Fastest Growing Tech Company",
    organization: "Business Daily Africa",
    description: "Awarded for exceptional growth and market expansion in East Africa.",
    year: "2023",
  },
  {
    title: "Customer Service Excellence",
    organization: "Customer Choice Awards",
    description: "Voted #1 for customer support in the telecommunications sector.",
    year: "2023",
  },
  {
    title: "Innovation in Connectivity",
    organization: "Smart Africa Awards",
    description: "Recognized for pioneering fiber-to-the-home (FTTH) solutions in Kenya.",
    year: "2022",
  },
];

const affiliations = [
  { name: "Telecom Kenya Association", role: "Member" },
  { name: "Kenya ICT Federation", role: "Founding Member" },
  { name: "East Africa Technology Council", role: "Partner" },
  { name: "Kenya Chamber of Commerce", role: "Corporate Member" },
];

const compliance = [
  { title: "Data Protection Act", description: "Fully compliant with Kenya's data privacy regulations" },
  { title: "Consumer Protection Act", description: "Adhering to all consumer rights and service standards" },
  { title: "Competition Act", description: "Fair and transparent business practices" },
  { title: "Cyber Security Regulations", description: "Meeting national cybersecurity requirements" },
];

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)'
};

const Certifications = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark gradient background - glassmorphism style */}
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

      {/* Artistic VILCOM text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="text-white">Certifications</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg font-medium">
              We maintain the highest industry standards through rigorous certifications and continuous compliance. Your trust and security are our top priorities.
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">
              Industry <span className="text-white">Certifications</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md"
                  style={glassCardStyle}
                >
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <cert.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-heading text-lg font-bold text-white">{cert.name}</h3>
                      <BadgeCheck className="w-5 h-5 text-sky-400" />
                    </div>
                    <p className="text-white/60 text-xs mb-2">{cert.issuer}</p>
                    <p className="text-white/70 text-sm mb-3">{cert.description}</p>
                    <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                      Valid since {cert.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awards Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">
              Awards & <span className="text-white">Recognition</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {awards.map((award, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md"
                  style={glassCardStyle}
                >
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white mb-1">{award.title}</h3>
                    <p className="text-amber-300 text-xs font-semibold mb-2">{award.organization}</p>
                    <p className="text-white/70 text-sm mb-2">{award.description}</p>
                    <span className="inline-block px-3 py-1 bg-amber-500/30 text-amber-200 text-xs font-semibold rounded-full">
                      {award.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">
              Regulatory <span className="text-white">Compliance</span>
            </h2>
            <div className="relative rounded-2xl p-8 max-w-4xl mx-auto overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10 grid sm:grid-cols-2 gap-6">
                {compliance.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-white/70 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Affiliations */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-12">
              Professional <span className="text-white">Affiliations</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {affiliations.map((affiliation, index) => (
                <div
                  key={index}
                  className="relative rounded-xl px-6 py-4 text-center hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md"
                  style={glassCardStyle}
                >
                  <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
                  <div className="relative z-10">
                    <h4 className="font-heading font-bold text-white">{affiliation.name}</h4>
                    <p className="text-sky-300 text-sm font-medium">{affiliation.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-20">
            <div className="relative rounded-3xl p-10 max-w-4xl mx-auto overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <h2 className="font-heading text-3xl font-bold text-white text-center mb-8">
                  Our <span className="text-white">Commitment</span>
                </h2>
                <div className="grid sm:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full gradient-royal flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-3xl font-bold text-white mb-2">99.9%</h3>
                    <p className="text-white/70">Network Uptime</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 rounded-full gradient-royal flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-3xl font-bold text-white mb-2">256-bit</h3>
                    <p className="text-white/70">Encryption</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 rounded-full gradient-royal flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-3xl font-bold text-white mb-2">4+</h3>
                    <p className="text-white/70">Certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="relative rounded-2xl p-8 max-w-2xl mx-auto overflow-hidden backdrop-blur-md" style={glassCardStyle}>
              <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
              <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold text-white mb-4">
                  Have Questions About Our Certifications?
                </h2>
                <p className="text-white/70 mb-6">
                  Our team is happy to provide more details about our quality standards and compliance measures.
                </p>
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Us <Zap className="w-5 h-5" />
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

export default Certifications;
