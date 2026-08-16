import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import bear from "~/configs/bear";
import { PERSONAL_INFO, EDUCATION, PROJECTS, ACHIEVEMENTS, CERTIFICATIONS, ARSENAL_CARDS } from "~/configs/personal";
import { useStore } from "~/stores";
import { fetchGitHubRepos, fetchGitHubRepoReadme, getLanguageColor, getLanguageIcon, type GitHubRepo } from "~/utils/githubService";
import { fetchLeetCodeStats, fetchCodeChefStats, type LeetCodeStats, type CodeChefStats } from "~/utils/codingPlatforms";
import type { BearMdData } from "~/types";

interface ContentProps {
  contentID: string;
  contentURL: string;
  activeCategory: string;
  selectedRepo: GitHubRepo | null;
  loadingReadme: boolean;
  readmeContent: string | null;
  loadingRepos: boolean;
  repoError: string | null;
  githubRepos?: GitHubRepo[];
  onRetryRepos: () => void;
  showToast: (msg: string) => void;
}

interface MiddlebarProps {
  items: BearMdData[];
  cur: number;
  setContent: (id: string, url: string, index: number, repo?: GitHubRepo) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isProjectsCategory: boolean;
  githubRepos: GitHubRepo[];
  loadingRepos: boolean;
  repoError: string | null;
  onRefreshRepos: () => void;
  onRetryRepos: () => void;
}

interface SidebarProps {
  cur: number;
  setMidBar: (items: BearMdData[], index: number) => void;
  projectsCount: number;
}

// Apple macOS SF Symbol Style Vector Icons
const GlobeSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8M3.6 15h16.8" />
    <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
  </svg>
);

const GitHubSVG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ExternalArrowSVG = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

const Highlighter = (dark: boolean): any => {
  interface codeProps {
    node: any;
    inline: boolean;
    className: string;
    children: any;
  }

  return {
    code({ node, inline, className, children, ...props }: codeProps) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div style={{ borderRadius: "10px", overflow: "hidden", margin: "16px 0", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ background: dark ? "rgba(31, 41, 55, 0.9)" : "#f3f4f6", padding: "8px 14px", fontSize: "11px", fontWeight: 700, color: dark ? "#9ca3af" : "#6b7280", borderBottom: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", letterSpacing: "0.5px" }}>
            {(match[1] || "code").toUpperCase()}
          </div>
          <SyntaxHighlighter
            style={dark ? dracula : prism}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, padding: "14px 18px", borderRadius: 0, fontSize: "13px", lineHeight: 1.6 }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className}>{children}</code>
      );
    }
  };
};

