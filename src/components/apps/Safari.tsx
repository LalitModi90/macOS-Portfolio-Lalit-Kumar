import React, { useState, useEffect, useRef } from "react";
import websites from "~/configs/websites";
import wallpapers from "~/configs/wallpapers";
import { checkURL } from "~/utils";
import { useStore } from "~/stores";
import type { SiteSectionData, SiteData } from "~/types";

interface TabItem {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
  isLoading?: boolean;
  isBlocked?: boolean;
  blockedQuery?: string;
}

interface SafariProps {
  width?: number;
}

// Vector SVG Icons
const BackSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ForwardSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ShieldSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const RefreshSVG = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const ShareSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const HomeSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PlusSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseSVG = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExternalTabSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// Adult Content Restriction Filter Keywords
const ADULT_KEYWORDS = [
  "porn", "xxx", "nsfw", "adult", "sex", "erotic", "nude", "nudity", "hentai",
  "xvideos", "pornhub", "xhamster", "xnxx", "stripchat", "onlyfans", "chaturbate",
  "redtube", "youporn", "brazzers", "youjizz", "beeg", "bitch", "boobs", "pussy",
  "dick", "ecchi", "lewd", "fetish", "bikini", "cleavage", "lingerie", "swimsuit",
  "topless", "naked", "18+"
];

function checkAdultContent(query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase().trim();
  return ADULT_KEYWORDS.some((kw) => q.includes(kw));
}

