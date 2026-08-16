import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "~/stores";
import { getCuratedWallpapers } from "~/data/animeWallpapersData";

export interface WallpaperHit {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth?: number;
  previewHeight?: number;
  webformatURL: string;
  webformatWidth?: number;
  webformatHeight?: number;
  largeImageURL: string;
  videoUrl?: string;
  isVideo?: boolean;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

const CATEGORIES = [
  "Anime",
  "Cyberpunk",
  "Samurai",
  "Fantasy",
  "Nature Anime",
  "Anime City",
  "Dark Anime",
  "Gaming Anime",
];

// Strict Adult / NSFW / Suggestive Keywords List
const NSFW_KEYWORDS = [
  "nsfw", "18+", "adult", "nude", "nudity", "porn", "porno", "sex", "xxx", "hentai",
  "erotic", "explicit", "ecchi", "lewd", "fetish", "bikini", "boobs", "dick", "pussy",
  "vagina", "penis", "butt", "ass", "naked", "topless", "sensual", "sexy", "hot",
  "lingerie", "swimsuit", "strip", "bondage", "breast", "breasts", "cleavage",
  "thong", "undressed", "underwear", "bra", "panties", "nipple", "nipples",
  "orgasm", "masturbat", "seduction", "seductive", "provocative", "aroused",
  "xvideos", "pornhub", "xhamster", "xnxx", "stripchat", "onlyfans", "chaturbate",
  "redtube", "youporn", "brazzers", "youjizz", "beeg", "bitch", "slut", "whore"
];

function checkNSFW(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return NSFW_KEYWORDS.some((kw) => {
    if (kw === "18+") return normalized.includes("18+");
    return new RegExp(`\\b${kw.replace("+", "\\+")}\\b`, "i").test(normalized) || normalized.includes(kw);
  });
}

// Vector Icons
const RefreshSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const SearchSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MonitorSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const DownloadSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const HeartSVG = ({ className = "w-4 h-4", filled = false }: { className?: string; filled?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CheckSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ImageIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ShieldSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export default function AnimeWallpapers() {
  const setWallpaper = useStore((state) => state.setWallpaper);
  
  const [wallpapers, setWallpapers] = useState<WallpaperHit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>("anime");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [activeCategory, setActiveCategory] = useState<string>("Anime");
  const [page, setPage] = useState<number>(1);
  
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperHit | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("anime_wallpaper_favs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("anime_wallpaper_favs", JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const fetchWallpapers = useCallback(
    async (query: string, targetPage: number, targetMedia: "image" | "video") => {
      setLoading(true);
      setError(null);

      // FRONTEND SEARCH PROTECTION: Block adult/NSFW searches before making any network request
      if (checkNSFW(query)) {
        setWallpapers([]);
        setError("No suitable wallpapers found. Try another search.");
        setLoading(false);
        return;
      }

      try {
        const qParam = encodeURIComponent(query || "anime");
        let rawHits: WallpaperHit[] = [];

        try {
          const res = await fetch(
            `/api/wallpapers?q=${qParam}&media=${targetMedia}&page=${targetPage}&per_page=10`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.hits && Array.isArray(data.hits) && data.hits.length > 0) {
              rawHits = data.hits;
            }
          }
        } catch {
          // Handled gracefully below via curated library
        }

        // Seamless fallback to high quality built-in 4K Anime Wallpapers library
        if (rawHits.length === 0) {
          const curated = getCuratedWallpapers(query, targetMedia, targetPage, 10);
          rawHits = curated.hits;
        }

        // FRONTEND RESULT VALIDATION: Inspect metadata / tags & filter out questionable or suggestive hits
        const safeHits = rawHits.filter((item) => {
          const metaStr = `${item.tags || ""} ${item.user || ""} ${item.pageURL || ""}`;
          return !checkNSFW(metaStr);
        });

        if (safeHits.length === 0) {
          if (targetPage > 1) {
            setPage(1);
            fetchWallpapers(query, 1, targetMedia);
            return;
          } else {
            const defaultCurated = getCuratedWallpapers("anime", targetMedia, 1, 10);
            setWallpapers(defaultCurated.hits);
            setError(null);
          }
        } else {
          setWallpapers(safeHits);
          setError(null);
        }
      } catch {
        const defaultCurated = getCuratedWallpapers(query, targetMedia, 1, 10);
        setWallpapers(defaultCurated.hits);
        setError(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchWallpapers(searchQuery, page, mediaType);
  }, [page, mediaType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (checkNSFW(searchQuery)) {
      setWallpapers([]);
      setError("No suitable wallpapers found. Try another search.");
      return;
    }

    setActiveCategory("");
    setPage(1);
    fetchWallpapers(searchQuery, 1, mediaType);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    const query = cat === "Anime" ? "anime" : `${cat} anime`;
    setSearchQuery(query);
    setPage(1);
    fetchWallpapers(query, 1, mediaType);
  };

  const handleMediaTypeChange = (type: "image" | "video") => {
    if (mediaType === type) return;
    setMediaType(type);
    setPage(1);
  };

  const handleReload = () => {
    if (loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
  };

  const handleApplyWallpaper = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWallpaper(url);
    setToastMessage("Live Desktop & Lock Screen Wallpaper Applied");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = async (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!url || typeof url !== "string") return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || (mediaType === "video" ? "live-wallpaper.mp4" : "wallpaper.jpg");
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      if (/^https?:\/\//i.test(url)) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  const currentIndex = selectedWallpaper
    ? wallpapers.findIndex((w) => w.id === selectedWallpaper.id)
    : -1;

  return (
    <div className="size-full bg-[#0b0d13] text-gray-100 flex flex-col overflow-y-auto select-none font-sans relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-600/90 text-white text-xs font-semibold rounded-full shadow-xl backdrop-blur-md border border-blue-400/40 flex items-center space-x-2"
          >
            <CheckSVG className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#11131c]/95 backdrop-blur-md border-b border-white/10 px-5 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-white tracking-wide">
                Anime {mediaType === "video" ? "Live Video" : ""} Wallpapers
              </h1>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold tracking-wider">
                FAMILY SAFE (SFW)
              </span>
            </div>
            <p className="text-xs text-gray-400">
              High-resolution 4K Ultra HD static & animated live wallpapers (Strict SFW Family-Friendly)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Media Type Switcher */}
            <div className="flex items-center p-1 bg-[#181a24] border border-white/10 rounded-lg">
              <button
                onClick={() => handleMediaTypeChange("image")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mediaType === "image"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Wallpapers</span>
              </button>

              <button
                onClick={() => handleMediaTypeChange("video")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mediaType === "video"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Live Video</span>
              </button>
            </div>

            {/* Reload Button */}
            <button
              onClick={handleReload}
              disabled={loading}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                loading
                  ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm"
              }`}
            >
              <RefreshSVG className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Loading..." : `Reload (Page ${page})`}</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="max-w-7xl mx-auto mt-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative max-w-lg">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search family-safe anime ${mediaType === "video" ? "live videos" : "wallpapers"}...`}
              className="w-full bg-[#181a24] border border-white/12 rounded-lg pl-9 pr-20 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <SearchSVG className="absolute left-3 top-2.5 text-gray-400 w-3.5 h-3.5" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600/80 hover:bg-blue-500 text-[11px] font-semibold text-white rounded transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-[#161822] text-gray-400 border-white/8 hover:text-white hover:bg-[#1e202d]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5">
        {/* Skeleton Loader */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-[#141620] border border-white/5 rounded-xl h-56 animate-pulse flex flex-col justify-between p-3">
                <div className="bg-white/5 h-36 rounded-lg w-full" />
                <div className="space-y-2">
                  <div className="bg-white/5 h-3 rounded w-2/3" />
                  <div className="bg-white/5 h-3 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty / Error / Rejected Search State */}
        {!loading && (error || wallpapers.length === 0) && (
          <div className="my-16 text-center flex flex-col items-center justify-center p-8 bg-[#13151f] border border-white/10 rounded-2xl max-w-md mx-auto">
            <div className="p-3 bg-white/5 rounded-full mb-3 text-gray-400">
              <ShieldSVG className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              No suitable wallpapers found. Try another search.
            </h3>
            <p className="text-xs text-gray-400 mb-4 max-w-xs leading-relaxed">
              Strict family-friendly SFW protection is active. Content containing adult or suggestive terms is automatically blocked.
            </p>
            <button
              onClick={() => handleCategoryClick("Anime")}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors"
            >
              Reset to Safe Anime Wallpapers
            </button>
          </div>
        )}

        {/* Safe Wallpapers Grid */}
        {!loading && wallpapers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {wallpapers.map((item) => {
              const isFav = favorites.includes(item.id);
              const firstTag = item.tags.split(",")[0]?.trim() || "Anime";
              const isVideo = item.isVideo || item.type === "video" || mediaType === "video";
              const mediaUrl = item.largeImageURL || item.webformatURL;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedWallpaper(item)}
                  className="group relative bg-[#13151f] border border-white/10 hover:border-blue-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
                >
                  {/* Media Frame */}
                  <div className="relative h-44 w-full bg-gray-950 overflow-hidden">
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                    ) : (
                      <img
                        src={item.webformatURL}
                        alt={item.tags}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 bg-blue-600/90 backdrop-blur-md rounded text-[9px] font-bold text-white shadow-sm border border-blue-400/40">
                        SFW 4K
                      </span>
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-gray-300 border border-white/10 uppercase tracking-wider flex items-center space-x-1">
                        {isVideo && <VideoIcon className="w-3 h-3 text-blue-400" />}
                        <span>{isVideo ? "LIVE VIDEO" : firstTag}</span>
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-md border transition-all ${
                        isFav
                          ? "bg-red-500/80 border-red-400 text-white"
                          : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <HeartSVG className="w-3.5 h-3.5" filled={isFav} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="truncate max-w-[130px] font-medium text-gray-300">
                          {item.user}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          #{item.id}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center space-x-2 pt-1 border-t border-white/5">
                      <button
                        onClick={(e) => handleApplyWallpaper(mediaUrl, e)}
                        className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
                      >
                        <MonitorSVG className="w-3.5 h-3.5" />
                        <span>Set {isVideo ? "Live" : ""} Wallpaper</span>
                      </button>

                      <button
                        onClick={(e) =>
                          handleDownload(
                            mediaUrl,
                            `anime-${isVideo ? "live-wallpaper.mp4" : "wallpaper.jpg"}`,
                            e
                          )
                        }
                        className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                        title="Download"
                      >
                        <DownloadSVG className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedWallpaper(null)}
              className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white transition-colors"
            >
              <CloseSVG className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full bg-[#12141d] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]"
            >
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[280px]">
                {selectedWallpaper.isVideo || selectedWallpaper.type === "video" || mediaType === "video" ? (
                  <video
                    src={selectedWallpaper.largeImageURL || selectedWallpaper.webformatURL}
                    autoPlay
                    loop
                    controls
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedWallpaper.largeImageURL}
                    alt={selectedWallpaper.tags}
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              <div className="w-full md:w-72 p-5 flex flex-col justify-between bg-[#151722] border-t md:border-t-0 md:border-l border-white/10 space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                      <ShieldSVG className="w-3 h-3 text-blue-400" />
                      <span>SFW {selectedWallpaper.isVideo || mediaType === "video" ? "Live Video" : "Illustration"}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-white mt-1 capitalize truncate">
                      {selectedWallpaper.tags.split(",")[0]}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      By {selectedWallpaper.user}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="text-gray-400 text-[10px]">Views</div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedWallpaper.views.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="text-gray-400 text-[10px]">Likes</div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedWallpaper.likes.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="text-gray-400 text-[10px]">Resolution</div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedWallpaper.imageWidth}×{selectedWallpaper.imageHeight}
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                      <div className="text-gray-400 text-[10px]">Downloads</div>
                      <div className="font-semibold text-white mt-0.5">
                        {selectedWallpaper.downloads.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleApplyWallpaper(selectedWallpaper.largeImageURL || selectedWallpaper.webformatURL)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <MonitorSVG className="w-3.5 h-3.5" />
                    <span>Set Desktop & Lock Screen</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        selectedWallpaper.largeImageURL || selectedWallpaper.webformatURL,
                        `anime-${mediaType === "video" ? "live-wallpaper.mp4" : "wallpaper.jpg"}`
                      )
                    }
                    className="w-full py-2 bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-medium rounded-lg border border-white/10 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <DownloadSVG className="w-3.5 h-3.5" />
                    <span>Download Wallpaper</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
