import React from "react";
import { useStore } from "~/stores";

const RAW_YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL ?? "https://streamifyhub.vercel.app";
const YOUTUBE_URL = /^https?:\/\//i.test(RAW_YOUTUBE_URL) ? RAW_YOUTUBE_URL : "https://streamifyhub.vercel.app";

export default function YouTube() {
  const dark = useStore((state) => state.dark);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontFamily:
          "'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', sans-serif",
        backgroundColor: dark ? "#1c1c1e" : "#ffffff",
      }}
    >
      <iframe
        src={YOUTUBE_URL}
        title="YouTube"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "transparent",
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
