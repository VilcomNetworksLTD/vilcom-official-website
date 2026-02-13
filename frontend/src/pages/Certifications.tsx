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

const Certifications = () => {
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
              Our <span className="text-sky-700">Certifications</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-lg font-medium">
              We maintain the highest industry standards through rigorous certifications and continuous compliance. Your trust and security are our top priorities.
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-12">
              Industry <span className="text-sky-700">Certifications</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="glass-sky rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <cert.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-heading text-lg font-bold text-slate-800">{cert.name}</h3>
                    <BadgeCheck className="w-5 h-5 text-sky-500" />
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{cert.issuer}</p>
                  <p className="text-slate-600 text-sm mb-3">{cert.description}</p>
                  <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
                    Valid since {cert.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Awards Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-12">
              Awards & <span className="text-sky-700">Recognition</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {awards.map((award, index) => (
                <div
                  key={index}
                  className="glass-crystal rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-800 mb-1">{award.title}</h3>
                  <p className="text-xs text-amber-600 font-semibold mb-2">{award.organization}</p>
                  <p className="text-slate-600 text-sm mb-2">{award.description}</p>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {award.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Section */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-12">
              Regulatory <span className="text-sky-700">Compliance</span>
            </h2>
            <div className="glass-sky rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-6">
                {compliance.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-bold text-slate-800 mb-1">{item.title}</h4>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Affiliations */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-12">
              Professional <span className="text-sky-700">Affiliations</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {affiliations.map((affiliation, index) => (
                <div
                  key={index}
                  className="glass-crystal rounded-xl px-6 py-4 text-center hover:scale-[1.02] transition-all duration-300"
                >
                  <h4 className="font-heading font-bold text-slate-800">{affiliation.name}</h4>
                  <p className="text-sky-600 text-sm font-medium">{affiliation.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-20">
            <div className="glass-sky rounded-3xl p-10 max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-slate-800 text-center mb-8">
                Our <span className="text-sky-700">Commitment</span>
              </h2>
              <div className="grid sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 rounded-full gradient-royal flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-slate-800 mb-2">99.9%</h3>
                  <p className="text-slate-600">Network Uptime</p>
                </div>
                <div>
                  <div className="w-16 h-16 rounded-full gradient-royal flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-slate-800 mb-2">256-bit</h3>
                  <p className="text-slate-600">Encryption</p>
                </div>
                <div>
                  <div className="w-16 h-16 rounded-full gradient-royal flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-slate-800 mb-2">4+</h3>
                  <p className="text-slate-600">Certifications</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">
                Have Questions About Our Certifications?
              </h2>
              <p className="text-slate-600 mb-6">
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
      </main>
      <FooterSection />
    </div>
  );
};

export default Certifications;
