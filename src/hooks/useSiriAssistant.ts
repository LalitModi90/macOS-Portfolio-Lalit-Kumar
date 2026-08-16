import { useState, useEffect, useRef, useCallback } from "react";
import { PORTFOLIO_CONTEXT, resolveLocalIntent, normalizeVoiceQuery, type SiriResponse, type SiriAction } from "~/utils/portfolioContext";
import { fetchLeetCodeStats, fetchCodeChefStats, type LeetCodeStats, type CodeChefStats } from "~/utils/codingPlatforms";
import { fetchGitHubRepos, type GitHubRepo } from "~/utils/githubService";
import { useStore } from "~/stores";
import { useAudioContext } from "~/context/AudioContext";

export type SiriPhase = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSiriAssistant() {
  const [phase, setPhase] = useState<SiriPhase>("idle");
  const [activeModel, setActiveModel] = useState<string>("Google Gemini 1.5 Flash");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [wakeWordEnabled, setWakeWordEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("siri_wakeword_enabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unsupported">(
    SpeechRecognitionAPI ? "prompt" : "unsupported"
  );

  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const isListeningCommandRef = useRef<boolean>(false);
  const speechSynthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const liveContextRef = useRef<any>({ ...PORTFOLIO_CONTEXT });
  const startListeningRef = useRef<() => void>(() => {});
  const processQueryRef = useRef<(q: string) => Promise<void>>(async () => {});

  const store = useStore();
  const { controls } = useAudioContext();

  // Fetch real-time live data from About Me Markdown, GitHub, LeetCode, and CodeChef APIs
  useEffect(() => {
    let isMounted = true;

    async function syncLivePlatformData() {
      try {
        const [aboutMeRes, lcRes, ccRes, ghRes, ghUserRes] = await Promise.allSettled([
          fetch("/markdown/about-me.md").then((r) => (r.ok ? r.text() : "")),
          fetchLeetCodeStats(),
          fetchCodeChefStats(),
          fetchGitHubRepos(),
          fetch("https://api.github.com/users/LalitModi90").then((r) => (r.ok ? r.json() : null))
        ]);

        if (!isMounted) return;

        const updatedContext = { ...PORTFOLIO_CONTEXT };

        // Fresh Live About Me Markdown
        if (aboutMeRes.status === "fulfilled" && aboutMeRes.value) {
          (updatedContext as any).liveAboutMeDoc = aboutMeRes.value;
        }

        // Live LeetCode Data
        if (lcRes.status === "fulfilled" && lcRes.value) {
          const lc = lcRes.value;
          updatedContext.codingStats = {
            ...updatedContext.codingStats,
            leetcode: `Live Stats: ${lc.totalSolved} DSA problems solved (${lc.easySolved} Easy, ${lc.mediumSolved} Medium, ${lc.hardSolved} Hard). Global Ranking: ${lc.ranking || 142050}. Contest Rating: ${lc.contestRating || 1520}. Profile: LalitModi90`
          };
        }

        // Live CodeChef Data
        if (ccRes.status === "fulfilled" && ccRes.value) {
          const cc = ccRes.value;
          updatedContext.codingStats = {
            ...updatedContext.codingStats,
            codechef: `Live Stats: ${cc.rating} Rating (${cc.stars || "1★"}); Global Rank: ${cc.globalRank || 4893}; Country Rank: ${cc.countryRank || 3200}. Profile: lalitmodi7878`
          };
        }

        // Live GitHub User Profile & Repos
        let totalRepos = 15;
        if (ghUserRes.status === "fulfilled" && ghUserRes.value) {
          totalRepos = ghUserRes.value.public_repos || 15;
          (updatedContext as any).githubProfile = {
            bio: ghUserRes.value.bio,
            public_repos: ghUserRes.value.public_repos,
            followers: ghUserRes.value.followers,
            following: ghUserRes.value.following
          };
        }

        if (ghRes.status === "fulfilled" && Array.isArray(ghRes.value) && ghRes.value.length > 0) {
          const repos = ghRes.value.slice(0, 10).map((r) => ({
            name: r.display_name || r.name,
            description: r.description || "Full-stack application",
            language: r.language || "TypeScript",
            stars: r.stargazers_count || 0,
            url: r.html_url
          }));
          (updatedContext as any).liveGitHubRepos = repos;
          updatedContext.codingStats = {
            ...updatedContext.codingStats,
            github: `Live Stats: ${totalRepos}+ repositories on GitHub (@LalitModi90). Top live repositories include ${repos.map((r) => r.name).slice(0, 5).join(", ")}.`
          };
        }

        liveContextRef.current = updatedContext;
      } catch (err) {
        console.warn("Live platform & About Me sync warning:", err);
      }
    }

    syncLivePlatformData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save wake-word preference
  const toggleWakeWord = useCallback((enabled?: boolean) => {
    setWakeWordEnabled((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      try {
        localStorage.setItem("siri_wakeword_enabled", String(next));
      } catch { /* empty */ }
      return next;
    });
  }, []);

  // Preload synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Subtle activation chime
  const playSiriChime = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const audio = document.getElementById("siri-audio") as HTMLAudioElement | null;
        if (audio) {
          audio.volume = 0.7;
          audio.currentTime = 0;
          audio.play().then(() => {
            const timeout = setTimeout(resolve, 800);
            audio.onended = () => {
              clearTimeout(timeout);
              resolve();
            };
          }).catch(() => resolve());
        } else {
          resolve();
        }
      } catch {
        resolve();
      }
    });
  }, []);

  // Cancel any active speech synthesis
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (phase === "speaking") {
      setPhase("idle");
    }
  }, [phase]);

  // Execute safe predefined actions
  const executeAction = useCallback((action: SiriAction | null) => {
    if (!action) return;
    try {
      switch (action.type) {
        case "open_app": {
          const rawTarget = (action.target || "").toLowerCase().trim();
          const targetMap: Record<string, string> = {
            settings: "system-settings",
            "system settings": "system-settings",
            "system-settings": "system-settings",
            note: "notes",
            notes: "notes",
            editor: "vscode",
            code: "vscode",
            "vs code": "vscode",
            vscode: "vscode",
            browser: "safari",
            safari: "safari",
            terminal: "terminal",
            bash: "terminal",
            cli: "terminal",
            facetime: "facetime",
            camera: "facetime",
            about: "bear",
            "know me": "bear",
            "know-me": "bear",
            bear: "bear",
            profile: "bear",
            skills: "bear",
            projects: "bear",
            calculator: "calculator",
            calc: "calculator",
            spotify: "spotify",
            music: "music",
            maps: "maps",
            map: "maps",
            messages: "messages",
            message: "messages",
            chat: "messages",
            clock: "clock",
            timer: "clock",
            mail: "mail",
            email: "mail",
            "app store": "app-store",
            "app-store": "app-store",
            apps: "app-store",
            finder: "finder",
            files: "finder",
            launchpad: "launchpad",
            typora: "typora",
            "recruiter note": "typora"
          };
          const resolvedTarget = targetMap[rawTarget] || rawTarget;
          window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: resolvedTarget } }));
          const dockEl = document.querySelector(`#dock-${resolvedTarget}`) as HTMLElement | null;
          if (dockEl) {
            dockEl.click();
          }
          break;
        }
        case "open_url": {
          if (action.target && typeof action.target === "string") {
            const url = action.target.trim();
            // Strict URL scheme validation to prevent javascript: / data: / file: XSS execution
            if (/^https?:\/\//i.test(url)) {
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }
          break;
        }
        case "download_resume": {
          const target = (action.target && typeof action.target === "string") ? action.target.trim() : "/resume.pdf";
          // Restrict to safe local path or HTTPS URL only
          const safeHref = (target.startsWith("/") || /^https?:\/\//i.test(target)) && !/javascript:/i.test(target)
            ? target
            : "/resume.pdf";

          const link = document.createElement("a");
          link.href = safeHref;
          link.download = "Lalit_Kumar_Resume.pdf";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        }
        case "toggle_dark": {
          store.toggleDark();
          break;
        }
        case "play_music": {
          try {
            if (action.target && typeof action.target === "string") {
              const searchTerm = action.target.trim();
              window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: "spotify" } }));
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("spotify:voiceSearch", { 
                  detail: { query: searchTerm, playImmediately: true } 
                }));
              }, 350);
            } else {
              const playPromise = controls.play();
              if (playPromise && typeof (playPromise as any).catch === "function") {
                (playPromise as Promise<void>).catch(() => {});
              }
            }
          } catch { /* empty */ }
          break;
        }
        case "stop_music": {
          controls.pause();
          break;
        }
        case "close_siri": {
          window.dispatchEvent(new CustomEvent("siri:close"));
          break;
        }
        case "navigate": {
          if (action.target === "home") {
            window.dispatchEvent(new CustomEvent("siri:close"));
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.warn("Error executing action:", err);
    }
  }, [store, controls]);

  // Smart natural voice selection — prioritizes Google Neural (Google हिन्दी / Assistant) & Microsoft Natural voices
  const selectBestVoice = useCallback((targetLang?: "hi" | "gu" | "en" | string): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Score each voice based on the target language & acoustic quality
    const scoreVoice = (v: SpeechSynthesisVoice): number => {
      let score = 0;
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();

      // 1. Target Language Match (Hindi, Gujarati, Indian English, US English)
      if (targetLang === "hi") {
        if (lang === "hi-in" || lang.startsWith("hi")) score += 100;
        else if (lang === "en-in" || lang.startsWith("en-in")) score += 60; // Indian English voices speak Hinglish beautifully
        else if (lang.startsWith("gu")) score += 40;
        else score -= 40; // Penalize US/UK voices trying to pronounce Hindi
      } else if (targetLang === "gu") {
        if (lang === "gu-in" || lang.startsWith("gu")) score += 100;
        else if (lang === "hi-in" || lang.startsWith("hi")) score += 60;
        else if (lang === "en-in" || lang.startsWith("en-in")) score += 50;
        else score -= 40;
      } else {
        // English / Default
        if (lang === "en-in") score += 40;
        else if (lang === "en-us") score += 35;
        else if (lang === "en-gb") score += 30;
        else if (lang.startsWith("en")) score += 20;
      }

      // 2. Google Voices (Chrome) — Highest Quality Neural TTS (Google Assistant)
      if (name.includes("google")) {
        score += 50;
        if (name.includes("हिन्दी") || name.includes("hindi") || name.includes("ગુજરાતી")) {
          score += 60; // Exact Google Hindi / Gujarati Assistant voice
        }
      }

      // 3. Microsoft Online Natural Neural voices (Edge) — Ultra-realistic
      if (name.includes("natural") || name.includes("online")) {
        score += 45;
        if (name.includes("swara") || name.includes("madhur") || name.includes("neerja") || name.includes("dhwani")) {
          score += 50;
        }
      }

      // 4. Known Indian & Female voice names across operating systems
      if (/swara|neerja|aditi|priya|kalpana|raveena|veena|heera|lekha|dhwani/i.test(name)) score += 55;
      if (/samantha|karen|moira|tessa|fiona|victoria|allison/i.test(name)) score += 30;
      if (/zira|hazel|susan|jenny|aria|sara/i.test(name)) score += 30;

      // 5. Female indicators
      if (/female|woman/i.test(name)) score += 20;

      // 6. Penalize robotic/compact voices
      if (/compact|espeak/i.test(name)) score -= 50;

      return score;
    };

    // Score all voices and pick the highest
    const scored = voices
      .map((v) => ({ voice: v, score: scoreVoice(v) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.length > 0 ? scored[0].voice : voices[0] || null;
  }, []);

  // Natural text-to-speech output — Google Assistant style female voice
  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      setPhase("idle");
      onDone?.();
      return;
    }

    // Cancel any previous speech to prevent overlapping
    window.speechSynthesis.cancel();
    setPhase("speaking");

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisUtteranceRef.current = utterance;

    // Detect language of the speech text
    const isGujarati =
      /[\u0A80-\u0AFF]/.test(text) ||
      /\b(chhe|che|chho|cho|tamne|tame|kem|kemcho|kemchho|batavo|aapo|kare|joiye|nathi|karyu|karya|mate|ane|shu|su)\b/i.test(text);

    const isHindi =
      !isGujarati &&
      (/[\u0900-\u097F]/.test(text) ||
        /\b(hai|hain|karo|batao|khol|diya|chup|kare|kiya|kuch|unka|unhe|unhone|iske|baare|bare|mein|se|pe|par|ek|karega|karte|shuru|chahiye|namaste|alvida|badhiya|kaise|hoon|rahe|rakha)\b/i.test(
          text
        ));

    const targetLang = isGujarati ? "gu" : isHindi ? "hi" : "en";

    // Select the best natural-sounding voice (Google Assistant / Microsoft Natural Female)
    const bestVoice = selectBestVoice(targetLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = isGujarati ? "gu-IN" : isHindi ? "hi-IN" : "en-IN";
    }

    // Natural Google Assistant female speech settings
    utterance.rate = 0.94;   // Natural human pace
    utterance.pitch = 1.06;  // Sweet, friendly female pitch
    utterance.volume = 1.0;  // Full volume

    let hasCompleted = false;
    const handleComplete = () => {
      if (hasCompleted) return;
      hasCompleted = true;
      clearInterval(keepAliveInterval);
      clearTimeout(maxDurationTimeout);
      speechSynthesisUtteranceRef.current = null;
      setPhase("idle");
      onDone?.();
    };

    utterance.onend = handleComplete;
    utterance.onerror = handleComplete;

    // Chrome TTS keep-alive to prevent speech from stalling on longer sentences
    const keepAliveInterval = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(keepAliveInterval);
      }
    }, 4000);

    // Max safe duration fallback
    const maxDurationTimeout = setTimeout(handleComplete, 22000);

    window.speechSynthesis.speak(utterance);
  }, [selectBestVoice]);

