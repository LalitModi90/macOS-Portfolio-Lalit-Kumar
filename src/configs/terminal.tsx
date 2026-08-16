import type { TerminalData } from "~/types";

const terminal: TerminalData[] = [
  {
    id: "about",
    title: "about",
    type: "folder",
    children: [
      {
        id: "about-me",
        title: "intro.txt",
        type: "file",
        content: (
          <div className="py-1">
            <div>
              Hi, this is Lalit Kumar. I am a Software Development Engineer passionate about building scalable full-stack applications, DSA, and System Design.
            </div>
          </div>
        )
      },
      {
        id: "about-interests",
        title: "interests.txt",
        type: "file",
        content: "Next.js / Node.js / React Native / Competitive Programming / System Design"
      },
      {
        id: "about-who-cares",
        title: "who-cares.txt",
        type: "file",
        content:
          "I'm a Software Development Engineer open to SDE roles and full-stack engineering collaboration."
      },
      {
        id: "about-contact",
        title: "contact.txt",
        type: "file",
        content: (
          <ul className="list-disc ml-6">
            <li>
              Email:{" "}
              <a
                className="text-blue-300"
                href="mailto:lalitmodi7878065@gmail.com"
                target="_blank"
                rel="noreferrer"
              >
                lalitmodi7878065@gmail.com
              </a>
            </li>

            <li>
              Github:{" "}
              <a
                className="text-blue-300"
                href="https://github.com/LalitModi90"
                target="_blank"
                rel="noreferrer"
              >
                @LalitModi90
              </a>
            </li>
            <li>
              Linkedin:{" "}
              <a
                className="text-blue-300"
                href="https://www.linkedin.com/in/lalit-modi-874631302/"
                target="_blank"
                rel="noreferrer"
              >
                Lalit Modi
              </a>
            </li>
          </ul>
        )
      }
    ]
  },
  {
    id: "about-site",
    title: "about-site",
    type: "folder",
    children: [
      {
        id: "site-intro",
        title: "info.txt",
        type: "file",
        content:
          "This project is a macOS Tahoe portfolio simulation built with React, TypeScript, and Tailwind CSS."
      }
    ]
  }
];

export default terminal;
