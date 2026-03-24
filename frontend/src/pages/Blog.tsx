import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Wifi,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { pressArticleService, type PressArticle } from "@/services/pressarticle";

// ── Background decorations ────────────────────────────────────────────────

const ConnectivityBackground = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.3" />
        <stop offset="50%"  stopColor="#0ea5e9" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <line x1="0%" y1="15%" x2="100%" y2="15%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="0%" y1="35%" x2="100%" y2="35%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="0%" y1="55%" x2="100%" y2="55%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="0%" y1="95%" x2="100%" y2="95%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="10%" y1="0%" x2="10%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="40%" y1="0%" x2="40%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="70%" y1="0%" x2="70%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="85%" y1="0%" x2="85%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
    <line x1="10%" y1="15%" x2="25%" y2="35%" stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="25%" y1="35%" x2="40%" y2="55%" stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="40%" y1="55%" x2="55%" y2="75%" stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="55%" y1="75%" x2="70%" y2="95%" stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="70%" y1="15%" x2="85%" y2="35%" stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
    <line x1="85%" y1="35%" x2="70%" y2="55%" stroke="url(#lineGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
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

const NetworkingNodes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-gradient-to-br from-sky-300/30 to-blue-400/20 rounded-full blur-[80px] animate-pulse" />
    <div className="absolute top-[30%] right-[10%] w-80 h-80 bg-gradient-to-br from-blue-300/25 to-sky-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-[20%] left-[25%] w-72 h-72 bg-gradient-to-br from-sky-200/30 to-blue-300/20 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[60%] right-[25%] w-56 h-56 bg-gradient-to-br from-blue-200/25 to-sky-300/15 rounded-full blur-[70px] animate-pulse" style={{ animationDelay: '0.5s' }} />
    <div className="absolute bottom-[40%] left-[5%] w-48 h-48 bg-gradient-to-br from-sky-400/20 to-blue-300/15 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1.5s' }} />
    <div className="absolute top-[25%] left-[45%] w-24 h-24 bg-gradient-to-br from-sky-200/40 to-blue-300/25 rounded-full blur-[40px]" />
    <div className="absolute top-[70%] left-[70%] w-28 h-28 bg-gradient-to-br from-blue-200/35 to-sky-300/20 rounded-full blur-[45px]" />
    <div className="absolute bottom-[15%] right-[40%] w-20 h-20 bg-gradient-to-br from-sky-300/30 to-blue-200/20 rounded-full blur-[35px]" />
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};

// ── Component ──────────────────────────────────────────────────────────────

const Blog = () => {
  const [articles, setArticles]              = useState<PressArticle[]>([]);
  const [categories, setCategories]          = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery]        = useState("");
  const [currentPage, setCurrentPage]        = useState(1);
  const [totalPages, setTotalPages]          = useState(1);
  const [loading, setLoading]                = useState(true);
  const [featuredPost, setFeaturedPost]      = useState<PressArticle | null>(null);

  // Fetch blog-only categories and featured once
  useEffect(() => {
    pressArticleService
      .getCategories('blog')            // ← type scoped
      .then((res) => setCategories(["All", ...(res.data || [])]))
      .catch(console.error);

    pressArticleService
      .getFeatured('blog')              // ← type scoped
      .then((res) => setFeaturedPost(res.data))
      .catch(() => setFeaturedPost(null));
  }, []);

  // Fetch blog articles with debounce on search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);

      pressArticleService
        .getAll({
          type:         'blog',         // ← type scoped
          is_published: true,
          page:         currentPage,
          per_page:     6,
          category:     selectedCategory !== "All" ? selectedCategory : undefined,
          search:       searchQuery || undefined,
        })
        .then((res) => {
          setArticles(res.data.data);
          setTotalPages(res.data.last_page);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, currentPage]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] left-[60%] w-[250px] h-[250px] rounded-full bg-[hsl(30,100%,55%)] opacity-12 blur-[100px]" />
      <div className="absolute top-[60%] left-[20%] w-[200px] h-[200px] rounded-full bg-[hsl(45,90%,65%)] opacity-10 blur-[80px]" />
      <div className="absolute top-[15%] right-[30%] w-[150px] h-[150px] rounded-full bg-[hsl(160,50%,55%)] opacity-8 blur-[60px]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <ConnectivityBackground />
      <NetworkingNodes />
      <Navbar />

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
              Vilcom <span className="text-white">Updates</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
              The latest news, stories, and connectivity solutions from our network
            </p>
          </div>

          <div className="glass-crystal rounded-3xl p-8 md:p-12 max-w-7xl mx-auto mb-12">

            {/* Search + Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search updates..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300/50 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
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

            {/* Featured blog post */}
            {!loading && featuredPost && selectedCategory === "All" && !searchQuery && currentPage === 1 && (
              <div className="mb-10">
                <a
                  href={featuredPost.article_url || '#'}
                  target={featuredPost.article_url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="glass-frosty-cracked rounded-2xl overflow-hidden group cursor-pointer block"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <img
                        src={featuredPost.thumbnail || '/placeholder.svg'}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Wifi className="w-3 h-3" /> Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                        <span className="bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                          {featuredPost.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featuredPost.published_at || featuredPost.created_at)}
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/70 mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <img
                            src="/favicon.ico"
                            alt="Vilcom Logo"
                            className="w-10 h-10 rounded-full bg-white p-1.5 object-contain"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm text-white/80 font-medium">
                              {featuredPost.source_name || 'Vilcom Networks'}
                            </span>
                            <span className="text-xs text-blue-400">@vilcomnetworks</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <span>Read full article</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* Blog grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((post) => (
                    <a
                      key={post.id}
                      href={post.article_url || '#'}
                      target={post.article_url ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="glass-frosty rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 block bg-white/5 border border-white/10 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-800">
                        <img
                          src={post.thumbnail || '/placeholder.svg'}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-sky-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col h-48">
                        <div className="flex items-center gap-2 text-xs text-sky-200/80 mb-2 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.published_at || post.created_at)}
                        </div>
                        <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-grow">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                          <div className="flex items-center gap-2">
                            <img
                              src="/favicon.ico"
                              alt="Vilcom Logo"
                              className="w-8 h-8 rounded-full bg-white p-1 object-contain"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs text-white/90 font-semibold leading-tight">
                                {post.source_name || 'Vilcom News'}
                              </span>
                              <span className="text-[10px] text-sky-400 leading-tight">
                                @vilcomnetworks
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Empty state */}
                {articles.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                      <Search className="w-10 h-10 text-white/40" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2">No updates found</h3>
                    <p className="text-white/50">Try adjusting your search or filter criteria</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full ${
                          currentPage === page
                            ? "gradient-royal text-white border-0"
                            : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Newsletter */}
          <div className="max-w-3xl mx-auto">
            <div className="glass-bubble rounded-3xl p-8 md:p-12 text-center">
              <h2 className="font-heading text-3xl font-bold text-white mb-3">Stay Connected</h2>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Subscribe to our newsletter for the latest updates, insights, and exclusive offers
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300/50 transition-all"
                />
                <Button className="gradient-royal text-white font-semibold px-6 py-3 rounded-xl royal-glow border-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Blog;