import { StratixApiResponse, createSuccessResponse, createErrorResponse } from './common';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  nodes?: number[];
  members?: Array<{
    type: string;
    ref: number;
    role: string;
  }>;
}

interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

/**
 * Overpass API wrapper for OpenStreetMap data
 * Free API with no authentication required
 * @param query - Overpass QL query
 * @param bbox - Bounding box [south, west, north, east] for geographic bounds
 * @param timeout - Query timeout in seconds (default: 25)
 */
export async function overpass(
  query: string,
  bbox?: [number, number, number, number],
  timeout: number = 25
): Promise<StratixApiResponse<OverpassElement[]>> {
  try {
    const baseUrl = 'https://overpass-api.de/api/interpreter';
    
    // Build Overpass QL query with proper formatting
    let overpassQuery = `[out:json][timeout:${timeout}];\n`;
    
    // Add bounding box if provided
    if (bbox) {
      const [south, west, north, east] = bbox;
      overpassQuery += `(\n${query}\n)(${south},${west},${north},${east});\n`;
    } else {
      overpassQuery += `(\n${query}\n);\n`;
    }
    
    overpassQuery += 'out geom;';
    
    console.log('Overpass API: Executing query', { query: overpassQuery.substring(0, 100) + '...' });
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Stratix-Research-Agent/1.0'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }
    
    const data: OverpassResponse = await response.json();
    
    // Validate response structure
    if (!data.elements || !Array.isArray(data.elements)) {
      throw new Error('Invalid Overpass API response format');
    }
    
    return createSuccessResponse(data.elements, 'Overpass API', {
      rate_limit: {
        remaining: 999, // Overpass has generous limits
      }
    });
    
  } catch (error) {
    console.error('Overpass API error:', error);
    return createErrorResponse('Overpass API', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Helper function to build common Overpass queries
 */
export const overpassQueries = {
  /**
   * Find amenities in an area
   * @param amenity - Type of amenity (e.g., 'restaurant', 'hospital', 'school')
   * @param area - Area name (e.g., 'New York City')
   */
  amenities: (amenity: string, area?: string) => {
    if (area) {
      return `area[name="${area}"]->.searchArea;\nnode[amenity=${amenity}](area.searchArea);\nway[amenity=${amenity}](area.searchArea);`;
    }
    return `node[amenity=${amenity}];\nway[amenity=${amenity}];`;
  },
  
  /**
   * Find shops in an area
   * @param shopType - Type of shop (e.g., 'supermarket', 'clothes')
   * @param area - Area name
   */
  shops: (shopType: string, area?: string) => {
    if (area) {
      return `area[name="${area}"]->.searchArea;\nnode[shop=${shopType}](area.searchArea);\nway[shop=${shopType}](area.searchArea);`;
    }
    return `node[shop=${shopType}];\nway[shop=${shopType}];`;
  },
  
  /**
   * Find roads/highways
   * @param highway - Highway type (e.g., 'primary', 'secondary', 'residential')
   * @param area - Area name
   */
  roads: (highway: string, area?: string) => {
    if (area) {
      return `area[name="${area}"]->.searchArea;\nway[highway=${highway}](area.searchArea);`;
    }
    return `way[highway=${highway}];`;
  }
};