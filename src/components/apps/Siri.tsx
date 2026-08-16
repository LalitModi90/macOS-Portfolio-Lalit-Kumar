import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSiriAssistant, type SiriPhase } from "~/hooks/useSiriAssistant";
import { useStore } from "~/stores";

interface SiriProps {
  closeSiri?: () => void;
}

export default function Siri({ closeSiri }: SiriProps) {
  const dark = useStore((state) => state.dark);
  const [typedInput, setTypedInput] = useState("");

  const {
    phase,
    transcript,
    response,
    activeModel,
    wakeWordEnabled,
    micPermission,
    isSupported,
    toggleWakeWord,
    startListening,
    stopListening,
    stopSpeaking,
    processQuery
  } = useSiriAssistant();

  // Auto-start listening on mount when Siri is opened
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (!hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startListening();
    }
  }, [startListening]);

  // Handle manual orb click — instant interruption if currently speaking
  const handleOrbClick = useCallback(() => {
    if (phase === "speaking") {
      stopSpeaking();
      startListening(); // Interrupt speech and listen to user's new question immediately!
    } else if (phase === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [phase, startListening, stopListening, stopSpeaking]);

  // Handle typing submission — interrupts speech and answers new question
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    if (phase === "speaking") {
      stopSpeaking();
    }
    processQuery(typedInput.trim());
    setTypedInput("");
  };

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

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-start justify-end gap-3.5 relative pointer-events-auto mt-3 mr-3 select-none">
      <audio id="siri-audio" src="/music/siri.mp3" preload="auto" className="hidden" />

      <style>{`
        @keyframes siri-aura-glow {
          0%, 100% { transform: scale(0.85); opacity: 0.3; }
          50% { transform: scale(1.18); opacity: 0.85; filter: blur(24px); }
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

      {/* Siri Dialogue Card */}
      <div
        style={{
          width: "340px",
          maxWidth: "calc(100vw - 32px)",
          background: dark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(40px) saturate(190%)",
          WebkitBackdropFilter: "blur(40px) saturate(190%)",
          border: dark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.06)",
          borderRadius: "20px",
          boxShadow: dark
            ? "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"
            : "0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)",
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
            onClick={() => {
              stopSpeaking();
              if (closeSiri) closeSiri();
            }}
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
        <div className="flex items-center justify-center py-2 min-h-[32px]">
          {phase === "listening" && (
            <div className="flex items-center justify-center gap-[3px]">
              {[0.0, 0.15, 0.3, 0.1, 0.25, 0.4, 0.2, 0.35, 0.05].map((delay, idx) => (
                <div
                  key={idx}
                  className="siri-wave-bar"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}
          {phase === "thinking" && (
            <div className="flex items-center gap-2">
              {[0, 0.2, 0.4].map((delay, idx) => (
                <div
                  key={idx}
                  className="siri-thinking-dot"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}
          {phase === "speaking" && (
            <div className="flex items-center justify-center gap-[3px]">
              {[0.0, 0.2, 0.1, 0.3, 0.15, 0.25, 0.05].map((delay, idx) => (
                <div
                  key={idx}
                  className="siri-wave-bar"
                  style={{
                    animationDelay: `${delay}s`,
                    background: "linear-gradient(180deg, #10b981, #059669)"
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Response / Transcript Area */}
        <div className="py-2 flex flex-col gap-1.5 min-h-[60px] max-h-[180px] overflow-y-auto">
          {transcript && (
            <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/8 px-2.5 py-1 rounded-lg">
              <span className="opacity-60">You:</span> "{transcript}"
            </div>
          )}

          <div
            className="text-[13.5px] leading-relaxed font-medium text-slate-700 dark:text-slate-200"
          >
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

        {/* Quick Prompts — only show when idle or listening */}
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
          {/* AI Engine indicator */}
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium truncate max-w-[140px]">{activeModel}</span>
          </div>

          {/* Action buttons */}
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
              onClick={handleOrbClick}
              className={`px-2 py-[4px] rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                phase === "listening"
                  ? "bg-sky-500 text-white"
                  : "bg-black/[0.04] dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-black/[0.08] dark:hover:bg-white/[0.14]"
              }`}
            >
              {phase === "listening" ? "● Live" : "🎤 Mic"}
            </button>
          </div>
        </div>

        {/* Unsupported browser notice */}
        {!isSupported && (
          <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg leading-tight">
            Voice isn't supported in this browser. Type your query instead.
          </div>
        )}
      </div>

      {/* Interactive 3D Siri Orb */}
      <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] flex items-center justify-center flex-shrink-0">
        {/* Glow Aura */}
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

        {/* 3D WebM Orb */}
        <div
          className="relative z-10 flex justify-center items-center w-[120px] h-[120px] rounded-full cursor-pointer transform hover:scale-105 active:scale-95 transition-transform duration-300"
          onClick={handleOrbClick}
          title={phase === "listening" ? "Listening… Click to stop" : "Click to activate Siri"}
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
