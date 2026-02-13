import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { CheckCircle, Clock } from "lucide-react";

interface CoverageLocation {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
}

// Coverage locations with proper lat/lng coordinates
const locations: CoverageLocation[] = [
  { name: "Westlands", county: "Nairobi", status: "connected", lat: -1.2637, lng: 36.8063 },
  { name: "Kilimani", county: "Nairobi", status: "connected", lat: -1.2915, lng: 36.7823 },
  { name: "Karen", county: "Nairobi", status: "connected", lat: -1.3197, lng: 36.7073 },
  { name: "Lavington", county: "Nairobi", status: "connected", lat: -1.2769, lng: 36.7693 },
  { name: "Kileleshwa", county: "Nairobi", status: "connected", lat: -1.2838, lng: 36.7876 },
  { name: "Runda", county: "Nairobi", status: "coming_soon", lat: -1.2189, lng: 36.8156 },
  { name: "Nyali", county: "Mombasa", status: "connected", lat: -4.0375, lng: 39.7208 },
  { name: "Bamburi", county: "Mombasa", status: "coming_soon", lat: -3.9833, lng: 39.7333 },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon", lat: 0.5143, lng: 35.2698 },
  { name: "Kisumu CBD", county: "Kisumu", status: "connected", lat: -0.0917, lng: 34.7680 },
];

// Fiber trunk connections
const FIBER_CONNECTIONS = [
  { from: "Westlands", to: "Nyali" },
  { from: "Westlands", to: "Eldoret CBD" },
  { from: "Westlands", to: "Kisumu CBD" },
  { from: "Eldoret CBD", to: "Kisumu CBD" },
];

interface KenyaGlobe3DProps {
  onSelectLocation?: (loc: CoverageLocation | null) => void;
  selectedLocation?: CoverageLocation | null;
}

// Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 2): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Kenya center position for camera lookAt
const KENYA_CENTER = new THREE.Vector3(0.8, 0.1, 0);

// Globe component with Earth texture
const Globe = ({ isZooming }: { isZooming: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create Earth texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Base ocean color with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(0.5, '#2c5f8d');
    gradient.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Africa (simplified)
    ctx.fillStyle = '#3a5f3a';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.52, canvas.height * 0.5, canvas.width * 0.15, canvas.height * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add texture variation
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#2a4f2a' : '#4a6f4a';
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 20 + 5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial 
        map={texture} 
        bumpScale={0.05}
        specular={new THREE.Color(0x333333)}
        shininess={15}
      />
    </mesh>
  );
};

// Atmosphere glow effect
const Atmosphere = () => {
  return (
    <mesh>
      <sphereGeometry args={[2.1, 64, 64]} />
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
            float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }
        `}
      />
    </mesh>
  );
};

// Stars background
const Stars = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 1000; i++) {
      pos.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
    }
    return new Float32Array(pos);
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={0xffffff} size={0.02} transparent opacity={0.8} />
    </points>
  );
};

// Marker component for each location
const Marker = ({ 
  location, 
  onSelect, 
  isSelected,
  isHovered,
  onHover 
}: { 
  location: CoverageLocation;
  onSelect: (loc: CoverageLocation) => void;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (name: string | null) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const position = latLngToVector3(location.lat, location.lng, 2.02);
  const color = location.status === "connected" ? "#00d4ff" : "#ffd700";
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const baseScale = isSelected || isHovered ? 1.5 : 1;
      groupRef.current.scale.setScalar(baseScale);
    }
    
    // Animate pulse ring
    if (ringRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
      ringRef.current.scale.set(scale, scale, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 - Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
    
    // Animate glow
    if (glowRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      glowRef.current.scale.setScalar(scale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 - Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main marker sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(location);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(location.name);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.025, 0.03, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Label on hover */}
      {(isHovered || isSelected) && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="glass-strong rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none">
            <div className="font-semibold text-sm text-white">{location.name}</div>
            <div className="text-xs text-gray-300">{location.county}</div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${
              location.status === "connected" ? "text-cyan-400" : "text-yellow-400"
            }`}>
              {location.status === "connected" ? (
                <>
                  <CheckCircle className="w-3 h-3" /> Connected
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> Coming Soon
                </>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Fiber connections between locations
const Connections = ({ isVisible }: { isVisible: boolean }) => {
  const connections = useMemo(() => {
    return FIBER_CONNECTIONS.map(conn => {
      const fromLoc = locations.find(l => l.name === conn.from);
      const toLoc = locations.find(l => l.name === conn.to);
      if (!fromLoc || !toLoc) return null;
      
      const fromPos = latLngToVector3(fromLoc.lat, fromLoc.lng, 2.01);
      const toPos = latLngToVector3(toLoc.lat, toLoc.lng, 2.01);
      
      // Create curved line
      const midPoint = new THREE.Vector3()
        .addVectors(fromPos, toPos)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(2.15);
      
      const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
      const points = curve.getPoints(50);
      
      return (
        <Line 
          key={`${conn.from}-${conn.to}`} 
          points={points} 
          color="#00d4ff" 
          lineWidth={1} 
          transparent 
          opacity={isVisible ? 0.4 : 0} 
        />
      );
    }).filter(Boolean);
  }, [isVisible]);

  return <>{connections}</>;
};

// Camera animation controller
const CameraController = ({ 
  isZooming, 
  onZoomComplete 
}: { 
  isZooming: boolean; 
  onZoomComplete: () => void;
}) => {
  const { camera } = useThree();
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    if (!isZooming || hasStarted) return;
    
    setHasStarted(true);
    
    // Initial camera position
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    
    const startTime = Date.now();
    const duration = 6000; // 6 seconds total
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.33) {
        // Phase 1: Hold at initial view
        // Do nothing, just wait
      } else if (progress < 0.66) {
        // Phase 2: Zoom to Africa
        const phase2Progress = (progress - 0.33) / 0.33;
        const eased = 1 - Math.pow(1 - phase2Progress, 3);
        camera.position.z = 8 - (8 - 4.5) * eased;
        camera.position.x = 0.5 * eased;
        camera.lookAt(0, 0, 0);
      } else {
        // Phase 3: Zoom to Kenya
        const phase3Progress = (progress - 0.66) / 0.34;
        const eased = 1 - Math.pow(1 - phase3Progress, 3);
        camera.position.z = 4.5 - (4.5 - 2.8) * eased;
        camera.position.x = 0.5 + 0.3 * eased;
        camera.position.y = 0.3 * eased;
        camera.lookAt(KENYA_CENTER);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        camera.position.set(2.8, 0.3, 2.8);
        camera.lookAt(KENYA_CENTER);
        onZoomComplete();
      }
    };
    
    requestAnimationFrame(animateCamera);
  }, [isZooming, camera, onZoomComplete, hasStarted]);

  return null;
};

