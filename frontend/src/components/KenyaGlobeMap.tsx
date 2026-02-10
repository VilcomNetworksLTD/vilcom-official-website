import { useState } from "react";
import { CheckCircle, Clock, Wifi } from "lucide-react";

interface CoverageLocation {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  cx: number;
  cy: number;
}

const locations: CoverageLocation[] = [
  { name: "Westlands", county: "Nairobi", status: "connected", cx: 248, cy: 372 },
  { name: "Kilimani", county: "Nairobi", status: "connected", cx: 252, cy: 378 },
  { name: "Karen", county: "Nairobi", status: "connected", cx: 244, cy: 384 },
  { name: "Lavington", county: "Nairobi", status: "connected", cx: 246, cy: 376 },
  { name: "Kileleshwa", county: "Nairobi", status: "connected", cx: 250, cy: 374 },
  { name: "Runda", county: "Nairobi", status: "coming_soon", cx: 250, cy: 368 },
  { name: "Nyali", county: "Mombasa", status: "connected", cx: 290, cy: 430 },
  { name: "Bamburi", county: "Mombasa", status: "coming_soon", cx: 292, cy: 426 },
  { name: "Eldoret CBD", county: "Uasin Gishu", status: "coming_soon", cx: 222, cy: 310 },
  { name: "Kisumu CBD", county: "Kisumu", status: "connected", cx: 208, cy: 338 },
];

// Simplified Kenya outline (SVG path)
const KENYA_PATH = `M 200 260 L 230 255 L 260 260 L 290 270 L 310 290 L 315 310 L 310 340 L 305 370 L 300 400 L 295 430 L 290 445 L 280 440 L 270 430 L 260 420 L 250 400 L 245 390 L 240 385 L 235 375 L 225 360 L 215 350 L 205 340 L 195 330 L 190 315 L 185 300 L 190 280 L 195 270 Z`;

// Fiber trunk lines connecting major hubs
const FIBER_LINES = [
  // Nairobi hub (center point ~248, 376)
  { from: { x: 248, y: 376 }, to: { x: 290, y: 430 }, label: "Nairobi → Mombasa" },
  { from: { x: 248, y: 376 }, to: { x: 222, y: 310 }, label: "Nairobi → Eldoret" },
  { from: { x: 248, y: 376 }, to: { x: 208, y: 338 }, label: "Nairobi → Kisumu" },
  { from: { x: 222, y: 310 }, to: { x: 208, y: 338 }, label: "Eldoret → Kisumu" },
];

interface KenyaGlobeMapProps {
  onSelectLocation: (loc: CoverageLocation | null) => void;
  selectedLocation: CoverageLocation | null;
}

