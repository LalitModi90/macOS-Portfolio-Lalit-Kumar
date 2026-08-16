import L from "leaflet";

/**
 * Calculates straight-line distance between two coordinates using the Haversine formula (in km).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance with appropriate units and approx label.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export interface SearchResult {
  id: string | number;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

// In-memory cache for search queries to respect Nominatim rate limits
const searchCache = new Map<string, SearchResult[]>();

/**
 * Free geocoding using Nominatim OpenStreetMap API.
 * Rate-limited and cached to respect OSM usage policy.
 */
export async function searchLocation(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  if (searchCache.has(q)) {
    return searchCache.get(q)!;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=5&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Nominatim service error");
    }

    const data: any[] = await res.json();
    const parsed: SearchResult[] = data.map((item) => ({
      id: item.place_id,
      name: item.name || item.display_name.split(",")[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    searchCache.set(q, parsed);
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Generates vector SVG icons instead of raw emojis for crisp professional rendering.
 */
export function getSvgIconMarkup(
  iconType: "home" | "residence" | "university" | "current" | "search" | "landmark",
  color = "currentColor"
): string {
  switch (iconType) {
    case "home":
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case "residence":
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    case "university":
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    case "current":
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>`;
    case "landmark":
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="22" x2="20" y2="22"/><line x1="4" y1="2" x2="20" y2="2"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="6" x2="8" y2="22"/><line x1="16" y1="6" x2="16" y2="22"/><line x1="12" y1="6" x2="12" y2="22"/></svg>`;
    case "search":
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
}

/**
 * Creates custom macOS-style DivIcon with crisp SVG vector icons.
 */
export function createCustomMarkerIcon(
  iconType: "home" | "residence" | "university" | "current" | "search" | "landmark",
  color: string,
  isCurrentLocation = false
): L.DivIcon {
  const pulseHtml = isCurrentLocation
    ? `<span class="map-pulse-ring" style="background-color: ${color};"></span>`
    : "";

  const iconSvg = getSvgIconMarkup(iconType, color);

  const html = `
    <div class="mac-map-marker-container">
      ${pulseHtml}
      <div class="mac-map-marker" style="border-color: ${color}; box-shadow: 0 4px 14px ${color}66;">
        <span class="mac-map-marker-symbol flex items-center justify-center">${iconSvg}</span>
      </div>
      <div class="mac-map-marker-pin" style="background-color: ${color}; border-top-color: ${color};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "mac-custom-leaflet-marker",
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42],
  });
}
