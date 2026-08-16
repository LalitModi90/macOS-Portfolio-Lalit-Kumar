import React, { useState, useEffect, useCallback } from "react";
import {
  MAP_LOCATIONS,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  TILE_PROVIDERS,
} from "~/components/maps/mapConfig";
import { calculateDistance, type SearchResult } from "~/components/maps/mapUtils";
import MapControls from "~/components/maps/MapControls";
import MapView from "~/components/maps/MapView";
import LocationInfo, { type SelectedLocationData } from "~/components/maps/LocationInfo";

export default function Maps() {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_MAP_ZOOM);
  const [activeTileLayer, setActiveTileLayer] = useState<keyof typeof TILE_PROVIDERS>("voyager");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationData | null>({
    id: "residence",
    name: MAP_LOCATIONS.residence.name,
    category: "residence",
    lat: MAP_LOCATIONS.residence.lat,
    lng: MAP_LOCATIONS.residence.lng,
    description: MAP_LOCATIONS.residence.description,
    iconType: "residence",
    color: MAP_LOCATIONS.residence.color,
    distanceToUni: calculateDistance(
      MAP_LOCATIONS.residence.lat,
      MAP_LOCATIONS.residence.lng,
      MAP_LOCATIONS.university.lat,
      MAP_LOCATIONS.university.lng
    ),
    externalMapUrl: MAP_LOCATIONS.residence.externalMapUrl,
  });
  const [searchMarker, setSearchMarker] = useState<SearchResult | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // University coordinates
  const uniLat = MAP_LOCATIONS.university.lat;
  const uniLng = MAP_LOCATIONS.university.lng;

  // Distances
  const distanceHomeToUni = calculateDistance(
    MAP_LOCATIONS.home.lat,
    MAP_LOCATIONS.home.lng,
    uniLat,
    uniLng
  );

  const distanceResidenceToUni = calculateDistance(
    MAP_LOCATIONS.residence.lat,
    MAP_LOCATIONS.residence.lng,
    uniLat,
    uniLng
  );

  const distanceCurrentToUni = currentLocation
    ? calculateDistance(currentLocation.lat, currentLocation.lng, uniLat, uniLng)
    : null;

  // Handle Geolocation
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Location services are not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newLoc = { lat: latitude, lng: longitude, accuracy };
        setCurrentLocation(newLoc);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        setIsLocating(false);

        const dist = calculateDistance(latitude, longitude, uniLat, uniLng);
        setSelectedLocation({
          id: "current",
          name: "Current Location",
          category: "current",
          lat: latitude,
          lng: longitude,
          description: `Detected Coordinates: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (±${Math.round(accuracy)}m)`,
          iconType: "current",
          color: "#10B981",
          distanceToUni: dist,
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission was denied. Please allow location access to use Current Location.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Your current location could not be determined.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to retrieve location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [uniLat, uniLng]);

  // Select a preset location
  const handleSelectCoordinate = (lat: number, lng: number, zoom = 15) => {
    setMapCenter([lat, lng]);
    setMapZoom(zoom);

    if (lat === MAP_LOCATIONS.university.lat && lng === MAP_LOCATIONS.university.lng) {
      setSelectedLocation({
        id: "university",
        name: MAP_LOCATIONS.university.name,
        category: "university",
        lat,
        lng,
        description: MAP_LOCATIONS.university.description,
        iconType: "university",
        color: MAP_LOCATIONS.university.color,
        website: MAP_LOCATIONS.university.website,
        externalMapUrl: MAP_LOCATIONS.university.externalMapUrl,
      });
    } else if (lat === MAP_LOCATIONS.home.lat && lng === MAP_LOCATIONS.home.lng) {
      setSelectedLocation({
        id: "home",
        name: MAP_LOCATIONS.home.name,
        category: "home",
        lat,
        lng,
        description: MAP_LOCATIONS.home.description,
        iconType: "home",
        color: MAP_LOCATIONS.home.color,
        distanceToUni: distanceHomeToUni,
        externalMapUrl: MAP_LOCATIONS.home.externalMapUrl,
      });
    } else if (lat === MAP_LOCATIONS.residence.lat && lng === MAP_LOCATIONS.residence.lng) {
      setSelectedLocation({
        id: "residence",
        name: MAP_LOCATIONS.residence.name,
        category: "residence",
        lat,
        lng,
        description: MAP_LOCATIONS.residence.description,
        iconType: "residence",
        color: MAP_LOCATIONS.residence.color,
        distanceToUni: distanceResidenceToUni,
        externalMapUrl: MAP_LOCATIONS.residence.externalMapUrl,
      });
    }
  };

  // Reset view
  const handleReset = () => {
    setMapCenter(DEFAULT_MAP_CENTER);
    setMapZoom(DEFAULT_MAP_ZOOM);
    setSearchMarker(null);
    setSelectedLocation({
      id: "residence",
      name: MAP_LOCATIONS.residence.name,
      category: "residence",
      lat: MAP_LOCATIONS.residence.lat,
      lng: MAP_LOCATIONS.residence.lng,
      description: MAP_LOCATIONS.residence.description,
      iconType: "residence",
      color: MAP_LOCATIONS.residence.color,
      distanceToUni: distanceResidenceToUni,
      externalMapUrl: MAP_LOCATIONS.residence.externalMapUrl,
    });
  };

  // Handle Search Result Selection
  const handleSelectSearchResult = (result: SearchResult) => {
    setSearchMarker(result);
    setMapCenter([result.lat, result.lng]);
    setMapZoom(14);
    const dist = calculateDistance(result.lat, result.lng, uniLat, uniLng);
    setSelectedLocation({
      id: `search-${result.id}`,
      name: result.name,
      category: "search",
      lat: result.lat,
      lng: result.lng,
      description: result.displayName,
      iconType: "search",
      color: "#EF4444",
      distanceToUni: dist,
    });
  };

  // Listen for cross-component triggers (e.g. from Siri or Terminal)
  useEffect(() => {
    const handleFocusUni = () => handleSelectCoordinate(MAP_LOCATIONS.university.lat, MAP_LOCATIONS.university.lng, 15);
    const handleFocusHome = () => handleSelectCoordinate(MAP_LOCATIONS.home.lat, MAP_LOCATIONS.home.lng, 14);
    const handleFocusResidence = () => handleSelectCoordinate(MAP_LOCATIONS.residence.lat, MAP_LOCATIONS.residence.lng, 15);
    const handleLocateTrigger = () => handleLocateMe();

    window.addEventListener("maps:focusUniversity", handleFocusUni);
    window.addEventListener("maps:focusHome", handleFocusHome);
    window.addEventListener("maps:focusResidence", handleFocusResidence);
    window.addEventListener("maps:locateMe", handleLocateTrigger);

    return () => {
      window.removeEventListener("maps:focusUniversity", handleFocusUni);
      window.removeEventListener("maps:focusHome", handleFocusHome);
      window.removeEventListener("maps:focusResidence", handleFocusResidence);
      window.removeEventListener("maps:locateMe", handleLocateTrigger);
    };
  }, [handleLocateMe]);

  return (
    <div className="size-full relative overflow-hidden bg-gray-100 dark:bg-gray-900 select-none">
      {/* Floating Top Controls & Search */}
      <MapControls
        onSelectLocation={handleSelectCoordinate}
        onLocateMe={handleLocateMe}
        onReset={handleReset}
        isLocating={isLocating}
        locationError={locationError}
        currentLocation={currentLocation}
        distanceHomeToUni={distanceHomeToUni}
        distanceResidenceToUni={distanceResidenceToUni}
        distanceCurrentToUni={distanceCurrentToUni}
        activeTileLayer={activeTileLayer}
        onChangeTileLayer={setActiveTileLayer}
        onSelectSearchResult={handleSelectSearchResult}
      />

      {/* Leaflet Map Canvas */}
      <MapView
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        activeTileLayer={activeTileLayer}
        currentLocation={currentLocation}
        searchMarker={searchMarker}
        onSelectLocation={setSelectedLocation}
      />

      {/* Bottom Selected Location Card */}
      <LocationInfo
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        onNavigateToUni={() => handleSelectCoordinate(uniLat, uniLng, 15)}
      />
    </div>
  );
}
