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

// In-memory sliding-window rate limiter for wallpapers search endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp);

  if (rateLimitMap.size > 1000) {
    rateLimitMap.forEach((data, ip) => {
      if (now > data.resetTime) rateLimitMap.delete(ip);
    });
  }

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientData.count += 1;
  return false;
}

export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed. Only GET is accepted." });
    return;
  }

  // Rate Limiting
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown_client";
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: "Rate limit exceeded. Please wait a moment before searching again." });
    return;
  }

  try {
    const rawQuery = (req.query?.q as string) || "anime";
    const rawMedia = (req.query?.media as string) || "image";
    const rawPage = parseInt((req.query?.page as string) || "1", 10);
    const rawPerPage = parseInt((req.query?.per_page as string) || "10", 10);

    // Validate and clamp input parameters
    const page = Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 100 ? rawPage : 1;
    const perPage = Number.isInteger(rawPerPage) && rawPerPage >= 1 && rawPerPage <= 50 ? rawPerPage : 10;
    const media = rawMedia === "video" ? "video" : "image";

    const sanitizedQuery = String(rawQuery).trim().replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 80) || "anime";

    // Backend Search Protection: Block NSFW / Adult search queries immediately
    if (checkNSFW(sanitizedQuery)) {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        total: 0,
        totalHits: 0,
        hits: [],
        message: "No suitable wallpapers found. Try another search."
      });
      return;
    }

    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      // Secure fallback when environment variable is not configured
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        total: 0,
        totalHits: 0,
        hits: [],
        message: "Wallpaper service is currently operating in offline mode."
      });
      return;
    }
    
    let pixabayUrl = "";
    if (media === "video") {
      pixabayUrl = `https://pixabay.com/api/videos/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(sanitizedQuery)}&video_type=all&order=popular&safesearch=true&per_page=${perPage}&page=${page}`;
    } else {
      pixabayUrl = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(sanitizedQuery)}&image_type=illustration&orientation=horizontal&min_width=1920&min_height=1080&order=popular&safesearch=true&per_page=${perPage}&page=${page}`;
    }

    const response = await fetch(pixabayUrl);

    if (!response.ok) {
      if (response.status === 429) {
        res.status(429).json({ error: "API rate limit exceeded. Please try again later." });
        return;
      }
      res.status(response.status).json({ error: "No suitable wallpapers found. Try another search." });
      return;
    }

    const rawData = await response.json();
    let hitsList = rawData.hits || [];

    if (media === "video" && Array.isArray(rawData.hits)) {
      hitsList = rawData.hits.map((v: any) => {
        const videoUrl = v.videos?.large?.url || v.videos?.medium?.url || v.videos?.small?.url || "";
        const previewUrl = v.videos?.tiny?.url || v.videos?.small?.url || "";
        return {
          id: v.id,
          isVideo: true,
          pageURL: v.pageURL,
          type: "video",
          tags: v.tags || "anime, video, live wallpaper",
          previewURL: previewUrl,
          webformatURL: previewUrl,
          largeImageURL: videoUrl,
          videoUrl: videoUrl,
          imageWidth: v.videos?.large?.width || 1920,
          imageHeight: v.videos?.large?.height || 1080,
          imageSize: v.videos?.large?.size || 0,
          views: v.views || 0,
          downloads: v.downloads || 0,
          likes: v.likes || 0,
          comments: v.comments || 0,
          user_id: v.user_id || 0,
          user: v.user || "pixabay",
          userImageURL: v.userImageURL || "",
        };
      });
    }

    // Backend Result Validation: Check metadata / tags of every single item & reject any NSFW / suggestive hits
    const safeHits = hitsList.filter((item: any) => {
      const metadataStr = `${item.tags || ""} ${item.user || ""} ${item.pageURL || ""}`;
      return !checkNSFW(metadataStr);
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ...rawData,
      totalHits: safeHits.length,
      hits: safeHits,
      message: safeHits.length === 0 ? "No suitable wallpapers found. Try another search." : undefined
    });
  } catch {
    res.status(500).json({ error: "No suitable wallpapers found. Try another search." });
  }
}
