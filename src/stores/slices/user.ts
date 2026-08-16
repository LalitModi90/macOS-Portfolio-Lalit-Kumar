import type { StateCreator } from "zustand";

export interface UserSlice {
  typoraMd: string;
  setTyporaMd: (v: string) => void;
  faceTimeImages: {
    [date: string]: string;
  };
  addFaceTimeImage: (v: string) => void;
  delFaceTimeImage: (k: string) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  typoraMd: `# Candidate Profile — Lalit Kumar

Software Development Engineer (Full-Stack & Backend)
Email: lalitmodi7878065@gmail.com
Links: [Open Resume](/resume.pdf) | [Download Resume](/resume.pdf) | [GitHub](https://github.com/LalitModi90) | [LinkedIn](https://www.linkedin.com/in/lalit-modi-874631302/)

---

## Summary

Computer Science undergraduate (B.Tech CSE, 2023–2027) with strong foundations in Data Structures & Algorithms, full-stack web engineering, and backend architectures. Seeking Software Development Engineer (SDE) opportunities.

---

## Technical Skills

- Languages: JavaScript (ES6+), TypeScript, Java, C, C++, SQL
- Full-Stack & Frontend: React.js, Next.js, React Native, Tailwind CSS, Redux Toolkit
- Backend & Databases: Node.js, Express.js, MongoDB, Mongoose, RESTful APIs, JWT
- Core CS: Data Structures & Algorithms, Object-Oriented Programming, DBMS, Operating Systems
- Problem Solving: 350+ problems solved on LeetCode; CodeChef Global Rank 4893

---

## Key Projects

1. Codeyx Analytics Platform
Full-stack developer analytics platform syncing live data from LeetCode, CodeChef, and GitHub with secure authentication and rate-limiting.
- Live: https://codeyx-web.vercel.app/
- Code: https://github.com/LalitModi90/codeyx-web

2. Make Appointment Easy
High-concurrency appointment scheduling system with role-based access control and optimized database queries.
- Live: https://makeappointmenteasy-user-web.vercel.app/

3. Mini ERP & CRM Portal
Business operations and customer management dashboard with modular architecture.
- Live: https://mini-erp-crm-portal-frontend.vercel.app/
- Code: https://github.com/LalitModi90/mini-erp-crm-portal

---

## Education

- Bachelor of Technology in Computer Science and Engineering
- Parul Institute of Technology, Vadodara, India (2023 – 2027)
- Current CGPA: 8.34 (6th Semester) | Zero Backlogs

---

## Resume & Quick Navigation

- Resume: [Open Resume in Browser](/resume.pdf) | [Download Resume (PDF)](/resume.pdf)
- VS Code App: Browse complete project repositories directly from the dock
- Terminal: Interactive shell with custom commands
- Know Me App: Complete portfolio documentation`,
  setTyporaMd: (v) => set(() => ({ typoraMd: v })),
  faceTimeImages: {},
  addFaceTimeImage: (v) =>
    set((state) => {
      const images = state.faceTimeImages;
      images[+new Date()] = v;
      return { faceTimeImages: images };
    }),
  delFaceTimeImage: (k) =>
    set((state) => {
      const images = state.faceTimeImages;
      delete images[k];
      return { faceTimeImages: images };
    })
});
