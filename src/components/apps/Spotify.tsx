import React, { useState, useEffect, useCallback } from "react";
import { searchSpotify, fetchTrackLyrics, DEFAULT_TRACKS, type SpotifyTrack, type SpotifySearchResult } from "~/utils/spotifyService";
import { useStore } from "~/stores";

export default function Spotify() {
  const dark = useStore((state) => state.dark);
  const [activeTab, setActiveTab] = useState<"home" | "search" | "library" | "lyrics">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>(DEFAULT_TRACKS);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack>(DEFAULT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lyrics, setLyrics] = useState<string[] | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [volume, setVolume] = useState(80);
  const [likedTracks, setLikedTracks] = useState<string[]>([DEFAULT_TRACKS[0].id, DEFAULT_TRACKS[1].id]);

  // Handle live search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(DEFAULT_TRACKS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res: SpotifySearchResult = await searchSpotify(searchQuery);
        setSearchResults(res.tracks);
      } catch {
        // Ignore search error
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Load lyrics when switching to lyrics tab or selecting new track
  const loadLyrics = useCallback(async (trackId: string) => {
    setLoadingLyrics(true);
    setLyrics(null);
    try {
      const lyricsData = await fetchTrackLyrics(trackId);
      setLyrics(lyricsData);
    } catch {
      setLyrics(null);
    } finally {
      setLoadingLyrics(false);
    }
  }, []);

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setIsPlaying(true);
    if (activeTab === "lyrics") {
      loadLyrics(track.id);
    }
  };

  const toggleLike = (trackId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const categories = [
    { title: "Today's Top Hits", icon: "i-ph:fire-bold", color: "from-rose-500 to-pink-600", query: "Top Hits 2026" },
    { title: "Chill Lofi Coding", icon: "i-ph:code-bold", color: "from-purple-500 to-indigo-600", query: "Lofi Coding Beats" },
    { title: "Deep Focus", icon: "i-ph:brain-bold", color: "from-blue-500 to-cyan-600", query: "Deep Focus Instrumental" },
    { title: "Bollywood Hits", icon: "i-ph:music-notes-bold", color: "from-amber-500 to-orange-600", query: "Arijit Singh Hits" }
  ];

  return (
    <div
      className="w-full h-full flex flex-col font-sans select-none overflow-hidden"
      style={{
        background: "#121212",
        color: "#ffffff"
      }}
    >
      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div
          style={{ width: "220px" }}
          className="flex-shrink-0 bg-[#000000] p-4 flex flex-col justify-between border-r border-[#282828]"
        >
          <div className="space-y-6">
            {/* Spotify Brand Header */}
            <div className="flex items-center gap-2.5 px-2">
              <svg className="w-6 h-6 fill-[#1ed760]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.674.464-1.027.248-2.812-1.718-6.351-2.107-10.52-1.155-.403.092-.806-.16-.898-.563-.092-.403.16-.806.563-.898 4.567-1.043 8.487-.597 11.634 1.341.353.216.464.674.248 1.027zm1.468-3.262c-.272.442-.849.582-1.291.31-3.219-1.978-8.125-2.55-11.93-1.394-.497.151-1.028-.135-1.179-.632-.151-.497.135-1.028.632-1.179 4.348-1.319 9.756-.677 13.458 1.594.442.272.582.849.31 1.301zm.126-3.396c-3.86-2.292-10.228-2.504-13.896-1.39-.592.18-1.222-.155-1.402-.747-.18-.592.155-1.222.747-1.402 4.218-1.28 11.248-1.032 15.688 1.603.533.316.707 1.011.391 1.544-.316.533-1.011.707-1.528.392z" />
              </svg>
              <span className="font-bold text-lg tracking-tight">Spotify</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "home"
                    ? "bg-[#282828] text-white"
                    : "text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <span className="i-ph:house-fill text-lg" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("search");
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "search"
                    ? "bg-[#282828] text-white"
                    : "text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <span className="i-ph:magnifying-glass-bold text-lg" />
                <span>Search</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("lyrics");
                  loadLyrics(selectedTrack.id);
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "lyrics"
                    ? "bg-[#282828] text-white"
                    : "text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <span className="i-ph:microphone-stage-bold text-lg" />
                <span>Lyrics</span>
              </button>
            </nav>

            {/* Library / Playlists Header */}
            <div className="pt-4 border-t border-[#282828]">
              <div className="flex items-center justify-between px-2 mb-2 text-[#b3b3b3] text-xs font-bold uppercase tracking-wider">
                <span>Your Library</span>
                <span className="i-ph:books-bold text-sm" />
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("home");
                    setSearchQuery("Arijit Singh");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors truncate"
                >
                  <span className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-[10px]">
                    ♥
                  </span>
                  <span className="truncate">Liked Songs ({likedTracks.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("home");
                    setSearchQuery("Lofi Coding");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-colors truncate"
                >
                  <span className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-[10px]">
                    ⚡
                  </span>
                  <span className="truncate">Coding & Focus Beats</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-2 rounded-xl bg-[#181818] flex items-center gap-2.5 border border-[#282828]">
            <img
              src="https://avatars.githubusercontent.com/u/161499599?v=4"
              alt="Lalit"
              className="w-8 h-8 rounded-full object-cover border border-[#1ed760]"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Lalit Kumar</div>
              <div className="text-[10px] text-[#1ed760] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse" />
                Spotify Connected
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden">
          {/* Top Search & Filter Bar */}
          <div className="p-4 bg-[#181818]/60 backdrop-blur-md flex items-center justify-between gap-4 border-b border-[#282828]">
            <div className="flex-1 max-w-md relative flex items-center">
              <span className="i-ph:magnifying-glass absolute left-3 text-slate-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full pl-9 pr-8 py-2 rounded-full bg-[#242424] text-white text-xs placeholder:text-slate-400 border border-transparent focus:border-[#1ed760] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live API status indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              {isLoading ? (
                <div className="flex items-center gap-1.5 text-[#1ed760]">
                  <span className="w-3.5 h-3.5 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin" />
                  <span>Searching RapidAPI...</span>
                </div>
              ) : (
                <span className="text-[11px] bg-[#242424] px-2.5 py-1 rounded-full border border-[#333]">
                  RapidAPI Spotify v23
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Views based on Tab */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {/* Category Quick Chips */}
            {activeTab === "home" && !searchQuery && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.title}
                    onClick={() => setSearchQuery(c.query)}
                    className={`p-3.5 rounded-xl bg-gradient-to-br ${c.color} cursor-pointer hover:scale-[1.03] transition-all shadow-lg flex items-center justify-between text-white`}
                  >
                    <div>
                      <span className="text-xs font-bold">{c.title}</span>
                    </div>
                    <span className={`${c.icon} text-2xl opacity-80`} />
                  </div>
                ))}
              </div>
            )}

            {/* Lyrics View */}
            {activeTab === "lyrics" ? (
              <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#181818] border border-[#282828] space-y-4">
                <div className="flex items-center justify-between border-b border-[#282828] pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTrack.coverUrl}
                      alt={selectedTrack.name}
                      className="w-12 h-12 rounded-lg object-cover shadow-md"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedTrack.name}</h2>
                      <p className="text-xs text-slate-400">{selectedTrack.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => loadLyrics(selectedTrack.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#282828] hover:bg-[#333] text-slate-200 transition-colors"
                  >
                    Refresh Lyrics
                  </button>
                </div>

                {loadingLyrics ? (
                  <div className="py-12 text-center text-slate-400 text-sm space-y-2">
                    <div className="w-6 h-6 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin mx-auto" />
                    <div>Fetching track lyrics from RapidAPI...</div>
                  </div>
                ) : lyrics && lyrics.length > 0 ? (
                  <div className="space-y-3 font-medium text-slate-200 leading-relaxed text-sm max-h-[380px] overflow-y-auto pr-2 no-scrollbar">
                    {lyrics.map((line, idx) => (
                      <p
                        key={idx}
                        className="hover:text-[#1ed760] transition-colors cursor-pointer"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm space-y-3">
                    <p>No synced lyrics found for "{selectedTrack.name}".</p>
                    <a
                      href={selectedTrack.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-bold px-4 py-2 rounded-full bg-[#1ed760] text-black hover:bg-[#1fdf64]"
                    >
                      Open on Spotify App
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* Track List / Search Results View */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {searchQuery ? `Results for "${searchQuery}"` : "Featured & Recommended Tracks"}
                  </h3>
                  <span className="text-xs text-slate-400">{searchResults.length} tracks</span>
                </div>

                <div className="space-y-1.5">
                  {searchResults.map((track, idx) => {
                    const isCurrent = selectedTrack.id === track.id;
                    const isLiked = likedTracks.includes(track.id);

                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        onClick={() => handleSelectTrack(track)}
                        className={`group p-2.5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isCurrent
                            ? "bg-[#282828] text-[#1ed760]"
                            : "hover:bg-[#1a1a1a] text-slate-200"
                        }`}
                      >
                        {/* Track info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="text-xs font-bold text-slate-500 w-5 text-center group-hover:hidden">
                            {idx + 1}
                          </span>
                          <span className="text-base text-[#1ed760] hidden group-hover:block w-5 text-center">
                            ▶
                          </span>

                          <img
                            src={track.coverUrl}
                            alt={track.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow"
                          />

                          <div className="min-w-0">
                            <div
                              className={`text-xs font-bold truncate ${
                                isCurrent ? "text-[#1ed760]" : "text-white"
                              }`}
                            >
                              {track.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {track.artist}
                            </div>
                          </div>
                        </div>

                        {/* Album info */}
                        <div className="hidden md:block text-xs text-slate-400 truncate max-w-[180px]">
                          {track.album}
                        </div>

                        {/* Actions & duration */}
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            onClick={(e) => toggleLike(track.id, e)}
                            className={`p-1 hover:scale-110 transition-transform ${
                              isLiked ? "text-[#1ed760]" : "text-slate-500 hover:text-white"
                            }`}
                          >
                            ♥
                          </button>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {track.durationFormatted}
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

      {/* Bottom Floating Embedded Spotify Web Player */}
      <div className="h-[96px] bg-[#181818] border-t border-[#282828] flex items-center px-4 justify-between gap-4 z-20">
        {/* Left: Active Track Details */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
          <img
            src={selectedTrack.coverUrl}
            alt={selectedTrack.name}
            className="w-14 h-14 rounded-lg object-cover shadow-md"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate hover:underline cursor-pointer">
              {selectedTrack.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate hover:underline cursor-pointer">
              {selectedTrack.artist}
            </div>
          </div>
          <button
            onClick={() => toggleLike(selectedTrack.id)}
            className={`text-sm hover:scale-110 transition-transform ${
              likedTracks.includes(selectedTrack.id) ? "text-[#1ed760]" : "text-slate-400 hover:text-white"
            }`}
          >
            ♥
          </button>
        </div>

        {/* Center: Spotify Official Responsive Embed Player */}
        <div className="flex-1 max-w-xl h-[80px]">
          <iframe
            key={selectedTrack.id}
            src={`https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl shadow-inner bg-transparent"
          />
        </div>

        {/* Right: Quick Controls & External Links */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[140px]">
          <button
            onClick={() => {
              setActiveTab("lyrics");
              loadLyrics(selectedTrack.id);
            }}
            title="View Lyrics"
            className={`p-2 rounded-full transition-colors ${
              activeTab === "lyrics" ? "text-[#1ed760] bg-[#282828]" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="i-ph:microphone-stage-bold text-base" />
          </button>

          <a
            href={selectedTrack.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            title="Open in Spotify App"
            className="px-3 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold text-[11px] transition-transform active:scale-95 flex items-center gap-1"
          >
            <span>Open Spotify</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}