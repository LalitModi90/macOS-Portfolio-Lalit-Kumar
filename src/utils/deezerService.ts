export interface DeezerTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl: string;
  durationFormatted: string;
  durationSeconds: number;
  externalUrl: string; // Link to play full song
}

export interface DeezerSearchResult {
  tracks: DeezerTrack[];
}

/**
 * Format duration in seconds to M:SS
 */
export function formatDeezerDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Search tracks, artists, and albums trying Deezer first and falling back to iTunes API
 */
export async function searchDeezer(query: string): Promise<DeezerSearchResult> {
  const q = (query || "").trim();
  const searchUrl = `/api/deezer?q=${encodeURIComponent(q || "Coding Lofi")}`;
  const fallbackUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q || "Coding Lofi")}&entity=song&limit=25`;

  // 1. Try our serverless Deezer API proxy
  try {
    const res = await fetch(searchUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        const tracks: DeezerTrack[] = data.data.map((item: any) => {
          const duration = item.duration || 180;
          return {
            id: String(item.id),
            title: item.title || "Unknown Track",
            artist: item.artist?.name || "Unknown Artist",
            album: item.album?.title || "Unknown Album",
            coverUrl: item.album?.cover_medium || "https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/250x250-000000-80-0-0.jpg",
            previewUrl: item.preview || "",
            durationFormatted: formatDeezerDuration(duration),
            durationSeconds: duration,
            externalUrl: item.link || `https://www.deezer.com/track/${item.id}`
          };
        });
        return { tracks };
      }
    }
  } catch (err) {
    console.warn("Deezer API search warning. Falling back to iTunes API...", err);
  }

  // 2. Fallback to iTunes Search API (100% keyless, CORS-free, works globally)
  try {
    const res = await fetch(fallbackUrl);
    if (!res.ok) {
      throw new Error(`iTunes API responded with status ${res.status}`);
    }
    const data = await res.json();
    const rawItems = data?.results || [];

    const tracks: DeezerTrack[] = rawItems
      .filter((item: any) => item && item.trackId)
      .map((item: any) => {
        const durationSec = Math.round((item.trackTimeMillis || 180000) / 1000);
        const cover = (item.artworkUrl100 || "").replace("100x100bb.jpg", "250x250bb.jpg");
        
        return {
          id: String(item.trackId),
          title: item.trackName || "Unknown Track",
          artist: item.artistName || "Unknown Artist",
          album: item.collectionName || "Single",
          coverUrl: cover || "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/01/0f/9b/010f9bd8-4fd7-b2bd-5277-5c9e6eb924d7/8909024120195.png/250x250bb.jpg",
          previewUrl: item.previewUrl || "",
          durationFormatted: formatDeezerDuration(durationSec),
          durationSeconds: durationSec,
          externalUrl: item.trackViewUrl || `https://music.apple.com/search?term=${encodeURIComponent(item.trackName + " " + item.artistName)}`
        };
      });

    return { tracks };
  } catch (error) {
    console.error("Music search fallback error:", error);
    return { tracks: [] };
  }
}
