import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Award, 
  ExternalLink, 
  ArrowRight,
  Calendar,
  Newspaper,
  ArrowLeft,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

// Sample media features data with featured item
const mediaFeatures = [
  {
    id: 1,
    title: "How Vilcom Network's staff empowerment will drive customer satisfaction",
    source: "Business Now Kenya",
    sourceUrl: "https://businessnow.co.ke",
    date: "August 18, 2025",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    url: "https://businessnow.co.ke/how-vilcom-networks-staff-empowerment-will-drive-customer-satisfaction",
    excerpt: "Vilcom Networks emphasizes staff training and empowerment as key drivers of exceptional customer service. The company's comprehensive approach to workforce development has resulted in measurable improvements in customer satisfaction metrics.",
    category: "Company News",
    featured: true
  },
  {
    id: 2,
    title: "Vilcom Networks Concludes 4-Cohort Customer Service & Experience Training for All Staff",
    source: "Nipashe Biz",
    sourceUrl: "https://nipashebiz.co.ke",
    date: "August 18, 2025",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    url: "https://nipashebiz.co.ke/vilcom-networks-concludes-4-cohort-customer-service-experience-training",
    excerpt: "All Vilcom Networks staff have completed comprehensive customer service and experience training across 4 cohorts. This initiative underscores the company's commitment to delivering world-class service.",
    category: "Training",
    featured: false
  },
  {
    id: 3,
    title: "Vilcom Networks Expands Fiber Coverage to 47 Counties",
    source: "Tech in Africa",
    sourceUrl: "https://techinafrica.com",
    date: "July 15, 2025",
    thumbnail: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "Vilcom Networks announces completion of fiber network expansion covering all 47 Kenyan counties, bringing high-speed internet to previously underserved regions.",
    category: "Expansion",
    featured: false
  },
  {
    id: 4,
    title: "Vilcom Networks Wins Best ISP Award 2025",
    source: "Tech Awards Africa",
    sourceUrl: "https://techawards.africa",
    date: "June 20, 2025",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "Vilcom Networks receives the prestigious Best ISP in Kenya award at the Tech Awards Africa 2025, recognizing outstanding network performance and customer satisfaction.",
    category: "Awards",
    featured: false
  },
  {
    id: 5,
    title: "Interview: CEO Samuel Kariuki on Kenya's Digital Future",
    source: "Business Daily Africa",
    sourceUrl: "https://businessdaily.africa",
    date: "May 10, 2025",
    thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "An in-depth interview with Vilcom Networks CEO discussing the company's vision for connecting all Kenyans and the future of telecommunications in East Africa.",
    category: "Interview",
    featured: false
  },
  {
    id: 6,
    title: "Vilcom Networks Launches New Business Solutions Division",
    source: "CIO East Africa",
    sourceUrl: "https://cio.eastafrica",
    date: "April 5, 2025",
    thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "Vilcom Networks unveils a new division focused on enterprise solutions, offering customized internet packages for businesses of all sizes.",
    category: "Product Launch",
    featured: false
  }
];

const categories = ["All", "Company News", "Training", "Expansion", "Awards", "Interview", "Product Launch"];

// Connectivity lines SVG pattern component - same as Blog
const ConnectivityBackground = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lineGradientMedia" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    {/* Horizontal lines */}
    <line x1="0%" y1="15%" x2="100%" y2="15%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="35%" x2="100%" y2="35%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="55%" x2="100%" y2="55%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="95%" x2="100%" y2="95%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    {/* Vertical lines */}
    <line x1="10%" y1="0%" x2="10%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="40%" y1="0%" x2="40%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="70%" y1="0%" x2="70%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="85%" y1="0%" x2="85%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    {/* Diagonal connecting lines */}
    <line x1="10%" y1="15%" x2="25%" y2="35%" stroke="url(#lineGradientMedia)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="25%" y1="35%" x2="40%" y2="55%" stroke="url(#lineGradientMedia)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="40%" y1="55%" x2="55%" y2="75%" stroke="url(#lineGradientMedia)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="55%" y1="75%" x2="70%" y2="95%" stroke="url(#lineGradientMedia)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="70%" y1="15%" x2="85%" y2="35%" stroke="url(#lineGradientMedia)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="85%" y1="35%" x2="70%" y2="55%" stroke="url(#lineGradientMedia)" strokeWidth="0.5" strokeDasharray="5,5" />
    {/* Network nodes */}
    <circle cx="10%" cy="15%" r="4" fill="#3b82f6" opacity="0.6" />
    <circle cx="25%" cy="35%" r="3" fill="#0ea5e9" opacity="0.5" />
    <circle cx="40%" cy="55%" r="4" fill="#38bdf8" opacity="0.6" />
    <circle cx="55%" cy="75%" r="3" fill="#3b82f6" opacity="0.5" />
    <circle cx="70%" cy="95%" r="4" fill="#0ea5e9" opacity="0.6" />
    <circle cx="85%" cy="15%" r="3" fill="#38bdf8" opacity="0.5" />
    <circle cx="70%" cy="35%" r="4" fill="#0ea5e9" opacity="0.6" />
    <circle cx="55%" cy="55%" r="3" fill="#3b82f6" opacity="0.5" />
    <circle cx="40%" cy="75%" r="4" fill="#38bdf8" opacity="0.6" />
    <circle cx="25%" cy="95%" r="3" fill="#0ea5e9" opacity="0.5" />
    <circle cx="10%" cy="75%" r="2.5" fill="#3b82f6" opacity="0.4" />
    <circle cx="85%" cy="55%" r="2.5" fill="#38bdf8" opacity="0.4" />
  </svg>
);

