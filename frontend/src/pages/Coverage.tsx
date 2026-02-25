import { Search, CheckCircle, Clock, Wifi, Globe, X, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import KenyaGlobe3D from "@/components/KenyaGlobe3D";

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
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Region | null>(null);
  const [filterStatus, setFilter] = useState<"all" | "connected" | "coming_soon">("all");

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

  return (
    <div className="min-h-screen" style={{ background: "#070e1c", color: "#e2eaf4" }}>
      <Navbar />

      <main className="pt-14" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── Page header strip ── */}
        <div style={{
          padding: "12px 24px",
          background: "rgba(8,14,28,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.18)",
              borderRadius: 20, padding: "4px 12px",
            }}>
              <Globe size={13} color="#00d4aa" style={{ animation: "spin 8s linear infinite" }} />
              <span style={{ fontSize: 11, color: "#00d4aa", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>
                Live Coverage Map
              </span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: "#e8f0fe" }}>
              Kenya Network Coverage
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(180,210,255,0.5)" }}>
              <span style={{ color: "#00d4aa", fontWeight: 700 }}>{liveCount}</span> live ·{" "}
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{soonCount}</span> expanding
            </span>
            <Button size="sm" style={{
              background: "linear-gradient(135deg,#00d4aa,#0080ff)",
              border: "none", fontSize: 12, fontWeight: 700,
            }}>
              <Zap size={12} className="mr-1" /> Get Connected
            </Button>
          </div>
        </div>

        {/* ── Main split layout ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Left sidebar ── */}
          <aside style={{
            width: 288, flexShrink: 0,
            background: "rgba(8,14,26,0.98)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>

            {/* Stats */}
            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{
                  background: "rgba(0,212,170,0.07)", border: "1px solid rgba(0,212,170,0.14)",
                  borderRadius: 10, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#00d4aa", lineHeight: 1 }}>{liveCount}</div>
                  <div style={{ fontSize: 9, color: "rgba(180,210,255,0.45)", marginTop: 3, letterSpacing: 1 }}>LIVE ZONES</div>
                </div>
                <div style={{
                  background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.14)",
                  borderRadius: 10, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{soonCount}</div>
                  <div style={{ fontSize: 9, color: "rgba(180,210,255,0.45)", marginTop: 3, letterSpacing: 1 }}>EXPANDING</div>
                </div>
              </div>

              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8, padding: "7px 11px", marginBottom: 10,
              }}>
                <Search size={13} color="rgba(180,210,255,0.35)" />
                <input
                  type="text"
                  placeholder="Search area or county…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "#e2eaf4", fontSize: 12, flex: 1, fontFamily: "inherit",
                  }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <X size={12} color="rgba(180,210,255,0.35)" />
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div style={{ display: "flex", gap: 5 }}>
                {(["all", "connected", "coming_soon"] as const).map(f => {
                  const label = f === "all" ? "All" : f === "connected" ? "Live" : "Soon";
                  const active = filterStatus === f;
                  const accent = f === "connected" ? "#00d4aa" : f === "coming_soon" ? "#f59e0b" : "rgba(200,220,255,0.6)";
                  return (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                      border: `1px solid ${active ? accent : "rgba(255,255,255,0.07)"}`,
                      background: active ? `${accent}18` : "transparent",
                      color: active ? accent : "rgba(180,210,255,0.4)",
                      transition: "all 0.15s",
                    }}>{label}</button>
                  );
                })}
              </div>
            </div>

            {/* Region list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
              {filtered.map(region => {
                const isSelected = selected?.name === region.name;
                const isLive     = region.status === "connected";
                const accent     = isLive ? "#00d4aa" : "#f59e0b";
                return (
                  <button
                    key={region.name}
                    onClick={() => handleSelect(region)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "9px 11px", borderRadius: 9, marginBottom: 3,
                      cursor: "pointer", fontFamily: "inherit",
                      border: `1px solid ${isSelected ? accent + "40" : "transparent"}`,
                      background: isSelected ? `${accent}0c` : "rgba(255,255,255,0.02)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                        background: accent,
                        boxShadow: isSelected ? `0 0 7px ${accent}` : "none",
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? accent : "#d8e8ff" }}>
                          {region.name}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(180,210,255,0.4)", marginTop: 1 }}>
                          {region.county} · {region.type ?? "Fiber"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 9, color: accent, fontWeight: 800, letterSpacing: 0.5 }}>
                        {isLive ? "LIVE" : "SOON"}
                      </span>
                      <ChevronRight size={11} color="rgba(180,210,255,0.2)" />
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(180,210,255,0.3)", fontSize: 12 }}>
                  No locations found
                </div>
              )}
            </div>

            {/* Selected detail card */}
            {selected && (
              <div style={{
                margin: "0 10px 10px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${selected.status === "connected" ? "rgba(0,212,170,0.2)" : "rgba(245,158,11,0.2)"}`,
                borderRadius: 11, padding: "13px 14px",
                animation: "slideUp 0.2s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#e8f0fe" }}>{selected.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(180,210,255,0.45)", marginTop: 2 }}>{selected.county} County</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <X size={13} color="rgba(180,210,255,0.3)" />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                  {[
                    ["Speed", selected.speed ?? "—"],
                    ["Type",  selected.type  ?? "—"],
                    ["Lat",   selected.lat.toFixed(4) + "°"],
                    ["Lng",   selected.lng.toFixed(4) + "°"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "5px 8px" }}>
                      <div style={{ fontSize: 9, color: "rgba(180,210,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#e2eaf4", fontFamily: "'SF Mono',monospace", marginTop: 1 }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 9px", borderRadius: 20, marginBottom: 10,
                  background: selected.status === "connected" ? "rgba(0,212,170,0.1)" : "rgba(245,158,11,0.1)",
                  border: `1px solid ${selected.status === "connected" ? "rgba(0,212,170,0.25)" : "rgba(245,158,11,0.25)"}`,
                }}>
                  {selected.status === "connected"
                    ? <><CheckCircle size={10} color="#00d4aa" /><span style={{ fontSize: 10, color: "#00d4aa", fontWeight: 700 }}>Available Now</span></>
                    : <><Clock size={10} color="#f59e0b" /><span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>Coming Soon</span></>
                  }
                </div>

                {selected.status === "connected" && (
                  <Button className="w-full" size="sm" style={{
                    background: "linear-gradient(135deg,#00d4aa,#0080ff)",
                    border: "none", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Wifi size={12} /> View Plans →
                  </Button>
                )}
              </div>
            )}
          </aside>

          {/* ── Map panel ── */}
          <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <KenyaGlobe3D
              onSelectLocation={loc => setSelected(loc as Region | null)}
              selectedLocation={selected}
            />
          </main>
        </div>
      </main>

      <FooterSection />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,170,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default Coverage;