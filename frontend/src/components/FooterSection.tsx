import { Link } from "react-router-dom";
import { Wifi, Mail, Phone, MapPin } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="glass-crystal border-t border-white/60 mt-12">
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-foreground mb-4">
              <div className="w-9 h-9 rounded-lg gradient-royal flex items-center justify-center shadow-lg">
                <Wifi className="w-5 h-5 text-primary-foreground" />
              </div>
              SkyNet<span className="text-gradient-royal">Fiber</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting homes and businesses with blazing-fast fiber internet across the region.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["Coverage Map", "Home Plans", "Business Plans", "Web Services"].map((link) => (
                <Link key={link} to="/plans" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Company</h4>
            <div className="space-y-2">
              {["About Us", "Careers", "Blog", "Media"].map((link) => (
                <Link key={link} to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" /> hello@skynetfiber.co.ke
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" /> +254 700 000 000
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> Nairobi, Kenya
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SkyNetFiber. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
