import React, { useState, useMemo, useEffect, useRef } from "react";
import { coverageApi, adminCoverageApi, CoverageZone as ServiceCoverageZone } from "@/services/coverage";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  useMap,
  Polyline,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ────────────────────────────────────────────────────────────────────
type CoverageType = "Home" | "Business" | "Both" | "None";
type CoverageZone = ServiceCoverageZone;

// ─── Static fallback coverage data ───────────────────────────────────────────
const COUNTY_COVERAGE_FALLBACK: Record<string, CoverageType> = {
  "Nairobi": "Both",     "Mombasa": "Business",  "Kisumu": "Business",
  "Nakuru": "Both",      "Kiambu": "Business",   "Uasin Gishu": "Home",
  "Kakamega": "Business","Bungoma": "Business",  "Meru": "Home",
  "Isiolo": "Home",      "Trans Nzoia": "Home",  "Turkana": "Home",
  "Machakos": "Home",    "Laikipia": "Home",     "Kisii": "Home",
  "Nyandarua": "Home",   "Nyeri": "Business",    "Kirinyaga": "Home",
  "Murang'a": "Home",    "Kilifi": "Business",   "West Pokot": "Home",
  "Baringo": "Home",     "Elgeyo-Marakwet": "Home", "Nandi": "Home",
  "Bomet": "Home",       "Narok": "Home",        "Kajiado": "Home",
  "Siaya": "Home",       "Busia": "Home",        "Vihiga": "Home",
  "Homa Bay": "Home",    "Migori": "Home",       "Nyamira": "Home",
  "Tharaka-Nithi": "None","Embu": "Home",        "Kitui": "None",
  "Makueni": "None",     "Kwale": "None",        "Lamu": "None",
  "Tana River": "None",  "Taita Taveta": "None", "Garissa": "None",
  "Wajir": "None",       "Mandera": "None",      "Marsabit": "None",
  "Samburu": "None",
};

const COUNTY_WEIGHT_FALLBACK: Record<string, number> = {
  "Nairobi": 100, "Kiambu": 85,  "Mombasa": 78,  "Nakuru": 70,
  "Kisumu": 65,   "Kakamega": 58,"Bungoma": 55,  "Nyeri": 52,
  "Kilifi": 50,   "Uasin Gishu": 48, "Murang'a": 42, "Kirinyaga": 40,
  "Machakos": 38, "Meru": 36,    "Nyamira": 34,  "Kisii": 32,
  "Homa Bay": 30, "Siaya": 28,   "Migori": 26,   "Nandi": 24,
  "Nyandarua": 22,"Laikipia": 20,"Bomet": 18,    "Trans Nzoia": 17,
  "Narok": 16,    "Kajiado": 15, "Baringo": 14,  "Elgeyo-Marakwet": 13,
  "Vihiga": 12,   "Embu": 11,    "Busia": 10,    "Isiolo": 8,
  "West Pokot": 7,"Turkana": 5,
};

const COUNTY_CENTERS_FALLBACK: Record<string, [number, number]> = {
  "Nairobi": [-1.286, 36.817],   "Mombasa": [-4.050, 39.666],
  "Kisumu": [-0.091, 34.768],    "Nakuru": [-0.303, 36.080],
  "Kiambu": [-1.031, 36.830],    "Uasin Gishu": [0.514, 35.270],
  "Kakamega": [0.282, 34.752],   "Bungoma": [0.563, 34.560],
  "Meru": [0.047, 37.649],       "Nyeri": [-0.416, 36.947],
  "Kilifi": [-3.630, 39.850],    "Murang'a": [-0.716, 37.150],
  "Kirinyaga": [-0.560, 37.358], "Machakos": [-1.518, 37.263],
  "Nyamira": [-0.563, 34.934],   "Kisii": [-0.677, 34.776],
  "Homa Bay": [-0.527, 34.457],  "Siaya": [0.061, 34.288],
  "Migori": [-1.063, 34.473],    "Nandi": [0.183, 35.117],
  "Nyandarua": [-0.180, 36.522], "Laikipia": [0.361, 36.793],
  "Bomet": [-0.783, 35.343],     "Trans Nzoia": [1.017, 35.000],
  "Narok": [-1.082, 35.872],     "Kajiado": [-2.099, 36.776],
  "Baringo": [0.469, 35.972],    "Elgeyo-Marakwet": [0.904, 35.509],
  "Vihiga": [0.077, 34.724],     "Embu": [-0.532, 37.457],
  "Busia": [0.461, 34.112],      "Isiolo": [0.354, 37.582],
  "West Pokot": [1.621, 35.117], "Turkana": [3.119, 35.599],
};

const HUB: [number, number] = [-1.286, 36.817];

