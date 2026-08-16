/**
 * Central Map Configuration
 * High-definition location coordinates and SVG icon definitions without emojis.
 */

export interface MapLocation {
  id: string;
  name: string;
  category: "home" | "residence" | "university" | "landmark" | "custom";
  lat: number;
  lng: number;
  description: string;
  iconType: "home" | "residence" | "university" | "current" | "search" | "landmark";
  color: string;
  accentColor: string;
  externalMapUrl?: string;
  website?: string;
}

export const MAP_LOCATIONS: {
  home: MapLocation;
  residence: MapLocation;
  university: MapLocation;
  landmarks: MapLocation[];
} = {
  // Hometown Location (Deldar, Rajasthan)
  home: {
    id: "home",
    name: "Hometown",
    category: "home",
    lat: 25.020186,
    lng: 72.693058,
    description: "Deldar, Rajasthan 307801 (Permanent Residence)",
    iconType: "home",
    color: "#F59E0B",
    accentColor: "rgba(245, 158, 11, 0.15)",
    externalMapUrl: "https://maps.app.goo.gl/Ndvzd6KeVa2SzC1H9",
  },

  // Current Residence & Work Location (Vadodara, Gujarat)
  residence: {
    id: "residence",
    name: "Current Residence",
    category: "residence",
    lat: 22.3025,
    lng: 73.2386,
    description: "A-12, Pangat Park, Waghodia Road, Vadodara, Gujarat 390019 (Work Location)",
    iconType: "residence",
    color: "#10B981",
    accentColor: "rgba(16, 185, 129, 0.15)",
    externalMapUrl: "https://maps.app.goo.gl/z6DwPaMQpDvydoiw9",
  },

  // Parul University (Vadodara, Gujarat)
  university: {
    id: "university",
    name: "Parul University",
    category: "university",
    lat: 22.2887,
    lng: 73.3634,
    description: "Parul Institute of Technology, P.O. Limda, Waghodia, Vadodara 391760",
    iconType: "university",
    color: "#3B82F6",
    accentColor: "rgba(59, 130, 246, 0.15)",
    website: "https://paruluniversity.ac.in/",
    externalMapUrl: "https://maps.app.goo.gl/DZ4F8pNk9pnKQKuW7",
  },

  landmarks: [
    {
      id: "vadodara-center",
      name: "Vadodara City",
      category: "landmark",
      lat: 22.3072,
      lng: 73.1812,
      description: "Cultural Capital of Gujarat, India",
      iconType: "landmark",
      color: "#8B5CF6",
      accentColor: "rgba(139, 92, 246, 0.15)",
      externalMapUrl: "https://www.openstreetmap.org/?mlat=22.3072&mlon=73.1812#map=13/22.3072/73.1812",
    },
  ],
};

export const DEFAULT_MAP_CENTER: [number, number] = [MAP_LOCATIONS.residence.lat, MAP_LOCATIONS.residence.lng];
export const DEFAULT_MAP_ZOOM = 13;

export const TILE_PROVIDERS = {
  voyager: {
    name: "Explore",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    maxZoom: 19,
  },
  standard: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  dark: {
    name: "Dark Mode",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    maxZoom: 19,
  },
};
