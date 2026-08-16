import { useEffect, useRef, useState, useCallback } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

interface SiriVoiceAssistantProps {
  isSiriOpen: boolean;
  openSiri: () => void;
}

export default function SiriVoiceAssistant({ isSiriOpen, openSiri }: SiriVoiceAssistantProps) {
  const [wakeWordEnabled, setWakeWordEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("siri_wakeword_enabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // Synchronize localStorage preference
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("siri_wakeword_enabled");
        setWakeWordEnabled(saved !== null ? saved === "true" : true);
      } catch { /* empty */ }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const playChime = useCallback(() => {
    try {
      const audio = document.getElementById("siri-global-audio") as HTMLAudioElement | null;
      if (audio) {
        audio.volume = 0.7;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch { /* empty */ }
  }, []);

  // Background wake-word listening when Siri app window is closed
  useEffect(() => {
    if (!SpeechRecognitionAPI || !wakeWordEnabled || isSiriOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch { /* empty */ }
      }
      isListeningRef.current = false;
      return;
    }

    let isMounted = true;
    let recognition: any = null;

    const startWakeRecognition = () => {
      if (!isMounted || isSiriOpen || isListeningRef.current) return;

      try {
        recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          isListeningRef.current = true;
        };

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = (event.results[i][0].transcript || "").toLowerCase().trim();

            const isWake =
              transcript.includes("hey siri") ||
              transcript.includes("siri") ||
              transcript.includes("hay siri") ||
              transcript.includes("ok siri") ||
              transcript.includes("hi siri");

            if (isWake) {
              playChime();
              openSiri();
              try {
                recognition.abort();
              } catch { /* empty */ }
              isListeningRef.current = false;
              break;
            }
          }
        };

        recognition.onerror = () => {
          isListeningRef.current = false;
        };

        recognition.onend = () => {
          isListeningRef.current = false;
          if (isMounted && !isSiriOpen && wakeWordEnabled) {
            setTimeout(startWakeRecognition, 1000);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        isListeningRef.current = false;
      }
    };

    startWakeRecognition();

    return () => {
      isMounted = false;
      isListeningRef.current = false;
      if (recognition) {
        try {
          recognition.abort();
        } catch { /* empty */ }
      }
    };
  }, [wakeWordEnabled, isSiriOpen, openSiri, playChime]);

  return (
    <>
      <audio id="siri-global-audio" src="/music/siri.mp3" preload="auto" className="hidden" />
    </>
  );
}
