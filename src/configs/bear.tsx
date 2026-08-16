import type { BearData } from "~/types";

const bear: BearData[] = [
  {
    id: "about-me",
    title: "About Me",
    icon: "i-ph:user-circle-bold",
    md: [
      {
        id: "about-me",
        title: "About Me",
        file: "markdown/about-me.md",
        icon: "i-ph:shield-star",
        excerpt: "Hey there! I'm Lalit Kumar, Software Development Engineer...",
        date: "Updated today"
      },
      {
        id: "github-stats",
        title: "GitHub Stats",
        file: "markdown/github-stats.md",
        icon: "i-fa6-brands:github",
        excerpt: "Here are some stats about my GitHub account...",
        link: "https://github.com/LalitModi90",
        date: "Updated yesterday"
      },
      {
        id: "about-site",
        title: "About This Site",
        file: "markdown/about-site.md",
        icon: "i-ph:browser",
        excerpt: "Something about this personal portfolio site...",
        date: "Updated 2 days ago"
      }
    ]
  },
  {
    id: "project",
    title: "Projects",
    icon: "i-ph:git-branch",
    md: [
      {
        id: "codeyx",
        title: "Codeyx Analytics Platform",
        file: "markdown/about-me.md",
        icon: "i-ph:code-bold",
        excerpt: "Competitive Programming Analytics Platform syncing LeetCode, CodeChef & GitHub...",
        link: "https://codeyx-web.vercel.app/",
        date: "Updated today"
      },
      {
        id: "mini-erp-crm-portal",
        title: "Mini ERP CRM Portal",
        file: "markdown/about-me.md",
        icon: "i-ph:student",
        excerpt: "Comprehensive ERP & CRM portal managing business operations and customer records...",
        link: "https://mini-erp-crm-portal-frontend.vercel.app/",
        date: "Updated 1 week ago"
      },
      {
        id: "make-appointment-easy",
        title: "Make Appointment Easy",
        file: "markdown/about-me.md",
        icon: "i-ph:calendar-check",
        excerpt: "Full stack booking system reducing appointment scheduling time by 60%...",
        link: "https://makeappointmenteasy-user-web.vercel.app/",
        date: "Updated 2 weeks ago"
      }
    ]
  }
];

export default bear;
