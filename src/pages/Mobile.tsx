import React, { useState, useRef } from "react";
import { apps } from "~/configs";
import { useStore } from "~/stores";
import type { MacActions } from "~/types";
import { AnimatePresence, motion } from "framer-motion";
import StatusBar from "~/components/mobile/StatusBar";
import MobileDock from "~/components/mobile/MobileDock";
import ControlCenterMenu from "~/components/menus/ControlCenterMenu";
import NotificationCenter from "~/components/NotificationCenter";
import { useAudioContext } from "~/context/AudioContext";
import IOSAppIcon from "~/components/mobile/IOSAppIcon";
import SiriVoiceAssistant from "~/components/SiriVoiceAssistant";

export default function Mobile(props: MacActions) {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mobile_permissions_handled") !== "true";
    } catch {
      return true;
    }
  });

  const requestPermissions = async () => {
    try {
      // 1. Microphone Request
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
          stream.getTracks().forEach((t) => t.stop());
        } catch (err) {
          console.warn("Microphone permission error:", err);
        }
      }

      // 2. Geolocation Request
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            () => {},
            (err) => console.warn("Location permission error:", err),
            { timeout: 10000, enableHighAccuracy: true }
          );
        } catch (err) {
          console.warn("Geolocation error:", err);
        }
      }
    } finally {
      try {
        localStorage.setItem("mobile_permissions_handled", "true");
      } catch { /* empty */ }
      setShowPermissionModal(false);
    }
  };

  const handleDenyPermissions = () => {
    try {
      localStorage.setItem("mobile_permissions_handled", "true");
    } catch { /* empty */ }
    setShowPermissionModal(false);
  };

  const statusBarLeftRef = useRef<HTMLDivElement>(null);
  const statusBarRightRef = useRef<HTMLDivElement>(null);

  const touchStartYLeftRef = useRef<number | null>(null);
  const touchStartYRightRef = useRef<number | null>(null);

  const { audioState, controls } = useAudioContext();

  const { dark, brightness, getWallpaper, volume } = useStore((s) => ({
    dark: s.dark,
    brightness: s.brightness,
    getWallpaper: s.getWallpaper,
    volume: s.volume,
  }));

  const { setVolume, setBrightness } = useStore((s) => ({
    setVolume: s.setVolume,
    setBrightness: s.setBrightness,
  }));

  const setAudioVolume = (value: number): void => {
    setVolume(value);
    controls.volume(value / 100);
  };

  const setSiteBrightness = (value: number): void => {
    setBrightness(value);
  };

  const activeWallpaper = getWallpaper();
  const currentBgUrl = dark ? activeWallpaper.night : activeWallpaper.day;
  const isVideoWallpaper = currentBgUrl?.includes('.mp4') || currentBgUrl?.includes('video');

  const openApp = (id: string) => {
    const app = apps.find(a => a.id === id);
    if (app && app.link && !app.content) {
      window.open(app.link, "_blank");
    } else {
      setActiveApp(id);
    }
  };

  const closeApp = () => {
    setActiveApp(null);
  };

  // Listen to Siri & Voice Assistant events on Mobile
  React.useEffect(() => {
    const handleOpenApp = (e: Event) => {
      const customEvent = e as CustomEvent;
      const appId = customEvent.detail?.id;
      if (appId) {
        const app = apps.find((a) => a.id === appId);
        if (app && app.link && !app.content) {
          window.open(app.link, "_blank");
        } else {
          setActiveApp(appId);
        }
      }
    };

    const handleOpenSiri = () => {
      setActiveApp("siri");
    };

    const handleCloseSiri = () => {
      setActiveApp(null);
    };

    window.addEventListener("desktop:openApp", handleOpenApp);
    window.addEventListener("siri:open", handleOpenSiri);
    window.addEventListener("siri:close", handleCloseSiri);
    return () => {
      window.removeEventListener("desktop:openApp", handleOpenApp);
      window.removeEventListener("siri:open", handleOpenSiri);
      window.removeEventListener("siri:close", handleCloseSiri);
    };
  }, []);

  const bgStyle: React.CSSProperties = {
    backgroundImage: isVideoWallpaper ? "none" : `url(${currentBgUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: `brightness(${(brightness as number) * 0.7 + 50}%)`,
    transition: "filter 0.3s ease",
  };

  const dockApps = ["facetime", "messages", "safari", "music"];

  const currentAppObj = activeApp ? apps.find((a) => a.id === activeApp) : null;
  const currentAppTitle = currentAppObj ? (currentAppObj.mobileTitle || currentAppObj.title) : "";

  return (
    <div className="size-full overflow-hidden relative" style={bgStyle}>
      {isVideoWallpaper && (
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src={currentBgUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      <StatusBar 
        isAppOpen={activeApp !== null} 
        appTitle={currentAppTitle} 
        onLeftTap={() => setShowNotificationCenter(!showNotificationCenter)}
        onRightTap={() => setShowControlCenter(!showControlCenter)}
      />
      
      {/* Invisible Swipe Zones for Mobile Gestures */}
      <div
        ref={statusBarLeftRef}
        className="fixed top-0 left-0 w-1/2 h-12 z-[9990] pointer-events-auto"
        onTouchStart={(e) => {
          touchStartYLeftRef.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          if (touchStartYLeftRef.current !== null && e.touches[0].clientY - touchStartYLeftRef.current > 30) {
            setShowNotificationCenter(true);
            touchStartYLeftRef.current = null;
          }
        }}
        onTouchEnd={() => {
          touchStartYLeftRef.current = null;
        }}
      />
      <div
        ref={statusBarRightRef}
        className="fixed top-0 right-0 w-1/2 h-12 z-[9990] pointer-events-auto"
        onTouchStart={(e) => {
          touchStartYRightRef.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          if (touchStartYRightRef.current !== null && e.touches[0].clientY - touchStartYRightRef.current > 30) {
            setShowControlCenter(true);
            touchStartYRightRef.current = null;
          }
        }}
        onTouchEnd={() => {
          touchStartYRightRef.current = null;
        }}
      />

      {/* Control Center */}
      <AnimatePresence>
        {showControlCenter && (
          <ControlCenterMenu
            playing={audioState.playing}
            toggleAudio={controls.toggle}
            setVolume={setAudioVolume}
            setBrightness={setSiteBrightness}
            toggleControlCenter={() => setShowControlCenter(false)}
            btnRef={statusBarRightRef}
          />
        )}
      </AnimatePresence>

      {/* Notification Center */}
      <NotificationCenter
        show={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      {/* Home Screen (App Grid + Dock) */}
      <AnimatePresence>
        {!activeApp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col pt-14"
          >
              {/* App Grid */}
             <div className="flex-1 px-5 pt-6">
                <div className="grid grid-cols-4 gap-x-3 gap-y-7">
                  {apps
                    .filter((app) => !dockApps.includes(app.id) && !app.hideOnMobile)
                    .map((app) => (
                    <div 
                      key={app.id} 
                      className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity" 
                      onClick={() => openApp(app.id)}
                    >
                       <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden shadow-md flex-shrink-0">
                         <IOSAppIcon appId={app.id} desktopImg={`/${app.mobileImg || app.img}`} />
                       </div>
                       <span className="text-white text-[11px] font-medium tracking-wide drop-shadow-md text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">
                         {app.mobileTitle || app.title}
                       </span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Dock */}
             <MobileDock openApp={openApp} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active App Window — Native iOS Layout */}
      <AnimatePresence>
        {activeApp && (
          <motion.div
            key="activeApp"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute inset-0 z-40 bg-[#121318] text-white flex flex-col overflow-hidden"
          >
            {/* Top iOS Navigation Bar (Dark glass backdrop for status bar contrast) */}
            <div className="pt-12 bg-[#181a22]/95 border-b border-white/10 shrink-0 backdrop-blur-xl z-30 shadow-md">
              <div className="h-11 px-3.5 flex items-center justify-between">
                {/* Back Button */}
                <button
                  onClick={closeApp}
                  onTouchEnd={closeApp}
                  className="flex items-center gap-1 text-blue-400 font-semibold text-sm active:opacity-60 transition-opacity"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>Back</span>
                </button>

                {/* Center Title & Icon */}
                <div className="flex items-center gap-2 max-w-[55%] truncate">
                  {currentAppObj && (
                    <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0 shadow-xs border border-white/10">
                      <IOSAppIcon appId={currentAppObj.id} desktopImg={`/${currentAppObj.mobileImg || currentAppObj.img}`} />
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {currentAppTitle}
                  </span>
                </div>

                {/* Done Button */}
                <button
                  onClick={closeApp}
                  onTouchEnd={closeApp}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1 rounded-full active:scale-95 transition-all border border-white/10"
                >
                  Done
                </button>
              </div>
            </div>

            {/* App Content Viewport */}
            <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col bg-[#12141a]">
              {(() => {
                const app = apps.find((a) => a.id === activeApp);
                if (!app || !app.content) return null;
                return React.cloneElement(app.content as React.ReactElement, {
                  closeSiri: closeApp,
                  isMobile: true,
                });
              })()}
            </div>

            {/* iOS Home Indicator Bar */}
            <div
              className="h-6 w-full flex items-center justify-center cursor-pointer z-50 shrink-0 bg-[#161822] border-t border-white/10"
              onClick={closeApp}
              onTouchEnd={closeApp}
            >
              <div className="w-32 h-1 bg-white/60 rounded-full opacity-80 hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS System Permission Modal for Microphone and Location */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-[285px] rounded-[18px] bg-[#1e1f25]/95 border border-white/15 text-white backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col items-center pt-5 text-center select-none"
            >
              {/* Permission Icons */}
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-[11px] bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md border border-white/10">
                  <img src="/img/icons/siri.png" alt="Siri" className="w-7 h-7 object-contain" />
                </div>
                <div className="w-10 h-10 rounded-[11px] bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md border border-white/10">
                  <img src="/img/icons/maps.png" alt="Maps" className="w-7 h-7 object-contain" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-[14.5px] font-semibold text-white px-4 leading-snug">
                “Lalit Portfolio” Would Like to Access Your Microphone & Location
              </h3>

              {/* Message */}
              <p className="text-[11.5px] text-white/70 px-4 mt-2 leading-relaxed">
                Used for hands-free Siri voice interaction, live Maps navigation, and local Weather widgets.
              </p>

              {/* iOS Action Buttons */}
              <div className="w-full mt-4 border-t border-white/15 grid grid-cols-2 text-[14px] divide-x divide-white/15">
                <button
                  onClick={handleDenyPermissions}
                  onTouchEnd={handleDenyPermissions}
                  className="py-3 text-blue-400 hover:bg-white/5 active:bg-white/15 transition-colors font-normal"
                >
                  Don’t Allow
                </button>
                <button
                  onClick={requestPermissions}
                  onTouchEnd={requestPermissions}
                  className="py-3 text-blue-400 hover:bg-white/5 active:bg-white/15 transition-colors font-semibold"
                >
                  Allow
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Hands-Free Siri Voice Assistant for Mobile */}
      <SiriVoiceAssistant
        isSiriOpen={activeApp === "siri"}
        openSiri={() => openApp("siri")}
      />

    </div>
  );
}

