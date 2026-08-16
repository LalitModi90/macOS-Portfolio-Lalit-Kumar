import React, { useState, useEffect, useRef } from "react";

const GLASS: React.CSSProperties = {
  background: "rgba(18, 18, 20, 0.72)",
  backdropFilter: "blur(64px) saturate(210%)",
  WebkitBackdropFilter: "blur(64px) saturate(210%)",
  border: "0.5px solid rgba(255,255,255,0.11)",
  boxShadow: "0 4px 32px rgba(0,0,0,0.40), inset 0 0.5px 0 rgba(255,255,255,0.14)",
};

interface MusicWidgetProps {
  compact?: boolean;
}

export default function MusicWidget({ compact = false }: MusicWidgetProps) {
  const [song, setSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Hidden audio ref for standalone play when Spotify window is closed
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch initial track from localStorage on mount
  useEffect(() => {
    const savedSong = localStorage.getItem("spotify_current_song");
    const savedPlaying = localStorage.getItem("spotify_is_playing");
    if (savedSong) {
      try {
        setSong(JSON.parse(savedSong));
      } catch (e) {}
    }
    if (savedPlaying) {
      setIsPlaying(savedPlaying === "true");
    }
  }, []);

  // Listen to live state updates from Spotify app
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { currentSong, isPlaying: appPlaying, currentTime: appTime, duration: appDuration } = customEvent.detail || {};
      
      if (currentSong) {
        setSong(currentSong);
        setIsPlaying(appPlaying);
        setCurrentTime(appTime || 0);
        setDuration(appDuration || 30);

        // Pause standalone audio if main app is driving playback
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    };

    window.addEventListener("spotify:stateChange", handleStateChange);
    return () => window.removeEventListener("spotify:stateChange", handleStateChange);
  }, []);

  // Sync standalone audio playback (when main Spotify app is closed)
  useEffect(() => {
    const isAppActive = (window as any).spotifyAppActive;
    if (isAppActive || !song?.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) setDuration(audioRef.current.duration || 30);
      });
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    if (audioRef.current.src !== song.previewUrl) {
      audioRef.current.src = song.previewUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, song]);

  // Actions
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isAppActive = (window as any).spotifyAppActive;
    if (isAppActive) {
      window.dispatchEvent(new CustomEvent("spotify:control", { detail: { action: "toggle" } }));
    } else {
      setIsPlaying(!isPlaying);
      localStorage.setItem("spotify_is_playing", String(!isPlaying));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isAppActive = (window as any).spotifyAppActive;
    if (isAppActive) {
      window.dispatchEvent(new CustomEvent("spotify:control", { detail: { action: "next" } }));
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isAppActive = (window as any).spotifyAppActive;
    if (isAppActive) {
      window.dispatchEvent(new CustomEvent("spotify:control", { detail: { action: "prev" } }));
    }
  };

  const handleWidgetClick = () => {
    // Open full Spotify app on click
    window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { appId: "spotify" } }));
  };

  const currentTrack = song || {
    title: "No Song Playing",
    artist: "Open Deezer Music",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/01/0f/9b/010f9bd8-4fd7-b2bd-5277-5c9e6eb924d7/8909024120195.png/250x250bb.jpg",
    previewUrl: "",
    album: "Deezer"
  };

  const progressPercent = (currentTime / (duration || 30)) * 100;

  if (compact) {
    // Small Square Sidebar Widget (140px x 140px approx, fits NotificationCenter stack)
    return (
      <div
        onClick={handleWidgetClick}
        style={{
          ...GLASS,
          borderRadius: 16,
          padding: 12,
          width: 140,
          height: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-system)",
          color: "white",
          cursor: "pointer",
          userSelect: "none"
        }}
        className="hover:scale-[1.02] active:scale-[0.98] transition-transform group"
      >
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shadow-md">
          <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse mx-[1px]" />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse mx-[1px]" style={{ animationDelay: "0.15s" }} />
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse mx-[1px]" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
        </div>

        <div className="text-center w-full min-w-0">
          <div className="text-[10px] font-bold truncate">{currentTrack.title}</div>
          <div className="text-[8px] text-slate-400 truncate">{currentTrack.artist}</div>
        </div>

        {/* Circular Toggle Button */}
        <button
          onClick={handlePlayPause}
          className="w-7 h-7 rounded-full bg-cyan-400 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <span className={isPlaying ? "i-ph:pause-fill text-xs block" : "i-ph:play-fill text-xs block ml-[1px]"} />
        </button>
      </div>
    );
  }

  // Medium Horizontal Desktop Widget (200px width, matches Calendar/Weather layout)
  return (
    <div
      onClick={handleWidgetClick}
      style={{
        ...GLASS,
        borderRadius: 16,
        padding: "12px 14px",
        width: 200,
        height: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-system)",
        color: "white",
        cursor: "pointer",
        userSelect: "none"
      }}
      className="hover:scale-[1.02] active:scale-[0.98] transition-transform group relative overflow-hidden"
    >
      {/* Top Half Info & Cover */}
      <div className="flex gap-3 items-center min-w-0">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/5 flex-shrink-0">
          <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse mx-[1px]" />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse mx-[1px]" style={{ animationDelay: "0.15s" }} />
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse mx-[1px]" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="text-[11px] font-bold text-white leading-tight truncate">
            {currentTrack.title}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
            {currentTrack.artist}
          </div>
          <div className="text-[8px] text-cyan-400/80 font-semibold tracking-wider uppercase mt-1 truncate">
            {isPlaying ? "Playing Preview" : "Paused"}
          </div>
        </div>
      </div>

      {/* Bottom Half Progress & Controls */}
      <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
        {/* Minimal Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-cyan-400 rounded-full transition-all duration-300"
          />
        </div>

        {/* Small Playback Controller */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            className="text-slate-400 hover:text-white transition-colors"
            title="Previous"
          >
            <span className="i-ph:skip-back-fill text-sm block" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            title={isPlaying ? "Pause" : "Play"}
          >
            <span className={isPlaying ? "i-ph:pause-fill text-2xs block" : "i-ph:play-fill text-2xs block ml-[1px]"} />
          </button>

          <button
            onClick={handleNext}
            className="text-slate-400 hover:text-white transition-colors"
            title="Next"
          >
            <span className="i-ph:skip-forward-fill text-sm block" />
          </button>
        </div>
      </div>
    </div>
  );
}
