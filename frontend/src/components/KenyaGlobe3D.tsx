import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// ─── Types ─────────────────────────────────────────────────────────────────
interface CoverageLocation {
  name: string;
  county: string;
  country: string;
  continent: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed?: string;
  type?: string;
  tier?: "hub" | "node" | "micro";
}

// ─── Coverage Data: Kenya + East Africa ────────────────────────────────────
const LOCATIONS: CoverageLocation[] = [
  // Kenya – Nairobi Metro (dense hub)
  { name: "Westlands",        county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2637, lng: 36.8063, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Kilimani",         county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2915, lng: 36.7823, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Karen",            county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.3197, lng: 36.7073, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Lavington",        county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2769, lng: 36.7693, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Kileleshwa",       county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2838, lng: 36.7876, speed: "500Mbps", type: "Wireless", tier: "micro" },
  { name: "Parklands",        county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2606, lng: 36.8219, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Upper Hill",       county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2983, lng: 36.8146, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "CBD Nairobi",      county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2833, lng: 36.8167, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Gigiri",           county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2289, lng: 36.8037, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Runda",            county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "coming_soon", lat: -1.2189, lng: 36.8156, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Langata",          county: "Nairobi",       country: "Kenya",    continent: "Africa",    status: "coming_soon", lat: -1.3614, lng: 36.7422, speed: "500Mbps", type: "Wireless", tier: "micro" },
  { name: "Ruaka",            county: "Kiambu",        country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.2005, lng: 36.7986, speed: "500Mbps", type: "Fiber",    tier: "micro" },
  // Kenya – Coast
  { name: "Nyali",            county: "Mombasa",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -4.0375, lng: 39.7208, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Mombasa CBD",      county: "Mombasa",       country: "Kenya",    continent: "Africa",    status: "connected",   lat: -4.0435, lng: 39.6682, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Bamburi",          county: "Mombasa",       country: "Kenya",    continent: "Africa",    status: "coming_soon", lat: -3.9833, lng: 39.7333, speed: "500Mbps", type: "Wireless", tier: "micro" },
  { name: "Diani",            county: "Kwale",         country: "Kenya",    continent: "Africa",    status: "coming_soon", lat: -4.3167, lng: 39.5667, speed: "500Mbps", type: "Fiber",    tier: "node" },
  // Kenya – Rift & Western
  { name: "Kisumu CBD",       county: "Kisumu",        country: "Kenya",    continent: "Africa",    status: "connected",   lat: -0.0917, lng: 34.7680, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Eldoret CBD",      county: "Uasin Gishu",   country: "Kenya",    continent: "Africa",    status: "coming_soon", lat:  0.5143, lng: 35.2698, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Nakuru",           county: "Nakuru",        country: "Kenya",    continent: "Africa",    status: "connected",   lat: -0.3031, lng: 36.0800, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Thika",            county: "Kiambu",        country: "Kenya",    continent: "Africa",    status: "connected",   lat: -1.0332, lng: 37.0693, speed: "500Mbps", type: "Fiber",    tier: "node" },
  // Uganda
  { name: "Kampala CBD",      county: "Kampala",       country: "Uganda",   continent: "Africa",    status: "connected",   lat:  0.3476, lng: 32.5825, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Entebbe",          county: "Wakiso",        country: "Uganda",   continent: "Africa",    status: "connected",   lat:  0.0512, lng: 32.4637, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Jinja",            county: "Jinja",         country: "Uganda",   continent: "Africa",    status: "coming_soon", lat:  0.4244, lng: 33.2041, speed: "500Mbps", type: "Wireless", tier: "micro" },
  // Tanzania
  { name: "Dar es Salaam",    county: "Dar es Salaam", country: "Tanzania", continent: "Africa",    status: "connected",   lat: -6.7924, lng: 39.2083, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Arusha",           county: "Arusha",        country: "Tanzania", continent: "Africa",    status: "coming_soon", lat: -3.3869, lng: 36.6830, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Mwanza",           county: "Mwanza",        country: "Tanzania", continent: "Africa",    status: "coming_soon", lat: -2.5167, lng: 32.9000, speed: "500Mbps", type: "Fiber",    tier: "node" },
  // Rwanda
  { name: "Kigali",           county: "Kigali",        country: "Rwanda",   continent: "Africa",    status: "connected",   lat: -1.9441, lng: 30.0619, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  // Ethiopia
  { name: "Addis Ababa",      county: "Addis Ababa",   country: "Ethiopia", continent: "Africa",    status: "coming_soon", lat:  9.0300, lng: 38.7400, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  // South Sudan
  { name: "Juba",             county: "Juba",          country: "South Sudan", continent: "Africa",  status: "coming_soon", lat: 4.8594, lng: 31.5713, speed: "500Mbps", type: "Wireless", tier: "node" },
  // More Africa - West & North
  { name: "Lagos",            county: "Lagos",         country: "Nigeria",   continent: "Africa",    status: "connected",   lat: 6.5244, lng: 3.3792, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Cairo",            county: "Cairo",         country: "Egypt",     continent: "Africa",    status: "connected",   lat: 30.0444, lng: 31.2357, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Johannesburg",     county: "Gauteng",       country: "South Africa", continent: "Africa", status: "connected",   lat: -26.2041, lng: 28.0473, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Casablanca",       county: "Casablanca",     country: "Morocco",   continent: "Africa",    status: "coming_soon", lat: 33.5731, lng: -7.5898, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  // Europe
  { name: "London",           county: "London",         country: "UK",        continent: "Europe",     status: "connected",   lat: 51.5074, lng: -0.1278, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Paris",            county: "Île-de-France",  country: "France",    continent: "Europe",     status: "connected",   lat: 48.8566, lng: 2.3522, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Frankfurt",        county: "Hesse",         country: "Germany",   continent: "Europe",     status: "connected",   lat: 50.1109, lng: 8.6821, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Amsterdam",        county: "North Holland", country: "Netherlands", continent: "Europe", status: "connected",   lat: 52.3676, lng: 4.9041, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  // Asia
  { name: "Dubai",            county: "Dubai",         country: "UAE",       continent: "Asia",      status: "connected",   lat: 25.2048, lng: 55.2708, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Mumbai",           county: "Maharashtra",    country: "India",      continent: "Asia",      status: "connected",   lat: 19.0760, lng: 72.8777, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Singapore",        county: "Singapore",     country: "Singapore",  continent: "Asia",      status: "connected",   lat: 1.3521, lng: 103.8198, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Tokyo",            county: "Tokyo",         country: "Japan",      continent: "Asia",      status: "connected",   lat: 35.6762, lng: 139.6503, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  // Americas
  { name: "New York",        county: "New York",      country: "USA",        continent: "Americas",   status: "connected",   lat: 40.7128, lng: -74.0060, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Miami",            county: "Florida",       country: "USA",        continent: "Americas",   status: "connected",   lat: 25.7617, lng: -80.1918, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "São Paulo",       county: "São Paulo",     country: "Brazil",    continent: "Americas",   status: "connected",   lat: -23.5505, lng: -46.6333, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  // Oceania
  { name: "Sydney",           county: "NSW",           country: "Australia",  continent: "Oceania",   status: "connected",   lat: -33.8688, lng: 151.2093, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Melbourne",        county: "Victoria",      country: "Australia",  continent: "Oceania",   status: "coming_soon", lat: -37.8136, lng: 144.9631, speed: "1Gbps",   type: "Fiber",    tier: "node" },
];

// ─── Country label positions ────────────────────────────────────────────────
const COUNTRY_LABELS = [
  { name: "KENYA",        lat: -0.5, lng: 37.5 },
  { name: "UGANDA",       lat:  1.4, lng: 32.4 },
  { name: "TANZANIA",     lat: -5.5, lng: 34.8 },
  { name: "RWANDA",       lat: -2.0, lng: 29.9 },
  { name: "ETHIOPIA",     lat:  9.0, lng: 40.5 },
  { name: "SOMALIA",      lat:  5.5, lng: 46.0 },
  { name: "SOUTH SUDAN",  lat:  6.5, lng: 31.0 },
  { name: "BURUNDI",      lat: -3.4, lng: 29.9 },
  { name: "DEM. REP. CONGO", lat: -2.5, lng: 23.0 },
  { name: "MOZAMBIQUE",   lat: -16.0, lng: 35.0 },
  { name: "ZAMBIA",       lat: -13.0, lng: 28.0 },
  { name: "SUDAN",        lat: 15.0, lng: 30.0 },
  { name: "EGYPT",        lat: 26.0, lng: 29.0 },
  { name: "SAUDI ARABIA", lat: 24.0, lng: 44.0 },
  { name: "INDIA",        lat: 22.0, lng: 78.0 },
];

// ─── Utility ────────────────────────────────────────────────────────────────
const latLngToVec3 = (lat: number, lng: number, r = 2): THREE.Vector3 => {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
  );
};

// ─── Globe texture (realistic political map, Africa-centered) ───────────────
const useGlobeTexture = () =>
  useMemo(() => {
    const W = 4096, H = 2048;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;

    // Deep ocean
    const seaGrad = ctx.createLinearGradient(0, 0, 0, H);
    seaGrad.addColorStop(0,   "#c8d8e8");
    seaGrad.addColorStop(0.5, "#b8ccd8");
    seaGrad.addColorStop(1,   "#c8d8e8");
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 0, W, H);

    // Helper to convert lat/lng to canvas x,y
    const px = (lat: number, lng: number) => [
      ((lng + 180) / 360) * W,
      ((90 - lat) / 180) * H,
    ];

    const land  = "#b4bec8";
    const landH = "#9fb8cc"; // highlighted / focus land
    const border = "rgba(70,80,100,0.35)";

    const fill = (points: [number, number][], color: string, stroke = true) => {
      ctx.beginPath();
      ctx.moveTo(...px(points[0][0], points[0][1]) as [number,number]);
      points.slice(1).forEach(p => ctx.lineTo(...px(p[0], p[1]) as [number,number]));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (stroke) { ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke(); }
    };

    // ── Africa ──────────────────────────────────────────────────
    fill([
      [37,  -18], [37,  51], [11,  51], [-5,  39], [-35, 18], [-35, 27],
      [-25, 32], [-15, 35], [0,   37], [10,  40], [15,  40], [15,  24],
      [22,  24], [22,  15], [30,  15], [37,  22], [37,  -18],
    ], land);

    // Morocco/NW Africa
    fill([[35,-6],[35,0],[30,0],[30,-8],[35,-6]], land);
    // Tunisia
    fill([[37,7],[37,11],[32,11],[32,7],[37,7]], land);
    // Libya
    fill([[33,9],[33,25],[20,25],[20,9],[33,9]], land);
    // Egypt
    fill([[31,24],[31,36],[22,36],[22,24],[31,24]], land);
    // Sudan/South Sudan
    fill([[22,24],[22,38],[4,38],[4,24],[22,24]], land);
    // Ethiopia
    fill([[15,33],[15,48],[3,48],[3,33],[15,33]], land);
    // Somalia
    fill([[12,40],[12,51],[0,51],[0,40],[12,40]], land);

    // ── Kenya (highlighted) ──────────────────────────────────────
    fill([
      [ 4.2, 34.0],[  4.2, 41.9],
      [ 1.0, 41.9],[  1.0, 40.5],
      [-1.0, 40.5],[-1.0, 38.5],
      [-4.6, 38.5],[-4.6, 37.7],
      [-4.7, 34.0],[ 4.2, 34.0],
    ], "#8db8ce");

    // Kenya internal counties (subtle)
    ctx.strokeStyle = "rgba(50,80,110,0.2)";
    ctx.lineWidth = 0.6;
    [[-1.0, 34.0,-1.0,41.9],[-4.6,34.0,4.2,34.0]].forEach(([y1,x1,y2,x2]) => {
      const [sx,sy] = px(y1, x1); const [ex,ey] = px(y2, x2);
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();
    });

    // ── Uganda ───────────────────────────────────────────────────
    fill([[4,30],[4,35],[0,35],[0,30],[4,30]], landH);
    // Rwanda
    fill([[-1,28],[-1,31],[-3,31],[-3,28],[-1,28]], landH);
    // Burundi
    fill([[-3,28],[-3,31],[-5,31],[-5,28],[-3,28]], land);
    // Tanzania
    fill([[0,30],[0,40],[-12,40],[-12,30],[0,30]], land);
    fill([[-12,34],[-12,40],[-26,40],[-26,34],[-12,34]], land);

    // ── Europe ───────────────────────────────────────────────────
    fill([[72,-10],[72,40],[36,40],[36,-10],[72,-10]], land, false);
    // Iberia
    fill([[44,-9],[44,4],[36,4],[36,-9],[44,-9]], land);
    // France/BeNeLux
    fill([[52,-4],[52,9],[44,9],[44,-4],[52,-4]], land);
    // Germany/Central Europe
    fill([[56,6],[56,24],[46,24],[46,6],[56,6]], land);
    // Scandinavia
    fill([[72,4],[72,32],[56,32],[56,4],[72,4]], land);
    // UK
    fill([[62,-8],[62,2],[50,2],[50,-8],[62,-8]], land);

    // ── Middle East ───────────────────────────────────────────────
    fill([[37,26],[37,60],[15,60],[15,26],[37,26]], land);
    // Arabian peninsula
    fill([[22,36],[22,60],[10,60],[10,36],[22,36]], land);

    // ── Asia ─────────────────────────────────────────────────────
    fill([[72,26],[72,140],[0,140],[0,60],[30,60],[36,26],[72,26]], land, false);
    // Indian subcontinent
    fill([[36,60],[36,80],[8,80],[8,60],[36,60]], land);
    fill([[28,72],[28,95],[8,95],[8,72],[28,72]], land);
    // SE Asia / China
    fill([[53,72],[53,135],[20,135],[20,72],[53,72]], land);
    // Japan
    fill([[45,128],[45,146],[30,146],[30,128],[45,128]], land);

    // ── Americas ─────────────────────────────────────────────────
    fill([[72,-170],[72,-50],[0,-50],[0,-85],[15,-85],[15,-90],[30,-90],[30,-76],[72,-76],[72,-170]], land, false);
    fill([[55,-135],[55,-60],[25,-60],[25,-90],[55,-90],[55,-135]], land);
    fill([[25,-88],[25,-62],[5,-62],[5,-78],[25,-78],[25,-88]], land);
    fill([[5,-82],[5,-34],[-56,-34],[-56,-74],[5,-74],[5,-82]], land);

    // ── Australia ─────────────────────────────────────────────────
    fill([[-10,113],[-10,154],[-44,154],[-44,113],[-10,113]], land);
    // NZ
    fill([[-34,166],[-34,178],[-47,178],[-47,166],[-34,166]], land);

    // ── Latitude / Longitude grid ─────────────────────────────────
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#607080";
    ctx.lineWidth   = 0.5;
    for (let lon = -180; lon <= 180; lon += 15) {
      const [x] = px(0, lon);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += 15) {
      const [,y] = px(lat, 0);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── Equator & Tropics (subtle) ────────────────────────────────
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = "#4a8080";
    ctx.lineWidth   = 1;
    [[0,"#4a8080"],[23.5,"#806040"],[-23.5,"#806040"]].forEach(([lat, color]) => {
      const [,y] = px(lat as number, 0);
      ctx.strokeStyle = color as string;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(c);
  }, []);

// ─── Globe ──────────────────────────────────────────────────────────────────
const Globe = ({ texture }: { texture: THREE.Texture }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.00035; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 128, 128]} />
      <meshPhongMaterial
        map={texture}
        specular={new THREE.Color("#223344")}
        shininess={8}
        emissive={new THREE.Color("#050810")}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
};

// ─── Atmosphere ─────────────────────────────────────────────────────────────
const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.22, 64, 64]} />
    <shaderMaterial
      transparent side={THREE.BackSide} depthWrite={false}
      vertexShader={`
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`}
      fragmentShader={`
        varying vec3 vNormal;
        void main() {
          float i = pow(0.6 - dot(vNormal, vec3(0,0,1)), 3.0);
          gl_FragColor = vec4(0.2, 0.55, 0.85, i * 0.45);
        }`}
    />
  </mesh>
);

// ─── Fiber arc between two lat/lng points ────────────────────────────────────
interface ArcProps {
  from: [number, number];
  to:   [number, number];
  color?: string;
  opacity?: number;
  arcHeight?: number;
  animated?: boolean;
  speed?: number;
}

const FiberArc = ({
  from, to,
  color = "#00c8ff",
  opacity = 0.55,
  arcHeight = 0.22,
  animated = true,
  speed = 1,
}: ArcProps) => {
  const ref   = useRef<any>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  const geometry = useMemo(() => {
    const sv  = latLngToVec3(from[0], from[1], 2.01);
    const ev  = latLngToVec3(to[0],   to[1],   2.01);
    const mid = sv.clone().add(ev).multiplyScalar(0.5);
    const dist = sv.distanceTo(ev);
    mid.normalize().multiplyScalar(2 + dist * arcHeight);
    const curve = new THREE.QuadraticBezierCurve3(sv, mid, ev);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  }, [from, to, arcHeight]);

  useFrame(({ clock }) => {
    if (!ref.current || !animated) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.LineBasicMaterial).opacity =
      opacity * (0.6 + 0.4 * Math.sin(t * speed * 1.5 + offset));
  });

  return (
    // @ts-ignore
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} depthWrite={false} />
    </line>
  );
};

// ─── Node dot ────────────────────────────────────────────────────────────────
interface NodeProps {
  loc: CoverageLocation;
  isSelected: boolean;
  onClick: (l: CoverageLocation) => void;
}

const NetworkNode = ({ loc, isSelected, onClick }: NodeProps) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const offset  = useMemo(() => Math.random() * Math.PI * 2, []);

  const pos = useMemo(() => {
    const v = latLngToVec3(loc.lat, loc.lng, 2.025);
    return [v.x, v.y, v.z] as [number,number,number];
  }, [loc]);

  const isHub   = loc.tier === "hub";
  const isLive  = loc.status === "connected";
  const color   = isSelected ? "#ffffff" : isLive ? (isHub ? "#00e8ff" : "#00b8e8") : "#f59e0b";
  const size    = isHub ? 0.045 : loc.tier === "node" ? 0.028 : 0.018;
  const pulse   = isHub ? 2.0 : 2.8;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + offset;
    if (coreRef.current) {
      const s = 1 + Math.sin(t * pulse) * (isHub ? 0.18 : 0.12);
      coreRef.current.scale.setScalar(s);
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * pulse * 0.7) * 0.25;
      glowRef.current.scale.setScalar(s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        (isHub ? 0.18 : 0.1) + Math.sin(t * pulse) * 0.06;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime();
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.8 : 0;
    }
  });

  return (
    <group position={pos}>
      {/* Selection ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[size * 2.2, size * 2.8, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Core */}
      <mesh
        ref={coreRef}
        onClick={e => { e.stopPropagation(); onClick(loc); }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={()  => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

// ─── Satellite ───────────────────────────────────────────────────────────────
const Satellite = () => {
  const orbitRef = useRef<THREE.Group>(null);
  const bodyRef  = useRef<THREE.Group>(null);
  const beamRef  = useRef<THREE.Mesh>(null);
  const beam2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbitRef.current) {
      orbitRef.current.rotation.x = -0.4;
      orbitRef.current.rotation.y = t * 0.12;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.z = t * 0.3;
    }
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 4) * 0.15;
    }
    if (beam2Ref.current) {
      (beam2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 4 + 1) * 0.1;
    }
  });

  return (
    <group ref={orbitRef}>
      <group position={[0, 3.2, 0]}>
        <group ref={bodyRef}>
          {/* Body */}
          <mesh>
            <boxGeometry args={[0.14, 0.09, 0.09]} />
            <meshStandardMaterial color="#d0d8e0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Panel L */}
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[0.32, 0.025, 0.1]} />
            <meshStandardMaterial color="#1a2a6e" metalness={0.5} roughness={0.4} emissive="#001040" emissiveIntensity={0.3} />
          </mesh>
          {/* Panel R */}
          <mesh position={[0, 0, -0.16]}>
            <boxGeometry args={[0.32, 0.025, 0.1]} />
            <meshStandardMaterial color="#1a2a6e" metalness={0.5} roughness={0.4} emissive="#001040" emissiveIntensity={0.3} />
          </mesh>
          {/* Dish */}
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
            <coneGeometry args={[0.05, 0.04, 16, 1, true]} />
            <meshStandardMaterial color="#e8e8e8" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* C-Band beam to Earth */}
        <mesh ref={beamRef} position={[0, -0.7, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.08, 1.2, 12, 1, true]} />
          <meshBasicMaterial color="#00c8ff" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={beam2Ref} position={[0, -0.7, 0]}>
          <coneGeometry args={[0.04, 1.2, 8, 1, true]} />
          <meshBasicMaterial color="#80e8ff" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

