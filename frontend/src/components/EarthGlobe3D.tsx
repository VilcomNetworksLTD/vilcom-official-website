import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Color Palette ─────────────────────────────────────────────────────────────
const COLORS = {
  background: "#05050A",
  points: "#FFFFFF",
  atmosphere: "#1A1A2E",
  gridLines: "rgba(255, 255, 255, 0.15)",
  glow: "rgba(100, 150, 255, 0.1)",
};

// ─── Generate Earth Points (Continental Distribution) ────────────────────────
const generateEarthPoints = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  let idx = 0;

  const continents = [
    { latMin: -35, latMax: 37,  lngMin: -20,  lngMax: 52,   weight: 0.20 },
    { latMin: 35,  latMax: 71,  lngMin: -25,  lngMax: 60,   weight: 0.08 },
    { latMin: -10, latMax: 77,  lngMin: 25,   lngMax: 180,  weight: 0.32 },
    { latMin: 7,   latMax: 83,  lngMin: -168, lngMax: -52,  weight: 0.16 },
    { latMin: -56, latMax: 12,  lngMin: -82,  lngMax: -34,  weight: 0.14 },
    { latMin: -44, latMax: -10, lngMin: 112,  lngMax: 154,  weight: 0.06 },
    { latMin: -35, latMax: -30, lngMin: 18,   lngMax: 53,   weight: 0.04 },
  ];

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let selectedContinent = continents[0];
    for (const continent of continents) {
      cumulative += continent.weight;
      if (rand <= cumulative) { selectedContinent = continent; break; }
    }
    const lat = selectedContinent.latMin + Math.random() * (selectedContinent.latMax - selectedContinent.latMin);
    const lng = selectedContinent.lngMin + Math.random() * (selectedContinent.lngMax - selectedContinent.lngMin);
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const radius = 2;
    positions[idx++] = -(radius * Math.sin(phi) * Math.cos(theta));
    positions[idx++] =   radius * Math.cos(phi);
    positions[idx++] =   radius * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
};

// ─── Generate Grid Lines ──────────────────────────────────────────────────────
const generateGridLines = (): THREE.BufferGeometry => {
  const points: number[] = [];
  for (let lat = -60; lat <= 60; lat += 15) {
    const phi = (90 - lat) * (Math.PI / 180);
    const r = Math.sin(phi);
    const y = Math.cos(phi);
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      points.push(-r * Math.cos(theta) * 2, y * 2, r * Math.sin(theta) * 2);
    }
  }
  for (let lng = 0; lng < 360; lng += 15) {
    const theta = (lng + 180) * (Math.PI / 180);
    for (let i = 0; i <= 32; i++) {
      const phi = (i / 32) * Math.PI;
      points.push(
        -(2 * Math.sin(phi) * Math.cos(theta)),
         2 * Math.cos(phi),
         2 * Math.sin(phi) * Math.sin(theta)
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
};

// ─── Star Field ───────────────────────────────────────────────────────────────
const StarField = ({ count = 800 }: { count?: number }) => {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta  = Math.random() * Math.PI * 2;
      const phi    = Math.acos(2 * Math.random() - 1);
      const radius = 25 + Math.random() * 15;
      pos[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.00005; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={COLORS.points} size={0.03} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

// ─── Earth Points ─────────────────────────────────────────────────────────────
const EarthPoints = ({ count = 15000 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => generateEarthPoints(count), [count]);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0012; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={COLORS.points} size={0.018} transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  );
};

// ─── Grid Lines ───────────────────────────────────────────────────────────────
const GridLines = () => {
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => generateGridLines(), []);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0012; });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={COLORS.gridLines} transparent opacity={0.25} depthWrite={false} />
    </lineSegments>
  );
};

// ─── Atmosphere ───────────────────────────────────────────────────────────────
const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[2.15, 64, 64]} />
    <shaderMaterial
      transparent
      side={THREE.BackSide}
      depthWrite={false}
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          vec3 color = vec3(0.1, 0.15, 0.3);
          gl_FragColor = vec4(color, intensity * 0.6);
        }
      `}
    />
  </mesh>
);

// ─── Glow Ring ────────────────────────────────────────────────────────────────
const GlowRing = () => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.3, 2.5, 64]} />
      <meshBasicMaterial color="#4a6fa5" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.45, 2.65, 64]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.6, 2.8, 64]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  </group>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
const Scene = () => (
  <>
    <ambientLight intensity={0.3} />
    <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
    <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4a6fa5" />
    <StarField count={1000} />
    <EarthPoints count={18000} />
    <GridLines />
    <Atmosphere />
    <GlowRing />
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const EarthGlobe3D = () => {
  // Detect if we're on mobile by checking window width
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // On mobile, adjust camera position to show more of the globe (push it down in view)
  const cameraPosition: [number, number, number] = isMobile ? [0, -0.8, 5.5] : [0, 0, 5.5];

  return (
    /*
      KEY FIXES vs original:
      1. Removed "absolute inset-0" — the component now fills whatever
         container it's placed in via w-full h-full on a block element.
         The parent (globe-wrapper / globe-scale-container) controls the size.
      2. alpha: true  — canvas background is transparent so the dark
         section background shows through instead of a black box clipping
         the globe on mobile.
      3. Added preserveDrawingBuffer: false for perf on mobile GPUs.
    */
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,               // ← transparent — no black background box
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 1.5]}               // ← capped at 1.5 (was 2) — saves mobile GPU
      >
        {/* No <color> background attach — let the section background show through */}
        <Scene />
      </Canvas>
    </div>
  );
};

export default EarthGlobe3D;