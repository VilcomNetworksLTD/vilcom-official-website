/**
 * Utility for converting GeoJSON data to 3D spherical coordinates
 * for rendering on a 3D globe with proper great-circle arcs
 */

export interface GeoFeature {
  type: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface GeoMap {
  type: string;
  features: GeoFeature[];
}

/**
 * Convert latitude/longitude to 3D coordinates on a sphere
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Sphere radius (default 2 for globe)
 */
export const latLngTo3D = (lat: number, lon: number, radius: number = 2) => {
  const phi = (90 - lat) * (Math.PI / 180); // convert to radians, flip for y-up
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return { x, y, z };
};

/**
 * Generate great circle arc points between two coordinates
 * Creates smooth arcs for borders on the sphere surface
 */
export const generateGreatCircleArc = (
  start: [number, number], // [lat, lon]
  end: [number, number],
  segments: number = 16,
  radius: number = 2
): Float32Array => {
  const vertices: number[] = [];

  const [lat1, lon1] = start;
  const [lat2, lon2] = end;

  // Convert to radians
  const startRad = { lat: lat1 * (Math.PI / 180), lon: lon1 * (Math.PI / 180) };
  const endRad = { lat: lat2 * (Math.PI / 180), lon: lon2 * (Math.PI / 180) };

  // Convert to 3D vectors
  const startVec = {
    x: Math.cos(startRad.lat) * Math.cos(startRad.lon),
    y: Math.sin(startRad.lat),
    z: Math.cos(startRad.lat) * Math.sin(startRad.lon),
  };

  const endVec = {
    x: Math.cos(endRad.lat) * Math.cos(endRad.lon),
    y: Math.sin(endRad.lat),
    z: Math.cos(endRad.lat) * Math.sin(endRad.lon),
  };

  // Interpolate along great circle using slerp
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    // Angular distance
    const cosTheta =
      startVec.x * endVec.x + startVec.y * endVec.y + startVec.z * endVec.z;
    let theta = Math.acos(Math.min(1, Math.max(-1, cosTheta)));

    // Handle cases where points are identical or opposite
    if (Math.abs(theta) < 1e-6) {
      theta = 1e-6;
    }

    // Spherical linear interpolation
    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - t) * theta) / sinTheta;
    const w2 = Math.sin(t * theta) / sinTheta;

    const point = {
      x: (w1 * startVec.x + w2 * endVec.x) * radius,
      y: (w1 * startVec.y + w2 * endVec.y) * radius,
      z: (w1 * startVec.z + w2 * endVec.z) * radius,
    };

    vertices.push(point.x, point.y, point.z);
  }

  return new Float32Array(vertices);
};

/**
 * Process a polygon from GeoJSON and convert to 3D great-circle arc coordinates
 */
export const polygonTo3DArcs = (
  polygon: number[][][], // GeoJSON polygon coordinates
  segments: number = 8,
  radius: number = 2
): Float32Array => {
  const vertices: number[] = [];

  // Handle both simple polygons and multi-ring polygons
  const rings = polygon as [number, number][][];

  rings.forEach((ring) => {
    // Draw great-circle arcs between consecutive points
    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];

      const arc = generateGreatCircleArc([lat1, lon1], [lat2, lon2], segments, radius);
      vertices.push(...Array.from(arc));
    }

    // Close the ring if needed
    if (
      ring[0][0] !== ring[ring.length - 1][0] ||
      ring[0][1] !== ring[ring.length - 1][1]
    ) {
      const [lon1, lat1] = ring[ring.length - 1];
      const [lon2, lat2] = ring[0];
      const arc = generateGreatCircleArc([lat1, lon1], [lat2, lon2], segments, radius);
      vertices.push(...Array.from(arc));
    }
  });

  return new Float32Array(vertices);
};

/**
 * Convert MultiPolygon to 3D arcs
 */
export const multiPolygonTo3DArcs = (
  multiPolygon: number[][][][],
  segments: number = 8,
  radius: number = 2
): Float32Array => {
  const vertices: number[] = [];

  multiPolygon.forEach((polygon) => {
    const arc = polygonTo3DArcs(polygon, segments, radius);
    vertices.push(...Array.from(arc));
  });

  return new Float32Array(vertices);
};

/**
 * Parse GeoJSON and create 3D line segments for all features
 */
export const processGeoJSON = (
  geoData: GeoMap,
  radius: number = 2,
  segments: number = 8
): { vertices: Float32Array; features: GeoFeature[] } => {
  const allVertices: number[] = [];

  geoData.features.forEach((feature) => {
    const { geometry } = feature;

    if (geometry.type === "Polygon") {
      const arc = polygonTo3DArcs(geometry.coordinates, segments, radius);
      allVertices.push(...Array.from(arc));
    } else if (geometry.type === "MultiPolygon") {
      const arc = multiPolygonTo3DArcs(geometry.coordinates, segments, radius);
      allVertices.push(...Array.from(arc));
    }
  });

  return {
    vertices: new Float32Array(allVertices),
    features: geoData.features,
  };
};

/**
 * Create colored boundaries based on feature properties
 */
export const getFeatureColor = (feature: GeoFeature): string => {
  const props = feature.properties;

  // Color by type
  if (props.boundary_type === "country") {
    return props.name === "Kenya" ? "#3b82f6" : "#60a5fa"; // Highlight Kenya
  }

  // Default colors for counties/regions
  return "#94a3b8";
};