async function callDirectGemini(apiKey: string, prompt: string, history: any[], context: any): Promise<SiriResponse | null> {
  try {
    const contents: any[] = [];
    const contextStr = JSON.stringify(context || {}, null, 2);
    const SYSTEM_PROMPT = `You are Siri, the personal AI voice assistant for Lalit Modi (Lalit Kumar).
You MUST answer dynamically, authentically, and conversationally in the EXACT same language as the user (Gujarati if Gujarati, Hindi if Hindi, English if English).
Use the latest real-time context from Lalit's portfolio and live coding stats.
Never use boilerplate repetitive intros. Always answer specifically.
Return ONLY valid JSON: {"intent": "string", "response": "2-3 short conversational sentences in user's language", "action": null | {"type": "open_app"|"open_url"|"download_resume", "target": "string"}}`;

    contents.push({
      role: "user",
      parts: [{ text: `${SYSTEM_PROMPT}\n\nPortfolio Context:\n${contextStr}` }]
    });
    contents.push({
      role: "model",
      parts: [{ text: JSON.stringify({ intent: "SYSTEM_READY", response: "Understood.", action: null }) }]
    });

    for (const msg of history.slice(-4)) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }]
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        parsed.modelUsed = "Google Gemini 1.5 Flash (Direct)";
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Direct Gemini call error:", err);
  }
  return null;
}

  // Multi-tier query resolution (Live AI Gemini/OpenAI API First -> Smart Local Knowledge Engine)
  const processQuery = useCallback(
    async (queryText: string) => {
      const cleaned = (queryText || "").trim();
      if (!cleaned) {
        setPhase("idle");
        return;
      }

      setTranscript(cleaned);
      setPhase("thinking");

      // 1. Immediate system commands (Stop speaking)
      if (
        cleaned === "stop" ||
        cleaned === "stop speaking" ||
        cleaned === "enough" ||
        cleaned === "chup" ||
        cleaned === "chup ho jao"
      ) {
        stopSpeaking();
        return;
      }

      // 2. Immediate direct system commands (theme, music, close)
      const normalized = normalizeVoiceQuery(cleaned);
      if (normalized === "close siri" || normalized === "exit siri" || normalized === "bye") {
        setResponse("Goodbye! Let me know if you need anything else.");
        speak("Goodbye! Let me know if you need anything else.", () => {
          executeAction({ type: "close_siri" });
        });
        return;
      }

      const activeContext = liveContextRef.current || PORTFOLIO_CONTEXT;

      // 3. Call Live AI API (/api/assistant powered by Google Gemini / OpenAI)
      try {
        const apiRes = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: cleaned,
            history: history.slice(-4),
            context: activeContext
          })
        });

        if (apiRes.ok) {
          const data: SiriResponse & { modelUsed?: string } = await apiRes.json();
          if (data && data.response && data.intent !== "FALLBACK_PORTFOLIO") {
            setActiveModel(data.modelUsed || "Google Gemini 1.5 Flash");
            setResponse(data.response);
            setHistory((prev) => [
              ...prev.slice(-6),
              { role: "user", content: cleaned },
              { role: "assistant", content: data.response }
            ]);

            speak(data.response, () => {
              executeAction(data.action);
            });
            return;
          }
        }
      } catch (err) {
        console.warn("AI Assistant API error:", err);
      }

