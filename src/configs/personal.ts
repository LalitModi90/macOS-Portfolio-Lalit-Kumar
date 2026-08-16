export const PERSONAL_INFO = {
  firstName: "Lalit",
  lastName: "Kumar",
  fullName: "LALIT KUMAR",
  displayName: "Lalit Kumar",
  title: "Software Development Engineer",
  email: "lalitmodi7878065@gmail.com",
  phone: "+91 7878065017",
  whatsappNumber: "+91 7878065017",
  resumeUrl: "/resume.pdf",
  resumeFilename: "Lalit_Kumar_Resume.pdf",
  summary: "Aspiring Software Development Engineer (SDE) with a strong foundation in Data Structures and Algorithms (DSA) and full-stack development. Proficient in building scalable web and mobile applications using the MERN stack, Next.js, and React Native. Dedicated to solving complex computational problems and optimizing system performance, with a solid grasp of OOPS, DBMS, and Operating Systems.",
  socials: {
    github: "https://github.com/LalitModi90",
    linkedin: "https://www.linkedin.com/in/lalit-modi-874631302/",
    leetcode: "https://leetcode.com/u/LalitModi90/",
    codechef: "https://www.codechef.com/users/lalitmodi7878",
    geeksforgeeks: "https://www.geeksforgeeks.org/profile/lalitmodiog7e?tab=activity",
    instagram: "https://www.instagram.com/mr.lalitmodi90/"
  }
};

export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_pyi92kn",
  TEMPLATE_ID: "template_nrgw0jb",
  PUBLIC_KEY: "Y8qMllzqOTgLXgqal3",
  FORMSPREE_ID: "xojpnvdg"
};

export const EDUCATION = [
  {
    institution: "Parul Institute of Technology",
    location: "Vadodara, India",
    degree: "Bachelor of Technology in Computer Science and Engineering",
    period: "2023 – 2027 (Expected)",
    cgpa: "8.34 (6th Semester)",
    status: "Placement Eligible | Zero Active Backlogs | Strong academic record."
  },
  {
    institution: "Mahatma Gandhi Govt School, Jawal",
    location: "Sirohi, India",
    degree: "Higher Secondary (12th Grade) – 74.00%",
    period: "2022"
  },
  {
    institution: "Inspire Sr Sec School, Siyana",
    location: "Jalore, India",
    degree: "Secondary (10th Grade) – 72.17%",
    period: "2020"
  }
];

export const ACHIEVEMENTS = [
  "Solved 395+ DSA problems on LeetCode (155 Easy, 207 Medium, 33 Hard); active competitive programmer with a focus on algorithmic optimization.",
  "CodeChef: Achieved 1006+ Rating; Global Rank 4893 in Starters Contest.",
  "Consistently ranked in the top percentiles for university-wide technical evaluations and coding assessments.",
  "Developed 4 full-stack projects within a year, demonstrating strong engineering and rapid implementation skills."
];

export const TICKER_ITEMS = [
  "SOFTWARE DEVELOPER", "—", "DSA ENTHUSIAST", "—", "MERN STACK BUILDER", "—",
  "COMPETITIVE PROGRAMMER", "—", "FULL STACK DEV", "—", "PROBLEM SOLVER", "—",
  "SCALABLE SYSTEMS", "—", "REACT NATIVE", "—",
];

