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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-[20%] w-64 h-64 bg-sky-100 opacity-50 rounded-full blur-[80px]" />
      <div className="absolute bottom-20 right-[15%] w-72 h-72 bg-blue-50 opacity-50 rounded-full blur-[100px]" />

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
              className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              {/* Video container with iframe for inline playback */}
              <div className="relative aspect-video bg-slate-800">
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

