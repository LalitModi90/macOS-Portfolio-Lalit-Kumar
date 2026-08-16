export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  reputation: number;
  contestRating?: number;
  contestRanking?: number;
  contestAttended?: number;
  topPercentage?: number;
}

export interface CodeChefStats {
  rating: number;
  stars: string;
  globalRank: number;
  countryRank: number;
}

const LEETCODE_USERNAME = "LalitModi90";
const CODECHEF_USERNAME = "lalitmodi7878";

export async function fetchLeetCodeStats(): Promise<LeetCodeStats> {
  let stats: LeetCodeStats = {
    totalSolved: 349,
    easySolved: 150,
    mediumSolved: 171,
    hardSolved: 28,
    ranking: 142050,
    reputation: 15,
    contestRating: 1520,
    contestRanking: 84500,
    contestAttended: 12,
    topPercentage: 18.5
  };

  // Primary API: leetcode-api-faisalshohag
  try {
    const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${LEETCODE_USERNAME}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.totalSolved === "number" && data.totalSolved > 0) {
        stats.totalSolved = data.totalSolved;
        stats.easySolved = data.easySolved || 0;
        stats.mediumSolved = data.mediumSolved || 0;
        stats.hardSolved = data.hardSolved || 0;
        stats.ranking = data.ranking || 142050;
        stats.reputation = data.reputation || 0;
      }
    }
  } catch {
    // Backup
  }

  // Fetch Contest Details
  try {
    const contestRes = await fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/contest`);
    if (contestRes.ok) {
      const contestData = await contestRes.json();
      if (contestData) {
        if (contestData.contestRating || contestData.rating) {
          stats.contestRating = Math.round(contestData.contestRating || contestData.rating);
        }
        if (contestData.contestGlobalRanking || contestData.globalRanking) {
          stats.contestRanking = contestData.contestGlobalRanking || contestData.globalRanking;
        }
        if (contestData.contestAttend || contestData.attendedContestsCount) {
          stats.contestAttended = contestData.contestAttend || contestData.attendedContestsCount;
        }
        if (contestData.topPercentage) {
          stats.topPercentage = contestData.topPercentage;
        }
      }
    }
  } catch {
    // Ignore error
  }

  return stats;
}

export async function fetchCodeChefStats(): Promise<CodeChefStats> {
  try {
    const res = await fetch(`https://codechef-api.vercel.app/handle/${CODECHEF_USERNAME}`);
    if (res.ok) {
      const data = await res.json();
      const rating = data.currentRating || data.rating || 1006;
      if (rating) {
        return {
          rating: rating,
          stars: data.stars || "1★",
          globalRank: data.globalRank || 4893,
          countryRank: data.countryRank || 3200
        };
      }
    }
  } catch {
    // Fallthrough
  }

  return {
    rating: 1006,
    stars: "1★",
    globalRank: 4893,
    countryRank: 3200
  };
}
