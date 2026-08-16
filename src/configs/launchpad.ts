import type { LaunchpadData } from "~/types";

const launchpadApps: LaunchpadData[] = [
  // Chunk 0: Web Apps (indexes 0-3)
  {
    id: "github-app",
    title: "GitHub Profile",
    img: "img/icons/github.png",
    link: "https://github.com/LalitModi90"
  },
  {
    id: "leetcode-app",
    title: "LeetCode",
    img: "img/icons/leetcode.svg",
    link: "https://leetcode.com/u/LalitModi90/"
  },
  {
    id: "codechef-app",
    title: "CodeChef",
    img: "img/icons/codechef.svg",
    link: "https://www.codechef.com/users/lalitmodi7878"
  },
  {
    id: "resume-app",
    title: "Resume",
    img: "img/icons/launchpad/resume.png",
    link: "/resume.pdf"
  },
  // Chunk 1: Projects (indexes 4-7)
  {
    id: "codeyx-app",
    title: "Codeyx",
    img: "img/icons/codeyx.svg",
    link: "https://codeyx-web.vercel.app/"
  },
  {
    id: "appointment-app",
    title: "Appointment Easy",
    img: "img/icons/launchpad/skill-exchange.png",
    link: "https://makeappointmenteasy-user-web.vercel.app/"
  },
  {
    id: "mini-erp-crm",
    title: "Mini ERP CRM",
    img: "img/icons/launchpad/share-code-app.png",
    link: "https://mini-erp-crm-portal-frontend.vercel.app/"
  }
];

export default launchpadApps;
