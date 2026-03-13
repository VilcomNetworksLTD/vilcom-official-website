import { Search, CheckCircle, Clock, Wifi, Globe, X, ChevronRight, Zap, Map, Box, Globe2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import KenyaGlobe3D from "@/components/KenyaGlobe3D";
import KenyaCoverageMap2D from "@/components/KenyaCoverageMap2D";
import EarthGlobe3D from "@/components/EarthGlobe3D";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Region {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed?: string;
  type?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const regions: Region[] = [
  { name: "Westlands",   county: "Nairobi",     status: "connected",   lat: -1.2637, lng: 36.8063, speed: "100Mbps", type: "Fiber" },
  { name: "Kilimani",    county: "Nairobi",     status: "connected",   lat: -1.2915, lng: 36.7823, speed: "100Mbps", type: "Fiber" },
  { name: "Karen",       county: "Nairobi",     status: "connected",   lat: -1.3197, lng: 36.7073, speed: "60Mbps",  type: "Fiber" },
  { name: "Lavington",   county: "Nairobi",     status: "connected",   lat: -1.2769, lng: 36.7693, speed: "100Mbps", type: "Fiber" },
  { name: "Kileleshwa",  county: "Nairobi",     status: "connected",   lat: -1.2838, lng: 36.7876, speed: "30Mbps",  type: "Wireless" },
  { name: "Runda",       county: "Nairobi",     status: "coming_soon", lat: -1.2189, lng: 36.8156, speed: "100Mbps", type: "Fiber" },
  { name: "Nyali",       county: "Mombasa",     status: "connected",   lat: -4.0375, lng: 39.7208, speed: "60Mbps",  type: "Fiber" },
  { name: "Bamburi",     county: "Mombasa",     status: "coming_soon", lat: -3.9833, lng: 39.7333, speed: "30Mbps",  type: "Wireless" },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon", lat: 0.5143,  lng: 35.2698, speed: "100Mbps", type: "Fiber" },
  { name: "Kisumu CBD",  county: "Kisumu",      status: "connected",   lat: -0.0917, lng: 34.7680, speed: "60Mbps",  type: "Fiber" },
  { name: "Parklands",   county: "Nairobi",     status: "connected",   lat: -1.2606, lng: 36.8219, speed: "100Mbps", type: "Fiber" },
  { name: "Langata",     county: "Nairobi",     status: "coming_soon", lat: -1.3614, lng: 36.7422, speed: "60Mbps",  type: "Wireless" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Coverage = () => {
  useEffect(() => {
    document.title = "Coverage | Vilcom Networks Ltd";
  }, []);

  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Region | null>(null);
  const [filterStatus, setFilter] = useState<"all" | "connected" | "coming_soon">("all");
  const [mapView, setMapView]     = useState<"kenya3d" | "kenya2d" | "global">("kenya3d");
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

  const filtered = regions.filter(r => {
    const q = search.toLowerCase();
    const matchQ = r.name.toLowerCase().includes(q) || r.county.toLowerCase().includes(q);
    const matchF = filterStatus === "all" || r.status === filterStatus;
    return matchQ && matchF;
  });

  const liveCount = regions.filter(r => r.status === "connected").length;
  const soonCount = regions.filter(r => r.status === "coming_soon").length;
  
  const handleSelect = (region: Region) =>
    setSelected(prev => prev?.name === region.name ? null : region);

  const renderMap = () => {
    switch (mapView) {
      case "kenya3d":
        return <KenyaGlobe3D style={{width: "100%", height: "100%"}} />;
      case "kenya2d":
        return (
          <div style={{width: "100%", height: "100%"}}>
            <KenyaCoverageMap2D 
              onCountyClick={(countyName) => {
                setSelectedCounty(countyName);
                const matchingRegion = regions.find(r => r.county === countyName);
                if (matchingRegion) setSelected(matchingRegion);
              }}
              selectedCounty={selectedCounty}
            />
          </div>
        );
      case "global":
        return <EarthGlobe3D style={{width: "100%", height: "100%"}} />;
      default:
        return <KenyaGlobe3D style={{width: "100%", height: "100%"}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <Navbar />

      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{
          padding: "16px 24px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 24, padding: "6px 14px",
            }}>
              <Globe size={14} color="#3b82f6" style={{ animation: "spin 10s linear infinite" }} />
              <span style={{ fontSize: 12, color: "#3b82f6", letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}>
                Live Coverage
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: "#1e293b" }}>
              Network Coverage Map
            </h1>
          </div>
          
          {/* Enhanced Map Toggle */}
          <div style={{
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <div style={{
              display: "flex", background: "rgba(0,0,0,0.04)",
              borderRadius: "12px", padding: "4px", gap: "4px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}>
              <button
                onClick={() => setMapView("kenya3d")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px", border: "none",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  background: mapView === "kenya3d" ? "rgba(59,130,246,0.15)" : "transparent",
                  color: mapView === "kenya3d" ? "#3b82f6" : "rgba(0,0,0,0.6)",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <Box size={15} /> Kenya 3D
              </button>
              <button
                onClick={() => setMapView("kenya2d")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px", border: "none",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  background: mapView === "kenya2d" ? "rgba(59,130,246,0.15)" : "transparent",
                  color: mapView === "kenya2d" ? "#3b82f6" : "rgba(0,0,0,0.6)",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <Map size={15} /> Kenya 2D
              </button>
              <button
                onClick={() => setMapView("global")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px", border: "none",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  background: mapView === "global" ? "rgba(59,130,246,0.15)" : "transparent",
                  color: mapView === "global" ? "#3b82f6" : "rgba(0,0,0,0.6)",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <Globe2 size={15} /> Global
              </button>
            </div>
            
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "#10b981", fontWeight: 800 }}>{liveCount}</span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{soonCount}</span>
              <span style={{ color: "#6b7280" }}>locations</span>
            </div>
            
            <Button size="sm" variant="default" className="font-semibold shadow-lg hover:shadow-xl transition-all">
              <Zap size={14} className="mr-2" /> Get Connected
            </Button>
          </div>
        </div>

        {/* ── FIXED Full-height Split Layout ── */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          minHeight: 0,  /* Crucial for flex children with overflow */
          overflow: "hidden" 
        }}>

          {/* Enhanced Sidebar */}
          <aside style={{
            width: 320,  /* Slightly wider for better UX */
            flexShrink: 0,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column",
            boxShadow: "2px 0 20px rgba(0,0,0,0.08)",
          }}>

            {/* Stats Cards */}
            <div style={{ 
              padding: "20px 20px 16px", 
              borderBottom: "1px solid rgba(0,0,0,0.08)",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{
                  background: "rgba(59,130,246,0.08)", 
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: 12, padding: "12px 16px",
                }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#3b82f6", lineHeight: 1 }}>{liveCount}</div>
                  <div style={{ fontSize: 10, color: "rgba(59,130,246,0.6)", marginTop: 4, letterSpacing: 1 }}>Live Zones</div>
                </div>
                <div style={{
                  background: "rgba(245,158,11,0.08)", 
                  border: "1px solid rgba(245,158,11,0.15)",
                  borderRadius: 12, padding: "12px 16px",
                }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{soonCount}</div>
                  <div style={{ fontSize: 10, color: "rgba(245,158,11,0.6)", marginTop: 4, letterSpacing: 1 }}>Expanding</div>
                </div>
              </div>

              {/* Search - Enhanced */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(255,255,255,0.6)", 
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search location or county..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "#1e293b", fontSize: 14, flex: 1, fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ 
                    background: "none", border: "none", cursor: "pointer", padding: "4px",
                    color: "#64748b", borderRadius: 4,
                    "&:hover": { background: "rgba(0,0,0,0.05)" }
                  }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Pills - Enhanced */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["all", "connected", "coming_soon"] as const).map(f => {
                  const label = f === "all" ? "All" : f === "connected" ? "Live" : "Soon";
                  const active = filterStatus === f;
                  const accent = f === "connected" ? "#10b981" : f === "coming_soon" ? "#f59e0b" : "#6b7280";
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${active ? accent : "rgba(0,0,0,0.1)"}`,
                      background: active ? `${accent}12` : "rgba(0,0,0,0.02)",
                      color: active ? accent : "#64748b",
                      transition: "all 0.2s ease",
                      boxShadow: active ? `0 2px 8px ${accent}20` : "none",
                    }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Region List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "120px" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                  <Search size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#6b7280" }}>
                    No matching locations
                  </div>
                  <div style={{ fontSize: 14, color: "#9ca3af" }}>
                    Try searching by area or county name
                  </div>
                </div>
              ) : (
                filtered.map(region => {
                  const isSelected = selected?.name === region.name;
                  const isLive = region.status === "connected";
                  const accent = isLive ? "#10b981" : "#f59e0b";
                  return (
                    <button
                      key={region.name}
                      onClick={() => handleSelect(region)}
                      style={{
                        width: "100%", textAlign: "left",
                        padding: "14px 16px", borderRadius: 12, marginBottom: 8,
                        cursor: "pointer", fontFamily: "system-ui, sans-serif",
                        border: `2px solid ${isSelected ? accent : "transparent"}`,
                        background: isSelected ? `${accent}08` : "rgba(255,255,255,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: isSelected ? `0 4px 16px ${accent}30` : "0 1px 3px rgba(0,0,0,0.08)",
                        transform: isSelected ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%", 
                          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                          boxShadow: `0 0 12px ${accent}60`,
                        }} />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? "#ffffff" : "#1e293b" }}>
                            {region.name}
                          </div>
                          <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.9)" : "#6b7280", marginTop: 2 }}>
                            {region.county} · {region.type ?? "Fiber"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ 
                          fontSize: 11, fontWeight: 800, 
                          color: isSelected ? "#ffffff" : accent, 
                          letterSpacing: 1, padding: "4px 8px",
                          background: isSelected ? `${accent}20` : "transparent",
                          borderRadius: 12,
                        }}>
                          {isLive ? "LIVE" : "SOON"}
                        </span>
                        <ChevronRight size={16} color={isSelected ? "#ffffff" : "#d1d5db"} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Detail Card */}
            {selected && (
              <div style={{
                position: "absolute", bottom: 20, left: 20, right: 20,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(24px)",
                border: `1px solid ${selected.status === "connected" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                borderRadius: 16, padding: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                zIndex: 40,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", marginBottom: 4 }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                      {selected.county} County, Kenya
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ 
                    background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", 
                    padding: "8px", borderRadius: 12, color: "#64748b",
                  }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    ["Speed", selected.speed ?? "TBD", "#3b82f6"],
                    ["Type", selected.type ?? "Fiber", "#10b981"],
                    ["Latitude", selected.lat.toFixed(4) + "°", "#6b7280"],
                    ["Longitude", selected.lng.toFixed(4) + "°", "#6b7280"],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ 
                      background: "rgba(255,255,255,0.7)", borderRadius: 10, 
                      padding: "12px 16px", border: `1px solid rgba(0,0,0,0.05)`
                    }}>
                      <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: 0.8, marginBottom: 4 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "flex", gap: 12, alignItems: "center",
                }}>
                  {selected.status === "connected" ? (
                    <>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", borderRadius: 20,
                        background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                      }}>
                        <CheckCircle size={18} color="#10b981" />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>Available Now</span>
                      </div>
                      <Button className="flex-1 font-semibold shadow-lg h-12" style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                      }}>
                        <Wifi size={16} className="mr-2" /> View Plans
                      </Button>
                    </>
                  ) : (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 20,
                      background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                    }}>
                      <Clock size={18} color="#f59e0b" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>Coming Soon</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* ── FIXED Map Container ── */}
          <main style={{ 
            flex: 1, 
            position: "relative", 
            overflow: "hidden",
            minHeight: 0,  /* Critical for flex height inheritance */
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%)",
          }}>
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              width: "100%", 
              height: "100%",
            }}>
              {renderMap()}
            </div>
          </main>
        </div>

      </main>

      <FooterSection />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        *::-webkit-scrollbar { width: 4px; height: 4px; }
        *::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); }
        *::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.3); 
          borderRadius: 2px; 
        }
        *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
};

export default Coverage;
