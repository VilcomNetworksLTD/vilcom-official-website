import { useState, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CheckCircle, Clock, Wifi, MapPin, Plus, Minus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoverageLocation {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed?: string;
  type?: string;
}

interface KenyaGlobe3DProps {
  onSelectLocation?: (loc: CoverageLocation | null) => void;
  selectedLocation?: CoverageLocation | null;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const locations: CoverageLocation[] = [
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

// ─── Leaflet dynamic loader ───────────────────────────────────────────────────
let _leafletLoaded = false;
let _leafletPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (_leafletLoaded) return Promise.resolve();
  if (_leafletPromise) return _leafletPromise;

  _leafletPromise = new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => { _leafletLoaded = true; resolve(); };
    document.head.appendChild(script);
  });

  return _leafletPromise;
}

// ─── THREE.js Globe (Phase 0) ─────────────────────────────────────────────────
const latLngToVector3 = (lat: number, lng: number, radius = 2): THREE.Vector3 => {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
  );
};

const KENYA_CENTER = new THREE.Vector3(0.8, 0.1, 0);

const Globe = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048; canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;


    // Ocean - Sky blue color
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0,   "#87CEEB");
    g.addColorStop(0.5, "#B0E0E6");
    g.addColorStop(1,   "#87CEEB");
    ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses (simplified blobs)
    const lands = [
      // Africa
      { x: 0.52, y: 0.50, rx: 0.13, ry: 0.24, rot: 0.1 },
      // Europe
      { x: 0.49, y: 0.28, rx: 0.07, ry: 0.09, rot: 0 },
      // Asia
      { x: 0.63, y: 0.32, rx: 0.16, ry: 0.15, rot: -0.1 },
      // North America
      { x: 0.20, y: 0.32, rx: 0.13, ry: 0.16, rot: 0.15 },
      // South America
      { x: 0.27, y: 0.60, rx: 0.07, ry: 0.16, rot: 0.05 },
      // Australia
      { x: 0.76, y: 0.63, rx: 0.07, ry: 0.06, rot: 0 },
    ];

    lands.forEach(({ x, y, rx, ry, rot }) => {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.translate(x * canvas.width, y * canvas.height);
      ctx.rotate(rot);
      const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * canvas.width);
      lg.addColorStop(0, "#2e6e3e");
      lg.addColorStop(1, "#1a4a28");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * canvas.width, ry * canvas.height, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Grid lines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#a0c4ff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const x = (i / 12) * canvas.width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const y = (i / 6) * canvas.height;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0015;
  });

  return (
    <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial map={texture} specular={new THREE.Color(0x222222)} shininess={10} />
    </mesh>
  );
};

const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.12, 64, 64]} />
    <shaderMaterial
      transparent
      side={THREE.BackSide}
      vertexShader={`
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec3 vNormal;
        void main() {
          float i = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.2, 0.55, 1.0, 1.0) * i * 1.4;
        }
      `}
    />
  </mesh>
);

const Stars = () => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < 1500; i++) {
      p.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
    }
    return new Float32Array(p);
  }, []);

  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0001; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={0xffffff} size={0.025} transparent opacity={0.7} />
    </points>
  );
};

