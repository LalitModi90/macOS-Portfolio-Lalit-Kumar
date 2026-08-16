import React, { useState, useEffect } from "react";
import { fetchGitHubRepos, type GitHubRepo } from "~/utils/githubService";

const DEFAULT_REPOS = [
  { name: "Codeyx Workspace (Full-Stack)", path: "LalitModi90/codeyx-web" },
  { name: "Mini ERP CRM Portal", path: "LalitModi90/mini-erp-crm-portal" },
  { name: "StudyNotion (EdTech)", path: "LalitModi90/StudyNotion" },
  { name: "Todo SaaS Application", path: "LalitModi90/Todo-SaaS" },
  { name: "Razorpay Clone", path: "LalitModi90/Razorpay-clone-" },
  { name: "Java Web Project", path: "LalitModi90/JAVA_web_project" }
];

export default function VSCode() {
  const [repoList, setRepoList] = useState<{ name: string; path: string; language?: string | null }[]>(DEFAULT_REPOS);
  const [selectedRepo, setSelectedRepo] = useState(DEFAULT_REPOS[0].path);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadAllRepos() {
      try {
        const repos = await fetchGitHubRepos();
        if (isMounted && repos.length > 0) {
          const dynamicList = repos.map((r: GitHubRepo) => ({
            name: `${r.display_name} ${r.language ? `(${r.language})` : ""}`,
            path: `LalitModi90/${r.name}`,
            language: r.language
          }));

          // Deduplicate if needed
          const uniqueMap = new Map<string, { name: string; path: string; language?: string | null }>();
          dynamicList.forEach((item) => uniqueMap.set(item.path, item));
          DEFAULT_REPOS.forEach((item) => {
            if (!uniqueMap.has(item.path)) {
              uniqueMap.set(item.path, item);
            }
          });

          const finalList = Array.from(uniqueMap.values());
          setRepoList(finalList);
        }
      } catch (err) {
        console.warn("Using default repository list for VSCode:", err);
      } finally {
        if (isMounted) setLoadingRepos(false);
      }
    }

    loadAllRepos();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRepoChange = (path: string) => {
    setSelectedRepo(path);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="size-full flex flex-col bg-[#1e1e1e] text-[#cccccc] font-sans">
      {/* Top VSCode Project Selector Bar */}
      <div className="h-9 bg-[#252526] border-b border-[#333333] px-3 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="i-ph:code-bold text-[#007acc] text-sm flex-shrink-0" />
          <span className="font-semibold text-white/90 flex-shrink-0">Project:</span>
          <select
            value={selectedRepo}
            onChange={(e) => handleRepoChange(e.target.value)}
            className="bg-[#3c3c3c] text-white text-xs px-2.5 py-1 rounded border border-[#555555] outline-none cursor-pointer hover:bg-[#464646] transition-colors truncate max-w-full"
          >
            {repoList.map((repo) => (
              <option key={repo.path} value={repo.path}>
                {repo.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline flex-shrink-0">
            ({repoList.length} public repos)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setKey((prev) => prev + 1)}
            title="Reload Project"
            className="p-1 hover:bg-[#37373d] rounded text-[#cccccc] hover:text-white transition-colors"
          >
            <span className="i-ph:arrow-clockwise text-xs" />
          </button>
          <a
            href={`https://github.com/${selectedRepo}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#007acc] hover:text-[#388bfd] font-medium transition-colors"
          >
            <span>GitHub</span>
            <span className="i-ph:arrow-square-out text-xs" />
          </a>
        </div>
      </div>

      {/* VSCode Web Editor Iframe */}
      <div className="flex-1 w-full h-[calc(100%-36px)] relative bg-[#1e1e1e]">
        <iframe
          key={key}
          className="size-full border-none bg-[#1e1e1e]"
          src={`https://github1s.com/${encodeURIComponent(selectedRepo.replace(/[^a-zA-Z0-9_\-\/]/g, ""))}`}
          title="VSCode Project Viewer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}


