import { Link } from "react-router-dom";
import { 
  Images, 
  Users, 
  MapPin, 
  ArrowRight,
  Calendar,
  Wifi,
  PartyPopper
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const galleryImages = [
  {
    id: 1,
    category: "Team",
    title: "Vilcom Networks Team at Annual Retreat 2024",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    location: "Nairobi"
  },
  {
    id: 2,
    category: "Installation",
    title: "Fiber Optic Cable Installation in Nairobi",
    image: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&h=400&fit=crop",
    location: "Nairobi County"
  },
  {
    id: 3,
    category: "Coverage",
    title: "Network Coverage Map Expansion",
    image: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=600&h=400&fit=crop",
    location: "47 Counties"
  },
  {
    id: 4,
    category: "Events",
    title: "Customer Appreciation Day Event",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    location: "Mombasa"
  },
  {
    id: 5,
    category: "Installation",
    title: "Business Center Setup",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    location: "Kisumu"
  },
  {
    id: 6,
    category: "Team",
    title: "Technical Team Training Session",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    location: "Nairobi"
  },
  {
    id: 7,
    category: "Events",
    title: "Product Launch Event",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop",
    location: "Nairobi"
  },
  {
    id: 8,
    category: "Coverage",
    title: "New Coverage Area Launch",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
    location: "Eldoret"
  },
  {
    id: 9,
    category: "Installation",
    title: "Residential Complex Installation",
    image: "https://images.unsplash.com/photo-1565514020175-850b8c3b6d42?w=600&h=400&fit=crop",
    location: "Nairobi"
  },
  {
    id: 10,
    category: "Team",
    title: "Customer Service Excellence Awards",
    image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&h=400&fit=crop",
    location: "Nairobi"
  },
  {
    id: 11,
    category: "Events",
    title: "Community Outreach Program",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop",
    location: "Nakuru"
  },
  {
    id: 12,
    category: "Installation",
    title: "Data Center Setup",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    location: "Nairobi"
  }
];

const categories = [
  { name: "All", icon: Images, count: 12 },
  { name: "Team", icon: Users, count: 3 },
  { name: "Installation", icon: Wifi, count: 4 },
  { name: "Coverage", icon: MapPin, count: 2 },
  { name: "Events", icon: PartyPopper, count: 3 },
];

const Gallery = () => {
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
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              Our <span className="text-sky-700">Gallery</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              Explore photos of our team, installations, coverage areas, and events across Kenya
            </p>
          </div>

          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                    index === 0 
                      ? "gradient-royal text-white shadow-lg" 
                      : "glass-sky text-slate-700 hover:bg-sky-100"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    index === 0 ? "bg-white/20" : "bg-sky-100"
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryImages.map((image) => (
                <div 
                  key={image.id}
                  className="relative group overflow-hidden rounded-2xl aspect-square"
                >
                  <img 
                    src={image.image} 
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-1 bg-sky-600 text-xs font-semibold rounded-full mb-1 inline-block">{image.category}</span>
                    <h3 className="font-heading text-sm font-bold line-clamp-2">{image.title}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {image.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <div className="glass-sky rounded-3xl p-8 max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-8">
                Our Journey in <span className="text-sky-700">Pictures</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Images className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-800">500+</h3>
                  <p className="text-slate-600 text-sm">Photos</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-800">200+</h3>
                  <p className="text-slate-600 text-sm">Team Members</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-800">47</h3>
                  <p className="text-slate-600 text-sm">Counties</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-800">50+</h3>
                  <p className="text-slate-600 text-sm">Events</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">
                Want to See More?
              </h2>
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
