import { PERSONAL_INFO, EDUCATION, ACHIEVEMENTS, PROJECTS, ARSENAL_CARDS, CERTIFICATIONS, HOBBIES } from "~/configs/personal";
import user from "~/configs/user";

export interface SiriAction {
  type: "open_app" | "navigate" | "open_url" | "download_resume" | "toggle_dark" | "play_music" | "stop_music" | "close_siri" | "none";
  target?: string;
}

export interface SiriResponse {
  intent: string;
  response: string;
  action: SiriAction | null;
  modelUsed?: string;
}

export const PORTFOLIO_CONTEXT = {
  profile: {
    name: "Lalit Modi (Lalit Kumar)",
    displayName: "Lalit Modi",
    title: "Software Development Engineer (SDE)",
    email: "lalitmodi7878065@gmail.com",
    whatsapp: "+91 7878065017",
    phone: "+91 7878065017",
    location: "Vadodara, Gujarat, India (Origin: Sirohi / Jalore, Rajasthan)",
    summary:
      "Aspiring Software Development Engineer (SDE) with a strong foundation in Data Structures and Algorithms (DSA) and full-stack development. Proficient in building scalable web and mobile applications using the MERN stack, Next.js, and React Native. Solid grasp of OOPS, DBMS, Operating Systems, and Computer Networks.",
    socials: {
      github: "https://github.com/LalitModi90",
      linkedin: "https://www.linkedin.com/in/lalit-modi-874631302/",
      leetcode: "https://leetcode.com/u/LalitModi90/",
      codechef: "https://www.codechef.com/users/lalitmodi7878",
      geeksforgeeks: "https://www.geeksforgeeks.org/profile/lalitmodiog7e?tab=activity",
      instagram: "https://www.instagram.com/mr.lalitmodi90/"
    },
    resumeUrl: "/resume.pdf"
  },
  education: [
    {
      institution: "Parul Institute of Technology, Parul University",
      location: "Vadodara, Gujarat",
      degree: "Bachelor of Technology in Computer Science and Engineering (B.Tech CSE)",
      period: "2023 – 2027 (Expected)",
      cgpa: "8.34 CGPA (6th Semester)",
      status: "Placement Eligible | Zero Active Backlogs | Strong academic record"
    },
    {
      institution: "Mahatma Gandhi Govt School, Jawal",
      location: "Sirohi, Rajasthan",
      degree: "Higher Secondary (12th Grade) – 74.00%",
      period: "2022"
    },
    {
      institution: "Inspire Sr Sec School, Siyana",
      location: "Jalore, Rajasthan",
      degree: "Secondary (10th Grade) – 72.17%",
      period: "2020"
    }
  ],
  codingStats: {
    leetcode: "395+ DSA problems solved on LeetCode (155 Easy, 207 Medium, 33 Hard); Profile: LalitModi90",
    codechef: "1006+ Rating; Global Rank 4893 in Starters Contest; Profile: lalitmodi7878",
    github: "15+ open-source and full-stack repositories on GitHub (@LalitModi90)",
    geeksforgeeks: "Active problem solver (lalitmodiog7e)"
  },
  projects: [
    {
      title: "Codeyx",
      category: "Full Stack / Developer Tools",
      subtitle: "Competitive Programming Analytics Platform",
      impact: "21 active users across institutions",
      description:
        "Full-stack analytics platform syncing data in real-time from LeetCode, CodeChef, and GitHub. Engineered with Clerk authentication, rate-limiting, CORS hardening, and an AI-powered resume builder.",
      techs: ["Next.js", "Node.js", "MongoDB", "Clerk", "Tailwind CSS"],
      year: "2026",
      liveLink: "https://codeyx-web.vercel.app/",
      githubLink: "https://github.com/LalitModi90"
    },
    {
      title: "Mini ERP CRM Portal",
      category: "Full Stack",
      subtitle: "Business Management System",
      description:
        "Comprehensive ERP & CRM portal managing business operations, lead tracking, and customer records with analytics dashboard and role-based access permissions.",
      techs: ["React", "Node.js", "Express.js", "MongoDB"],
      year: "2026",
      liveLink: "https://mini-erp-crm-portal-frontend.vercel.app/",
      githubLink: "https://github.com/LalitModi90"
    },
    {
      title: "Make Appointment Easy",
      category: "Full Stack",
      subtitle: "Service Booking Platform",
      impact: "60% faster appointment scheduling; 500+ concurrent requests handled",
      description:
        "Full-stack booking system reducing appointment scheduling time by 60% for service providers with role-based access control (RBAC).",
      techs: ["Next.js", "MongoDB", "Express.js", "Tailwind CSS"],
      year: "2025",
      liveLink: "https://makeappointmenteasy-user-web.vercel.app/",
      githubLink: "https://github.com/LalitModi90"
    },
    {
      title: "Java Enterprise Core Banking System",
      category: "Systems & Backend",
      subtitle: "Secure Banking Engine",
      description:
        "Engineered an Object-Oriented Java banking application implementing ACID compliance, transaction logging, JDBC, and multithreading.",
      techs: ["Java", "OOPs", "JDBC", "MySQL", "Data Structures"],
      year: "2024"
    },
    {
      title: "Java Multi-threaded Console Management System",
      category: "Systems",
      subtitle: "High-Performance Concurrency Engine",
      description:
        "Concurrent Java application handling multi-threaded data processing, custom file serialization, and custom data structures.",
      techs: ["Java", "Multithreading", "Algorithms", "File I/O"],
      year: "2024"
    }
  ],
  skills: {
    languages: ["JavaScript (ES6+)", "TypeScript", "Java", "C", "SQL"],
    csFundamentals: ["Data Structures & Algorithms (DSA)", "OOPs", "DBMS", "Operating Systems", "Computer Networks"],
    frontend: ["React.js", "Next.js", "React Native", "Expo", "HTML5", "CSS3", "Tailwind CSS"],
    backend: ["Node.js", "Express.js", "MongoDB", "Supabase", "Neo4j", "Firebase", "REST APIs"],
    tools: ["Git", "GitHub", "VS Code", "Postman", "Vercel", "Vite", "Clerk", "JWT"]
  },
  certifications: [
    "Elite: Computer Networks | NPTEL (IIT Kharagpur) (2024)",
    "Dynamic Programming Camp | AlgoUniversity (2024)",
    "AI Fundamentals | IBM SkillsBuild / Cisco (2024)",
    "Java Skill Certificate | HackerRank (2024)",
    "MCSA: Machine Learning | Microsoft Certified (2023)",
    "Java Developer Certification | Prashant Sir Coding (2023)"
  ]
};

