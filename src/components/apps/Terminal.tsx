import React, { useState, useEffect, useRef, useMemo } from "react";
import { portfolioData } from "~/configs/portfolioData";
import { PERSONAL_INFO } from "~/configs/personal";
import { fetchGitHubRepos, type GitHubRepo } from "~/utils/githubService";

interface HistoryItem {
  id: string;
  command: string;
  timestamp?: string;
  output: React.ReactNode;
}

const AVAILABLE_COMMANDS = [
  { name: "help", desc: "List all available commands" },
  { name: "about", desc: "About Lalit Kumar" },
  { name: "skills", desc: "Technical skills & stack" },
  { name: "projects", desc: "View projects & repositories" },
  { name: "maps", desc: "Open macOS Maps application" },
  { name: "university", desc: "Parul University location & info" },
  { name: "home", desc: "Home location (approx. region)" },
  { name: "locate me", desc: "Locate current position" },
  { name: "github", desc: "Open GitHub profile" },
  { name: "leetcode", desc: "Open LeetCode profile" },
  { name: "resume", desc: "View or download resume" },
  { name: "contact", desc: "Contact information & socials" },
  { name: "whoami", desc: "Developer identity summary" },
  { name: "status", desc: "Current developer availability & status" },
  { name: "neofetch", desc: "System & portfolio overview" },
  { name: "clear", desc: "Clear terminal screen" },
];

const WELCOME_ASCII = `  ██████╗  ██████╗ ██████╗ ███████╗
  ██╔══██╗██╔═══██╗██╔══██╗██╔════╝
  ██║  ██║██║   ██║██║  ██║█████╗  
  ██║  ██║██║   ██║██║  ██║██╔══╝  
  ██████╔╝╚██████╔╝██████╔╝███████╗
  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝`;

const NEOFETCH_ASCII = `       .---.
      /     \\
     | () () |
      \\  -  /
     /       \\
    /  |   |  \\
   /   |   |   \\
  / /| |   | |\\ \\
 (_/ |_|   |_| \\_)`;