// ─── View presets ─────────────────────────────────────────────────────────────
interface ViewPreset {
  id: string; label: string;
  center: [number, number]; zoom: number; flag: string;
}

const VIEW_PRESETS: ViewPreset[] = [
  { id: "africa",      label: "Africa",      center: [0,   20],   zoom: 3,   flag: "🌍" },
  { id: "east_africa", label: "East Africa", center: [0,   36],   zoom: 5,   flag: "🌍" },
  { id: "kenya",       label: "Kenya",       center: [0.5, 37.5], zoom: 6,   flag: "🇰🇪" },
  { id: "uganda",      label: "Uganda",      center: [1.37,32.3], zoom: 7,   flag: "🇺🇬" },
  { id: "rwanda",      label: "Rwanda",      center: [-1.9,29.9], zoom: 8,   flag: "🇷🇼" },
  { id: "drc",         label: "DRC Congo",   center: [-2.9,23.7], zoom: 5.5, flag: "🇨🇩" },
];

const PANEL_PRESETS = VIEW_PRESETS.filter(p => p.id !== "africa");

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function smoothArc(from: [number, number], to: [number, number], steps = 48): [number, number][] {
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const dLat = to[0] - from[0];
  const dLng = to[1] - from[1];
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  const curvature = 0.2 + dist * 0.035;
  const ctrlLat = midLat - dLng * curvature;
  const ctrlLng = midLng + dLat * curvature;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([
      u * u * from[0] + 2 * u * t * ctrlLat + t * t * to[0],
      u * u * from[1] + 2 * u * t * ctrlLng + t * t * to[1],
    ]);
  }
  return pts;
}