// ─── Orbit ring (decorative) ─────────────────────────────────────────────────
const OrbitRing = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.5, 0, 0]}>
      <ringGeometry args={[3.18, 3.22, 128]} />
      <meshBasicMaterial color="#00a8d8" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

// ─── Star field ──────────────────────────────────────────────────────────────
const Stars = () => {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < 2500; i++) {
      const r   = 18 + Math.random() * 30;
      const phi = Math.acos(2 * Math.random() - 1);
      const th  = Math.random() * Math.PI * 2;
      positions.push(
        r * Math.sin(phi) * Math.cos(th),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(th)
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.002;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#c8e0ff" size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

// ─── Network arcs overlay ────────────────────────────────────────────────────
const NetworkArcs = ({ locations }: { locations: CoverageLocation[] }) => {
  const arcs = useMemo(() => {
    const result: { from:[number,number]; to:[number,number]; color:string; opacity:number; speed:number; arcHeight:number }[] = [];
    const live = locations.filter(l => l.status === "connected");
    const hubs = live.filter(l => l.tier === "hub");

    // Hub-to-hub (long distance, bright)
    hubs.forEach((a, i) => {
      hubs.forEach((b, j) => {
        if (i >= j) return;
        const d = Math.hypot(a.lat - b.lat, a.lng - b.lng);
        if (d < 80) {
          result.push({ from:[a.lat,a.lng], to:[b.lat,b.lng], color:"#00d8ff", opacity:0.55, speed:0.8, arcHeight:0.28 });
        }
      });
    });

    // Hub-to-node (medium)
    hubs.forEach(hub => {
      live.filter(l => l.tier !== "hub").forEach(node => {
        const d = Math.hypot(hub.lat - node.lat, hub.lng - node.lng);
        if (d < 12) {
          result.push({ from:[hub.lat,hub.lng], to:[node.lat,node.lng], color:"#40b8d8", opacity:0.35, speed:1.2, arcHeight:0.14 });
        }
      });
    });

    // Add some global backbone arcs (satellite routes)
    const backbone: [[number,number],[number,number]][] = [
      [[ 0.347, 32.58], [51.5, 0.0]],    // Kampala → London
      [[-1.283, 36.82], [48.85, 2.35]],  // Nairobi → Paris
      [[-1.283, 36.82], [25.2, 55.27]],  // Nairobi → Dubai
      [[-6.792, 39.20], [19.43, 99.13]], // Dar → Asia
      [[-1.944, 30.06], [40.71,-74.00]], // Kigali → New York
      [[ 9.03,  38.74], [55.75, 37.62]], // Addis → Moscow
      [[-1.283, 36.82], [-23.5,-46.6]],  // Nairobi → São Paulo
    ];
    backbone.forEach(([from, to]) => {
      result.push({ from: from as [number,number], to: to as [number,number], color:"#0080c0", opacity:0.18, speed:0.4, arcHeight:0.45 });
    });

    return result;
  }, [locations]);

  return (
    <group>
      {arcs.map((a, i) => (
        <FiberArc key={i} {...a} animated />
      ))}
    </group>
  );
};

// ─── Camera controller ref ───────────────────────────────────────────────────
interface ControlsRef { zoomIn: () => void; zoomOut: () => void; focusKenya: () => void; }

const CameraRig = ({ onReady }: { onReady: (r: ControlsRef) => void }) => {
  const { camera } = useThree();
  useEffect(() => {
    onReady({
      zoomIn:      () => { camera.position.multiplyScalar(0.80); },
      zoomOut:     () => { camera.position.multiplyScalar(1.25); },
      focusKenya:  () => {
        const target = latLngToVec3(-1, 37, 5);
        camera.position.set(target.x, target.y, target.z);
        camera.lookAt(0, 0, 0);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

// ─── HUD Clock ───────────────────────────────────────────────────────────────
const HUDClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#00c8e8", letterSpacing: 1 }}>
      {time.toUTCString().slice(17, 25)} UTC
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const VilcomCoverageMap = () => {
  const [selected, setSelected]   = useState<CoverageLocation | null>(null);
  const [phase, setPhase]         = useState(0);
  const [filter, setFilter]       = useState<"all" | "connected" | "coming_soon">("all");
  const ctrlRef                   = useRef<ControlsRef | null>(null);
  const globeTexture               = useGlobeTexture();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const filteredLocations = useMemo(() =>
    filter === "all" ? LOCATIONS : LOCATIONS.filter(l => l.status === (filter === "connected" ? "connected" : "coming_soon")),
  [filter]);

  const handleSelect = useCallback((loc: CoverageLocation) => {
    setSelected(prev => prev?.name === loc.name ? null : loc);
  }, []);

  const liveCount   = LOCATIONS.filter(l => l.status === "connected").length;
  const soonCount   = LOCATIONS.filter(l => l.status === "coming_soon").length;
  const countries   = [...new Set(LOCATIONS.map(l => l.country))];

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100vh",
      background: "radial-gradient(ellipse at 40% 50%, #050d1a 0%, #020810 60%, #000308 100%)",
      fontFamily: "'Courier New', Courier, monospace",
      overflow: "hidden",
    }}>
      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0.3, 0.8, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
        dpr={[1, 2.5]}
      >
        <color attach="background" args={["#020810"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 4, 5]}  intensity={1.1}  color="#e8f4ff" />
        <directionalLight position={[-4,-2,-4]} intensity={0.15} color="#2040a0" />
        <pointLight       position={[0, 0, 5]}  intensity={0.3}  color="#0080c0" />

        <Stars />
        <Globe texture={globeTexture} />
        <Atmosphere />
        <OrbitRing />
        <Satellite />

        <NetworkArcs locations={filteredLocations} />

        {filteredLocations.map((loc, i) => (
          <NetworkNode key={i} loc={loc} isSelected={selected?.name === loc.name} onClick={handleSelect} />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2.8}
          maxDistance={12}
          autoRotate={false}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          target={[0, 0, 0]}
        />
        <CameraRig onReady={r => { ctrlRef.current = r; }} />
      </Canvas>

      {/* ══════════════════════════════════════════
          HUD OVERLAYS
      ══════════════════════════════════════════ */}

      {/* ── Top-left: Vilcom brand + status ── */}
      {phase >= 1 && (
        <div style={{
          position: "absolute", top: 18, left: 18, zIndex: 20,
          animation: "hudIn 0.6s ease both",
        }}>
          {/* Logo block */}
          <div style={{
            background: "rgba(0,12,28,0.85)",
            border: "1px solid rgba(0,200,240,0.2)",
            backdropFilter: "blur(18px)",
            borderRadius: 4,
            padding: "10px 16px 8px",
            marginBottom: 6,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 900,
              fontFamily: "'Arial Black', Arial, sans-serif",
              letterSpacing: 4,
              background: "linear-gradient(135deg, #00e0ff, #0080d8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}>VILCOM</div>
            <div style={{ fontSize: 8, color: "rgba(0,200,230,0.5)", letterSpacing: 3, marginTop: 2 }}>
              NETWORKS · EAST AFRICA
            </div>
          </div>
          {/* Status ticker */}
          <div style={{
            background: "rgba(0,12,28,0.78)",
            border: "1px solid rgba(0,200,240,0.12)",
            backdropFilter: "blur(12px)",
            borderRadius: 4,
            padding: "6px 12px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              display: "inline-block", width: 7, height: 7, borderRadius: "50%",
              background: "#00e880",
              boxShadow: "0 0 6px #00e880",
              animation: "blink 2s ease infinite",
            }} />
            <span style={{ fontSize: 9, color: "rgba(0,210,210,0.7)", letterSpacing: 2 }}>
              NETWORK COVERAGE STATUS · LIVE
            </span>
          </div>
        </div>
      )}

      {/* ── Top-center: Title HUD ── */}
      {phase >= 2 && (
        <div style={{
          position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
          zIndex: 20, textAlign: "center",
          animation: "hudIn 0.6s 0.3s ease both",
          pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(0,10,24,0.82)",
            border: "1px solid rgba(0,180,220,0.15)",
            backdropFilter: "blur(16px)",
            borderRadius: 4,
            padding: "8px 24px",
          }}>
            <div style={{ fontSize: 10, color: "rgba(0,200,240,0.45)", letterSpacing: 3, marginBottom: 2 }}>
              ◈ GLOBAL DATA FLOW · C-BAND SATELLITE + FIBER ◈
            </div>
            <div style={{ fontSize: 8, color: "rgba(0,160,200,0.35)", letterSpacing: 2 }}>
              <HUDClock />
            </div>
          </div>
        </div>
      )}

      {/* ── Top-right: stat cards ── */}
      {phase >= 2 && (
        <div style={{
          position: "absolute", top: 18, right: 18, zIndex: 20,
          display: "flex", flexDirection: "column", gap: 6,
          animation: "hudIn 0.6s 0.2s ease both",
        }}>
          {[
            { label: "LIVE NODES",    value: String(liveCount),    color: "#00e8a8" },
            { label: "EXPANDING",     value: String(soonCount),    color: "#f59e0b" },
            { label: "COUNTRIES",     value: String(countries.length), color: "#00c8ff" },
            { label: "UPTIME",        value: "99.97%",             color: "#00e8a8" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "rgba(0,10,24,0.82)",
              border: "1px solid rgba(0,180,220,0.12)",
              backdropFilter: "blur(14px)",
              borderRadius: 4,
              padding: "7px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 24, minWidth: 160,
            }}>
              <span style={{ fontSize: 8, color: "rgba(160,200,220,0.5)", letterSpacing: 1.5 }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Courier New',monospace", letterSpacing: 2 }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Left-center: filter controls ── */}
      {phase >= 3 && (
        <div style={{
          position: "absolute", top: "50%", left: 18, transform: "translateY(-50%)",
          zIndex: 20, display: "flex", flexDirection: "column", gap: 4,
          animation: "hudIn 0.6s 0.4s ease both",
        }}>
          <div style={{ fontSize: 8, color: "rgba(0,180,220,0.4)", letterSpacing: 2, marginBottom: 4, paddingLeft: 2 }}>FILTER</div>
          {([
            { key: "all",          label: "ALL NODES",   color: "#00c8ff" },
            { key: "connected",    label: "LIVE",        color: "#00e8a8" },
            { key: "coming_soon",  label: "EXPANDING",   color: "#f59e0b" },
          ] as const).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                background: filter === key ? `${color}18` : "rgba(0,10,24,0.78)",
                border: `1px solid ${filter === key ? color + "50" : "rgba(0,180,220,0.1)"}`,
                backdropFilter: "blur(12px)",
                borderRadius: 4,
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 9,
                color: filter === key ? color : "rgba(160,210,230,0.45)",
                letterSpacing: 2,
                textAlign: "left",
                transition: "all 0.2s ease",
              }}
            >
              {filter === key ? "▶ " : "  "}{label}
            </button>
          ))}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { fn: () => ctrlRef.current?.zoomIn(),     icon: "+", title: "Zoom In" },
              { fn: () => ctrlRef.current?.zoomOut(),    icon: "−", title: "Zoom Out" },
              { fn: () => ctrlRef.current?.focusKenya(), icon: "◎", title: "Focus Kenya" },
            ].map(({ fn, icon, title }) => (
              <button
                key={title}
                onClick={fn}
                title={title}
                style={{
                  background: "rgba(0,10,24,0.82)",
                  border: "1px solid rgba(0,180,220,0.12)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 4,
                  width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 18, color: "#00c8e8",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,240,0.12)"; e.currentTarget.style.borderColor = "rgba(0,200,240,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,10,24,0.82)"; e.currentTarget.style.borderColor = "rgba(0,180,220,0.12)"; }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom-right: country coverage list ── */}
      {phase >= 3 && (
        <div style={{
          position: "absolute", bottom: 18, right: 18, zIndex: 20,
          animation: "hudIn 0.6s 0.5s ease both",
        }}>
          <div style={{
            background: "rgba(0,10,24,0.88)",
            border: "1px solid rgba(0,180,220,0.12)",
            backdropFilter: "blur(16px)",
            borderRadius: 4,
            padding: "12px 16px",
            minWidth: 200,
          }}>
            <div style={{ fontSize: 8, color: "rgba(0,200,240,0.4)", letterSpacing: 2, marginBottom: 10 }}>COVERAGE · BY COUNTRY</div>
            {countries.map(country => {
              const live  = LOCATIONS.filter(l => l.country === country && l.status === "connected").length;
              const total = LOCATIONS.filter(l => l.country === country).length;
              const pct   = Math.round((live / total) * 100);
              return (
                <div key={country} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: "rgba(180,220,240,0.65)", letterSpacing: 1 }}>{country.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: pct === 100 ? "#00e8a8" : pct > 50 ? "#00c8ff" : "#f59e0b", fontWeight: 700 }}>
                      {live}/{total}
                    </span>
                  </div>
                  <div style={{ height: 2, background: "rgba(0,180,220,0.1)", borderRadius: 1 }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct === 100 ? "#00e8a8" : pct > 50 ? "#00c8ff" : "#f59e0b",
                      borderRadius: 1,
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom-left: legend + selected card ── */}
      {phase >= 2 && (
        <div style={{
          position: "absolute", bottom: 18, left: 18, zIndex: 20,
          display: "flex", flexDirection: "column", gap: 6,
          animation: "hudIn 0.6s 0.3s ease both",
        }}>
          {/* Legend */}
          <div style={{
            background: "rgba(0,10,24,0.82)",
            border: "1px solid rgba(0,180,220,0.12)",
            backdropFilter: "blur(14px)",
            borderRadius: 4,
            padding: "10px 14px",
          }}>
            <div style={{ fontSize: 8, color: "rgba(0,200,240,0.4)", letterSpacing: 2, marginBottom: 8 }}>NODE LEGEND</div>
            {[
              { color: "#00e8ff", label: "Hub  (10Gbps+)",   size: 10 },
              { color: "#00b8e8", label: "Node (1Gbps)",     size: 7 },
              { color: "#0090c8", label: "Micro (500Mbps)",  size: 5 },
              { color: "#f59e0b", label: "Expanding Soon",   size: 7 },
            ].map(({ color, label, size }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: "rgba(180,220,240,0.55)", letterSpacing: 0.5 }}>{label}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(0,180,220,0.08)", marginTop: 8, paddingTop: 8 }}>
              {[
                { color: "#00d8ff", label: "Fiber Backbone" },
                { color: "#0060a0", label: "Satellite Route" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 18, height: 1.5, background: color, borderRadius: 1, boxShadow: `0 0 4px ${color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: "rgba(180,220,240,0.45)", letterSpacing: 0.5 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected location detail */}
          {selected && (
            <div style={{
              background: "rgba(0,10,24,0.92)",
              border: `1px solid ${selected.status === "connected" ? "rgba(0,230,160,0.3)" : "rgba(245,158,11,0.3)"}`,
              backdropFilter: "blur(18px)",
              borderRadius: 4,
              padding: "12px 16px",
              minWidth: 220,
              animation: "hudIn 0.2s ease both",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e0f0ff", letterSpacing: 1 }}>{selected.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(0,200,240,0.5)", letterSpacing: 1, marginTop: 1 }}>
                    {selected.county} · {selected.country.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", color: "rgba(0,200,240,0.3)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                >×</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 10 }}>
                {([
                  ["SPEED",  selected.speed ?? "—"],
                  ["TYPE",   selected.type  ?? "—"],
                  ["TIER",   (selected.tier ?? "—").toUpperCase()],
                  ["LAT",    selected.lat.toFixed(3) + "°"],
                  ["LNG",    selected.lng.toFixed(3) + "°"],
                  ["STATUS", selected.status === "connected" ? "LIVE" : "SOON"],
                ] as [string,string][]).map(([k,v]) => (
                  <div key={k} style={{ background: "rgba(0,180,220,0.04)", borderRadius: 2, padding: "4px 6px" }}>
                    <div style={{ fontSize: 7, color: "rgba(0,180,220,0.35)", letterSpacing: 1.5 }}>{k}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      color: k === "STATUS" ? (selected.status === "connected" ? "#00e8a8" : "#f59e0b") : "#c0e0f8",
                      marginTop: 1, letterSpacing: 0.5,
                    }}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.status === "connected" && (
                <button style={{
                  width: "100%",
                  background: "linear-gradient(135deg, rgba(0,180,180,0.2), rgba(0,100,180,0.2))",
                  border: "1px solid rgba(0,200,220,0.3)",
                  color: "#00e0f0",
                  padding: "7px",
                  borderRadius: 3,
                  fontSize: 9,
                  letterSpacing: 2,
                  cursor: "pointer",
                  fontFamily: "'Courier New',monospace",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,200,220,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,180,180,0.2), rgba(0,100,180,0.2))"; }}
                >
                  ▶ VIEW PLANS &amp; PRICING
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Corner bracket decorations ── */}
      {phase >= 2 && (
        <>
          {[
            { top: 0,    left: 0,    borderTop: "2px solid", borderLeft: "2px solid",   w: 24, h: 24 },
            { top: 0,    right: 0,   borderTop: "2px solid", borderRight: "2px solid",  w: 24, h: 24 },
            { bottom: 0, left: 0,    borderBottom: "2px solid", borderLeft: "2px solid", w: 24, h: 24 },
            { bottom: 0, right: 0,   borderBottom: "2px solid", borderRight: "2px solid", w: 24, h: 24 },
          ].map((s, i) => (
            <div key={i} style={{
              position: "absolute",
              ...s,
              width: s.w, height: s.h,
              borderColor: "rgba(0,200,240,0.25)",
              zIndex: 15, pointerEvents: "none",
            }} />
          ))}
        </>
      )}

      {/* ── Bottom-center: instruction hint ── */}
      {phase >= 3 && !selected && (
        <div style={{
          position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
          zIndex: 20, pointerEvents: "none",
          animation: "hudIn 0.8s 1s ease both",
        }}>
          <div style={{
            background: "rgba(0,10,24,0.7)",
            border: "1px solid rgba(0,180,220,0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: 20,
            padding: "5px 20px",
            fontSize: 9, color: "rgba(0,180,220,0.4)",
            letterSpacing: 2,
          }}>
            DRAG TO ROTATE · SCROLL TO ZOOM · CLICK NODE TO INSPECT
          </div>
        </div>
      )}

      <style>{`
        @keyframes hudIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default VilcomCoverageMap;