export default function Terminal() {
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [gitRepos, setGitRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set initial login time
  useEffect(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    setCurrentTime(formatted);

    // Focus input safely without scrolling page
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);

    // Pre-fetch GitHub repos into cache silently
    fetchGitHubRepos()
      .then((repos) => setGitRepos(repos))
      .catch(() => {});
  }, []);

  // Container-scoped auto-scroll when history changes — NEVER scroll document/viewport
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  // Keep focus on input without scrolling the browser page
  const focusInput = (e?: React.MouseEvent) => {
    // Don't steal focus if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  // Autocomplete matching
  const matchingCommands = useMemo(() => {
    const trimmed = inputVal.trim().toLowerCase();
    if (!trimmed) return [];
    return AVAILABLE_COMMANDS.filter((cmd) => cmd.name.startsWith(trimmed));
  }, [inputVal]);

  const topSuggestion = useMemo(() => {
    if (matchingCommands.length > 0) {
      const trimmed = inputVal.trim().toLowerCase();
      const first = matchingCommands[0].name;
      if (first.startsWith(trimmed)) {
        return first.slice(trimmed.length);
      }
    }
    return "";
  }, [matchingCommands, inputVal]);

  const executeCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    const lowerCmd = trimmed.toLowerCase();

    // Add to command history navigation
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    let outputContent: React.ReactNode = null;

    switch (lowerCmd) {
      case "help": {
        outputContent = (
          <div className="space-y-2 py-1 font-mono text-xs sm:text-sm">
            <p className="text-emerald-400 font-semibold">Available commands:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-1 text-xs">
              {AVAILABLE_COMMANDS.map((cmd) => (
                <div
                  key={cmd.name}
                  onClick={() => runQuickCommand(cmd.name)}
                  className="flex items-center space-x-2 group cursor-pointer hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors"
                >
                  <span className="text-cyan-400 font-bold group-hover:text-cyan-300 w-24 flex-shrink-0">
                    {cmd.name}
                  </span>
                  <span className="text-gray-400">→ {cmd.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Tip: Click any command above or press <span className="text-cyan-300">Tab</span> for autocomplete.
            </p>
          </div>
        );
        break;
      }

      case "about": {
        outputContent = (
          <div className="space-y-2 py-1 font-mono text-xs sm:text-sm">
            <div className="text-cyan-400 text-xs whitespace-pre select-none leading-none">
              ┌────────────────────────────────────────────────────────┐
              <br />
              │                   DEVELOPER PROFILE                    │
              <br />
              ├────────────────────────────────────────────────────────┤
            </div>
            <div className="space-y-1 text-gray-300 pl-2 text-xs">
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">Name:</span> <span className="text-white font-bold">{portfolioData.name || "Lalit Kumar"}</span></p>
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">Role:</span> <span className="text-white">{portfolioData.role || "Software Development Engineer"}</span></p>
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">Focus:</span> <span className="text-white">Data Structures & Algorithms + Full Stack Development</span></p>
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">Location:</span> <span className="text-white">{portfolioData.location}</span></p>
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">Education:</span> <span className="text-white">B.Tech CSE @ Parul Institute of Technology (8.34 CGPA)</span></p>
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">LeetCode:</span> <span className="text-amber-300">349+ Problems Solved (150 Easy, 171 Medium, 28 Hard)</span></p>
              <p><span className="text-cyan-300 font-semibold w-24 inline-block">GitHub:</span> <span className="text-emerald-300">github.com/LalitModi90 (15+ Repositories)</span></p>
            </div>
            <div className="text-cyan-400 text-xs whitespace-pre select-none leading-none">
              └────────────────────────────────────────────────────────┘
            </div>
            <p className="text-gray-300 text-xs leading-relaxed pt-1 pl-2">
              {portfolioData.bio || portfolioData.summary}
            </p>
            <div className="pt-1 pl-2 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => runQuickCommand("skills")}
                className="text-cyan-300 hover:text-cyan-200 underline font-mono"
              >
                ➜ view skills
              </button>
              <button
                onClick={() => runQuickCommand("projects")}
                className="text-emerald-300 hover:text-emerald-200 underline font-mono"
              >
                ➜ view projects
              </button>
            </div>
          </div>
        );
        break;
      }

      case "skills": {
        const { languages, frontend, backend, databases, tools, dsa } = portfolioData.skills;
        outputContent = (
          <div className="space-y-3 py-1 font-mono text-xs sm:text-sm">
            <div className="border-b border-white/10 pb-1">
              <span className="text-amber-300 font-bold">TECHNICAL SKILLS & ARCHITECTURE</span>
            </div>

            {/* Languages */}
            <div className="space-y-1">
              <p className="text-cyan-300 font-semibold">[Languages]</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 pl-3 text-gray-300 text-xs">
                {languages.map((l, i) => (
                  <span key={l}>
                    {i === languages.length - 1 ? "└── " : "├── "}
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Frontend */}
            <div className="space-y-1">
              <p className="text-purple-300 font-semibold">[Frontend]</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 pl-3 text-gray-300 text-xs">
                {frontend.map((f, i) => (
                  <span key={f}>
                    {i === frontend.length - 1 ? "└── " : "├── "}
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Backend & Databases */}
            <div className="space-y-1">
              <p className="text-emerald-300 font-semibold">[Backend & Databases]</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 pl-3 text-gray-300 text-xs">
                {[...backend, ...databases].map((b, i, arr) => (
                  <span key={b}>
                    {i === arr.length - 1 ? "└── " : "├── "}
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools & Problem Solving */}
            <div className="space-y-1">
              <p className="text-rose-300 font-semibold">[CS Fundamentals & Developer Tools]</p>
              <div className="space-y-0.5 pl-3 text-gray-300 text-xs">
                <p>├── Data Structures & Algorithms (349+ Problems Solved on LeetCode)</p>
                <p>├── System Design, OOPs, DBMS, Operating Systems, Computer Networks</p>
                <p>└── Tools: {tools.join(" • ")}</p>
              </div>
            </div>
          </div>
        );
        break;
      }

      case "projects": {
        let displayList: any[] = [];
        if (gitRepos.length > 0) {
          displayList = gitRepos.slice(0, 5);
        } else {
          try {
            setLoadingRepos(true);
            const repos = await fetchGitHubRepos();
            setGitRepos(repos);
            displayList = repos.slice(0, 5);
          } catch {
            displayList = portfolioData.projects;
          } finally {
            setLoadingRepos(false);
          }
        }

        outputContent = (
          <div className="space-y-3 py-1 font-mono text-xs sm:text-sm">
            <div className="border-b border-white/10 pb-1 flex items-center justify-between">
              <span className="text-cyan-300 font-bold">MY PROJECTS (GitHub Repositories)</span>
              <span className="text-[11px] text-gray-400">Total: {displayList.length}</span>
            </div>

            <div className="space-y-3">
              {displayList.map((p, idx) => {
                const title = p.display_name || p.title || p.name;
                const desc = p.description || (Array.isArray(p.desc) ? p.desc[0] : p.desc);
                const githubUrl = p.html_url || p.githubLink || "https://github.com/LalitModi90";
                const liveUrl = p.homepage || p.liveLink;
                const lang = p.language;
                const stars = p.stargazers_count;

                return (
                  <div key={p.id || idx} className="space-y-1">
                    <div className="flex items-center space-x-2 text-white font-semibold">
                      <span className="text-emerald-400">[{String(idx + 1).padStart(2, "0")}]</span>
                      <span>{title}</span>
                      {lang && <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-800/40">[{lang}]</span>}
                      {stars !== undefined && stars > 0 && <span className="text-[10px] text-amber-300">★{stars}</span>}
                    </div>
                    <div className="pl-6 space-y-0.5 text-xs text-gray-300">
                      <p>├── <span className="text-gray-400">Description:</span> {desc}</p>
                      <p className="flex items-center gap-3">
                        <span>└── <span className="text-gray-400">Links:</span></span>
                        <a href={githubUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                          [GitHub Repo ↗]
                        </a>
                        {liveUrl && (
                          <a href={liveUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                            [Live Demo ↗]
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-1 text-[11px] text-gray-400 flex items-center justify-between">
              <span>View all repositories on GitHub:</span>
              <a href={portfolioData.github} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                github.com/LalitModi90 ↗
              </a>
            </div>
          </div>
        );
        break;
      }

      case "github": {
        const ghUrl = portfolioData.github || "https://github.com/LalitModi90";
        outputContent = (
          <div className="space-y-2 py-1 font-mono text-xs sm:text-sm">
            <p className="text-gray-300">GitHub Profile:</p>
            <p className="text-cyan-400">{ghUrl}</p>
            <div className="pt-1">
              <a
                href={ghUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                <span>Open GitHub</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        );
        break;
      }

      case "leetcode": {
        const lcUrl = portfolioData.leetcode || "https://leetcode.com/u/LalitModi90/";
        outputContent = (
          <div className="space-y-2 py-1 font-mono text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 font-bold">LeetCode Profile:</span>
              <span className="text-cyan-300">@LalitModi90</span>
            </div>
            <p className="text-gray-300 text-xs">{lcUrl}</p>
            <div className="space-y-0.5 text-xs text-gray-300 pl-2">
              <p>Problems Solved: <span className="text-white font-bold">349+</span></p>
              <p>├── <span className="text-emerald-400 font-semibold">Easy:</span> 150</p>
              <p>├── <span className="text-amber-400 font-semibold">Medium:</span> 171</p>
              <p>└── <span className="text-rose-400 font-semibold">Hard:</span> 28</p>
            </div>
            <div className="pt-1">
              <a
                href={lcUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                <span>Open LeetCode</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        );
        break;
      }

      case "resume": {
        const resumeUrl = portfolioData.resume || PERSONAL_INFO.resumeUrl;
        if (resumeUrl) {
          outputContent = (
            <div className="space-y-2 py-1 font-mono text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">📄 Resume & CV</span>
              </div>
              <p className="text-gray-300 text-xs">
                Official resume: <span className="text-cyan-300">{resumeUrl}</span>
              </p>
              <div className="flex items-center space-x-3 pt-1">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded text-xs font-mono transition-colors"
                >
                  <span>Open Resume</span>
                  <span>↗</span>
                </a>
                <a
                  href={resumeUrl}
                  download="Lalit_Kumar_Resume.pdf"
                  className="inline-flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded text-xs font-mono transition-colors"
                >
                  <span>Download PDF</span>
                  <span>↓</span>
                </a>
              </div>
            </div>
          );
        } else {
          outputContent = <p className="text-amber-400 py-1">Resume is not configured yet.</p>;
        }
        break;
      }

      case "contact": {
        const { email, phone, location, linkedin } = portfolioData.contact;
        outputContent = (
          <div className="space-y-2 py-1 font-mono text-xs sm:text-sm">
            <div className="border-b border-white/10 pb-1">
              <span className="text-cyan-400 font-bold">CONTACT INFORMATION</span>
            </div>
            <div className="space-y-1 text-xs text-gray-300 pl-2">
              <p>├── <span className="text-gray-400">Email:</span> <a href={`mailto:${email}`} className="text-cyan-300 hover:underline">{email}</a></p>
              <p>├── <span className="text-gray-400">Phone:</span> <a href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">{phone}</a></p>
              <p>├── <span className="text-gray-400">LinkedIn:</span> <a href={linkedin} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">{linkedin}</a></p>
              <p>└── <span className="text-gray-400">Location:</span> <span className="text-white">{location}</span></p>
            </div>
          </div>
        );
        break;
      }

      case "whoami": {
        outputContent = (
          <div className="space-y-1.5 py-1 text-xs sm:text-sm font-mono">
            <p className="text-emerald-400 font-bold text-base">lalit</p>
            <div className="space-y-0.5 text-gray-300 text-xs pl-2">
              <p>Software Development Engineer</p>
              <p>B.Tech CSE @ Parul Institute of Technology (8.34 CGPA)</p>
              <p>Full Stack Developer (Next.js / Node.js / React Native / MongoDB)</p>
              <p>DSA / Problem Solving (349+ Solved on LeetCode)</p>
            </div>
          </div>
        );
        break;
      }

      case "status": {
        outputContent = (
          <div className="space-y-2 py-1 text-xs sm:text-sm font-mono">
            <p className="text-white font-bold">Developer Status</p>
            <div className="flex items-center space-x-2 pl-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span className="text-emerald-300 font-semibold">Available for opportunities</span>
            </div>
            <div className="text-xs text-gray-300 space-y-0.5 pl-2 pt-1">
              <p className="text-gray-400 font-semibold">Focus:</p>
              <p>- Data Structures & Algorithms</p>
              <p>- Full Stack Development</p>
              <p>- Software Engineering</p>
            </div>
          </div>
        );
        break;
      }

      case "neofetch": {
        outputContent = (
          <div className="py-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-black/40 border border-white/10 rounded-xl p-3.5 shadow-inner">
              <div className="text-cyan-400 whitespace-pre font-mono text-[11px] leading-tight select-none flex-shrink-0">
                {NEOFETCH_ASCII}
              </div>
              <div className="space-y-1 text-gray-300 flex-1">
                <div className="pb-1 border-b border-white/10">
                  <span className="text-emerald-400 font-bold text-sm">Lalit Kumar</span>
                  <span className="text-gray-500">@portfolio</span>
                </div>
                <div className="grid grid-cols-1 gap-0.5 pt-1 text-[11px]">
                  <p><span className="text-cyan-300 font-semibold">OS:</span> Developer Portfolio (macOS Tahoe Edition)</p>
                  <p><span className="text-cyan-300 font-semibold">Shell:</span> LalitShell v2.4 (zsh-custom)</p>
                  <p><span className="text-cyan-300 font-semibold">Role:</span> Software Development Engineer</p>
                  <p><span className="text-cyan-300 font-semibold">Stack:</span> MERN / Next.js / React / TypeScript / Java</p>
                  <p><span className="text-cyan-300 font-semibold">Focus:</span> DSA + Full Stack Systems</p>
                  <p><span className="text-cyan-300 font-semibold">LeetCode:</span> 349+ Solved (LalitModi90)</p>
                  <p><span className="text-cyan-300 font-semibold">GitHub:</span> LalitModi90 (15+ Repos)</p>
                  <p><span className="text-cyan-300 font-semibold">Portfolio:</span> Online (Active)</p>
                </div>
                <div className="flex space-x-1.5 pt-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                </div>
              </div>
            </div>
          </div>
        );
        break;
      }

      case "maps":
      case "open maps":
      case "show map": {
        window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: "maps" } }));
        outputContent = (
          <div className="space-y-1 py-1 font-mono text-xs sm:text-sm">
            <p className="text-emerald-400">Opening macOS Maps application...</p>
            <p className="text-gray-400 text-xs">Explore Parul University, Home region, and live geolocation.</p>
          </div>
        );
        break;
      }

      case "university": {
        window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: "maps" } }));
        window.dispatchEvent(new CustomEvent("maps:focusUniversity"));
        outputContent = (
          <div className="space-y-1.5 py-1 font-mono text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-blue-400 font-bold">
              <span>🎓</span>
              <span>Parul University</span>
            </div>
            <div className="text-xs text-gray-300 pl-2 space-y-0.5">
              <p>├── Location: Vadodara, Gujarat, India (391760)</p>
              <p>├── Program: B.Tech Computer Science & Engineering</p>
              <p>├── Coordinates: 22.2887° N, 73.3634° E</p>
              <p>└── Status: Focused in Maps application</p>
            </div>
          </div>
        );
        break;
      }

      case "home": {
        window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: "maps" } }));
        window.dispatchEvent(new CustomEvent("maps:focusHome"));
        outputContent = (
          <div className="space-y-1.5 py-1 font-mono text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <span>🏠</span>
              <span>Home (Deldar, Rajasthan)</span>
            </div>
            <div className="text-xs text-gray-300 pl-2 space-y-0.5">
              <p>├── Location: Deldar, Rajasthan 307801</p>
              <p>├── Coordinates: 25.0202° N, 72.6931° E</p>
              <p>└── Status: Focused in Maps application</p>
            </div>
          </div>
        );
        break;
      }

      case "stay":
      case "residence":
      case "vadodara": {
        window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: "maps" } }));
        window.dispatchEvent(new CustomEvent("maps:focusResidence"));
        outputContent = (
          <div className="space-y-1.5 py-1 font-mono text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span>🏡</span>
              <span>Vadodara Residence</span>
            </div>
            <div className="text-xs text-gray-300 pl-2 space-y-0.5">
              <p>├── Address: A-12, Pangat Park, Waghodia Road, Vadodara, Gujarat 390019</p>
              <p>├── Coordinates: 22.3025° N, 73.2386° E</p>
              <p>└── Status: Focused in Maps application</p>
            </div>
          </div>
        );
        break;
      }

      case "locate me":
      case "locate": {
        window.dispatchEvent(new CustomEvent("desktop:openApp", { detail: { id: "maps" } }));
        window.dispatchEvent(new CustomEvent("maps:locateMe"));
        outputContent = (
          <div className="space-y-1 py-1 font-mono text-xs sm:text-sm">
            <p className="text-emerald-400">Requesting browser geolocation in Maps...</p>
            <p className="text-gray-400 text-xs">Please allow location access in your browser prompt.</p>
          </div>
        );
        break;
      }

      case "clear": {
        setHistory([]);
        setInputVal("");
        return;
      }

      default: {
        outputContent = (
          <div className="space-y-1 py-1 text-sm font-mono">
            <p className="text-rose-400">
              zsh: command not found: {trimmed}
            </p>
            <p className="text-xs text-gray-500">
              Type <span className="text-cyan-300 font-bold">help</span> to view available commands.
            </p>
          </div>
        );
        break;
      }
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        command: trimmed,
        output: outputContent,
      },
    ]);

    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (matchingCommands.length > 0) {
        setInputVal(matchingCommands[0].name);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length === 0 || historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setHistory([]);
      setInputVal("");
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputVal("");
    }
  };

  const runQuickCommand = (cmdName: string) => {
    executeCommand(cmdName);
    focusInput();
  };

  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      className="h-full w-full flex flex-col bg-[#0b0f19]/95 text-gray-200 font-mono text-sm select-text overflow-hidden"
      style={{
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)",
      }}
    >
      {/* Terminal Output Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar"
      >
        {/* Welcome Header */}
        <div className="space-y-3 text-xs sm:text-sm text-gray-300 border-b border-white/10 pb-4">
          <p className="text-gray-400 font-mono">
            Last login: {currentTime || "today"} on ttys000
          </p>

          <div className="text-cyan-400 whitespace-pre font-mono font-bold leading-tight select-none overflow-x-auto text-[11px] sm:text-xs">
            {WELCOME_ASCII}
          </div>

          <div className="space-y-1 pt-1">
            <p className="text-emerald-400 font-semibold text-sm">
              Welcome to Lalit&apos;s Developer Terminal 👋
            </p>
            <p className="text-gray-400 text-xs">
              Type <span className="text-cyan-300 font-bold bg-white/10 px-1 py-0.5 rounded">&quot;help&quot;</span> to see available commands.
            </p>
          </div>
        </div>

        {/* History of executed commands */}
        {history.map((item) => (
          <div key={item.id} className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <span className="text-emerald-400 font-bold">lalit@portfolio</span>
              <span className="text-cyan-400 font-bold">~</span>
              <span className="text-gray-400 font-bold">%</span>
              <span className="text-white font-medium">{item.command}</span>
            </div>
            <div className="pl-2 sm:pl-4 border-l border-cyan-500/20">{item.output}</div>
          </div>
        ))}

        {/* Active Command Input Line */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm pt-1">
          <span className="text-emerald-400 font-bold flex-shrink-0">lalit@portfolio</span>
          <span className="text-cyan-400 font-bold flex-shrink-0">~</span>
          <span className="text-gray-400 font-bold flex-shrink-0">%</span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent outline-none border-none text-white font-mono p-0 m-0 z-10"
            />
            {/* Inline Ghost Suggestion */}
            {topSuggestion && (
              <span className="absolute left-0 pointer-events-none text-gray-500 font-mono select-none z-0">
                <span className="opacity-0">{inputVal}</span>
                {topSuggestion}
              </span>
            )}
          </div>
        </div>

        {/* Command suggestion pills if partial match */}
        {inputVal.trim() && matchingCommands.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pl-6 text-xs animate-fadeIn">
            <span className="text-gray-500 text-[11px] self-center">Suggestions:</span>
            {matchingCommands.map((m) => (
              <button
                key={m.name}
                onClick={() => runQuickCommand(m.name)}
                className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded text-[11px] font-mono transition-colors"
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Quick Action Footer Bar */}
      <div className="border-t border-white/10 bg-black/40 px-3 py-2 flex items-center justify-between text-xs gap-2 flex-shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-gray-500 text-[10px] uppercase font-semibold flex-shrink-0 hidden sm:inline">
            Quick:
          </span>
          {["help", "about", "skills", "projects", "leetcode", "resume", "neofetch", "clear"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => runQuickCommand(cmd)}
              className="bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-500 flex-shrink-0 hidden md:block font-mono">
          <span>Tab: Complete | ↑↓: History | Ctrl+L: Clear</span>
        </div>
      </div>
    </div>
  );
}