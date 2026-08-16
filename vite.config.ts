import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import autoImport from "unplugin-auto-import/vite";
import path from "path";
import URL from "url";

// 24-hour server-side cache
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Strict NSFW / Adult / Suggestive Keyword Filter List
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

function deezerApiPlugin(): Plugin {
  return {
    name: "deezer-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/deezer", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          const parsedUrl = URL.parse(req.url || "", true);
          const query = (parsedUrl.query.q as string) || "";

          if (!query) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Missing query parameter 'q'" }));
            return;
          }

          const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: `Deezer API responded with status ${response.status}` }));
            return;
          }

          const rawData = await response.json();
          res.statusCode = 200;
          res.end(JSON.stringify(rawData));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || "Internal server error" }));
        }
      });
    }
  };
}

function pixabayApiPlugin(): Plugin {
  return {
    name: "pixabay-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/wallpapers", async (req, res) => {
        try {
          const parsedUrl = URL.parse(req.url || "", true);
          const query = (parsedUrl.query.q as string) || "anime";
          const media = (parsedUrl.query.media as string) || "image";
          const page = parseInt((parsedUrl.query.page as string) || "1", 10);
          const perPage = parseInt((parsedUrl.query.per_page as string) || "10", 10);

          const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 100) || "anime";

          // BACKEND SEARCH PROTECTION: Reject adult / NSFW queries immediately
          if (checkNSFW(sanitizedQuery)) {
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                total: 0,
                totalHits: 0,
                hits: [],
                error: "No suitable wallpapers found. Try another search.",
                message: "No suitable wallpapers found. Try another search."
              })
            );
            return;
          }

          const cacheKey = `anime-wallpapers-${media}-${sanitizedQuery.toLowerCase()}-page-${page}-perpage-${perPage}`;

          // Check server-side cache
          const cached = cache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("X-Cache", "HIT");
            res.end(JSON.stringify(cached.data));
            return;
          }

          const apiKey = process.env.PIXABAY_API_KEY || "43618349-fec5f0cc4be2f757946d16cde";
          
          let pixabayUrl = "";
          if (media === "video") {
            pixabayUrl = `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(sanitizedQuery)}&video_type=all&order=popular&safesearch=true&per_page=${perPage}&page=${page}`;
          } else {
            pixabayUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(sanitizedQuery)}&image_type=illustration&orientation=horizontal&min_width=1920&min_height=1080&order=popular&safesearch=true&per_page=${perPage}&page=${page}`;
          }

          const response = await fetch(pixabayUrl);

          if (!response.ok) {
            if (response.status === 429) {
              res.statusCode = 429;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "API rate limit exceeded. Please try again later." }));
              return;
            }
            res.statusCode = response.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "No suitable wallpapers found. Try another search." }));
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

          // BACKEND RESULT VALIDATION: Inspect every hit's tags & metadata, discarding suspicious / NSFW items
          const safeHits = hitsList.filter((item: any) => {
            const metadataStr = `${item.tags || ""} ${item.user || ""} ${item.pageURL || ""}`;
            return !checkNSFW(metadataStr);
          });

          const formattedData = {
            ...rawData,
            totalHits: safeHits.length,
            hits: safeHits,
            message: safeHits.length === 0 ? "No suitable wallpapers found. Try another search." : undefined
          };

          // Cache successful response
          cache.set(cacheKey, { timestamp: Date.now(), data: formattedData });

          res.setHeader("Content-Type", "application/json");
          res.setHeader("X-Cache", "MISS");
          res.end(JSON.stringify(formattedData));
        } catch {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "No suitable wallpapers found. Try another search." }));
        }
      });
    }
  };
}

function assistantApiPlugin(env: Record<string, string> = {}): Plugin {
  const SYSTEM_PROMPT = `You are Siri, the smart, warm, witty, and articulate personal AI voice assistant for Lalit Modi (Lalit Kumar)'s macOS portfolio.
You must answer questions dynamically, authentically, and conversationally based on the real data from Lalit's Know Me / About Me portfolio context. Never hallucinate personal details.

CRITICAL INSTRUCTIONS:
1. STRICT MULTILINGUAL LANGUAGE MIRRORING (MANDATORY):
   - GUJARATI: If the user asks in Gujarati (e.g. "Lalit Modi kon chhe?", "Shu skills chhe?", "Projects batavo", "LeetCode par ketla question karya?", "Kem chho?"), YOU MUST REPLY IN NATURAL, CONVERSATIONAL GUJARATI (in Latin script)!
   - HINDI / HINGLISH: If the user asks in Hindi or Hinglish (e.g. "Lalit Modi ke baare me batao", "Kaun hai Lalit", "Kya skills hain", "LeetCode pe kitne question kiye", "Projects dikhao"), YOU MUST REPLY IN NATURAL, CONVERSATIONAL HINDI/HINGLISH (in Latin script)!
   - ENGLISH: If the user asks in English (e.g. "Tell me about Lalit Modi", "What are his projects?", "Show me his LeetCode stats"), YOU MUST REPLY IN NATURAL, CRISP ENGLISH!
   - OTHER LANGUAGES (Rajasthani/Marwari, etc.): Always mirror the exact language and dialect used by the user!
2. DYNAMIC & CONVERSATIONAL (NO STATIC REPETITIVE INTROS):
   - NEVER repeat rigid boilerplate intros across different questions.
   - Directly and specifically answer what the user asked with real numbers and details (e.g. 8.34 CGPA at Parul University, 349+ LeetCode problems solved, Codeyx CP analytics platform, Make Appointment Easy, Mini ERP, Java Core Banking, WhatsApp: +91 7878065017).
