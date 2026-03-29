import * as THREE from "three";
import * as d3Geo from "d3-geo";

// ─── Utilities ───────────────────────────────────────────────────────────────
export const latLngToVec3 = (lat: number, lng: number, r = 2.75): THREE.Vector3 => {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
  );
};

export const parseGeoJsonToLineSegments = (
  geojson: any,
  radius = 2.756875
): THREE.BufferGeometry => {
  const points: number[] = [];
  const processCoordinates = (coords: any[]) => {
    if (!coords || coords.length < 2) return;
    let prev = latLngToVec3(coords[0][1], coords[0][0], radius);
    for (let i = 1; i < coords.length; i++) {
      if (!coords[i] || coords[i].length < 2) continue;
      const curr = latLngToVec3(coords[i][1], coords[i][0], radius);
      if (prev.distanceTo(curr) < 1.0)
        points.push(prev.x, prev.y, prev.z, curr.x, curr.y, curr.z);
      prev = curr;
    }
  };
  const processPolygon  = (p: any[][]) => p.forEach(ring => processCoordinates(ring));
  const processFeature  = (f: any) => {
    if (!f?.geometry) return;
    const { type, coordinates } = f.geometry;
    if      (type === "Polygon")            processPolygon(coordinates);
    else if (type === "MultiPolygon")       coordinates.forEach(processPolygon);
    else if (type === "LineString")         processCoordinates(coordinates);
    else if (type === "MultiLineString")    coordinates.forEach((l: any) => processCoordinates(l));
    else if (type === "GeometryCollection") f.geometry.geometries?.forEach((g: any) => processFeature({ geometry: g }));
  };
  if (!geojson) return new THREE.BufferGeometry();
  if      (geojson.type === "FeatureCollection") geojson.features?.forEach(processFeature);
  else if (geojson.type === "Feature")            processFeature(geojson);
  else if (geojson.type === "Polygon")            processPolygon(geojson.coordinates);
  else if (geojson.type === "MultiPolygon")       geojson.coordinates.forEach(processPolygon);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geo;
};

// ─── Globe Texture ────────────────────────────────────────────────────────────
// Renders world countries + Kenya counties onto a 2048×1024 equirectangular
// canvas texture. No procedural fallback overwrites — GeoJSON only.
export const createGlobeTexture = (
  worldData: any,
  kenyaData: any
): THREE.CanvasTexture | null => {
  const W = 2048, H = 1024;

  try {
    const canvas = document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── 1. Ocean background ──────────────────────────────────────────────────
    const ocean = ctx.createLinearGradient(0, 0, 0, H);
    ocean.addColorStop(0.0, "#1a3a5c");
    ocean.addColorStop(0.5, "#0f2744");
    ocean.addColorStop(1.0, "#081828");
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, W, H);

    // ── 2. Lat/lng grid (subtle) ─────────────────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth   = 0.6;
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * W;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── 3. d3 projection (equirectangular, full canvas) ──────────────────────
    const projection = d3Geo.geoEquirectangular()
      .scale(W / (2 * Math.PI))
      .translate([W / 2, H / 2]);
    const path = d3Geo.geoPath().projection(projection).context(ctx);

    // ── 4. World land fill ───────────────────────────────────────────────────
    const features: any[] = worldData?.features ?? [];
    features.forEach((f: any) => {
      ctx.beginPath();
      path(f);
      ctx.fillStyle   = "#2d5a3d";  // dark green land
      ctx.fill();
    });

    // ── 5. World country borders ─────────────────────────────────────────────
    ctx.strokeStyle = "#1a3a28";
    ctx.lineWidth   = 0.7;
    features.forEach((f: any) => {
      ctx.beginPath();
      path(f);
      ctx.stroke();
    });

    // ── 6. Kenya counties — highlighted ──────────────────────────────────────
    const kenyaFeatures: any[] = kenyaData?.features ?? [];
    kenyaFeatures.forEach((f: any) => {
      ctx.beginPath();
      path(f);
      ctx.fillStyle = "#3a7a50";    // brighter green for Kenya
      ctx.fill();
    });
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth   = 1.2;
    kenyaFeatures.forEach((f: any) => {
      ctx.beginPath();
      path(f);
      ctx.stroke();
    });

    // ── 7. Equator highlight ─────────────────────────────────────────────────
    const eqY = ((90 - 0) / 180) * H;
    ctx.strokeStyle = "rgba(0,255,136,0.3)";
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(W, eqY); ctx.stroke();

    // ── 8. Build texture ─────────────────────────────────────────────────────
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace       = THREE.SRGBColorSpace;
    tex.minFilter        = THREE.LinearMipmapLinearFilter;
    tex.magFilter        = THREE.LinearFilter;
    tex.generateMipmaps  = true;
    tex.anisotropy       = 8;
    tex.needsUpdate      = true;
    return tex;

  } catch (err) {
    console.error("[createGlobeTexture] failed:", err);
    return null;
  }
};