/**
 * Detects whether a query is in Gujarati.
 */
export function isGujaratiQuery(text: string): boolean {
  const t = (text || "").toLowerCase();
  return (
    /\b(shu|su|chhe|che|chho|cho|tamne|tame|kem|kemcho|kemchho|batavo|batav|aapo|kare|joiye|nathi|karyu|karya|mate|ane|pan|kai|kayu|kyathi|ketla|gujaratinu|maro|mari|maru|tamaro|tamari|tamaru|bhai|vishe|dikhavo)\b/i.test(
      t
    ) ||
    t.includes("kon chhe") ||
    t.includes("shu chhe") ||
    t.includes("su chhe") ||
    t.includes("kem chho") ||
    t.includes("kem cho") ||
    t.includes("parul ma") ||
    t.includes("vadodara ma") ||
    t.includes("ketla question")
  );
}

/**
 * Detects whether a query is in Hindi / Hinglish.
 */
export function isHindiQuery(text: string): boolean {
  const t = (text || "").toLowerCase();
  return (
    /\b(kya|kaun|kon|kisme|kaha|kahan|kaise|batao|btao|kholo|dikhao|padhai|bare|baare|hai|hain|kiya|kiye|hoga|kare|karu|kar|karo|mera|meri|mere|mujhe|tum|aap|aapka|bhai|chup|kuch|suno|kardo|chal|chalo|jana|dekhna|kitna|kitne|bhi|sab|karega)\b/i.test(
      t
    ) ||
    t.includes("ke baare") ||
    t.includes("ke bare") ||
    t.includes("kya hai") ||
    t.includes("kaise hai") ||
    t.includes("kaha se") ||
    t.includes("kitne question") ||
    t.includes("bata do") ||
    t.includes("dikha do")
  );
}

/**
 * Advanced noise-filtering speech normalizer:
 * Cleans background acoustic artifacts, filler words, and phonetic variations in noisy environments.
 */
export function normalizeVoiceQuery(raw: string): string {
  let q = (raw || "").toLowerCase().trim();

  // 1. Strip acoustic noise filler words and conversational padding
  q = q.replace(/^[,\.\s\-_!]+/g, "").replace(/[,\.\s\-_!]+$/g, "");
  q = q.replace(/\b(umm|um|uh|uhh|ahh|ah|er|hmm|hmmm|shh|shhh|oh|ohh|huh|eh)\b/gi, " ");
  q = q.replace(/\b(hey\s*siri|ok\s*siri|hi\s*siri|siri\s*please|siri\s*bhai|siri\s*suno|siri\s*kholo)\b/gi, " ");
  q = q.replace(/\b(can\s*you\s*please|could\s*you|please|plz|zara|kripya)\b/gi, " ");

  // 2. LeetCode / DSA phonetic variations in noisy audio
  q = q.replace(/\b(lead\s*code|leadcode|leet\s*code|late\s*code|lite\s*code|lead\s*cod|leet\s*cod|lead\s*core|read\s*code|neat\s*code|lit\s*code|leet|leetcode)\b/g, "leetcode");

  // 3. Spotify / Music phonetic variations in noisy audio
  q = q.replace(/\b(spot\s*if\s*i|spot\s*if\s*y|spot\s*ify|spoty|spotifi|potify|spotyfy|spotifyy|play\s*song|play\s*songs|gana\s*bajao|gana\s*baja|gaana\s*chalao|music\s*play)\b/g, "spotify");

  // 4. Terminal / CLI variations in noisy audio
  q = q.replace(/\b(termnl|trminal|tarminl|termenal|term\s*in\s*al|terminl|cli|command\s*line|bash|shell)\b/g, "terminal");

  // 5. Codeyx project variations in noisy audio
  q = q.replace(/\b(cotex|codex|code\s*x|codey\s*x|kortex|codec|cortex|kodic|code\s*xx)\b/g, "codeyx");

  // 6. Projects variations in noisy audio
  q = q.replace(/\b(porject|projct|projekts|prject|projectz|all\s*projects|show\s*work|portfolio\s*work)\b/g, "projects");

  // 7. Resume / CV variations in noisy audio
  q = q.replace(/\b(resum|rezume|rezoom|resumee|curriculum\s*vitae|bio\s*data|biodata|cv\s*download|get\s*resume)\b/g, "resume");

  // 8. CodeChef variations in noisy audio
  q = q.replace(/\b(code\s*chef|cold\s*chef|coat\s*chef|gold\s*chef|kot\s*chef|codchef)\b/g, "codechef");

  // 9. Mail / Email variations in noisy audio
  q = q.replace(/\b(e\s*mail|g\s*mail|emall|mal|gmal|gmale|inbox|contact\s*lalit|contact\s*mail)\b/g, "mail");

  // 10. Make Appointment Easy variations
  q = q.replace(/\b(make\s*appointment\s*easy|appointment\s*easy|make\s*appointment|doctor\s*app|appoint\s*easy)\b/g, "appointment");

  // 11. Parul University variations
  q = q.replace(/\b(paraul|pearl\s*university|parul\s*uni|parul\s*college|parul\s*univ)\b/g, "parul university");

  // 12. App / Tool variations
  q = q.replace(/\b(vs\s*code|visual\s*studio\s*code|v\s*s\s*code)\b/g, "vscode");
  q = q.replace(/\b(face\s*time|facetim)\b/g, "facetime");
  q = q.replace(/\b(whats\s*app|what\s*app|watssap)\b/g, "whatsapp");
  q = q.replace(/\b(git\s*hub|git\s*up|git\s*hubb)\b/g, "github");
  q = q.replace(/\b(calclator|calculatr|calc|hisab)\b/g, "calculator");

  return q.replace(/\s+/g, " ").trim();
}