function arrowHead(pts: [number, number][], size = 0.16): [[number, number], [number, number]][] {
  const tip  = pts[pts.length - 1];
  const prev = pts[Math.max(0, pts.length - 5)];
  const dLat = tip[0] - prev[0], dLng = tip[1] - prev[1];
  const len  = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
  const uLat = dLat / len, uLng = dLng / len;
  const pLat = -uLng, pLng = uLat;
  const base: [number, number] = [tip[0] - uLat * size, tip[1] - uLng * size];
  return [
    [[base[0] + pLat * size * 0.5, base[1] + pLng * size * 0.5], tip],
    [[base[0] - pLat * size * 0.5, base[1] - pLng * size * 0.5], tip],
  ];
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
function weightToFill(w: number): string {
  if (w >= 80) return "rgba(29,78,216,0.52)";
  if (w >= 60) return "rgba(37,99,235,0.42)";
  if (w >= 40) return "rgba(59,130,246,0.35)";
  if (w >= 20) return "rgba(96,165,250,0.28)";
  if (w >= 1)  return "rgba(147,197,253,0.20)";
  return "transparent";
}
function weightToBorder(w: number): string {
  if (w >= 80) return "#1d4ed8";
  if (w >= 60) return "#2563eb";
  if (w >= 40) return "#3b82f6";
  if (w >= 20) return "#60a5fa";
  if (w >= 1)  return "#93c5fd";
  return "#e2e8f0";
}
function arcColor(w: number): string {
  if (w >= 80) return "#1e40af";
  if (w >= 60) return "#1d4ed8";
  if (w >= 40) return "#2563eb";
  if (w >= 20) return "#3b82f6";
  return "#60a5fa";
}
function arcStroke(w: number): number {
  if (w >= 80) return 2.2;
  if (w >= 60) return 1.9;
  if (w >= 40) return 1.6;
  if (w >= 20) return 1.3;
  return 1.0;
}

// ─── GeoJSON validation ───────────────────────────────────────────────────────
const isValidGeometry = (g: any): boolean => {
  if (!g?.type) return false;
  const types = ["Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"];
  if (!types.includes(g.type)) return false;
  if (g.type === "GeometryCollection") return Array.isArray(g.geometries) && g.geometries.length > 0;
  return Array.isArray(g.coordinates) && g.coordinates.length > 0;
};

const normaliseGeoJSON = (raw: any): any | null => {
  if (!raw || typeof raw !== "object") return null;
  const col: any = Array.isArray(raw) ? { type: "FeatureCollection", features: raw } : raw;
  if (col.type !== "FeatureCollection" && col.type !== "Feature") {
    if (col.coordinates) return { type:"FeatureCollection", features:[{ type:"Feature", geometry:col, properties:{} }] };
    return null;
  }
  if (col.type === "Feature") return { type:"FeatureCollection", features: isValidGeometry(col.geometry) ? [col] : [] };
  const valid = (col.features ?? []).filter((f: any) => f?.type === "Feature" && isValidGeometry(f.geometry));
  return valid.length ? { ...col, features: valid } : null;
};

// ─── ZoomController — exposes zoomIn/zoomOut via callback ref ────────────────
const ZoomController: React.FC<{ onReady: (map: L.Map) => void }> = ({ onReady }) => {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
};

// ─── ViewController ───────────────────────────────────────────────────────────
const ViewController: React.FC<{
  preset: ViewPreset;
  selectedCounty: string | null;
  geojsonData: any;
  autoZoomDone: boolean;
  onAutoZoomDone: () => void;
}> = ({ preset, selectedCounty, geojsonData, autoZoomDone, onAutoZoomDone }) => {
  const map = useMap();

  useEffect(() => {
    if (autoZoomDone) return;
    const t1 = setTimeout(() => { map.flyTo([0, 36], 5, { duration: 2.2 }); }, 600);
    const t2 = setTimeout(() => { map.flyTo([0.5, 37.5], 6, { duration: 1.8 }); onAutoZoomDone(); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!selectedCounty || !geojsonData) return;
    const feat = geojsonData.features.find((f: any) =>
      [f.properties?.shapeName, f.properties?.name, f.properties?.county]
        .some((v: string) => v?.toLowerCase() === selectedCounty.toLowerCase())
    );
    if (feat) {
      try { map.flyToBounds(L.geoJSON(feat).getBounds(), { padding:[60,60], maxZoom:9, duration:0.9 }); return; }
      catch { /* ignore */ }
    }
  }, [selectedCounty, geojsonData, map]);

  useEffect(() => {
    if (!autoZoomDone) return;
    map.flyTo(preset.center, preset.zoom, { duration: 0.9 });
  }, [preset, autoZoomDone]); // eslint-disable-line

  return null;
};

// ─── Exported stats helper ────────────────────────────────────────────────────
export const getCountyStats = () => {
  const s = { total:0, home:0, business:0, both:0, none:0 };
  Object.values(COUNTY_COVERAGE_FALLBACK).forEach(t => {
    s.total++;
    if (t==="Home") s.home++; else if (t==="Business") s.business++; else if (t==="Both") s.both++; else s.none++;
  });
  return s;
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface KenyaCoverageMap2DProps {
  onCountyClick?: (name: string) => void;
  selectedCounty?: string | null;
  isAdmin?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const KenyaCoverageMap2D: React.FC<KenyaCoverageMap2DProps> = ({
  onCountyClick, selectedCounty, isAdmin = false,
}) => {
  const [geojsonData,    setGeojsonData]    = useState<any>(null);
  const [hoveredCounty,  setHoveredCounty]  = useState<string | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [mapError,       setMapError]       = useState<string | null>(null);
  const [activePreset,   setActivePreset]   = useState<ViewPreset>(VIEW_PRESETS[0]);
  const [autoZoomDone,   setAutoZoomDone]   = useState(false);

  // ── NEW: collapsible controls panel ──────────────────────────────────────
  const [controlsOpen, setControlsOpen] = useState(false);

  // ── Coverage data ─────────────────────────────────────────────────────────
  const [coverageZones,  setCoverageZones]  = useState<CoverageZone[]>([]);
  const [apiLoaded,      setApiLoaded]      = useState(false);

  const countyWeight = useMemo<Record<string, number>>(() => {
    if (!apiLoaded || coverageZones.length === 0) return COUNTY_WEIGHT_FALLBACK;
    const map: Record<string, number> = {};
    coverageZones.forEach(z => {
      const key = z.county ?? z.name;
      const idx = z.connectivity_index ?? 10;
      map[key] = Math.max(map[key] ?? 0, idx);
    });
    return map;
  }, [coverageZones, apiLoaded]);

  const countyCenters = useMemo<Record<string, [number, number]>>(() => {
    if (!apiLoaded || coverageZones.length === 0) return COUNTY_CENTERS_FALLBACK;
    const result: Record<string, [number, number]> = { ...COUNTY_CENTERS_FALLBACK };
    coverageZones.forEach(z => {
      if (z.center_lat && z.center_lng) {
        const key = z.county ?? z.name;
        if (!result[key]) result[key] = [z.center_lat, z.center_lng];
      }
    });
    return result;
  }, [coverageZones, apiLoaded]);

  const countyCoverage = useMemo<Record<string, CoverageType>>(() => {
    if (!apiLoaded || coverageZones.length === 0) return COUNTY_COVERAGE_FALLBACK;
    const result: Record<string, CoverageType> = { ...COUNTY_COVERAGE_FALLBACK };
    coverageZones.forEach(z => {
      const key = z.county ?? z.name;
      if (z.coverage_type) result[key] = z.coverage_type;
    });
    return result;
  }, [coverageZones, apiLoaded]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true); setMapError(null);
      try {
        let geoRes = await fetch("/kenya-counties-highres.geojson").catch(() => null);
        if (!geoRes?.ok) geoRes = await fetch("/kenya-counties.json").catch(() => null);
        if (!geoRes?.ok) throw new Error("Could not load county GeoJSON");
        const norm = normaliseGeoJSON(await geoRes.json());
        if (!norm) throw new Error("Invalid GeoJSON structure");
        setGeojsonData(norm);
      } catch (e: any) {
        setMapError(e?.message ?? "GeoJSON load error");
        setLoading(false);
        return;
      }
      try {
        const res = await coverageApi.getZones({ per_page: 500 });
        const zones: CoverageZone[] = res.data ?? [];
        if (zones.length > 0) {
          const withCoords = zones.filter(z => z.center_lat && z.center_lng);
          setCoverageZones(withCoords);
          setApiLoaded(true);
        }
      } catch (e) {
        console.warn("[KenyaCoverageMap2D] Coverage API unavailable — using fallback.", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── Admin zones ───────────────────────────────────────────────────────────
  const [adminZones,         setAdminZones]         = useState<CoverageZone[]>([]);
  const [selectedAdminZone,  setSelectedAdminZone]  = useState<CoverageZone | null>(null);
  const [showAdminDots,      setShowAdminDots]      = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    adminCoverageApi
      .getZones({ type: "area", per_page: 200 })
      .then(res => {
        const d: CoverageZone[] = res.data ?? [];
        setAdminZones(d.filter(z => z.center_lat && z.center_lng && z.type === "area"));
      })
      .catch(e => console.warn("[KenyaCoverageMap2D] Admin zones fetch failed", e));
  }, [isAdmin]);

  const regionList = useMemo(() => {
    const s = new Set<string>();
    adminZones.forEach(z => s.add(z.name.split("—")[0].trim()));
    return Array.from(s).sort();
  }, [adminZones]);

  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set());
  useEffect(() => setActiveRegions(new Set(regionList)), [regionList]);
  const toggleRegion = (r: string) =>
    setActiveRegions(p => { const n = new Set(p); n.has(r) ? n.delete(r) : n.add(r); return n; });

  const visibleAdminDots = useMemo(
    () => showAdminDots ? adminZones.filter(z => activeRegions.has(z.name.split("—")[0].trim())) : [],
    [adminZones, activeRegions, showAdminDots]
  );

  // ── Arcs ──────────────────────────────────────────────────────────────────
  const arcs = useMemo(() => {
    return Object.entries(countyCenters)
      .filter(([name]) => name !== "Nairobi" && (countyWeight[name] ?? 0) > 0)
      .map(([name, center]) => {
        const w    = countyWeight[name] ?? 1;
        const pts  = smoothArc(HUB, center as [number, number], 48);
        const head = arrowHead(pts, 0.13 + w * 0.001);
        return { name, pts, head, w };
      })
      .sort((a, b) => a.w - b.w);
  }, [countyCenters, countyWeight]);

  // ── GeoJSON styles ────────────────────────────────────────────────────────
  const styleFeature = (feature: any) => {
    const name = feature?.properties?.shapeName ?? feature?.properties?.name ?? feature?.properties?.county ?? "Unknown";
    const w     = countyWeight[name] ?? 0;
    const isHov = hoveredCounty  === name;
    const isSel = selectedCounty === name;
    const active = isHov || isSel;
    if (w === 0) return { fillColor:"transparent", color:"#dde4ed", weight:0.7, opacity:0.6, fillOpacity:0 };
    return {
      fillColor:   weightToFill(w),
      fillOpacity: active ? 0.78 : 1,
      color:       active ? "#1d4ed8" : weightToBorder(w),
      weight:      active ? 2.5 : 1.4,
      opacity:     1,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature?.properties?.shapeName ?? feature?.properties?.name ?? feature?.properties?.county ?? "Unknown";
    const w   = countyWeight[name] ?? 0;
    const cov = countyCoverage[name] ?? "None";
    const apiZone    = coverageZones.find(z => (z.county ?? z.name) === name);
    const dataSource = apiLoaded && apiZone ? "● Live" : "○ Fallback";
    layer.on({
      mouseover: (_e: any) => { setHoveredCounty(name); layer.bringToFront(); },
      mouseout:  (_e: any) => setHoveredCounty(null),
      click:     (_e: any) => onCountyClick?.(name),
    });
    const tipContent = w > 0
      ? `<strong>${name}</strong><br/>${cov === "None" ? "No coverage" : cov} · idx ${w}<br/><span style="font-size:9px;color:#94a3b8">${dataSource}</span>`
      : `<strong>${name}</strong><br/><span style="color:#94a3b8">No coverage yet</span>`;
    layer.bindTooltip(tipContent, { sticky: true, className: "custom-leaflet-tooltip" });
  };

  const countyStats = useMemo(() => getCountyStats(), []);
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const handleMapReady = React.useCallback((map: L.Map) => setLeafletMap(map), []);

  const ADMIN_PALETTE: Record<string, string> = {
    lodwar:"#ea580c", kitale:"#0891b2", kakamega:"#7c3aed",
    bungoma:"#059669", ruiru:"#db2777", meru:"#d97706",
    isiolo:"#c2410c", mombasa:"#0284c7", rongai:"#16a34a",
    eldoret:"#9333ea", nairobi:"#2563eb", nakuru:"#b45309",
  };
  const adminDotColor = (name: string) =>
    ADMIN_PALETTE[name.toLowerCase().split(/[\s—–-]/)[0]] ?? "#64748b";

  const ui = {
    panel:"rgba(255,255,255,0.97)", border:"rgba(0,0,0,0.08)",
    shadow:"0 4px 20px rgba(0,0,0,0.10)", text:"#1e293b",
    textMuted:"#64748b", textFaint:"#94a3b8", accent:"#2563eb",
  };

  return (
    <div style={{ width:"100%", height:"100%", position:"relative", background:"#e8f0fe" }}>

      {/* Error */}
      {mapError && !loading && (
        <div style={{
          position:"absolute", inset:0, zIndex:2000,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          background:"rgba(248,250,252,0.97)", gap:10, padding:24,
        }}>
          <div style={{ fontSize:11, color:"#ef4444", fontFamily:"monospace", letterSpacing:2 }}>MAP ERROR</div>
          <div style={{ fontSize:12, color:"#64748b", maxWidth:400, textAlign:"center", lineHeight:1.7 }}>{mapError}</div>
        </div>
      )}

      {/* MAP */}
      <MapContainer
        center={[5, 20]} zoom={3}
        style={{ width:"100%", height:"100%", background:"#dbe9f8" }}
        zoomControl={false}
        maxBounds={[[-40, -20], [40, 55]]}
        maxBoundsViscosity={0.6}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OSM &copy; CARTO'
          minZoom={3}
        />

        {geojsonData && (
          <GeoJSON
            key={`geo-${selectedCounty ?? "all"}-${apiLoaded}`}
            data={geojsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {arcs.map(({ name, pts, head, w }) => (
          <React.Fragment key={`arc-${name}`}>
            <Polyline positions={pts} pathOptions={{ color: arcColor(w), weight: arcStroke(w), opacity: 0.62, lineCap:"round", lineJoin:"round" }} />
            {head.map((seg, i) => (
              <Polyline key={i} positions={seg} pathOptions={{ color: arcColor(w), weight: arcStroke(w) * 1.15, opacity: 0.88, lineCap:"round" }} />
            ))}
          </React.Fragment>
        ))}

        <CircleMarker center={HUB} radius={7}
          pathOptions={{ fillColor:"#1e40af", color:"#fff", weight:2.5, fillOpacity:1 }}
        >
          <LeafletTooltip direction="top" offset={[0,-9]} opacity={1}>
            <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700 }}>Nairobi Hub</span>
          </LeafletTooltip>
        </CircleMarker>

        {Object.entries(countyCenters)
          .filter(([n]) => n !== "Nairobi" && (countyWeight[n] ?? 0) > 0)
          .map(([name, center]) => {
            const w = countyWeight[name] ?? 1;
            return (
              <CircleMarker key={`dot-${name}`}
                center={center as [number,number]}
                radius={3.5 + w * 0.025}
                pathOptions={{ fillColor: arcColor(w), color:"#fff", weight:1.5, fillOpacity:0.9 }}
              >
                <LeafletTooltip direction="top" offset={[0,-6]} opacity={1}>
                  <span style={{ fontFamily:"monospace", fontSize:11 }}>
                    {name} · {w}{apiLoaded ? " ●" : ""}
                  </span>
                </LeafletTooltip>
              </CircleMarker>
            );
          })
        }

        {isAdmin && visibleAdminDots.map(zone => {
          const color = adminDotColor(zone.name);
          const isSel = selectedAdminZone?.id === zone.id;
          return (
            <CircleMarker key={zone.id}
              center={[zone.center_lat!, zone.center_lng!]}
              radius={isSel ? 9 : 5}
              pathOptions={{ fillColor:color, color:isSel?"#1e293b":color, weight:isSel?2:1, fillOpacity:isSel?0.9:0.7 }}
              eventHandlers={{ click: () => setSelectedAdminZone(p => p?.id===zone.id ? null : zone) }}
            >
              <LeafletTooltip direction="top" offset={[0,-10]} opacity={1}>
                <div style={{ fontFamily:"monospace", fontSize:12, textAlign:"center" }}>
                  <strong>{zone.name}</strong><br/>
                  {zone.center_lat!.toFixed(4)}°, {zone.center_lng!.toFixed(4)}°
                </div>
              </LeafletTooltip>
            </CircleMarker>
          );
        })}

        <ZoomController onReady={handleMapReady} />
        <ViewController
          preset={activePreset}
          selectedCounty={selectedCounty ?? null}
          geojsonData={geojsonData}
          autoZoomDone={autoZoomDone}
          onAutoZoomDone={() => setAutoZoomDone(true)}
        />
      </MapContainer>

      {/* ── CSS ── */}
      <style>{`
        .custom-leaflet-tooltip {
          background:rgba(255,255,255,0.97);
          border:1px solid rgba(0,0,0,0.10) !important;
          border-radius:6px; padding:7px 11px;
          color:#1e293b; font-family:monospace; font-size:12px;
          box-shadow:0 4px 12px rgba(0,0,0,0.10);
        }
        .custom-leaflet-tooltip::before { border-top-color:rgba(255,255,255,0.97) !important; }
        .leaflet-container { background:#dbe9f8 !important; }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          background:ui.panel, border:`1px solid ${ui.border}`,
          borderRadius:8, padding:"12px 22px",
          fontSize:10, color:ui.textMuted, letterSpacing:2,
          fontFamily:"monospace", zIndex:1000, boxShadow:ui.shadow,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{
            display:"inline-block", width:10, height:10, borderRadius:"50%",
            border:"2px solid #3b82f6", borderTopColor:"transparent",
            animation:"spin 0.7s linear infinite",
          }}/>
          LOADING MAP DATA…
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── API badge (top-center, small) ── */}
      {!loading && (
        <div style={{
          position:"absolute", top:10, left:"50%", transform:"translateX(-50%)",
          zIndex:1000, pointerEvents:"none",
        }}>
          <div style={{
            background: apiLoaded ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
            border: `1px solid ${apiLoaded ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            borderRadius:20, padding:"3px 10px",
            fontSize:9, fontFamily:"monospace", letterSpacing:1.2,
            color: apiLoaded ? "#059669" : "#d97706",
          }}>
            {apiLoaded ? `● LIVE · ${coverageZones.length} ZONES` : "○ STATIC DATA"}
          </div>
        </div>
      )}

      {/* ── Brand (top-left, compact) ── */}
      <div style={{
        position:"absolute", top:10, left:10, zIndex:1000,
        background:ui.panel, border:`1px solid ${ui.border}`,
        borderRadius:8, padding:"7px 11px", boxShadow:ui.shadow,
      }}>
        <div style={{ fontSize:14, fontWeight:900, letterSpacing:3, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{
            background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>VILCOM</span>
          <span style={{ color:"#cbd5e1", fontWeight:300 }}>|</span>
          <span style={{ color:"#ea580c", fontSize:12 }}>OPS</span>
        </div>
      </div>

      {/* ── Right-side control cluster: zoom + region jump grouped together ── */}
      <div style={{
        position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
        zIndex:1000, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6,
      }}>
        {/* Zoom + map button pill — all in one card */}
        <div style={{
          display:"flex", flexDirection:"column",
          background:"rgba(255,255,255,0.97)",
          borderRadius:14, border:"1.5px solid rgba(37,99,235,0.18)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.13)",
          overflow:"hidden",
        }}>
          {[
            { label:"＋", title:"Zoom in",  fn: () => leafletMap?.zoomIn()  },
            { label:"－", title:"Zoom out", fn: () => leafletMap?.zoomOut() },
          ].map((b, i) => (
            <button
              key={b.label}
              onClick={b.fn}
              title={b.title}
              style={{
                width:42, height:42,
                border:"none",
                borderBottom: i === 0 ? "1px solid rgba(37,99,235,0.12)" : "none",
                background:"transparent",
                color:"#2563eb", fontSize:22, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", transition:"all 0.15s", lineHeight:1,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563eb"; }}
            >
              {b.label}
            </button>
          ))}

          {/* Divider */}
          <div style={{ height:1, background:"rgba(37,99,235,0.12)", margin:"0 8px" }} />

          {/* Map / region jump button — same pill, right below zoom */}
          <button
            onClick={() => setControlsOpen(p => !p)}
            title="Jump to region"
            style={{
              width:42, height:42, border:"none",
              background: controlsOpen ? "#2563eb" : "transparent",
              color: controlsOpen ? "#fff" : "#2563eb",
              cursor:"pointer", fontSize:17,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s",
            }}
            onMouseEnter={e => {
              if (!controlsOpen) { e.currentTarget.style.background = "rgba(37,99,235,0.08)"; }
            }}
            onMouseLeave={e => {
              if (!controlsOpen) { e.currentTarget.style.background = "transparent"; }
            }}
          >
            🗺
          </button>
        </div>

        {/* Collapsible preset panel — pops out to the left of the pill */}
        {controlsOpen && (
          <div style={{
            position:"absolute", right:52, top:0,
            background:ui.panel, borderRadius:12, border:`1px solid ${ui.border}`,
            boxShadow:"0 8px 32px rgba(0,0,0,0.15)", padding:"12px 14px", width:192,
            animation:"fadeIn 0.2s ease",
          }}>
            <div style={{
              fontSize:9, fontWeight:700, color:ui.accent,
              letterSpacing:1.5, fontFamily:"monospace", marginBottom:10,
              textTransform:"uppercase",
            }}>
              Jump To Region
            </div>

            <button
              onClick={() => { setActivePreset(VIEW_PRESETS[0]); setAutoZoomDone(false); setControlsOpen(false); }}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:8,
                padding:"7px 10px", borderRadius:7, cursor:"pointer", marginBottom:6,
                background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.15)",
                color:ui.text, fontSize:12, fontWeight:600,
              }}
            >
              🏠 <span>Globe View (reset)</span>
            </button>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {PANEL_PRESETS.map(p => (
                <button key={p.id}
                  onClick={() => { setActivePreset(p); setAutoZoomDone(true); setControlsOpen(false); }}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    gap:2, padding:"7px 4px", borderRadius:7, cursor:"pointer",
                    background: activePreset.id===p.id ? "rgba(37,99,235,0.12)" : "rgba(0,0,0,0.04)",
                    border:`1.5px solid ${activePreset.id===p.id ? "#2563eb" : "rgba(0,0,0,0.08)"}`,
                    color: activePreset.id===p.id ? "#1d4ed8" : ui.text,
                    transition:"all 0.15s",
                  }}
                >
                  <span style={{ fontSize:14 }}>{p.flag}</span>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:0.4, whiteSpace:"nowrap" }}>
                    {p.label.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            <div style={{
              marginTop:8, padding:"4px 8px",
              background:"rgba(0,0,0,0.03)", borderRadius:5, border:`1px solid ${ui.border}`,
              textAlign:"center", fontSize:9, color:ui.textMuted, fontFamily:"monospace",
            }}>
              {activePreset.label} · zoom {activePreset.zoom}×
            </div>
          </div>
        )}
      </div>

      {/* ── Choropleth legend (bottom-left, compact) ── */}
      <div style={{
        position:"absolute", bottom:10, left:10, zIndex:1000,
        background:ui.panel, border:`1px solid ${ui.border}`,
        borderRadius:8, padding:"10px 12px", boxShadow:ui.shadow,
      }}>
        <div style={{ fontSize:8, fontWeight:700, color:ui.textFaint, marginBottom:6, letterSpacing:2, fontFamily:"monospace" }}>
          CONNECTIVITY
        </div>
        {[
          { fill:"rgba(29,78,216,0.52)",  b:"#1d4ed8", label:"Very High" },
          { fill:"rgba(37,99,235,0.42)",  b:"#2563eb", label:"High"      },
          { fill:"rgba(59,130,246,0.35)", b:"#3b82f6", label:"Medium"    },
          { fill:"rgba(96,165,250,0.28)", b:"#60a5fa", label:"Low"       },
          { fill:"rgba(147,197,253,0.20)",b:"#93c5fd", label:"Minimal"   },
          { fill:"transparent",           b:"#dde4ed", label:"None"      },
        ].map(({ fill, b, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <div style={{ width:11, height:11, borderRadius:2, background:fill, border:`1.5px solid ${b}`, flexShrink:0 }} />
            <span style={{ fontSize:9, color:ui.textMuted, fontFamily:"monospace" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Stats strip (bottom-center) ── */}
      <div style={{
        position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:6, zIndex:1000,
      }}>
        {(!isAdmin ? [
          { label:"BIZ",     value:countyStats.business, color:"#1d4ed8" },
          { label:"HOME",    value:countyStats.home,     color:"#3b82f6" },
          { label:"BOTH",    value:countyStats.both,     color:"#1e40af" },
          { label:"PLANNED", value:countyStats.none,     color:"#94a3b8" },
        ] : [
          { label:"ZONES",   value:coverageZones.length,    color:"#2563eb" },
          { label:"REGIONS", value:regionList.length,       color:"#7c3aed" },
          { label:"VISIBLE", value:visibleAdminDots.length, color:"#059669" },
        ]).map(({ label, value, color }) => (
          <div key={label} style={{
            background:ui.panel, border:`1px solid ${ui.border}`,
            borderRadius:6, padding:"5px 10px",
            display:"flex", flexDirection:"column", alignItems:"center",
            minWidth:54, boxShadow:ui.shadow,
          }}>
            <span style={{ fontSize:13, fontWeight:800, color, fontFamily:"monospace" }}>{value}</span>
            <span style={{ fontSize:7, color:ui.textFaint, letterSpacing:1, fontFamily:"monospace" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Admin sidebar ── */}
      {isAdmin && regionList.length > 0 && (
        <div style={{
          position:"absolute", top:10, right:56, zIndex:1001,
          display:"flex", flexDirection:"column", gap:4,
          background:ui.panel, border:`1px solid ${ui.border}`,
          borderRadius:10, padding:"10px 12px",
          maxHeight:"calc(100% - 120px)", overflowY:"auto",
          boxShadow:ui.shadow,
        }}>
          <div style={{ fontSize:8, color:ui.textFaint, letterSpacing:2, marginBottom:4, fontFamily:"monospace" }}>SURVEY REGIONS</div>
          <button onClick={() => setShowAdminDots(p => !p)} style={{
            display:"flex", alignItems:"center", gap:6, marginBottom:4,
            background: showAdminDots ? "rgba(37,99,235,0.08)" : "rgba(0,0,0,0.03)",
            border:`1px solid ${showAdminDots ? "rgba(37,99,235,0.3)" : ui.border}`,
            borderRadius:5, padding:"4px 8px", cursor:"pointer",
          }}>
            <span style={{ fontSize:9, color: showAdminDots ? "#2563eb" : ui.textFaint, fontFamily:"monospace", letterSpacing:1 }}>
              {showAdminDots ? "● DOTS ON" : "○ DOTS OFF"}
            </span>
          </button>
          {regionList.map(region => {
            const active = activeRegions.has(region);
            const color  = adminDotColor(region);
            return (
              <button key={region} onClick={() => toggleRegion(region)} style={{
                display:"flex", alignItems:"center", gap:6,
                background: active ? `${color}14` : "rgba(0,0,0,0.02)",
                border:`1px solid ${active ? color+"40" : ui.border}`,
                borderRadius:5, padding:"4px 8px", cursor:"pointer",
                transition:"all 0.18s", minWidth:130,
              }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background: active ? color : "#cbd5e1", flexShrink:0 }}/>
                <span style={{ fontSize:10, color: active ? color : ui.textFaint, fontFamily:"monospace", flex:1, textAlign:"left" }}>{region}</span>
                <span style={{ fontSize:8, color:ui.textFaint, fontFamily:"monospace" }}>
                  {adminZones.filter(z => z.name.startsWith(region)).length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Admin selected zone card ── */}
      {selectedAdminZone && isAdmin && (
        <div style={{
          position:"absolute", bottom:72, left:"50%", transform:"translateX(-50%)",
          background:ui.panel, borderRadius:10, padding:"14px 18px",
          minWidth:280, zIndex:1000, border:`1px solid ${ui.border}`,
          boxShadow:"0 12px 32px rgba(0,0,0,0.15)", animation:"fadeIn 0.2s ease",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:ui.text, marginBottom:2 }}>{selectedAdminZone.name}</div>
              <div style={{ fontSize:8, color:ui.textFaint, letterSpacing:1, fontFamily:"monospace" }}>SURVEY COORDINATE</div>
            </div>
            <button onClick={() => setSelectedAdminZone(null)} style={{
              background:"rgba(0,0,0,0.06)", border:"none", color:ui.textMuted,
              cursor:"pointer", fontSize:16, padding:"2px 6px", borderRadius:5,
            }}>×</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {([
              ["LONGITUDE", `${selectedAdminZone.center_lng!.toFixed(6)}°`],
              ["LATITUDE",  `${selectedAdminZone.center_lat!.toFixed(6)}°`],
              ["RADIUS",    `${selectedAdminZone.radius_km}km`],
              ["STATUS",    selectedAdminZone.status.toUpperCase()],
            ] as [string,string][]).map(([k,v]) => (
              <div key={k} style={{
                background:"rgba(0,0,0,0.03)", borderRadius:5, padding:"7px 9px",
                borderLeft:"2px solid rgba(37,99,235,0.3)",
              }}>
                <div style={{ fontSize:7, color:ui.textFaint, letterSpacing:1.5, fontFamily:"monospace", marginBottom:2 }}>{k}</div>
                <div style={{ fontSize:11, fontWeight:700, fontFamily:"monospace", color:ui.text }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default KenyaCoverageMap2D;