import React from "react";
import { formatDistance } from "./mapUtils";

export interface SelectedLocationData {
  id: string;
  name: string;
  category: "home" | "university" | "residence" | "current" | "search" | "landmark";
  lat: number;
  lng: number;
  description: string;
  iconType: "home" | "university" | "residence" | "current" | "search" | "landmark";
  color: string;
  distanceToUni?: number | null;
  externalMapUrl?: string;
  website?: string;
}

interface LocationInfoProps {
  location: SelectedLocationData | null;
  onClose: () => void;
  onNavigateToUni?: () => void;
}

function renderLocationIcon(type: string, color: string) {
  switch (type) {
    case "home":
      return (
        <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "residence":
      return (
        <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "university":
      return (
        <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "current":
      return (
        <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      );
    case "landmark":
      return (
        <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="4" y1="22" x2="20" y2="22" />
          <line x1="4" y1="2" x2="20" y2="2" />
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="6" x2="8" y2="22" />
          <line x1="16" y1="6" x2="16" y2="22" />
          <line x1="12" y1="6" x2="12" y2="22" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
  }
}

export default function LocationInfo({
  location,
  onClose,
  onNavigateToUni,
}: LocationInfoProps) {
  if (!location) return null;

  const osmUrl =
    location.externalMapUrl ||
    `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=15/${location.lat}/${location.lng}`;

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[1000] animate-fadeIn pointer-events-auto">
      <div className="bg-white/90 dark:bg-[#181b22]/90 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-2xl p-4 shadow-2xl space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{
                backgroundColor: `${location.color}22`,
                border: `1.5px solid ${location.color}55`,
              }}
            >
              {renderLocationIcon(location.iconType || location.category, location.color)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                {location.name}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize font-medium">
                {location.category === "current"
                  ? "Your Detected Location"
                  : location.category === "home"
                  ? "Hometown (Deldar, Rajasthan)"
                  : location.category === "residence"
                  ? "Current Residence & Work Stay"
                  : location.category === "university"
                  ? "Parul University (Academic)"
                  : location.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Description & Distance */}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          {location.description}
        </p>

        {location.distanceToUni !== undefined && location.distanceToUni !== null && location.category !== "university" && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-xl w-max">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            </svg>
            <span className="font-medium font-mono">
              Distance to Parul University: approx. {formatDistance(location.distanceToUni)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={osmUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Open in External Maps</span>
            <span>↗</span>
          </a>

          {location.website && (
            <a
              href={location.website}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/5 transition-all"
            >
              Website ↗
            </a>
          )}

          {location.category !== "university" && onNavigateToUni && (
            <button
              onClick={onNavigateToUni}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/5 dark:border-white/5 transition-all flex items-center gap-1.5"
              title="Focus University on map"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              </svg>
              <span>Focus University</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
