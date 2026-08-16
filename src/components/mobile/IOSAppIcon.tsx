import React from "react";

interface IOSAppIconProps {
  appId: string;
  desktopImg: string;
  className?: string;
}

export default function IOSAppIcon({ appId, desktopImg, className = "w-full h-full" }: IOSAppIconProps) {
  const containerClass = `${className} select-none overflow-hidden relative`;

  switch (appId) {
    case "safari":
      return (
        <div className={`${containerClass} bg-[#f2f2f7] flex items-center justify-center p-[6%] shadow-inner`}>
          <div className="w-full h-full rounded-full bg-white shadow-xs flex items-center justify-center relative overflow-hidden">
            <div className="w-[85%] h-[85%] rounded-full border border-blue-100 flex items-center justify-center relative">
              <div className="absolute w-[1.5px] h-full bg-blue-500/20 top-0 left-1/2 -translate-x-1/2" />
              <div className="absolute h-[1.5px] w-full bg-blue-500/20 left-0 top-1/2 -translate-y-1/2" />
              <svg className="w-[65%] h-[65%] transform rotate-[45deg] z-10" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 15,12 12,10 9,12" fill="#ff3b30" />
                <polygon points="12,22 15,12 12,10 9,12" fill="#e5e5ea" />
                <circle cx="12" cy="12" r="1.5" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      );
    case "messages":
      return (
        <div className={`${containerClass} bg-[#34c759] flex items-center justify-center p-[20%]`}>
          <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
      );
    case "mail":
      return (
        <div className={`${containerClass} bg-gradient-to-b from-[#54a6ff] to-[#007aff] flex items-center justify-center p-[22%]`}>
          <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 6l-10 7L2 6" />
          </svg>
        </div>
      );
    case "music":
      return (
        <div className={`${containerClass} bg-gradient-to-b from-[#ff5e79] to-[#ff2d55] flex items-center justify-center p-[20%]`}>
          <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h6V3h-8z" />
          </svg>
        </div>
      );
    case "facetime":
      return (
        <div className={`${containerClass} bg-[#34c759] flex items-center justify-center p-[22%]`}>
          <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </div>
      );
    case "finder":
      return (
        <div className={`${containerClass} bg-white flex items-center justify-center p-[18%] border border-black/5 rounded-2xl shadow-xs`}>
          <svg className="w-full h-full text-blue-500 fill-current" viewBox="0 0 24 24">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </div>
      );
    case "system-settings":
      return (
        <div className={`${containerClass} bg-gradient-to-b from-[#e5e5ea] to-[#aeaeb2] flex items-center justify-center p-[18%]`}>
          <svg className="w-full h-full text-gray-700 fill-current" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </div>
      );
    case "maps":
      return (
        <div className={`${containerClass} bg-sky-200 flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute w-[2px] h-full bg-white left-1/3 rotate-12" />
          <div className="absolute w-[2px] h-full bg-white right-1/4 -rotate-12" />
          <div className="absolute h-[2px] w-full bg-white top-1/2 rotate-6" />
          <div className="absolute h-[2px] w-full bg-yellow-400 top-1/3" />
          <div className="absolute z-10 w-4 h-4 rounded-full bg-blue-500 border border-white flex items-center justify-center shadow-xs">
            <svg className="w-2.5 h-2.5 text-white transform rotate-[45deg]" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,22 12,17 2,22" />
            </svg>
          </div>
        </div>
      );
    case "calculator":
      return (
        <div className={`${containerClass} bg-[#1c1c1e] flex flex-col items-center justify-center p-[15%] gap-[8%]`}>
          <div className="flex gap-[8%] w-full h-[45%]">
            <div className="w-[45%] h-full rounded-full bg-[#a5a5a5]" />
            <div className="w-[45%] h-full rounded-full bg-[#ff9f0a]" />
          </div>
          <div className="flex gap-[8%] w-full h-[45%]">
            <div className="w-[45%] h-full rounded-full bg-[#333333]" />
            <div className="w-[45%] h-full rounded-full bg-[#333333]" />
          </div>
        </div>
      );
    case "bear":
      return (
        <div className={`${containerClass} bg-white flex flex-col border border-black/5 overflow-hidden`}>
          <div className="h-[25%] bg-[#e0a82e] w-full" />
          <div className="flex-1 p-[15%] flex flex-col justify-around">
            <div className="h-[2px] bg-gray-200 w-full" />
            <div className="h-[2px] bg-gray-200 w-[80%]" />
            <div className="h-[2px] bg-gray-200 w-full" />
          </div>
        </div>
      );
    case "terminal":
      return (
        <div className={`${containerClass} bg-black flex items-center justify-center p-[15%] border border-white/10`}>
          <span className="text-white font-mono text-sm font-bold leading-none select-none">&gt;_</span>
        </div>
      );
    case "anime-wallpapers":
      return (
        <div className={`${containerClass} bg-white flex items-center justify-center p-[12%] border border-black/5 rounded-2xl shadow-xs relative overflow-hidden`}>
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#ff5e79] opacity-80 transform rotate-0" />
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#ff9f0a] opacity-80 transform rotate-45" />
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#ffd60a] opacity-80 transform rotate-90" />
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#34c759] opacity-80 transform rotate-135" />
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#30b0c7] opacity-80 transform -rotate-45" />
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#007aff] opacity-80 transform -rotate-90" />
            <div className="absolute w-[50%] h-[20%] rounded-full bg-[#5856d6] opacity-80 transform -rotate-135" />
          </div>
        </div>
      );
    default:
      return <img src={desktopImg} alt={appId} className="w-full h-full object-cover" />;
  }
}
