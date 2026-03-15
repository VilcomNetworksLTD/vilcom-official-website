import React, { useState, useMemo, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import axios from "@/lib/axios";

// ─── GeoJSON path — county polygons only (no sensitive coordinates) ──────────
const geoUrl = "/kenya-counties.json";

// ─── Types ────────────────────────────────────────────────────────────────────
type CoverageType = "Home" | "Business" | "Both" | "None";

interface SurveyZone {
  id: number;
  name: string;       // e.g. "Nairobi — Point A"
  slug: string;
  type: string;       // "area"
  center_lat: number;
  center_lng: number;
  radius_km: number;
  status: string;
  is_serviceable: boolean;
  notes: string;
}

// ─── Static county-level display data (public — no sensitive coords) ─────────
// These only control choropleth fill colours. No survey precision here.
const COUNTY_COVERAGE: Record<string, CoverageType> = {
  "Nairobi":         "Both",
  "Mombasa":         "Business",
  "Kisumu":          "Business",
  "Nakuru":          "Both",
  "Kiambu":          "Business",
  "Uasin Gishu":     "Home",
  "Kakamega":        "Business",
  "Bungoma":         "Business",
  "Meru":            "Home",
  "Isiolo":          "Home",
  "Trans Nzoia":     "Home",
  "Turkana":         "Home",
  "Machakos":        "Home",
  "Laikipia":        "Home",
  "Kisii":           "Home",
  "Nyandarua":       "Home",
  "Nyeri":           "Business",
  "Kirinyaga":       "Home",
  "Murang'a":        "Home",
  "Kilifi":          "Business",
  "West Pokot":      "Home",
  "Baringo":         "Home",
  "Elgeyo-Marakwet": "Home",
  "Nandi":           "Home",
  "Bomet":           "Home",
  "Narok":           "Home",
  "Kajiado":         "Home",
  "Siaya":           "Home",
  "Busia":           "Home",
  "Vihiga":          "Home",
  "Homa Bay":        "Home",
  "Migori":          "Home",
  "Nyamira":         "Home",
  "Tharaka-Nithi":   "None",
  "Embu":            "Home",
  "Kitui":           "None",
  "Makueni":         "None",
  "Kwale":           "None",
  "Lamu":            "None",
  "Tana River":      "None",
  "Taita Taveta":    "None",
  "Garissa":         "None",
  "Wajir":           "None",
  "Mandera":         "None",
  "Marsabit":        "None",
  "Samburu":         "None",
};

// Derive which counties have active survey data (used to boost fill brightness)
const SURVEYED_COUNTIES = new Set([
  "Turkana", "Trans Nzoia", "Kakamega", "Bungoma", "Kiambu",
  "Meru", "Isiolo", "Mombasa", "Nakuru", "Uasin Gishu", "Nairobi",
]);

// ─── Region colours derived from slug prefix ──────────────────────────────────
const REGION_PALETTE: Record<string, string> = {
  lodwar:   "#f97316",
  kitale:   "#22d3ee",
  kakamega: "#a78bfa",
  bungoma:  "#34d399",
  ruiru:    "#f472b6",
  meru:     "#facc15",
  isiolo:   "#fb923c",
  mombasa:  "#38bdf8",
  rongai:   "#4ade80",
  eldoret:  "#c084fc",
  nairobi:  "#00eeff",
  nakuru:   "#fbbf24",
};

const getRegionColor = (name: string): string => {
  const key = name.toLowerCase().split(/[\s—–-]/)[0];
  return REGION_PALETTE[key] ?? "#94a3b8";
};

const COUNTY_FILL: Record<CoverageType, string> = {
  Business: "#3b60c4",
  Home:     "#b05a10",
  Both:     "#6d28d9",
  None:     "#1e293b",
};

const COUNTY_FILL_ACTIVE: Record<CoverageType, string> = {
  Business: "#5A81FA",
  Home:     "#F28C28",
  Both:     "#8B5CF6",
  None:     "#334155",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface KenyaCoverageMap2DProps {
  onCountyClick?: (countyName: string) => void;
  selectedCounty?: string | null;
  /** Pass isAdmin=true to load precise survey points from the protected API */
  isAdmin?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const KenyaCoverageMap2D: React.FC<KenyaCoverageMap2DProps> = ({
  onCountyClick,
  selectedCounty,
  isAdmin = false,
}) => {
  const [hoveredCounty,  setHoveredCounty]  = useState<string | null>(null);
  const [selectedPoint,  setSelectedPoint]  = useState<SurveyZone | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [showSurveyPts,  setShowSurveyPts]  = useState(true);
  const [surveyZones,    setSurveyZones]    = useState<SurveyZone[]>([]);
  const [loading,        setLoading]        = useState(false);

  // ── Fetch survey points from the admin API (only when isAdmin=true) ─────────
  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    axios
      .get("/api/v1/coverage/admin/coverage/zones", {
        params: { type: "area", per_page: 200 },
      })
      .then((res) => {
        const data: SurveyZone[] = res.data?.data ?? res.data ?? [];
        // Keep only area-type zones that have coordinates
        setSurveyZones(data.filter(z => z.center_lat && z.center_lng && z.type === "area"));
      })
      .catch((err) => {
        console.error("Failed to load survey zones:", err);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // ── Derive unique region names for the filter panel ───────────────────────
  const regionList = useMemo(() => {
    const regions = new Set<string>();
    surveyZones.forEach(z => {
      const region = z.name.split("—")[0].trim();
      regions.add(region);
    });
    return Array.from(regions).sort();
  }, [surveyZones]);

  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set());

  // Sync activeRegions when surveyZones first loads
  useEffect(() => {
    setActiveRegions(new Set(regionList));
  }, [regionList]);

  const toggleRegion = (r: string) =>
    setActiveRegions(prev => {
      const n = new Set(prev);
      n.has(r) ? n.delete(r) : n.add(r);
      return n;
    });

  // ── Visible points ────────────────────────────────────────────────────────
  const visiblePoints = useMemo(() => {
    if (!showSurveyPts) return [];
    return surveyZones.filter(z => {
      const region = z.name.split("—")[0].trim();
      return activeRegions.has(region);
    });
  }, [surveyZones, activeRegions, showSurveyPts]);

  // ── County fill ───────────────────────────────────────────────────────────
  const getFill = (geoName: string): string => {
    const coverage   = COUNTY_COVERAGE[geoName] ?? "None";
    const hasSurvey  = SURVEYED_COUNTIES.has(geoName);
    const isHovered  = hoveredCounty  === geoName;
    const isSel      = selectedCounty === geoName;
    if (isSel || isHovered) return COUNTY_FILL_ACTIVE[coverage];
    if (hasSurvey)          return COUNTY_FILL_ACTIVE[coverage];
    return COUNTY_FILL[coverage];
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#0f172a" }}>

      {/* ── Map ── */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1800, center: [37.8, 0.0] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={12}>

          {/* County choropleth */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name      = geo.properties.name ?? geo.properties.NAME ?? "";
                const isHovered = hoveredCounty === name;
                const isSel     = selectedCounty === name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFill(name)}
                    stroke={isSel ? "#60a5fa" : isHovered ? "#94a3b8" : "#1e3a5f"}
                    strokeWidth={isSel ? 2 : isHovered ? 1 : 0.4}
                    onMouseEnter={() => {
                      const cov = COUNTY_COVERAGE[name] ?? "None";
                      setTooltipContent(`${name} — ${cov === "None" ? "No Coverage" : cov}`);
                      setHoveredCounty(name);
                    }}
                    onMouseLeave={() => { setTooltipContent(""); setHoveredCounty(null); }}
                    onClick={() => onCountyClick?.(name)}
                    style={{
                      default: { outline: "none", cursor: "pointer" },
                      hover:   { outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    data-tooltip-id="map-tt"
                  />
                );
              })
            }
          </Geographies>

          {/* Survey point markers — only rendered when isAdmin=true */}
          {isAdmin && visiblePoints.map((zone) => {
            const color      = getRegionColor(zone.name);
            const isSelected = selectedPoint?.id === zone.id;
            return (
              <Marker
                key={zone.id}
                coordinates={[zone.center_lng, zone.center_lat]}
                onClick={() =>
                  setSelectedPoint(prev => (prev?.id === zone.id ? null : zone))
                }
                onMouseEnter={() =>
                  setTooltipContent(
                    `${zone.name}\n${zone.center_lat.toFixed(6)}°, ${zone.center_lng.toFixed(6)}°`
                  )
                }
                onMouseLeave={() => setTooltipContent("")}
                data-tooltip-id="map-tt"
              >
                {isSelected && (
                  <circle r={7} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6}>
                    <animate attributeName="r"       from="5"  to="12" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={isSelected ? 5 : 3.5} fill={color} fillOpacity={0.2} stroke="none" />
                <circle
                  r={isSelected ? 3.5 : 2.5}
                  fill={isSelected ? "#ffffff" : color}
                  stroke={color}
                  strokeWidth={0.8}
                  style={{ cursor: "pointer" }}
                />
                {isSelected && (
                  <text
                    textAnchor="middle"
                    y={-8}
                    style={{ fontSize: 5, fontFamily: "monospace", fill: color, fontWeight: 700, pointerEvents: "none" }}
                  >
                    {zone.name.split("—")[1]?.trim() ?? zone.name}
                  </text>
                )}
              </Marker>
            );
          })}

        </ZoomableGroup>
      </ComposableMap>

      {/* ── Tooltip ── */}
      <Tooltip
        id="map-tt"
        content={tooltipContent}
        style={{
          background: "rgba(2,8,24,0.95)",
          border: "1px solid rgba(0,200,240,0.2)",
          borderRadius: 6,
          padding: "8px 12px",
          fontSize: 12,
          color: "#e0f0ff",
          fontFamily: "monospace",
          whiteSpace: "pre-line",
          zIndex: 1000,
        }}
      />

      {/* ── Loading indicator ── */}
      {loading && (
        <div style={{
          position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
          background: "rgba(2,8,24,0.88)", border: "1px solid rgba(0,180,220,0.2)",
          backdropFilter: "blur(12px)", borderRadius: 4, padding: "6px 16px",
          fontSize: 9, color: "rgba(0,200,240,0.6)", letterSpacing: 2, fontFamily: "monospace",
          zIndex: 30,
        }}>
          LOADING SURVEY DATA…
        </div>
      )}

      {/* ── Selected point card ── */}
      {selectedPoint && isAdmin && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(2,8,24,0.96)",
          border: `1.5px solid ${getRegionColor(selectedPoint.name)}60`,
          backdropFilter: "blur(16px)", borderRadius: 8, padding: "14px 20px",
          minWidth: 300, zIndex: 20, animation: "slideUp 0.2s ease",
          boxShadow: `0 0 24px ${getRegionColor(selectedPoint.name)}20`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: getRegionColor(selectedPoint.name),
                  boxShadow: `0 0 6px ${getRegionColor(selectedPoint.name)}`,
                }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#e0f0ff" }}>{selectedPoint.name}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(0,200,240,0.4)", letterSpacing: 1, fontFamily: "monospace" }}>
                SURVEY COORDINATE · KENYA
              </div>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              style={{ background: "none", border: "none", color: "rgba(0,200,240,0.4)", cursor: "pointer", fontSize: 18, padding: 0 }}
            >×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["LONGITUDE", `${selectedPoint.center_lng.toFixed(8)}°`],
              ["LATITUDE",  `${selectedPoint.center_lat.toFixed(8)}°`],
              ["RADIUS",    `${selectedPoint.radius_km}km`],
              ["STATUS",    selectedPoint.status === "planned" ? "PLANNED" : selectedPoint.status.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: "rgba(0,180,220,0.06)", borderRadius: 4, padding: "8px 10px",
                borderLeft: `2px solid ${getRegionColor(selectedPoint.name)}40`,
              }}>
                <div style={{ fontSize: 7, color: "rgba(0,180,220,0.4)", letterSpacing: 1.5, fontFamily: "monospace", marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#c0e8ff" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Admin: region filter sidebar ── */}
      {isAdmin && regionList.length > 0 && (
        <div style={{
          position: "absolute", top: 14, right: 14, display: "flex", flexDirection: "column", gap: 4,
          background: "rgba(2,8,24,0.88)", border: "1px solid rgba(0,180,220,0.12)",
          backdropFilter: "blur(14px)", borderRadius: 8, padding: "12px 14px",
          maxHeight: "calc(100% - 120px)", overflowY: "auto", zIndex: 20,
        }}>
          <div style={{ fontSize: 8, color: "rgba(0,180,220,0.4)", letterSpacing: 2, marginBottom: 6, fontFamily: "monospace" }}>
            SURVEY REGIONS
          </div>

          <button
            onClick={() => setShowSurveyPts(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
              background: showSurveyPts ? "rgba(0,238,255,0.1)" : "rgba(2,8,24,0.5)",
              border: `1px solid ${showSurveyPts ? "rgba(0,238,255,0.4)" : "rgba(0,180,220,0.08)"}`,
              borderRadius: 4, padding: "5px 10px", cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 9, color: showSurveyPts ? "#00eeff" : "rgba(0,200,240,0.3)", fontFamily: "monospace", letterSpacing: 1 }}>
              {showSurveyPts ? "● DOTS ON" : "○ DOTS OFF"}
            </span>
          </button>

          {regionList.map(region => {
            const active = activeRegions.has(region);
            const color  = getRegionColor(region);
            const count  = surveyZones.filter(z => z.name.startsWith(region)).length;
            return (
              <button key={region} onClick={() => toggleRegion(region)} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: active ? `${color}18` : "rgba(2,8,24,0.5)",
                border: `1px solid ${active ? color + "50" : "rgba(0,180,220,0.07)"}`,
                borderRadius: 4, padding: "5px 10px", cursor: "pointer",
                transition: "all 0.18s", minWidth: 150,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? color : "#334155", boxShadow: active ? `0 0 5px ${color}` : "none", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: active ? color : "rgba(160,200,220,0.3)", fontFamily: "monospace", flex: 1, textAlign: "left" }}>{region}</span>
                <span style={{ fontSize: 9, color: "rgba(160,200,220,0.25)", fontFamily: "monospace" }}>{count}pts</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Stats strip ── */}
      {isAdmin && (
        <div style={{
          position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 20,
        }}>
          {[
            { label: "TOTAL PTS", value: surveyZones.length,  color: "#00eeff" },
            { label: "REGIONS",   value: regionList.length,   color: "#a78bfa" },
            { label: "VISIBLE",   value: visiblePoints.length, color: "#00e8a8" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "rgba(2,8,24,0.88)", border: "1px solid rgba(0,180,220,0.12)",
              backdropFilter: "blur(12px)", borderRadius: 4, padding: "6px 12px",
              display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</span>
              <span style={{ fontSize: 7, color: "rgba(160,200,220,0.4)", letterSpacing: 1.5, fontFamily: "monospace" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{
        position: "absolute", bottom: 14, left: 14, zIndex: 10,
        background: "rgba(2,8,24,0.92)", border: "1px solid rgba(0,180,220,0.12)",
        backdropFilter: "blur(12px)", borderRadius: 8, padding: "12px 16px",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,200,240,0.5)", marginBottom: 10, letterSpacing: 2, fontFamily: "monospace" }}>
          COVERAGE KEY
        </div>
        {[
          { color: COUNTY_FILL_ACTIVE.Business, label: "Business / Enterprise" },
          { color: COUNTY_FILL_ACTIVE.Home,     label: "Home / Residential"   },
          { color: COUNTY_FILL_ACTIVE.Both,     label: "Both Services"        },
          { color: COUNTY_FILL_ACTIVE.None,     label: "No Coverage Yet"      },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 14, height: 14, background: color, borderRadius: 3, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(180,220,240,0.65)", fontFamily: "monospace" }}>{label}</span>
          </div>
        ))}
        {isAdmin && (
          <div style={{ borderTop: "1px solid rgba(0,180,220,0.1)", marginTop: 8, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00eeff", boxShadow: "0 0 4px #00eeff", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(180,220,240,0.65)", fontFamily: "monospace" }}>Survey Point</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 14, left: 14,
        background: "rgba(2,8,24,0.88)", border: "1px solid rgba(0,200,240,0.2)",
        backdropFilter: "blur(16px)", borderRadius: 6, padding: "10px 14px", zIndex: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 4, background: "linear-gradient(135deg,#00e0ff,#0080d8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VILCOM</div>
        <div style={{ fontSize: 7, color: "rgba(0,200,230,0.4)", letterSpacing: 3, marginTop: 1 }}>2D COVERAGE · KENYA</div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default KenyaCoverageMap2D;

export const getCountyStats = () => {
  const stats = { total: 0, home: 0, business: 0, both: 0, none: 0 };
  Object.values(COUNTY_COVERAGE).forEach(t => {
    stats.total++;
    if (t === "Home")     stats.home++;
    else if (t === "Business") stats.business++;
    else if (t === "Both")     stats.both++;
    else                       stats.none++;
  });
  return stats;
};