/**
 * Strict Noise & Meaningful Command Classifier:
 * Determines if recognized text in a noisy room is a real command vs random acoustic noise.
 */
export function isMeaningfulUserCommand(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.toLowerCase().trim().replace(/^[,\.\s\-_!]+/g, "").replace(/[,\.\s\-_!]+$/g, "");

  // 1. Length & character validity check
  if (clean.length < 2) return false;
  if (/^(.)\1+$/.test(clean) && !["hi", "ok"].includes(clean)) return false;

  // 2. Reject isolated acoustic noise words & background filler chatter
  const NOISE_FILLERS = new Set([
    "um", "umm", "uh", "uhh", "ah", "ahh", "er", "hmm", "hmmm", "oh", "ohh",
    "shh", "shhh", "the", "a", "an", "so", "and", "or", "to", "of", "in", "on",
    "click", "tap", "sound", "testing", "micro", "mic", "huh", "eh"
  ]);

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1 && NOISE_FILLERS.has(words[0])) {
    return false;
  }
  if (words.every((w) => NOISE_FILLERS.has(w))) {
    return false;
  }

  // 3. Known command / intent keywords (English, Hindi, Hinglish, Gujarati)
  const COMMAND_SIGNALS = [
    // Greetings & Core Actions
    "hi", "hello", "hey", "namaste", "kem cho", "kemcho", "suno", "sun", "bhai", "oye",
    "stop", "ruk", "ruko", "bas", "wait", "quiet", "cancel", "shut up", "chup", "band",
    "kholo", "open", "show", "dikhao", "batao", "play", "bajao", "gana", "song", "music",
    "close", "exit", "band karo", "theme", "dark", "light", "download", "resume",
    // Questions & Inquiries
    "who", "what", "how", "why", "when", "where", "which",
    "kya", "kaun", "kaise", "kaha", "kahan", "kitna", "kitne", "shu", "su", "kem", "kon",
    "tell", "explain", "help", "about", "skills", "projects", "education", "experience",
    "codeyx", "leetcode", "codechef", "github", "parul", "lalit", "modi", "contact",
    "joke", "react", "nextjs", "java", "dsa", "javascript", "spotify", "terminal", "mail",
    "abee", "abe", "fuck"
  ];

  const hasCommandSignal = COMMAND_SIGNALS.some((sig) => clean.includes(sig));
  if (hasCommandSignal) return true;

  // 4. Coherent sentence structure check in noisy audio:
  if (words.length >= 3) return true;
  if (words.length === 2 && words[0].length >= 3 && words[1].length >= 3) return true;

  return false;
}

/**
 * Robust local intent matcher for instant zero-latency responses grounded strictly in Know Me / About Me data.
 * Supports natural English, Gujarati, Hindi, and Hinglish variations.
 */