export const PROJECTS = [
  { 
    id: 1, 
    num: "01", 
    title: "Make Appointment Easy", 
    category: "Full Stack", 
    subtitle: "Service Platform",
    impact: "60% faster appointment scheduling",
    desc: [
      "Built a full-stack booking system reducing appointment scheduling time by 60% for service providers.",
      "Optimized MongoDB schema for high-concurrency, handling up to 500+ simultaneous booking requests.",
      "Implemented role-based access control (RBAC), improving administrative efficiency by 35%."
    ],
    tags: ["Next.js", "MongoDB", "Express.js", "Tailwind"], 
    year: "2025", 
    color: "#6366f1",
    githubLink: "https://github.com/LalitModi90",
    liveLink: "https://makeappointmenteasy-user-web.vercel.app/"
  },
  { 
    id: 2, 
    num: "02", 
    title: "Codeyx", 
    category: "Full Stack", 
    subtitle: "Competitive Programming Analytics Platform",
    impact: "21 active users across institutions",
    desc: [
      "Built a full-stack analytics platform syncing data from LeetCode, CodeChef, GitHub for real-time coding progress tracking.",
      "Engineered a secure backend with Clerk authentication, rate-limiting, and CORS hardening, achieving production-grade security standards.",
      "Implemented AI-powered resume builder and university verification system, supporting 21 active users across institutions."
    ],
    tags: ["Next.js", "Node.js", "MongoDB", "Clerk"], 
    year: "2026", 
    color: "#dc2626",
    githubLink: "https://github.com/LalitModi90",
    liveLink: "https://codeyx-web.vercel.app/"
  },
  { 
    id: 3, 
    num: "03", 
    title: "Mini ERP CRM Portal", 
    category: "Full Stack", 
    subtitle: "Management & CRM Solution",
    impact: "Streamlined operational efficiency",
    desc: [
      "Architected a comprehensive ERP & CRM portal managing business operations and customer records.",
      "Implemented analytics dashboard, lead tracking, and role-based permissions.",
      "Optimized database queries for fast data retrieval and high stability."
    ],
    tags: ["React", "Node.js", "Express", "MongoDB"], 
    year: "2026", 
    color: "#f59e0b",
    githubLink: "https://github.com/LalitModi90",
    liveLink: "https://mini-erp-crm-portal-frontend.vercel.app/"
  },
  { 
    id: 4, 
    num: "04", 
    title: "Java Enterprise Core Banking System", 
    category: "Java & Systems", 
    subtitle: "Object-Oriented Banking Application",
    impact: "High performance OOP & multi-threaded transactions",
    desc: [
      "Engineered an Object-Oriented Java banking application implementing ACID compliance and transaction logging.",
      "Applied core Java concepts (OOPs, Abstraction, Polymorphism, Exception Handling, File I/O, JDBC).",
      "Designed data structures for fast customer account lookup and secure multi-threaded operations."
    ],
    tags: ["Java", "OOPs", "JDBC", "Data Structures", "MySQL"], 
    year: "2024", 
    color: "#b07219",
    githubLink: "https://github.com/LalitModi90",
    liveLink: ""
  },
  { 
    id: 5, 
    num: "05", 
    title: "Java Multi-threaded Console Management System", 
    category: "Java Desktop", 
    subtitle: "Management Utility Application",
    impact: "Optimized memory & thread synchronization",
    desc: [
      "Built a concurrent Java application handling multi-threaded data processing and custom file serialization.",
      "Implemented custom data structures and optimized search algorithms for efficient record management.",
      "Achieved high operational stability with zero memory leaks and robust exception handling."
    ],
    tags: ["Java", "Multithreading", "Algorithms", "File I/O"], 
    year: "2024", 
    color: "#ed8b00",
    githubLink: "https://github.com/LalitModi90",
    liveLink: ""
  },
];

export const NAV_ICONS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "about", label: "About", icon: "◉" },
  { id: "projects", label: "Projects", icon: "▣" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "contact", label: "Contact", icon: "✉" },
];

