export interface GitHubRepo {
  id: number;
  name: string;
  display_name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  updated_relative: string;
  topics: string[];
  fork: boolean;
  visibility: string;
  is_featured: boolean;
}

const GITHUB_USERNAME = "LalitModi90";
const CACHE_KEY = "github_projects_cache";
const CACHE_TIME_KEY = "github_projects_cache_time";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour Cache

const FEATURED_REPOS = [
  "codeyx-web",
  "mini-erp-crm-portal-frontend",
  "makeappointmenteasy-user-web",
  "codeyx",
  "mini-erp"
];

const EXCLUDED_REPOS = [
  "LalitModi90"
];

export function formatDisplayName(name: string): string {
  if (!name) return "";
  if (name.toLowerCase() === "codeyx-web") return "Codeyx Analytics Platform";
  if (name.toLowerCase() === "mini-erp-crm-portal-frontend" || name.toLowerCase() === "mini-erp") return "Mini ERP CRM Portal";
  if (name.toLowerCase() === "makeappointmenteasy-user-web") return "Make Appointment Easy";

  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatRelativeDate(dateString: string): string {
  if (!dateString) return "Recently updated";
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHours = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSec < 60) return "Updated today";
  if (diffInMin < 60) return `Updated ${diffInMin}m ago`;
  if (diffInHours < 24) return `Updated ${diffInHours}h ago`;
  if (diffInDays === 1) return "Updated yesterday";
  if (diffInDays < 7) return `Updated ${diffInDays} days ago`;
  if (diffInWeeks === 1) return "Updated 1 week ago";
  if (diffInWeeks < 4) return `Updated ${diffInWeeks} weeks ago`;
  if (diffInMonths === 1) return "Updated 1 month ago";
  return `Updated ${diffInMonths} months ago`;
}

export function getLanguageColor(language: string | null): string {
  if (!language) return "#6b7280";
  switch (language.toLowerCase()) {
    case "typescript": return "#3178c6";
    case "javascript": return "#f7df1e";
    case "python": return "#3572A5";
    case "java": return "#b07219";
    case "c++": case "cpp": return "#00599C";
    case "c": return "#a8b9cc";
    case "html": return "#e34c26";
    case "css": return "#563d7c";
    case "vue": return "#41b883";
    case "go": return "#00ADD8";
    case "rust": return "#dea584";
    default: return "#3b82f6";
  }
}

export function getLanguageIcon(language: string | null): string {
  if (!language) return "i-ph:code-bold";
  switch (language.toLowerCase()) {
    case "typescript": case "javascript": return "i-ph:code-bold";
    case "java": case "c++": case "c": return "i-ph:cpu-bold";
    case "python": return "i-ph:terminal-window-bold";
    case "html": case "css": return "i-ph:browser-bold";
    default: return "i-ph:code-bold";
  }
}

export async function fetchGitHubRepos(forceRefresh = false): Promise<GitHubRepo[]> {
  // Check sessionStorage cache unless forced refresh
  if (!forceRefresh && typeof window !== "undefined" && window.sessionStorage) {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
      if (cachedData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < CACHE_TTL_MS) {
          return JSON.parse(cachedData);
        }
      }
    } catch {
      // Ignore cache errors
    }
  }

  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);

  if (response.status === 403) {
    throw new Error("GitHub API rate limit reached. Please try again later.");
  }

  if (!response.ok) {
    throw new Error("Unable to load GitHub projects.");
  }

  const rawRepos: any[] = await response.json();

  // Filter excluded repos & unwanted forks
  const filtered = rawRepos.filter((repo) => {
    if (EXCLUDED_REPOS.includes(repo.name)) return false;
    // Exclude forks unless explicitly featured
    if (repo.fork && !FEATURED_REPOS.includes(repo.name)) return false;
    return true;
  });

  const parsed: GitHubRepo[] = filtered.map((repo) => {
    const isFeatured = FEATURED_REPOS.some(
      (fName) => fName.toLowerCase() === repo.name.toLowerCase()
    );

    return {
      id: repo.id,
      name: repo.name,
      display_name: formatDisplayName(repo.name),
      description: repo.description || `Open-source project by ${GITHUB_USERNAME}.`,
      html_url: repo.html_url,
      homepage: repo.homepage && repo.homepage.trim() !== "" ? repo.homepage.trim() : null,
      language: repo.language,
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      updated_at: repo.updated_at,
      updated_relative: formatRelativeDate(repo.updated_at),
      topics: (repo.topics || []).slice(0, 5),
      fork: repo.fork,
      visibility: repo.visibility || "public",
      is_featured: isFeatured
    };
  });

  // Sort: Featured Repos first, then newest updated, then stars
  parsed.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;

    const dateA = new Date(a.updated_at).getTime();
    const dateB = new Date(b.updated_at).getTime();
    if (dateB !== dateA) return dateB - dateA;

    return b.stargazers_count - a.stargazers_count;
  });

  // Cache result
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch {
      // Ignore cache storage errors
    }
  }

  return parsed;
}

export async function fetchGitHubRepoReadme(repoName: string): Promise<string | null> {
  if (!repoName || typeof repoName !== "string") return null;
  // Strict sanitization: Allow only alphanumeric, dashes, underscores, and dots (valid GitHub repository naming)
  const sanitizedRepo = repoName.trim().replace(/[^a-zA-Z0-9_.-]/g, "");
  if (!sanitizedRepo || sanitizedRepo.includes("..")) return null;

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(sanitizedRepo)}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw" }
    });
    if (response.ok) {
      const readmeText = await response.text();
      return readmeText;
    }
  } catch {
    // Ignore readme fetch error
  }
  return null;
}