export function resolveLocalIntent(
  rawQuery: string,
  _history: Array<{ role: string; content: string }> = []
): SiriResponse | null {
  if (!rawQuery) return null;
  const raw = rawQuery.toLowerCase().trim();
  const query = normalizeVoiceQuery(raw);
  const gujarati = isGujaratiQuery(rawQuery);
  const hindi = !gujarati && isHindiQuery(rawQuery);

  // 1. STOP SPEAKING / STOP COMMANDS
  if (
    query === "stop" ||
    query === "stop speaking" ||
    query === "shut up" ||
    query === "enough" ||
    query === "quiet" ||
    query === "chup" ||
    query === "chup ho jao" ||
    query === "ruk jao" ||
    query === "bas" ||
    query.startsWith("stop ")
  ) {
    return {
      intent: "STOP_SPEAKING",
      response: gujarati ? "Ubi rahi gayi." : hindi ? "Ruk gayi." : "Stopped.",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  // 2. CLOSE SIRI / GO HOME / DESKTOP
  if (
    query.includes("close siri") ||
    query.includes("band karo siri") ||
    query.includes("exit siri") ||
    query.includes("dismiss siri") ||
    query === "bye" ||
    query === "goodbye" ||
    query === "alvida" ||
    query === "see you"
  ) {
    return {
      intent: "CLOSE_SIRI",
      response: gujarati
        ? "Aavjo! Biju kai joiye to batavjo."
        : hindi
          ? "Alvida! Agar kuch aur dekhna ho toh batana."
          : "Goodbye! Let me know if you need anything else.",
      action: { type: "close_siri" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (
    query.includes("go home") ||
    query.includes("home pe jao") ||
    query.includes("home screen") ||
    query.includes("desktop pe jao") ||
    query.includes("show desktop") ||
    query.includes("minimize all")
  ) {
    return {
      intent: "GO_HOME",
      response: gujarati
        ? "Desktop home screen par jaiye chhiye."
        : hindi
          ? "Desktop home screen par ja rahe hain."
          : "Heading back to the desktop home screen.",
      action: { type: "navigate", target: "home" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 3. GREETINGS & SMALL TALK
  if (
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query === "namaste" ||
    query === "kem chho" ||
    query === "kem cho" ||
    query === "kemcho" ||
    query === "kemchho" ||
    query === "hola" ||
    query === "siri" ||
    query === "hey siri" ||
    query.startsWith("hello siri") ||
    query.startsWith("hey siri") ||
    query.includes("good morning") ||
    query.includes("good afternoon") ||
    query.includes("good evening")
  ) {
    return {
      intent: "GREETING",
      response: gujarati
        ? "Namaste! Hu Siri chhu, Lalit Modi ni portfolio assistant. Tame Lalit na LeetCode stats, Codeyx project, skills, ke resume vishe puchhi shako chho."
        : hindi
          ? "Namaste! Main Siri hoon, Lalit Modi ki portfolio assistant. Aap Lalit ke LeetCode stats, Codeyx project, skills, ya resume ke baare me pooch sakte hain."
          : "Hello! I'm Siri, your assistant for Lalit Modi's portfolio. You can ask me about his LeetCode stats, Codeyx project, skills, education, or download his resume.",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  if (
    query.includes("kya kar rahi ho") ||
    query.includes("kya kar rahe ho") ||
    query.includes("what are you doing") ||
    query.includes("kya kar sakti ho") ||
    query.includes("kya kar sakte ho") ||
    query.includes("what can you do") ||
    query.includes("kya kar sakti hai") ||
    query.includes("kya kar sakta hai") ||
    query.includes("shu karo chho") ||
    query.includes("shu kari shako chho")
  ) {
    return {
      intent: "WHAT_ARE_YOU_DOING",
      response: gujarati
        ? "Hu Lalit Modi ni portfolio AI assistant chhu! Hu tamne Lalit na projects (Codeyx, Mini ERP), 349+ LeetCode stats, skills, ane resume jova ma madad kari shaku chhu."
        : hindi
          ? "Main Lalit Modi ki portfolio AI assistant hoon! Main aapki Lalit ke projects (Codeyx, Mini ERP), 349+ LeetCode stats, skills, aur resume explore karne me madad kar rahi hoon."
          : "I am Siri, Lalit Modi's portfolio AI assistant! I can help you explore Lalit's projects (like Codeyx), check his 349+ LeetCode stats, or download his resume.",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  if (
    query.includes("tum kaun ho") ||
    query.includes("aap kaun ho") ||
    query.includes("tu kaun hai") ||
    query.includes("who are you") ||
    query.includes("who is siri") ||
    query.includes("tame kon chho") ||
    query.includes("kon chhe siri") ||
    query.includes("introduce yourself") ||
    query.includes("apna intro do")
  ) {
    return {
      intent: "WHO_ARE_YOU",
      response: gujarati
        ? "Hu Siri chhu, Lalit Modi ni personal AI portfolio assistant. Hu Lalit na projects, coding stats, education, ane resume ma tamne navigate karavish."
        : hindi
          ? "Main Siri hoon, Lalit Modi ki personal AI portfolio assistant! Main Lalit ke projects, coding stats, education, aur resume me aapki madad karti hoon."
          : "I am Siri, Lalit Modi's personal AI portfolio assistant. I can guide you through Lalit's projects, coding stats, education, and resume.",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  if (
    query.includes("how are you") ||
    query.includes("kaise ho") ||
    query.includes("kya haal hai") ||
    query.includes("kem chho") ||
    query.includes("kem cho") ||
    query.includes("how's it going") ||
    query.includes("sab badhiya") ||
    query.includes("maza ma")
  ) {
    return {
      intent: "HOW_ARE_YOU",
      response: gujarati
        ? "Hu ekdam maza ma chhu! Lalit Modi na projects, 349+ LeetCode problems, ane skills explore karva mate taiyar chhu. Tame shu jova mango chho?"
        : hindi
          ? "Main bilkul badhiya hoon! Lalit Modi ke projects, 349+ LeetCode problems, ya skills explore karne ke liye taiyar hoon. Aap kya dekhna chahenge?"
          : "I'm doing fantastic, thank you! Ready to help you explore Lalit's projects, skills, and 349+ LeetCode achievements. What would you like to see?",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  if (
    query.includes("thank you") ||
    query.includes("thanks") ||
    query.includes("shukriya") ||
    query.includes("dhanyawad") ||
    query.includes("aabhar") ||
    query.includes("great job") ||
    query.includes("awesome")
  ) {
    return {
      intent: "THANK_YOU",
      response: gujarati
        ? "Tamaro aabhar! Biju kai pan janvu hoy to batavjo."
        : hindi
          ? "Aapka swagat hai! Agar kuch aur janna ho toh zaroor batayein."
          : "You're very welcome! Let me know if you want to explore any other part of Lalit's portfolio.",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  // 4. LEETCODE & COMPETITIVE PROGRAMMING / DSA STATS
  if (
    query.includes("leetcode") ||
    query.includes("codechef") ||
    query.includes("dsa") ||
    query.includes("competitive programming") ||
    query.includes("coding stats") ||
    query.includes("coding profile") ||
    query.includes("problem solving") ||
    query.includes("problems solved") ||
    query.includes("how many problems") ||
    query.includes("how many questions") ||
    query.includes("dsa question") ||
    query.includes("coding score") ||
    query.includes("contest rank") ||
    query.includes("questions solved") ||
    query.includes("coding rank") ||
    query.includes("dsa solved") ||
    query.includes("starters contest")
  ) {
    return {
      intent: "CODING_STATS",
      response: gujarati
        ? "Lalit Modi e LeetCode par 349 thi vadhu DSA problems solve karya chhe (150 Easy, 171 Medium, ane 28 Hard). CodeChef par temnu 1006+ rating chhe ane Starters Contest ma Global Rank 4893 chhe."
        : hindi
          ? "Lalit Modi ne LeetCode par 349 se zyada DSA problems solve kiye hain (150 Easy, 171 Medium, aur 28 Hard). CodeChef par unka rating 1006+ hai aur Starters Contest me Global Rank 4893 hai."
          : "Lalit Modi has solved over 349 DSA problems on LeetCode (150 Easy, 171 Medium, 28 Hard). On CodeChef, he holds a 1006+ rating with Global Rank 4893 in Starters Contest.",
      action: { type: "open_url", target: "https://leetcode.com/u/LalitModi90/" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 5. RESUME / CV / DOWNLOAD
  if (
    query.includes("resume") ||
    query.includes("cv") ||
    query.includes("biodata") ||
    query.includes("download resume") ||
    query.includes("open resume") ||
    query.includes("resume kholo") ||
    query.includes("resume dikhao") ||
    query.includes("get resume") ||
    query.includes("resume pdf") ||
    query.includes("download cv")
  ) {
    return {
      intent: "RESUME",
      response: gujarati
        ? "Aa Lalit Modi nu official resume PDF chhe. Tame ahi thi joi ke download kari shako chho."
        : hindi
          ? "Yeh raha Lalit Modi ka official resume PDF. Aap ise yahan se dekh ya download kar sakte hain."
          : "Here is Lalit Modi's official resume PDF. You can view or download it directly.",
      action: { type: "download_resume", target: "/resume.pdf" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 6. SPECIFIC PROJECTS:
  // (A) Codeyx
  if (
    query.includes("codeyx") ||
    query.includes("cp platform") ||
    query.includes("analytics platform")
  ) {
    if (query.includes("open") || query.includes("kholo") || query.includes("launch") || query.includes("live")) {
      return {
        intent: "OPEN_CODEYX",
        response: gujarati
          ? "Codeyx ni live web application kholiye chhiye (codeyx-web.vercel.app)."
          : hindi
            ? "Codeyx ki live web application khol rahe hain (codeyx-web.vercel.app)."
            : "Opening the live Codeyx platform at codeyx-web.vercel.app.",
        action: { type: "open_url", target: "https://codeyx-web.vercel.app/" },
        modelUsed: "Portfolio AI Core"
      };
    }
    return {
      intent: "ABOUT_CODEYX",
      response: gujarati
        ? "Codeyx Lalit nu CP analytics platform chhe je LeetCode, CodeChef ane GitHub no progress sync kare chhe. Isma Clerk auth ane AI resume builder chhe, je 21 active users ne serve kare chhe."
        : hindi
          ? "Codeyx Lalit ka CP analytics platform hai jo LeetCode, CodeChef aur GitHub ka progress sync karta hai. Isme Clerk auth, rate-limiting aur AI resume builder hai, jo 21 active users serve kar raha hai."
          : "Codeyx is Lalit's CP analytics platform that syncs real-time LeetCode, CodeChef, and GitHub data with Clerk auth, rate-limiting, and an AI resume builder, serving 21 active users.",
      action: { type: "open_url", target: "https://codeyx-web.vercel.app/" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // (B) Make Appointment Easy
  if (
    query.includes("appointment") ||
    query.includes("booking app") ||
    query.includes("scheduling app") ||
    query.includes("doctor appointment")
  ) {
    return {
      intent: "ABOUT_APPOINTMENT",
      response: gujarati
        ? "Make Appointment Easy ek full-stack booking system chhe je scheduling time 60% reduce kare chhe ane 500+ simultaneous requests handle kari shake chhe."
        : hindi
          ? "Make Appointment Easy ek full-stack booking system hai jo scheduling time ko 60% reduce karta hai aur 500+ simultaneous requests handle kar sakta hai."
          : "Make Appointment Easy is a full-stack booking system built with Next.js and MongoDB. It reduces scheduling time by 60% and handles 500+ concurrent requests.",
      action: { type: "open_url", target: "https://makeappointmenteasy-user-web.vercel.app/" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // (C) Mini ERP CRM Portal
  if (
    query.includes("mini erp") ||
    query.includes("erp") ||
    query.includes("crm") ||
    query.includes("portal") ||
    query.includes("lead tracking")
  ) {
    return {
      intent: "ABOUT_MINI_ERP",
      response: gujarati
        ? "Mini ERP CRM Portal ek complete business management application chhe jema analytics dashboard, lead tracking, ane role-based access permissions chhe."
        : hindi
          ? "Mini ERP CRM Portal ek complete business management application hai jisme analytics dashboard, lead tracking, aur role-based access permissions hain."
          : "Mini ERP CRM Portal is a full-stack business management application with an analytics dashboard, lead tracking, and role-based permissions.",
      action: { type: "open_url", target: "https://mini-erp-crm-portal-frontend.vercel.app/" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // (D) Java Banking / Systems
  if (
    query.includes("banking") ||
    query.includes("java project") ||
    query.includes("core banking") ||
    query.includes("bank system") ||
    query.includes("multithread")
  ) {
    return {
      intent: "ABOUT_JAVA_BANKING",
      response: gujarati
        ? "Lalit e ek Java Enterprise Core Banking System banavyu chhe jema ACID compliance, JDBC, ane multithreaded transactions implement karya chhe."
        : hindi
          ? "Lalit ne ek Java Enterprise Core Banking System banaya hai jisme ACID compliance, JDBC, aur multithreaded transactions implement kiye gaye hain."
          : "Lalit developed a Java Enterprise Core Banking System implementing ACID compliance, transaction logging, JDBC, and multithreaded operations.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // (E) All Projects List
  if (
    query.includes("project") ||
    query.includes("projects") ||
    query.includes("kya banaya") ||
    query.includes("shu banavyu") ||
    query.includes("work sample") ||
    query.includes("built")
  ) {
    return {
      intent: "SHOW_PROJECTS",
      response: gujarati
        ? "Lalit Modi na top projects ma Codeyx (CP analytics), Make Appointment Easy (service booking), Mini ERP CRM, ane Java Core Banking System samavisht chhe."
        : hindi
          ? "Lalit Modi ke top projects me Codeyx (CP analytics), Make Appointment Easy (service booking), Mini ERP CRM, aur Java Core Banking System shaamil hain."
          : "Lalit Modi's top projects include Codeyx (CP analytics platform), Make Appointment Easy (60% faster booking), Mini ERP CRM Portal, and a Java Core Banking System.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 7. SKILLS / TECHNOLOGIES / TECH STACK
  if (
    query.includes("skill") ||
    query.includes("skills") ||
    query.includes("technology") ||
    query.includes("technologies") ||
    query.includes("tech stack") ||
    query.includes("language") ||
    query.includes("languages") ||
    query.includes("tools") ||
    query.includes("framework") ||
    query.includes("react") ||
    query.includes("node") ||
    query.includes("nextjs") ||
    query.includes("typescript") ||
    query.includes("javascript") ||
    query.includes("frontend") ||
    query.includes("backend") ||
    query.includes("database") ||
    query.includes("mongodb") ||
    query.includes("sql") ||
    query.includes("kya aata hai") ||
    query.includes("shu aavde chhe")
  ) {
    return {
      intent: "SHOW_SKILLS",
      response: gujarati
        ? "Lalit Modi na technical skills ma JavaScript, TypeScript, Java, C, SQL, React, Next.js, Node.js, Express, MongoDB ane strong DSA fundamentals chhe."
        : hindi
          ? "Lalit Modi ke technical skills me JavaScript, TypeScript, Java, C, SQL, React, Next.js, Node.js, Express, MongoDB aur strong DSA fundamentals shaamil hain."
          : "Lalit Modi's technical skills include JavaScript, TypeScript, Java, C, SQL, React, Next.js, Node.js, Express, MongoDB, REST APIs, and strong DSA fundamentals.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 8. EDUCATION / COLLEGE / PARUL UNIVERSITY
  if (
    query.includes("education") ||
    query.includes("college") ||
    query.includes("degree") ||
    query.includes("university") ||
    query.includes("parul") ||
    query.includes("cgpa") ||
    query.includes("gpa") ||
    query.includes("marks") ||
    query.includes("btech") ||
    query.includes("b.tech") ||
    query.includes("cse") ||
    query.includes("computer science") ||
    query.includes("graduation") ||
    query.includes("padhai") ||
    query.includes("studies") ||
    query.includes("study")
  ) {
    return {
      intent: "EDUCATION",
      response: gujarati
        ? "Lalit Modi Parul Institute of Technology, Vadodara thi B.Tech Computer Science (2023–2027) kare chhe. Temno current CGPA 8.34 chhe koi pan active backlog vagar."
        : hindi
          ? "Lalit Modi Parul Institute of Technology, Vadodara se B.Tech Computer Science (2023–2027) kar rahe hain. Unka current CGPA 8.34 hai bina kisi active backlog ke."
          : "Lalit Modi is pursuing B.Tech in CSE at Parul Institute of Technology (2023–2027) with an 8.34 CGPA, zero active backlogs, and full placement eligibility.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 9. ACHIEVEMENTS & CERTIFICATIONS
  if (
    query.includes("achievement") ||
    query.includes("achievements") ||
    query.includes("award") ||
    query.includes("awards") ||
    query.includes("certificate") ||
    query.includes("certificates") ||
    query.includes("certification") ||
    query.includes("certifications") ||
    query.includes("accomplishment")
  ) {
    return {
      intent: "ACHIEVEMENTS",
      response: gujarati
        ? "Lalit e CodeChef Starters Contest ma Global Rank 4893 melavi chhe, LeetCode par 349+ DSA problems solve karya chhe, ane IIT Kharagpur NPTEL Elite certification prapt karyu chhe."
        : hindi
          ? "Lalit ne CodeChef Starters Contest me Global Rank 4893 haasil ki hai, LeetCode par 349+ DSA problems solve kiye hain, aur IIT Kharagpur NPTEL Elite certification prapt kiya hai."
          : "Lalit achieved Global Rank 4893 in CodeChef Starters Contest, solved 349+ LeetCode DSA problems, and holds IIT Kharagpur NPTEL Elite Computer Networks certification.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 10. CONTACT / EMAIL / WHATSAPP / HIRE
  if (
    query.includes("contact") ||
    query.includes("email") ||
    query.includes("phone") ||
    query.includes("whatsapp") ||
    query.includes("reach out") ||
    query.includes("hire") ||
    query.includes("connect") ||
    query.includes("kaise contact kare") ||
    query.includes("kem contact karvo") ||
    query.includes("number") ||
    query.includes("call")
  ) {
    return {
      intent: "CONTACT",
      response: gujarati
        ? "Tame Lalit Modi sathe WhatsApp par +91 7878065017 athva email par lalitmodi7878065@gmail.com par direct contact kari shako chho."
        : hindi
          ? "Aap Lalit Modi se WhatsApp par +91 7878065017 ya email par lalitmodi7878065@gmail.com par direct contact kar sakte hain."
          : "You can reach Lalit Modi on WhatsApp at +91 7878065017, email at lalitmodi7878065@gmail.com, or connect on LinkedIn and GitHub.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 11. ABOUT LALIT / WHO IS LALIT MODI / INTRODUCE
  if (
    query.includes("find about me") ||
    query.includes("know about me") ||
    query.includes("tell me about this person") ||
    query.includes("who is lalit") ||
    query.includes("tell me about lalit") ||
    query.includes("what is this portfolio about") ||
    query.includes("summary of this portfolio") ||
    query.includes("about you") ||
    query.includes("about me") ||
    query.includes("who are you") ||
    query.includes("mere baare mein kya pata hai") ||
    query.includes("mere baare mein batao") ||
    query.includes("mere bare mein batao") ||
    query.includes("mere bare mein kya dekha") ||
    query.includes("mere baare mein kya dekha") ||
    query.includes("profile ke baare mein batao") ||
    query.includes("kya dekha mere profile me") ||
    query.includes("introduce") ||
    query.includes("introduction") ||
    query.includes("overview") ||
    query.includes("bio") ||
    query.includes("who built you") ||
    query.includes("who made you") ||
    query.includes("creator") ||
    query.includes("lalit modi") ||
    query.includes("kon chhe") ||
    query.includes("kon che")
  ) {
    return {
      intent: "ABOUT_USER",
      response: gujarati
        ? "Lalit Modi ek Software Development Engineer ane Parul University na B.Tech CSE student chhe (8.34 CGPA). Te MERN stack, Next.js, Java, ane Data Structures ma expert chhe, ane temne Codeyx ane Make Appointment Easy jeva scalable platforms banavya chhe."
        : hindi
          ? "Lalit Modi ek Software Development Engineer aur Parul University ke B.Tech CSE student hain (8.34 CGPA). Wo MERN stack, Next.js, Java, aur Data Structures me expert hain, aur unhone Codeyx aur Make Appointment Easy jaise scalable platforms banaye hain."
          : "Lalit Modi is a Software Development Engineer and CSE student at Parul University with an 8.34 CGPA. He specializes in MERN stack, Next.js, Java, and scalable backend systems, with 349+ LeetCode DSA problems solved.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 12. GITHUB & SOCIALS
  if (query.includes("github") || query.includes("git repo") || query.includes("repositories")) {
    return {
      intent: "OPEN_GITHUB",
      response: gujarati
        ? "Lalit Modi nu GitHub profile (@LalitModi90) kholiye chhiye jema 15+ open-source repos chhe."
        : hindi
          ? "Lalit Modi ka GitHub profile (@LalitModi90) khol rahe hain jisme 15+ open-source repos hain."
          : "Opening Lalit Modi's GitHub profile (@LalitModi90) with 15+ open-source repositories.",
      action: { type: "open_url", target: "https://github.com/LalitModi90" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("linkedin") || query.includes("social") || query.includes("socials")) {
    return {
      intent: "OPEN_LINKEDIN",
      response: gujarati
        ? "Lalit Modi nu LinkedIn profile kholiye chhiye."
        : hindi
          ? "Lalit Modi ka LinkedIn profile khol rahe hain."
          : "Opening Lalit Modi's LinkedIn profile to connect professionally.",
      action: { type: "open_url", target: "https://www.linkedin.com/in/lalit-modi-874631302/" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 13. SYSTEM APPS
  if (query.includes("terminal") || query.includes("cli")) {
    return {
      intent: "OPEN_TERMINAL",
      response: gujarati ? "Terminal app kholiye chhiye." : hindi ? "Terminal app khol rahe hain." : "Opening the Terminal app.",
      action: { type: "open_app", target: "terminal" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("maps") || query.includes("map") || query.includes("naksha")) {
    if (query.includes("university") || query.includes("college") || query.includes("parul")) {
      return {
        intent: "MAPS_UNIVERSITY",
        response: gujarati
          ? "Maps app ma Parul University (Vadodara) bataviye chhiye."
          : hindi
            ? "Maps app me Parul University (Vadodara) dikha rahe hain."
            : "Opening Maps to show Parul University in Vadodara, Gujarat.",
        action: { type: "open_app", target: "maps" },
        modelUsed: "Portfolio AI Core"
      };
    }
    if (query.includes("home") || query.includes("ghar")) {
      return {
        intent: "MAPS_HOME",
        response: gujarati
          ? "Maps app ma Home location focus kariye chhiye."
          : hindi
            ? "Maps app me Home location focus kar rahe hain."
            : "Opening Maps to show your Home location.",
        action: { type: "open_app", target: "maps" },
        modelUsed: "Portfolio AI Core"
      };
    }
    return {
      intent: "OPEN_MAPS",
      response: gujarati ? "Maps app kholiye chhiye." : hindi ? "Maps app khol rahe hain." : "Opening the Maps application.",
      action: { type: "open_app", target: "maps" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("where am i") || query.includes("locate me") || query.includes("mera location") || query.includes("kaha hu") || query.includes("kyan chhu")) {
    return {
      intent: "LOCATE_ME",
      response: gujarati
        ? "Maps app kholine tamaru live location detect kariye chhiye."
        : hindi
          ? "Maps app khol kar aapka live location detect kar rahe hain."
          : "Opening Maps to locate your current position.",
      action: { type: "open_app", target: "maps" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("distance to university") || query.includes("distance to my university") || query.includes("university kitni dur hai") || query.includes("ketlu dur chhe")) {
    return {
      intent: "DISTANCE_TO_UNI",
      response: gujarati
        ? "Home thi Parul University nu approx distance 336 km chhe. Maps app kholine live distance joi shako chho."
        : hindi
          ? "Home se Parul University ka approx distance 336 km hai. Maps app me aap live distance dekh sakte hain."
          : "The approximate distance from Home to Parul University is 336 km. Opening Maps for detailed distance info.",
      action: { type: "open_app", target: "maps" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("vscode") || query.includes("code editor") || query.includes("editor")) {
    return {
      intent: "OPEN_VSCODE",
      response: gujarati ? "Visual Studio Code kholiye chhiye." : hindi ? "Visual Studio Code khol rahe hain." : "Opening Visual Studio Code.",
      action: { type: "open_app", target: "vscode" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("know me") || query.includes("bear") || query.includes("profile app")) {
    return {
      intent: "OPEN_BEAR",
      response: gujarati ? "Know Me profile window kholiye chhiye." : hindi ? "Know Me profile window khol rahe hain." : "Opening Know Me profile window.",
      action: { type: "open_app", target: "bear" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("dark mode") || query.includes("light mode") || query.includes("theme")) {
    return {
      intent: "TOGGLE_DARK",
      response: gujarati ? "Theme mode badli rahya chhiye." : hindi ? "Theme mode badal rahe hain." : "Toggling display theme mode.",
      action: { type: "toggle_dark" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // Music search/play voice commands:
  const isPlayCommand = query.startsWith("play ") && !query.includes("play music");
  const isSearchCommand = query.startsWith("search ") || query.startsWith("find ") || query.startsWith("search for ");

  if (isPlayCommand || isSearchCommand) {
    let searchTerm = "";
    if (query.startsWith("search for ")) {
      searchTerm = query.replace("search for ", "").trim();
    } else if (query.startsWith("search ")) {
      searchTerm = query.replace("search ", "").trim();
    } else if (query.startsWith("play ")) {
      searchTerm = query.replace("play ", "").trim();
    } else if (query.startsWith("find ")) {
      searchTerm = query.replace("find ", "").trim();
    }

    if (searchTerm) {
      const displayTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
      return {
        intent: isPlayCommand ? "PLAY_SPECIFIC_MUSIC" : "SEARCH_SPECIFIC_MUSIC",
        response: gujarati
          ? `Saras! Spotify par "${displayTerm}" shodhye chhiye ane play kariye chhiye.`
          : hindi
            ? `Theek hai! Spotify par "${displayTerm}" search karke play kar rahe hain.`
            : `Sure! Searching for "${displayTerm}" on Spotify and starting playback.`,
        action: {
          type: "play_music",
          target: searchTerm
        },
        modelUsed: "Portfolio AI Core"
      };
    }
  }

  if (query.includes("play music") || query.includes("gana bajao") || query.includes("git vagado")) {
    return {
      intent: "PLAY_MUSIC",
      response: gujarati ? "Tamara mate background music chalu kariye chhiye." : hindi ? "Aapke liye background music play kar rahe hain." : "Playing background music for you.",
      action: { type: "play_music" },
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("stop music") || query.includes("pause music") || query.includes("gana band") || query.includes("git band")) {
    return {
      intent: "STOP_MUSIC",
      response: gujarati ? "Music pause kari didhu." : hindi ? "Music pause kar diya." : "Music paused.",
      action: { type: "stop_music" },
      modelUsed: "Portfolio AI Core"
    };
  }

  // 14. Casual Slang / Rude / Conversational / General Handling
  if (
    /\b(fuck|f\*\*k|bitch|bastard|chutiya|bhenchod|madarchod|saale|gadhe|harami)\b/i.test(query) ||
    query === "fuck you" ||
    query === "shut up"
  ) {
    return {
      intent: "CASUAL_INTERACTION",
      response: gujarati
        ? "Bhai, shanti thi vaat karo! Kaho hu tamari shu madad kari shaku?"
        : hindi
          ? "Arey bhai, thoda aaram se! Batao main aapki kya madad kar sakti hoon?"
          : "Let's keep it friendly! How can I help you today?",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  if (
    query === "abee" ||
    query === "abe" ||
    query === "oye" ||
    query === "oye sun" ||
    query === "sun" ||
    query === "suno" ||
    query === "bro" ||
    query === "bhai" ||
    query === "yaar" ||
    query === "what" ||
    query === "kya"
  ) {
    return {
      intent: "CASUAL_INTERACTION",
      response: gujarati
        ? "Haan bhai! Bolo, shu madad joiye chhe?"
        : hindi
          ? "Haan bhai! Kaho, kya dekhna ya poochna chahte ho?"
          : "Hey there! How can I help you?",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }

  if (query.includes("joke") || query.includes("hasao") || query.includes("chutkula")) {
    return {
      intent: "JOKE",
      response: gujarati
        ? "Programmer nu code tyare j chale jyare koi joto na hoy!"
        : hindi
          ? "Ek programmer bola: Mera code do hi time chalta hai—jab main test nahi karta, aur jab boss nahi dekhta!"
          : "Why do programmers prefer dark mode? Because light attracts bugs!",
      action: null,
      modelUsed: "Portfolio AI Core"
    };
  }


  // 15. IMPORTANT: Do not generate a static portfolio/general answer here.
  // Returning null lets the real AI API answer the user's actual message dynamically.
  // Local intent handling above is reserved for deterministic commands/actions.
  return null;
}

/**
 * Checks whether a user's query is specifically asking about Lalit Modi or his portfolio.
 */
export function isPortfolioQuery(queryText: string): boolean {
  const q = normalizeVoiceQuery(queryText || "");
  if (!q) return false;

  // Explicit references to Lalit / his portfolio.
  const explicit = [
    "lalit", "modi", "lalit kumar", "my portfolio", "this portfolio",
    "about me", "mere baare mein", "mere bare mein", "mere profile",
    "who is he", "who is lalit", "tell me about lalit",
    "lalit ka", "lalit ke", "lalit ki", "lalit ne",
  ];

  if (explicit.some((kw) => q.includes(kw))) return true;

  // Portfolio-specific entities are safe signals.
  const portfolioTerms = [
    "codeyx", "make appointment easy", "mini erp", "core banking",
    "leetcode", "codechef", "geeksforgeeks", "github", "linkedin",
    "resume", "cv", "biodata", "parul university", "cgpa",
  ];

  if (portfolioTerms.some((kw) => q.includes(kw))) return true;

  // Generic words such as 'developer', 'engineer', 'skills', or 'projects'
  // alone are NOT enough to assume the user is asking about Lalit.
  const portfolioPhrase =
    /\b(his|her|your|my)\b.*\b(skills?|projects?|experience|education|resume|portfolio|github|leetcode)\b/i.test(q) ||
    /\b(skills?|projects?|experience|education|resume|portfolio)\b.*\b(his|her|your|my)\b/i.test(q);

  return portfolioPhrase;
}