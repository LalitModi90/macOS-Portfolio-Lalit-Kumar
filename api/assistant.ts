
const SYSTEM_PROMPT = `You are a real-time conversational AI voice assistant on Lalit Modi's portfolio website.

CORE PRINCIPLES & GUIDELINES:
1. GENERATE EVERY RESPONSE DYNAMICALLY from the user's actual message. NEVER return a predefined, hardcoded, or static answer.
2. DO NOT ASSUME THAT EVERY QUESTION IS ABOUT LALIT MODI.
3. ONLY USE LALIT'S PORTFOLIO CONTEXT WHEN THE USER'S QUESTION IS ACTUALLY ABOUT LALIT OR HIS PORTFOLIO.
4. FOR GENERAL QUESTIONS (e.g. science, geography, programming, facts, math, philosophy), answer using your broad AI knowledge.
5. FOR CASUAL, RANDOM, FUNNY, OR UNRELATED MESSAGES (e.g. "kya kar rahi ho", "who are you", "tell me a joke", "how's the weather"), respond naturally and wittily to the actual message.
6. NEVER MODIFY THE USER'S QUESTION INTO A LALIT-RELATED QUESTION.
7. NEVER START RESPONSES WITH rigid templates like: "Regarding your question, Lalit Modi is..." or "Lalit Modi ke baare me:".
8. ONLY MENTION LALIT WHEN RELEVANT. Use the portfolio context as additional reference knowledge, not as the default topic.
9. MULTILINGUAL MIRRORING: Always reply in the exact language & script/transliteration used by the user (Gujarati, Hindi, Hinglish, English, Marwari, etc.).

JSON FORMAT REQUIREMENT:
Return ONLY a valid JSON object:
{
  "intent": "string",
  "response": "2-3 short, natural, conversational sentences suitable for speech synthesis in the user's language",
  "action": null | { "type": "open_app" | "navigate" | "open_url" | "download_resume" | "toggle_dark" | "play_music" | "stop_music" | "close_siri", "target": "string (optional)" },
  "modelUsed": "string"
}

Predefined action triggers when relevant:
- "open_app" (targets: "bear", "safari", "vscode", "terminal", "facetime", "typora", "music", "spotify", "calculator", "system-settings", "notes", "maps", "messages", "clock", "mail", "app-store", "finder", "launchpad")
- "open_url" (targets: "https://github.com/LalitModi90", "https://codeyx-web.vercel.app/", "https://leetcode.com/u/LalitModi90/", "https://makeappointmenteasy-user-web.vercel.app/", "https://mini-erp-crm-portal-frontend.vercel.app/", "https://www.linkedin.com/in/lalit-modi-874631302/")
- "download_resume" (target: "/resume.pdf")
- "toggle_dark"
- "play_music"
- "stop_music"
- "close_siri"`;

async function callGemini(apiKey: string, prompt: string, history: any[], contextStr: string): Promise<any> {
  const contents: any[] = [];

  // Add system instruction, injecting portfolio context only if present
  contents.push({
    role: "user",
    parts: [{ text: `${SYSTEM_PROMPT}${contextStr ? `\n\nPortfolio Context:\n${contextStr}` : ""}` }]
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
        maxOutputTokens: 150,
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
    { role: "system", content: `${SYSTEM_PROMPT}${contextStr ? `\n\nPortfolio Context:\n${contextStr}` : ""}` }
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
      max_tokens: 150
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
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  // IP Rate limiting
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

    // Classify if the query is specifically asking about Lalit or his portfolio
    const qLower = sanitizedPrompt.toLowerCase().trim();
    const isLalitQuestion =
      /\b(lalit|modi|lalitkumar|resume|cv|portfolio|projects|codeyx|leetcode|codechef|skills|parul|education|contact|hire|about you|who are you)\b/i.test(
        qLower
      );

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

    // Bounded context serialization: only inject if isLalitQuestion is true
    let contextStr = "";
    if (isLalitQuestion) {
      try {
        const serialized = JSON.stringify(context || {}, null, 2);
        contextStr = serialized.slice(0, 25000);
      } catch {
        contextStr = "";
      }
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
    let fallbackReply = "I'm listening! Feel free to ask any question or explore Lalit's portfolio.";
    if (isLalitQuestion) {
      fallbackReply =
        "Lalit Modi is a Software Development Engineer skilled in React, Next.js, Node.js, and Java, with 395+ LeetCode problems solved. You can ask about his projects like Codeyx, explore his skills, or download his resume!";
    } else if (/\b(fuck|bitch|chutiya|madarchod|saale)\b/i.test(qLower)) {
      fallbackReply = "Let's keep things friendly! How can I help you today?";
    } else if (/\b(abee|abe|oye|bro|bhai|yaar)\b/i.test(qLower)) {
      fallbackReply = "Haan bhai! Kaho, kya dekhna ya poochna chahte ho?";
    } else if (qLower.includes("joke")) {
      fallbackReply = "Why do programmers prefer dark mode? Because light attracts bugs!";
    } else if (qLower.includes("react")) {
      fallbackReply = "React is a popular JavaScript library created by Meta for building modern user interfaces.";
    }

    res.status(200).json({
      intent: isLalitQuestion ? "PORTFOLIO_INFO" : "GENERAL_CONVERSATION",
      response: fallbackReply,
      action: isLalitQuestion ? { type: "open_app", target: "bear" } : null,
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
