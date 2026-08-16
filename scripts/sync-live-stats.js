import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const LEETCODE_USERNAME = "LalitModi90";
const GITHUB_USERNAME = "LalitModi90";
const CODECHEF_USERNAME = "lalitmodi7878";

async function fetchLeetCodeData() {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        profile {
          ranking
          reputation
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
        topPercentage
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": `https://leetcode.com/${LEETCODE_USERNAME}/`
      },
      body: JSON.stringify({ query, variables: { username: LEETCODE_USERNAME } })
    });

    if (res.ok) {
      const data = await res.json();
      const user = data?.data?.matchedUser;
      if (user) {
        const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
        let total = 395, easy = 155, medium = 207, hard = 33;
        for (const item of acStats) {
          if (item.difficulty === "All") total = item.count;
          if (item.difficulty === "Easy") easy = item.count;
          if (item.difficulty === "Medium") medium = item.count;
          if (item.difficulty === "Hard") hard = item.count;
        }
        const ranking = user.profile?.ranking || 319162;
        return { total, easy, medium, hard, ranking };
      }
    }
  } catch (err) {
    console.warn("LeetCode live sync warning:", err);
  }
  return { total: 395, easy: 155, medium: 207, hard: 33, ranking: 319162 };
}

async function fetchGitHubData() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (res.ok) {
      const data = await res.json();
      return { repos: data.public_repos || 15 };
    }
  } catch { /* empty */ }
  return { repos: 15 };
}

async function syncMarkdown() {
  console.log("Fetching live platform stats for LeetCode, GitHub & CodeChef...");
  const lc = await fetchLeetCodeData();
  const gh = await fetchGitHubData();

  console.log(`[LIVE STATS] LeetCode: ${lc.total} Solved (${lc.easy} Easy, ${lc.medium} Medium, ${lc.hard} Hard) | Global Rank: ${lc.ranking}`);
  console.log(`[LIVE STATS] GitHub Public Repos: ${gh.repos}+`);

  const publicMdPath = path.join(rootDir, "public", "markdown", "about-me.md");
  const distMdPath = path.join(rootDir, "dist", "markdown", "about-me.md");

  const updateFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, "utf-8");

    // Replace LeetCode line dynamically
    const newLcLine = `- **LeetCode**: Solved **${lc.total}+ DSA problems** (${lc.easy} Easy, ${lc.medium} Medium, ${lc.hard} Hard); active competitive programmer focused on algorithmic optimization. Profile: [LeetCode/LalitModi90](https://leetcode.com/u/LalitModi90/)`;
    content = content.replace(/- \*\*LeetCode\*\*: Solved \*\*\d+\+ DSA problems\*\* \(\d+ Easy, \d+ Medium, \d+ Hard\)[^\n]*/g, newLcLine);

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Successfully synced live stats to: ${filePath}`);
  };

  updateFile(publicMdPath);
  updateFile(distMdPath);
}

syncMarkdown();