// Soft-focus networking nodes component - same as Blog
const NetworkingNodes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Large soft nodes */}
    <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-gradient-to-br from-sky-300/30 to-blue-400/20 rounded-full blur-[80px] animate-pulse" />
    <div className="absolute top-[30%] right-[10%] w-80 h-80 bg-gradient-to-br from-blue-300/25 to-sky-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-[20%] left-[25%] w-72 h-72 bg-gradient-to-br from-sky-200/30 to-blue-300/20 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[60%] right-[25%] w-56 h-56 bg-gradient-to-br from-blue-200/25 to-sky-300/15 rounded-full blur-[70px] animate-pulse" style={{ animationDelay: '0.5s' }} />
    <div className="absolute bottom-[40%] left-[5%] w-48 h-48 bg-gradient-to-br from-sky-400/20 to-blue-300/15 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1.5s' }} />
    {/* Small accent nodes */}
    <div className="absolute top-[25%] left-[45%] w-24 h-24 bg-gradient-to-br from-sky-200/40 to-blue-300/25 rounded-full blur-[40px]" />
    <div className="absolute top-[70%] left-[70%] w-28 h-28 bg-gradient-to-br from-blue-200/35 to-sky-300/20 rounded-full blur-[45px]" />
    <div className="absolute bottom-[15%] right-[40%] w-20 h-20 bg-gradient-to-br from-sky-300/30 to-blue-200/20 rounded-full blur-[35px]" />
  </div>
);

const Media = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const filteredPosts = mediaFeatures.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const featuredPost = mediaFeatures.find(post => post.featured);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Deep royal Blue-to-light navy blue gradient background - same as Blog */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />

      {/* Soft blurred glowing blobs in warm orange, peach, and light teal - same as Blog */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />

      {/* Artistic VILCOM text watermark - same as Blog */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      {/* Connectivity Background - from Blog */}
      <ConnectivityBackground />
      
      {/* Networking Nodes - from Blog */}
      <NetworkingNodes />

      <Navbar />
      <main className="pt-28 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
              Media <span className="text-white">Features</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
              Latest news, press coverage, and media features about Vilcom Networks
            </p>
          </div>

          {/* Large Centered Glass Panel - using Blog's glass-crystal */}
          <div className="glass-crystal rounded-3xl p-8 md:p-12 max-w-7xl mx-auto mb-12">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search media features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300/50 transition-all"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedCategory === category
                        ? "gradient-royal text-white shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Post (only show on first page with All category) - using Blog's glass-frosty-cracked */}
            {featuredPost && selectedCategory === "All" && !searchQuery && currentPage === 1 && (
              <div className="mb-10">
                <div className="glass-frosty-cracked rounded-2xl overflow-hidden group cursor-pointer">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <img
                        src={featuredPost.thumbnail}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                          Featured
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                        <span className="bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                          {featuredPost.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {featuredPost.date}
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/70 mb-4 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center mt-auto">
                        <a
                          href={featuredPost.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-semibold"
                        >
                          Read More <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media Features Grid - using Blog's glass-frosty */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((article) => (
                <article
                  key={article.id}
                  className="glass-frosty rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/80 backdrop-blur-sm text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-white/40" />
                        <span className="text-xs text-white/60 font-medium">{article.source}</span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* No Results */}
            {currentPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Search className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">No media features found</h3>
                <p className="text-white/50">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full ${
                      currentPage === page
                        ? "gradient-royal text-white"
                        : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Press Inquiries Section - using Blog's glass-bubble */}
          <div className="mb-20">
            <div className="glass-bubble rounded-3xl p-8 max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-white text-center mb-8">
                Press <span className="text-white">Inquiries</span>
              </h2>
              <p className="text-white/70 text-center mb-6">
                For media inquiries, interview requests, or press releases, please contact our communications team.
              </p>
              <div className="text-center">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Communications Team
                </Link>
              </div>
            </div>
          </div>

          {/* Stay Updated Section - using Blog's glass-crystal */}
          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-white/70 mb-6">
                Follow us on social media for the latest news and updates about Vilcom Networks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/blog"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Visit Our Blog
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  Learn More About Us <ArrowRight className="w-4 h-4" />
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

export default Media;

