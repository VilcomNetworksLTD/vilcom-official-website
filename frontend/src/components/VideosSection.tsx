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
      {/* Background - matching glassmorphism theme */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(220,30%,8%)/0.35]" />
      </div>

      {/* Multi-color radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[hsl(220,80%,40%)] opacity-15 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(340,80%,60%)] opacity-15 blur-[120px]" />
      <div className="absolute top-1/3 left-[10%] w-[350px] h-[350px] rounded-full bg-[hsl(30,100%,60%)] opacity-12 blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Videos</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-800 mt-3">
            Watch Our <span className="text-gradient-royal">Videos</span>
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
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

