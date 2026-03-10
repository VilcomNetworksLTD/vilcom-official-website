import { Play } from "lucide-react";

const videos = [
  {
    id: "dQw4w9WgXcQ",
    title: "Vilcom Network - Fast Fiber Internet",
    description: "Experience blazing-fast fiber internet with Vilcom Network",
  },
  {
    id: "M7lc1UVf-VE",
    title: "How Fiber Optic Works",
    description: "Learn how fiber optic technology powers your internet connection",
  },
];

const VideosSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Dark blue gradient background - matching TestimonialsSection */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]" />

      {/* Animated fluid shapes - matching TestimonialsSection style */}
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

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {videos.map((video) => (
            <div
              key={video.id}
              className="glass-crystal group relative rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
            >
              {/* Video container with iframe for inline playback */}
              <div className="relative aspect-video bg-slate-800 rounded-t-3xl">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=0&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Video info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-heading font-semibold text-white text-lg md:text-xl drop-shadow-lg">{video.title}</h3>
                <p className="text-white/80 text-sm mt-1 drop-shadow">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideosSection;