export const HOBBIES = [
  {
    id: 1, label: "Music", subtitle: "Sounds that define moments",
    accent: "#a78bfa", light: false, sticker: "🎤", tagline: "Voice of emotion",
    bg: "linear-gradient(135deg,#fff,#f0f0f0)",
    photos: [
      { bg: "linear-gradient(135deg,#1a0a2e,#4a1080)", emoji: "🎙️", label: "Arijit Singh" },
      { bg: "linear-gradient(135deg,#2d0a1a,#8b1a4a)", emoji: "🎤", label: "Neha Kakkar" },
      { bg: "linear-gradient(135deg,#1a1a0a,#4a4010)", emoji: "🎵", label: "AR Rahman" },
    ],
  },
  {
    id: 2, label: "Movies", subtitle: "Stories that stay with you",
    accent: "#60a5fa", light: false, sticker: "🎬", tagline: "enjoy the moment",
    bg: "linear-gradient(135deg,#fff,#f0f0f0)",
    photos: [
      { bg: "linear-gradient(135deg,#0a1628,#1a2d50)", emoji: "🎬", label: "Bollywood" },
      { bg: "linear-gradient(135deg,#1a0a0a,#401010)", emoji: "🎭", label: "Hollywood" },
      { bg: "linear-gradient(135deg,#0a1a0a,#104010)", emoji: "🍿", label: "Dune" },
    ],
  },
  {
    id: 3, label: "Photography", subtitle: "Frames that last forever",
    accent: "#f97316", light: true, sticker: "📷", tagline: "Making Memories",
    bg: "linear-gradient(135deg,#fff,#f5f0e8)",
    photos: [
      { bg: "linear-gradient(135deg,#2a1a0a,#604020)", emoji: "🌅", label: "Portraits" },
      { bg: "linear-gradient(135deg,#0a1a2a,#205040)", emoji: "🌿", label: "Nature" },
      { bg: "linear-gradient(135deg,#1a1a2a,#302060)", emoji: "🌃", label: "Street" },
    ],
  },
  {
    id: 4, label: "Cricket", subtitle: "Jai Hind",
    accent: "#22c55e", light: true, sticker: "🏏", tagline: "Jai Hind",
    bg: "linear-gradient(135deg,#fff,#f0f5f0)",
    photos: [
      { bg: "linear-gradient(135deg,#001a33,#003366)", emoji: "🇮🇳", label: "Team India" },
      { bg: "linear-gradient(135deg,#1a0a33,#3d1a66)", emoji: "🏏", label: "Cricket" },
      { bg: "linear-gradient(135deg,#0a1a00,#1a4000)", emoji: "🏆", label: "Win" },
    ],
  },
  {
    id: 5, label: "Tech", subtitle: "Building the future",
    accent: "#3b82f6", light: true, sticker: "💻", tagline: "Code is life",
    bg: "linear-gradient(135deg,#fff,#f0f4ff)",
    photos: [
      { bg: "linear-gradient(135deg,#0a0a1a,#101040)", emoji: "⌨️", label: "Setup" },
      { bg: "linear-gradient(135deg,#1a0000,#400000)", emoji: "⚙️", label: "System" },
      { bg: "linear-gradient(135deg,#1a0a00,#402000)", emoji: "🚀", label: "Launch" },
    ],
  },
];