const Sidebar = ({ cur, setMidBar, projectsCount }: SidebarProps) => {
  const dark = useStore((state) => state.dark);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "14px 10px" }}>
      {/* Sidebar Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 14px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.5)" }} />
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.6px", color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", textTransform: "uppercase" }}>
            Portfolio App
          </span>
        </div>
      </div>

      {/* Primary Category List */}
      <div style={{ marginTop: "14px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", padding: "0 8px 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Navigation
        </div>
        <ul style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {bear.map((item, index) => {
            const isActive = cur === index;
            const count = item.id === "project" ? projectsCount : item.md.length;

            return (
              <li
                key={`bear-sidebar-${item.id}`}
                onClick={() => setMidBar(item.md, index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
                    : "transparent",
                  color: isActive ? "#ffffff" : dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
                  boxShadow: isActive ? "0 4px 14px rgba(225, 29, 72, 0.3)" : "none",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                className={isActive ? "" : "hover:bg-black/5 dark:hover:bg-white/5"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={`${item.icon} text-base`} />
                  <span>{item.title}</span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "12px",
                    background: isActive ? "rgba(255,255,255,0.25)" : dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                    color: isActive ? "#ffffff" : dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"
                  }}
                >
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const Middlebar = ({
  items,
  cur,
  setContent,
  searchQuery,
  setSearchQuery,
  isProjectsCategory,
  githubRepos,
  loadingRepos,
  repoError,
  onRefreshRepos,
  onRetryRepos
}: MiddlebarProps) => {
  const dark = useStore((state) => state.dark);

  if (isProjectsCategory) {
    const filteredRepos = githubRepos.filter((repo) => {
      const q = searchQuery.toLowerCase();
      return (
        repo.display_name.toLowerCase().includes(q) ||
        repo.name.toLowerCase().includes(q) ||
        repo.description.toLowerCase().includes(q) ||
        (repo.language && repo.language.toLowerCase().includes(q)) ||
        repo.topics.some((t) => t.toLowerCase().includes(q))
      );
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Search & Refresh Header */}
        <div style={{ padding: "14px 12px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "10px", padding: "6px 10px", gap: "8px" }}>
              <span className="i-ph:magnifying-glass text-sm text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "12px", color: dark ? "#ffffff" : "#1c1c1e" }}
              />
            </div>
            <button
              onClick={onRefreshRepos}
              title="Refresh GitHub Projects"
              style={{
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                color: dark ? "#ffffff" : "#1c1c1e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              className="hover:scale-105"
            >
              <span className="i-ph:arrows-clockwise text-sm" />
            </button>
          </div>
        </div>

        {/* Dynamic Project List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }} className="no-scrollbar">
          {loadingRepos ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontSize: "13px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #e11d48", borderTopColor: "transparent", margin: "0 auto 12px" }} className="animate-spin" />
              Loading GitHub projects...
            </div>
          ) : repoError ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "#ef4444", fontWeight: 600, marginBottom: "12px" }}>
                {repoError}
              </div>
              <button
                onClick={onRetryRepos}
                style={{
                  background: "#e11d48",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Retry
              </button>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: "13px" }}>
              No repositories found matching "{searchQuery}".
            </div>
          ) : (
            filteredRepos.map((repo, index) => {
              const isActive = cur === index;
              return (
                <div
                  key={`github-repo-${repo.id}`}
                  onClick={() => setContent(repo.name, "", index, repo)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    marginBottom: "8px",
                    background: isActive
                      ? dark ? "rgba(255,255,255,0.1)" : "#ffffff"
                      : "transparent",
                    border: isActive
                      ? dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)"
                      : "1px solid transparent",
                    boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                    position: "relative",
                    transition: "all 0.15s ease"
                  }}
                  className={isActive ? "" : "hover:bg-black/5 dark:hover:bg-white/5"}
                >
                  {isActive && (
                    <div style={{ position: "absolute", left: 0, top: "12px", bottom: "12px", width: "4px", background: "#e11d48", borderRadius: "0 4px 4px 0" }} />
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: isActive ? 700 : 600, fontSize: "13.5px", color: dark ? "#ffffff" : "#0f172a" }}>
                      <span className={`${getLanguageIcon(repo.language)} text-red-500 text-sm`} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                        {repo.display_name}
                      </span>
                    </div>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#e11d48" }}
                        title="Live Demo"
                      >
                        <GlobeSVG className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <p style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", lineHeight: 1.45, margin: "2px 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {repo.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {repo.language && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600, color: getLanguageColor(repo.language) }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: getLanguageColor(repo.language) }} />
                          {repo.language}
                        </span>
                      )}
                      <span>★ {repo.stargazers_count}</span>
                      <span>⑂ {repo.forks_count}</span>
                    </div>
                    <span>{repo.updated_relative}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Standard Middlebar for static items (e.g. About Me)
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Search Header */}
      <div style={{ padding: "14px 12px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "10px", padding: "6px 10px", gap: "8px" }}>
          <span className="i-ph:magnifying-glass text-sm text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search section..."
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "12px", color: dark ? "#ffffff" : "#1c1c1e" }}
          />
        </div>
      </div>

      {/* Note List Items */}
      <ul style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }} className="no-scrollbar">
        {filteredItems.map((item: BearMdData, index: number) => {
          const isActive = cur === index;
          return (
            <li
              key={`bear-midbar-${item.id}`}
              onClick={() => setContent(item.id, item.file, index)}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                marginBottom: "6px",
                background: isActive
                  ? dark ? "rgba(255,255,255,0.1)" : "#ffffff"
                  : "transparent",
                border: isActive
                  ? dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)"
                  : "1px solid transparent",
                boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                position: "relative",
                transition: "all 0.15s ease"
              }}
              className={isActive ? "" : "hover:bg-black/5 dark:hover:bg-white/5"}
            >
              {isActive && (
                <div style={{ position: "absolute", left: 0, top: "12px", bottom: "12px", width: "4px", background: "#e11d48", borderRadius: "0 4px 4px 0" }} />
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: isActive ? 700 : 600, fontSize: "13.5px", color: dark ? "#ffffff" : "#1c1c1e" }}>
                  <span className={`${item.icon} text-red-500 text-sm`} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>{item.title}</span>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "#e11d48" }}
                    title="Open Link"
                  >
                    <GlobeSVG className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", lineHeight: 1.45, margin: "2px 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {item.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", marginTop: "4px" }}>
                <span>{item.date || "Updated recently"}</span>
                <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "4px", background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }}>
                  Portfolio Note
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const getRepoURL = (url: string) => {
  return url.slice(0, -10) + "/";
};

const fixImageURL = (text: string, contentURL: string): string => {
  text = text.replace(/&nbsp;/g, "");
  if (contentURL.indexOf("raw.githubusercontent.com") !== -1) {
    const repoURL = getRepoURL(contentURL);

    const imgReg = /!\[(.*?)\]\((.*?)\)/;
    const imgRegGlobal = /!\[(.*?)\]\((.*?)\)/g;

    const imgList = text.match(imgRegGlobal);

    if (imgList) {
      for (const img of imgList) {
        const imgURL = (img.match(imgReg) as Array<string>)[2];
        if (imgURL.indexOf("http") !== -1) continue;
        const newImgURL = repoURL + imgURL;
        text = text.replace(imgURL, newImgURL);
      }
    }
  }
  return text;
};

// Modern Interactive "About Me" Portfolio View Component
const AboutMePortfolioView = () => {
  const dark = useStore((state) => state.dark);

  const heroSkills = [
    { label: "DSA", color: "#e11d48" },
    { label: "MERN Stack", color: "#0284c7" },
    { label: "Next.js", color: "#8b5cf6" },
    { label: "React Native", color: "#10b981" },
    { label: "System Design", color: "#f59e0b" },
    { label: "Problem Solving", color: "#ec4899" }
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "8px 0 40px" }} className="animate-fade-in">

      {/* 1. HERO / INTRO HEADER */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
          border: dark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "20px",
          padding: "32px 36px",
          boxShadow: dark ? "0 10px 30px rgba(0, 0, 0, 0.3)" : "0 10px 30px rgba(0, 0, 0, 0.04)",
          backdropFilter: "blur(20px)",
          marginBottom: "28px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#e11d48", marginBottom: "6px" }}>
              Portfolio Centerpiece
            </div>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
              About Me
            </h1>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: dark ? "rgba(255,255,255,0.85)" : "#334155", marginTop: "6px", marginBottom: "8px" }}>
              Hey, I'm Lalit Kumar 👋
            </h2>
            <p style={{ fontSize: "15px", color: dark ? "rgba(255,255,255,0.65)" : "#64748b", margin: 0, fontWeight: 500 }}>
              Software Development Engineer — Build things. Solve problems. Learn continuously.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

            <a
              href="mailto:lalitmodi7878065@gmail.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#e11d48",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)",
                transition: "transform 0.15s ease"
              }}
              className="hover:scale-105"
            >
              <span className="i-ph:envelope-simple text-base" />
              <span>Contact Me</span>
            </a>
            <a
              href="https://github.com/LalitModi90"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                color: dark ? "#ffffff" : "#0f172a",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
                transition: "transform 0.15s ease"
              }}
              className="hover:scale-105"
            >
              <GitHubSVG className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="/resume.pdf"
              download
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: dark ? "rgba(2, 132, 199, 0.15)" : "rgba(2, 132, 199, 0.08)",
                color: "#0284c7",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid rgba(2, 132, 199, 0.25)",
                transition: "transform 0.15s ease"
              }}
              className="hover:scale-105"
            >
              <span className="i-ph:download-simple text-base" />
              <span>Download CV</span>
            </a>
          </div>
        </div>

        {/* METADATA CHIPS */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px", paddingTop: "20px", borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
          {heroSkills.map((sk) => (
            <span
              key={sk.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                color: dark ? "#f1f5f9" : "#334155",
                border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)",
                transition: "all 0.2s ease"
              }}
              className="hover:scale-105"
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sk.color }} />
              {sk.label}
            </span>
          ))}
        </div>
      </div>

      {/* 2. SUMMARY CARD */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Summary
          </h3>
        </div>
        <p style={{ fontSize: "15px", lineHeight: 1.7, color: dark ? "rgba(255,255,255,0.85)" : "#334155", margin: 0 }}>
          Aspiring <strong style={{ color: "#e11d48" }}>Software Development Engineer (SDE)</strong> with a strong foundation in <strong style={{ color: "#0284c7" }}>Data Structures and Algorithms (DSA)</strong> and full-stack development. Proficient in building scalable web and mobile applications using the <strong style={{ color: "#8b5cf6" }}>MERN stack</strong>, <strong style={{ color: "#10b981" }}>Next.js</strong>, and <strong style={{ color: "#ec4899" }}>React Native</strong>. Dedicated to solving complex computational problems and optimizing system performance, with a solid grasp of <strong>OOPS</strong>, <strong>DBMS</strong>, and <strong>Operating Systems</strong>.
        </p>
      </div>

      {/* 3. EDUCATION SECTION */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Education
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {EDUCATION.map((edu, idx) => (
            <div
              key={`edu-${idx}`}
              style={{
                display: "flex",
                gap: "16px",
                position: "relative",
                paddingLeft: "4px"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: idx === 0 ? "#e11d48" : dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)", marginTop: "4px" }} />
                {idx !== EDUCATION.length - 1 && (
                  <div style={{ flex: 1, width: "2px", background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", marginTop: "6px" }} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>
                    {edu.institution}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: dark ? "rgba(255,255,255,0.7)" : "#64748b" }}>
                    {edu.period}
                  </span>
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#e11d48", marginTop: "2px" }}>
                  {edu.degree}
                </div>
                <div style={{ fontSize: "13px", color: dark ? "rgba(255,255,255,0.55)" : "#64748b", marginTop: "2px" }}>
                  {edu.location}
                </div>
                {edu.cgpa && (
                  <div style={{ fontSize: "13px", fontWeight: 600, color: dark ? "rgba(255,255,255,0.85)" : "#334155", marginTop: "6px" }}>
                    {edu.cgpa}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TECHNICAL SKILLS GRID */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Technical Skills & Arsenal
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {ARSENAL_CARDS.map((card) => (
            <div
              key={`skill-card-${card.id}`}
              style={{
                position: "relative",
                background: dark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: "14px",
                padding: "16px 18px 14px 20px",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden"
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Left Accent Bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "12px",
                  bottom: "12px",
                  width: "4px",
                  background: "#e11d48",
                  borderRadius: "0 4px 4px 0"
                }}
              />

              <div>
                {/* Header: Icon + Title & Right Icon */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>
                      {card.icons?.[0] || "⚡"}
                    </span>
                    <span style={{ fontSize: "14.5px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>
                      {card.category}
                    </span>
                  </div>
                  <span style={{ color: "#e11d48" }}>
                    <GlobeSVG className="w-4 h-4" />
                  </span>
                </div>

                {/* Excerpt / Summary */}
                <p
                  style={{
                    fontSize: "12.5px",
                    color: dark ? "rgba(255, 255, 255, 0.6)" : "#64748b",
                    lineHeight: 1.5,
                    margin: "4px 0 12px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {card.techs.join(" • ")}
                </p>

                {/* Tech Chips */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {card.techs.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
                        color: dark ? "#e2e8f0" : "#334155",
                        border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {card.techs.length > 5 && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                        color: dark ? "#94a3b8" : "#64748b"
                      }}
                    >
                      +{card.techs.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer: Date / Subtitle & Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
                  fontSize: "11px",
                  color: dark ? "rgba(255,255,255,0.45)" : "#94a3b8"
                }}
              >
                <span>Updated yesterday</span>
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "6px",
                    background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    color: dark ? "rgba(255,255,255,0.75)" : "#475569",
                    fontWeight: 600,
                    fontSize: "11px"
                  }}
                >
                  Portfolio Note
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PROJECTS SECTION */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Featured Technical Projects
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {PROJECTS.map((proj) => (
            <div
              key={`proj-${proj.id}`}
              style={{
                background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
                border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: "14px",
                padding: "20px",
                transition: "all 0.2s ease"
              }}
              className="hover:scale-[1.01]"
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "17px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
                    {proj.title}
                  </h4>
                  <div style={{ fontSize: "13px", color: proj.color, fontWeight: 600, marginTop: "2px" }}>
                    {proj.subtitle}
                  </div>
                  <div style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.5)" : "#64748b", fontWeight: 500, marginTop: "1px" }}>
                    Impact: {proj.impact}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {proj.liveLink && (
                    <a
                      href={proj.liveLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#e11d48",
                        color: "#ffffff",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        textDecoration: "none"
                      }}
                      className="hover:scale-105"
                    >
                      <GlobeSVG className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                      <ExternalArrowSVG className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                  {proj.githubLink && (
                    <a
                      href={proj.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                        color: dark ? "#ffffff" : "#0f172a",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        textDecoration: "none",
                        border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)"
                      }}
                      className="hover:scale-105"
                    >
                      <GitHubSVG className="w-3.5 h-3.5" />
                      <span>GitHub Repo</span>
                      <ExternalArrowSVG className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                </div>
              </div>

              <ul style={{ paddingLeft: "18px", margin: "10px 0 14px", fontSize: "13.5px", color: dark ? "rgba(255,255,255,0.75)" : "#475569", lineHeight: 1.6 }}>
                {proj.desc.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {proj.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      color: dark ? "rgba(255,255,255,0.8)" : "#334155"
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. ACHIEVEMENTS & CERTIFICATIONS */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Achievements & Certifications
          </h3>
        </div>

        <ul style={{ paddingLeft: "20px", fontSize: "14px", color: dark ? "rgba(255,255,255,0.85)" : "#334155", lineHeight: 1.7, marginBottom: "20px" }}>
          {ACHIEVEMENTS.map((ach, aIdx) => (
            <li key={aIdx} style={{ marginBottom: "6px" }}>{ach}</li>
          ))}
        </ul>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", paddingTop: "16px", borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
          {CERTIFICATIONS.map((cert, cIdx) => (
            <div
              key={`cert-${cIdx}`}
              style={{
                background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
                border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: "10px",
                padding: "12px 14px"
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>
                {cert.title}
              </div>
              <div style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.55)" : "#64748b", marginTop: "2px" }}>
                {cert.provider} ({cert.year})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Interactive GitHub & Coding Profiles Dashboard Component
const GithubStatsView = ({
  githubRepos = [],
  showToast
}: {
  githubRepos?: GitHubRepo[];
  showToast?: (msg: string) => void;
}) => {
  const dark = useStore((state) => state.dark);
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [ccStats, setCcStats] = useState<CodeChefStats | null>(null);
  const [loadingCodingStats, setLoadingCodingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setLoadingCodingStats(true);
      const [lc, cc] = await Promise.all([
        fetchLeetCodeStats(),
        fetchCodeChefStats()
      ]);
      if (isMounted) {
        setLcStats(lc);
        setCcStats(cc);
        setLoadingCodingStats(false);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  // Calculate real-time top languages from GitHub REST API repos
  const languageCounts: { [lang: string]: number } = {};
  githubRepos.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  const totalLangRepos = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
  const realTimeLanguages = Object.entries(languageCounts)
    .map(([lang, count]) => ({
      name: lang,
      count,
      percentage: Math.round((count / totalLangRepos) * 100),
      color: getLanguageColor(lang)
    }))
    .filter((lang) => !["c++", "c", "cpp"].includes(lang.name.toLowerCase()))
    .sort((a, b) => b.count - a.count);

  const totalStarsCount = githubRepos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
  const totalForksCount = githubRepos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);
  const totalReposCount = githubRepos.length || 15;

  const contactItems = [

    {
      label: "Email / Gmail",
      value: "lalitmodi7878065@gmail.com",
      action: () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText("lalitmodi7878065@gmail.com");
          showToast?.("Email copied to clipboard!");
        }
      },
      icon: "i-ph:envelope-simple-fill",
      color: "#ea4335"
    },
    {
      label: "WhatsApp",
      value: "+91 7878065017",
      link: "https://wa.me/917878065017",
      icon: "i-fa6-brands:whatsapp",
      color: "#25d366"
    },
    {
      label: "LinkedIn Profile",
      value: "linkedin.com/in/lalit-modi-874631302",
      link: "https://www.linkedin.com/in/lalit-modi-874631302/",
      icon: "i-fa6-brands:linkedin",
      color: "#0a66c2"
    },
    {
      label: "Instagram Profile",
      value: "@mr.lalitmodi90",
      link: "https://www.instagram.com/mr.lalitmodi90/",
      icon: "i-fa6-brands:instagram",
      color: "#e1306c"
    }
  ];

  const liveApps = [
    {
      name: "Codeyx Analytics Platform",
      link: "https://codeyx-web.vercel.app/",
      desc: "Competitive programming stats hub for LeetCode, CodeChef & GitHub",
      color: "#e11d48"
    },
    {
      name: "Mini ERP CRM Portal",
      link: "https://mini-erp-crm-portal-frontend.vercel.app/",
      desc: "Business operations & customer relations portal",
      color: "#0284c7"
    },
    {
      name: "Make Appointment Easy",
      link: "https://makeappointmenteasy-user-web.vercel.app/",
      desc: "Real-time appointment scheduling application",
      color: "#8b5cf6"
    }
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "8px 0 40px" }} className="animate-fade-in">

      {/* 1. Header Card */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
          border: dark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "20px",
          padding: "28px 32px",
          boxShadow: dark ? "0 10px 30px rgba(0, 0, 0, 0.3)" : "0 10px 30px rgba(0, 0, 0, 0.04)",
          backdropFilter: "blur(20px)",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <GitHubSVG className="w-5 h-5 text-red-500" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Developer Dashboard
              </span>
            </div>
            <h1 style={{ fontSize: "30px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
              GitHub & Coding Hub
            </h1>
            <div style={{ fontSize: "14px", color: dark ? "rgba(255,255,255,0.65)" : "#64748b", marginTop: "4px" }}>
              Lalit Kumar (@LalitModi90) — Software Development Engineer
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText("lalitmodi7878065@gmail.com");
                  showToast?.("Email copied to clipboard!");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#0284c7",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
              }}
              className="hover:scale-105"
            >
              <span className="i-ph:envelope-simple text-base" />
              <span>Copy Email</span>
            </button>
            <a
              href="https://github.com/LalitModi90"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                color: dark ? "#ffffff" : "#0f172a",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)"
              }}
              className="hover:scale-105"
            >
              <GitHubSVG className="w-4 h-4" />
              <span>GitHub Profile</span>
              <ExternalArrowSVG className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. LIVE Competitive Coding Platforms Cards */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
              Live Competitive Coding Metrics
            </h3>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            <span>{loadingCodingStats ? "Syncing..." : "Live Data Synced"}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          {/* LEETCODE LIVE CARD */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
              border: dark ? "1px solid rgba(248, 155, 28, 0.3)" : "1px solid rgba(248, 155, 28, 0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#f89b1c" }}>LeetCode</span>
                <div style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.6)" : "#64748b", fontWeight: 600 }}>
                  @LalitModi90
                </div>
              </div>
              <a
                href="https://leetcode.com/u/LalitModi90/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#f89b1c", display: "inline-flex", alignItems: "center" }}
              >
                <ExternalArrowSVG className="w-4 h-4" />
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a" }}>
                {lcStats ? lcStats.totalSolved : 349}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#f89b1c" }}>
                Problems Solved
              </span>
            </div>

            {/* LeetCode Global Rank & Contest Rating Badges */}
            {lcStats && (lcStats.ranking > 0 || lcStats.contestRating) && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                {lcStats.ranking > 0 && (
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: dark ? "rgba(248, 155, 28, 0.15)" : "rgba(248, 155, 28, 0.1)", color: "#f89b1c" }}>
                    Global Rank #{lcStats.ranking.toLocaleString()}
                  </span>
                )}
                {lcStats.contestRating && (
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: dark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                    Contest Rating {lcStats.contestRating}
                  </span>
                )}
                {lcStats.topPercentage && (
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: dark ? "rgba(14, 165, 233, 0.15)" : "rgba(14, 165, 233, 0.1)", color: "#0ea5e9" }}>
                    Top {lcStats.topPercentage}%
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", paddingTop: "12px", borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ textAlign: "center", padding: "6px", background: dark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#10b981" }}>EASY</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a" }}>
                  {lcStats ? lcStats.easySolved : 150}
                </div>
              </div>

              <div style={{ textAlign: "center", padding: "6px", background: dark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#f59e0b" }}>MEDIUM</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a" }}>
                  {lcStats ? lcStats.mediumSolved : 171}
                </div>
              </div>

              <div style={{ textAlign: "center", padding: "6px", background: dark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.08)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444" }}>HARD</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a" }}>
                  {lcStats ? lcStats.hardSolved : 28}
                </div>
              </div>
            </div>
          </div>

          {/* CODECHEF LIVE CARD */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
              border: dark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(168, 85, 247, 0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#a855f7" }}>CodeChef</span>
                <div style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.6)" : "#64748b", fontWeight: 600 }}>
                  @lalitmodi7878
                </div>
              </div>
              <a
                href="https://www.codechef.com/users/lalitmodi7878"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#a855f7", display: "inline-flex", alignItems: "center" }}
              >
                <ExternalArrowSVG className="w-4 h-4" />
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a" }}>
                {ccStats ? ccStats.rating : 1006}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#a855f7" }}>
                Current Rating ({ccStats ? ccStats.stars : "1★"})
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", paddingTop: "12px", borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "8px 10px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.5)" : "#64748b" }}>GLOBAL RANK</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#e11d48", marginTop: "2px" }}>
                  #{ccStats ? ccStats.globalRank.toLocaleString() : "4,893"}
                </div>
              </div>

              <div style={{ padding: "8px 10px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.5)" : "#64748b" }}>COUNTRY RANK</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0284c7", marginTop: "2px" }}>
                  #{ccStats ? ccStats.countryRank.toLocaleString() : "3,200"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GitHub Real-time Stats Cards */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
              GitHub Activity & Statistics
            </h3>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: "20px" }}>
            ● Live Sync
          </span>
        </div>

        {/* Compact GitHub Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.5)" : "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Public Repositories
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#3b82f6", marginTop: "2px" }}>
              {githubRepos.length > 0 ? `${githubRepos.length} Repos` : "15+ Repos"}
            </div>
            <div style={{ fontSize: "10.5px", color: dark ? "rgba(255,255,255,0.55)" : "#64748b", marginTop: "1px" }}>
              Open Source Projects
            </div>
          </div>

          <div style={{ background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.5)" : "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Primary Stack
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#0284c7", marginTop: "2px" }}>
              TypeScript / JS
            </div>
            <div style={{ fontSize: "10.5px", color: dark ? "rgba(255,255,255,0.55)" : "#64748b", marginTop: "1px" }}>
              MERN & Next.js
            </div>
          </div>

          <div style={{ background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.5)" : "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Architecture
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#8b5cf6", marginTop: "2px" }}>
              Production
            </div>
            <div style={{ fontSize: "10.5px", color: dark ? "rgba(255,255,255,0.55)" : "#64748b", marginTop: "1px" }}>
              Clean System Design
            </div>
          </div>

          <div style={{ background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.5)" : "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              GitHub Sync
            </div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
              Active
            </div>
            <div style={{ fontSize: "10.5px", color: dark ? "rgba(255,255,255,0.55)" : "#64748b", marginTop: "1px" }}>
              @LalitModi90
            </div>
          </div>
        </div>

        {/* GitHub Stats Cards with Real-Time Languages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {/* 1. Official GitHub Overview Stats Card */}
          <div
            style={{
              borderRadius: "16px",
              border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
              background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GitHubSVG className="w-4 h-4 text-red-500" />
                <span>GitHub Overview Stats</span>
              </div>
              <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600, background: "rgba(16,185,129,0.12)", padding: "3px 9px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                Live Sync
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {/* Star Card */}
              <div
                style={{
                  padding: "14px",
                  background: dark ? "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)" : "linear-gradient(135deg, #fffcf0 0%, #fef3c7 100%)",
                  border: dark ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid rgba(245, 158, 11, 0.25)",
                  borderRadius: "12px",
                  transition: "all 0.2s ease"
                }}
                className="hover:scale-[1.02]"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#f59e0b" }}>
                    ★
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: dark ? "#fcd34d" : "#b45309", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Total Stars
                  </span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: dark ? "#fbbf24" : "#d97706", lineHeight: 1 }}>
                  {totalStarsCount}
                </div>
              </div>

              {/* Fork Card */}
              <div
                style={{
                  padding: "14px",
                  background: dark ? "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)" : "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                  border: dark ? "1px solid rgba(168, 85, 247, 0.2)" : "1px solid rgba(168, 85, 247, 0.25)",
                  borderRadius: "12px",
                  transition: "all 0.2s ease"
                }}
                className="hover:scale-[1.02]"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#a855f7" }}>
                    ⑂
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: dark ? "#d8b4fe" : "#7e22ce", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Total Forks
                  </span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: dark ? "#c084fc" : "#9333ea", lineHeight: 1 }}>
                  {totalForksCount}
                </div>
              </div>

              {/* Public Repos Card */}
              <div
                style={{
                  padding: "14px",
                  background: dark ? "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)" : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  border: dark ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "12px",
                  transition: "all 0.2s ease"
                }}
                className="hover:scale-[1.02]"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#3b82f6" }}>
                    📦
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: dark ? "#93c5fd" : "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Public Repos
                  </span>
                </div>
                <div style={{ fontSize: "19px", fontWeight: 800, color: dark ? "#60a5fa" : "#2563eb", lineHeight: 1 }}>
                  {totalReposCount} Repos
                </div>
              </div>

              {/* Developer Stack Card */}
              <div
                style={{
                  padding: "14px",
                  background: dark ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)" : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: dark ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "12px",
                  transition: "all 0.2s ease"
                }}
                className="hover:scale-[1.02]"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#10b981" }}>
                    ⚡
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: dark ? "#86efac" : "#15803d", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    Primary Stack
                  </span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: dark ? "#4ade80" : "#16a34a", lineHeight: 1.2 }}>
                  Full-Stack / SDE
                </div>
              </div>
            </div>
          </div>

          {/* 2. Real-Time Top Languages Breakdown Card */}
          <div
            style={{
              borderRadius: "16px",
              border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
              background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="i-ph:code-bold text-red-500 text-sm" />
                <span>Most Used Languages</span>
              </div>
              <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600, background: "rgba(16,185,129,0.12)", padding: "3px 9px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                Live Sync
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {realTimeLanguages.length > 0 ? (
                realTimeLanguages.slice(0, 5).map((lang) => (
                  <div key={lang.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: dark ? "rgba(255,255,255,0.85)" : "#334155", marginBottom: "5px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: lang.color }} />
                        {lang.name}
                      </span>
                      <span style={{ fontSize: "11px", color: dark ? "rgba(255,255,255,0.6)" : "#64748b" }}>
                        {lang.percentage}% ({lang.count} repos)
                      </span>
                    </div>
                    <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.max(lang.percentage, 4)}%`, background: lang.color, borderRadius: "3px", transition: "width 0.3s ease" }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "12px", color: dark ? "rgba(255,255,255,0.5)" : "#64748b", padding: "12px 0", textAlign: "center" }}>
                  Loading real-time language stats...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Direct Contact & Social Links */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Contact & Social Profiles
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
          {contactItems.map((item) => {
            const isClickable = !!item.link || !!item.action;
            return (
              <div
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.link) window.open(item.link, "_blank");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
                  border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                  cursor: isClickable ? "pointer" : "default",
                  transition: "all 0.2s ease"
                }}
                className={isClickable ? "hover:scale-[1.02] hover:shadow-md" : ""}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                  <span className={`${item.icon} text-lg`} />
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.45)" : "#64748b", textTransform: "uppercase" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.value}
                  </div>
                </div>
                {isClickable && (
                  <ExternalArrowSVG className="w-3.5 h-3.5 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Live Web Applications */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ width: "4px", height: "18px", background: "#e11d48", borderRadius: "2px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            Live Deployed Web Applications
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {liveApps.map((app) => (
            <a
              key={app.name}
              href={app.link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: "12px",
                background: dark ? "rgba(15, 23, 42, 0.6)" : "rgba(248, 250, 252, 0.8)",
                border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              className="hover:scale-[1.01]"
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>
                  {app.name}
                </div>
                <div style={{ fontSize: "12.5px", color: dark ? "rgba(255,255,255,0.6)" : "#64748b", marginTop: "2px" }}>
                  {app.desc}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#e11d48", color: "#ffffff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>
                <GlobeSVG className="w-3.5 h-3.5" />
                <span>Open App</span>
                <ExternalArrowSVG className="w-3 h-3 opacity-90" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// GitHub Project Detail View with README Preview
const GitHubProjectDetailView = ({
  repo,
  loadingReadme,
  readmeContent
}: {
  repo: GitHubRepo;
  loadingReadme: boolean;
  readmeContent: string | null;
}) => {
  const dark = useStore((state) => state.dark);

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "8px 0 40px" }} className="animate-fade-in">

      {/* 1. Project Header Card */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.8)",
          border: dark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "20px",
          padding: "28px 32px",
          boxShadow: dark ? "0 10px 30px rgba(0, 0, 0, 0.3)" : "0 10px 30px rgba(0, 0, 0, 0.04)",
          backdropFilter: "blur(20px)",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className={`${getLanguageIcon(repo.language)} text-red-500 text-lg`} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                GitHub Repository
              </span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", color: dark ? "rgba(255,255,255,0.7)" : "#64748b" }}>
                {repo.visibility}
              </span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: dark ? "#ffffff" : "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
              {repo.display_name}
            </h1>
            <div style={{ fontSize: "13px", color: dark ? "rgba(255,255,255,0.5)" : "#64748b", marginTop: "4px" }}>
              @LalitModi90/{repo.name}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#e11d48",
                  color: "#ffffff",
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)"
                }}
                className="hover:scale-105 transition-transform"
              >
                <GlobeSVG className="w-4 h-4" />
                <span>Live Demo</span>
                <ExternalArrowSVG className="w-3.5 h-3.5 opacity-90" />
              </a>
            )}

            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                color: dark ? "#ffffff" : "#0f172a",
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)"
              }}
              className="hover:scale-105 transition-transform"
            >
              <GitHubSVG className="w-4 h-4" />
              <span>GitHub Repo</span>
              <ExternalArrowSVG className="w-3.5 h-3.5 opacity-90" />
            </a>
          </div>
        </div>

        {/* Repos Metadata bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "18px", paddingTop: "16px", borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", fontSize: "13px", color: dark ? "rgba(255,255,255,0.7)" : "#475569" }}>
          {repo.language && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700, color: getLanguageColor(repo.language) }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getLanguageColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          <span style={{ fontWeight: 600 }}>★ {repo.stargazers_count} Stars</span>
          <span style={{ fontWeight: 600 }}>⑂ {repo.forks_count} Forks</span>
          <span>{repo.updated_relative}</span>
        </div>
      </div>

      {/* 2. Description & Topics */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "22px 26px",
          marginBottom: "24px"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", marginTop: 0, marginBottom: "10px" }}>
          Project Overview
        </h3>
        <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: dark ? "rgba(255,255,255,0.85)" : "#334155", margin: 0 }}>
          {repo.description}
        </p>

        {repo.topics.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px", paddingTop: "14px", borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
            {repo.topics.map((tp) => (
              <span
                key={tp}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: dark ? "rgba(225, 29, 72, 0.12)" : "rgba(225, 29, 72, 0.08)",
                  color: "#e11d48"
                }}
              >
                #{tp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. README Preview Section */}
      <div
        style={{
          background: dark ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
          border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "18px",
          padding: "24px 28px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: dark ? "#ffffff" : "#0f172a", margin: 0 }}>
            README Preview
          </h3>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "12.5px", fontWeight: 600, color: "#e11d48", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <span>View README on GitHub</span>
            <ExternalArrowSVG className="w-3 h-3" />
          </a>
        </div>

        {loadingReadme ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: "13px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #e11d48", borderTopColor: "transparent", margin: "0 auto 10px" }} className="animate-spin" />
            Loading README preview...
          </div>
        ) : readmeContent ? (
          <div className="markdown" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[
                rehypeKatex,
                [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }]
              ]}
              components={Highlighter(dark as boolean)}
            >
              {readmeContent.length > 3000 ? readmeContent.slice(0, 3000) + "\n\n*(README truncated for preview. View full README on GitHub)*" : readmeContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div style={{ padding: "20px 0", fontSize: "13px", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontStyle: "italic" }}>
            No README file available for this repository.
          </div>
        )}
      </div>
    </div>
  );
};

const Content = ({
  contentID,
  contentURL,
  activeCategory,
  selectedRepo,
  loadingReadme,
  readmeContent,
  loadingRepos,
  repoError,
  githubRepos = [],
  onRetryRepos,
  showToast
}: ContentProps) => {
  const [storeMd, setStoreMd] = useState<{ [key: string]: string }>({});
  const dark = useStore((state) => state.dark);

  const fetchMarkdown = useCallback(
    (id: string, url: string) => {
      if (!storeMd[id] && url) {
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            storeMd[id] = fixImageURL(text, url);
            setStoreMd({ ...storeMd });
          })
          .catch((error) => { /* console.error(error) */ });
      }
    },
    [storeMd]
  );

  useEffect(() => {
    if (contentURL) {
      fetchMarkdown(contentID, contentURL);
    }
  }, [contentID, contentURL, fetchMarkdown]);

  // If "About Me" category is selected
  if (activeCategory === "about-me") {
    if (contentID === "about-me") {
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: dark ? "#0f172a" : "#f8fafc" }}>
          {/* Top Window Bar inside Content View */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", fontSize: "12px", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="i-ph:user-circle-bold text-red-500 text-base" />
              <span style={{ fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>About Me</span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Active SDE Portfolio</span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText("https://github.com/LalitModi90");
                    showToast("GitHub profile link copied!");
                  }
                }}
                title="Share Profile"
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span className="i-ph:share-network text-sm" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }} className="no-scrollbar">
            <AboutMePortfolioView />
          </div>
        </div>
      );
    }

    if (contentID === "github-stats") {
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: dark ? "#0f172a" : "#f8fafc" }}>
          {/* Top Window Bar inside Content View */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", fontSize: "12px", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <GitHubSVG className="w-4 h-4 text-red-500" />
              <span style={{ fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>Github Stats & Coding Hub</span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Live Dashboard</span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText("https://github.com/LalitModi90");
                    showToast("GitHub profile link copied!");
                  }
                }}
                title="Share Profile"
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span className="i-ph:share-network text-sm" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }} className="no-scrollbar">
            <GithubStatsView githubRepos={githubRepos} showToast={showToast} />
          </div>
        </div>
      );
    }
  }

  // If Projects category is selected and a GitHub repository is active
  if (activeCategory === "project") {
    if (loadingRepos) {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#0f172a" : "#f8fafc" }}>
          <div style={{ textAlign: "center", color: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #e11d48", borderTopColor: "transparent", margin: "0 auto 12px" }} className="animate-spin" />
            <div style={{ fontSize: "14px", fontWeight: 600 }}>Loading GitHub projects...</div>
          </div>
        </div>
      );
    }

    if (repoError) {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#0f172a" : "#f8fafc" }}>
          <div style={{ textAlign: "center", maxWidth: "340px", padding: "24px", background: dark ? "rgba(30,41,59,0.5)" : "#ffffff", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)", borderRadius: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>
              Unable to load GitHub projects
            </div>
            <div style={{ fontSize: "13px", color: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", marginBottom: "16px" }}>
              {repoError}
            </div>
            <button
              onClick={onRetryRepos}
              style={{ background: "#e11d48", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (selectedRepo) {
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: dark ? "#0f172a" : "#f8fafc" }}>
          {/* Top Window Bar inside Content View */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", fontSize: "12px", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <GitHubSVG className="w-4 h-4 text-red-500" />
              <span style={{ fontWeight: 700, color: dark ? "#ffffff" : "#0f172a" }}>{selectedRepo.display_name}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", color: dark ? "rgba(255,255,255,0.7)" : "#64748b" }}>
                GitHub Project
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  if (navigator.clipboard && selectedRepo.html_url) {
                    navigator.clipboard.writeText(selectedRepo.html_url);
                    showToast("Repository link copied!");
                  }
                }}
                title="Share Repository"
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span className="i-ph:share-network text-sm" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }} className="no-scrollbar">
            <GitHubProjectDetailView
              repo={selectedRepo}
              loadingReadme={loadingReadme}
              readmeContent={readmeContent}
            />
          </div>
        </div>
      );
    }
  }

  const rawText = storeMd[contentID] || "";
  const wordCount = rawText ? rawText.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: dark ? "#0f172a" : "#ffffff" }}>
      {/* Content Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", fontSize: "12px", color: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="i-ph:note-pencil text-red-500 text-sm" />
          <span style={{ fontWeight: 600, color: dark ? "#ffffff" : "#1c1c1e" }}>{wordCount} words</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              if (rawText && navigator.clipboard) {
                navigator.clipboard.writeText(rawText);
                showToast("Note content copied to clipboard!");
              }
            }}
            title="Copy Content"
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span className="i-ph:share-network text-sm" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Markdown Reader Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px" }} className="no-scrollbar">
        <div className="markdown" style={{ maxWidth: "760px", margin: "0 auto" }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              rehypeKatex,
              [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }]
            ]}
            components={Highlighter(dark as boolean)}
          >
            {rawText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const Bear = () => {
  const dark = useStore((state) => state.dark);
  const [searchQuery, setSearchQuery] = useState("");
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [loadingReadme, setLoadingReadme] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ msg: string; visible: boolean } | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((t) => t ? { ...t, visible: false } : null);
      setTimeout(() => setToast(null), 350);
    }, 2800);
  };

  const [state, setState] = useState({
    curSidebar: 0,
    curMidbar: 0,
    midbarList: bear[0].md,
    contentID: bear[0].md[0].id,
    contentURL: bear[0].md[0].file
  });

  const loadGitHubRepos = useCallback(async (forceRefresh = false) => {
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const repos = await fetchGitHubRepos(forceRefresh);
      setGithubRepos(repos);
      if (repos.length > 0 && !selectedRepo) {
        setSelectedRepo(repos[0]);
      }
    } catch (err: any) {
      setRepoError(err?.message || "Unable to load GitHub projects.");
    } finally {
      setLoadingRepos(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    loadGitHubRepos(false);
  }, []);

  const loadReadme = useCallback(async (repoName: string) => {
    setLoadingReadme(true);
    setReadmeContent(null);
    const readme = await fetchGitHubRepoReadme(repoName);
    setReadmeContent(readme);
    setLoadingReadme(false);
  }, []);

  const setMidBar = (items: BearMdData[], index: number) => {
    const category = bear[index].id;
    if (category === "project" && githubRepos.length > 0) {
      const activeRepo = selectedRepo || githubRepos[0];
      setState({
        curSidebar: index,
        curMidbar: 0,
        midbarList: items,
        contentID: activeRepo.name,
        contentURL: ""
      });
      setSelectedRepo(activeRepo);
      loadReadme(activeRepo.name);
    } else {
      setState({
        curSidebar: index,
        curMidbar: 0,
        midbarList: items,
        contentID: items[0].id,
        contentURL: items[0].file
      });
      setSelectedRepo(null);
    }
  };

  const setContent = (id: string, url: string, index: number, repo?: GitHubRepo) => {
    if (repo) {
      setSelectedRepo(repo);
      setState({
        ...state,
        curMidbar: index,
        contentID: repo.name,
        contentURL: ""
      });
      loadReadme(repo.name);
    } else {
      setState({
        ...state,
        curMidbar: index,
        contentID: id,
        contentURL: url
      });
      setSelectedRepo(null);
    }
  };

  const activeCategory = bear[state.curSidebar].id;

  return (
    <div className="bear font-avenir flex h-full" style={{ background: dark ? "#0f172a" : "#f8fafc", position: "relative" }}>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            borderRadius: "12px",
            background: dark ? "rgba(15, 23, 42, 0.95)" : "#ffffff",
            border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            backdropFilter: "blur(16px)",
            fontSize: "13px",
            fontWeight: 600,
            color: dark ? "#f1f5f9" : "#0f172a",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            opacity: toast.visible ? 1 : 0,
            transform: toast.visible ? "translateY(0)" : "translateY(-12px)",
            pointerEvents: "none",
            minWidth: "220px",
            maxWidth: "340px"
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
          {toast.msg}
        </div>
      )}

      {/* 1. Sidebar */}
      <div style={{ width: "190px", flexShrink: 0, borderRight: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", background: dark ? "rgba(15, 23, 42, 0.95)" : "rgba(241, 245, 249, 0.95)", backdropFilter: "blur(20px)" }}>
        <Sidebar
          cur={state.curSidebar}
          setMidBar={setMidBar}
          projectsCount={githubRepos.length}
        />
      </div>

      {/* 2. Middlebar */}
      <div style={{ width: "240px", flexShrink: 0, borderRight: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", background: dark ? "#0f172a" : "#f8fafc" }}>
        <Middlebar
          items={state.midbarList}
          cur={state.curMidbar}
          setContent={setContent}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isProjectsCategory={activeCategory === "project"}
          githubRepos={githubRepos}
          loadingRepos={loadingRepos}
          repoError={repoError}
          onRefreshRepos={() => loadGitHubRepos(true)}
          onRetryRepos={() => loadGitHubRepos(true)}
        />
      </div>

      {/* 3. Main Content Container */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Content
          contentID={state.contentID}
          contentURL={state.contentURL}
          activeCategory={activeCategory}
          selectedRepo={selectedRepo}
          loadingReadme={loadingReadme}
          readmeContent={readmeContent}
          loadingRepos={loadingRepos}
          repoError={repoError}
          githubRepos={githubRepos}
          onRetryRepos={() => loadGitHubRepos(true)}
          showToast={showToast}
        />
      </div>
    </div>
  );
};

export default Bear;
