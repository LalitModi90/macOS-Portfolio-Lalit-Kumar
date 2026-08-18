import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSiriAssistant } from "~/hooks/useSiriAssistant";
import { useStore } from "~/stores";

interface SiriProps {
  closeSiri?: () => void;
  isMobile?: boolean;
}

export default function Siri({ closeSiri, isMobile = false }: SiriProps) {
  const dark = useStore((state) => state.dark);
  const desktopChatRef = useRef<HTMLDivElement>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);
  const [typedInput, setTypedInput] = useState("");

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const effectiveIsMobile = isMobile || isMobileScreen;

  const {
    phase,
    transcript,
    response,
    history,
    activeModel,
    isSupported,
    startListening,
    stopListening,
    stopSpeaking,
    processQuery
  } = useSiriAssistant();

  // Auto-start listening on mount whenever Siri is opened
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (!hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startListening();
    }
  }, [startListening]);

  // Scroll ONLY the chat message container (never window or parent body)
  useEffect(() => {
    if (desktopChatRef.current) {
      desktopChatRef.current.scrollTop = desktopChatRef.current.scrollHeight;
    }
    if (mobileChatRef.current) {
      mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight;
    }
  }, [response, transcript, history, phase]);

  // Handle manual orb click
  const handleOrbClick = useCallback(() => {
    if (phase === "speaking") {
      stopSpeaking();
      startListening();
    } else if (phase === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [phase, startListening, stopListening, stopSpeaking]);

  // Handle typing submission
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    if (phase === "speaking") {
      stopSpeaking();
    }
    processQuery(typedInput.trim());
    setTypedInput("");
  };

  // Close helper
  const handleClose = useCallback(() => {
    stopSpeaking();
    stopListening();
    if (closeSiri) closeSiri();
    window.dispatchEvent(new CustomEvent("siri:close"));
  }, [closeSiri, stopSpeaking, stopListening]);

  // Quick prompt presets
  const quickPrompts = [
    "Tell me about Lalit",
    "Show projects",
    "What is Codeyx?",
    "Open resume"
  ];

  const isOrbActive = phase === "listening" || phase === "thinking" || phase === "speaking";

  // Phase-based accent color
  const accentColor =
    phase === "listening" ? "#0ea5e9"
    : phase === "thinking" ? "#a855f7"
    : phase === "speaking" ? "#10b981"
    : "#64748b";

  // Shared Siri visualizer styles
  const visualizerStyles = (
    <style>{`
      @keyframes siri-aura-glow {
        0%, 100% { transform: scale(0.85); opacity: 0.35; }
        50% { transform: scale(1.18); opacity: 0.9; filter: blur(24px); }
      }
      @keyframes siri-waveform-wave {
        0%, 100% { height: 4px; }
        50% { height: 22px; }
      }
      @keyframes siri-thinking-pulse {
        0%, 100% { opacity: 0.4; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      .siri-aura-pulse {
        animation: siri-aura-glow 2.2s ease-in-out infinite;
      }
      .siri-wave-bar {
        width: 3px;
        border-radius: 9999px;
        background: linear-gradient(180deg, #38bdf8, #a855f7, #ec4899);
        animation: siri-waveform-wave 0.9s ease-in-out infinite;
      }
      .siri-thinking-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #ec4899);
        animation: siri-thinking-pulse 1.2s ease-in-out infinite;
      }
    `}</style>
  );

  // -------------------------------------------------------------
  // MOBILE VIEW: Full-Height Immersive iOS Assistant Interface
  // -------------------------------------------------------------
  if (effectiveIsMobile) {
    return (
      <div className="w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#111319] via-[#0d0f14] to-[#08090c] text-white select-none overflow-hidden relative p-4">
        <audio id="siri-audio" src="/music/siri.mp3" preload="auto" className="hidden" />
        {visualizerStyles}

        {/* Top Section: Interactive 3D Siri Orb & Status */}
        <div className="flex flex-col items-center shrink-0 pt-1 pb-2">
          {/* 3D Orb with Aura */}
          <div className="relative w-[110px] h-[110px] flex items-center justify-center">
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
              <div
                className={`w-[100px] h-[100px] rounded-full mix-blend-screen transition-all duration-700 blur-[20px] ${
                  isOrbActive ? "siri-aura-pulse" : "opacity-30 scale-90"
                }`}
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, rgba(56,189,248,0.9) 0%, rgba(168,85,247,0.8) 40%, rgba(236,72,153,0.5) 75%, rgba(0,0,0,0) 100%)",
                  boxShadow: "0 0 40px 15px rgba(236, 72, 153, 0.3)"
                }}
              />
            </div>
            <div
              className="relative z-10 flex justify-center items-center w-[100px] h-[100px] rounded-full cursor-pointer transform active:scale-95 transition-transform duration-200"
              onClick={handleOrbClick}
              title="Tap to speak"
            >
              <video
                src="/img/ui/siri2.webm"
                autoPlay
                loop
                muted
                playsInline
                className={`h-[100px] w-[100px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${
                  phase === "idle" ? "opacity-85" : "opacity-100"
                }`}
              />
            </div>
          </div>

          {/* Status Label & Waveform */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[12px] font-bold tracking-wider uppercase font-sans"
              style={{ color: accentColor }}
            >
              {phase === "listening" ? "Listening to your voice…"
               : phase === "thinking" ? "Thinking…"
               : phase === "speaking" ? "Speaking…"
               : "Siri AI Assistant"}
            </span>

            {phase === "listening" && (
              <div className="flex items-center gap-[2px]">
                {[0.0, 0.15, 0.3, 0.1, 0.25].map((delay, idx) => (
                  <div key={idx} className="siri-wave-bar !h-[14px]" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            )}
            {phase === "speaking" && (
              <div className="flex items-center gap-[2px]">
                {[0.0, 0.2, 0.1, 0.3, 0.15].map((delay, idx) => (
                  <div
                    key={idx}
                    className="siri-wave-bar !h-[14px]"
                    style={{ animationDelay: `${delay}s`, background: "linear-gradient(180deg, #10b981, #059669)" }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Section: Conversation History & Spoken Text Stream */}
        <div ref={mobileChatRef} className="flex-1 min-h-0 overflow-y-auto px-1 py-2 space-y-3 scroll-smooth">
          {history.length === 0 && !response && !transcript && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
              <p className="text-[16px] font-medium text-white/90 mb-1">Hi! How can I help you?</p>
              <p className="text-[12px] text-white/50 max-w-[260px]">
                Ask anything about Lalit's projects, LeetCode stats, skills, or resume.
              </p>
            </div>
          )}

          {/* Past History Turns */}
          {history.map((turn, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${turn.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                  turn.role === "user"
                    ? "bg-sky-600 text-white rounded-br-xs"
                    : "bg-white/10 text-slate-100 backdrop-blur-md rounded-bl-xs border border-white/10"
                }`}
              >
                {turn.content}
              </div>
            </div>
          ))}

          {/* Current Live User Transcript */}
          {phase === "listening" && transcript && (
            <div className="flex flex-col items-end">
              <div className="max-w-[88%] bg-sky-500/30 border border-sky-400/40 text-sky-200 rounded-2xl rounded-br-xs px-3.5 py-2.5 text-[13px] leading-relaxed animate-pulse">
                {transcript}
              </div>
            </div>
          )}

          {/* Current Live Siri Response (Visible whenever Siri is speaking or just responded) */}
          {(phase === "speaking" || (response && history.length === 0)) && (
            <div className="flex flex-col items-start">
              <div className="max-w-[92%] bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 text-white rounded-2xl rounded-bl-xs px-4 py-3 text-[13.5px] leading-relaxed shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Siri speaking:</span>
                </div>
                <div className="font-medium text-slate-100">
                  {response}
                </div>
              </div>
            </div>
          )}

          {/* Thinking State */}
          {phase === "thinking" && (
            <div className="flex items-center gap-2 text-purple-300 text-xs px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl w-fit">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="siri-thinking-dot" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
              <span>Thinking…</span>
            </div>
          )}
        </div>

        {/* Bottom Section: Quick Prompts + Input + Voice Bar */}
        <div className="shrink-0 pt-2 border-t border-white/10 space-y-2.5">
          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => processQuery(prompt)}
                className="whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/90 border border-white/10 transition-all active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Text Input Form */}
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Ask Siri a question…"
              className="flex-1 text-[13px] px-3.5 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-white/40 border border-white/15 focus:border-sky-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-[12px] font-bold shadow-md transition-all"
            >
              Ask
            </button>
          </form>

          {/* Voice Action & Model Badge */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[130px]">{activeModel}</span>
            </div>

            <div className="flex items-center gap-2">
              {phase === "speaking" && (
                <button
                  onClick={stopSpeaking}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 active:scale-95 transition-all"
                >
                  ⏹ Stop
                </button>
              )}

              <button
                onClick={() => {
                  if (phase === "speaking") stopSpeaking();
                  else if (phase === "listening") stopListening();
                  else startListening();
                }}
                className={`px-4 py-1.5 rounded-xl font-semibold shadow-md transition-all active:scale-95 ${
                  phase === "listening"
                    ? "bg-sky-500 text-white animate-pulse"
                    : "bg-white/15 hover:bg-white/25 text-white border border-white/15"
                }`}
              >
                {phase === "listening" ? "● Listening…" : "🎤 Tap to Speak"}
              </button>
            </div>
          </div>

          {!isSupported && (
            <div className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded-lg leading-tight border border-amber-500/20">
              Voice recognition isn't supported in this browser. Please type your query above.
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DESKTOP VIEW: macOS Floating Siri Widget Layout
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-start justify-end gap-3.5 relative pointer-events-auto select-none">
      <audio id="siri-audio" src="/music/siri.mp3" preload="auto" className="hidden" />
      {visualizerStyles}

      {/* Siri Dialogue Card */}
      <div
        style={{
          width: "360px",
          maxWidth: "calc(100vw - 32px)",
          background: dark ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(40px) saturate(190%)",
          WebkitBackdropFilter: "blur(40px) saturate(190%)",
          border: dark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "22px",
          boxShadow: dark
            ? "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"
            : "0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          padding: "16px 18px",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        className="relative z-20 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center">
              <img src="/img/icons/siri.png" className="w-full h-full object-cover" alt="Siri" />
            </div>
            <span
              className="text-[12px] font-bold tracking-wider uppercase font-sans"
              style={{ color: accentColor }}
            >
              {phase === "listening" ? "Listening…"
               : phase === "thinking" ? "Thinking…"
               : phase === "speaking" ? "Speaking…"
               : "Siri"}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black/40 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
            title="Close Siri"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Visualizer */}
        <div className="flex items-center justify-center py-1.5 min-h-[28px]">
          {phase === "listening" && (
            <div className="flex items-center justify-center gap-[3px]">
              {[0.0, 0.15, 0.3, 0.1, 0.25, 0.4, 0.2, 0.35, 0.05].map((delay, idx) => (
                <div key={idx} className="siri-wave-bar" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          )}
          {phase === "thinking" && (
            <div className="flex items-center gap-2">
              {[0, 0.2, 0.4].map((delay, idx) => (
                <div key={idx} className="siri-thinking-dot" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          )}
          {phase === "speaking" && (
            <div className="flex items-center justify-center gap-[3px]">
              {[0.0, 0.2, 0.1, 0.3, 0.15, 0.25, 0.05].map((delay, idx) => (
                <div
                  key={idx}
                  className="siri-wave-bar"
                  style={{ animationDelay: `${delay}s`, background: "linear-gradient(180deg, #10b981, #059669)" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Response / Transcript Area */}
        <div ref={desktopChatRef} className="py-2 flex flex-col gap-2 min-h-[60px] max-h-[220px] overflow-y-auto scroll-smooth">
          {transcript && (
            <div className="text-[11.5px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1.5 rounded-lg">
              <span className="opacity-60">You:</span> "{transcript}"
            </div>
          )}

          <div className="text-[13.5px] leading-relaxed font-medium text-slate-800 dark:text-slate-100">
            {response || (phase === "listening" ? (
              <span className="text-slate-400 dark:text-slate-500 italic text-[13px]">
                Listening… try "Tell me about Lalit" or "Show projects"
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 text-[13px]">
                Hi! How can I help you?
              </span>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        {(phase === "idle" || phase === "listening") && (
          <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => processQuery(prompt)}
                className="text-[10.5px] font-semibold px-2.5 py-[5px] rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-600 dark:text-slate-300 transition-all hover:scale-[1.03] active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Text Input */}
        <form onSubmit={handleInputSubmit} className="flex gap-2 mt-1">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type a question…"
            className="flex-1 text-[12px] px-3 py-[7px] rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent focus:border-sky-500/50 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-[7px] rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold transition-all active:scale-95 shadow-sm"
          >
            Ask
          </button>
        </form>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium truncate max-w-[140px]">{activeModel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {phase === "speaking" && (
              <button
                onClick={stopSpeaking}
                className="px-2 py-[4px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold transition-colors"
              >
                Stop
              </button>
            )}
            <button
              onClick={() => {
                if (phase === "speaking") stopSpeaking();
                else if (phase === "listening") stopListening();
                else startListening();
              }}
              className={`flex-1 text-[11px] font-semibold py-1.5 px-3 rounded-xl transition-all ${
                phase === "listening"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse"
                  : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300"
              }`}
            >
              {phase === "listening" ? "● Listening…" : "🎤 Tap to Speak"}
            </button>
          </div>
        </div>

        {!isSupported && (
          <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg leading-tight">
            Voice isn't supported in this browser. Type your query instead.
          </div>
        )}
      </div>

      {/* Interactive 3D Siri Orb */}
      <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] flex items-center justify-center flex-shrink-0">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
          <div
            className={`w-[120px] h-[120px] rounded-full mix-blend-screen transition-all duration-700 blur-[22px] ${
              isOrbActive ? "siri-aura-pulse" : "opacity-0 scale-90"
            }`}
            style={{
              background:
                "radial-gradient(circle at 40% 40%, rgba(56,189,248,0.9) 0%, rgba(168,85,247,0.8) 40%, rgba(236,72,153,0.5) 75%, rgba(0,0,0,0) 100%)",
              boxShadow: "0 0 50px 20px rgba(236, 72, 153, 0.35)"
            }}
          />
        </div>

        <div
          className="relative z-10 flex justify-center items-center w-[120px] h-[120px] rounded-full cursor-pointer transform hover:scale-105 active:scale-95 transition-transform duration-300"
          onClick={handleOrbClick}
          title={phase === "listening" ? "Listening… Tap to stop" : "Tap to activate Siri voice"}
        >
          <video
            src="/img/ui/siri2.webm"
            autoPlay
            loop
            muted
            playsInline
            className={`relative z-10 h-[120px] w-[120px] object-contain transition-opacity duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] ${
              phase === "idle" ? "opacity-85" : "opacity-100"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
