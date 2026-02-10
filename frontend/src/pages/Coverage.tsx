import { Search, CheckCircle, Clock, Wifi } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import KenyaGlobeMap from "@/components/KenyaGlobeMap";

const regions = [
  { name: "Westlands", county: "Nairobi", status: "connected" as const, cx: 248, cy: 372 },
  { name: "Kilimani", county: "Nairobi", status: "connected" as const, cx: 252, cy: 378 },
  { name: "Karen", county: "Nairobi", status: "connected" as const, cx: 244, cy: 384 },
  { name: "Lavington", county: "Nairobi", status: "connected" as const, cx: 246, cy: 376 },
  { name: "Kileleshwa", county: "Nairobi", status: "connected" as const, cx: 250, cy: 374 },
  { name: "Runda", county: "Nairobi", status: "coming_soon" as const, cx: 250, cy: 368 },
  { name: "Nyali", county: "Mombasa", status: "connected" as const, cx: 290, cy: 430 },
  { name: "Bamburi", county: "Mombasa", status: "coming_soon" as const, cx: 292, cy: 426 },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon" as const, cx: 222, cy: 310 },
  { name: "Kisumu CBD", county: "Kisumu", status: "connected" as const, cx: 208, cy: 338 },
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
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Network Coverage</span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
              Coverage <span className="text-gradient-royal">Map</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Explore our fiber network across Kenya. Click on any node to see coverage details.
            </p>
          </div>

          {/* Holographic Table Layout */}
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
              <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
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
                <div className="glass rounded-xl p-4 space-y-3">
                  <h3 className="font-heading font-bold text-foreground">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.county} County</p>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      selected.status === "connected"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {selected.status === "connected" ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Available
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

            {/* Holographic Map */}
            <div className="glass-crystal rounded-2xl overflow-hidden min-h-[600px] relative">
              <KenyaGlobeMap
                onSelectLocation={setSelected}
                selectedLocation={selected}
              />
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Coverage;
