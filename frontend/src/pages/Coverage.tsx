import { Search, CheckCircle, Clock, Wifi, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import KenyaGlobe3D from "@/components/KenyaGlobe3D";

const regions = [
  { name: "Westlands", county: "Nairobi", status: "connected" as const, lat: -1.2637, lng: 36.8063 },
  { name: "Kilimani", county: "Nairobi", status: "connected" as const, lat: -1.2915, lng: 36.7823 },
  { name: "Karen", county: "Nairobi", status: "connected" as const, lat: -1.3197, lng: 36.7073 },
  { name: "Lavington", county: "Nairobi", status: "connected" as const, lat: -1.2769, lng: 36.7693 },
  { name: "Kileleshwa", county: "Nairobi", status: "connected" as const, lat: -1.2838, lng: 36.7876 },
  { name: "Runda", county: "Nairobi", status: "coming_soon" as const, lat: -1.2189, lng: 36.8156 },
  { name: "Nyali", county: "Mombasa", status: "connected" as const, lat: -4.0375, lng: 39.7208 },
  { name: "Bamburi", county: "Mombasa", status: "coming_soon" as const, lat: -3.9833, lng: 39.7333 },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon" as const, lat: 0.5143, lng: 35.2698 },
  { name: "Kisumu CBD", county: "Kisumu", status: "connected" as const, lat: -0.0917, lng: 34.7680 },
];

const Coverage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof regions[0] | null>(null);

  const filtered = regions.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.county.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <Globe className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                3D Network Coverage
              </span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
              Interactive <span className="text-gradient-royal">Coverage Map</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Experience our fiber network in stunning 3D. Watch the globe zoom from Earth to Kenya,
              then explore our coverage areas interactively.
            </p>
          </div>

          {/* 3D Globe and Control Panel Layout */}
          <div className="grid lg:grid-cols-[340px_1fr] gap-6 max-w-7xl mx-auto">
            {/* Curved Glass Control Panel */}
            <div className="glass-strong rounded-2xl p-6 h-fit lg:sticky lg:top-24 space-y-6">
              <h2 className="font-heading font-bold text-foreground text-lg">Control Panel</h2>

              {/* Search */}
              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <div className="text-2xl font-heading font-bold text-primary">
                    {regions.filter((r) => r.status === "connected").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Live Areas</div>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <div className="text-2xl font-heading font-bold text-accent">
                    {regions.filter((r) => r.status === "coming_soon").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Expanding</div>
                </div>
              </div>

              {/* Region list */}
              <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {filtered.map((region) => (
                  <button
                    key={region.name}
                    onClick={() => setSelected(selected?.name === region.name ? null : region)}
                    className={`w-full text-left p-3 rounded-xl transition-all text-sm ${
                      selected?.name === region.name
                        ? "glass royal-glow border border-primary/20"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{region.name}</div>
                        <div className="text-xs text-muted-foreground">{region.county}</div>
                      </div>
                      {region.status === "connected" ? (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-accent font-medium">
                          <Clock className="w-3.5 h-3.5" /> Soon
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No locations found.</p>
                )}
              </div>

              {/* Selected region details */}
              {selected && (
                <div className="glass rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="font-heading font-bold text-foreground">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.county} County</p>
                  <div className="text-xs text-muted-foreground/70 space-y-1">
                    <div>Lat: {selected.lat.toFixed(4)}°</div>
                    <div>Lng: {selected.lng.toFixed(4)}°</div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      selected.status === "connected"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {selected.status === "connected" ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Available Now
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Coming Soon
                      </>
                    )}
                  </div>
                  {selected.status === "connected" && (
                    <Button className="w-full gradient-royal text-primary-foreground font-semibold border-0 text-sm royal-glow">
                      View Plans
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* 3D Globe Container */}
            <div className="glass-crystal rounded-2xl overflow-hidden min-h-[700px] relative">
              <KenyaGlobe3D
                onSelectLocation={setSelected}
                selectedLocation={selected}
              />
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">3D Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Experience our network coverage on a realistic 3D globe with smooth zoom animations
              </p>
            </div>
            
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Real-Time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Coverage map automatically updates as new areas come online across Kenya
              </p>
            </div>
            
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Interactive</h3>
              <p className="text-sm text-muted-foreground">
                Click and explore coverage nodes to see detailed information about each area
              </p>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Coverage;