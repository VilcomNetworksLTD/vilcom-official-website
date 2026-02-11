import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Coverage", to: "/coverage" },
  { label: "Plans", to: "/plans" },
  { label: "Web Services", to: "/web-services" },
  { label: "Careers", to: "/careers" },
  { label: "Blog", to: "/blog" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-foreground">
          <div className="w-9 h-9 rounded-lg gradient-royal flex items-center justify-center shadow-lg">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <span>Vilcom<span className="text-gradient-royal">Network</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-slate-700 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-700 hover:text-primary">
            Login
          </Button>
          <Button size="sm" className="gradient-royal text-white font-semibold shadow-lg royal-glow border-0">
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-700">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/40 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-slate-700 hover:text-primary border-b border-slate-200/20"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" size="sm" className="flex-1 text-slate-700">Login</Button>
            <Button size="sm" className="flex-1 gradient-royal text-white font-semibold border-0">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

