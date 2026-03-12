import { Link } from "react-router-dom";
import { Wifi, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

const FooterSection = () => {
  return (
    <footer className="relative mt-12">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>
      
      {/* Glass border */}
      <div className="relative z-10 glass border-t border-white/40">
        <div className="container mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand & Newsletter Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 font-heading font-bold text-2xl text-foreground mb-5">
                <img 
                  src="/vilcomsignature.png" 
                  alt="Vilcom" 
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                Connecting homes and businesses with blazing-fast fiber internet across the region.
              </p>
              
              {/* Newsletter Subscription */}
              <div className="mb-6">
                <h4 className="font-heading font-bold text-slate-800 mb-4 text-lg">Subscribe to our newsletter</h4>
                <p className="text-sm text-slate-500 mb-3">Get updates on new plans and offers.</p>
                <NewsletterSignup variant="inline" className="flex gap-2" />
              </div>

              {/* Social Networks */}
              <div>
                <h4 className="font-heading font-bold text-slate-800 mb-4 text-lg">Follow us</h4>
                <div className="flex gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all duration-300">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all duration-300">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all duration-300">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all duration-300">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
<h4 className="font-heading font-bold text-slate-800 mb-5 text-lg">Quick Links</h4>
              <div className="space-y-3">
                <Link to="/coverage" className="block text-base text-slate-600 hover:text-primary transition-colors">
                  Coverage Map
                </Link>
                <Link to="/plans" className="block text-base text-slate-600 hover:text-primary transition-colors">
                  Home Plans
                </Link>
                <Link to="/plans" className="block text-base text-slate-600 hover:text-primary transition-colors">
                  Business Plans
                </Link>
                <Link to="/hosting" className="block text-base text-slate-600 hover:text-primary transition-colors">
                  Web Hosting
                </Link>
                <Link to="/book" className="block text-base text-primary hover:text-primary/80 transition-colors font-semibold">
                  Book Appointment
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-heading font-bold text-slate-800 mb-5 text-lg">Company</h4>
              <div className="space-y-3">
                {["About Us", "Careers", "Blog", "Media"].map((link) => (
                  <Link key={link} to="/blog" className="block text-base text-slate-600 hover:text-primary transition-colors">
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-bold text-slate-800 mb-5 text-lg">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-base text-slate-600">
                  <Mail className="w-5 h-5 text-primary shrink-0" /> customercare@vilcom.co.ke
                </div>
                <div className="flex items-center gap-3 text-base text-slate-600">
                  <Phone className="w-5 h-5 text-primary shrink-0" /> 0111 028800 (Safaricom)
                </div>
                <div className="flex items-center gap-3 text-base text-slate-600">
                  <Phone className="w-5 h-5 text-primary shrink-0" /> 0726888777 (WhatsApp)
                </div>
                <div className="flex items-center gap-3 text-base text-slate-600">
                  <Phone className="w-5 h-5 text-primary shrink-0" /> 0755055555 (Airtel)
                </div>
                <div className="flex items-center gap-3 text-base text-slate-600">
                  <MapPin className="w-5 h-5 text-primary shrink-0" /> Ramco Court, Block B, Mombasa Road
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/30 mt-12 pt-8 text-center text-base text-slate-500">
            © {new Date().getFullYear()} Vilcom Networks. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

