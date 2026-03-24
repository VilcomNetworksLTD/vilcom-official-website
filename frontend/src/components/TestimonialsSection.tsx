import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonialService, type Testimonial } from "@/services/testimonials";

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  const visibleTestimonials = testimonials.length > 0 ? Math.min(3, testimonials.length) : 0;

  useEffect(() => {
    testimonialService.getPublic()
      .then((res) => {
        // Safe mapping depending on response format
        const dataArr = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        // Fallback for missing avatars
        const fetchedTestimonials = dataArr.map((t: any, index: number) => {
          const gradients = [
            "bg-gradient-to-br from-[hsl(340,80%,55%)] to-[hsl(320,70%,45%)]",
            "bg-gradient-to-br from-[hsl(30,100%,50%)] to-[hsl(45,100%,45%)]",
            "gradient-royal",
            "bg-gradient-to-br from-[hsl(170,70%,40%)] to-[hsl(200,80%,40%)]",
            "bg-gradient-to-br from-[hsl(260,70%,50%)] to-[hsl(280,60%,40%)]",
            "bg-gradient-to-br from-[hsl(190,80%,45%)] to-[hsl(210,70%,35%)]",
          ];
          return {
            ...t,
            avatarGradient: gradients[index % gradients.length],
          };
        });
        setTestimonials(fetchedTestimonials);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextSlide = () => {
    if (isAnimating || testimonials.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating || testimonials.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAnimating, testimonials.length]);

  const getVisibleItems = () => {
    if (testimonials.length === 0) return [];
    if (testimonials.length === 1) return [{ ...testimonials[0], position: 0 }];
    if (testimonials.length === 2) {
      return [
        { ...testimonials[currentIndex], position: 0 },
        { ...testimonials[(currentIndex + 1) % testimonials.length], position: 1 },
      ];
    }
    const items = [];
    for (let i = 0; i < visibleTestimonials; i++) {
      const index = (currentIndex + i) % testimonials.length;
      items.push({ ...testimonials[index], position: i });
    }
    return items;
  };

  if (loading || testimonials.length === 0) {
    return null; // Or return a loading state / empty state if preferred
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dark blue gradient background - matching ServicePage */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(235,85%,25%)] via-[hsl(235,80%,30%)] to-[hsl(225,70%,40%)]" />
      
      {/* Animated fluid shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-[100px]" />
        <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-300/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/15 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mt-3">
            Loved by <span className="text-white">Thousands</span>
          </h2>
        </div>

        {/* Sliding Testimonial Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden py-8">
            <div className="flex items-center justify-center gap-4 md:gap-6 transition-all duration-500 ease-out">
              {getVisibleItems().map((item, idx) => {
                const isCenter = idx === 1;
                return (
                  <div
                    key={`${currentIndex}-${idx}`}
                    className={`relative transition-all duration-500 ease-out ${
                      isCenter 
                        ? 'w-full md:w-[400px] opacity-100 scale-100 z-10' 
                        : 'w-full md:w-[300px] opacity-40 scale-90 blur-[1px] hidden md:block'
                    }`}
                    style={{
                      transform: isCenter ? 'scale(1)' : 'scale(0.85)',
                    }}
                  >
                    <div className={`glass-dark backdrop-blur-xl rounded-3xl p-6 md:p-8 border ${
                      isCenter ? 'border-white/20' : 'border-white/10'
                    }`}>
                      {/* Quote Icon */}
                      <div className="absolute -top-4 left-6 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Quote className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Stars */}
                      <div className="flex gap-1 mb-4 mt-2">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className={`text-sm md:text-base leading-relaxed mb-6 ${isCenter ? 'text-blue-200/90' : 'text-blue-200/60'}`}>
                        "{item.content}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${item.avatarGradient} flex items-center justify-center text-white font-bold`}>
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-heading font-bold text-white">{item.name}</div>
                          <div className="text-xs text-blue-200/60">{item.company || 'Customer'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrentIndex(idx);
                    setTimeout(() => setIsAnimating(false), 500);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

