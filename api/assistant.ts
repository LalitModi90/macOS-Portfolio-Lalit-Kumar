
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
  "action": null | { "type": "open_app" | "navigate" | "open_url" | "download_resume" | "toggle_dark" | "play_music" | "stop_music" | "close_siri", "target": "string (optional)" },
  "modelUsed": "string"
}
4. Predefined action triggers:
   - "open_app" (targets: "bear", "safari", "vscode", "terminal", "facetime", "typora", "music", "spotify", "calculator", "system-settings", "notes", "maps", "messages", "clock", "mail", "app-store", "finder", "launchpad")
   - "open_url" (targets: "https://github.com/LalitModi90", "https://codeyx-web.vercel.app/", "https://leetcode.com/u/LalitModi90/", "https://makeappointmenteasy-user-web.vercel.app/", "https://mini-erp-crm-portal-frontend.vercel.app/", "https://www.linkedin.com/in/lalit-modi-874631302/")
   - "download_resume" (target: "/resume.pdf")
   - "toggle_dark"
   - "play_music"
   - "stop_music"
   - "close_siri"`;

async function callGemini(apiKey: string, prompt: string, history: any[], contextStr: string): Promise<any> {
  const contents: any[] = [];

  // Add system instruction as premier context
  contents.push({
    role: "user",
    parts: [{ text: `${SYSTEM_PROMPT}\n\nPortfolio Context:\n${contextStr}` }]
  });
  contents.push({
    role: "model",
    parts: [{ text: JSON.stringify({ intent: "SYSTEM_READY", response: "Understood.", action: null, modelUsed: "Google Gemini 1.5 Flash" }) }]
  });

  // Add prior conversation turns
  if (Array.isArray(history)) {
    for (const msg of history.slice(-4)) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }]
      });
    }
  }

  // Add current prompt
  contents.push({
    role: "user",
    parts: [{ text: prompt }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  const parsed = JSON.parse(text);
  parsed.modelUsed = "Google Gemini 1.5 Flash";
  return parsed;
}

async function callOpenAI(apiKey: string, prompt: string, history: any[], contextStr: string): Promise<any> {
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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 600
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  const parsed = JSON.parse(content);
  parsed.modelUsed = "OpenAI GPT-4o Mini";
  return parsed;
}

// In-memory sliding-window rate limiter for serverless assistant endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp);

  // Clean old entries periodically
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
  // Production-grade CORS Configuration (Disallow credentials when wildcard origin is set)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
    return;
  }

  // Rate Limiting Protection
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown_client";
  if (isRateLimited(clientIp)) {
    res.status(429).json({
      error: "Rate limit exceeded. Please wait a moment before sending another request.",
      response: "You are sending messages too quickly. Please wait a few seconds and try again.",
      action: null,
      modelUsed: "RateLimiter"
    });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        res.status(400).json({ error: "Invalid JSON payload in request body." });
        return;
      }
    }
    body = body || {};

    const { prompt = "", history = [], context = {} } = body;

    // Strict Input Validation
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing or invalid required 'prompt' string." });
      return;
    }

    // Bound prompt length to prevent token abuse & cost exhaustion
    const sanitizedPrompt = prompt.trim().slice(0, 1000);
    if (!sanitizedPrompt) {
      res.status(400).json({ error: "Prompt cannot be empty." });
      return;
    }

    // Sanitize and bound history array
    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter((item: any) => item && typeof item === "object" && typeof item.content === "string")
          .slice(-8)
          .map((item: any) => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: String(item.content).slice(0, 1000)
          }))
      : [];

    // Bounded context serialization (max 25KB)
    let contextStr = "{}";
    try {
      const serialized = JSON.stringify(context || {}, null, 2);
      contextStr = serialized.slice(0, 25000);
    } catch {
      contextStr = "{}";
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Try Primary: Gemini API
    if (geminiKey) {
      try {
        const result = await callGemini(geminiKey, sanitizedPrompt, sanitizedHistory, contextStr);
        res.status(200).json(result);
        return;
      } catch (geminiErr: any) {
        console.warn("Gemini attempt failed, falling back to OpenAI");
      }
    }

    // 2. Try Fallback: OpenAI API
    if (openaiKey) {
      try {
        const result = await callOpenAI(openaiKey, sanitizedPrompt, sanitizedHistory, contextStr);
        res.status(200).json(result);
        return;
      } catch (openAiErr: any) {
        console.warn("OpenAI attempt failed");
      }
    }

    // 3. Fallback response when no API keys are provided or both services are unreachable
    res.status(200).json({
      intent: "FALLBACK_PORTFOLIO",
      response: `Regarding "${sanitizedPrompt}", Lalit is a Full-Stack Engineer skilled in React, Next.js, Node.js, and Java, with 349+ LeetCode problems solved. You can ask about his projects like Codeyx, explore his skills, or download his resume!`,
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core (Local)"
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Internal server error",
      response: "I couldn't process your request at this moment.",
      action: null,
      modelUsed: "Portfolio AI Core (Offline)"
    });
  }
}
