import { useState } from "react";
import { Wifi, Server, Cloud, Lock, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EarthGlobe3D from "./EarthGlobe3D";
import { coverageApi, CoverageCheckResponse } from "@/services/coverage";

const HeroSection = () => {
  const orbitText = "VILCOM NETWORKS LIMITED  ·  VILCOM NETWORKS LIMITED  ·  ";
  
  // Coverage search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<CoverageCheckResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleCoverageSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    
    try {
      const response = await coverageApi.checkCoverage({ address: searchQuery });
      setSearchResult(response);
    } catch (error: any) {
      console.error("Coverage check error:", error);
      setSearchError(error.response?.data?.message || "Unable to check coverage. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
    setSearchError(null);
  };

  return (
    <section
      className="hero-root relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#05050A" }}
    >
      {/* ── Ambient blobs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute" style={{ top: "-10%", left: "-8%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute" style={{ bottom: "-15%", left: "5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)", filter: "blur(50px)" }} />
        <div className="absolute" style={{ top: "35%", left: "15%", width: "35vw", height: "35vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 60%)", filter: "blur(35px)" }} />
      </div>

      {/* ══════════════════════════════════════════
          GLOBE
          Desktop → absolute right-side panel (55% wide, full height)
          Mobile  → relative block stacked above content
      ══════════════════════════════════════════ */}
      <div className="globe-wrapper">

        {/*
          globe-canvas-box:
          • Gives the Canvas a concrete pixel height on every breakpoint.
          • EarthGlobe3D fills 100% of this box thanks to the fix in that file.
        */}
        <div className="globe-canvas-box">
          <EarthGlobe3D />
        </div>

        {/* Orbit ring — desktop only (hidden via CSS on mobile) */}
        <div className="orbit-ring" aria-hidden>
          <svg viewBox="0 0 500 500" width="100%" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <path id="orbitPath" d="M 250,250 m -250,0 a 250,250 0 1,1 500,0 a 250,250 0 1,1 -500,0" />
            </defs>
            <circle cx="250" cy="250" r="250" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" strokeDasharray="3 8" />
            <text fill="rgba(6,182,212,0.95)" fontSize="16" fontFamily="'Courier New', monospace" fontWeight="800" letterSpacing="5">
              <textPath href="#orbitPath" startOffset="0%">
                {orbitText}
                <animate attributeName="startOffset" from="0%" to="100%" dur="20s" repeatCount="indefinite" />
              </textPath>
            </text>
          </svg>
        </div>

        {/* Desktop: blend globe into content on the left */}
        <div className="globe-fade-left" aria-hidden />
        {/* Mobile: blend globe into content below */}
        <div className="globe-fade-bottom" aria-hidden />
      </div>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <div className="content-section relative z-10 flex flex-col justify-center">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-7 anim-0">
          <span className="eyebrow-pill inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold tracking-widest uppercase">
            <span className="pulse-dot w-2 h-2 rounded-full bg-cyan-300" />
            Nairobi · Kenya
          </span>
        </div>

        {/* Headline */}
        <div className="mb-8 anim-1">
          <h1 className="hero-heading font-extrabold text-white leading-[1.1] mb-5">
            Technology solutions<br />that are{" "}
            <span className="word-cycle-wrap">
              <span className="word-cycle">
                <span className="word-item">smart</span>
                <span className="word-item">secure</span>
                <span className="word-item">scalable</span>
              </span>
            </span>
          </h1>
          <p className="hero-body leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
            The best technology solutions provider — delivering lightning-fast
            internet, enterprise hosting, and cyber-secure cloud services to
            homes and businesses across Kenya.
          </p>
        </div>

        {/* CTAs */}
        <div className="cta-group flex flex-wrap gap-4 mb-10 anim-2">
          <Button asChild className="gradient-royal text-white font-bold rounded-2xl royal-glow border-0 hover:scale-105 transition-transform shadow-xl cta-btn" style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.1rem)" }}>
            <Link to="/plans">Our Plans</Link>
          </Button>
          <Button asChild variant="outline" className="font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-colors cta-btn" style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.1rem)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
            <Link to="/coverage">Our Coverage</Link>
          </Button>
          <Button asChild variant="outline" className="font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-colors cta-btn" style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.1rem)", border: "1.5px solid rgba(6,182,212,0.5)", color: "#67e8f9", background: "rgba(6,182,212,0.1)", backdropFilter: "blur(10px)" }}>
            <Link to="/speed-test">Speed Test</Link>
          </Button>
        </div>

        {/* Service Badges */}
        <div className="badges-row mb-10 anim-3">
          {[
            { icon: Server, label: "Web Hosting" },
            { icon: Cloud,  label: "Cloud Solutions" },
            { icon: Lock,   label: "Cyber Security" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="badge-item flex items-center gap-3 rounded-2xl" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.20)", backdropFilter: "blur(12px)" }}>
              <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span className="font-semibold badge-label" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Coverage Card with Search Input */}
        <div className="anim-4 relative rounded-3xl p-6 hover:scale-[1.01] transition-all duration-300 overflow-hidden backdrop-blur-md" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)" }}>
          <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)" }} />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-[80px]" style={{ background: "rgba(234,88,12,0.2)" }} />
          
          {!searchResult ? (
            /* Search Input Mode */
            <form onSubmit={handleCoverageSearch} className="coverage-inner relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                <Wifi className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1 w-full min-w-0">
                <h3 className="font-heading text-lg font-bold text-white mb-1">Check Coverage</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your estate or location..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition-all text-sm"
                    disabled={isSearching}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchError && (
                  <p className="text-red-400 text-xs mt-2">{searchError}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="gradient-royal text-white font-bold rounded-xl border-0 shadow-lg flex-shrink-0 hover:scale-105 transition-transform coverage-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Now"
                )}
              </Button>
            </form>
          ) : (
            /* Result Mode */
            <div className="coverage-inner relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${searchResult.is_covered ? 'bg-green-500/20 border-green-400/30' : 'bg-orange-500/20 border-orange-400/30'}`}>
                {searchResult.is_covered ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-orange-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-lg font-bold text-white mb-1">
                  {searchResult.is_covered ? `We Cover ${searchResult.zone?.name || 'Your Area'}!` : 'Not Covered Yet'}
                </h3>
                <p className="text-white/70 text-sm">{searchResult.message}</p>
                {searchResult.is_covered && searchResult.zone?.packages && searchResult.zone.packages.length > 0 && (
                  <p className="text-cyan-400 text-xs mt-1">
                    {searchResult.zone.packages.length} package(s) available starting from KES {Math.min(...searchResult.zone.packages.map((p: any) => p.monthly_price)).toLocaleString()}/mo
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  type="button"
                  onClick={clearSearch}
                  variant="outline"
                  className="font-bold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors text-sm px-4 py-2"
                >
                  Search Again
                </Button>
                <Button asChild className="gradient-royal text-white font-bold rounded-xl border-0 shadow-lg flex-shrink-0 hover:scale-105 transition-transform coverage-btn">
                  <Link to="/coverage">View Plans</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════  STYLES  */}
      <style>{`
        /* ── Entry animations ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeInUp 0.7s ease-out 0.00s forwards; opacity: 0; }
        .anim-1 { animation: fadeInUp 0.7s ease-out 0.10s forwards; opacity: 0; }
        .anim-2 { animation: fadeInUp 0.7s ease-out 0.20s forwards; opacity: 0; }
        .anim-3 { animation: fadeInUp 0.7s ease-out 0.30s forwards; opacity: 0; }
        .anim-4 { animation: fadeInUp 0.7s ease-out 0.40s forwards; opacity: 0; }

        /* ── Word cycling ── */
        .word-cycle-wrap { display: inline-block; overflow: hidden; vertical-align: bottom; height: 1.12em; }
        .word-cycle { display: inline-flex; flex-direction: column; animation: wordCycle 4.8s cubic-bezier(0.4,0,0.2,1) infinite; }
        .word-item  { display: block; color: #67e8f9; line-height: 1.12em; white-space: nowrap; text-shadow: 0 0 20px rgba(6,182,212,0.6); }
        @keyframes wordCycle {
          0%,30%  { transform: translateY(0); }
          33%,63% { transform: translateY(-1.12em); }
          66%,96% { transform: translateY(-2.24em); }
          100%    { transform: translateY(0); }
        }

        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.4; transform:scale(.75); }
        }
        .pulse-dot    { animation: pulseDot 2s ease-in-out infinite; }
        .eyebrow-pill { font-size:.68rem; color:#67e8f9; background:rgba(6,182,212,0.13); border:1px solid rgba(6,182,212,0.35); box-shadow:0 0 18px rgba(6,182,212,0.12); }

        /* ══════════════════════════════════
           DESKTOP  ≥ 1025px
        ══════════════════════════════════ */
        .globe-wrapper {
          position: absolute;
          top: 0; bottom: 0; right: 0;
          width: 55%;
          pointer-events: none;
          /* overflow visible so orbit ring can extend outside */
        }
        /* The canvas box fills the whole right panel */
        .globe-canvas-box {
          position: absolute;
          inset: 0;
          margin-top: 100px;
        }
        .orbit-ring {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: min(140%, 850px); aspect-ratio: 1;
          pointer-events: none; z-index: 20;
        }
        .globe-fade-left {
          position: absolute; inset-block: 0; left: 0; width: 75%;
          background: linear-gradient(90deg,
            rgba(5,5,10,0.65) 0%,
            rgba(5,5,10,0.35) 18%,
            rgba(5,5,10,0.15) 40%,
            rgba(5,5,10,0.05) 60%,
            transparent 80%);
          pointer-events: none;
        }
        .globe-fade-bottom { display: none; }

        .content-section {
          width: 45%;
          min-height: 100vh;
          padding: clamp(96px,9vw,136px) clamp(32px,4vw,64px) clamp(48px,5vw,80px);
        }
        .hero-heading { font-size: clamp(2.2rem,3.5vw,3.2rem); text-shadow: 0 2px 30px rgba(6,182,212,0.25); }
        .hero-body    { font-size: clamp(1.05rem,1.45vw,1.22rem); }
        .cta-btn      { padding: 15px 42px; }
        .coverage-btn { padding: 13px 30px; }

        /* Badges: horizontal row on desktop */
        .badges-row   { display: flex; flex-wrap: wrap; gap: 16px; }
        .badge-item   { padding: 12px 20px; }
        .badge-label  { font-size: clamp(0.88rem,1vw,1rem); }

        /* ══════════════════════════════════
           TABLET  768 – 1024px
        ══════════════════════════════════ */
        @media (max-width: 1024px) {
          .hero-root {
            flex-direction: column !important;
            align-items: stretch !important;
            min-height: auto !important;
          }

          /* Globe block at top */
          .globe-wrapper {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: 340px;
            order: -1;
            overflow: hidden;
          }
          /* canvas box fills that 340px block */
          .globe-canvas-box {
            position: absolute !important;
            inset: 0 !important;
            margin-top: 0 !important;
            height: 340px !important;
          }
          .orbit-ring       { display: none !important; }
          .globe-fade-left  { display: none; }
          .globe-fade-bottom {
            display: block;
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 120px;
            background: linear-gradient(to bottom, transparent 0%, rgba(5,5,10,1) 100%);
            pointer-events: none;
          }

          .content-section  { width: 100% !important; min-height: auto !important; padding: 28px 32px 48px !important; }
          .hero-heading     { font-size: 2rem !important; }
          .hero-body        { font-size: 1rem !important; }
        }

        /* ══════════════════════════════════
           MOBILE  ≤ 767px
        ══════════════════════════════════ */
        @media (max-width: 767px) {
          .globe-wrapper    { height: 280px; }
          .globe-canvas-box { height: 280px !important; }

          .content-section  { padding: 20px 16px 40px !important; }
          .hero-heading     { font-size: 1.75rem !important; line-height: 1.2 !important; }
          .hero-body        { font-size: 0.95rem !important; }

          /* Full-width stacked CTAs */
          .cta-group  { flex-direction: column !important; gap: 12px !important; }
          .cta-btn    { width: 100% !important; justify-content: center !important; padding: 14px 20px !important; }

          /* 2-column badge grid */
          .badges-row { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .badge-item { padding: 10px 14px !important; }

          /* Stacked coverage card */
          .coverage-inner { flex-direction: column !important; text-align: center !important; gap: 14px !important; }
          .coverage-btn   { width: 100% !important; padding: 14px 20px !important; justify-content: center !important; }
        }

        /* ══════════════════════════════════
           VERY SMALL  ≤ 400px
        ══════════════════════════════════ */
        @media (max-width: 400px) {
          .globe-wrapper    { height: 220px; }
          .globe-canvas-box { height: 220px !important; }

          .hero-heading { font-size: 1.5rem !important; }
          .hero-body    { font-size: 0.875rem !important; }
          .badges-row   { grid-template-columns: 1fr !important; }
          .eyebrow-pill { font-size: 0.6rem !important; padding: 6px 12px !important; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;