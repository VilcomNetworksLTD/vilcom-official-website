import { Link } from "react-router-dom";
import { 
  Briefcase, 
  Building2, 
  Wifi, 
  Users, 
  MapPin, 
  ArrowRight,
  CheckCircle,
  Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const portfolioProjects = [
  {
    id: 1,
    title: "Nairobi Metropolitan Fiber Deployment",
    category: "Fiber Installation",
    location: "Nairobi County",
    description: "Complete fiber-to-the-home (FTTH) deployment covering over 50,000 residential units in Nairobi's metropolitan area.",
    image: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&h=400&fit=crop",
    stats: { value: "50,000+", label: "Homes Connected" }
  },
  {
    id: 2,
    title: "Mombasa Port Business Park Connectivity",
    category: "Business Installation",
    location: "Mombasa County",
    description: "High-speed fiber connectivity solutions for the Mombasa Port Business Park, supporting logistics and maritime operations.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    stats: { value: "200+", label: "Businesses Connected" }
  },
  {
    id: 3,
    title: "Kisumu City Center WiFi Network",
    category: "Hotspot Network",
    location: "Kisumu County",
    description: "Public WiFi hotspot deployment across Kisumu city center, providing free internet access to residents and visitors.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    stats: { value: "150+", label: "Hotspots Deployed" }
  },
  {
    id: 4,
    title: "Nakuru Industrial Zone Fiber Backbone",
    category: "Fiber Installation",
    location: "Nakuru County",
    description: "Industrial-grade fiber backbone infrastructure serving manufacturing and processing facilities in Nakuru's industrial zone.",
    image: "https://images.unsplash.com/photo-1565514020175-850b8c3b6d42?w=600&h=400&fit=crop",
    stats: { value: "45km", label: "Fiber Cable Laid" }
  },
  {
    id: 5,
    title: "Eldoret Technology Park Connectivity",
    category: "Business Installation",
    location: "Uasin Gishu County",
    description: "Enterprise connectivity solutions for Eldoret's emerging technology park, supporting startups and tech companies.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    stats: { value: "1Gbps", label: "Bandwidth Capacity" }
  },
  {
    id: 6,
    title: "Rural Counties Connectivity Initiative",
    category: "Fiber Installation",
    location: "Kakamega, Kisii, Migori",
    description: "Extending fiber connectivity to underserved rural counties, bridging the digital divide in Western Kenya.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop",
    stats: { value: "12", label: "Counties Covered" }
  }
];

const stats = [
  { value: "47", label: "Counties Covered", icon: MapPin },
  { value: "500+", label: "Projects Completed", icon: Briefcase },
  { value: "100,000+", label: "Happy Customers", icon: Users },
  { value: "99.9%", label: "Network Uptime", icon: Wifi },
];

const Portfolio = () => {
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
      </div>

      <Navbar />
      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              Our <span className="text-sky-700">Portfolio</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              Showcasing our fiber deployments, business installations, and hotspot networks across Kenya
            </p>
          </div>

          {/* Stats Section */}
          <div className="mb-20">
            <div className="glass-sky rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl lg:text-3xl font-bold text-slate-800">{stat.value}</h3>
                    <p className="text-slate-600 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-12">
              Featured <span className="text-sky-700">Projects</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioProjects.map((project) => (
                <div 
                  key={project.id}
                  className="glass-sky rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-full">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div>
                        <span className="text-sky-600 font-bold text-lg">{project.stats.value}</span>
                        <p className="text-slate-500 text-xs">{project.stats.label}</p>
                      </div>
                      <button className="text-sky-600 font-semibold text-sm hover:text-sky-700 flex items-center gap-1">
                        Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services We Offer */}
          <div className="mb-20">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 text-center mb-12">
              Services We <span className="text-sky-700">Offer</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">Fiber Installation</h3>
                <p className="text-slate-600 text-sm">
                  Professional fiber optic cable installation for residential and commercial properties across Kenya.
                </p>
              </div>

              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">Business Solutions</h3>
                <p className="text-slate-600 text-sm">
                  Customized internet solutions for businesses including dedicated bandwidth, MPLS, and enterprise networking.
                </p>
              </div>

              <div className="glass-sky rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-3">Hotspot Networks</h3>
                <p className="text-slate-600 text-sm">
                  Public WiFi hotspot deployment for cities, towns, and public spaces requiring wireless internet access.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">
                Need Similar Solutions?
              </h2>
              <p className="text-slate-600 mb-6">
                Contact us today to discuss your fiber installation or business connectivity needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Us
                </Link>
                <Link
                  to="/coverage"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-sky text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Check Coverage
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

export default Portfolio;
