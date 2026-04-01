import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import earcut from "earcut";

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  equator: "#22c55e",
  tropics: "#eab308",
  countryBorders: "#4a90d9",
  countryBordersKe: "#1565c0",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type GeoMap = {
  type: string;
  features: Array<{
    type: string;
    properties?: any;
    geometry: {
      type: "Polygon" | "MultiPolygon" | string;
      coordinates: any;
    };
  }>;
} | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ll2xyz = (lat: number, lon: number, r: number): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
};

const cleanRing = (ring: number[][]): number[][] => {
  const r = [...ring];
  while (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) r.pop();
  return r;
};

const fixAntimeridian = (ring: number[][]): number[][] => {
  const out = ring.map(([lon, lat]): number[] => {
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;
    return [lon, lat];
  });
  let prev = out[0][0];
  for (let i = 1; i < out.length; i++) {
    const diff = out[i][0] - prev;
    if (diff > 180) out[i][0] -= 360;
    else if (diff < -180) out[i][0] += 360;
    prev = out[i][0];
  }
  return out;
};

// ─── Core Geometry Builders ───────────────────────────────────────────────────
const buildFillGeometry = (geoJson: GeoMap, r: number): THREE.BufferGeometry => {
  const positions: number[] = [];
  const indices: number[] = [];

  if (!geoJson?.features) return new THREE.BufferGeometry();

  const processPolygon = (rings: number[][][]) => {
    if (!rings?.length) return;

    const outer = fixAntimeridian(cleanRing(rings[0]));
    if (outer.length < 3) return;

    const holes = rings
      .slice(1)
      .map(h => fixAntimeridian(cleanRing(h)))
      .filter(h => h.length >= 3);

    const flat: number[] = [];
    const holeStarts: number[] = [];

    outer.forEach(([lon, lat]) => flat.push(lon, lat));
    holes.forEach(hole => {
      holeStarts.push(flat.length / 2);
      hole.forEach(([lon, lat]) => flat.push(lon, lat));
    });

    const triIdx = earcut(flat, holeStarts.length ? holeStarts : undefined, 2);
    if (!triIdx?.length) return;

    const vertBase = positions.length / 3;
    const numVerts = flat.length / 2;
    for (let i = 0; i < numVerts; i++) {
      const [x, y, z] = ll2xyz(flat[i * 2 + 1], flat[i * 2], r);
      positions.push(x, y, z);
    }

    triIdx.forEach(i => indices.push(vertBase + i));
  };

  geoJson.features.forEach(f => {
    const g = f?.geometry;
    if (!g) return;
    if (g.type === "Polygon") {
      processPolygon(g.coordinates as number[][][]);
    } else if (g.type === "MultiPolygon") {
      (g.coordinates as number[][][][]).forEach(poly => processPolygon(poly));
    }
  });

  if (!positions.length || !indices.length) return new THREE.BufferGeometry();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  geo.computeVertexNormals();
  return geo;
};

const buildBorderGeometry = (geoJson: GeoMap, r: number): Float32Array => {
  const verts: number[] = [];
  if (!geoJson?.features) return new Float32Array();

  const addRing = (ring: number[][]) => {
    for (let i = 0; i < ring.length - 1; i++) {
      const [ax, ay, az] = ll2xyz(ring[i][1], ring[i][0], r);
      const [bx, by, bz] = ll2xyz(ring[i + 1][1], ring[i + 1][0], r);
      verts.push(ax, ay, az, bx, by, bz);
    }
    const first = ring[0], last = ring[ring.length - 1];
    const [ax, ay, az] = ll2xyz(last[1], last[0], r);
    const [bx, by, bz] = ll2xyz(first[1], first[0], r);
    verts.push(ax, ay, az, bx, by, bz);
  };

  geoJson.features.forEach(f => {
    const g = f?.geometry;
    if (!g) return;
    if (g.type === "Polygon") {
      (g.coordinates as number[][][]).forEach(ring => addRing(ring));
    } else if (g.type === "MultiPolygon") {
      (g.coordinates as number[][][][]).forEach(poly =>
        poly.forEach(ring => addRing(ring))
      );
    }
  });

  return new Float32Array(verts);
};