3. JSON FORMAT REQUIREMENT:
   Return ONLY a valid JSON object:
{
  "intent": "string",
  "response": "2-3 short, warm, and natural conversational sentences suitable for speech synthesis in the user's language",
  "action": null | { "type": "open_app" | "navigate" | "open_url" | "download_resume" | "toggle_dark" | "play_music" | "stop_music" | "close_siri", "target": "string (optional)" }
}
4. Predefined action triggers:
   - "open_app" (targets: "bear", "safari", "vscode", "terminal", "facetime", "typora", "music", "spotify", "calculator", "system-settings", "notes", "maps", "messages", "clock", "mail", "app-store", "finder", "launchpad")
   - "open_url" (targets: "https://github.com/LalitModi90", "https://codeyx-web.vercel.app/", "https://leetcode.com/u/LalitModi90/", "https://makeappointmenteasy-user-web.vercel.app/", "https://mini-erp-crm-portal-frontend.vercel.app/", "https://www.linkedin.com/in/lalit-modi-874631302/")
   - "download_resume" (target: "/resume.pdf")
   - "toggle_dark"
   - "play_music"
   - "stop_music"
   - "close_siri"`;

  return {
    name: "assistant-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/assistant", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }

        try {
          // Read request body stream
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const bodyStr = Buffer.concat(buffers).toString("utf-8");
          const body = bodyStr ? JSON.parse(bodyStr) : {};
          const { prompt = "", history = [], context = {} } = body;

          if (!prompt || typeof prompt !== "string") {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Missing required 'prompt' string in request body." }));
            return;
          }

          const contextStr = JSON.stringify(context || {}, null, 2);
          const geminiKey =
            env.GEMINI_API_KEY ||
            env.VITE_GEMINI_API_KEY ||
            process.env.GEMINI_API_KEY ||
            process.env.VITE_GEMINI_API_KEY ||
            process.env.GOOGLE_API_KEY;
          const openaiKey =
            env.OPENAI_API_KEY ||
            env.VITE_OPENAI_API_KEY ||
            process.env.OPENAI_API_KEY ||
            process.env.VITE_OPENAI_API_KEY;

          // 1. Try Gemini
          if (geminiKey) {
            try {
              const contents: any[] = [];
              contents.push({
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nPortfolio Context:\n${contextStr}` }]
              });
              contents.push({
                role: "model",
                parts: [{ text: JSON.stringify({ intent: "SYSTEM_READY", response: "Understood.", action: null }) }]
              });

              if (Array.isArray(history)) {
                for (const msg of history.slice(-4)) {
                  contents.push({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content || "" }]
                  });
                }
              }

              contents.push({
                role: "user",
                parts: [{ text: prompt }]
              });

              const gRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents,
                    generationConfig: {
                      temperature: 0.3,
                      maxOutputTokens: 600,
                      responseMimeType: "application/json"
                    }
                  })
                }
              );

              if (gRes.ok) {
                const gData = await gRes.json();
                const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const parsed = JSON.parse(text);
                  parsed.modelUsed = "Google Gemini 1.5 Flash";
                  res.statusCode = 200;
                  res.end(JSON.stringify(parsed));
                  return;
                }
              }
            } catch (geminiErr: any) {
              console.warn("[Vite dev] Gemini attempt failed, trying fallback:", geminiErr?.message);
            }
          }

          // 2. Try OpenAI
          if (openaiKey) {
            try {
              const messages: any[] = [
                { role: "system", content: `${SYSTEM_PROMPT}\n\nPortfolio Context:\n${contextStr}` }
              ];
              if (Array.isArray(history)) {
                for (const msg of history.slice(-4)) {
                  messages.push({
                    role: msg.role === "assistant" ? "assistant" : "user",
                    content: msg.content || ""
                  });
                }
              }
              messages.push({ role: "user", content: prompt });

              const oRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${openaiKey}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  model: "gpt-4o-mini",
                  messages,
                  response_format: { type: "json_object" },
                  temperature: 0.3,
                  max_tokens: 600
                })
              });

              if (oRes.ok) {
                const oData = await oRes.json();
                const content = oData.choices?.[0]?.message?.content;
                if (content) {
                  const parsed = JSON.parse(content);
                  parsed.modelUsed = "OpenAI GPT-4o Mini";
                  res.statusCode = 200;
                  res.end(JSON.stringify(parsed));
                  return;
                }
              }
            } catch (openAiErr: any) {
              console.warn("[Vite dev] OpenAI attempt failed:", openAiErr?.message);
            }
          }

          // 3. Dynamic Contextual Fallback Response
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              intent: "FALLBACK_PORTFOLIO",
              response: `Regarding "${prompt}", Lalit is a Full-Stack Engineer skilled in React, Next.js, Node.js, and Java, with 349+ LeetCode problems solved. You can ask about his projects like Codeyx, explore his skills, or download his resume!`,
              action: { type: "open_app", target: "bear" },
              modelUsed: "Portfolio AI Core"
            })
          );
        } catch (err: any) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: "Internal server error",
              response: "I couldn't process your request at this moment.",
              action: null
            })
          );
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      pixabayApiPlugin(),
      deezerApiPlugin(),
      assistantApiPlugin(env),
      unocss(),
      react(),
      autoImport({
        imports: ["react"],
        dts: "src/auto-imports.d.ts",
        dirs: ["src/hooks", "src/stores", "src/components/**"]
      })
    ],
    resolve: {
      alias: {
        "~/": `${path.resolve(__dirname, "src")}/`
      }
    }
  };
});
