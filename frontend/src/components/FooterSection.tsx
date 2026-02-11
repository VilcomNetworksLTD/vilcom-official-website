import { Link } from "react-router-dom";
import { Wifi, Mail, Phone, MapPin } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="glass border-t border-white/40 mt-12">
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-foreground mb-4">
              <div className="w-9 h-9 rounded-lg gradient-royal flex items-center justify-center shadow-lg">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              Vilcom<span className="text-gradient-royal">Network</span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connecting homes and businesses with blazing-fast fiber internet across the region.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-slate-800 mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["Coverage Map", "Home Plans", "Business Plans", "Web Services"].map((link) => (
                <Link key={link} to="/plans" className="block text-sm text-slate-600 hover:text-primary transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-slate-800 mb-4">Company</h4>
            <div className="space-y-2">
              {["About Us", "Careers", "Blog", "Media"].map((link) => (
                <Link key={link} to="/blog" className="block text-sm text-slate-600 hover:text-primary transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-slate-800 mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-primary" /> hello@vilcom.co.ke
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-primary" /> +254 700 000 000
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-primary" /> Nairobi, Kenya
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/30 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Vilcom Networks. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

