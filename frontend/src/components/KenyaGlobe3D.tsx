import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── Types ──────────────────────────────────────────────────────────────────
interface CoverageLocation {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed?: string;
  type?: string;
  tier?: "hub" | "node" | "micro";
}

// ─── Coverage Data ───────────────────────────────────────────────────────────
const LOCATIONS: CoverageLocation[] = [
  { name: "Westlands",   county: "Nairobi",     status: "connected",   lat: -1.2637, lng: 36.8063, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Kilimani",    county: "Nairobi",     status: "connected",   lat: -1.2915, lng: 36.7823, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Karen",       county: "Nairobi",     status: "connected",   lat: -1.3197, lng: 36.7073, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Lavington",   county: "Nairobi",     status: "connected",   lat: -1.2769, lng: 36.7693, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Kileleshwa",  county: "Nairobi",     status: "connected",   lat: -1.2838, lng: 36.7876, speed: "500Mbps", type: "Wireless", tier: "micro" },
  { name: "Parklands",   county: "Nairobi",     status: "connected",   lat: -1.2606, lng: 36.8219, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Upper Hill",  county: "Nairobi",     status: "connected",   lat: -1.2983, lng: 36.8146, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "CBD Nairobi", county: "Nairobi",     status: "connected",   lat: -1.2833, lng: 36.8167, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Runda",       county: "Nairobi",     status: "coming_soon", lat: -1.2189, lng: 36.8156, speed: "1Gbps",   type: "Fiber",    tier: "node" },
  { name: "Langata",     county: "Nairobi",     status: "coming_soon", lat: -1.3614, lng: 36.7422, speed: "500Mbps", type: "Wireless", tier: "micro" },
  { name: "Nyali",       county: "Mombasa",     status: "connected",   lat: -4.0375, lng: 39.7208, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Mombasa CBD", county: "Mombasa",     status: "connected",   lat: -4.0435, lng: 39.6682, speed: "10Gbps",  type: "Fiber",    tier: "hub" },
  { name: "Bamburi",     county: "Mombasa",     status: "coming_soon", lat: -3.9833, lng: 39.7333, speed: "500Mbps", type: "Wireless", tier: "micro" },
  { name: "Kisumu CBD",  county: "Kisumu",      status: "connected",   lat: -0.0917, lng: 34.7680, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon", lat:  0.5143, lng: 35.2698, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Nakuru",      county: "Nakuru",      status: "connected",   lat: -0.3031, lng: 36.0800, speed: "1Gbps",   type: "Fiber",    tier: "hub" },
  { name: "Thika",       county: "Kiambu",      status: "connected",   lat: -1.0332, lng: 37.0693, speed: "500Mbps", type: "Fiber",    tier: "node" },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
const latLngToVec3 = (lat: number, lng: number, r = 2): THREE.Vector3 => {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
  );
};

// ─── Real Earth Texture Loader ────────────────────────────────────────────────
const useEarthTextures = () => {
  const [textures, setTextures] = useState<{
    map: THREE.Texture | null;
    specular: THREE.Texture | null;
    clouds: THREE.Texture | null;
  }>({ map: null, specular: null, clouds: null });

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    // Use high-quality NASA Blue Marble textures via unpkg/jsdelivr CDN
    const earthMapUrl = "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
    const earthNightUrl = "https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg";
    const cloudsUrl = "https://unpkg.com/three-globe@2.31.0/example/img/earth-clouds.png";

    let loaded = 0;
    const result: typeof textures = { map: null, specular: null, clouds: null };

    const tryUpdate = () => {
      loaded++;
      if (loaded === 3) setTextures({ ...result });
    };

    loader.load(earthMapUrl, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      result.map = t;
      tryUpdate();
    }, undefined, () => {
      // Fallback: try alternative CDN
      loader.load(
        "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
        (t) => { t.colorSpace = THREE.SRGBColorSpace; result.map = t; tryUpdate(); },
        undefined,
        () => tryUpdate()
      );
    });

    loader.load(earthNightUrl, (t) => {
      result.specular = t;
      tryUpdate();
    }, undefined, () => tryUpdate());

    loader.load(cloudsUrl, (t) => {
      result.clouds = t;
      tryUpdate();
    }, undefined, () => tryUpdate());
  }, []);

  return textures;
};