// ─── Data Loading ─────────────────────────────────────────────────────────────
const loadGeoJSON = async (url: string): Promise<GeoMap | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.error("GeoJSON load error:", e);
    return null;
  }
};

// ─── Ocean Texture ────────────────────────────────────────────────────────────
const useOceanTexture = () =>
  useMemo(() => {
    const W = 4096, H = 2048;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d", { alpha: false })!;

    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a1729");
    g.addColorStop(0.35, "#1e3a5f");
    g.addColorStop(0.65, "#1e40af");
    g.addColorStop(1, "#132e5e");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    const px = (lat: number, lng: number): [number, number] => [
      ((lng + 180) / 360) * W,
      ((90 - lat) / 180) * H,
    ];

    // Grid lines
    c.strokeStyle = "#ffffff"; c.lineWidth = 0.8; c.globalAlpha = 0.25;
    for (let lon = -180; lon <= 180; lon += 20) {
      const [x] = px(0, lon);
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
    }
    for (let lat = -80; lat <= 80; lat += 20) {
      const [, y] = px(lat, 0);
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }
    c.globalAlpha = 1;

    // Equator & Tropics
    c.strokeStyle = COLORS.equator; c.lineWidth = 2.5;
    const [, eq] = px(0, 0);
    c.beginPath(); c.moveTo(0, eq); c.lineTo(W, eq); c.stroke();

    c.strokeStyle = COLORS.tropics; c.lineWidth = 1.5;
    [23.5, -23.5].forEach(lat => {
      const [, y] = px(lat, 0);
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    });

    const t = new THREE.CanvasTexture(cv);
    t.anisotropy = 16;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }, []);

// ─── Three.js Components ──────────────────────────────────────────────────────
const StarField = ({ count = 1600 }: { count?: number }) => {
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 28 + Math.random() * 25;
      a[i * 3] = r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      a[i * 3 + 2] = r * Math.cos(ph);
    }
    return a;
  }, [count]);
  const ref = useRef<THREE.Points>(null!);
  useFrame(() => (ref.current.rotation.y += 0.00005));
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#f8fafc" size={0.028} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
};

