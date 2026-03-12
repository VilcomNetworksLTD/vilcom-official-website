import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// YouTube Playlist ID for Vilcom Networks (used for the link to full playlist)
const PLAYLIST_ID = "PL74u8YvjWgZ7ZXt99DQ7EB7TWKpJoCmVY";

// Video data for the slider - individual YouTube video IDs from Vilcom Networks
const videos = [
  {
    id: "zGF85rcGl4U",
    title: "Vilcom Networks - Leading Internet Service Provider",
    description: "Experience blazing-fast fiber internet with Vilcom Networks Kenya",
  },
  {
    id: "Dp1I8Gwuoyw",
    title: "Vilcom Fibre Solutions",
    description: "Learn how Vilcom fibre technology powers your internet connection",
  },
  {
    id: "r5ceSaJlm-0",
    title: "Enterprise Connectivity Solutions",
    description: "Business-grade internet solutions for your company",
  },
  {
    id: "sD1TKxa832Q",
    title: "Smart Home Integration",
    description: "Connect your home with Vilcom smart solutions",
  },
  {
    id: "idwSB07G55U",
    title: "Cyber Security Services",
    description: "Protect your business with Vilcom security solutions",
  },
  {
    id: "D8OSP-PpDoM",
    title: "Cloud Solutions",
    description: "Scalable cloud computing for modern businesses",
  },
];

const VideosSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Dark blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]" />

      {/* Animated fluid shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
        <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Videos</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-3">
            Watch Our <span className="text-white">Videos</span>
          </h2>
          <p className="text-blue-200/80 mt-4 max-w-2xl mx-auto">
            Learn more about our services and technology through our featured videos
          </p>
        </div>

        {/* Scroll Container with Navigation Arrows */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 md:p-3 rounded-full text-white transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 md:p-3 rounded-full text-white transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Videos Horizontal Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex-shrink-0 w-[240px] md:w-[350px] snap-center"
              >
                <div className="glass-crystal group relative rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                  {/* Video container */}
                  <div className="relative aspect-video bg-slate-800 rounded-t-3xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=0&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  {/* Video info */}
                  <div className="p-4 md:p-5 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-heading font-semibold text-white text-sm md:text-lg drop-shadow-lg line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm mt-1 drop-shadow line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Full Playlist Link */}
        <div className="text-center mt-8">
          <a
            href={`https://youtube.com/playlist?list=${PLAYLIST_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors"
          >
            View Full Playlist on YouTube
          </a>
        </div>
      </div>
    </section>
  );
};

export default VideosSection;