async function callDirectOpenAI(apiKey: string, prompt: string, history: any[], context: any): Promise<SiriResponse | null> {
  try {
    const contextStr = JSON.stringify(context || {}, null, 2);
    const SYSTEM_PROMPT = `You are Siri, the personal AI voice assistant for Lalit Modi (Lalit Kumar).
You MUST answer dynamically, authentically, and conversationally in the EXACT same language as the user (Gujarati if Gujarati, Hindi if Hindi, English if English).
Use the latest real-time context from Lalit's portfolio and live coding stats.
Never use boilerplate repetitive intros. Always answer specifically.
Return ONLY valid JSON: {"intent": "string", "response": "2-3 short conversational sentences in user's language", "action": null | {"type": "open_app"|"open_url"|"download_resume", "target": "string"}}`;

    const messages: any[] = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nPortfolio Context:\n${contextStr}` }
    ];

    for (const msg of history.slice(-4)) {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content || ""
      });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        parsed.modelUsed = "OpenAI GPT-4o Mini (Direct)";
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Direct OpenAI call error:", err);
  }
  return null;
}

      // 4. Try Direct Client-Side Gemini or OpenAI if API keys are present in client env
      const clientGeminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
      if (clientGeminiKey) {
        const directRes = await callDirectGemini(clientGeminiKey, cleaned, history, activeContext);
        if (directRes && directRes.response) {
          setActiveModel(directRes.modelUsed || "Google Gemini 1.5 Flash (Direct)");
          setResponse(directRes.response);
          setHistory((prev) => [
            ...prev.slice(-6),
            { role: "user", content: cleaned },
            { role: "assistant", content: directRes.response }
          ]);

          speak(directRes.response, () => {
            executeAction(directRes.action);
            if (directRes.action?.type !== "close_siri" && directRes.action?.type !== "navigate") {
              setTimeout(() => {
                startListeningRef.current();
              }, 450);
            }
          });
          return;
        }
      }

      const clientOpenAIKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || (import.meta as any).env?.OPENAI_API_KEY;
      if (clientOpenAIKey) {
        const directOpenAIRes = await callDirectOpenAI(clientOpenAIKey, cleaned, history, activeContext);
        if (directOpenAIRes && directOpenAIRes.response) {
          setActiveModel(directOpenAIRes.modelUsed || "OpenAI GPT-4o Mini (Direct)");
          setResponse(directOpenAIRes.response);
          setHistory((prev) => [
            ...prev.slice(-6),
            { role: "user", content: cleaned },
            { role: "assistant", content: directOpenAIRes.response }
          ]);

          speak(directOpenAIRes.response, () => {
            executeAction(directOpenAIRes.action);
            if (directOpenAIRes.action?.type !== "close_siri" && directOpenAIRes.action?.type !== "navigate") {
              setTimeout(() => {
                startListeningRef.current();
              }, 450);
            }
          });
          return;
        }
      }

      // 5. Robust Local Portfolio Knowledge Engine Fallback (Ground in real about-me data)
      const localResult = resolveLocalIntent(cleaned, history);
      if (localResult) {
        setActiveModel(localResult.modelUsed || "Portfolio AI Core");
        setResponse(localResult.response);
        setHistory((prev) => [
          ...prev.slice(-6),
          { role: "user", content: cleaned },
          { role: "assistant", content: localResult.response }
        ]);

        speak(localResult.response, () => {
          executeAction(localResult.action);
          if (localResult.action?.type !== "close_siri" && localResult.action?.type !== "navigate") {
            setTimeout(() => {
              startListeningRef.current();
            }, 450);
          }
        });
        return;
      }

      // 6. Default Dynamic Fallback
      const dynamicResponse = `Regarding "${cleaned}", Lalit is a Software Development Engineer skilled in React, Next.js, Node.js, and Java, with 349+ LeetCode problems solved. You can ask about his projects like Codeyx, explore his skills, or download his resume!`;
      setActiveModel("Portfolio AI Core");
      setResponse(dynamicResponse);
      setHistory((prev) => [
        ...prev.slice(-6),
        { role: "user", content: cleaned },
        { role: "assistant", content: dynamicResponse }
      ]);
      speak(dynamicResponse, () => {
        executeAction({ type: "open_app", target: "bear" });
        setTimeout(() => {
          startListeningRef.current();
        }, 450);
      });
    },
    [history, speak, executeAction, stopSpeaking]
  );

  // Keep processQuery ref updated
  useEffect(() => {
    processQueryRef.current = processQuery;
  }, [processQuery]);

  // Start active command listening
  const startListening = useCallback(async () => {
    if (!SpeechRecognitionAPI) {
      setMicPermission("unsupported");
      setResponse("Voice recognition is not supported in this browser. Please type your query or click options.");
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (wakeWordRecognitionRef.current) {
      try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ }
    }

    await playSiriChime();
    setPhase("listening");
    setTranscript("");
    isListeningCommandRef.current = true;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch { /* empty */ }
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-IN"; // Supports Hindi words, English and Hinglish smoothly
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = "";

      recognition.onstart = () => {
        setMicPermission("granted");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interim);
      };

      recognition.onspeechend = () => {
        try { recognition.stop(); } catch { /* empty */ }
      };

      recognition.onend = () => {
        isListeningCommandRef.current = false;
        recognitionRef.current = null;
        if (finalTranscript.trim()) {
          processQueryRef.current(finalTranscript.trim());
        } else {
          setPhase((p) => (p === "listening" ? "idle" : p));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Command recognition error:", event.error);
        isListeningCommandRef.current = false;
        recognitionRef.current = null;
        if (event.error === "not-allowed") {
          setMicPermission("denied");
          setResponse("Microphone access was denied. Please allow microphone access in your browser.");
          setPhase("error");
        } else {
          setPhase("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setPhase("idle");
      isListeningCommandRef.current = false;
      recognitionRef.current = null;
    }
  }, [playSiriChime]);

  // Keep startListening ref updated
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // Stop active command listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* empty */ }
    }
    isListeningCommandRef.current = false;
    if (phase === "listening") {
      setPhase("idle");
    }
  }, [phase]);

  // Activate assistant manually or via wake word
  const activateSiri = useCallback(async (customGreeting?: string) => {
    window.dispatchEvent(new CustomEvent("siri:open"));
    if (customGreeting) {
      setResponse(customGreeting);
      speak(customGreeting, () => {
        startListening();
      });
    } else {
      setResponse("Siri is active. How can I help?");
      startListening();
    }
  }, [speak, startListening]);

  // Background Wake Word Detection ("Hey Siri" / "Siri")
  useEffect(() => {
    if (!SpeechRecognitionAPI || !wakeWordEnabled) {
      if (wakeWordRecognitionRef.current) {
        try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ }
      }
      return;
    }

    let isRunning = true;
    let wakeRecognition: any = null;

    const initWakeWord = () => {
      if (!isRunning || isListeningCommandRef.current || phase === "listening" || phase === "speaking") {
        return;
      }

      try {
        wakeRecognition = new SpeechRecognitionAPI();
        wakeRecognition.continuous = true;
        wakeRecognition.interimResults = true;
        wakeRecognition.lang = "en-US";

        wakeRecognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const text = (event.results[i][0].transcript || "").toLowerCase().trim();
            
            const isWake =
              text.includes("hey siri") ||
              text.includes("siri") ||
              text.includes("hay siri") ||
              text.includes("ok siri") ||
              text.includes("hi siri");

            if (isWake) {
              try { wakeRecognition.abort(); } catch { /* empty */ }
              activateSiri("Yes? How can I help?");
              break;
            }
          }
        };

        wakeRecognition.onerror = (e: any) => {
          if (e.error === "not-allowed") {
            setMicPermission("denied");
          }
        };

        wakeRecognition.onend = () => {
          if (isRunning && !isListeningCommandRef.current && phase === "idle" && wakeWordEnabled) {
            setTimeout(initWakeWord, 800);
          }
        };

        wakeWordRecognitionRef.current = wakeRecognition;
        wakeRecognition.start();
      } catch {
        // Recognition start error or duplicate
      }
    };

    if (phase === "idle") {
      initWakeWord();
    }

    return () => {
      isRunning = false;
      if (wakeRecognition) {
        try { wakeRecognition.abort(); } catch { /* empty */ }
      }
    };
  }, [wakeWordEnabled, phase, activateSiri]);

  return {
    phase,
    transcript,
    response,
    history,
    activeModel,
    wakeWordEnabled,
    micPermission,
    isSupported: !!SpeechRecognitionAPI,
    toggleWakeWord,
    activateSiri,
    startListening,
    stopListening,
    stopSpeaking,
    processQuery
  };
}
