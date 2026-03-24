import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  ArrowRight,
  Calendar,
  Newspaper,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { pressArticleService, type PressArticle } from "@/services/pressarticle";

// ── Background decorations ────────────────────────────────────────────────

const ConnectivityBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lineGradientMedia" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.3" />
        <stop offset="50%"  stopColor="#0ea5e9" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <line x1="0%" y1="15%" x2="100%" y2="15%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="35%" x2="100%" y2="35%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="55%" x2="100%" y2="55%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="0%" y1="95%" x2="100%" y2="95%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="10%" y1="0%" x2="10%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="40%" y1="0%" x2="40%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="70%" y1="0%" x2="70%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <line x1="85%" y1="0%" x2="85%" y2="100%" stroke="url(#lineGradientMedia)" strokeWidth="1" />
    <circle cx="10%" cy="15%" r="4" fill="#3b82f6" opacity="0.6" />
    <circle cx="25%" cy="35%" r="3" fill="#0ea5e9" opacity="0.5" />
    <circle cx="40%" cy="55%" r="4" fill="#38bdf8" opacity="0.6" />
    <circle cx="55%" cy="75%" r="3" fill="#3b82f6" opacity="0.5" />
    <circle cx="70%" cy="95%" r="4" fill="#0ea5e9" opacity="0.6" />
    <circle cx="85%" cy="15%" r="3" fill="#38bdf8" opacity="0.5" />
  </svg>
);

const NetworkingNodes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-gradient-to-br from-sky-300/30 to-blue-400/20 rounded-full blur-[80px] animate-pulse" />
    <div className="absolute top-[30%] right-[10%] w-80 h-80 bg-gradient-to-br from-blue-300/25 to-sky-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
    <div className="absolute bottom-[20%] left-[25%] w-72 h-72 bg-gradient-to-br from-sky-200/30 to-blue-300/20 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: "2s" }} />
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop";

const Media = () => {
  const [articles, setArticles]        = useState<PressArticle[]>([]);
  const [featuredArticle, setFeatured] = useState<PressArticle | null>(null);
  const [categories, setCategories]    = useState<string[]>(["All"]);
  const [selectedCategory, setCategory]= useState("All");
  const [searchQuery, setSearch]       = useState("");
  const [currentPage, setPage]         = useState(1);
  const [totalPages, setTotalPages]    = useState(1);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState<string | null>(null);

  const PER_PAGE = 6;

  // Fetch press-only categories once
  useEffect(() => {
    pressArticleService
      .getCategories('press')           // ← type scoped
      .then((res) => setCategories(["All", ...res.data]))
      .catch(() => {/* keep default */});
  }, []);

  // Fetch press-only featured once
  useEffect(() => {
    pressArticleService
      .getFeatured('press')             // ← type scoped
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured(null));
  }, []);

  // Fetch press articles whenever filters change
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pressArticleService.getAll({
        type:     'press',              // ← type scoped
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search:   searchQuery || undefined,
        page:     currentPage,
        per_page: PER_PAGE,
      });
      setArticles(res.data.data);
      setTotalPages(res.data.last_page);
    } catch {
      setError("Failed to load press articles. Please try again.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, currentPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCategoryChange = (cat: string) => { setCategory(cat); setPage(1); };
  const handleSearchChange   = (q: string)   => { setSearch(q);     setPage(1); };

  const showFeatured =
    featuredArticle &&
    selectedCategory === "All" &&
    !searchQuery &&
    currentPage === 1;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(219,74%,22%)] via-[hsl(235,95%,32%)] to-[hsl(221,89%,48%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(25,90%,60%)] opacity-20 blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(35,85%,65%)] opacity-15 blur-[150px]" />
      <div className="absolute top-1/3 left-[10%] w-[300px] h-[300px] rounded-full bg-[hsl(170,60%,50%)] opacity-10 blur-[120px]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h1 className="font-heading text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/8 via-white/5 to-white/3 tracking-widest select-none transform rotate-[-5deg] scale-150 whitespace-nowrap blur-[1px]">
          VILCOM
        </h1>
      </div>

      <ConnectivityBackground />
      <NetworkingNodes />
      <Navbar />

      <main className="pt-36 pb-16 relative z-10">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">
              Media <span className="text-white">Features</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
              Latest news, press coverage, and media features about Vilcom Networks
            </p>
          </div>

          {/* Main glass panel */}
          <div className="glass-crystal rounded-3xl p-8 md:p-12 max-w-7xl mx-auto mb-12">

            {/* Search + Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search media features..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? "gradient-royal text-white shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured article */}
            {showFeatured && (
              <div className="mb-10">
                <div className="glass-frosty-cracked rounded-2xl overflow-hidden group cursor-pointer">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <img
                        src={featuredArticle.thumbnail ?? FALLBACK_THUMBNAIL}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                        <span className="bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                          {featuredArticle.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {featuredArticle.published_at
                            ? new Date(featuredArticle.published_at).toLocaleDateString("en-KE", {
                                year: "numeric", month: "long", day: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-white/70 mb-4 line-clamp-3">{featuredArticle.excerpt}</p>
                      <div className="flex items-center mt-auto">
                        {featuredArticle.article_url && (
                          <a
                            href={featuredArticle.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-semibold"
                          >
                            Read More <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-16">
                <p className="text-white/60 mb-4">{error}</p>
                <Button
                  onClick={fetchArticles}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Articles grid */}
            {!loading && !error && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="glass-frosty rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.thumbnail ?? FALLBACK_THUMBNAIL}
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
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("en-KE", {
                              year: "numeric", month: "long", day: "numeric",
                            })
                          : "—"}
                      </div>
                      <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <Newspaper className="w-4 h-4 text-white/40" />
                          <span className="text-xs text-white/60 font-medium">{article.source_name}</span>
                        </div>
                        {article.article_url && (
                          <a
                            href={article.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-blue-400 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && articles.length === 0 && (
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setPage(page)}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Press Inquiries */}
          <div className="mb-20">
            <div className="glass-bubble rounded-3xl p-8 max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-white text-center mb-8">
                Press <span className="text-white">Inquiries</span>
              </h2>
              <p className="text-white/70 text-center mb-6">
                For media inquiries, interview requests, or press releases, please contact our
                communications team.
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

          {/* Stay Updated */}
          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-white mb-4">Stay Updated</h2>
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