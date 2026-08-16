import { useState, useEffect, useRef, useCallback } from "react";
import {
  PORTFOLIO_CONTEXT,
  resolveLocalIntent,
  normalizeVoiceQuery,
  isMeaningfulUserCommand,
  isPortfolioQuery,
  type SiriResponse,
  type SiriAction
} from "~/utils/portfolioContext";
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
  const bargeInRecognitionRef = useRef<any>(null);
  const isListeningCommandRef = useRef<boolean>(false);
  const speechSynthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeUtteranceTextRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);
  const liveContextRef = useRef<any>({ ...PORTFOLIO_CONTEXT });
  const startListeningRef = useRef<() => void>(() => {});
  const processQueryRef = useRef<(q: string) => Promise<void>>(async () => {});

  const store = useStore();
  const { controls } = useAudioContext();

  const isStopCommand = useCallback((raw: string): boolean => {
    const t = (raw || "").toLowerCase().trim();
    return (
      t === "stop" ||
      t === "ruk ja" ||
      t === "ruko" ||
      t === "ruk jao" ||
      t === "bas" ||
      t === "wait" ||
      t === "quiet" ||
      t === "shut up" ||
      t === "shutup" ||
      t === "cancel" ||
      t === "chup" ||
      t === "chup ho jao" ||
      t === "stop speaking" ||
      t === "enough" ||
      t === "pause" ||
      t === "listen" ||
      t === "band karo"
    );
  }, []);

  const interruptActiveSpeech = useCallback((_reason: string = "user_interrupt") => {
    requestIdRef.current++;
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch { /* empty */ }
      abortControllerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch { /* empty */ }
    }
    if (speechSynthesisUtteranceRef.current) {
      speechSynthesisUtteranceRef.current.onend = null;
      speechSynthesisUtteranceRef.current.onerror = null;
      speechSynthesisUtteranceRef.current = null;
    }
    activeUtteranceTextRef.current = "";
    if (bargeInRecognitionRef.current) {
      try {
        bargeInRecognitionRef.current.onend = null;
        bargeInRecognitionRef.current.onerror = null;
        bargeInRecognitionRef.current.abort();
      } catch { /* empty */ }
      bargeInRecognitionRef.current = null;
    }
    try {
      const audio = document.getElementById("siri-audio") as HTMLAudioElement | null;
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch { /* empty */ }
  }, []);

  const stopSpeaking = useCallback(() => {
    interruptActiveSpeech("stop_speaking");
    setPhase("idle");
  }, [interruptActiveSpeech]);

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
        if (aboutMeRes.status === "fulfilled" && aboutMeRes.value) {
          (updatedContext as any).liveAboutMeDoc = aboutMeRes.value;
        }
        if (lcRes.status === "fulfilled" && lcRes.value) {
          const lc = lcRes.value;
          updatedContext.codingStats = {
            ...updatedContext.codingStats,
            leetcode: `Live Stats: ${lc.totalSolved} DSA problems solved (${lc.easySolved} Easy, ${lc.mediumSolved} Medium, ${lc.hardSolved} Hard). Global Ranking: ${lc.ranking || 142050}. Contest Rating: ${lc.contestRating || 1520}. Profile: LalitModi90`
          };
        }
        if (ccRes.status === "fulfilled" && ccRes.value) {
          const cc = ccRes.value;
          updatedContext.codingStats = {
            ...updatedContext.codingStats,
            codechef: `Live Stats: ${cc.rating} Rating (${cc.stars || "1★"}); Global Rank: ${cc.globalRank || 4893}; Country Rank: ${cc.countryRank || 3200}. Profile: lalitmodi7878`
          };
        }
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
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const requestMicPermission = () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
          .then(() => setMicPermission("granted"))
          .catch((err) => {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") setMicPermission("denied");
            else setMicPermission("prompt");
          });
      }
    };
    const handleGesture = () => {
      requestMicPermission();
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("click", handleGesture);
    };
    window.addEventListener("pointerdown", handleGesture, { once: true });
    window.addEventListener("touchstart", handleGesture, { once: true });
    window.addEventListener("click", handleGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("click", handleGesture);
    };
  }, []);

  const toggleWakeWord = useCallback((enabled?: boolean) => {
    setWakeWordEnabled((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      try { localStorage.setItem("siri_wakeword_enabled", String(next)); } catch { /* empty */ }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const playSiriChime = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const audio = document.getElementById("siri-audio") as HTMLAudioElement | null;
        if (audio) {
          audio.volume = 0.7;
          audio.currentTime = 0;
          audio.play().then(() => {
            const timeout = setTimeout(resolve, 800);
            audio.onended = () => { clearTimeout(timeout); resolve(); };
          }).catch(() => resolve());
        } else { resolve(); }
      } catch { resolve(); }
    });
  }, []);

  const executeAction = useCallback((action: SiriAction | null | undefined) => {
    if (!action || action.type === "none") return;
    switch (action.type) {
      case "open_app":
        if (action.target) window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: action.target } }));
        break;
      case "open_url":
        if (action.target) window.open(action.target, "_blank", "noopener,noreferrer");
        break;
      case "download_resume": {
        const link = document.createElement("a");
        link.href = "/resume.pdf";
        link.download = "Lalit_Modi_Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
      case "toggle_dark":
        store.toggleDark();
        break;
      case "play_music":
        controls.play();
        break;
      case "stop_music":
        controls.pause();
        break;
      case "close_siri":
        window.dispatchEvent(new CustomEvent("siri:close"));
        break;
      case "navigate":
        if (action.target === "home" || action.target === "desktop") window.dispatchEvent(new CustomEvent("desktop:minimizeAll"));
        break;
    }
  }, [controls, store]);

  const selectBestVoice = useCallback((lang: "gu" | "hi" | "en"): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const scoreVoice = (voice: SpeechSynthesisVoice): number => {
      let score = 0;
      const vLang = voice.lang.toLowerCase().replace(/_/g, "-");
      const vName = voice.name.toLowerCase();
      if (lang === "gu") {
        if (vLang.startsWith("gu")) score += 100;
        if (vLang.includes("in")) score += 30;
      } else if (lang === "hi") {
        if (vLang.startsWith("hi")) score += 100;
        if (vLang.includes("in")) score += 30;
      } else {
        if (vLang.startsWith("en-in")) score += 90;
        else if (vLang.startsWith("en-us") || vLang.startsWith("en-gb")) score += 80;
        else if (vLang.startsWith("en")) score += 70;
      }
      if (vName.includes("siri") || vName.includes("apple") || vName.includes("samantha") || vName.includes("karen")) score += 50;
      if (vName.includes("google") || vName.includes("natural") || vName.includes("premium") || vName.includes("enhanced")) score += 40;
      if (vName.includes("female") || vName.includes("swara") || vName.includes("lekha") || vName.includes("veena") || vName.includes("zira") || vName.includes("shruti")) score += 30;
      return score;
    };
    const scored = voices
      .map((v) => ({ voice: v, score: scoreVoice(v) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.length > 0 ? scored[0].voice : voices[0] || null;
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      setPhase("idle");
      onDone?.();
      return;
    }
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    } catch { /* empty */ }
    setPhase("speaking");
    activeUtteranceTextRef.current = text.toLowerCase();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisUtteranceRef.current = utterance;
    const isGujarati = /[\u0A80-\u0AFF]/.test(text) || /\b(chhe|che|chho|cho|tamne|tame|kem|kemcho|kemchho|batavo|aapo|kare|joiye|nathi|karyu|karya|mate|ane|shu|su)\b/i.test(text);
    const isHindi = !isGujarati && (/[\u0900-\u097F]/.test(text) || /\b(hai|hain|karo|batao|khol|diya|chup|kare|kiya|kuch|unka|unhe|unhone|iske|baare|bare|mein|se|pe|par|ek|karega|karte|shuru|chahiye|namaste|alvida|badhiya|kaise|hoon|rahe|rakha)\b/i.test(text));
    const targetLang = isGujarati ? "gu" : isHindi ? "hi" : "en";
    const bestVoice = selectBestVoice(targetLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = isGujarati ? "gu-IN" : isHindi ? "hi-IN" : (navigator.language || "en-IN");
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    let hasCompleted = false;
    let keepAliveInterval: any = null;
    let maxDurationTimeout: any = null;

    const handleComplete = () => {
      if (hasCompleted) return;
      hasCompleted = true;
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (maxDurationTimeout) clearTimeout(maxDurationTimeout);
      speechSynthesisUtteranceRef.current = null;
      activeUtteranceTextRef.current = "";
      if (bargeInRecognitionRef.current) {
        try {
          bargeInRecognitionRef.current.onend = null;
          bargeInRecognitionRef.current.onerror = null;
          bargeInRecognitionRef.current.abort();
        } catch { /* empty */ }
        bargeInRecognitionRef.current = null;
      }
      setPhase("idle");
      onDone?.();
    };
    utterance.onend = handleComplete;
    utterance.onerror = handleComplete;
    keepAliveInterval = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        if (window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        } else clearInterval(keepAliveInterval);
      } else clearInterval(keepAliveInterval);
    }, 2000);
    maxDurationTimeout = setTimeout(handleComplete, 20000);
    const isMobileDevice =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        (typeof navigator !== "undefined" &&
          (navigator.maxTouchPoints > 1 ||
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || ""))));

    if (SpeechRecognitionAPI && !isMobileDevice) {
      try {
        if (bargeInRecognitionRef.current) { try { bargeInRecognitionRef.current.abort(); } catch { /* empty */ } }
        const bargeRecognition = new SpeechRecognitionAPI();
        bargeRecognition.continuous = true;
        bargeRecognition.interimResults = true;
        bargeRecognition.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
        bargeRecognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const rawHeard = (event.results[i][0]?.transcript || "").trim().toLowerCase();
            if (!rawHeard) continue;
            if (isStopCommand(rawHeard)) {
              interruptActiveSpeech("barge_in_stop");
              setPhase("idle");
              setTranscript("Stopped.");
              setResponse("Stopped.");
              return;
            }
            const currentTTS = activeUtteranceTextRef.current;
            const isEcho = currentTTS.length > 5 && currentTTS.includes(rawHeard) && rawHeard.length < currentTTS.length / 2;
            if (!isEcho && rawHeard.length > 1 && isMeaningfulUserCommand(rawHeard)) {
              interruptActiveSpeech("barge_in_new_question");
              setPhase("listening");
              setTranscript(rawHeard);
              startListeningRef.current();
              return;
            }
          }
        };
        bargeRecognition.onerror = () => { /* ignore */ };
        bargeInRecognitionRef.current = bargeRecognition;
        bargeRecognition.start();
      } catch { /* ignore */ }
    }
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis speak error:", err);
        handleComplete();
      }
    }, 50);
  }, [selectBestVoice, interruptActiveSpeech, isStopCommand]);

  const processQuery = useCallback(async (queryText: string) => {
    const cleaned = (queryText || "").trim();
    if (!cleaned) { setPhase("idle"); return; }

    // 1. Instant 0ms Stop Commands
    if (isStopCommand(cleaned)) {
      interruptActiveSpeech("stop_command");
      setPhase("idle");
      setTranscript("Stopped.");
      setResponse("Stopped.");
      return;
    }

    interruptActiveSpeech("new_query");
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;
    setTranscript(cleaned);
    setPhase("thinking");

    // 2. Direct Instant System Navigation (Exit / Close)
    const normalized = normalizeVoiceQuery(cleaned);
    if (normalized === "close siri" || normalized === "exit siri" || normalized === "bye") {
      setResponse("Goodbye! Let me know if you need anything else.");
      speak("Goodbye! Let me know if you need anything else.", () => executeAction({ type: "close_siri" }));
      return;
    }

    // 3. Fast-Path: Instant 0ms Local Intent Resolution (Greetings, Common Questions, App Actions, Slang)
    const localResult = resolveLocalIntent(cleaned, history);
    if (localResult) {
      setActiveModel(localResult.modelUsed || "Portfolio AI Core");
      setResponse(localResult.response);
      setHistory((prev) => [...prev.slice(-6), { role: "user", content: cleaned }, { role: "assistant", content: localResult.response }]);
      speak(localResult.response, () => {
        executeAction(localResult.action);
        if (localResult.action?.type !== "close_siri" && localResult.action?.type !== "navigate") {
          setTimeout(() => startListeningRef.current(), 350);
        }
      });
      return;
    }

    // 4. Live AI API Resolution for Open-Ended & Complex Queries
    const isLalitQuestion = isPortfolioQuery(cleaned);
    const activeContext = isLalitQuestion ? (liveContextRef.current || PORTFOLIO_CONTEXT) : {};

    try {
      const apiRes = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ prompt: cleaned, history: history.slice(-4), context: activeContext })
      });
      if (currentRequestId !== requestIdRef.current) return;
      if (apiRes.ok) {
        const data: SiriResponse & { modelUsed?: string } = await apiRes.json();
        if (currentRequestId === requestIdRef.current && data && data.response && data.intent !== "FALLBACK_PORTFOLIO") {
          setActiveModel(data.modelUsed || "Google Gemini 1.5 Flash");
          setResponse(data.response);
          setHistory((prev) => [...prev.slice(-6), { role: "user", content: cleaned }, { role: "assistant", content: data.response }]);
          speak(data.response, () => {
            executeAction(data.action);
            if (data.action?.type !== "close_siri" && data.action?.type !== "navigate") {
              setTimeout(() => startListeningRef.current(), 350);
            }
          });
          return;
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.warn("AI Assistant API error:", err);
    }
    if (currentRequestId !== requestIdRef.current) return;

    // 5. Dynamic Fallback
    const isGuj = /[\u0A80-\u0AFF]|\b(shu|su|chhe|che|chho|cho|tamne|tame|kem|batavo|aapo)\b/i.test(cleaned);
    const isHin = !isGuj && (/[\u0900-\u097F]|\b(kya|kaun|batao|kholo|dikhao|hai|hain|karo|tum|aap|bhai)\b/i.test(cleaned));

    const dynamicResponse = isLalitQuestion
      ? (isGuj
          ? `Hu Siri chhu! Hu tamne Lalit Modi na projects, 395+ LeetCode stats, skills, ane resume vishe jankari aapi shaku chhu.`
          : isHin
          ? `Main Siri hoon! Main aapki Lalit ke projects (Codeyx, Mini ERP), 395+ LeetCode stats, skills, ya resume explore karne me madad kar sakti hoon.`
          : `I'm Siri, Lalit Modi's AI Assistant! I can help you explore Lalit's projects (like Codeyx), check his 395+ LeetCode stats, skills, or download his resume.`)
      : (isGuj
          ? `Hu tamari vaat samji gayi. Tame koi pan sawal puchhi shako chho!`
          : isHin
          ? `Main samajh gayi! Kaho, main aapki kya madad kar sakti hoon?`
          : `I'm listening! Feel free to ask any question or explore projects and tools on this portfolio.`);

    setActiveModel("Portfolio AI Core");
    setResponse(dynamicResponse);
    setHistory((prev) => [...prev.slice(-6), { role: "user", content: cleaned }, { role: "assistant", content: dynamicResponse }]);
    speak(dynamicResponse, () => { setTimeout(() => startListeningRef.current(), 350); });
  }, [history, speak, executeAction, interruptActiveSpeech, isStopCommand]);

  useEffect(() => { processQueryRef.current = processQuery; }, [processQuery]);

  const startListening = useCallback(async () => {
    if (!SpeechRecognitionAPI) {
      setMicPermission("unsupported");
      setResponse("Voice recognition is not supported in this browser. Please type your query or click options.");
      return;
    }
    interruptActiveSpeech("start_listening");
    if (wakeWordRecognitionRef.current) { try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ } }
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia && micPermission === "prompt") {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        setMicPermission("granted");
      } catch { setMicPermission("denied"); }
    }
    playSiriChime().catch(() => {});
    setPhase("listening");
    setTranscript("");
    isListeningCommandRef.current = true;
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; recognitionRef.current.onerror = null; recognitionRef.current.abort(); } catch { /* empty */ }
        recognitionRef.current = null;
      }
      const recognition = new SpeechRecognitionAPI();
      const systemLang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
      recognition.lang = systemLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 5;
      let finalTranscript = "";
      let capturedText = "";
      let silenceTimer: any = null;
      recognition.onstart = () => { setMicPermission("granted"); };
      const INTENT_KEYWORDS = [
        "about", "lalit", "skills", "projects", "resume", "cv", "leetcode", "codeyx", "github", "codechef", "contact", "email", "mail", "terminal", "maps", "batao", "khol", "kholo", "show", "tell", "whoami", "help", "status", "neofetch", "open", "spotify", "music", "play", "who", "what", "how", "kya", "kaun", "tum", "aap", "che", "chhe", "dikhao", "siri", "hey", "hi", "ok", "calculator", "calc", "code", "vscode", "song", "gana", "education", "parul", "degree", "vadodara", "hire", "work", "stop", "ruk", "bas"
      ];
      const scoreCandidate = (candText: string) => {
        const lower = candText.toLowerCase();
        let score = 0;
        for (const kw of INTENT_KEYWORDS) if (lower.includes(kw)) score += 5;
        if (lower.length > 2) score += 1;
        return score;
      };
      recognition.onresult = (event: any) => {
        let interim = "";
        let isFinalDetected = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const altList = event.results[i];
          let bestCandidate = altList[0]?.transcript || "";
          let bestScore = scoreCandidate(bestCandidate);
          for (let j = 1; j < altList.length; j++) {
            const candText = altList[j]?.transcript || "";
            const s = scoreCandidate(candText);
            if (s > bestScore) { bestCandidate = candText; bestScore = s; }
          }
          if (altList.isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + bestCandidate;
            isFinalDetected = true;
          } else {
            interim += bestCandidate;
          }
        }
        capturedText = finalTranscript || interim;
        setTranscript(capturedText);

        if (silenceTimer) clearTimeout(silenceTimer);
        // Snappy stop: if final transcript is obtained, finalize in 100ms; else 550ms silence timeout
        silenceTimer = setTimeout(() => {
          try { recognition.stop(); } catch { /* empty */ }
        }, isFinalDetected ? 100 : 550);
      };
      recognition.onspeechend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => { try { recognition.stop(); } catch { /* empty */ } }, 150);
      };
      recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        isListeningCommandRef.current = false;
        recognitionRef.current = null;
        const queryToProcess = (finalTranscript || capturedText || "").trim();
        if (queryToProcess && isMeaningfulUserCommand(queryToProcess)) {
          processQueryRef.current(queryToProcess);
        } else {
          // Ambient noise / filler sound ignored smoothly without false triggers
          if (phaseRef.current === "listening") {
            setPhase("idle");
          }
        }
      };
      recognition.onerror = (event: any) => {
        isListeningCommandRef.current = false;
        recognitionRef.current = null;
        if (event.error === "not-allowed") { setMicPermission("denied"); setPhase("error"); }
        else setPhase("idle");
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setPhase("idle");
      isListeningCommandRef.current = false;
      recognitionRef.current = null;
    }
  }, [playSiriChime, interruptActiveSpeech]);

  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { /* empty */ } }
    isListeningCommandRef.current = false;
    if (phase === "listening") setPhase("idle");
  }, [phase]);

  const activateSiri = useCallback(async (customGreeting?: string) => {
    window.dispatchEvent(new CustomEvent("siri:open"));
    if (customGreeting) {
      setResponse(customGreeting);
      speak(customGreeting, () => startListening());
    } else {
      setResponse("Siri is active. How can I help?");
      startListening();
    }
  }, [speak, startListening]);

  const activateSiriRef = useRef(activateSiri);
  useEffect(() => { activateSiriRef.current = activateSiri; }, [activateSiri]);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (!SpeechRecognitionAPI || !wakeWordEnabled) {
      if (wakeWordRecognitionRef.current) { try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ } }
      return;
    }
    let isSubscribed = true;
    const startWakeLoop = () => {
      if (!isSubscribed || isListeningCommandRef.current || phaseRef.current !== "idle") {
        if (isSubscribed) setTimeout(startWakeLoop, 1200);
        return;
      }
      try {
        if (wakeWordRecognitionRef.current) { try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ } }
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const text = (event.results[i][0].transcript || "").toLowerCase().trim();
            const isWake = text.includes("hey siri") || text.includes("siri") || text.includes("hay siri") || text.includes("ok siri") || text.includes("hi siri") || text.includes("siri kholo") || text.includes("siri suno");
            if (isWake) { try { recognition.abort(); } catch { /* empty */ } activateSiriRef.current("Yes? How can I help?"); break; }
          }
        };
        recognition.onerror = (e: any) => { if (e.error === "not-allowed") setMicPermission("denied"); };
        recognition.onend = () => { if (isSubscribed && !isListeningCommandRef.current && phaseRef.current === "idle" && wakeWordEnabled) setTimeout(startWakeLoop, 800); };
        wakeWordRecognitionRef.current = recognition;
        recognition.start();
      } catch { if (isSubscribed) setTimeout(startWakeLoop, 1500); }
    };
    startWakeLoop();
    return () => {
      isSubscribed = false;
      if (wakeWordRecognitionRef.current) { try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ } }
    };
  }, [wakeWordEnabled]);

  useEffect(() => {
    return () => {
      interruptActiveSpeech("unmount");
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* empty */ } }
      if (wakeWordRecognitionRef.current) { try { wakeWordRecognitionRef.current.abort(); } catch { /* empty */ } }
    };
  }, [interruptActiveSpeech]);

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
