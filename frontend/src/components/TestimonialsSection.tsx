import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amina W.",
    role: "Home User, Kilimani",
    quote: "Switched to SkyNetFiber and my streaming has never been smoother. The 100Mbps plan is a game-changer!",
    rating: 5,
    avatarGradient: "bg-gradient-to-br from-[hsl(340,80%,55%)] to-[hsl(320,70%,50%)]",
  },
  {
    name: "Brian K.",
    role: "Business Owner, Westlands",
    quote: "99.9% uptime isn't just marketing—it's real. Our office hasn't had a single outage in 6 months.",
    rating: 5,
    avatarGradient: "bg-gradient-to-br from-[hsl(30,100%,55%)] to-[hsl(45,100%,50%)]",
  },
  {
    name: "Grace M.",
    role: "Student, Kasarani",
    quote: "Affordable, fast, and the customer support team is incredibly responsive. Best ISP in Nairobi!",
    rating: 5,
    avatarGradient: "gradient-royal",
  },
  {
    name: "David O.",
    role: "Developer, Karen",
    quote: "The static IP and priority support make remote work seamless. Highly recommend the Family plan.",
    rating: 5,
    avatarGradient: "bg-gradient-to-br from-[hsl(170,70%,45%)] to-[hsl(200,80%,45%)]",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[hsl(225,50%,6%)]">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-[30%] w-80 h-80 bg-[hsl(340,80%,55%)] opacity-15 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-[20%] w-72 h-72 bg-[hsl(30,100%,60%)] opacity-12 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[10%] w-64 h-64 bg-[hsl(0,0%,100%)] opacity-5 rounded-full blur-[90px]" />
        <div className="absolute bottom-[30%] left-[60%] w-56 h-56 bg-[hsl(200,90%,50%)] opacity-8 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[hsl(340,80%,70%)] text-sm font-semibold uppercase tracking-widest">Testimonials</span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3">
            Loved by <span className="text-gradient-pink">Thousands</span>
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-bubble-dark min-w-[300px] max-w-[320px] rounded-[40px] p-8 flex flex-col items-center text-center snap-center shrink-0 hover:pink-glow transition-all duration-500"
            >
              <div className={`w-16 h-16 rounded-full ${t.avatarGradient} flex items-center justify-center mb-4 text-white font-heading font-bold text-xl`}>
                {t.name.charAt(0)}
              </div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[hsl(30,100%,60%)] text-[hsl(30,100%,60%)]" />
                ))}
              </div>

              <p className="text-sm text-white/75 leading-relaxed mb-5 italic">"{t.quote}"</p>

              <div>
                <div className="font-heading font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs text-white/50">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
