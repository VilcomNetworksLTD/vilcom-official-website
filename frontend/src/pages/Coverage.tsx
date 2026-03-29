import { Search, CheckCircle, Clock, Wifi, Globe, X, ChevronRight, Zap, Map, Box, Globe2, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import KenyaGlobe3D from "@/components/KenyaGlobe3D";
import KenyaCoverageMap2D from "@/components/KenyaCoverageMap2D";
import EarthGlobe3D from "@/components/EarthGlobe3D";

interface Region {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed?: string;
  type?: string;
}

const regions: Region[] = [
  { name: "Westlands",   county: "Nairobi",     status: "connected",   lat: -1.2637, lng: 36.8063, speed: "100Mbps", type: "Fiber" },
  { name: "Kilimani",    county: "Nairobi",     status: "connected",   lat: -1.2915, lng: 36.7823, speed: "100Mbps", type: "Fiber" },
  { name: "Karen",       county: "Nairobi",     status: "connected",   lat: -1.3197, lng: 36.7073, speed: "60Mbps",  type: "Fiber" },
  { name: "Lavington",   county: "Nairobi",     status: "connected",   lat: -1.2769, lng: 36.7693, speed: "100Mbps", type: "Fiber" },
  { name: "Kileleshwa",  county: "Nairobi",     status: "connected",   lat: -1.2838, lng: 36.7876, speed: "30Mbps",  type: "Wireless" },
  { name: "Runda",       county: "Nairobi",     status: "coming_soon", lat: -1.2189, lng: 36.8156, speed: "100Mbps", type: "Fiber" },
  { name: "Nyali",       county: "Mombasa",     status: "connected",   lat: -4.0375, lng: 39.7208, speed: "60Mbps",  type: "Fiber" },
  { name: "Bamburi",     county: "Mombasa",     status: "coming_soon", lat: -3.9833, lng: 39.7333, speed: "30Mbps",  type: "Wireless" },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon", lat:  0.5143, lng: 35.2698, speed: "100Mbps", type: "Fiber" },
  { name: "Kisumu CBD",  county: "Kisumu",      status: "connected",   lat: -0.0917, lng: 34.7680, speed: "60Mbps",  type: "Fiber" },
  { name: "Parklands",   county: "Nairobi",     status: "connected",   lat: -1.2606, lng: 36.8219, speed: "100Mbps", type: "Fiber" },
  { name: "Langata",     county: "Nairobi",     status: "coming_soon", lat: -1.3614, lng: 36.7422, speed: "60Mbps",  type: "Wireless" },
];

const Coverage = () => {
  useEffect(() => { document.title = "Coverage | Vilcom Networks Ltd"; }, []);

  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Region | null>(null);
  const [filterStatus, setFilter] = useState<"all" | "connected" | "coming_soon">("all");
  const [mapView, setMapView]     = useState<"kenya3d" | "kenya2d" | "global">("kenya3d");
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);

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
      case "kenya3d": return <KenyaGlobe3D style={{ width: "100%", height: "100%" }} />;
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
      case "global": return <EarthGlobe3D style={{ width: "100%", height: "100%" }} />;
      default:       return <KenyaGlobe3D style={{ width: "100%", height: "100%" }} />;
    }
  };

  return (
    <>
      {/* ── Navbar: rendered first, fixed on top, nothing can cover it ── */}
      <Navbar />

      {/*
        ── Page wrapper ──
        • pt-20 / lg:pt-36 pushes content below the fixed Navbar height.
        • NO overflow-hidden — that was causing the map to escape and cover the navbar.
      */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 lg:pt-36">

        {/* ── Sub-header (sticky, below navbar) ─────────────────────────── */}
        <div style={{
          position: "sticky",
          top: "80px",       /* sits just below the ~80px fixed navbar */
          zIndex: 35,        /* below navbar z-50, above page content   */
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
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
              <h1 style={{ fontSize: 15, fontWeight: 900, color: "#1e293b" }}>Coverage Map</h1>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>{liveCount} live</span>
              <button
                onClick={() => setSidebarOpen(p => !p)}
                style={{
                  padding: 7, borderRadius: 9, border: "1px solid rgba(0,0,0,0.1)",
                  background: sidebarOpen ? "rgba(59,130,246,0.1)" : "rgba(0,0,0,0.04)",
                  cursor: "pointer", display: "flex", alignItems: "center",
                }}
              >
                <Menu size={17} color={sidebarOpen ? "#3b82f6" : "#64748b"} />
              </button>
            </div>
          </div>

          {/* Mobile map-view tabs */}
          <div className="flex lg:hidden gap-1 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {(["kenya3d", "kenya2d", "global"] as const).map(v => (
              <button key={v} onClick={() => setMapView(v)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                background: mapView === v ? "rgba(59,130,246,0.15)" : "rgba(0,0,0,0.05)",
                color: mapView === v ? "#3b82f6" : "rgba(0,0,0,0.55)",
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
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: "#1e293b" }}>Network Coverage Map</h1>
            </div>
            <div className="flex gap-3 items-center">
              <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: 12, padding: 4, gap: 4, border: "1px solid rgba(0,0,0,0.06)" }}>
                {(["kenya3d", "kenya2d", "global"] as const).map(v => (
                  <button key={v} onClick={() => setMapView(v)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    background: mapView === v ? "rgba(59,130,246,0.15)" : "transparent",
                    color: mapView === v ? "#3b82f6" : "rgba(0,0,0,0.6)",
                    transition: "all 0.22s",
                  }}>
                    {{ kenya3d: <Box size={15}/>, kenya2d: <Map size={15}/>, global: <Globe2 size={15}/> }[v]}
                    {{ kenya3d: "Kenya 3D", kenya2d: "Kenya 2D", global: "Global" }[v]}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{liveCount}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{soonCount}</span>
              <span style={{ fontSize: 13, color: "#6b7280" }}>locations</span>
              <Button size="sm" variant="default" className="font-semibold shadow-lg">
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
          <aside style={{
            width: 320, flexShrink: 0,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(0,0,0,0.07)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            <SidebarContent
              liveCount={liveCount} soonCount={soonCount}
              search={search} setSearch={setSearch}
              filterStatus={filterStatus} setFilter={setFilter}
              filtered={filtered} selected={selected}
              handleSelect={handleSelect} setSelected={setSelected}
            />
          </aside>

          {/*
            isolation: isolate creates a new stacking context.
            Leaflet's internal z-index: 400 panes are evaluated
            relative to this box only — they can't float above the navbar.
          */}
          <main style={{
            flex: 1, position: "relative", overflow: "hidden",
            isolation: "isolate",
            background: "linear-gradient(180deg, #f0f5fa 0%, #e2ecf5 50%, #dce6f0 100%)",
          }}>
            <div style={{ position: "absolute", inset: 0 }}>{renderMap()}</div>
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
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              position: "sticky", top: 0, zIndex: 1, background: "#fff",
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Search Locations</span>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ padding: 6, borderRadius: 8, background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer" }}
              >
                <X size={16} color="#64748b" />
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
            background: "linear-gradient(180deg, #f0f5fa 0%, #e2ecf5 50%, #dce6f0 100%)",
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

    <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 12 }}>
        <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.13)", borderRadius: 11, padding: "9px 12px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#2563eb", lineHeight: 1 }}>{liveCount}</div>
          <div style={{ fontSize: 9, color: "#93c5fd", marginTop: 3, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>Live Zones</div>
        </div>
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.13)", borderRadius: 11, padding: "9px 12px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#d97706", lineHeight: 1 }}>{soonCount}</div>
          <div style={{ fontSize: 9, color: "#fcd34d", marginTop: 3, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}>Expanding</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 11px", marginBottom: 9 }}>
        <Search size={13} color="#94a3b8" />
        <input
          type="text" placeholder="Search location or county…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#1e293b", flex: 1, fontWeight: 500 }}
        />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 1 }}><X size={12} color="#94a3b8" /></button>}
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        {(["all", "connected", "coming_soon"] as const).map(f => {
          const active = filterStatus === f;
          const label  = f === "all" ? "All" : f === "connected" ? "Live" : "Soon";
          const bg  = active ? (f==="connected" ? "rgba(16,185,129,0.12)" : f==="coming_soon" ? "rgba(245,158,11,0.12)" : "rgba(100,116,139,0.1)") : "#f8fafc";
          const bdr = active ? (f==="connected" ? "rgba(16,185,129,0.35)" : f==="coming_soon" ? "rgba(245,158,11,0.35)" : "rgba(100,116,139,0.25)") : "#e2e8f0";
          const clr = active ? (f==="connected" ? "#059669" : f==="coming_soon" ? "#d97706" : "#475569") : "#64748b";
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
          <Search size={30} color="#e2e8f0" style={{ margin: "0 auto 8px", display: "block" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>No matching locations</div>
          <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 3 }}>Try another area or county</div>
        </div>
      ) : filtered.map(region => {
        const isSel   = selected?.name === region.name;
        const isLive  = region.status === "connected";
        const accent  = isLive ? "#10b981" : "#f59e0b";
        const accentBg = isLive ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)";
        return (
          <button key={region.name} onClick={() => handleSelect(region)} style={{
            width: "100%", textAlign: "left", padding: "9px 11px",
            borderRadius: 10, marginBottom: 4, cursor: "pointer",
            border: `2px solid ${isSel ? accent : "transparent"}`,
            background: isSel ? accentBg : "rgba(255,255,255,0.9)",
            boxShadow: isSel ? `0 2px 8px ${accentBg}` : "0 1px 3px rgba(0,0,0,0.04)",
            transition: "all 0.15s",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: accent, boxShadow: `0 0 4px ${accent}55` }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{region.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{region.county} · {region.type ?? "Fiber"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, background: accentBg, color: accent, border: `1px solid ${isLive ? "rgba(16,185,129,0.27)" : "rgba(245,158,11,0.27)"}` }}>
                {isLive ? "LIVE" : "SOON"}
              </span>
              <ChevronRight size={11} color="#cbd5e1" />
            </div>
          </button>
        );
      })}
    </div>

    {selected && (
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.99)", padding: "12px 14px", flexShrink: 0, animation: "slideUp 0.24s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#1e293b" }}>{selected.name}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{selected.county} County, Kenya</div>
          </div>
          <button onClick={() => setSelected(null)} style={{ background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", padding: 5, borderRadius: 6 }}>
            <X size={12} color="#64748b" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[["Speed", selected.speed ?? "TBD", "#3b82f6"], ["Type", selected.type ?? "Fiber", "#10b981"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "#f8fafc", borderRadius: 7, padding: "7px 9px", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {selected.status === "connected" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle size={11} color="#10b981" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>Available</span>
              </div>
              <Button className="flex-1 h-8 text-xs font-bold" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                <Wifi size={11} className="mr-1" /> View Plans
              </Button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 20, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Clock size={11} color="#f59e0b" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b" }}>Coming Soon</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export default Coverage;