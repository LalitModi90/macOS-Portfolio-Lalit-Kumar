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
    case "github":
      return (
        <div className={`${containerClass} bg-gradient-to-b from-[#2c2c2e] to-[#000000] flex items-center justify-center p-[20%]`}>
          <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </div>
      );
    case "leetcode":
      return (
        <div className={`${containerClass} bg-[#1a1a1a] flex items-center justify-center p-[22%]`}>
          <svg className="w-full h-full text-[#ffa116]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L1.416 11.499a1.375 1.375 0 0 0 .002 1.96l7.7 7.698a1.371 1.371 0 0 0 1.933-.003l11.534-11.501a1.375 1.375 0 0 0-.003-1.958l-7.7-7.7A1.37 1.37 0 0 0 13.483 0zm.017 4.673l5.746 5.747-9.593 9.569-5.746-5.746 9.593-9.57zM8.33 15.24a.824.824 0 1 1 0-1.648.824.824 0 0 1 0 1.648z" />
          </svg>
        </div>
      );
    case "codechef":
      return (
        <div className={`${containerClass} bg-gradient-to-b from-[#5c4033] to-[#3d2a21] flex items-center justify-center p-[20%]`}>
          <svg className="w-full h-full text-[#f5f5f5]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.5 10c-.5-1.5-1.5-2.5-3-3-.2-.5-.5-.9-.9-1.2C13.8 5 12.9 4.7 12 4.7c-.9 0-1.8.3-2.6 1.1-.4.3-.7.7-.9 1.2-1.5.5-2.5 1.5-3 3-.8.4-1.3 1.2-1.5 2.1-.2 1 .1 2 .8 2.7.3.3.7.5 1.2.6v2c0 1 .8 1.8 1.8 1.8h8.4c1 0 1.8-.8 1.8-1.8v-2c.5-.1.9-.3 1.2-.6.7-.7 1-1.7.8-2.7-.2-.9-.7-1.7-1.5-2.1zm-6.5 7.5c-1.9 0-3.5-1.6-3.5-3.5 0-.4.3-.8.8-.8s.8.3.8.8c0 1 .8 1.9 1.9 1.9s1.9-.9 1.9-1.9c0-.4.3-.8.8-.8s.8.3.8.8c0 1.9-1.6 3.5-3.5 3.5z" />
          </svg>
        </div>
      );
    case "codeyx":
      return (
        <div className={`${containerClass} bg-[#141416] flex items-center justify-center p-[18%]`}>
          <div className="w-full h-full flex items-center justify-center relative select-none">
            <span className="text-white text-2xl font-black font-sans tracking-tighter">C</span>
            <span className="text-yellow-400 text-2xl font-black font-sans tracking-tighter -ml-1">X</span>
          </div>
        </div>
      );
    default:
      return <img src={desktopImg} alt={appId} className="w-full h-full object-cover" />;
  }
}
