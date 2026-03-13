import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Color Palette ─────────────────────────────────────────────────────────────
const COLORS = {
  ocean: "#1e3a5f",
  land: "#4b5e6d",
  kenyaHighlight: "#3b82f6",
  eastAfrica: "#60a5fa",
  gridLines: "rgba(255, 255, 255, 0.12)",
  equator: "#22c55e",
  tropics: "#eab308",
};

// ─── Procedural World Map Texture (Realistic Borders) ────────────────────────
const useWorldMapTexture = () => useMemo(() => {
  const W = 4096, H = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  
  // Ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, "#0f172a");
  oceanGrad.addColorStop(0.4, "#1e3a5f");
  oceanGrad.addColorStop(0.7, "#1e40af");
  oceanGrad.addColorStop(1, "#1e3a8a");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  // Lat/Lng to pixel helper
  const px = (lat: number, lng: number): [number, number] => [
    ((lng + 180) / 360) * W,
    ((90 - lat) / 180) * H
  ];

  // Continent/Country outlines (simplified but realistic)
  const fillContinent = (points: [number, number][], color: string, strokeWidth = 1.2) => {
    ctx.beginPath();
    ctx.moveTo(...px(points[0][0], points[0][1]));
    points.slice(1).forEach(([lat, lng]) => ctx.lineTo(...px(lat, lng)));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(60,80,100,0.4)";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };

  // ── Africa (Detailed) ──────────────────────────────────────────────────────
  fillContinent([
    [-18, 20], [-18, 52], [37, 52], [37, -35], [-12, -35], [-12, 20]
  ], COLORS.eastAfrica, 1.5);
  
  // Kenya highlighted
  fillContinent([
    [4.2, 34], [4.2, 41.9], [1, 41.9], [1, 40.5], [-1, 40.5], [-1, 38.5],
    [-4.6, 38.5], [-4.6, 37.7], [-4.7, 34], [4.2, 34]
  ], COLORS.kenyaHighlight, 2);

  // Uganda, Tanzania, Rwanda, etc.
  fillContinent([[4, 30], [4, 35], [0, 35], [0, 30], [4, 30]], "#93c5fd");
  fillContinent([[-12, 30], [-12, 40], [0, 40], [0, 30], [-12, 30]], "#93c5fd");

  // ── Europe ─────────────────────────────────────────────────────────────────
  fillContinent([
    [-10, 36], [-10, 72], [40, 72], [40, 36], [-10, 36]
  ], COLORS.land);
  
  // UK, Iberia, Scandinavia (detailed)
  fillContinent([[-8, 50], [-8, 62], [2, 62], [2, 50]], "#6b7280");
  fillContinent([[-9, 36], [-9, 44], [4, 44], [4, 36]], "#6b7280");

  // ── Asia ──────────────────────────────────────────────────────────────────
  fillContinent([
    [60, 26], [60, 72], [140, 72], [140, 0], [60, 0], [60, 26]
  ], COLORS.land);
  
  // India
  fillContinent([[60, 8], [60, 36], [80, 36], [80, 8]], "#6b7280");
  // Japan
  fillContinent([[128, 30], [128, 45], [146, 45], [146, 30]], "#6b7280");

  // ── Americas ──────────────────────────────────────────────────────────────
  fillContinent([
    [-170, -56], [-170, 72], [-50, 72], [-50, -56], [-170, -56]
  ], COLORS.land);
  
  fillContinent([[-135, 55], [-135, 25], [-60, 25], [-60, 55]], "#6b7280");
  fillContinent([[-82, 5], [-82, 25], [-62, 25], [-62, 5]], "#6b7280");

  // ── Australia ─────────────────────────────────────────────────────────────
  fillContinent([[113, -44], [113, -10], [154, -10], [154, -44]], COLORS.land);
  
  // ── Grid Lines ────────────────────────────────────────────────────────────
  ctx.strokeStyle = COLORS.gridLines;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.25;
  for (let lon = -180; lon <= 180; lon += 20) {
    const [x] = px(0, lon);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -80; lat <= 80; lat += 20) {
    const [, y] = px(lat, 0);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ── Equator & Tropics ─────────────────────────────────────────────────────
  ctx.strokeStyle = COLORS.equator;
  ctx.lineWidth = 2;
  const [, eqY] = px(0, 0);
  ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(W, eqY); ctx.stroke();

  ctx.strokeStyle = COLORS.tropics;
  ctx.lineWidth = 1.2;
  const [, trop1Y] = px(23.5, 0), [, trop2Y] = px(-23.5, 0);
  ctx.beginPath(); ctx.moveTo(0, trop1Y); ctx.lineTo(W, trop1Y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, trop2Y); ctx.lineTo(W, trop2Y); ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}, []);

// ─── Generate Realistic Earth Points ────────────────────────────────────────
const generateEarthPoints = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  let idx = 0;

  // Real city distribution (major population centers)
  const cities = [
    [-1.29, 36.82, 0.25],   // Nairobi
    [51.51, -0.13, 0.22],   // London
    [40.71, -74.01, 0.20],  // NYC
    [48.86, 2.35, 0.18],    // Paris
    [35.68, 139.77, 0.19],  // Tokyo
    [1.35, 103.82, 0.15],   // Singapore
  ];
  
  // Add major cities first
  cities.forEach(([lat, lng, weight]) => {
    for (let i = 0; i < count * weight; i++) {
      const phi = (90 - lat) * (Math.PI / 180) + (Math.random() - 0.5) * 0.3;
      const theta = (lng + 180) * (Math.PI / 180) + (Math.random() - 0.5) * 0.3;
      const r = 2;
      positions[idx++] = -(r * Math.sin(phi) * Math.cos(theta));
      positions[idx++] = r * Math.cos(phi);
      positions[idx++] = r * Math.sin(phi) * Math.sin(theta);
    }
  });

  // Fill remainder with continental bias
  while (idx < count * 3) {
    const lat = (Math.random() - 0.5) * 160;
    const lng = (Math.random() - 0.5) * 360;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = 2;
    positions[idx++] = -(r * Math.sin(phi) * Math.cos(theta));
    positions[idx++] = r * Math.cos(phi);
    positions[idx++] = r * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
};

// Reuse existing components (Stars, GridLines, Atmosphere, GlowRing)
const StarField = ({ count = 1200 }: { count?: number }) => {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 30 + Math.random() * 20;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame(() => ref.current.rotation.y += 0.00008);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.025} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

const generateGridLines = (): THREE.BufferGeometry => {
  const points: number[] = [];
  for (let lat = -75; lat <= 75; lat += 15) {
    const phi = (90 - lat) * (Math.PI / 180);
    const r = 2.02 * Math.sin(phi);
    const y = 2 * Math.cos(phi);
    for (let i = 0; i <= 72; i++) {
      const theta = (i / 72) * Math.PI * 2;
      points.push(-r * Math.cos(theta), y, r * Math.sin(theta));
    }
  }
  for (let lng = 0; lng < 360; lng += 15) {
    const theta = (lng + 180) * (Math.PI / 180);
    for (let i = 0; i <= 36; i++) {
      const phi = (i / 36) * Math.PI;
      points.push(-(2.02 * Math.sin(phi) * Math.cos(theta)), 2.02 * Math.cos(phi), 2.02 * Math.sin(phi) * Math.sin(theta));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
};

const GridLines = () => {
  const ref = useRef<THREE.LineSegments>(null!);
  const geometry = useMemo(() => generateGridLines(), []);
  useFrame(() => ref.current.rotation.y += 0.001);
  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={COLORS.gridLines} transparent opacity={0.3} depthWrite={false} />
    </lineSegments>
  );
};

const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.18, 72, 72]} />
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
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.15, 0.3, 0.6, intensity * 0.55);
        }
      `}
    />
  </mesh>
);

const GlowRing = () => (
  <group>
    {[[2.28, 2.42], [2.48, 2.68], [2.72, 2.92]].map(([inner, outer], i) => (
      <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, outer, 72]} />
        <meshBasicMaterial 
          color={i === 0 ? "#4a90e2" : i === 1 ? "#22c55e" : "#eab308"} 
          transparent opacity={[0.12, 0.18, 0.08][i]} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>
    ))}
  </group>
);

// ─── Globe Mesh with Texture ─────────────────────────────────────────────────
const EarthMesh = ({ texture }: { texture: THREE.Texture }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => ref.current.rotation.y += 0.0015);
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 128, 128]} />
      <meshPhongMaterial 
        map={texture}
        specular="#334455"
        shininess={15}
        emissive="#0a0f20"
        emissiveIntensity={0.12}
      />
    </mesh>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────
const Scene = ({ texture }: { texture: THREE.Texture }) => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 3, 5]} intensity={1} color="#ffffff" />
    <pointLight position={[-5, -3, -5]} intensity={0.4} color="#3b82f6" />
    <StarField count={1500} />
    <EarthMesh texture={texture} />
    <EarthPoints count={20000} />
    <GridLines />
    <Atmosphere />
    <GlowRing />
  </>
);

// ─── Earth Points Component ─────────────────────────────────────────────────
const EarthPoints = ({ count = 20000 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => generateEarthPoints(count), [count]);
  useFrame(() => ref.current.rotation.y += 0.0012);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e2e8f0" size={0.015} transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const EarthGlobe3D = () => {
  const [isMobile, setIsMobile] = useState(false);
  const worldTexture = useWorldMapTexture();
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cameraPosition: [number, number, number] = isMobile ? [0.2, -0.6, 5.8] : [0.3, 0.2, 5.5];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: cameraPosition, fov: 48 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 1.8]}
      >
        <Scene texture={worldTexture} />
      </Canvas>
    </div>
  );
};

export default EarthGlobe3D;