const NavSection = ({ section, handleSiteClick }: { section: SiteSectionData; handleSiteClick: (site: SiteData) => void }) => {
  const dark = useStore((state) => state.dark);

  return (
    <div style={{ margin: "0 auto", width: "100%", maxWidth: "860px", padding: "20px 20px 0" }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: "19px",
          color: dark ? "#ffffff" : "#1c1c1e",
          letterSpacing: "-0.3px"
        }}
      >
        {section.title}
      </div>
      <div
        style={{
          marginTop: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: "16px"
        }}
      >
        {section.sites.map((site: SiteData) => (
          <div
            key={`safari-nav-${site.id}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
            onClick={() => handleSiteClick(site)}
          >
            <div
              className="hover:scale-105 transition-transform duration-200"
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "16px",
                overflow: "hidden",
                background: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.85)",
                boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              {site.img ? (
                <img
                  src={site.img}
                  alt={site.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "18px", fontWeight: 600, color: dark ? "#ffffff" : "#1c1c1e" }}>
                  {site.title.substring(0, 2)}
                </span>
              )}
            </div>
            <span
              style={{
                marginTop: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "84px"
              }}
            >
              {site.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const numTracker = 81;

// Minimal macOS Restricted Warning Page
const AdultContentWarningPage = ({ onReturn }: { onReturn: () => void }) => {
  const dark = useStore((state) => state.dark);
  const activeWallpaper = useStore((state) => state.getWallpaper());
  const wallpaperBg = dark ? activeWallpaper.night : activeWallpaper.day;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundImage: `url(${wallpaperBg})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: dark ? "rgba(12, 14, 22, 0.82)" : "rgba(242, 244, 248, 0.8)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          padding: "20px"
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            background: dark ? "rgba(28, 30, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
            border: dark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: dark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 12px 32px rgba(0,0,0,0.08)",
            borderRadius: "20px",
            padding: "32px 24px",
            textAlign: "center",
            backdropFilter: "blur(20px)"
          }}
        >
          <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", marginBottom: "16px" }}>
            <ShieldSVG className={`w-8 h-8 ${dark ? "text-gray-300" : "text-gray-600"}`} />
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: 600, color: dark ? "#ffffff" : "#1c1c1e", marginBottom: "8px", letterSpacing: "-0.2px" }}>
            Restricted Content
          </h2>

          <p style={{ fontSize: "13px", color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", lineHeight: 1.5, marginBottom: "24px" }}>
            Safari restricted access to this page or search term.
          </p>

          <button
            onClick={onReturn}
            style={{
              background: "var(--system-blue, #007AFF)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "8px 24px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 122, 255, 0.25)"
            }}
            className="hover:scale-105 transition-transform duration-150"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

const NavPage = ({ handleSiteClick }: { handleSiteClick: (site: SiteData) => void }) => {
  const dark = useStore((state) => state.dark);
  const activeWallpaper = useStore((state) => state.getWallpaper());
  const wallpaperBg = dark ? activeWallpaper.night : activeWallpaper.day;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundImage: `url(${wallpaperBg})`,
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "100%",
          paddingTop: "24px",
          background: dark ? "rgba(12, 14, 22, 0.78)" : "rgba(240, 242, 248, 0.72)",
          backdropFilter: "blur(35px) saturate(180%)",
          WebkitBackdropFilter: "blur(35px) saturate(180%)",
        }}
      >
        <NavSection section={websites.favorites} handleSiteClick={handleSiteClick} />
        <NavSection section={websites.freq} handleSiteClick={handleSiteClick} />

        {/* Privacy Report */}
        <div style={{ margin: "0 auto", width: "100%", maxWidth: "860px", padding: "32px 20px 48px" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "19px",
              color: dark ? "#ffffff" : "#1c1c1e",
              marginBottom: "12px",
              letterSpacing: "-0.3px"
            }}
          >
            Privacy Report
          </div>
          <div
            style={{
              height: "60px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)",
              border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
              boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)",
              borderRadius: "16px",
              padding: "0 20px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderRight: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
                paddingRight: "20px"
              }}
            >
              <ShieldSVG className={`w-5 h-5 ${dark ? "text-green-400" : "text-green-600"}`} />
              <span style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#1c1c1e" }}>
                {numTracker}
              </span>
            </div>
            <div style={{ paddingLeft: "20px", fontSize: "13px", color: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)" }}>
              In the last seven days, Safari has prevented {numTracker} trackers from profiling you.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Safari({ width = 800 }: SafariProps) {
  const wifi = useStore((state) => state.wifi);
  const dark = useStore((state) => state.dark);
  const safariUrl = useStore((state) => state.safariUrl);
  const setSafariUrl = useStore((state) => state.setSafariUrl);

  const webviewRef = useRef<any>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const [tabs, setTabs] = useState<TabItem[]>([
    { id: "tab-1", url: "", title: "Start Page", history: [""], historyIndex: 0 }
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [inputUrl, setInputUrl] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  // Check if running in Electron environment with electronAPI bridge
  const electronAPI = typeof window !== "undefined" ? window.electronAPI : undefined;
  const isElectron = !!electronAPI?.isElectron || (typeof window !== "undefined" && window.navigator.userAgent.toLowerCase().includes("electron"));

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (safariUrl) {
      navigateUrl(safariUrl);
      setSafariUrl("");
    }
  }, [safariUrl]);

  useEffect(() => {
    if (activeTab) {
      setInputUrl(activeTab.isBlocked ? (activeTab.blockedQuery || activeTab.url) : activeTab.url);
    }
  }, [activeTabId, activeTab?.url, activeTab?.isBlocked]);

  // Synchronize WebContentsView Bounds with React Content Container in Electron Mode
  const syncBounds = () => {
    if (isElectron && electronAPI && contentAreaRef.current) {
      const rect = contentAreaRef.current.getBoundingClientRect();
      electronAPI.updateBounds(activeTabId, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      });
    }
  };

  useEffect(() => {
    if (isElectron && electronAPI) {
      syncBounds();
      window.addEventListener("resize", syncBounds);
      return () => window.removeEventListener("resize", syncBounds);
    }
  }, [isElectron, activeTabId]);

  // Handle IPC Events from Electron Main Process
  useEffect(() => {
    if (isElectron && electronAPI) {
      const unbindNav = electronAPI.onNavigate(({ tabId, url }) => {
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id === tabId) {
              const newHist = t.history.slice(0, t.historyIndex + 1);
              if (newHist[newHist.length - 1] !== url) {
                newHist.push(url);
              }
              return {
                ...t,
                url,
                history: newHist,
                historyIndex: newHist.length - 1
              };
            }
            return t;
          })
        );
        if (tabId === activeTabId) {
          setInputUrl(url);
        }
      });

      const unbindTitle = electronAPI.onTitleUpdate(({ tabId, title }) => {
        setTabs((prev) =>
          prev.map((t) => (t.id === tabId ? { ...t, title } : t))
        );
      });

      const unbindFavicon = electronAPI.onFaviconUpdate(({ tabId, favicon }) => {
        setTabs((prev) =>
          prev.map((t) => (t.id === tabId ? { ...t, favicon } : t))
        );
      });

      const unbindLoading = electronAPI.onLoadingState(({ tabId, isLoading }) => {
        setTabs((prev) =>
          prev.map((t) => (t.id === tabId ? { ...t, isLoading } : t))
        );
      });

      const unbindNewTab = electronAPI.onNewWindowTab(({ url }) => {
        addTabWithUrl(url);
      });

      return () => {
        unbindNav();
        unbindTitle();
        unbindFavicon();
        unbindLoading();
        unbindNewTab();
      };
    }
  }, [isElectron, activeTabId]);

  const resolveTargetUrl = (query: string): { url: string; title: string; isBlocked?: boolean } => {
    if (!query) return { url: "", title: "Start Page" };

    if (checkAdultContent(query)) {
      return { url: "safari://restricted", title: "Restricted Content", isBlocked: true };
    }

    if (query.toLowerCase().startsWith("mailto:")) {
      const email = query.slice(7).trim();
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\?.*)?$/.test(email)) {
        window.location.href = `mailto:${encodeURI(email)}`;
      }
      return { url: "", title: "Start Page" };
    }

    const isValid = checkURL(query);
    if (isValid) {
      let finalUrl = query;
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = `https://${finalUrl}`;
      }
      try {
        const hostname = new URL(finalUrl).hostname.replace(/^www\./, "");
        return { url: finalUrl, title: hostname };
      } catch {
        return { url: finalUrl, title: finalUrl };
      }
    } else {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      return { url: googleUrl, title: `Google Search: ${query}` };
    }
  };

  const handleSiteClick = (site: SiteData) => {
    if (site.link.toLowerCase().startsWith("mailto:")) {
      window.location.href = site.link;
      return;
    }
    // In Web Mode, open all site links directly in a new external browser tab
    if (!isElectron) {
      if (/^https?:\/\//i.test(site.link)) {
        window.open(site.link, "_blank", "noopener,noreferrer");
      }
      return;
    }
    navigateUrl(site.link);
  };

  const navigateUrl = (target: string) => {
    if (!target) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, url: "", title: "Start Page", isBlocked: false } : tab
        )
      );
      setInputUrl("");
      if (isElectron && electronAPI) {
        electronAPI.navigate(activeTabId, "");
      }
      return;
    }

    if (checkAdultContent(target)) {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              url: "safari://restricted",
              title: "Restricted Content",
              isBlocked: true,
              blockedQuery: target
            };
          }
          return tab;
        })
      );
      setInputUrl(target);
      return;
    }

    const { url, title } = resolveTargetUrl(target);

    // In Web Mode (standard browser like Chrome), open URLs in a new browser tab cleanly
    if (!isElectron) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          const newHistory = tab.history.slice(0, tab.historyIndex + 1);
          newHistory.push(url);
          return {
            ...tab,
            url,
            title,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isBlocked: false
          };
        }
        return tab;
      })
    );
    setInputUrl(url);
    setIframeKey((k) => k + 1);

    if (isElectron && electronAPI) {
      electronAPI.navigate(activeTabId, url);
      syncBounds();
    }
  };

  const goBack = () => {
    if (isElectron && electronAPI) {
      electronAPI.goBack(activeTabId);
      return;
    }
    if (isElectron && webviewRef.current?.canGoBack()) {
      webviewRef.current.goBack();
      return;
    }
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const newIdx = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[newIdx];
    const { title } = resolveTargetUrl(prevUrl);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url: prevUrl, title, historyIndex: newIdx, isBlocked: false } : t
      )
    );
    setInputUrl(prevUrl);
    setIframeKey((k) => k + 1);
  };

  const goForward = () => {
    if (isElectron && electronAPI) {
      electronAPI.goForward(activeTabId);
      return;
    }
    if (isElectron && webviewRef.current?.canGoForward()) {
      webviewRef.current.goForward();
      return;
    }
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    const newIdx = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[newIdx];
    const { title } = resolveTargetUrl(nextUrl);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url: nextUrl, title, historyIndex: newIdx, isBlocked: false } : t
      )
    );
    setInputUrl(nextUrl);
    setIframeKey((k) => k + 1);
  };

  const reloadPage = () => {
    if (isElectron && electronAPI) {
      electronAPI.reload(activeTabId);
      return;
    }
    if (isElectron && webviewRef.current) {
      webviewRef.current.reload();
      return;
    }
    setIframeKey((k) => k + 1);
  };

  const addTab = () => {
    addTabWithUrl("");
  };

  const addTabWithUrl = (url: string) => {
    const newId = `tab-${Date.now()}`;
    const { title } = resolveTargetUrl(url);

    if (!isElectron && url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const newTabObj: TabItem = {
      id: newId,
      url,
      title: title || "Start Page",
      history: [url],
      historyIndex: 0
    };
    setTabs((prev) => [...prev, newTabObj]);
    setActiveTabId(newId);
    setInputUrl(url);

    if (isElectron && electronAPI) {
      electronAPI.createTab(newId, url);
      electronAPI.switchTab(newId);
      syncBounds();
    }
  };

  const selectTab = (tabId: string) => {
    setActiveTabId(tabId);
    if (isElectron && electronAPI) {
      electronAPI.switchTab(tabId);
      syncBounds();
    }
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (isElectron && electronAPI) {
      electronAPI.closeTab(tabId);
    }
    if (tabs.length === 1) {
      setTabs([{ id: "tab-1", url: "", title: "Start Page", history: [""], historyIndex: 0 }]);
      setActiveTabId("tab-1");
      setInputUrl("");
      return;
    }
    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      const nextTabId = filtered[filtered.length - 1].id;
      setActiveTabId(nextTabId);
      if (isElectron && electronAPI) {
        electronAPI.switchTab(nextTabId);
      }
    }
  };

  const pressURL = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigateUrl((e.target as HTMLInputElement).value);
    }
  };

  const canGoBack = isElectron
    ? (webviewRef.current?.canGoBack() || activeTab.historyIndex > 0)
    : activeTab.historyIndex > 0;

  const canGoForward = isElectron
    ? (webviewRef.current?.canGoForward() || activeTab.historyIndex < activeTab.history.length - 1)
    : activeTab.historyIndex < activeTab.history.length - 1;

  const renderSafariContent = () => {
    if (activeTab?.isBlocked) {
      return <AdultContentWarningPage onReturn={() => navigateUrl("")} />;
    }
    if (!wifi) {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#11131b" : "#f6f6f8" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#1c1c1e" }}>Offline Mode</div>
            <div style={{ paddingTop: "8px", fontSize: "13px", color: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Please check your internet connection.</div>
          </div>
        </div>
      );
    }
    if (!activeTab || !activeTab.url) {
      return <NavPage handleSiteClick={handleSiteClick} />;
    }

    if (isElectron && !electronAPI) {
      return (
        <webview
          ref={webviewRef}
          key={`safari-webview-${activeTab?.id}-${iframeKey}`}
          src={activeTab?.url}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      );
    }

    // Direct Browser View for Web Mode
    return (
      <iframe
        key={`browser-iframe-${activeTab?.id}-${iframeKey}`}
        title={activeTab?.title || "Web Browser"}
        src={activeTab?.url}
        style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
      />
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: dark ? "#11131b" : "#f6f6f8" }}>
      
      {/* Chrome / Safari Tabs Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "36px",
          background: dark ? "rgba(14, 16, 24, 0.95)" : "rgba(225, 228, 236, 0.95)",
          borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          padding: "0 8px",
          gap: "4px",
          overflowX: "auto"
        }}
        className="no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                height: "28px",
                padding: "0 10px",
                borderRadius: "8px 8px 0 0",
                background: isActive
                  ? dark ? "rgba(25, 28, 40, 0.95)" : "#f6f6f8"
                  : "transparent",
                color: isActive
                  ? dark ? "#ffffff" : "#1c1c1e"
                  : dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                maxWidth: "180px",
                minWidth: "100px",
                gap: "8px",
                borderTop: isActive ? (dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)") : "none",
                borderLeft: isActive ? (dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)") : "none",
                borderRight: isActive ? (dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)") : "none",
                transition: "background 0.15s ease"
              }}
            >
              {tab.favicon ? (
                <img src={tab.favicon} alt="" style={{ width: "14px", height: "14px", borderRadius: "2px" }} />
              ) : (
                <ShieldSVG className={`w-3 h-3 ${tab.isBlocked ? "text-red-500" : "text-blue-400"} flex-shrink-0`} />
              )}
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tab.isLoading ? "Loading..." : tab.title || "Start Page"}
              </span>
              <button
                onClick={(e) => closeTab(e, tab.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  color: "inherit",
                  opacity: 0.7
                }}
                className="hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <CloseSVG className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={addTab}
          title="New Tab"
          style={{
            background: "transparent",
            border: "none",
            color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "6px"
          }}
          className="hover:bg-black/10 dark:hover:bg-white/10"
        >
          <PlusSVG className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Browser Main Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "42px",
          background: dark ? "rgba(25, 28, 40, 0.95)" : "#f6f6f8",
          backdropFilter: "blur(20px)",
          borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          padding: "0 10px",
          gap: "8px"
        }}
      >
        {/* Back & Forward Controls */}
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            onClick={goBack}
            disabled={!canGoBack}
            title="Back"
            style={{
              background: "transparent",
              border: "none",
              color: canGoBack ? (dark ? "#ffffff" : "#1c1c1e") : (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
              cursor: canGoBack ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px"
            }}
          >
            <BackSVG className="w-4 h-4" />
          </button>

          <button
            onClick={goForward}
            disabled={!canGoForward}
            title="Forward"
            style={{
              background: "transparent",
              border: "none",
              color: canGoForward ? (dark ? "#ffffff" : "#1c1c1e") : (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
              cursor: canGoForward ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px"
            }}
          >
            <ForwardSVG className="w-4 h-4" />
          </button>
        </div>

        {/* Search / Address Bar */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              maxWidth: "540px",
              minWidth: "140px",
              background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              border: activeTab?.isBlocked
                ? "1px solid rgba(239,68,68,0.5)"
                : dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
              borderRadius: "8px",
              padding: "4px 10px",
              gap: "8px"
            }}
          >
            <ShieldSVG className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab?.isBlocked ? "text-red-500" : dark ? "text-green-400" : "text-green-600"}`} />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={pressURL}
              placeholder="Search or enter website address"
              style={{
                flex: 1,
                minWidth: "40px",
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "12px",
                textAlign: "center",
                color: activeTab?.isBlocked ? "#ef4444" : dark ? "#ffffff" : "#1c1c1e"
              }}
            />
            <button
              onClick={reloadPage}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              title="Reload"
            >
              <RefreshSVG className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            onClick={() => navigateUrl("")}
            title="Start Page"
            style={{
              background: "transparent",
              border: "none",
              color: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px"
            }}
          >
            <HomeSVG className="w-4 h-4" />
          </button>

          <button
            title="Share URL"
            onClick={() => {
              if (inputUrl && navigator.clipboard) {
                navigator.clipboard.writeText(inputUrl);
                alert("Copied URL to clipboard!");
              }
            }}
            style={{
              background: "transparent",
              border: "none",
              color: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "6px"
            }}
          >
            <ShareSVG className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Content Area */}
      <div ref={contentAreaRef} style={{ flex: 1, position: "relative", zIndex: 0 }}>
        {renderSafariContent()}
      </div>
    </div>
  );
}
