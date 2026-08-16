import { PERSONAL_INFO, EDUCATION, ACHIEVEMENTS, PROJECTS, ARSENAL_CARDS } from "./personal";

export interface ProjectItem {
  id: number;
  num: string;
  title: string;
  category: string;
  subtitle: string;
  impact?: string;
  desc: string[];
  tags: string[];
  year: string;
  color?: string;
  githubLink?: string;
  liveLink?: string;
}

export interface EducationItem {
  institution: string;
  location: string;
  degree: string;
  period: string;
  cgpa?: string;
  status?: string;
}

export interface SkillCategory {
  category: string;
  label: string;
  techs: string[];
  accentColor?: string;
}

export interface PortfolioData {
  name: string;
  displayName: string;
  role: string;
  bio: string;
  summary: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  skills: {
    languages: string[];
    frontend: string[];
    backend: string[];
    databases: string[];
    tools: string[];
    dsa: string[];
  };
  education: EducationItem[];
  experience: {
    role: string;
    highlights: string[];
  }[];
  achievements: string[];
  projects: ProjectItem[];
  github: string;
  leetcode: string;
  codechef: string;
  geeksforgeeks: string;
  linkedin: string;
  instagram: string;
  resume: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    leetcode: string;
    codechef: string;
    instagram: string;
  };
}

export const portfolioData: PortfolioData = {
  name: PERSONAL_INFO.fullName || "LALIT KUMAR",
  displayName: PERSONAL_INFO.displayName || "Lalit Kumar",
  role: PERSONAL_INFO.title || "Software Development Engineer",
  bio: "Aspiring Software Development Engineer (SDE) with a strong foundation in Data Structures and Algorithms (DSA) and full-stack development. Proficient in building scalable web and mobile applications using the MERN stack, Next.js, and React Native.",
  summary: PERSONAL_INFO.summary || "",
  email: PERSONAL_INFO.email || "lalitmodi7878065@gmail.com",
  phone: PERSONAL_INFO.phone || "+91 7878065017",
  whatsapp: PERSONAL_INFO.whatsappNumber || "+91 7878065017",
  location: "Vadodara, Gujarat, India (Origin: Sirohi / Jalore, Rajasthan)",
  skills: {
    languages: ["JavaScript (ES6+)", "TypeScript", "Java", "C", "C++", "SQL", "HTML5", "CSS3"],
    frontend: ["React.js", "Next.js", "React Native", "Tailwind CSS", "Redux Toolkit", "Framer Motion", "Expo"],
    backend: ["Node.js", "Express.js", "RESTful APIs", "JWT", "Authentication", "WebSockets"],
    databases: ["MongoDB", "MySQL", "Supabase", "Redis", "Neo4j"],
    tools: ["Git", "GitHub", "VS Code", "Postman", "Vercel", "Docker", "Vite"],
    dsa: ["350+ LeetCode problems solved", "Data Structures", "Algorithms", "Dynamic Programming", "Graphs", "Trees", "System Design"]
  },
  education: EDUCATION,
  experience: [
    {
      role: "Software Development Engineer (Full-Stack & Systems)",
      highlights: [
        "Architected Codeyx CP Analytics platform syncing real-time stats from LeetCode, CodeChef, and GitHub.",
        "Built Make Appointment Easy platform reducing scheduling overhead by 60% with high-concurrency MongoDB schema (500+ concurrent requests).",
        "Engineered Mini ERP CRM Portal with role-based access control and analytics dashboards.",
        "Developed Enterprise Java Core Banking System with ACID compliance and multi-threaded transaction logging."
      ]
    }
  ],
  achievements: ACHIEVEMENTS,
  projects: PROJECTS as ProjectItem[],
  github: PERSONAL_INFO.socials.github || "https://github.com/LalitModi90",
  leetcode: PERSONAL_INFO.socials.leetcode || "https://leetcode.com/u/LalitModi90/",
  codechef: PERSONAL_INFO.socials.codechef || "https://www.codechef.com/users/lalitmodi7878",
  geeksforgeeks: PERSONAL_INFO.socials.geeksforgeeks || "https://www.geeksforgeeks.org/profile/lalitmodiog7e?tab=activity",
  linkedin: PERSONAL_INFO.socials.linkedin || "https://www.linkedin.com/in/lalit-modi-874631302/",
  instagram: PERSONAL_INFO.socials.instagram || "https://www.instagram.com/mr.lalitmodi90/",
  resume: PERSONAL_INFO.resumeUrl || "/resume.pdf",
  contact: {
    email: PERSONAL_INFO.email || "lalitmodi7878065@gmail.com",
    phone: PERSONAL_INFO.phone || "+91 7878065017",
    location: "Vadodara, Gujarat, India",
    github: PERSONAL_INFO.socials.github || "https://github.com/LalitModi90",
    linkedin: PERSONAL_INFO.socials.linkedin || "https://www.linkedin.com/in/lalit-modi-874631302/",
    leetcode: PERSONAL_INFO.socials.leetcode || "https://leetcode.com/u/LalitModi90/",
    codechef: PERSONAL_INFO.socials.codechef || "https://www.codechef.com/users/lalitmodi7878",
    instagram: PERSONAL_INFO.socials.instagram || "https://www.instagram.com/mr.lalitmodi90/"
  }
};

export default portfolioData;
