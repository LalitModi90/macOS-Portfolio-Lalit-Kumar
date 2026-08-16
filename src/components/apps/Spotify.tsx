import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { searchDeezer, formatDeezerDuration, type DeezerTrack } from "~/utils/deezerService";
import { useStore } from "~/stores";

export default function Spotify() {
  const dark = useStore((state) => state.dark);
  const [activeTab, setActiveTab] = useState<"home" | "search" | "library" | "lyrics">("home");
  const [isMobile, setIsMobile] = useState(false);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Player States
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSong, setCurrentSong] = useState<DeezerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  // Ref to the HTML5 Audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Fetch initial trending tracks on mount
  useEffect(() => {
    async function loadTrending() {
      setLoading(true);
      setError(null);
      try {
        const res = await searchDeezer("top hits");
        setSongs(res.tracks);
        if (res.tracks.length > 0) {
          setCurrentSong(res.tracks[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load default tracks.");
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  // Debounced search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    const delay = setTimeout(async () => {
      try {
        const res = await searchDeezer(searchQuery);
        setSongs(res.tracks);
        if (res.tracks.length === 0) {
          setError("No results found.");
        }
      } catch (err: any) {
        setError(err.message || "Search failed. Check network connection.");
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Audio Playback Synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Load new track
    audio.src = currentSong.previewUrl;
    audio.load();
    audio.volume = volume / 100;

    if (isPlaying) {
      audio.play().catch((e) => {
        console.warn("Autoplay block or playback interrupted:", e);
        setIsPlaying(false);
      });
    }
  }, [currentSong]);

  // Play/Pause state change handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Voice Assistant Integration — listen for global events
  useEffect(() => {
    const handleVoiceSearch = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { query, playImmediately } = customEvent.detail || {};
      
      if (query) {
        setSearchQuery(query);
        setActiveTab("search");
        setLoading(true);
        setError(null);
        try {
          const res = await searchDeezer(query);
          setSongs(res.tracks);
          if (res.tracks.length > 0) {
            const match = res.tracks[0];
            setCurrentSong(match);
            if (playImmediately && match.previewUrl) {
              setIsPlaying(true);
            }
          } else {
            setError(`No results found for "${query}"`);
          }
        } catch (err: any) {
          setError(err.message || "Search failed.");
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener("spotify:voiceSearch", handleVoiceSearch);
    return () => window.removeEventListener("spotify:voiceSearch", handleVoiceSearch);
  }, []);

  // Audio Progress Handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Auto-advance to next song if available
    handleNext();
  };

  // Skip handlers
  const handleNext = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
      setIsPlaying(true);
    } else {
      // Loop back to start
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
      setIsPlaying(true);
    } else {
      // Go to end
      setCurrentSong(songs[songs.length - 1]);
      setIsPlaying(true);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleLike = (songId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedTracks((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const handleSelectSong = (song: DeezerTrack) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const categories = [
    { title: "Today's Top Hits", icon: "i-ph:fire-bold", color: "from-rose-500 to-pink-600", query: "top hits" },
    { title: "Chill Lofi Coding", icon: "i-ph:code-bold", color: "from-purple-500 to-indigo-600", query: "lofi hip hop beats" },
    { title: "Deep Focus", icon: "i-ph:brain-bold", color: "from-blue-500 to-cyan-600", query: "piano ambient instrumental" },
    { title: "Bollywood Hits", icon: "i-ph:music-notes-bold", color: "from-amber-500 to-orange-600", query: "Arijit Singh" }
  ];

  return (
    <div
      className="w-full h-full flex flex-col font-sans select-none overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #16181f 0%, #0c0d12 100%)",
        color: "#ffffff"
      }}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        {!isMobile && (
          <div
            style={{ width: "230px" }}
            className="flex-shrink-0 bg-[#07080c]/60 p-4 flex flex-col justify-between border-r border-[#20222a] backdrop-blur-xl"
          >
            <div className="space-y-6">
              {/* Deezer Music Brand Header */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 via-pink-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-pink-500/10">
                  <span className="i-ph:music-notes-bold text-white text-base" />
                </div>
                <span className="font-extrabold text-sm tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                  Deezer Music
                </span>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "home"
                      ? "bg-[#2b2d38]/80 text-cyan-400 shadow-md border border-[#3e4252]"
                      : "text-[#8e92a4] hover:text-white hover:bg-[#1a1c24]/50"
                  }`}
                >
                  <span className="i-ph:house-fill text-base" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveTab("search")}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "search"
                      ? "bg-[#2b2d38]/80 text-cyan-400 shadow-md border border-[#3e4252]"
                      : "text-[#8e92a4] hover:text-white hover:bg-[#1a1c24]/50"
                  }`}
                >
                  <span className="i-ph:magnifying-glass-bold text-base" />
                  <span>Search</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("lyrics");
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "lyrics"
                      ? "bg-[#2b2d38]/80 text-cyan-400 shadow-md border border-[#3e4252]"
                      : "text-[#8e92a4] hover:text-white hover:bg-[#1a1c24]/50"
                  }`}
                >
                  <span className="i-ph:microphone-stage-bold text-base" />
                  <span>Lyrics & Visuals</span>
                </button>
              </nav>

              {/* Playlists Section */}
              <div className="pt-4 border-t border-[#20222a]">
                <div className="flex items-center justify-between px-2 mb-2.5 text-[#5e6274] text-[10px] font-extrabold uppercase tracking-widest">
                  <span>Your Collection</span>
                  <span className="i-ph:books-bold text-xs" />
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab("home");
                      setSearchQuery("Arijit Singh");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#8e92a4] hover:text-white hover:bg-[#1a1c24]/50 transition-colors truncate"
                  >
                    <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-[9px] text-white">
                      ♥
                    </span>
                    <span className="truncate">Liked Songs ({likedTracks.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("home");
                      setSearchQuery("Coding Lofi");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#8e92a4] hover:text-white hover:bg-[#1a1c24]/50 transition-colors truncate"
                  >
                    <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0 text-[9px] text-white">
                      ⚡
                    </span>
                    <span className="truncate">Coding & Focus Beats</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Bar */}
            <div className="p-3 rounded-2xl bg-[#0c0d12]/90 border border-[#20222a] flex items-center gap-3">
              <img
                src="https://avatars.githubusercontent.com/u/161499599?v=4"
                alt="Lalit"
                className="w-8 h-8 rounded-xl object-cover border border-cyan-400/50"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Lalit Kumar</div>
                <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Deezer Connected
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0e15]/40 backdrop-blur-lg">
          {/* Header Bar */}
          <div className="p-4 bg-[#0d0e15]/80 flex items-center justify-between gap-4 border-b border-[#1c1e28]">
            <div className="flex-1 max-w-md relative flex items-center">
              <span className="i-ph:magnifying-glass absolute left-3.5 text-slate-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, or playlists..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#191a24] text-white text-xs placeholder:text-slate-500 border border-transparent focus:border-cyan-500/50 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* API Status */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              {loading ? (
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Searching Deezer...</span>
                </div>
              ) : (
                <span className="text-[10px] uppercase tracking-wider bg-[#1c1e28] px-3 py-1.5 rounded-xl border border-[#2b2d3b] text-slate-300">
                  Deezer API Proxy
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {activeTab === "home" && !searchQuery && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400 mb-2">
                  Quick Playlists
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((c) => (
                    <div
                      key={c.title}
                      onClick={() => setSearchQuery(c.query)}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${c.color} cursor-pointer hover:scale-[1.03] transition-all shadow-lg flex items-center justify-between text-white border border-white/5 group`}
                    >
                      <div>
                        <span className="text-xs font-extrabold tracking-wide drop-shadow-sm">{c.title}</span>
                      </div>
                      <span className={`${c.icon} text-3xl opacity-80 group-hover:scale-110 transition-transform`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lyrics & Visuals Tab */}
            {activeTab === "lyrics" ? (
              <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-[#161822]/90 border border-[#262938] flex flex-col items-center justify-center space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                  <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
                    Now Playing Visualizer
                  </span>
                  <h2 className="text-xl font-extrabold text-white">
                    {currentSong ? currentSong.title : "No Track Playing"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {currentSong ? currentSong.artist : "Select a song from search to play previews."}
                  </p>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="w-full h-32 flex items-center justify-center gap-1 px-4 relative">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl filter blur-xl" />
                  
                  {isPlaying ? (
                    Array.from({ length: 24 }).map((_, i) => {
                      const hVal = [30, 75, 45, 90, 60, 110, 40, 95, 70, 120, 50, 85, 35, 100, 55, 115, 65, 80, 42, 98, 72, 105, 52, 68][i];
                      const delay = (i % 6) * 0.15;
                      return (
                        <div
                          key={i}
                          style={{
                            height: `${hVal}%`,
                            animationDelay: `${delay}s`,
                            animationDuration: `${0.6 + (i % 4) * 0.15}s`
                          }}
                          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-400 to-pink-500 animate-pulse hover:from-pink-500 hover:to-yellow-500 transition-colors"
                        />
                      );
                    })
                  ) : (
                    Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-2 rounded-full bg-[#303348]"
                      />
                    ))
                  )}
                </div>

                <p className="text-[11px] font-medium text-slate-500 italic text-center max-w-sm">
                  Audio streaming direct from Deezer previews. Open in Deezer app for full tracks and synced lyrics.
                </p>
              </div>
            ) : (
              /* Songs / Search Results View */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#20222a] pb-2">
                  <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">
                    {searchQuery ? `Results for "${searchQuery}"` : "Trending Tracks"}
                  </h3>
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-lg">
                    {songs.length} Tracks Available
                  </span>
                </div>

                {error && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <span className="i-ph:info-bold text-3xl opacity-40 block mx-auto mb-2 text-pink-500" />
                    <span>{error}</span>
                  </div>
                )}

                {loading && songs.length === 0 && (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="h-12 w-full bg-[#181a24]/50 rounded-xl animate-pulse flex items-center justify-between px-4">
                        <div className="flex items-center gap-3 w-1/3">
                          <div className="w-8 h-8 bg-[#282d3b] rounded-lg" />
                          <div className="h-3 w-24 bg-[#282d3b] rounded" />
                        </div>
                        <div className="h-3 w-32 bg-[#282d3b] rounded hidden md:block" />
                        <div className="h-3 w-8 bg-[#282d3b] rounded" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {songs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    const isLiked = likedTracks.includes(song.id);
                    const hasPreview = !!song.previewUrl;

                    return (
                      <div
                        key={`${song.id}-${idx}`}
                        onClick={() => hasPreview && handleSelectSong(song)}
                        className={`group p-3 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all border border-transparent ${
                          isCurrent
                            ? "bg-[#252836] border-[#383d54] text-cyan-400"
                            : "hover:bg-[#151722]/80 hover:border-[#222533] text-slate-200"
                        } ${!hasPreview ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {/* Title Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-6 flex-shrink-0 flex items-center justify-center">
                            {isCurrent && isPlaying ? (
                              <span className="i-ph:speaker-high-fill text-cyan-400 animate-bounce text-sm" />
                            ) : (
                              <>
                                <span className="text-xs font-bold text-slate-500 group-hover:hidden">
                                  {idx + 1}
                                </span>
                                <span className={`text-xs text-cyan-400 hidden group-hover:inline ${!hasPreview ? "hidden" : ""}`}>
                                  ▶
                                </span>
                              </>
                            )}
                          </div>

                          <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            {isCurrent && isPlaying && (
                              <div className="absolute inset-0 bg-[#0c0d12]/50 flex items-center justify-center">
                                <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-pulse mx-[1px]" />
                                <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-pulse mx-[1px]" style={{ animationDelay: "0.15s" }} />
                                <span className="w-1.5 h-5 bg-cyan-400 rounded-full animate-pulse mx-[1px]" style={{ animationDelay: "0.3s" }} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-xs font-bold truncate ${
                                isCurrent ? "text-cyan-400" : "text-white"
                              }`}
                            >
                              {song.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                              <span>{song.artist}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span className="truncate">{song.album}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges / Actions */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {hasPreview ? (
                            <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-lg hidden sm:inline-block uppercase tracking-wider">
                              Preview
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-pink-500 bg-pink-950/40 border border-pink-900/40 px-2 py-0.5 rounded-lg hidden sm:inline-block uppercase tracking-wider">
                              No Audio
                            </span>
                          )}

                          <button
                            onClick={(e) => toggleLike(song.id, e)}
                            className={`p-1 hover:scale-115 transition-transform ${
                              isLiked ? "text-pink-500" : "text-slate-500 hover:text-white"
                            }`}
                          >
                            ♥
                          </button>
                          <span className="text-slate-400 font-mono text-[11px] w-8 text-right">
                            {song.durationFormatted}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      {isMobile && (
        <div className="h-[54px] bg-[#0c0d12] border-t border-[#1c1e28] flex items-center justify-around z-20 flex-shrink-0">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "home" ? "text-cyan-400" : "text-[#8e92a4]"
            }`}
          >
            <span className="i-ph:house-fill text-lg" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "search" ? "text-cyan-400" : "text-[#8e92a4]"
            }`}
          >
            <span className="i-ph:magnifying-glass-bold text-lg" />
            <span>Search</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("lyrics");
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "lyrics" ? "text-cyan-400" : "text-[#8e92a4]"
            }`}
          >
            <span className="i-ph:microphone-stage-bold text-lg" />
            <span>Visuals</span>
          </button>
        </div>
      )}

      {/* Bottom Custom Playback Bar */}
      {currentSong && (
        <div className="h-[90px] py-2 bg-[#0c0d12] border-t border-[#1d1f27] flex items-center px-4 justify-between gap-4 z-20 flex-shrink-0 shadow-2xl">
          {/* Left Details */}
          <div className="flex items-center gap-3 w-1/4 min-w-[150px] sm:min-w-[180px]">
            <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-[#20222a] shadow-inner">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate hover:underline cursor-pointer">
                {currentSong.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentSong.artist}
              </div>
            </div>
            <button
              onClick={() => toggleLike(currentSong.id)}
              className={`text-sm hover:scale-115 transition-transform ml-1 ${
                likedTracks.includes(currentSong.id) ? "text-pink-500" : "text-slate-500 hover:text-white"
              }`}
            >
              ♥
            </button>
          </div>

          {/* Center Playback Control & Progress */}
          <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="text-slate-400 hover:text-white transition-colors"
                title="Previous Track"
              >
                <span className="i-ph:skip-back-fill text-lg block" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-cyan-400 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-cyan-400/20"
                title={isPlaying ? "Pause" : "Play"}
              >
                <span className={isPlaying ? "i-ph:pause-fill text-sm block" : "i-ph:play-fill text-sm block ml-0.5"} />
              </button>

              <button
                onClick={handleNext}
                className="text-slate-400 hover:text-white transition-colors"
                title="Next Track"
              >
                <span className="i-ph:skip-forward-fill text-lg block" />
              </button>
            </div>

            {/* Slider Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 font-mono w-7 text-right">
                {formatDeezerDuration(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 30}
                step="0.1"
                value={currentTime}
                onChange={handleProgressChange}
                className="flex-1 h-1 rounded-full appearance-none bg-[#20222a] accent-cyan-400 cursor-pointer focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${(currentTime / (duration || 30)) * 100}%, #20222a ${(currentTime / (duration || 30)) * 100}%, #20222a 100%)`
                }}
              />
              <span className="text-[10px] font-semibold text-slate-500 font-mono w-7">
                {formatDeezerDuration(duration || 30)}
              </span>
            </div>
          </div>

          {/* Right Volume / Mute Controls */}
          {!isMobile && (
            <div className="w-1/4 min-w-[200px] flex items-center justify-end gap-2.5">
              <a
                href={currentSong.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-cyan-400/20 active:scale-95 mr-1"
              >
                <span>Play Full</span>
                <span>↗</span>
              </a>

              <button
                onClick={() => setVolume((v) => (v === 0 ? 80 : 0))}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
                title="Mute/Unmute"
              >
                <span className={volume === 0 ? "i-ph:speaker-slash-fill text-base block" : volume < 50 ? "i-ph:speaker-low-fill text-base block" : "i-ph:speaker-high-fill text-base block"} />
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="w-16 sm:w-20 h-1 rounded-full appearance-none bg-[#20222a] accent-cyan-400 cursor-pointer focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${volume}%, #20222a ${volume}%, #20222a 100%)`
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}