const GridLines = () => {
  const geo = useMemo(() => {
    const v: number[] = [];
    const r = 2.81875, ls = 12, lns = 24, seg = 64;
    for (let i = 0; i <= ls; i++) {
      const lat = (i / ls) * Math.PI - Math.PI / 2;
      const y = r * Math.sin(lat), rl = r * Math.cos(lat);
      for (let j = 0; j < seg; j++) {
        const t1 = (j / seg) * Math.PI * 2, t2 = ((j + 1) / seg) * Math.PI * 2;
        v.push(rl * Math.cos(t1), y, rl * Math.sin(t1), rl * Math.cos(t2), y, rl * Math.sin(t2));
      }
    }
    for (let i = 0; i < lns; i++) {
      const lon = (i / lns) * Math.PI * 2;
      for (let j = 0; j < seg; j++) {
        const p1 = (j / seg) * Math.PI - Math.PI / 2, p2 = ((j + 1) / seg) * Math.PI - Math.PI / 2;
        v.push(
          r * Math.cos(p1) * Math.cos(lon), r * Math.sin(p1), r * Math.cos(p1) * Math.sin(lon),
          r * Math.cos(p2) * Math.cos(lon), r * Math.sin(p2), r * Math.cos(p2) * Math.sin(lon)
        );
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
    </lineSegments>
  );
};

const Atmosphere = () => (
  <mesh>
    <sphereGeometry args={[3.025, 64, 64]} />
    <shaderMaterial
      transparent side={THREE.BackSide} depthWrite={false}
      vertexShader={`
        varying vec3 vN;
        void main(){
          vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec3 vN;
        void main(){
          float i = pow(0.75 - dot(vN, vec3(0,0,1)), 3.0);
          gl_FragColor = vec4(0.18, 0.35, 0.75, i * 0.6);
        }
      `}
    />
  </mesh>
);

const EarthSphere = ({ tex }: { tex: THREE.Texture }) => (
  <mesh>
    <sphereGeometry args={[2.75, 128, 128]} />
    <meshPhongMaterial
      map={tex}
      specular="#223344"
      shininess={12}
      emissive="#0a0f20"
      emissiveIntensity={0.15}
    />
  </mesh>
);

const EarthDots = ({ count = 18000 }: { count?: number }) => {
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    let i = 0;
    while (i < count * 3) {
      const lat = (Math.random() - 0.5) * 160;
      const lon = (Math.random() - 0.5) * 360;
      const [x, y, z] = ll2xyz(lat, lon, 2.76375);
      a[i++] = x; a[i++] = y; a[i++] = z;
    }
    return a;
  }, [count]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e2e8f0" size={0.016} transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  );
};

// ─── Land & Presence Components ───────────────────────────────────────────────
const LandFill = ({ geoData, color = "#ffffff", visible = true }: {
  geoData: GeoMap | null; color?: string; visible?: boolean;
}) => {
  const geo = useMemo(() => geoData ? buildFillGeometry(geoData, 2.756875) : new THREE.BufferGeometry(), [geoData]);
  if (!geoData) return null;
  return (
    <mesh geometry={geo} visible={visible}>
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
};

const LandBorders = ({ geoData, color, opacity = 1, visible = true }: {
  geoData: GeoMap | null; color: string; opacity?: number; visible?: boolean;
}) => {
  const verts = useMemo(() => geoData ? buildBorderGeometry(geoData, 2.770625) : new Float32Array(), [geoData]);
  if (!geoData || !verts.length) return null;
  return (
    <lineSegments visible={visible}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={verts} count={verts.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
};

const PresenceFill = ({ geoData }: { geoData: any }) => {
  const geo = useMemo(() => geoData ? buildFillGeometry(geoData, 2.766875) : new THREE.BufferGeometry(), [geoData]);
  if (!geoData) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        color="#60a5fa"
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
};

const NetworkPath = ({ centers }: { centers: {name: string, lat: number, lon: number}[] }) => {
  const pathGeo = useMemo(() => {
    if (!centers || centers.length < 2) return new THREE.BufferGeometry();
    const verts: number[] = [];
    
    for (let i = 0; i < centers.length - 1; i++) {
      const p1 = centers[i];
      const p2 = centers[i+1];
      const [x1, y1, z1] = ll2xyz(p1.lat, p1.lon, 2.78);
      const [x2, y2, z2] = ll2xyz(p2.lat, p2.lon, 2.78);
      
      const v1 = new THREE.Vector3(x1, y1, z1);
      const v2 = new THREE.Vector3(x2, y2, z2);
      const mid = v1.clone().lerp(v2, 0.5).normalize().multiplyScalar(2.78 + v1.distanceTo(v2) * 0.15);
      
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(12);
      for (let j = 0; j < points.length - 1; j++) {
        verts.push(points[j].x, points[j].y, points[j].z);
        verts.push(points[j+1].x, points[j+1].y, points[j+1].z);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, [centers]);

  if (!centers?.length) return null;

  return (
    <group>
      <lineSegments geometry={pathGeo}>
        <lineBasicMaterial color="#2563eb" transparent opacity={0.9} linewidth={2} />
      </lineSegments>
      {centers.map((p, i) => {
        const [x, y, z] = ll2xyz(p.lat, p.lon, 2.78);
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
const Scene = ({
  tex, worldGeo, kenyaGeo, presenceGeo, showCountries, showCounties,
}: {
  tex: THREE.Texture;
  worldGeo: GeoMap | null;
  kenyaGeo: GeoMap | null;
  presenceGeo: any | null;
  showCountries: boolean;
  showCounties: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    let rot = groupRef.current.rotation.y % (Math.PI * 2);
    if (rot < 0) rot += Math.PI * 2;
    
    const factor = (Math.cos(rot - 4.05) + 1) / 2;
    const speed = 0.003 - factor * 0.0025;
    
    groupRef.current.rotation.y += speed;
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 4, 6]} intensity={1.4} />
      <pointLight position={[-6, -4, -6]} intensity={0.6} color="#60a5fa" />

      <StarField />
      <Atmosphere />

      <group ref={groupRef}>
        <EarthSphere tex={tex} />
        <EarthDots />

        <LandFill geoData={worldGeo} color="#ffffff" visible={showCountries} />
        <LandFill geoData={kenyaGeo} color="#ffffff" visible={showCounties} />

        <PresenceFill geoData={presenceGeo} />
        <LandBorders geoData={presenceGeo} color="#2563eb" opacity={0.8} />

        <LandBorders geoData={worldGeo} color={COLORS.countryBorders} opacity={0.7} visible={showCountries} />
        <LandBorders geoData={kenyaGeo} color={COLORS.countryBordersKe} opacity={0.9} visible={showCounties} />

        <NetworkPath centers={presenceGeo?.centers || []} />

        <GridLines />
      </group>
    </>
  );
};

// ─── Root Component (Cleaned) ─────────────────────────────────────────────────
const EarthGlobe3D = () => {
  const [mobile, setMobile] = useState(false);
  const [worldGeo, setWorldGeo] = useState<GeoMap | null>(null);
  const [kenyaGeo, setKenyaGeo] = useState<GeoMap | null>(null);
  const [presenceGeo, setPresenceGeo] = useState<any | null>(null);
  const [showCountries, setShowCountries] = useState(true);
  const [showCounties, setShowCounties] = useState(false);

  const tex = useOceanTexture();

  useEffect(() => {
    Promise.all([
      loadGeoJSON("/world-countries.json"),
      loadGeoJSON("/kenya-counties-highres.geojson"),
      loadGeoJSON("/vilcom_presences.json"),
    ]).then(([w, k, p]) => {
      setWorldGeo(w);
      setKenyaGeo(k);
      
      if (k && p) {
        const kenyaPresenceNames = [
          "BUNGOMA", "UASIN GISHU", "ISIOLO", "KAJIADO", "KAKAMEGA", 
          "KIAMBU", "KILIFI", "KISUMU", "TRANS NZOIA", "KWALE", 
          "LAMU", "MACHAKOS", "MERU", "MOMBASA", "NAIROBI", 
          "NAKURU", "TURKANA"
        ];
        
        const missingFeatures = k.features.filter(f => {
          const countyName = f.properties?.shapeName?.toUpperCase() || "";
          return kenyaPresenceNames.includes(countyName);
        });
        
        const enhancedPresence = {
          ...p,
          features: [...(p.features || []), ...missingFeatures]
        };
        setPresenceGeo(enhancedPresence);
      } else {
        setPresenceGeo(p);
      }
    });
  }, []);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const cam: [number, number, number] = mobile ? [0.1, -0.4, 6.2] : [0.4, 0.3, 5.8];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: cam, fov: mobile ? 52 : 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={mobile ? [1, 1.5] : [1, 2]}
      >
        <group scale={mobile ? 0.60 : 0.70}>
          <Scene
            tex={tex}
            worldGeo={worldGeo}
            kenyaGeo={kenyaGeo}
            presenceGeo={presenceGeo}
            showCountries={showCountries}
            showCounties={showCounties}
          />
        </group>
      </Canvas>
    </div>
  );
};

export default EarthGlobe3D;