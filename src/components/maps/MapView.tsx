import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MAP_LOCATIONS,
  TILE_PROVIDERS,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "./mapConfig";
import {
  createCustomMarkerIcon,
  calculateDistance,
  formatDistance,
  type SearchResult,
} from "./mapUtils";
import type { SelectedLocationData } from "./LocationInfo";

// Helper component to control map programmatic movements and handle resizing
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);

  // Handle window resizing to keep tiles aligned
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}

interface MapViewProps {
  mapCenter: [number, number];
  mapZoom: number;
  activeTileLayer: keyof typeof TILE_PROVIDERS;
  currentLocation: { lat: number; lng: number; accuracy?: number } | null;
  searchMarker: SearchResult | null;
  onSelectLocation: (location: SelectedLocationData) => void;
}

export default function MapView({
  mapCenter,
  mapZoom,
  activeTileLayer,
  currentLocation,
  searchMarker,
  onSelectLocation,
}: MapViewProps) {
  const tileConfig = TILE_PROVIDERS[activeTileLayer];

  // Custom marker icons
  const homeIcon = useRef(createCustomMarkerIcon("home", MAP_LOCATIONS.home.color)).current;
  const uniIcon = useRef(createCustomMarkerIcon("university", MAP_LOCATIONS.university.color)).current;
  const residenceIcon = useRef(createCustomMarkerIcon("residence", MAP_LOCATIONS.residence.color)).current;
  const currentIcon = useRef(createCustomMarkerIcon("current", "#10B981", true)).current;
  const searchIcon = useRef(createCustomMarkerIcon("search", "#EF4444")).current;

  // University coordinates
  const uniLat = MAP_LOCATIONS.university.lat;
  const uniLng = MAP_LOCATIONS.university.lng;

  // Distances
  const homeDistanceToUni = calculateDistance(
    MAP_LOCATIONS.home.lat,
    MAP_LOCATIONS.home.lng,
    uniLat,
    uniLng
  );

  const residenceDistanceToUni = calculateDistance(
    MAP_LOCATIONS.residence.lat,
    MAP_LOCATIONS.residence.lng,
    uniLat,
    uniLng
  );

  const currentDistanceToUni = currentLocation
    ? calculateDistance(currentLocation.lat, currentLocation.lng, uniLat, uniLng)
    : null;

  return (
    <div className="size-full relative z-0">
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false}
        className="size-full"
        style={{ background: "#e5e7eb" }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={tileConfig.maxZoom}
        />

        {/* Parul University Marker */}
        <Marker
          position={[uniLat, uniLng]}
          icon={uniIcon}
          eventHandlers={{
            click: () => {
              onSelectLocation({
                id: "university",
                name: MAP_LOCATIONS.university.name,
                category: "university",
                lat: uniLat,
                lng: uniLng,
                description: MAP_LOCATIONS.university.description,
                iconType: "university",
                color: MAP_LOCATIONS.university.color,
                website: MAP_LOCATIONS.university.website,
                externalMapUrl: MAP_LOCATIONS.university.externalMapUrl,
              });
            },
          }}
        >
          <Popup>
            <div className="p-3 text-xs space-y-1.5 min-w-[210px]">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>{MAP_LOCATIONS.university.name}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                {MAP_LOCATIONS.university.description}
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-black/5 dark:border-white/10 text-[11px]">
                <a
                  href={MAP_LOCATIONS.university.externalMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  External Map ↗
                </a>
                <a
                  href={MAP_LOCATIONS.university.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:underline"
                >
                  Website ↗
                </a>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Current Stay / Work Residence Marker (Vadodara) */}
        <Marker
          position={[MAP_LOCATIONS.residence.lat, MAP_LOCATIONS.residence.lng]}
          icon={residenceIcon}
          eventHandlers={{
            click: () => {
              onSelectLocation({
                id: "residence",
                name: MAP_LOCATIONS.residence.name,
                category: "residence",
                lat: MAP_LOCATIONS.residence.lat,
                lng: MAP_LOCATIONS.residence.lng,
                description: MAP_LOCATIONS.residence.description,
                iconType: "residence",
                color: MAP_LOCATIONS.residence.color,
                distanceToUni: residenceDistanceToUni,
                externalMapUrl: MAP_LOCATIONS.residence.externalMapUrl,
              });
            },
          }}
        >
          <Popup>
            <div className="p-3 text-xs space-y-1.5 min-w-[210px]">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>{MAP_LOCATIONS.residence.name}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                {MAP_LOCATIONS.residence.description}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-medium">
                Distance to University: approx. {formatDistance(residenceDistanceToUni)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Hometown Marker (Deldar, Rajasthan) */}
        <Marker
          position={[MAP_LOCATIONS.home.lat, MAP_LOCATIONS.home.lng]}
          icon={homeIcon}
          eventHandlers={{
            click: () => {
              onSelectLocation({
                id: "home",
                name: MAP_LOCATIONS.home.name,
                category: "home",
                lat: MAP_LOCATIONS.home.lat,
                lng: MAP_LOCATIONS.home.lng,
                description: MAP_LOCATIONS.home.description,
                iconType: "home",
                color: MAP_LOCATIONS.home.color,
                distanceToUni: homeDistanceToUni,
                externalMapUrl: MAP_LOCATIONS.home.externalMapUrl,
              });
            },
          }}
        >
          <Popup>
            <div className="p-3 text-xs space-y-1.5 min-w-[210px]">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>{MAP_LOCATIONS.home.name}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                {MAP_LOCATIONS.home.description}
              </p>
              <p className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-medium">
                Distance to University: approx. {formatDistance(homeDistanceToUni)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Current Location Marker & Accuracy Circle */}
        {currentLocation && (
          <>
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={currentIcon}
              eventHandlers={{
                click: () => {
                  onSelectLocation({
                    id: "current",
                    name: "Current Location",
                    category: "current",
                    lat: currentLocation.lat,
                    lng: currentLocation.lng,
                    description: `Detected Coordinates: ${currentLocation.lat.toFixed(4)}° N, ${currentLocation.lng.toFixed(4)}° E`,
                    iconType: "current",
                    color: "#10B981",
                    distanceToUni: currentDistanceToUni,
                  });
                },
              }}
            >
              <Popup>
                <div className="p-3 text-xs space-y-1.5 min-w-[210px]">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>You are here</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Current location via browser geolocation.
                  </p>
                  {currentDistanceToUni !== null && (
                    <p className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                      Distance to University: approx. {formatDistance(currentDistanceToUni)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {currentLocation.accuracy && (
              <Circle
                center={[currentLocation.lat, currentLocation.lng]}
                radius={currentLocation.accuracy}
                pathOptions={{
                  fillColor: "#10B981",
                  fillOpacity: 0.12,
                  color: "#10B981",
                  weight: 1.5,
                  dashArray: "4 4",
                }}
              />
            )}
          </>
        )}

        {/* Search Result Marker */}
        {searchMarker && (
          <Marker
            position={[searchMarker.lat, searchMarker.lng]}
            icon={searchIcon}
            eventHandlers={{
              click: () => {
                const dist = calculateDistance(searchMarker.lat, searchMarker.lng, uniLat, uniLng);
                onSelectLocation({
                  id: `search-${searchMarker.id}`,
                  name: searchMarker.name,
                  category: "search",
                  lat: searchMarker.lat,
                  lng: searchMarker.lng,
                  description: searchMarker.displayName,
                  iconType: "search",
                  color: "#EF4444",
                  distanceToUni: dist,
                });
              },
            }}
          >
            <Popup>
              <div className="p-3 text-xs space-y-1 min-w-[210px]">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{searchMarker.name}</p>
                <p className="text-gray-600 dark:text-gray-300 text-[11px]">{searchMarker.displayName}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
