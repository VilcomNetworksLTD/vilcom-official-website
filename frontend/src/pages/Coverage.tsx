import { Search, CheckCircle, Clock, Wifi, Globe, X, ChevronRight, Zap, Map, Box, Globe2, Menu, ZoomIn } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import KenyaGlobe3D from "@/components/KenyaGlobe3D";
import KenyaCoverageMap2D from "@/components/KenyaCoverageMap2D";
import EarthGlobe3D from "@/components/EarthGlobe3D";

import api from "@/lib/axios";

// East African countries with their approximate centres
const EA_COUNTRIES = [
  { name: "Kenya",    lat: -1.28,  lon: 36.82  },
  { name: "Rwanda",   lat: -1.94,  lon: 29.87  },
  { name: "Uganda",   lat:  0.35,  lon: 32.58  },
  { name: "Tanzania", lat: -6.37,  lon: 34.89  },
  { name: "DRC",      lat: -4.03,  lon: 21.76  },
  { name: "Ethiopia", lat:  9.15,  lon: 40.49  },
  { name: "Burundi",  lat: -3.37,  lon: 29.92  },
];

interface Region {
  id: number;
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed: string;
  type: string;
}

const glass = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl";
const glassCard = "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-all";

const Coverage = () => {
  useEffect(() => { document.title = "Coverage | Vilcom Networks Ltd"; }, []);

  const [search, setSearch]       = useState("");
  const [regions, setRegions]     = useState<Region[]>([]);
  const [selected, setSelected]   = useState<Region | null>(null);
  const [filterStatus, setFilter] = useState<"all" | "connected" | "coming_soon">("all");
  const [mapView, setMapView]     = useState<"kenya3d" | "kenya2d" | "global">("kenya3d");
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<{ name: string; lat: number; lon: number } | null>(null);

  // Fetch live coverage data
  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const response = await api.get('/coverage/zones');
        const apiZones = response.data?.data || [];
        
        const mappedRegions: Region[] = apiZones.map((z: any) => ({
          id: z.id,
          name: z.name,
          county: z.county || "Kenya",
          status: z.status === 'active' ? "connected" : "coming_soon",
          lat: parseFloat(z.center_lat) || 0,
          lng: parseFloat(z.center_lng) || 0,
          speed: z.connectivity_index > 0 ? "Up to 100Mbps" : "TBD",
          type: z.coverage_type || "Fiber"
        }));
        
        setRegions(mappedRegions);
      } catch (err) {
        console.error("Failed to fetch live coverage data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverage();
  }, []);

  const filtered = regions.filter(r => {
    const q = search.toLowerCase();
    return (r.name.toLowerCase().includes(q) || r.county.toLowerCase().includes(q))
      && (filterStatus === "all" || r.status === filterStatus);
  });

  const liveCount = regions.filter(r => r.status === "connected").length;
  const soonCount = regions.filter(r => r.status === "coming_soon").length;

  const handleSelect = (region: Region) => {
    setSelected(prev => prev?.name === region.name ? null : region);
    setSidebarOpen(false);
  };

  const renderMap = () => {
    switch (mapView) {
      case "kenya3d": return <KenyaGlobe3D style={{ width: "100%", height: "100%" }} interactive={true} />;
      case "kenya2d": return (
        <div style={{ width: "100%", height: "100%" }}>
          <KenyaCoverageMap2D
            onCountyClick={name => {
              setSelectedCounty(name);
              const r = regions.find(r => r.county === name);
              if (r) setSelected(r);
            }}
            selectedCounty={selectedCounty}
          />
        </div>
      );
      case "global": return <EarthGlobe3D style={{ width: "100%", height: "100%" }} interactive={true} />;
      default:       return <KenyaGlobe3D style={{ width: "100%", height: "100%" }} interactive={true} />;
    }
  };

  return (
    <>
      {/* ── Navbar: rendered first, fixed on top, nothing can cover it ── */}
      <Navbar />

      {/*
        ── Page wrapper ──
      */}
      <div className="min-h-screen bg-slate-950 pt-20 lg:pt-36 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden pointer-events-none" />

        {/* ── Sub-header (sticky, below navbar) ─────────────────────────── */}
        <div className={`${glass} z-[35] sticky top-[80px]`}>
          {/* Mobile */}
          <div className="flex lg:hidden items-center justify-between px-4 pt-3 pb-2 gap-2">
            <div className="flex items-center gap-2">
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 24, padding: "4px 9px",
              }}>
                <Globe size={11} color="#3b82f6" style={{ animation: "spin 10s linear infinite" }} />
                <span style={{ fontSize: 9, color: "#3b82f6", letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>Live</span>
              </div>
              <h1 style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>Coverage Map</h1>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>{liveCount} live</span>
              <button
                onClick={() => setSidebarOpen(p => !p)}
                style={{
                  padding: 7, borderRadius: 9, 
                  background: sidebarOpen ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                  cursor: "pointer", display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                <Menu size={17} color={sidebarOpen ? "#3b82f6" : "#cbd5e1"} />
              </button>
            </div>
          </div>

          {/* Mobile map-view tabs */}
          <div className="flex lg:hidden gap-1 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {(["kenya3d", "kenya2d", "global"] as const).map(v => (
              <button key={v} onClick={() => setMapView(v)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                background: mapView === v ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                color: mapView === v ? "#60a5fa" : "rgba(255,255,255,0.6)",
                transition: "all 0.2s",
              }}>
                {{ kenya3d: <Box size={12}/>, kenya2d: <Map size={12}/>, global: <Globe2 size={12}/> }[v]}
                {{ kenya3d: "Kenya 3D", kenya2d: "Kenya 2D", global: "Global" }[v]}
              </button>
            ))}
            <Button size="sm" variant="default" className="ml-auto shrink-0 h-7 px-3 text-xs font-bold">
              <Zap size={11} className="mr-1" /> Connect
            </Button>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 24, padding: "6px 14px",
              }}>
                <Globe size={14} color="#3b82f6" style={{ animation: "spin 10s linear infinite" }} />
                <span style={{ fontSize: 12, color: "#3b82f6", letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}>Live Coverage</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: "#fff" }}>Network Coverage Map</h1>
            </div>
            <div className="flex gap-3 items-center">
              <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, gap: 4 }}>
                {(["kenya3d", "kenya2d", "global"] as const).map(v => (
                  <button key={v} onClick={() => setMapView(v)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    background: mapView === v ? "rgba(59,130,246,0.2)" : "transparent",
                    color: mapView === v ? "#60a5fa" : "rgba(255,255,255,0.6)",
                    transition: "all 0.22s",
                  }}>
                    {{ kenya3d: <Box size={15}/>, kenya2d: <Map size={15}/>, global: <Globe2 size={15}/> }[v]}
                    {{ kenya3d: "Kenya 3D", kenya2d: "Kenya 2D", global: "Global" }[v]}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{liveCount}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{soonCount}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>locations</span>

              {/* Country zoom picker — only relevant for 3D/global views */}
              {mapView !== "kenya2d" && (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setCountryPickerOpen(p => !p)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 10, cursor: "pointer",
                      background: countryPickerOpen ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${countryPickerOpen ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.12)"}`,
                      color: countryPickerOpen ? "#a5b4fc" : "#94a3b8",
                      fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                    }}
                  >
                    <ZoomIn size={14} />
                    {zoomTarget ? zoomTarget.name : "Zoom to…"}
                  </button>
                  {countryPickerOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "rgba(15,23,42,0.97)", border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12, padding: 6, zIndex: 60, minWidth: 160,
                      backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}>
                      {EA_COUNTRIES.map(c => (
                        <button
                          key={c.name}
                          onClick={() => { setZoomTarget(c); setCountryPickerOpen(false); }}
                          style={{
                            width: "100%", textAlign: "left", padding: "8px 12px",
                            borderRadius: 8, border: "none", cursor: "pointer",
                            background: zoomTarget?.name === c.name ? "rgba(99,102,241,0.18)" : "transparent",
                            color: zoomTarget?.name === c.name ? "#a5b4fc" : "#e2e8f0",
                            fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                          }}
                        >
                          {c.name}
                        </button>
                      ))}
                      {zoomTarget && (
                        <button
                          onClick={() => { setZoomTarget(null); setCountryPickerOpen(false); }}
                          style={{
                            width: "100%", textAlign: "left", padding: "7px 12px",
                            borderRadius: 8, border: "none", cursor: "pointer",
                            background: "transparent", color: "#64748b",
                            fontSize: 11, fontWeight: 500, borderTop: "1px solid rgba(255,255,255,0.07)",
                            marginTop: 4,
                          }}
                        >
                          ✕ Clear zoom
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button size="sm" variant="default" className="font-semibold shadow-cyan-500/20 shadow-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                <Zap size={14} className="mr-2" /> Get Connected
              </Button>
            </div>
          </div>
        </div>

        {/* ── Desktop body (side-by-side, fixed height) ───────────────────── */}
        <div
          className="hidden lg:flex"
          style={{ height: "calc(100vh - 208px)" }}
          /* 208px ≈ 144px navbar+sub-header + 64px desktop sub-header padding */
        >
          <aside className={`${glass} w-[320px] flex-shrink-0 flex flex-col border-y-0 rounded-none border-l-0 overflow-hidden`}>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
                <span className="text-slate-400 text-sm">Fetching locations...</span>
              </div>
            ) : (
              <SidebarContent
              liveCount={liveCount} soonCount={soonCount}
              search={search} setSearch={setSearch}
              filterStatus={filterStatus} setFilter={setFilter}
              filtered={filtered} selected={selected}
              handleSelect={handleSelect} setSelected={setSelected}
            />
            )}
          </aside>

          {/*
            isolation: isolate creates a new stacking context.
            Leaflet's internal z-index: 400 panes are evaluated
            relative to this box only — they can't float above the navbar.
          */}
          <main style={{
            flex: 1, position: "relative", overflow: "hidden",
            isolation: "isolate",
            background: "transparent",
          }}>
            <div style={{ position: "absolute", inset: 0 }}>{renderMap()}</div>
            {/* Zoom/scroll hint */}
            {mapView !== "kenya2d" && (
              <div style={{
                position: "absolute", bottom: 14, right: 14, zIndex: 10,
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "6px 12px",
                fontSize: 11, color: "#94a3b8", fontWeight: 500,
                display: "flex", alignItems: "center", gap: 5, pointerEvents: "none",
              }}>
                <ZoomIn size={11} /> Scroll to zoom · Drag to rotate
              </div>
            )}
          </main>
        </div>

        {/* ── Mobile body (scrollable column) ─────────────────────────────── */}
        <div className="lg:hidden">

          {/* Backdrop */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed", inset: 0,
                zIndex: 45,   /* above sub-header (35), below nothing */
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(2px)",
              }}
            />
          )}

          {/* Slide-in drawer */}
          <div style={{
            position: "fixed",
            top: 0, left: 0, bottom: 0,
            width: "min(320px, 88vw)",
            zIndex: 46,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            background: "#fff",
            boxShadow: "4px 0 24px rgba(0,0,0,0.14)",
            display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}>
            {/* Drawer close header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 16px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              position: "sticky", top: 0, zIndex: 1, 
              background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)",
            }}>
              <span className="text-sm font-bold text-white">Search Locations</span>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer" }}
              >
                <X size={16} color="#cbd5e1" />
              </button>
            </div>
            <SidebarContent
              liveCount={liveCount} soonCount={soonCount}
              search={search} setSearch={setSearch}
              filterStatus={filterStatus} setFilter={setFilter}
              filtered={filtered} selected={selected}
              handleSelect={handleSelect} setSelected={setSelected}
              mobile
            />
          </div>

          {/* Map block — nearly full viewport height on mobile */}
          <div style={{
            width: "100%",
            height: "calc(100svh - 130px)",
            minHeight: 420,
            position: "relative",
            isolation: "isolate",
            background: "transparent",
          }}>
            {renderMap()}

            {/* FAB to open drawer */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                position: "absolute", bottom: 14, right: 14, zIndex: 10,
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(59,130,246,0.45)",
              }}
            >
              <Search size={17} color="#fff" />
            </button>
          </div>

          {/* Selected card */}
          {selected && (
            <div style={{
              margin: "12px 14px",
              background: "#fff",
              borderRadius: 14,
              border: `1.5px solid ${selected.status === "connected" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              padding: "13px 14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              animation: "slideUp 0.26s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1e293b" }}>{selected.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{selected.county} County</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", padding: 5, borderRadius: 7 }}>
                  <X size={13} color="#64748b" />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {[["Speed", selected.speed ?? "TBD", "#3b82f6"], ["Type", selected.type ?? "Fiber", "#10b981"]].map(([l, v, c]) => (
                  <div key={l} style={{ background: "#f8fafc", borderRadius: 7, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 1 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {selected.status === "connected" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)" }}>
                      <CheckCircle size={12} color="#10b981" />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>Available</span>
                    </div>
                    <Button className="flex-1 h-8 text-xs font-bold" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                      <Wifi size={12} className="mr-1" /> View Plans
                    </Button>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 20, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)" }}>
                    <Clock size={12} color="#f59e0b" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b" }}>Coming Soon</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location list — collapsible accordion */}
          <div style={{ margin: "8px 14px 32px" }}>

            {/* Toggle header */}
            <button
              onClick={() => setLocationsOpen(p => !p)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: locationsOpen ? "12px 12px 0 0" : 12,
                border: "1.5px solid rgba(0,0,0,0.07)",
                borderBottom: locationsOpen ? "1.5px solid rgba(0,0,0,0.06)" : "1.5px solid rgba(0,0,0,0.07)",
                background: locationsOpen ? "#fff" : "rgba(255,255,255,0.85)",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: locationsOpen ? "0 2px 12px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Live dot indicator */}
                <div style={{ display: "flex", gap: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 4px #10b98155" }} />
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 4px #f59e0b55" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.8, textTransform: "uppercase" }}>
                  All Locations
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#94a3b8",
                  background: "rgba(0,0,0,0.05)", borderRadius: 20,
                  padding: "1px 7px",
                }}>
                  {regions.length}
                </span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                  {locationsOpen ? "Collapse" : "Expand"}
                </span>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: locationsOpen ? "rgba(59,130,246,0.1)" : "rgba(0,0,0,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  <ChevronRight
                    size={13}
                    color={locationsOpen ? "#3b82f6" : "#94a3b8"}
                    style={{
                      transform: locationsOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              </div>
            </button>

            {/* Collapsible content */}
            <div style={{
              overflow: "hidden",
              maxHeight: locationsOpen ? `${regions.length * 68}px` : "0px",
              transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}>
              <div style={{
                background: "#fff",
                border: "1.5px solid rgba(0,0,0,0.07)",
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                padding: "6px 10px 10px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}>
                {regions.map(region => {
                  const isLive   = region.status === "connected";
                  const accent   = isLive ? "#10b981" : "#f59e0b";
                  const accentBg = isLive ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)";
                  const isSel    = selected?.name === region.name;
                  return (
                    <button
                      key={region.name}
                      onClick={() => handleSelect(region)}
                      style={{
                        width: "100%", textAlign: "left", padding: "9px 10px",
                        borderRadius: 10, marginBottom: 4, cursor: "pointer",
                        border: `2px solid ${isSel ? accent : "transparent"}`,
                        background: isSel ? accentBg : "rgba(248,250,252,0.8)",
                        boxShadow: isSel ? `0 2px 8px ${accentBg}` : "none",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: accent, boxShadow: `0 0 5px ${accent}55` }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{region.name}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{region.county} · {region.type ?? "Fiber"}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
                        background: accentBg, color: accent,
                        border: `1px solid ${isLive ? "rgba(16,185,129,0.28)" : "rgba(245,158,11,0.28)"}`,
                      }}>
                        {isLive ? "LIVE" : "SOON"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>{/* end mobile */}

        <FooterSection />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

/* ─── Reusable sidebar content ───────────────────────────────────────────────── */
interface SidebarProps {
  liveCount: number; soonCount: number;
  search: string; setSearch: (v: string) => void;
  filterStatus: "all" | "connected" | "coming_soon";
  setFilter: (v: "all" | "connected" | "coming_soon") => void;
  filtered: Region[];
  selected: Region | null;
  handleSelect: (r: Region) => void;
  setSelected: (r: Region | null) => void;
  mobile?: boolean;
}

const SidebarContent = ({
  liveCount, soonCount, search, setSearch,
  filterStatus, setFilter, filtered,
  selected, handleSelect, setSelected,
}: SidebarProps) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

    <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 12 }}>
        <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 11, padding: "9px 12px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#38bdf8", lineHeight: 1 }}>{liveCount}</div>
          <div style={{ fontSize: 9, color: "#bae6fd", marginTop: 3, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>Live Zones</div>
        </div>
        <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 11, padding: "9px 12px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{soonCount}</div>
          <div style={{ fontSize: 9, color: "#fde68a", marginTop: 3, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>Expanding</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 11px", marginBottom: 9 }}>
        <Search size={13} color="#94a3b8" />
        <input
          type="text" placeholder="Search location or county…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#fff", flex: 1, fontWeight: 500 }}
        />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 1 }}><X size={12} color="#94a3b8" /></button>}
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        {(["all", "connected", "coming_soon"] as const).map(f => {
          const active = filterStatus === f;
          const label  = f === "all" ? "All" : f === "connected" ? "Live" : "Soon";
          const bg  = active ? (f==="connected" ? "rgba(16,185,129,0.2)" : f==="coming_soon" ? "rgba(245,158,11,0.2)" : "rgba(56,189,248,0.2)") : "rgba(255,255,255,0.05)";
          const bdr = active ? (f==="connected" ? "rgba(16,185,129,0.5)" : f==="coming_soon" ? "rgba(245,158,11,0.5)" : "rgba(56,189,248,0.5)") : "rgba(255,255,255,0.1)";
          const clr = active ? (f==="connected" ? "#34d399" : f==="coming_soon" ? "#fbbf24" : "#38bdf8") : "#94a3b8";
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${bdr}`, background: bg, color: clr, transition: "all 0.15s" }}>
              {label}
            </button>
          );
        })}
      </div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", padding: "9px 11px", paddingBottom: selected ? 6 : 14 }}>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 0" }}>
          <Search size={30} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 8px", display: "block" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>No matching locations</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Try another area or county</div>
        </div>
      ) : filtered.map(region => {
        const isSel   = selected?.name === region.name;
        const isLive  = region.status === "connected";
        const accent  = isLive ? "#10b981" : "#f59e0b";
        const accentBg = isLive ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)";
        return (
          <button key={region.name} onClick={() => handleSelect(region)} className={`w-full text-left p-[9px_11px] rounded-xl mb-1 cursor-pointer transition-all border ${isSel ? (isLive ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-amber-500/50 bg-amber-500/10') : 'border-white/5 bg-white/5 hover:bg-white/10'}`} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: accent, boxShadow: `0 0 4px ${accent}55` }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{region.name}</div>
                <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 1 }}>{region.county} · {region.type ?? "Fiber"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, background: accentBg, color: accent, border: `1px solid ${isLive ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}` }}>
                {isLive ? "LIVE" : "SOON"}
              </span>
              <ChevronRight size={11} color="#64748b" />
            </div>
          </button>
        );
      })}
    </div>

    {selected && (
      <div className={`${glassCard} flex-shrink-0 animate-in slide-in-from-bottom-2 p-3 mt-auto mx-2 mb-2 rounded-xl border-t border-white/10`}>
        <div style={{ display: "flex", justifyItems: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
          <div className="flex-1">
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{selected.name}</div>
            <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 1 }}>{selected.county} County, Kenya</div>
          </div>
          <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", padding: 5, borderRadius: 6 }}>
            <X size={12} color="#cbd5e1" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[["Speed", selected.speed ?? "TBD", "#38bdf8"], ["Type", selected.type ?? "Fiber", "#34d399"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 7, padding: "7px 9px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 2, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {selected.status === "connected" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 20, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <CheckCircle size={11} color="#34d399" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399" }}>Available</span>
              </div>
              <Button className="flex-1 h-8 text-xs font-bold" style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none" }}>
                <Wifi size={11} className="mr-1" /> View Plans
              </Button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 20, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <Clock size={11} color="#fbbf24" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24" }}>Coming Soon</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export default Coverage;