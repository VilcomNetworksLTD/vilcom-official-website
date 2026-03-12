import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

// Path to the merged GeoJSON file in your public folder
const geoUrl = "/kenya-counties.json";

// Coverage type definitions
type CoverageType = "Home" | "Business" | "Both" | "None";

// Interface for county data from the existing 3D globe
interface CountyLocation {
  name: string;
  county: string;
  status: "connected" | "coming_soon";
  lat: number;
  lng: number;
  speed?: string;
  type?: string;
}

// Mock data matching your existing coverage - map county names to coverage type
// In production, this would come from your backend API
const coverageData: Record<string, CoverageType> = {
  "Nairobi": "Both",
  "Mombasa": "Business",
  "Kisumu": "Business",
  "Nakuru": "Home",
  "Kiambu": "Business",
  "Machakos": "Home",
  "Uasin Gishu": "Home",
  "Kakamega": "Business",
  "Turkana": "None",
  "Laikipia": "Home",
  "Kisii": "Home",
  "Meru": "Home",
  "Tharaka-Nithi": "None",
  "Embu": "Home",
  "Kitui": "None",
  "Makueni": "None",
  "Nyandarua": "Home",
  "Nyeri": "Business",
  "Kirinyaga": "Home",
  "Murang'a": "Home",
  "Kilifi": "Business",
  "Kwale": "None",
  "Lamu": "None",
  "Tana River": "None",
  "Taita Taveta": "None",
  "Garissa": "None",
  "Wajir": "None",
  "Mandera": "None",
  "Marsabit": "None",
  "Isiolo": "None",
  "Samburu": "None",
  "West Pokot": "Home",
  "Baringo": "Home",
  "Elgeyo-Marakwet": "Home",
  "Nandi": "Home",
  "Bomet": "Home",
  "Narok": "Home",
  "Kajiado": "Home",
  "Siaya": "Home",
  "Busia": "Home",
  "Bungoma": "Business",
  "Vihiga": "Home",
  "Homa Bay": "Home",
  "Migori": "Home",
  "Nyamira": "Home",
  "Westlands": "Both",
  "Kilimani": "Both",
  "Karen": "Both",
  "Lavington": "Both",
  "Kileleshwa": "Both",
  "Parklands": "Both",
  "Upper Hill": "Both",
  "CBD Nairobi": "Both",
  "Gigiri": "Both",
  "Ruaka": "Home",
  "Thika": "Home",
  "Nyali": "Business",
  "Mombasa CBD": "Business",
  "Eldoret CBD": "Home",
  "Kisumu CBD": "Business",
};

// Colors based on your screenshots - matching the existing UI colors
const COLORS = {
  Business: "#5A81FA",  // The blue from your UI - #5A81FA or #00c8ff
  Home: "#F28C28",       // The orange from your UI - #F28C28 or #00d4aa
  Both: "#8B5CF6",       // Purple for both services
  None: "#E5E7EB",       // Light gray for no coverage - #E5E7EB
  Hover: "#D1D5DB",      // Hover state
  Stroke: "#9CA3AF",    // County borders
};

interface KenyaCoverageMap2DProps {
  onCountyClick?: (countyName: string) => void;
  selectedCounty?: string | null;
}

const KenyaCoverageMap2D: React.FC<KenyaCoverageMap2DProps> = ({ 
  onCountyClick, 
  selectedCounty 
}) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  // Calculate county coverage based on locations
  const countyCoverage = useMemo(() => {
    const coverage: Record<string, CoverageType> = {};
    
    // Group locations by county and determine coverage type
    Object.entries(coverageData).forEach(([name, type]) => {
      // Check if this is a main county name or a sub-location
      const countyName = name;
      
      // If we already have a coverage type for this county, merge the types
      if (coverage[countyName]) {
        if (coverage[countyName] === "None") {
          coverage[countyName] = type;
        } else if (type !== "None" && coverage[countyName] !== type) {
          coverage[countyName] = "Both";
        }
      } else {
        coverage[countyName] = type;
      }
    });
    
    return coverage;
  }, []);

  const getCountyCoverage = (countyName: string): CoverageType => {
    return countyCoverage[countyName] || "None";
  };

  const getFillColor = (geo: any): string => {
    const countyName = geo.properties.name;
    const coverageType = getCountyCoverage(countyName);
    
    if (hoveredCounty === countyName) {
      return COLORS.Hover;
    }
    
    return COLORS[coverageType];
  };

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      position: "relative",
      background: "transparent"
    }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1200,
          center: [38, 0.5]
        }}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countyName = geo.properties.name;
                const coverageType = getCountyCoverage(countyName);
                const isSelected = selectedCounty === countyName;
                const isHovered = hoveredCounty === countyName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(geo)}
                    stroke={isSelected ? "#3B82F6" : isHovered ? "#6B7280" : COLORS.Stroke}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                    onMouseEnter={() => {
                      setTooltipContent(`${countyName} - ${coverageType === "None" ? "No Coverage" : coverageType}`);
                      setHoveredCounty(countyName);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                      setHoveredCounty(null);
                    }}
                    onClick={() => {
                      if (onCountyClick) {
                        onCountyClick(countyName);
                      }
                    }}
                    style={{
                      default: { 
                        outline: "none",
                        cursor: "pointer",
                        transition: "fill 0.2s ease, stroke 0.2s ease"
                      },
                      hover: { 
                        fill: COLORS.Hover, 
                        outline: "none", 
                        cursor: "pointer" 
                      },
                      pressed: { 
                        outline: "none" 
                      },
                    }}
                    data-tooltip-id="kenya-map-tooltip"
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <Tooltip 
        id="kenya-map-tooltip" 
        content={tooltipContent}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "6px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "#fff",
          zIndex: 1000
        }}
      />

      {/* Map Legend */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
        padding: "12px 16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        minWidth: "180px"
      }}>
        <div style={{ 
          fontSize: "11px", 
          fontWeight: 700, 
          color: "#1F2937", 
          marginBottom: "10px",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}>
          Coverage Key
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: 16, 
              height: 16, 
              backgroundColor: COLORS.Business,
              borderRadius: "3px"
            }}></div>
            <span style={{ fontSize: "12px", color: "#374151" }}>Business/Enterprise</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: 16, 
              height: 16, 
              backgroundColor: COLORS.Home,
              borderRadius: "3px"
            }}></div>
            <span style={{ fontSize: "12px", color: "#374151" }}>Home/Residential</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: 16, 
              height: 16, 
              backgroundColor: COLORS.Both,
              borderRadius: "3px"
            }}></div>
            <span style={{ fontSize: "12px", color: "#374151" }}>Both Services</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: 16, 
              height: 16, 
              backgroundColor: COLORS.None,
              borderRadius: "3px",
              border: "1px solid #D1D5DB"
            }}></div>
            <span style={{ fontSize: "12px", color: "#374151" }}>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KenyaCoverageMap2D;

// Helper function to get county statistics
export const getCountyStats = () => {
  const stats = {
    total: 0,
    home: 0,
    business: 0,
    both: 0,
    none: 0
  };

  Object.values(coverageData).forEach(type => {
    stats.total++;
    if (type === "Home") stats.home++;
    else if (type === "Business") stats.business++;
    else if (type === "Both") stats.both++;
    else if (type === "None") stats.none++;
  });

  return stats;
};

