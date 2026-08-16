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

const SPOTIFY_CLIENT_ID = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_SECRET || "";

let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

async function getSpotifyAccessToken(): Promise<string | null> {
  if (cachedAccessToken && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET)
      },
      body: "grant_type=client_credentials"
    });

    if (response.ok) {
      const data = await response.json();
      cachedAccessToken = data.access_token;
      tokenExpiryTime = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
      return cachedAccessToken;
    }
  } catch (error) {
    console.error("Failed to get Spotify access token:", error);
  }

  return null;
}

// High-quality curated default tracks for coding / lofi / chill
export const DEFAULT_TRACKS: SpotifyTrack[] = [
  {
    id: "7MXVkkNElUiLhi7S52kL4v",
    name: "Starboy",
    artist: "The Weeknd, Daft Punk",
    album: "Starboy",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452",
    durationMs: 230453,
    durationFormatted: "3:50",
    spotifyUrl: "https://open.spotify.com/track/7MXVkkNElUiLhi7S52kL4v"
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
    id: "09CtPGIpYB4MiOOfjbYJHe",
    name: "Mr. Brightside",
    artist: "The Killers",
    album: "Hot Fuss",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b27376c66914562512a3258525b6",
    durationMs: 222586,
    durationFormatted: "3:42",
    spotifyUrl: "https://open.spotify.com/track/09CtPGIpYB4MiOOfjbYJHe"
  },
  {
    id: "6VBhH7CyP56BXjp8VsDFPZ",
    name: "Kesariya",
    artist: "Arijit Singh, Pritam, Amitabh Bhattacharya",
    album: "Brahmastra",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c08202c50371e234d20caf62",
    durationMs: 268120,
    durationFormatted: "4:28",
    spotifyUrl: "https://open.spotify.com/track/6VBhH7CyP56BXjp8VsDFPZ"
  },
  {
    id: "6ZFbXI36ZsyDnS1545g96g",
    name: "Time",
    artist: "Hans Zimmer",
    album: "Inception",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b27329598de53a7b53a0fbdc5dbb",
    durationMs: 275000,
    durationFormatted: "4:35",
    spotifyUrl: "https://open.spotify.com/track/6ZFbXI36ZsyDnS1545g96g"
  },
  {
    id: "0tgVFr4Ct1rrzt5j7N576t",
    name: "Perfect",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    durationMs: 263000,
    durationFormatted: "4:23",
    spotifyUrl: "https://open.spotify.com/track/0tgVFr4Ct1rrzt5j7N576t"
  },
  {
    id: "3JvK2625lh20t93B5P6Q1A",
    name: "Another Love",
    artist: "Tom Odell",
    album: "Long Way Down",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273195150d1a49f50f28e2ca1c1",
    durationMs: 244000,
    durationFormatted: "4:04",
    spotifyUrl: "https://open.spotify.com/track/3JvK2625lh20t93B5P6Q1A"
  },
  {
    id: "51yAl2n457M26vbmw7FpBs",
    name: "Night Changes",
    artist: "One Direction",
    album: "Four",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c50eed4d173ffb6170c0c660",
    durationMs: 226000,
    durationFormatted: "3:46",
    spotifyUrl: "https://open.spotify.com/track/51yAl2n457M26vbmw7FpBs"
  },
  {
    id: "561j10jKjg6U6CAu52O77O",
    name: "Mockingbird",
    artist: "Eminem",
    album: "Encore",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ecb11342674e2d31427c7c7c",
    durationMs: 251000,
    durationFormatted: "4:11",
    spotifyUrl: "https://open.spotify.com/track/561j10jKjg6U6CAu52O77O"
  },
  {
    id: "2wMQJyT3J8w7498cSp4jat",
    name: "Softcore",
    artist: "The Neighbourhood",
    album: "Hard To Imagine",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b27382b27bc8051787c8052136e6",
    durationMs: 206000,
    durationFormatted: "3:26",
    spotifyUrl: "https://open.spotify.com/track/2wMQJyT3J8w7498cSp4jat"
  },
  {
    id: "5QDh1aZ4v7y7vM12141517",
    name: "Dynamite",
    artist: "BTS",
    album: "Dynamite",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2731118e217039a0397ccca947f",
    durationMs: 199000,
    durationFormatted: "3:19",
    spotifyUrl: "https://open.spotify.com/track/5QDh1aZ4v7y7vM12141517"
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

  // 1. Try Official Spotify Web API if credentials exist
  const token = await getSpotifyAccessToken();
  if (token) {
    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track,artist&limit=12`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const tracks: SpotifyTrack[] = [];
        const artists: Array<{ id: string; name: string; avatarUrl: string; followers?: string }> = [];

        // Parse Tracks
        const trackItems = data?.tracks?.items || [];
        for (const item of trackItems) {
          if (item && item.id) {
            const name = item.name || "Unknown Track";
            const artist = item.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist";
            const album = item.album?.name || "Single";
            const coverUrl = item.album?.images?.[0]?.url || "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452";
            const durationMs = item.duration_ms || 210000;

            tracks.push({
              id: item.id,
              name,
              artist,
              album,
              coverUrl,
              durationMs,
              durationFormatted: formatDuration(durationMs),
              spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`
            });
          }
        }

        // Parse Artists
        const artistItems = data?.artists?.items || [];
        for (const item of artistItems) {
          if (item && item.id) {
            const name = item.name || "Artist";
            const avatarUrl = item.images?.[0]?.url || "https://i.scdn.co/image/ab6761610000e5eb4a5e019349e5d425cc52f6c0";
            artists.push({ id: item.id, name, avatarUrl });
          }
        }

        return {
          tracks: tracks.length > 0 ? tracks : DEFAULT_TRACKS,
          artists,
          albums: []
        };
      }
    } catch (err) {
      console.warn("Official Spotify search warning:", err);
    }
  }

  // 2. Fallback to RapidAPI
  if (RAPIDAPI_KEY) {
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
          albums: []
        };
      }
    } catch (err) {
      console.warn("RapidAPI Spotify search warning:", err);
    }
  }

  // 3. Fallback to local matches
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
