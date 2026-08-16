import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MailMessage {
  id: string;
  from: string;
  fromEmail: string;
  toEmail?: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread?: boolean;
  starred?: boolean;
  avatar: string;
  avatarBg?: string;
  folder: "Inbox" | "Sent" | "Drafts" | "Starred" | "Trash";
}

const LALIT_EMAIL = "lalitmodi7878065@gmail.com";

const INITIAL_MESSAGES: MailMessage[] = [
  {
    id: "1",
    from: "GitHub",
    fromEmail: "noreply@github.com",
    subject: "Your pull request was merged",
    preview: "Congratulations! Your PR #42 'feat: macOS Tahoe UI' has been merged into main.",
    body: "Congratulations!\n\nYour pull request #42 'feat: macOS Tahoe UI' has been successfully merged into main.\n\nChanges included:\n• Clean Liquid Glass design system\n• Interactive macOS Maps with Leaflet & OSM\n• Direct WhatsApp & Mail apps\n• Dynamic Island & widget integrations\n\nView the merged PR on GitHub.",
    time: "10:42 AM",
    unread: true,
    avatar: "GH",
    avatarBg: "linear-gradient(135deg, #24292e, #4b5563)",
    folder: "Inbox",
  },
  {
    id: "2",
    from: "Netlify",
    fromEmail: "noreply@netlify.com",
    subject: "Deployment successful — portfolio",
    preview: "Your project portfolio has been deployed to production.",
    body: "Your project portfolio has been deployed to production.\n\nDeployment URL: https://lalitkumarprotfolio.netlify.app\nBranch: main\nCommit: e160e02\n\nThis deployment is now live and ready.",
    time: "10:38 AM",
    unread: true,
    avatar: "N",
    avatarBg: "linear-gradient(135deg, #00C7B7, #008080)",
    folder: "Inbox",
  },
  {
    id: "3",
    from: "Recruiter @ TechCorp",
    fromEmail: "recruiter@techcorp.com",
    subject: "Exciting opportunity — Software Engineer",
    preview: "Hi Lalit, I came across your portfolio and was impressed by your work.",
    body: "Hi Lalit,\n\nI came across your portfolio and was really impressed by your projects (Codeyx, Mini ERP) and 349+ LeetCode problems solved.\n\nWe have an exciting Software Development Engineer role that matches your skills in React, Next.js, Node.js, and Java.\n\nWould you be open to a quick technical discussion this week?\n\nBest regards,\nTech Talent Team",
    time: "9:15 AM",
    unread: true,
    starred: true,
    avatar: "TC",
    avatarBg: "linear-gradient(135deg, #4285F4, #34A853)",
    folder: "Inbox",
  },
  {
    id: "4",
    from: "Lalit Kumar",
    fromEmail: LALIT_EMAIL,
    subject: "Welcome to my portfolio mailbox",
    preview: "Click '+ Compose' to send me a direct email anytime!",
    body: "Hi there!\n\nThanks for exploring my macOS developer portfolio.\n\nYou can click '+ Compose' at any time to write and send an email directly to my personal inbox at lalitmodi7878065@gmail.com.\n\nLooking forward to hearing from you!\n\nBest,\nLalit Kumar\nSoftware Development Engineer",
    time: "Yesterday",
    avatar: "LK",
    avatarBg: "linear-gradient(135deg, #007AFF, #5856D6)",
    folder: "Inbox",
  },
];

const FOLDERS = ["Inbox", "Sent", "Drafts", "Starred", "Trash"] as const;