// Camera zoom animation
const CameraController = ({ onComplete }: { onComplete: () => void }) => {
  const { camera } = useThree();
  const doneRef = useRef(false);

  useEffect(() => {
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const start = Date.now();
    const DURATION = 5500;

    const tick = () => {
      const p = Math.min((Date.now() - start) / DURATION, 1);

      if (p < 0.3) {
        // Hold
      } else if (p < 0.65) {
        const t = easeInOut((p - 0.3) / 0.35);
        camera.position.z = 8 - (8 - 4.2) * t;
        camera.position.x = 0.4 * t;
        camera.lookAt(0, 0, 0);
      } else {
        const t = easeInOut((p - 0.65) / 0.35);
        camera.position.z = 4.2 - (4.2 - 2.6) * t;
        camera.position.x = 0.4 + 0.4 * t;
        camera.position.y = 0.3 * t;
        camera.lookAt(KENYA_CENTER);
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    };

    requestAnimationFrame(tick);
  }, [camera, onComplete]);

  return null;
};

const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

// ─── Leaflet Map (Phase 2+) ───────────────────────────────────────────────────
interface LeafletMapProps {
  phase: number;
  selected: CoverageLocation | null;
  onSelect: (loc: CoverageLocation) => void;
  onMapReady?: (map: any) => void;
}

const LeafletMap = ({ phase, selected, onSelect, onMapReady }: LeafletMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadLeaflet().then(() => setReady(true)); }, []);

  // Init map
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L = (window as any).L;

    const map = L.map(containerRef.current, {
      center: [-1.286389, 36.817223],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    // Light CartoDB tiles for brighter map background
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd",
    }).addTo(map);

    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('© <a href="https://carto.com" style="color:#4a9eff">CartoDB</a> © <a href="https://openstreetmap.org" style="color:#4a9eff">OSM</a>')
      .addTo(map);

    // Custom zoom control
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;
    
    // Callback when map is ready
    if (onMapReady) {
      onMapReady(map);
    }

    // Start fly-in
    setTimeout(() => {
      map.flyTo([-1.286389, 37.5], 6.2, { duration: 2.0, easeLinearity: 0.35 });
    }, 200);

    return () => { map.remove(); mapRef.current = null; };
  }, [ready]);

  // Add markers when phase = 2
  useEffect(() => {
    if (!ready || !mapRef.current || phase < 2) return;
    const L = (window as any).L;
    const map = mapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Final zoom
    map.flyTo([-1.1, 37.3], 7.2, { duration: 1.4, easeLinearity: 0.3 });

    locations.forEach(loc => {
      const isLive = loc.status === "connected";
      const color  = isLive ? "#00d4aa" : "#f59e0b";
      const bgFill = isLive ? "rgba(0,212,170,0.12)" : "rgba(245,158,11,0.10)";

      // Coverage radius pulse
      const circle = L.circle([loc.lat, loc.lng], {
        radius: 7500,
        color,
        fillColor: bgFill,
        fillOpacity: 1,
        weight: 1.2,
        opacity: 0.55,
      }).addTo(map);

      // Dot marker
      const icon = L.divIcon({
        html: `
          <div style="position:relative;width:20px;height:20px">
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:10px;height:10px;border-radius:50%;
              background:${color};
              box-shadow:0 0 10px ${color},0 0 4px ${color};
              z-index:2;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:20px;height:20px;border-radius:50%;
              border:1.5px solid ${color};
              opacity:0.6;
              animation:mapRing 2s ease-out infinite;
            "></div>
          </div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(map)
        .on("click", () => onSelect(loc));

      // Name label
      const label = L.divIcon({
        html: `<div style="
          background:rgba(8,14,28,0.88);
          color:rgba(210,230,255,0.9);
          font-size:10px;font-family:'SF Mono',monospace;
          letter-spacing:0.4px;padding:2px 7px;
          border-radius:4px;border:1px solid rgba(255,255,255,0.07);
          white-space:nowrap;backdrop-filter:blur(6px);
          pointer-events:none;
        ">${loc.name}</div>`,
        className: "",
        iconAnchor: [-14, 8] as [number, number],
      });
      const labelMarker = L.marker([loc.lat, loc.lng], { icon: label, interactive: false }).addTo(map);

      markersRef.current.push(circle, marker, labelMarker);
    });

    // Nairobi cluster connection lines
    const nairobi = locations.filter(l => l.county === "Nairobi" && l.status === "connected");
    for (let i = 0; i < nairobi.length - 1; i++) {
      const line = L.polyline(
        [[nairobi[i].lat, nairobi[i].lng], [nairobi[i + 1].lat, nairobi[i + 1].lng]],
        { color: "rgba(0,212,170,0.18)", weight: 1.2, dashArray: "4 7" }
      ).addTo(map);
      markersRef.current.push(line);
    }
  }, [phase, ready, onSelect]);

  // Pan to selected
  useEffect(() => {
    if (!mapRef.current || !selected || phase < 2) return;
    mapRef.current.flyTo([selected.lat, selected.lng], 13, { duration: 1.1, easeLinearity: 0.3 });
  }, [selected, phase]);

  return (
    <>
      <div ref={containerRef} style={{
        position: "absolute", inset: 0,
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 1s ease",
      }} />
      <style>{`
        @keyframes mapRing {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
        }
        .leaflet-container { background: transparent !important; }
        .leaflet-control-zoom a {
          background: rgba(10,16,30,0.92) !important;
          border-color: rgba(255,255,255,0.08) !important;
          color: rgba(200,220,255,0.7) !important;
        }
        .leaflet-control-attribution {
          background: rgba(8,14,26,0.8) !important;
          color: rgba(150,180,220,0.5) !important;
          font-size: 9px !important;
        }
      `}</style>
    </>
  );
};

