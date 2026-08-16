import type { WebsitesData } from "~/types";

const websites: WebsitesData = {
  favorites: {
    title: "SNS & Profiles",
    sites: [
      {
        id: "my-email",
        title: "Email",
        img: "img/sites/gmail.svg",
        link: "mailto:lalitmodi7878065@gmail.com",
      },
      {
        id: "my-github",
        title: "Github",
        img: "img/sites/github.svg",
        link: "https://github.com/LalitModi90",
      },
      {
        id: "my-linkedin",
        title: "LinkedIn",
        img: "img/sites/linkedin.svg",
        link: "https://www.linkedin.com/in/lalit-modi-874631302/",
      },
      {
        id: "leetcode",
        title: "LeetCode",
        img: "img/sites/leetcode.svg",
        link: "https://leetcode.com/u/LalitModi90/",
      },
      {
        id: "codechef",
        title: "CodeChef",
        img: "img/sites/hacker.svg",
        link: "https://www.codechef.com/users/lalitmodi7878",
      },
      {
        id: "geeksforgeeks",
        title: "GeeksforGeeks",
        img: "img/sites/gfg.png",
        link: "https://www.geeksforgeeks.org/profile/lalitmodiog7e?tab=activity",
      },
      {
        id: "instagram",
        title: "Instagram",
        img: "img/sites/twitter.svg",
        link: "https://www.instagram.com/mr.lalitmodi90/",
      },
    ],
  },
  freq: {
    title: "Live Web Apps & Projects",
    sites: [
      {
        id: "codeyx-app",
        title: "Codeyx",
        img: "img/sites/codeyx.svg",
        link: "https://codeyx-web.vercel.app/",
      },
      {
        id: "mini-erp-crm",
        title: "Mini ERP CRM",
        img: "img/sites/mini-erp.svg",
        link: "https://mini-erp-crm-portal-frontend.vercel.app/",
      },
      {
        id: "appointment-app",
        title: "Appointment Easy",
        img: "img/sites/appointment.svg",
        link: "https://makeappointmenteasy-user-web.vercel.app/",
      },
    ],
  },
};

export default websites;
