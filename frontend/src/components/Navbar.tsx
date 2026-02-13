import { useState, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu, X, Wifi, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavSubItem {
  label: string;
  to: string;
}

interface NavDropdownItem {
  label: string;
  to: string;
  subdropdown?: NavSubItem[];
}

interface NavItem {
  label: string;
  to: string;
  dropdown?: NavDropdownItem[];
}

const navLinks: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Coverage", to: "/coverage" },
  { 
    label: "Products & Services", 
    to: "/products-services",
    dropdown: [
      { label: "Vuta Wifi", to: "/plans" },
      { label: "Fibre Solutions", to: "/fiber" },
      { 
        label: "Hosting Services", 
        to: "/hosting",
        subdropdown: [
          { label: "Web Hosting", to: "/hosting" },
          { label: "Reseller Hosting", to: "/hosting?tab=reseller" },
          { label: "VPS Hosting", to: "/hosting?tab=vps" },
          { label: "Domains", to: "/domains" },
        ]
      },
      { label: "Web Development", to: "/web-development" },
    ]
  },
  { label: "Careers", to: "/careers" },
  { label: "Certifications", to: "/certifications" },
  { label: "FAQs", to: "/faqs" },
  { label: "Blog", to: "/blog" },
  { label: "Contact Us", to: "/contact-us" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subdropdownOpen, setSubdropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subdropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isActive = (to: string) => {
    if (to.includes("?")) {
      const [path, query] = to.split("?");
      return location.pathname === path && searchParams.get("tab") === query.split("=")[1];
    }
    return location.pathname === to;
  };

  return (
    <>
      {/* Sub Navbar - Login & Get Started */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto flex items-center justify-end h-10 px-4">
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-royal text-white font-semibold shadow-lg royal-glow border-0 text-xs px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="fixed top-10 left-0 right-0 z-50 glass border-b border-white/40">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-foreground">
            <div className="w-9 h-9 rounded-lg gradient-royal flex items-center justify-center shadow-lg">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span>Vilcom<span className="text-gradient-royal">Network</span></span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div 
                  key={link.to} 
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={() => {
                    setDropdownOpen(true);
                    setSubdropdownOpen(false);
                  }}
                  onMouseLeave={() => {
                    setDropdownOpen(false);
                    setSubdropdownOpen(false);
                  }}
                >
                  <button
                    className={`px-5 py-3 rounded-lg text-base font-bold transition-colors flex items-center gap-1 ${
                      link.dropdown.some(item => isActive(item.to) || (item.subdropdown && item.subdropdown.some(sub => isActive(sub.to))))
                        ? "text-primary bg-primary/10"
                        : "text-slate-800 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 glass-dark backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 py-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      {link.dropdown.map((item) => (
                        item.subdropdown ? (
                          <div 
                            key={item.to}
                            className="relative"
                            ref={subdropdownRef}
                            onMouseEnter={() => setSubdropdownOpen(true)}
                            onMouseLeave={() => setSubdropdownOpen(false)}
                          >
                            <button
                              className={`w-full px-5 py-3 text-base font-semibold transition-colors flex items-center justify-between ${
                                isActive(item.to)
                                  ? "text-primary bg-primary/20"
                                  : "text-white hover:bg-white/20"
                              }`}
                            >
                              {item.label}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            
                            {/* Subdropdown Menu */}
                            {subdropdownOpen && (
                              <div className="absolute top-0 left-full ml-1 w-56 glass-dark backdrop-blur-2xl rounded-xl shadow-2xl border border-white/20 py-3 animate-in fade-in slide-in-from-left-2 duration-200 z-50">
                                {item.subdropdown.map((subitem) => (
                                  <Link
                                    key={subitem.to}
                                    to={subitem.to}
                                    onClick={() => {
                                      setDropdownOpen(false);
                                      setSubdropdownOpen(false);
                                    }}
                                    className={`block px-5 py-3 text-base font-semibold transition-colors ${
                                      isActive(subitem.to)
                                        ? "text-primary bg-primary/20"
                                        : "text-white hover:bg-white/20"
                                    }`}
                                  >
                                    {subitem.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                              setDropdownOpen(false);
                              setSubdropdownOpen(false);
                            }}
                            className={`block px-5 py-3 text-base font-semibold transition-colors ${
                              isActive(item.to)
                                ? "text-primary bg-primary/20"
                                : "text-white hover:bg-white/20"
                            }`}
                          >
                            {item.label}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-5 py-3 rounded-lg text-base font-bold transition-colors ${
                    isActive(link.to)
                      ? "text-primary bg-primary/10"
                      : "text-slate-800 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
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
              link.dropdown ? (
                <div key={link.to} className="border-b border-slate-200/20">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-between w-full py-3 text-sm font-medium text-slate-700"
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="pl-4 pb-2 space-y-1">
                      {link.dropdown.map((item) => (
                        item.subdropdown ? (
                          <div key={item.to}>
                            <button
                              onClick={() => setSubdropdownOpen(!subdropdownOpen)}
                              className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-500"
                            >
                              {item.label}
                              <ChevronRight className={`w-4 h-4 ${subdropdownOpen ? 'rotate-90' : ''}`} />
                            </button>
                            {subdropdownOpen && (
                              <div className="pl-4 space-y-1">
                                {item.subdropdown.map((subitem) => (
                                  <Link
                                    key={subitem.to}
                                    to={subitem.to}
                                    onClick={() => {
                                      setOpen(false);
                                      setDropdownOpen(false);
                                      setSubdropdownOpen(false);
                                    }}
                                    className={`block py-2 text-sm font-medium ${
                                      isActive(subitem.to)
                                        ? "text-primary"
                                        : "text-slate-500 hover:text-primary"
                                    }`}
                                  >
                                    {subitem.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                              setOpen(false);
                              setDropdownOpen(false);
                            }}
                            className={`block py-2 text-sm font-medium ${
                              isActive(item.to)
                                ? "text-primary"
                                : "text-slate-500 hover:text-primary"
                            }`}
                          >
                            {item.label}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-sm font-medium border-b border-slate-200/20 ${
                    isActive(link.to)
                      ? "text-primary"
                      : "text-slate-700 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="flex gap-3 mt-4">
              <Link to="/auth" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-slate-700">Login</Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full gradient-royal text-white font-semibold border-0">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
