import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Images,
  Users,
  MapPin,
  ArrowRight,
  Calendar,
  Wifi,
  PartyPopper,
  Loader2,
  Search,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { galleryService, type GalleryItem } from "@/services/gallery";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All:          Images,
  Team:         Users,
  Installation: Wifi,
  Coverage:     MapPin,
  Events:       PartyPopper,
};

const Gallery = () => {
  const [items, setItems]               = useState<GalleryItem[]>([]);
  const [categories, setCategories]     = useState<string[]>([]);
  const [selectedCategory, setCategory] = useState("All");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    galleryService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {/* silently fallback */});
  }, []);

  // Load items when category changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    galleryService
      .getAll({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        per_page: 50,
      })
      .then((res) => {
        setItems(res.data.data);
      })
      .catch(() => {
        setError("Failed to load gallery. Please try again.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const allCategories = ["All", ...categories];

  // Build category counts from current full list
  const countsMap = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-100 to-sky-600" />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-700/40 via-transparent to-white/30" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[10%] w-80 h-80 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 rounded-full blur-[120px] opacity-35" />
        <div className="absolute bottom-20 left-[30%] w-72 h-72 bg-gradient-to-tr from-rose-400 via-orange-300 to-sky-400 rounded-full blur-[100px] opacity-40" />
      </div>

      <Navbar />

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              Our <span className="text-sky-700">Gallery</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              Explore photos of our team, installations, coverage areas, and events across Kenya
            </p>
          </div>

          {/* Category filters */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {allCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] ?? Images;
                const count = cat === "All" ? items.length : (countsMap[cat] ?? 0);
                const isActive = cat === selectedCategory;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      isActive
                        ? "gradient-royal text-white shadow-lg"
                        : "glass-sky text-slate-700 hover:bg-sky-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20" : "bg-sky-100"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => setCategory(selectedCategory)}
                className="px-6 py-2 glass-sky text-slate-700 rounded-xl"
              >
                Retry
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && items.length > 0 && (
            <div className="mb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden rounded-2xl aspect-square"
                  >
                    <img
                      src={item.media?.url}
                      alt={item.media?.alt_text || item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-2 py-1 bg-sky-600 text-xs font-semibold rounded-full mb-1 inline-block">
                        {item.category}
                      </span>
                      <h3 className="font-heading text-sm font-bold line-clamp-2">{item.title}</h3>
                      {item.location && (
                        <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-sky-400" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-700 mb-2">No photos yet</h3>
              <p className="text-slate-500">Check back soon — we're adding more.</p>
            </div>
          )}

          {/* Stats */}
          <div className="mb-20">
            <div className="glass-sky rounded-3xl p-8 max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-8">
                Our Journey in <span className="text-sky-700">Pictures</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Images,   count: "500+", label: "Photos",       color: "from-sky-400 to-blue-600" },
                  { icon: Users,    count: "200+", label: "Team Members", color: "from-violet-400 to-purple-600" },
                  { icon: MapPin,   count: "47",   label: "Counties",     color: "from-emerald-400 to-green-600" },
                  { icon: Calendar, count: "50+",  label: "Events",       color: "from-amber-400 to-orange-600" },
                ].map(({ icon: Icon, count, label, color }) => (
                  <div key={label} className="text-center">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-slate-800">{count}</h3>
                    <p className="text-slate-600 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">Want to See More?</h2>
              <p className="text-slate-600 mb-6">
                Follow us on social media to see more updates, photos, and behind-the-scenes content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-royal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Us
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-sky text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
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

export default Gallery;