// Main 3D Scene
const Scene = ({ 
  isZooming, 
  onZoomComplete,
  onSelectLocation,
  selectedLocation 
}: { 
  isZooming: boolean;
  onZoomComplete: () => void;
  onSelectLocation: (loc: CoverageLocation | null) => void;
  selectedLocation: CoverageLocation | null;
}) => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(false);

  const handleZoomComplete = () => {
    onZoomComplete();
    setTimeout(() => setShowConnections(true), 500);
  };

  return (
    <>
      <CameraController isZooming={isZooming} onZoomComplete={handleZoomComplete} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 3, 5]} intensity={1} />
      
      <Globe isZooming={isZooming} />
      <Atmosphere />
      <Stars />
      
      {!isZooming && locations.map(location => (
        <Marker
          key={location.name}
          location={location}
          onSelect={(loc) => {
            onSelectLocation(selectedLocation?.name === loc.name ? null : loc);
          }}
          isSelected={selectedLocation?.name === location.name}
          isHovered={hoveredMarker === location.name}
          onHover={setHoveredMarker}
        />
      ))}
      
      {!isZooming && <Connections isVisible={showConnections} />}
      
      {!isZooming && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          enablePan={false}
          minDistance={2.5}
          maxDistance={6}
          target={KENYA_CENTER}
        />
      )}
    </>
  );
};

// Main component
const KenyaGlobe3D = ({ onSelectLocation, selectedLocation }: KenyaGlobe3DProps) => {
  const [isZooming, setIsZooming] = useState(true);
  const [zoomPhase, setZoomPhase] = useState(1);

  useEffect(() => {
    if (!isZooming) return;
    
    const timer1 = setTimeout(() => setZoomPhase(2), 2000);
    const timer2 = setTimeout(() => setZoomPhase(3), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isZooming]);

  const handleZoomComplete = () => {
    setIsZooming(false);
  };

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#0a0e1a']} />
        <Scene 
          isZooming={isZooming}
          onZoomComplete={handleZoomComplete}
          onSelectLocation={onSelectLocation || (() => {})}
          selectedLocation={selectedLocation || null}
        />
      </Canvas>
      
      {/* Zoom progress indicator */}
      {isZooming && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 glass-strong rounded-full px-6 py-3 flex items-center gap-3 animate-in fade-in">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {zoomPhase === 1 ? "Viewing Earth..." : zoomPhase === 2 ? "Zooming to Africa..." : "Focusing on Kenya..."}
          </span>
        </div>
      )}
      
      {/* Info panel */}
      {!isZooming && (
        <div className="absolute bottom-6 left-6 glass-strong rounded-xl p-4 max-w-sm animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-heading font-bold text-foreground mb-2">Interactive 3D Coverage</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Hover over nodes to explore coverage areas. Click to view details. Use mouse to rotate.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-pulse" />
              <span className="text-muted-foreground">Connected ({locations.filter(l => l.status === "connected").length})</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700]" />
              <span className="text-muted-foreground">Coming Soon ({locations.filter(l => l.status === "coming_soon").length})</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KenyaGlobe3D;