export const ARSENAL_CARDS = [
  {
    id: 1, category: "Languages", label: "PROGRAMMING",
    stat1: { key: "SKILL LEVEL", val: "Advanced" }, stat2: { key: "DATA STRUCTURES", val: "350+" },
    stat3: { key: "RELIABILITY", val: "High" }, stat4: { key: "RATINGS", val: "CodeChef" },
    techs: ["JavaScript (ES6+)", "TypeScript", "Java", "C", "C++", "SQL"],
    gradient: "from-[#001833] via-[#000c1a] to-[#000]",
    glowColor: "rgba(6,182,212,0.2)", accentColor: "#06b6d4",
    icons: ["🌐", "🔷", "🔥", "🐘", "⚡"],
  },
  {
    id: 2, category: "Frontend", label: "FRONTEND DEV",
    stat1: { key: "SKILL LEVEL", val: "Advanced" }, stat2: { key: "TOP PROJECT", val: "Codeyx" },
    stat3: { key: "RELIABILITY", val: "High" }, stat4: { key: "PROJECTS", val: "4+" },
    techs: ["React.js", "Next.js", "React Native", "Expo", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "Framer Motion"],
    gradient: "from-[#1a0533] via-[#0d0020] to-[#000]",
    glowColor: "rgba(139,92,246,0.25)", accentColor: "#8b5cf6",
    icons: ["⚛", "▲", "🎨", "📱", "🌐"],
  },
  {
    id: 3, category: "Backend & Database", label: "BACKEND DEV",
    stat1: { key: "SKILL LEVEL", val: "Intermediate" }, stat2: { key: "TOP PROJECT", val: "Codeyx" },
    stat3: { key: "RELIABILITY", val: "High" }, stat4: { key: "APIs BUILT", val: "10+" },
    techs: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Supabase", "Neo4j", "Firebase", "REST APIs", "JWT", "Redis"],
    gradient: "from-[#001a10] via-[#000d08] to-[#000]",
    glowColor: "rgba(16,185,129,0.2)", accentColor: "#10b981",
    icons: ["◉", "⚡", "🗄", "🔧", "🕸"],
  },
  {
    id: 4, category: "Developer Tools", label: "TOOLS & DEV",
    stat1: { key: "SKILL LEVEL", val: "Advanced" }, stat2: { key: "TOOLS USED", val: "10+" },
    stat3: { key: "RELIABILITY", val: "Growing" }, stat4: { key: "SCALING", val: "Global" },
    techs: ["Git", "GitHub", "VS Code", "Postman", "Vercel", "Vite", "Clerk", "Docker", "Linux"],
    gradient: "from-[#1a0a00] via-[#0d0500] to-[#000]",
    glowColor: "rgba(245,158,11,0.2)", accentColor: "#f59e0b",
    icons: ["🔀", "🐙", "💻", "📬", "▲"],
  },
  {
    id: 5, category: "CS Fundamentals", label: "CORE CONCEPTS",
    stat1: { key: "UNDERSTANDING", val: "Deep" }, stat2: { key: "DSA", val: "Strong" },
    stat3: { key: "ARCHITECTURE", val: "Scalable" }, stat4: { key: "SOLVING", val: "Advanced" },
    techs: ["Data Structures & Algorithms", "OOPS", "DBMS", "Operating Systems", "Computer Networks", "System Design"],
    gradient: "from-[#1a000d] via-[#0d0006] to-[#000]",
    glowColor: "rgba(236,72,153,0.2)", accentColor: "#ec4899",
    icons: ["🧠", "📦", "🗃", "💻", "🌐"],
  },
  {
    id: 6, category: "Cloud & Deployment", label: "INFRASTRUCTURE",
    stat1: { key: "SKILL LEVEL", val: "Intermediate" }, stat2: { key: "HOSTING", val: "Vercel/Render" },
    stat3: { key: "RELIABILITY", val: "High" }, stat4: { key: "SECURITY", val: "Standard" },
    techs: ["AWS", "MongoDB Atlas", "CI/CD", "Environment Variables", "API Deployment"],
    gradient: "from-[#001f3f] via-[#001026] to-[#000]",
    glowColor: "rgba(59,130,246,0.2)", accentColor: "#3b82f6",
    icons: ["☁️", "🚀", "🔒", "⚙️", "🌍"],
  }
];

export const PLAYLIST = [
  {
    id: 1, title: "PERFECT", artist: "Ed Sheeran", film: "ED Sheeran", color: "#e11d48", emoji: "🎵",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2, title: "Samjhawan", artist: "Arijit Singh", film: "Humpty Sharma ki Dulhania", color: "#7c3aed", emoji: "🎶",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3, title: "Apna Bana Le", artist: "Arijit Singh", film: "Bhediya", color: "#0891b2", emoji: "🎸",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
];

export const CERTIFICATIONS = [
  {
    title: "Elite: Computer Networks",
    provider: "NPTEL (IIT Kharagpur)",
    year: "2024",
    verifyLink: "#",
  },
  {
    title: "Dynamic Programming Camp",
    provider: "AlgoUniversity",
    year: "2024",
    verifyLink: "#",
  },
  {
    title: "AI Fundamentals",
    provider: "IBM SkillsBuild / Cisco",
    year: "2024",
    verifyLink: "#",
  },
  {
    title: "Java Skill Certificate",
    provider: "HackerRank",
    year: "2024",
    verifyLink: "#",
  },
  {
    title: "MCSA: Machine Learning",
    provider: "Microsoft Certified",
    year: "2023",
    verifyLink: "#",
  },
  {
    title: "Java Developer Certification",
    provider: "Prashant Sir Coding",
    year: "2023",
    verifyLink: "#",
  },
];
