export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  durationMs: number;
  durationFormatted: string;
  previewUrl?: string;
  spotifyUrl: string;
  lyrics?: string;
}

export interface SpotifySearchResult {
  tracks: SpotifyTrack[];
  artists: Array<{ id: string; name: string; avatarUrl: string; followers?: string }>;
  albums: Array<{ id: string; name: string; artist: string; coverUrl: string; year: string }>;
}

const RAPIDAPI_KEY =
  (import.meta as any).env?.VITE_RAPIDAPI_SPOTIFY_KEY || "";

const RAPIDAPI_HOST =
  (import.meta as any).env?.VITE_RAPIDAPI_SPOTIFY_HOST ||
  "spotify23.p.rapidapi.com";

// High-quality curated default tracks for coding / lofi / chill
export const DEFAULT_TRACKS: SpotifyTrack[] = [
  {
    id: "4snRyiaLyvTMuiOhzp8MF7",
    name: "Starboy",
    artist: "The Weeknd, Daft Punk",
    album: "Starboy",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452",
    durationMs: 230453,
    durationFormatted: "3:50",
    spotifyUrl: "https://open.spotify.com/track/4snRyiaLyvTMuiOhzp8MF7"
  },
  {
    id: "0VjIjW4GlUZAMYd2vXMi3b",
    name: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    durationMs: 200040,
    durationFormatted: "3:20",
    spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b"
  },
  {
    id: "7qiZfU4dY1lWllzX7mPBI3",
    name: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    durationMs: 233712,
    durationFormatted: "3:53",
    spotifyUrl: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3"
  },
  {
    id: "3n3Ppam7vgaVa1iaRUc9Lp",
    name: "Mr. Brightside",
    artist: "The Killers",
    album: "Hot Fuss",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ccdddd46119a0ff33e1ff4f3",
    durationMs: 222586,
    durationFormatted: "3:42",
    spotifyUrl: "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
  },
  {
    id: "1BxfuPKGuaTgP7aM0XbdCe",
    name: "Kesariya",
    artist: "Arijit Singh, Pritam, Amitabh Bhattacharya",
    album: "Brahmastra",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c08202c50371e234d20caf62",
    durationMs: 268120,
    durationFormatted: "4:28",
    spotifyUrl: "https://open.spotify.com/track/1BxfuPKGuaTgP7aM0XbdCe"
  },
  {
    id: "2takcwOaAZWiXQijPHIx7B",
    name: "Time",
    artist: "Hans Zimmer",
    album: "Inception (OST)",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b27341829e504c554e201b1deef6",
    durationMs: 275000,
    durationFormatted: "4:35",
    spotifyUrl: "https://open.spotify.com/track/2takcwOaAZWiXQijPHIx7B"
  }
];

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "3:30";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Search tracks, albums, and artists via RapidAPI Spotify API
 */
export async function searchSpotify(query: string): Promise<SpotifySearchResult> {
  const q = (query || "").trim();
  if (!q) {
    return { tracks: DEFAULT_TRACKS, artists: [], albums: [] };
  }

  try {
    const url = `https://${RAPIDAPI_HOST}/search/?q=${encodeURIComponent(q)}&type=multi&offset=0&limit=12&numberOfTopResults=5`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });

    if (res.ok) {
      const data = await res.json();
      const tracks: SpotifyTrack[] = [];
      const artists: Array<{ id: string; name: string; avatarUrl: string; followers?: string }> = [];
      const albums: Array<{ id: string; name: string; artist: string; coverUrl: string; year: string }> = [];

      // Parse Tracks
      const trackItems = data?.tracks?.items || data?.topResults?.items || [];
      for (const item of trackItems) {
        const d = item.data || item;
        if (d && d.id) {
          const name = d.name || "Unknown Track";
          const artist = d.artists?.items?.map((a: any) => a.profile?.name || a.name).join(", ") || d.artists?.[0]?.name || "Unknown Artist";
          const album = d.albumOfTrack?.name || d.album?.name || "Single";
          const coverUrl =
            d.albumOfTrack?.coverArt?.sources?.[0]?.url ||
            d.album?.images?.[0]?.url ||
            "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452";
          const durationMs = d.duration?.totalMilliseconds || 210000;

          tracks.push({
            id: d.id,
            name,
            artist,
            album,
            coverUrl,
            durationMs,
            durationFormatted: formatDuration(durationMs),
            spotifyUrl: `https://open.spotify.com/track/${d.id}`
          });
        }
      }

      // Parse Artists
      const artistItems = data?.artists?.items || [];
      for (const item of artistItems) {
        const d = item.data || item;
        if (d && d.uri) {
          const id = d.uri.replace("spotify:artist:", "") || d.id;
          const name = d.profile?.name || d.name || "Artist";
          const avatarUrl = d.visuals?.avatarImage?.sources?.[0]?.url || "https://i.scdn.co/image/ab6761610000e5eb4a5e019349e5d425cc52f6c0";
          artists.push({ id, name, avatarUrl });
        }
      }

      return {
        tracks: tracks.length > 0 ? tracks : DEFAULT_TRACKS,
        artists,
        albums
      };
    }
  } catch (err) {
    console.warn("RapidAPI Spotify search warning:", err);
  }

  // Fallback to local matches
  const filtered = DEFAULT_TRACKS.filter(
    (t) =>
      t.name.toLowerCase().includes(q.toLowerCase()) ||
      t.artist.toLowerCase().includes(q.toLowerCase()) ||
      t.album.toLowerCase().includes(q.toLowerCase())
  );

  return {
    tracks: filtered.length > 0 ? filtered : DEFAULT_TRACKS,
    artists: [],
    albums: []
  };
}

/**
 * Fetch track lyrics via RapidAPI Spotify API
 */
export async function fetchTrackLyrics(trackId: string): Promise<string[] | null> {
  if (!trackId) return null;

  try {
    const url = `https://${RAPIDAPI_HOST}/track_lyrics/?id=${encodeURIComponent(trackId)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      }
    });

    if (res.ok) {
      const data = await res.json();
      const lines = data?.lyrics?.lines;
      if (Array.isArray(lines) && lines.length > 0) {
        return lines.map((l: any) => l.words || l.text).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn("RapidAPI Spotify lyrics warning:", err);
  }

  return null;
}