const KenyaGlobeMap = ({ onSelectLocation, selectedLocation }: KenyaGlobeMapProps) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Holographic table surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-lighter/30 via-background to-sky-lighter/10" />

      {/* Grid lines for holographic effect */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="holo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220 80% 50%)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#holo-grid)" />
      </svg>

      {/* Globe container with perspective */}
      <div className="relative" style={{ perspective: "800px" }}>
        <div
          className="relative"
          style={{
            transform: "rotateX(15deg) rotateZ(-5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Globe circle behind Kenya */}
          <svg
            viewBox="140 220 220 260"
            className="w-[min(100%,500px)] h-auto drop-shadow-lg"
            style={{ filter: "drop-shadow(0 20px 40px hsl(220 80% 50% / 0.15))" }}
          >
            <defs>
              {/* Glow filter for fiber lines */}
              <filter id="fiber-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Stronger glow for active nodes */}
              <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pulse animation for active nodes */}
              <radialGradient id="node-active" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(200 90% 60%)" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(220 80% 50%)" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="node-soon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(45 100% 55%)" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(45 100% 55%)" stopOpacity="0" />
              </radialGradient>

              {/* Globe gradient */}
              <radialGradient id="globe-bg" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="hsl(200 100% 95%)" stopOpacity="0.6" />
                <stop offset="60%" stopColor="hsl(210 80% 90%)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(220 70% 85%)" stopOpacity="0.1" />
              </radialGradient>

              {/* Animated dash for fiber lines */}
              <style>{`
                .fiber-line-animated {
                  stroke-dasharray: 8 4;
                  animation: fiber-flow 1.5s linear infinite;
                }
                @keyframes fiber-flow {
                  to { stroke-dashoffset: -24; }
                }
                .pulse-ring {
                  animation: pulse-node 2s ease-in-out infinite;
                }
                @keyframes pulse-node {
                  0%, 100% { r: 6; opacity: 0.3; }
                  50% { r: 12; opacity: 0; }
                }
              `}</style>
            </defs>

            {/* Globe circle */}
            <ellipse
              cx="260"
              cy="360"
              rx="110"
              ry="115"
              fill="url(#globe-bg)"
              stroke="hsl(220 80% 50% / 0.15)"
              strokeWidth="1.5"
            />

            {/* Latitude/longitude lines on globe */}
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={`lat-${i}`}
                cx="260"
                cy={290 + i * 35}
                rx={110 - Math.abs(i - 2) * 15}
                ry="8"
                fill="none"
                stroke="hsl(220 80% 50% / 0.06)"
                strokeWidth="0.7"
              />
            ))}
            {[0, 1, 2].map((i) => (
              <ellipse
                key={`lng-${i}`}
                cx={210 + i * 50}
                cy="360"
                rx="8"
                ry={115 - Math.abs(i - 1) * 30}
                fill="none"
                stroke="hsl(220 80% 50% / 0.06)"
                strokeWidth="0.7"
              />
            ))}

            {/* Kenya outline */}
            <path
              d={KENYA_PATH}
              fill="hsl(210 40% 96% / 0.7)"
              stroke="hsl(220 80% 50% / 0.3)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Fiber trunk lines */}
            {FIBER_LINES.map((line, i) => (
              <g key={i}>
                {/* Glow layer */}
                <line
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  stroke="hsl(220 80% 50%)"
                  strokeWidth="3"
                  strokeOpacity="0.2"
                  filter="url(#fiber-glow)"
                />
                {/* Animated data flow */}
                <line
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  stroke="hsl(200 90% 60%)"
                  strokeWidth="1.5"
                  className="fiber-line-animated"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              </g>
            ))}

            {/* Coverage nodes */}
            {locations.map((loc) => {
              const isSelected = selectedLocation?.name === loc.name;
              const isHovered = hoveredLocation === loc.name;
              const isActive = loc.status === "connected";

              return (
                <g
                  key={loc.name}
                  className="cursor-pointer"
                  onClick={() => onSelectLocation(isSelected ? null : loc)}
                  onMouseEnter={() => setHoveredLocation(loc.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  {/* Pulse ring for connected */}
                  {isActive && (
                    <circle
                      cx={loc.cx}
                      cy={loc.cy}
                      r="6"
                      fill="none"
                      stroke={isActive ? "hsl(200 90% 60%)" : "hsl(45 100% 55%)"}
                      strokeWidth="1"
                      className="pulse-ring"
                    />
                  )}

                  {/* Node glow */}
                  <circle
                    cx={loc.cx}
                    cy={loc.cy}
                    r={isSelected || isHovered ? 7 : 5}
                    fill={isActive ? "url(#node-active)" : "url(#node-soon)"}
                    filter="url(#node-glow)"
                    opacity={isSelected || isHovered ? 1 : 0.7}
                    style={{ transition: "r 0.2s, opacity 0.2s" }}
                  />

                  {/* Node center */}
                  <circle
                    cx={loc.cx}
                    cy={loc.cy}
                    r={isSelected || isHovered ? 4 : 3}
                    fill={isActive ? "hsl(220 80% 50%)" : "hsl(45 100% 55%)"}
                    stroke="white"
                    strokeWidth="1"
                    style={{ transition: "r 0.2s" }}
                  />

                  {/* Label on hover/select */}
                  {(isHovered || isSelected) && (
                    <g>
                      <rect
                        x={loc.cx + 10}
                        y={loc.cy - 16}
                        width={loc.name.length * 7 + 16}
                        height="22"
                        rx="6"
                        fill="hsl(0 0% 100% / 0.9)"
                        stroke="hsl(220 80% 50% / 0.2)"
                        strokeWidth="0.5"
                      />
                      <text
                        x={loc.cx + 18}
                        y={loc.cy - 2}
                        fontSize="10"
                        fontFamily="Space Grotesk, sans-serif"
                        fontWeight="600"
                        fill="hsl(222 47% 11%)"
                      >
                        {loc.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* City labels (major hubs) */}
            {[
              { label: "NAIROBI", x: 248, y: 398 },
              { label: "MOMBASA", x: 290, y: 452 },
              { label: "ELDORET", x: 222, y: 302 },
              { label: "KISUMU", x: 208, y: 348 },
            ].map((city) => (
              <text
                key={city.label}
                x={city.x}
                y={city.y}
                textAnchor="middle"
                fontSize="7"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="500"
                fill="hsl(220 80% 50% / 0.5)"
                letterSpacing="1.5"
              >
                {city.label}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-3 flex items-center gap-6 text-xs">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">Connected</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="text-muted-foreground">Coming Soon</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-sky" />
          <span className="text-muted-foreground">Fiber Line</span>
        </span>
      </div>
    </div>
  );
};

export default KenyaGlobeMap;
