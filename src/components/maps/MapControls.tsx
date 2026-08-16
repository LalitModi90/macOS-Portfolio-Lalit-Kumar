import React, { useState } from "react";
import { MAP_LOCATIONS, TILE_PROVIDERS } from "./mapConfig";
import { formatDistance, searchLocation, type SearchResult } from "./mapUtils";

interface MapControlsProps {
  onSelectLocation: (lat: number, lng: number, zoom?: number) => void;
  onLocateMe: () => void;
  onReset: () => void;
  isLocating: boolean;
  locationError: string | null;
  currentLocation: { lat: number; lng: number; accuracy?: number } | null;
  distanceHomeToUni: number;
  distanceResidenceToUni: number;
  distanceCurrentToUni: number | null;
  activeTileLayer: keyof typeof TILE_PROVIDERS;
  onChangeTileLayer: (layer: keyof typeof TILE_PROVIDERS) => void;
  onSelectSearchResult: (result: SearchResult) => void;
}

export default function MapControls({
  onSelectLocation,
  onLocateMe,
  onReset,
  isLocating,
  locationError,
  currentLocation,
  distanceHomeToUni,
  distanceResidenceToUni,
  distanceCurrentToUni,
  activeTileLayer,
  onChangeTileLayer,
  onSelectSearchResult,
}: MapControlsProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchLocation(query);
      if (res.length === 0) {
        setSearchError("No locations found for this query.");
      } else {
        setResults(res);
        setShowResults(true);
      }
    } catch {
      setSearchError("Location search is temporarily unavailable.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setShowResults(false);
    setQuery(result.name);
    onSelectSearchResult(result);
  };

  return (
    <div className="absolute top-3 inset-x-3 z-[1000] pointer-events-none flex flex-col gap-2">
      {/* Top Floating Glass Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white/85 dark:bg-[#181a20]/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl pointer-events-auto transition-all">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm flex items-center">
          <input
            type="text"
            placeholder="Search location (e.g. Vadodara, Mumbai)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="w-full bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-xs sm:text-sm pl-8 pr-7 py-1.5 rounded-xl outline-none border border-transparent focus:border-blue-500/50 transition-colors"
          />
          <span className="absolute left-2.5 text-gray-400 select-none pointer-events-none flex items-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
            >
              ✕
            </button>
          )}
          {isSearching && (
            <div className="absolute right-7 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}

          {/* Search Dropdown Results */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-[#1c1e24]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto">
              {results.map((res) => (
                <div
                  key={res.id}
                  onClick={() => handleSelectResult(res)}
                  className="px-3 py-2 text-xs hover:bg-blue-500/15 cursor-pointer text-gray-800 dark:text-gray-200 border-b border-black/5 dark:border-white/5 last:border-none transition-colors"
                >
                  <p className="font-semibold">{res.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{res.displayName}</p>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Locate Me */}
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            title="Locate current position"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLocating ? (
              <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
              </svg>
            )}
            <span className="hidden sm:inline">Locate Me</span>
          </button>

          {/* Hometown */}
          <button
            onClick={() => onSelectLocation(MAP_LOCATIONS.home.lat, MAP_LOCATIONS.home.lng, 14)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all active:scale-95"
            title="Focus Hometown (Deldar, Rajasthan)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:inline">Hometown</span>
          </button>

          {/* Current Stay / Work Residence */}
          <button
            onClick={() => onSelectLocation(MAP_LOCATIONS.residence.lat, MAP_LOCATIONS.residence.lng, 15)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
            title="Focus Current Residence (Pangat Park, Waghodia Road)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span className="hidden sm:inline">Current Stay</span>
          </button>

          {/* University */}
          <button
            onClick={() => onSelectLocation(MAP_LOCATIONS.university.lat, MAP_LOCATIONS.university.lng, 15)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-all active:scale-95"
            title="Focus Parul University"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span className="hidden sm:inline">University</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-xl text-xs font-medium bg-gray-500/15 hover:bg-gray-500/25 text-gray-700 dark:text-gray-300 border border-gray-500/20 transition-all active:scale-95 flex items-center justify-center"
            title="Reset map view"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>

          {/* Map Layer Switcher */}
          <div className="flex bg-black/5 dark:bg-white/10 p-0.5 rounded-xl border border-black/5 dark:border-white/5">
            {(Object.keys(TILE_PROVIDERS) as (keyof typeof TILE_PROVIDERS)[]).map((layer) => (
              <button
                key={layer}
                onClick={() => onChangeTileLayer(layer)}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all capitalize ${
                  activeTileLayer === layer
                    ? "bg-white dark:bg-[#2c303b] text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {TILE_PROVIDERS[layer].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info / Distance & Error Notifications HUD */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Residence Stay -> University Distance Pill */}
        <div className="flex items-center gap-1.5 bg-white/85 dark:bg-[#181a20]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 px-3 py-1 rounded-full shadow-md text-xs">
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            </svg>
            Stay
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-blue-500 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            </svg>
            Uni
          </span>
          <span className="text-gray-700 dark:text-gray-300 font-mono font-medium">
            Approx. {formatDistance(distanceResidenceToUni)}
          </span>
        </div>

        {/* Hometown -> University Distance Pill */}
        <div className="flex items-center gap-1.5 bg-white/85 dark:bg-[#181a20]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 px-3 py-1 rounded-full shadow-md text-xs">
          <span className="text-amber-500 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
            </svg>
            Hometown
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-blue-500 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            </svg>
            Uni
          </span>
          <span className="text-gray-700 dark:text-gray-300 font-mono font-medium">
            Approx. {formatDistance(distanceHomeToUni)}
          </span>
        </div>

        {/* Live Detected Location Distance */}
        {currentLocation && distanceCurrentToUni !== null && (
          <div className="flex items-center gap-1.5 bg-emerald-500/15 backdrop-blur-xl border border-emerald-500/30 px-3 py-1 rounded-full shadow-md text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
            <span className="flex items-center gap-1 font-semibold">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
              </svg>
              Live Location
            </span>
            <span className="text-gray-400">→</span>
            <span className="font-semibold">Uni</span>
            <span className="font-mono font-medium">
              Approx. {formatDistance(distanceCurrentToUni)}
            </span>
          </div>
        )}

        {/* Location / Search Error Alert */}
        {(locationError || searchError) && (
          <div className="flex items-center gap-1.5 bg-rose-500/15 backdrop-blur-xl border border-rose-500/30 px-3 py-1 rounded-full shadow-md text-xs text-rose-600 dark:text-rose-400 animate-fadeIn">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{locationError || searchError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