// ─── THREE Scene (globe phase) ────────────────────────────────────────────────
interface SceneProps {
  onZoomComplete: () => void;
}

const Scene = ({ onZoomComplete }: SceneProps) => (
  <>
    <CameraController onComplete={onZoomComplete} />
    <ambientLight intensity={0.5} />
    <pointLight position={[6, 4, 6]} intensity={1.2} />
    <Globe />
    <Atmosphere />
    <Stars />
  </>
);

// ─── Phase label ──────────────────────────────────────────────────────────────
const phaseLabels = ["Viewing Earth…", "Zooming to Africa…", "Focusing on Kenya…", ""];

// ─── Main export ─────────────────────────────────────────────────────────────
const KenyaGlobe3D = ({ onSelectLocation, selectedLocation }: KenyaGlobe3DProps) => {
  // phase: 0 = globe spinning, 1 = globe zoomed + map fading in, 2 = map with markers, 3 = settled
  const [phase, setPhase] = useState(0);
  const [labelIdx, setLabelIdx] = useState(0);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Drive phase label cycling during globe animation
  useEffect(() => {
    const t1 = setTimeout(() => setLabelIdx(1), 1800);
    const t2 = setTimeout(() => setLabelIdx(2), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleZoomComplete = useCallback(() => {
    setPhase(1);           // start fading in map
    setTimeout(() => setPhase(2), 800);   // show markers
    setTimeout(() => setPhase(3), 2500);  // fully settled
  }, []);

  const handleSelect = useCallback((loc: CoverageLocation) => {
    onSelectLocation?.(selectedLocation?.name === loc.name ? null : loc);
  }, [onSelectLocation, selectedLocation]);

  const handleMapReady = useCallback((map: any) => {
    setMapInstance(map);
  }, []);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    if (mapInstance) {
      mapInstance.zoomIn(1, { animate: true });
    }
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (mapInstance) {
      mapInstance.zoomOut(1, { animate: true });
    }
  }, [mapInstance]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#070e1a", overflow: "hidden" }}>

      {/* ── THREE.js canvas (always rendered, fades out after phase 1) ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        opacity: phase >= 1 ? 0 : 1,
        transition: "opacity 1.2s ease",
        pointerEvents: phase >= 1 ? "none" : "auto",
      }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true }}>
          <color attach="background" args={["#070e1a"]} />
          <Scene onZoomComplete={handleZoomComplete} />
        </Canvas>
      </div>

      {/* ── Leaflet map (mounts from phase 1) ── */}
      {phase >= 1 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <LeafletMap phase={phase} selected={selectedLocation ?? null} onSelect={handleSelect} onMapReady={handleMapReady} />
        </div>
      )}

      {/* ── Phase progress indicator (globe phase) ── */}
      {phase < 3 && phase === 0 && (
        <div style={{
          position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(8,14,28,0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,212,170,0.2)",
          borderRadius: 24, padding: "8px 22px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#00d4aa",
            boxShadow: "0 0 8px #00d4aa",
            animation: "pulse 1.2s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: 11, color: "rgba(180,220,255,0.85)",
            letterSpacing: 1.5, fontFamily: "'SF Mono','Courier New',monospace",
            textTransform: "uppercase",
          }}>
            {phaseLabels[labelIdx]}
          </span>
        </div>
      )}

      {/* ── Transitioning label ── */}
      {phase === 1 && (
        <div style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(8,14,28,0.9)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,212,170,0.2)",
          borderRadius: 20, padding: "7px 20px",
          fontSize: 11, color: "#00d4aa",
          letterSpacing: 2, fontFamily: "'SF Mono',monospace",
          animation: "fadeIn 0.4s ease",
        }}>
          ◎ LOCATING KENYA…
        </div>
      )}

      {/* ── Map overlays (phase 2+) ── */}
      {phase >= 2 && (
        <>
          {/* Custom Zoom Controls - Top Right */}
          <div style={{
            position: "absolute", top: 14, left: 14, zIndex: 10,
            display: "flex", flexDirection: "column", gap: 4,
            animation: "fadeSlideIn 0.4s ease",
          }}>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                width: 36, height: 36,
                background: "rgba(8,14,28,0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,212,170,0.15)";
                e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(8,14,28,0.92)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <Plus size={18} color="#00d4aa" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                width: 36, height: 36,
                background: "rgba(8,14,28,0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "0 0 8px 8px",
                borderTop: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,212,170,0.15)";
                e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(8,14,28,0.92)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <Minus size={18} color="#00d4aa" />
            </button>
          </div>

          {/* Legend top-right */}
          <div style={{
            position: "absolute", top: 14, right: 14, zIndex: 10,
            background: "rgba(8,14,28,0.92)", backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, padding: "10px 14px",
            animation: "fadeSlideIn 0.4s ease",
          }}>
            <div style={{ fontSize: 9, color: "rgba(180,210,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
              Coverage
            </div>
            {[
              { color: "#00d4aa", label: "Live" },
              { color: "#f59e0b", label: "Coming Soon" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "rgba(200,225,255,0.65)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* County quick stats bottom-right */}
          <div style={{
            position: "absolute", bottom: 52, right: 14, zIndex: 10,
            background: "rgba(8,14,28,0.92)", backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, padding: "10px 14px",
            animation: "fadeSlideIn 0.5s ease",
          }}>
            <div style={{ fontSize: 9, color: "rgba(180,210,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>
              Counties
            </div>
            {[...new Set(locations.map(l => l.county))].map(county => (
              <div key={county} style={{ display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "rgba(200,225,255,0.6)" }}>{county}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#00d4aa", fontFamily: "monospace" }}>
                  {locations.filter(l => l.county === county && l.status === "connected").length}
                </span>
              </div>
            ))}
          </div>

          {/* Selected location card */}
          {selectedLocation && (
            <div style={{
              position: "absolute", bottom: 52, left: 14, zIndex: 10,
              background: "rgba(8,14,28,0.94)", backdropFilter: "blur(16px)",
              border: `1px solid ${selectedLocation.status === "connected" ? "rgba(0,212,170,0.25)" : "rgba(245,158,11,0.25)"}`,
              borderRadius: 12, padding: "14px 16px", minWidth: 200,
              animation: "fadeSlideIn 0.25s ease",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f0fe", marginBottom: 2 }}>
                {selectedLocation.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(180,210,255,0.5)", marginBottom: 10 }}>
                {selectedLocation.county} County
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {[
                  ["Speed",  selectedLocation.speed  ?? "—"],
                  ["Type",   selectedLocation.type   ?? "—"],
                  ["Lat",    selectedLocation.lat.toFixed(4) + "°"],
                  ["Lng",    selectedLocation.lng.toFixed(4) + "°"],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "5px 8px" }}>
                    <div style={{ fontSize: 9, color: "rgba(180,210,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#e2eaf4", fontFamily: "'SF Mono',monospace", marginTop: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                background: selectedLocation.status === "connected" ? "rgba(0,212,170,0.12)" : "rgba(245,158,11,0.12)",
                border: `1px solid ${selectedLocation.status === "connected" ? "rgba(0,212,170,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                {selectedLocation.status === "connected"
                  ? <><CheckCircle size={11} color="#00d4aa" /><span style={{ fontSize: 11, color: "#00d4aa", fontWeight: 600 }}>Available Now</span></>
                  : <><Clock size={11} color="#f59e0b" /><span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>Coming Soon</span></>
                }
              </div>
              {selectedLocation.status === "connected" && (
                <button style={{
                  marginTop: 10, width: "100%",
                  background: "linear-gradient(135deg,#00d4aa,#0080ff)",
                  border: "none", color: "white",
                  padding: "8px", borderRadius: 7,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                  <Wifi size={12} /> View Plans →
                </button>
              )}
            </div>
          )}

          {/* Connection type pills bottom */}
          <div style={{
            position: "absolute", bottom: 14, left: 14, zIndex: 10,
            display: "flex", gap: 6,
            animation: "fadeSlideIn 0.6s ease",
          }}>
            {(["Fiber", "Wireless"] as const).map(type => (
              <div key={type} style={{
                background: "rgba(8,14,28,0.88)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 7, padding: "4px 12px",
                fontSize: 11, color: "rgba(180,215,255,0.6)",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <MapPin size={10} />
                {type}: {locations.filter(l => l.type === type).length}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Hint (settled phase) ── */}
      {phase >= 3 && (
        <div style={{
          position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(8,14,28,0.82)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "5px 16px",
          fontSize: 10, color: "rgba(160,200,255,0.45)",
          letterSpacing: 1, fontFamily: "'SF Mono',monospace",
          animation: "fadeIn 0.8s ease",
        }}>
          CLICK A NODE TO EXPLORE
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.2); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default KenyaGlobe3D;