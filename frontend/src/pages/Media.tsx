import { Link } from "react-router-dom";
import { 
  Award, 
  ExternalLink, 
  ArrowRight,
  Calendar,
  Newspaper,
  ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

const mediaFeatures = [
  {
    id: 1,
    title: "How Vilcom Network's staff empowerment will drive customer satisfaction",
    source: "Business Now Kenya",
    sourceUrl: "https://businessnow.co.ke",
    date: "August 18, 2025",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    url: "https://businessnow.co.ke/how-vilcom-networks-staff-empowerment-will-drive-customer-satisfaction",
    excerpt: "Vilcom Networks emphasizes staff training and empowerment as key drivers of exceptional customer service. The company's comprehensive approach to workforce development has resulted in measurable improvements in customer satisfaction metrics.",
    category: "Company News"
  },
  {
    id: 2,
    title: "Vilcom Networks Concludes 4-Cohort Customer Service & Experience Training for All Staff",
    source: "Nipashe Biz",
    sourceUrl: "https://nipashebiz.co.ke",
    date: "August 18, 2025",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    url: "https://nipashebiz.co.ke/vilcom-networks-concludes-4-cohort-customer-service-experience-training",
    excerpt: "All Vilcom Networks staff have completed comprehensive customer service and experience training across 4 cohorts. This initiative underscores the company's commitment to delivering world-class service.",
    category: "Training"
  },
  {
    id: 3,
    title: "Vilcom Networks Expands Fiber Coverage to 47 Counties",
    source: "Tech in Africa",
    sourceUrl: "https://techinafrica.com",
    date: "July 15, 2025",
    thumbnail: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "Vilcom Networks announces completion of fiber network expansion covering all 47 Kenyan counties, bringing high-speed internet to previously underserved regions.",
    category: "Expansion"
  },
  {
    id: 4,
    title: "Vilcom Networks Wins Best ISP Award 2025",
    source: "Tech Awards Africa",
    sourceUrl: "https://techawards.africa",
    date: "June 20, 2025",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "Vilcom Networks receives the prestigious Best ISP in Kenya award at the Tech Awards Africa 2025, recognizing outstanding network performance and customer satisfaction.",
    category: "Awards"
  },
  {
    id: 5,
    title: "Interview: CEO Samuel Kariuki on Kenya's Digital Future",
    source: "Business Daily Africa",
    sourceUrl: "https://businessdaily.africa",
    date: "May 10, 2025",
    thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "An in-depth interview with Vilcom Networks CEO discussing the company's vision for connecting all Kenyans and the future of telecommunications in East Africa.",
    category: "Interview"
  },
  {
    id: 6,
    title: "Vilcom Networks Launches New Business Solutions Division",
    source: "CIO East Africa",
    sourceUrl: "https://cio.eastafrica",
    date: "April 5, 2025",
    thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    url: "#",
    excerpt: "Vilcom Networks unveils a new division focused on enterprise solutions, offering customized internet packages for businesses of all sizes.",
    category: "Product Launch"
  }
];

const Media = () => {
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
              Media <span className="text-sky-700">Features</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              Latest news, articles, and features about Vilcom Networks
            </p>
          </div>

          <div className="mb-12">
            <Link 
              to="/about"
              className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to About Us
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {mediaFeatures.map((article) => (
              <div 
                key={article.id}
                className="glass-sky rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={article.thumbnail} 
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Newspaper className="w-4 h-4" />
                    <a 
                      href={article.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:underline"
                    >
                      {article.source}
                    </a>
                    <span>•</span>
                    <Calendar className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg hover:bg-sky-200 transition-colors text-sm"
                  >
                    Learn More <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-20">
            <div className="glass-sky rounded-3xl p-8 max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-8">
                Press <span className="text-sky-700">Inquiries</span>
              </h2>
              <p className="text-slate-600 text-center mb-6">
                For media inquiries, interview requests, or press releases, please contact our communications team.
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

          <div className="text-center">
            <div className="glass-crystal rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-4">
                Stay Updated
              </h2>
              <p className="text-slate-600 mb-6">
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

export default Media;