export default function Mail() {
  const [messages, setMessages] = useState<MailMessage[]>(INITIAL_MESSAGES);
  const [activeFolder, setActiveFolder] = useState<typeof FOLDERS[number]>("Inbox");
  const [selectedId, setSelectedId] = useState<string>(INITIAL_MESSAGES[0].id);
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const [winWidth, setWinWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [mobileView, setMobileView] = useState<"folders" | "list" | "detail">("folders");

  useEffect(() => {
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = winWidth < 768;

  // Compose State
  const [composeTo, setComposeTo] = useState(`Lalit Kumar <${LALIT_EMAIL}>`);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = composeSubject.trim() || "Portfolio Inquiry — Software Developer Opportunity";
    const body = composeBody.trim() || "Hi Lalit, I checked out your portfolio and would like to connect!";

    const sentMail: MailMessage = {
      id: Date.now().toString(),
      from: "You",
      fromEmail: "visitor@portfolio.dev",
      toEmail: LALIT_EMAIL,
      subject,
      preview: body.slice(0, 80) + (body.length > 80 ? "..." : ""),
      body,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      avatar: "ME",
      avatarBg: "linear-gradient(135deg, #007AFF, #0055D4)",
      folder: "Sent",
    };

    setMessages((prev) => [sentMail, ...prev]);
    setComposing(false);
    setComposeSubject("");
    setComposeBody("");
    showToast("Email dispatched! Opening your email client to send to Lalit...");

    // Trigger native mailto link
    const mailtoUrl = `mailto:${LALIT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 300);
  };

  const folderMessages = messages.filter((m) => {
    if (activeFolder === "Starred") return m.starred;
    return m.folder === activeFolder;
  });

  const filtered = search.trim()
    ? folderMessages.filter(
      (m) =>
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.from.toLowerCase().includes(search.toLowerCase()) ||
        m.preview.toLowerCase().includes(search.toLowerCase())
    )
    : folderMessages;

  const activeMsg = messages.find((m) => m.id === selectedId) || filtered[0];

  return (
    <div className="flex h-full w-full bg-[#f5f5f7] dark:bg-[#14171f] text-gray-900 dark:text-gray-100 rounded-b-xl overflow-hidden select-none relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#007AFF] text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 border border-white/20 backdrop-blur-xl"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar — Mailbox Folders */}
      {(!isMobile || mobileView === "folders") && (
        <div className={`${isMobile ? "w-full" : "w-40 sm:w-44"} flex-shrink-0 bg-[#ebebf0]/95 dark:bg-[#181a22]/95 border-r border-black/10 dark:border-white/10 flex flex-col py-2 backdrop-blur-xl`}>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3.5 py-1.5">
            Mailboxes
          </div>

          <div className="flex-1 space-y-0.5 px-1.5">
            {FOLDERS.map((folder) => {
              const count = messages.filter((m) => (folder === "Starred" ? m.starred : m.folder === folder && m.unread)).length;
              const isSelected = activeFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => {
                    setActiveFolder(folder);
                    if (isMobile) {
                      setMobileView("list");
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected
                    ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                >
                  <span>{folder}</span>
                  {count > 0 && (
                    <span className="bg-blue-600 text-white rounded-full text-[10px] font-bold px-1.5 py-0.2 min-w-4 text-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Compose Button */}
          <div className="p-2.5">
            <button
              onClick={() => {
                setComposing(true);
                if (isMobile) setMobileView("detail");
              }}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Compose</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages List Column */}
      {(!isMobile || mobileView === "list") && (
        <div className={`${isMobile ? "w-full" : "w-64 sm:w-72"} flex-shrink-0 bg-[#f8f8fc]/95 dark:bg-[#161821]/95 border-r border-black/10 dark:border-white/10 flex flex-col overflow-hidden`}>
          {isMobile && (
            <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02]">
              <button
                onClick={() => setMobileView("folders")}
                className="text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center"
              >
                ← Folders
              </button>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100 capitalize">{activeFolder}</span>
            </div>
          )}
          {/* Search */}
          <div className="p-2.5 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 rounded-xl px-2.5 py-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search Mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Message Items */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No messages in {activeFolder}
              </div>
            ) : (
              filtered.map((msg) => {
                const isSelected = activeMsg?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedId(msg.id);
                      setMessages((prev) =>
                        prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
                      );
                      if (isMobile) {
                        setMobileView("detail");
                      }
                    }}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all relative ${isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200"
                      }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5 shadow-xs"
                      style={{ background: msg.avatarBg || "linear-gradient(135deg, #007AFF, #5856D6)" }}
                    >
                      {msg.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : ""}`}>
                          {msg.from}
                        </span>
                        <span className={`text-[10px] flex-shrink-0 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                          {msg.time}
                        </span>
                      </div>

                      <p className={`text-xs font-semibold truncate mt-0.5 ${isSelected ? "text-blue-100" : "text-gray-800 dark:text-gray-200"}`}>
                        {msg.subject}
                      </p>

                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-blue-200" : "text-gray-500 dark:text-gray-400"}`}>
                        {msg.preview}
                      </p>
                    </div>

                    {msg.unread && !isSelected && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Message View Area */}
      {(!isMobile || mobileView === "detail") && (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#12141a] overflow-hidden">
          {isMobile && (
            <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-3 bg-white dark:bg-[#12141a]">
              <button
                onClick={() => setMobileView("list")}
                className="text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center"
              >
                ← Back
              </button>
            </div>
          )}
          {activeMsg ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                    {activeMsg.subject}
                  </h2>

                  <div className="flex items-center gap-3 mt-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                      style={{ background: activeMsg.avatarBg || "linear-gradient(135deg, #007AFF, #5856D6)" }}
                    >
                      {activeMsg.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">{activeMsg.from}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {activeMsg.fromEmail} · {activeMsg.time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply / Compose Action Button */}
                <button
                  onClick={() => {
                    setComposeSubject(`Re: ${activeMsg.subject}`);
                    setComposing(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                  <span>Reply</span>
                </button>
              </div>

              {/* Email Body */}
              <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap pt-6 flex-1">
                {activeMsg.body}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              Select a message to read
            </div>
          )}
        </div>
      )}

      {/* macOS / iOS Compose Modal Window Overlay */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed sm:absolute inset-x-2 bottom-2 top-14 sm:top-auto sm:bottom-4 sm:right-4 sm:left-auto w-auto sm:w-full sm:max-w-lg bg-white/98 dark:bg-[#1a1c24]/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/15 flex flex-col overflow-hidden z-[100]"
          >
            {/* Modal Header */}
            <div className="px-4 py-2.5 bg-gray-100/90 dark:bg-[#20232d]/90 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">New Message to Lalit</span>
              <button
                onClick={() => setComposing(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col flex-1 overflow-hidden">
              {/* To Field */}
              <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-12 font-medium">To:</span>
                <input
                  type="text"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 font-medium"
                />
              </div>

              {/* Subject Field */}
              <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-12 font-medium">Subject:</span>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer Opportunity / Project Inquiry"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 font-medium placeholder-gray-400"
                />
              </div>

              {/* Quick Template Chips */}
              <div className="px-4 py-1.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
                <span className="text-gray-400 uppercase font-semibold flex-shrink-0">Template:</span>
                <button
                  type="button"
                  onClick={() => {
                    setComposeSubject("Software Engineer Job Opportunity");
                    setComposeBody("Hi Lalit,\n\nWe came across your portfolio and would like to discuss an opportunity for a Software Engineer role.\n\nBest regards,");
                  }}
                  className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Job Opportunity
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComposeSubject("Project Collaboration Inquiry");
                    setComposeBody("Hi Lalit,\n\nI loved your portfolio projects and would like to collaborate with you on an upcoming web application.\n\nBest,");
                  }}
                  className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Collaboration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComposeSubject("Portfolio Feedback & Networking");
                    setComposeBody("Hi Lalit,\n\nGreat work on your macOS portfolio! Would love to connect and stay in touch.\n\nCheers,");
                  }}
                  className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  Networking
                </button>
              </div>

              {/* Message Body */}
              <textarea
                placeholder="Write your email to Lalit..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="p-4 bg-transparent border-none outline-none text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none leading-relaxed flex-1"
              />

              {/* Modal Footer */}
              <div className="px-4 py-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#181a22] shrink-0">
                <span className="text-[10px] text-gray-400 truncate">
                  To: <span className="font-mono text-gray-600 dark:text-gray-300">{LALIT_EMAIL}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposing(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <span>Send Email</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