// ─── Stars ───────────────────────────────────────────────────────────────────
const Stars = () => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const th  = Math.random() * Math.PI * 2;
      const r   = 20 + Math.random() * 30;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(th);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#d0e8ff" size={0.045} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
};

// ─── Atmosphere Shader ───────────────────────────────────────────────────────
const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.25, 64, 64]} />
    <shaderMaterial
      transparent side={THREE.BackSide} depthWrite={false}
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
          float i = pow(0.65 - dot(vNormal, vec3(0,0,1)), 3.5);
          gl_FragColor = vec4(0.18, 0.52, 0.92, i * 0.5);
        }
      `}
    />
  </mesh>
);

// ─── Cloud Layer ─────────────────────────────────────────────────────────────
const Clouds = ({ texture }: { texture: THREE.Texture }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.00025;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.035, 64, 64]} />
      <meshPhongMaterial
        map={texture}
        transparent
        opacity={0.38}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

// ─── Earth Globe ─────────────────────────────────────────────────────────────
const EarthGlobe = ({ mapTexture }: { mapTexture: THREE.Texture }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.00045;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 128, 128]} />
      <meshPhongMaterial
        map={mapTexture}
        specular={new THREE.Color(0x333333)}
        shininess={20}
        emissive={new THREE.Color(0x020810)}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
};

// ─── Fallback Globe (canvas texture) when CDN fails ──────────────────────────
const FallbackGlobe = () => {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => {
    const W = 2048, H = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Ocean
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0d2b52");
    grad.addColorStop(0.5, "#1a3f6f");
    grad.addColorStop(1, "#0d2b52");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const px = (lat: number, lng: number): [number, number] => [
      ((lng + 180) / 360) * W,
      ((90 - lat) / 180) * H,
    ];

    const fill = (pts: [number,number][], color: string) => {
      ctx.beginPath();
      ctx.moveTo(...px(pts[0][0], pts[0][1]));
      pts.slice(1).forEach(p => ctx.lineTo(...px(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };

    // Africa
    fill([[37,-18],[37,52],[10,52],[10,44],[-1,42],[-12,40],[-35,18],[-35,28],[-25,33],[-15,36],[0,37],[10,40],[15,40],[15,24],[22,24],[22,15],[30,15],[37,22]], "#3a5a3a");
    // Kenya highlighted
    fill([[4.2,34],[4.2,42],[1,42],[1,40.5],[-1,40.5],[-1,38.5],[-4.7,38.5],[-4.7,34]], "#5a8a5a");
    // Europe
    fill([[72,-10],[72,40],[36,40],[36,-10]], "#4a6b4a");
    // Asia
    fill([[72,26],[72,140],[0,140],[0,60],[36,26]], "#4a6b4a");
    // Americas
    fill([[72,-170],[72,-50],[0,-50],[0,-85],[15,-85],[30,-90],[72,-76],[72,-170]], "#4a6b4a");
    // Australia
    fill([[-10,113],[-10,154],[-44,154],[-44,113]], "#4a6b4a");

    // Grid
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.5;
    for (let lon = -180; lon <= 180; lon += 15) {
      const [x] = px(0, lon);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += 15) {
      const [, y] = px(lat, 0);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.00045; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 96, 96]} />
      <meshPhongMaterial map={texture} shininess={15} emissive={new THREE.Color(0x010508)} emissiveIntensity={0.1} />
    </mesh>
  );
};

// ─── Network Node ─────────────────────────────────────────────────────────────
const NetworkNode = ({
  loc, isSelected, onClick
}: {
  loc: CoverageLocation;
  isSelected: boolean;
  onClick: (l: CoverageLocation) => void;
}) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const offset  = useMemo(() => Math.random() * Math.PI * 2, []);

  const pos = useMemo(() => {
    const v = latLngToVec3(loc.lat, loc.lng, 2.03);
    return [v.x, v.y, v.z] as [number, number, number];
  }, [loc]);

  const isHub  = loc.tier === "hub";
  const isLive = loc.status === "connected";
  const color  = isSelected ? "#ffffff" : isLive ? (isHub ? "#00eeff" : "#00b8e8") : "#f59e0b";
  const size   = isHub ? 0.048 : loc.tier === "node" ? 0.03 : 0.02;
  const pulse  = isHub ? 1.8 : 2.6;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + offset;
    if (coreRef.current) {
      const s = 1 + Math.sin(t * pulse) * (isHub ? 0.2 : 0.13);
      coreRef.current.scale.setScalar(s);
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * pulse * 0.7) * 0.28;
      glowRef.current.scale.setScalar(s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        (isHub ? 0.2 : 0.12) + Math.sin(t * pulse) * 0.07;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2.2, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh
        ref={coreRef}
        onClick={e => { e.stopPropagation(); onClick(loc); }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={()  => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[size, 14, 14]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

// ─── Fiber Arc ────────────────────────────────────────────────────────────────
const FiberArc = ({
  from, to, color = "#00c8ff", opacity = 0.5, arcHeight = 0.2, speed = 1
}: {
  from: [number,number]; to: [number,number];
  color?: string; opacity?: number; arcHeight?: number; speed?: number;
}) => {
  const ref   = useRef<any>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  const geometry = useMemo(() => {
    const sv  = latLngToVec3(from[0], from[1], 2.01);
    const ev  = latLngToVec3(to[0], to[1], 2.01);
    const mid = sv.clone().add(ev).multiplyScalar(0.5);
    const dist = sv.distanceTo(ev);
    mid.normalize().multiplyScalar(2 + dist * arcHeight);
    const curve = new THREE.QuadraticBezierCurve3(sv, mid, ev);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  }, [from, to, arcHeight]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.LineBasicMaterial).opacity =
      opacity * (0.55 + 0.45 * Math.sin(t * speed * 1.6 + offset));
  });

  return (
    // @ts-ignore
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} depthWrite={false} />
    </line>
  );
};

// ─── Network Arcs ─────────────────────────────────────────────────────────────
const NetworkArcs = ({ locations }: { locations: CoverageLocation[] }) => {
  const arcs = useMemo(() => {
    const result: { from:[number,number]; to:[number,number]; color:string; opacity:number; speed:number; arcHeight:number }[] = [];
    const live = locations.filter(l => l.status === "connected");
    const hubs = live.filter(l => l.tier === "hub");

    hubs.forEach((a, i) => {
      hubs.forEach((b, j) => {
        if (i >= j) return;
        result.push({ from:[a.lat,a.lng], to:[b.lat,b.lng], color:"#00d8ff", opacity:0.5, speed:0.9, arcHeight:0.25 });
      });
    });

    hubs.forEach(hub => {
      live.filter(l => l.tier !== "hub").forEach(node => {
        const d = Math.hypot(hub.lat - node.lat, hub.lng - node.lng);
        if (d < 15) {
          result.push({ from:[hub.lat,hub.lng], to:[node.lat,node.lng], color:"#40c0e0", opacity:0.3, speed:1.3, arcHeight:0.12 });
        }
      });
    });

    return result;
  }, [locations]);

  return (
    <group>
      {arcs.map((a, i) => <FiberArc key={i} {...a} />)}
    </group>
  );
};

// ─── Camera Rig ───────────────────────────────────────────────────────────────
const CameraInit = () => {
  const { camera } = useThree();
  useEffect(() => {
    // Start focused on East Africa / Kenya
    const target = latLngToVec3(-1, 37, 6.5);
    camera.position.set(target.x, target.y, target.z);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
};

// ─── HUD Overlay ─────────────────────────────────────────────────────────────
const HUDOverlay = ({
  selected, onClose, liveCount, soonCount
}: {
  selected: CoverageLocation | null;
  onClose: () => void;
  liveCount: number;
  soonCount: number;
}) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
      {/* Top-left brand */}
      <div style={{
        position: "absolute", top: 16, left: 16,
        background: "rgba(2,8,24,0.82)",
        border: "1px solid rgba(0,200,240,0.18)",
        backdropFilter: "blur(16px)",
        borderRadius: 6, padding: "10px 14px",
        pointerEvents: "auto",
      }}>
        <div style={{
          fontSize: 18, fontWeight: 900, letterSpacing: 4,
          background: "linear-gradient(135deg, #00e0ff, #0080d8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>VILCOM</div>
        <div style={{ fontSize: 8, color: "rgba(0,200,230,0.5)", letterSpacing: 3, marginTop: 1 }}>
          NETWORKS · KENYA
        </div>
      </div>

      {/* Top-right stats */}
      <div style={{
        position: "absolute", top: 16, right: 16,
        display: "flex", flexDirection: "column", gap: 5,
        pointerEvents: "none",
      }}>
        {[
          { label: "LIVE ZONES", value: liveCount, color: "#00e8a8" },
          { label: "EXPANDING",  value: soonCount, color: "#f59e0b" },
          { label: "UPTIME",     value: "99.97%",  color: "#00c8ff" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "rgba(2,8,24,0.82)",
            border: "1px solid rgba(0,180,220,0.12)",
            backdropFilter: "blur(12px)",
            borderRadius: 4, padding: "6px 12px",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20,
            minWidth: 150,
          }}>
            <span style={{ fontSize: 8, color: "rgba(160,200,220,0.5)", letterSpacing: 1.5, fontFamily: "monospace" }}>{label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "monospace", letterSpacing: 1 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Bottom center hint */}
      {!selected && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          background: "rgba(2,8,24,0.7)",
          border: "1px solid rgba(0,180,220,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 20, padding: "5px 18px",
          fontSize: 9, color: "rgba(0,180,220,0.45)",
          letterSpacing: 2, fontFamily: "monospace", whiteSpace: "nowrap",
        }}>
          DRAG TO ROTATE · SCROLL TO ZOOM · CLICK NODE TO INSPECT
        </div>
      )}

      {/* Selected location card */}
      {selected && (
        <div style={{
          position: "absolute", bottom: 20, left: 20,
          background: "rgba(2,8,24,0.94)",
          border: `1px solid ${selected.status === "connected" ? "rgba(0,230,160,0.3)" : "rgba(245,158,11,0.3)"}`,
          backdropFilter: "blur(18px)",
          borderRadius: 6, padding: "14px 16px", minWidth: 220,
          pointerEvents: "auto",
          animation: "slideIn 0.25s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e0f0ff", letterSpacing: 0.5 }}>{selected.name}</div>
              <div style={{ fontSize: 10, color: "rgba(0,200,240,0.5)", letterSpacing: 1, marginTop: 2 }}>
                {selected.county} · KENYA
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "none", border: "none", color: "rgba(0,200,240,0.4)",
              cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
            }}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            {([
              ["SPEED",  selected.speed ?? "—"],
              ["TYPE",   selected.type ?? "—"],
              ["TIER",   (selected.tier ?? "—").toUpperCase()],
              ["STATUS", selected.status === "connected" ? "LIVE" : "SOON"],
            ] as [string,string][]).map(([k,v]) => (
              <div key={k} style={{ background: "rgba(0,180,220,0.05)", borderRadius: 3, padding: "5px 8px" }}>
                <div style={{ fontSize: 7, color: "rgba(0,180,220,0.4)", letterSpacing: 1.5, fontFamily: "monospace" }}>{k}</div>
                <div style={{
                  fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                  color: k === "STATUS" ? (selected.status === "connected" ? "#00e8a8" : "#f59e0b") : "#c0e0f8",
                  marginTop: 2,
                }}>{v}</div>
              </div>
            ))}
          </div>
          {selected.status === "connected" && (
            <button style={{
              width: "100%",
              background: "linear-gradient(135deg, rgba(0,180,180,0.2), rgba(0,100,180,0.2))",
              border: "1px solid rgba(0,200,220,0.3)",
              color: "#00e0f0", padding: "7px",
              borderRadius: 3, fontSize: 9, letterSpacing: 2,
              cursor: "pointer", fontFamily: "monospace", transition: "all 0.2s",
            }}>
              ▶ VIEW PLANS & PRICING
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 20, right: 20,
        background: "rgba(2,8,24,0.82)",
        border: "1px solid rgba(0,180,220,0.12)",
        backdropFilter: "blur(14px)",
        borderRadius: 4, padding: "10px 14px",
        pointerEvents: "none",
      }}>
        <div style={{ fontSize: 8, color: "rgba(0,200,240,0.4)", letterSpacing: 2, marginBottom: 8, fontFamily: "monospace" }}>NODE LEGEND</div>
        {[
          { color: "#00eeff", label: "Hub (10Gbps+)", size: 10 },
          { color: "#00b8e8", label: "Node (1Gbps)",  size: 7 },
          { color: "#0090c8", label: "Micro (500M)",  size: 5 },
          { color: "#f59e0b", label: "Expanding",     size: 7 },
        ].map(({ color, label, size }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "rgba(180,220,240,0.55)", fontFamily: "monospace" }}>{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Loading Overlay ─────────────────────────────────────────────────────────
const LoadingOverlay = ({ loaded }: { loaded: boolean }) => {
  if (loaded) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      background: "radial-gradient(ellipse at 40% 50%, #050d1a 0%, #020810 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
      transition: "opacity 0.5s",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "3px solid rgba(0,200,240,0.2)",
        borderTopColor: "#00c8f0",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 11, color: "rgba(0,200,240,0.5)", letterSpacing: 3, fontFamily: "monospace" }}>
        LOADING EARTH TEXTURE
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Main 3D Scene ────────────────────────────────────────────────────────────
const Scene = ({
  textures, selected, onSelect
}: {
  textures: { map: THREE.Texture | null; specular: THREE.Texture | null; clouds: THREE.Texture | null };
  selected: CoverageLocation | null;
  onSelect: (l: CoverageLocation) => void;
}) => (
  <>
    <ambientLight intensity={0.3} />
    <directionalLight position={[8, 4, 6]}  intensity={1.2}  color="#ffffff" />
    <directionalLight position={[-5,-3,-5]} intensity={0.12} color="#1a3a80" />
    <pointLight       position={[0, 0, 6]}  intensity={0.25} color="#0060a0" />

    <Stars />

    {textures.map ? (
      <EarthGlobe mapTexture={textures.map} />
    ) : (
      <FallbackGlobe />
    )}

    <Atmosphere />

    {textures.clouds && <Clouds texture={textures.clouds} />}

    <NetworkArcs locations={LOCATIONS} />

    {LOCATIONS.map((loc, i) => (
      <NetworkNode
        key={i}
        loc={loc}
        isSelected={selected?.name === loc.name}
        onClick={onSelect}
      />
    ))}

    <CameraInit />

    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={2.8}
      maxDistance={14}
      zoomSpeed={0.8}
      rotateSpeed={0.55}
      target={[0, 0, 0]}
    />
  </>
);

// ─── KenyaGlobe3D — Main Export ───────────────────────────────────────────────
const KenyaGlobe3D = ({ style }: { style?: React.CSSProperties }) => {
  const [selected, setSelected] = useState<CoverageLocation | null>(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const textures = useEarthTextures();

  useEffect(() => {
    // Consider "loaded" once we've had a chance to load (with or without real texture)
    const timer = setTimeout(() => setTexturesLoaded(true), 2000);
    if (textures.map) {
      setTexturesLoaded(true);
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [textures.map]);

  const liveCount = LOCATIONS.filter(l => l.status === "connected").length;
  const soonCount = LOCATIONS.filter(l => l.status === "coming_soon").length;

  const handleSelect = useCallback((loc: CoverageLocation) => {
    setSelected(prev => prev?.name === loc.name ? null : loc);
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at 40% 50%, #050d1a 0%, #020810 60%, #000308 100%)",
      overflow: "hidden",
      ...style,
    }}>
      <LoadingOverlay loaded={texturesLoaded} />

      <Canvas
        camera={{ position: [2.5, 1.5, 5.0], fov: 42 }}
        gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene textures={textures} selected={selected} onSelect={handleSelect} />
      </Canvas>

      <HUDOverlay
        selected={selected}
        onClose={() => setSelected(null)}
        liveCount={liveCount}
        soonCount={soonCount}
      />
    </div>
  );
};

export default KenyaGlobe3D;