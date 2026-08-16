import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  from: "me" | "them";
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  avatarBg?: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  isWhatsApp?: boolean;
  messages: Message[];
}

const WHATSAPP_PHONE = "917878065017";

interface FormatItem {
  id: string;
  title: string;
  type: "job" | "project" | "network" | "resume";
  text: string;
}

// Predefined fixed message formats for messaging Lalit (Clean SVG vectors, no emojis)
const FIXED_MESSAGE_FORMATS: FormatItem[] = [
  {
    id: "job",
    title: "Job Opportunity",
    type: "job",
    text: "Hi Lalit, I viewed your portfolio and we would like to discuss a Software Engineer opportunity at our company.",
  },
  {
    id: "project",
    title: "Project Collaboration",
    type: "project",
    text: "Hi Lalit, I would like to collaborate with you on a Web / Software Development project.",
  },
  {
    id: "network",
    title: "Connect & Network",
    type: "network",
    text: "Hi Lalit, I loved your portfolio and would like to connect with you regarding your work.",
  },
  {
    id: "resume",
    title: "Resume & Discussion",
    type: "resume",
    text: "Hi Lalit, please share your updated resume and availability for a quick discussion.",
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "lalit",
    name: "Lalit Kumar",
    avatar: "LK",
    avatarBg: "linear-gradient(135deg, #007AFF, #5856D6)",
    preview: "Select a topic to send a message",
    time: "Now",
    unread: 1,
    online: true,
    isWhatsApp: true,
    messages: [
      {
        id: "1",
        text: "Hi! Thanks for checking out my portfolio. Please select a message format below to contact me directly on WhatsApp:",
        from: "them",
        time: "Just now",
      },
    ],
  },
  {
    id: "2",
    name: "Team SkillExchange",
    avatar: "SE",
    avatarBg: "linear-gradient(135deg, #007AFF, #34C759)",
    preview: "PR #42 merged successfully",
    time: "15m",
    messages: [
      {
        id: "1",
        text: "Hey, the new feature looks great!",
        from: "them",
        time: "9:00 AM",
      },
      {
        id: "2",
        text: "Thanks! Just pushed the Liquid Glass update.",
        from: "me",
        time: "9:05 AM",
      },
      {
        id: "3",
        text: "PR #42 merged successfully",
        from: "them",
        time: "9:10 AM",
      },
    ],
  },
  {
    id: "3",
    name: "Mom",
    avatar: "M",
    avatarBg: "linear-gradient(135deg, #FF2D55, #FF9500)",
    preview: "Beta aa ja khaana thanda ho raha hai",
    time: "1h",
    messages: [
      {
        id: "1",
        text: "Beta aa ja khaana thanda ho raha hai",
        from: "them",
        time: "8:00 AM",
      },
      {
        id: "2",
        text: "Coming in 5 min maa.",
        from: "me",
        time: "8:02 AM",
      },
    ],
  },
  {
    id: "4",
    name: "GitHub Notifications",
    avatar: "GH",
    avatarBg: "linear-gradient(135deg, #24292e, #4b5563)",
    preview: "New star on macOS-Portfolio!",
    time: "3h",
    messages: [
      {
        id: "1",
        text: "LalitModi90/macOS-Portfolio received a new star.",
        from: "them",
        time: "7:00 AM",
      },
      {
        id: "2",
        text: "Issue #12 updated: 'Feature request: Dark mode improvements'",
        from: "them",
        time: "7:30 AM",
      },
    ],
  },
];

function renderFormatIcon(type: string) {
  switch (type) {
    case "job":
      return (
        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "project":
      return (
        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "network":
      return (
        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "resume":
    default:
      return (
        <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
  }
}

export default function MessagesApp() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<Conversation>(INITIAL_CONVERSATIONS[0]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeConv, conversations]);

  const sendDirectText = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      from: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              preview: textToSend.trim(),
              time: "Now",
            }
          : c
      )
    );

    setActiveConv((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    setInput("");

    // If WhatsApp conversation, launch WhatsApp with fixed message
    if (activeConv.isWhatsApp) {
      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(textToSend.trim())}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleManualSend = () => {
    if (activeConv.isWhatsApp) {
      const chosen = input.trim() || FIXED_MESSAGE_FORMATS[0].text;
      sendDirectText(chosen);
    } else {
      sendDirectText(input);
    }
  };

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.preview.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "rgba(248,248,250,0.99)",
        borderRadius: "0 0 14px 14px",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          flexShrink: 0,
          borderRight: "0.5px solid rgba(0,0,0,0.1)",
          background: "rgba(242,242,247,0.98)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0,0,0,0.07)",
              borderRadius: "9px",
              padding: "5px 9px",
            }}
          >
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: "13px",
                width: "100%",
                color: "#1c1c1e",
              }}
            />
          </div>
          <button
            onClick={() => {
              setActiveConv(conversations[0]);
            }}
            title="Compose message to Lalit"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
              color: "#007AFF",
              padding: "0 2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((conv) => {
            const isSelected = activeConv.id === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConv(conv);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
                  );
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: isSelected ? "rgba(0,122,255,0.1)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  borderRadius: "10px",
                  margin: "1px 4px",
                  width: "calc(100% - 8px)",
                  transition: "background 0.15s ease",
                }}
              >
                {/* Avatar Badge */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: conv.avatarBg || "linear-gradient(135deg, #007AFF, #5856D6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#34C759",
                        border: "2px solid rgba(242,242,247,0.98)",
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: conv.unread ? 700 : 500,
                        color: "#1c1c1e",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "120px",
                      }}
                    >
                      {conv.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", flexShrink: 0 }}>
                      {conv.time}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: conv.unread ? "#1c1c1e" : "rgba(0,0,0,0.4)",
                        fontWeight: conv.unread ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "140px",
                      }}
                    >
                      {conv.preview}
                    </span>
                    {conv.unread ? (
                      <div
                        style={{
                          minWidth: 18,
                          height: 18,
                          borderRadius: 9,
                          background: "#007AFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          color: "white",
                          fontWeight: 700,
                          padding: "0 4px",
                          flexShrink: 0,
                        }}
                      >
                        {conv.unread}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(248,248,250,0.99)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: activeConv.avatarBg || "linear-gradient(135deg, #007AFF, #5856D6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "white",
            }}
          >
            {activeConv.avatar}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1c1c1e" }}>
              {activeConv.name}
            </div>
            {activeConv.online && (
              <div style={{ fontSize: "11px", color: "#34C759" }}>Active now</div>
            )}
          </div>
        </div>

        {/* Messages Feed */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <AnimatePresence>
            {activeConv.messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  display: "flex",
                  justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "8px 12px",
                    borderRadius:
                      msg.from === "me"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.from === "me"
                        ? "linear-gradient(135deg, #007AFF, #0055D4)"
                        : "rgba(229,229,234,0.9)",
                    color: msg.from === "me" ? "white" : "#1c1c1e",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Fixed Format Options in Lalit's Conversation (Vector SVGs, No Emojis) */}
          {activeConv.isWhatsApp && (
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", paddingLeft: "4px" }}>
                Select message format to send:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "6px" }}>
                {FIXED_MESSAGE_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      setInput(fmt.text);
                      sendDirectText(fmt.text);
                    }}
                    style={{
                      background: "rgba(0,122,255,0.06)",
                      border: "0.5px solid rgba(0,122,255,0.25)",
                      borderRadius: "12px",
                      padding: "8px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,122,255,0.14)";
                      e.currentTarget.style.borderColor = "#007AFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0,122,255,0.06)";
                      e.currentTarget.style.borderColor = "rgba(0,122,255,0.25)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {renderFormatIcon(fmt.type)}
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#007AFF" }}>
                        {fmt.title}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.6)", lineHeight: "1.3" }}>
                      {fmt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(248,248,250,0.99)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: activeConv.isWhatsApp ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.06)",
              borderRadius: "20px",
              padding: "6px 14px",
              gap: "8px",
              border: activeConv.isWhatsApp ? "0.5px dashed rgba(0,0,0,0.15)" : "none",
            }}
          >
            <input
              value={input}
              readOnly={activeConv.isWhatsApp}
              onChange={(e) => {
                if (!activeConv.isWhatsApp) {
                  setInput(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !activeConv.isWhatsApp) {
                  sendDirectText(input);
                }
              }}
              placeholder={
                activeConv.isWhatsApp
                  ? "Select a message format above to send..."
                  : "iMessage"
              }
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: activeConv.isWhatsApp ? "rgba(0,0,0,0.45)" : "#1c1c1e",
                cursor: activeConv.isWhatsApp ? "default" : "text",
                userSelect: activeConv.isWhatsApp ? "none" : "auto",
              }}
            />
          </div>
          <button
            onClick={() => {
              if (!activeConv.isWhatsApp) {
                sendDirectText(input);
              }
            }}
            disabled={activeConv.isWhatsApp || !input.trim()}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: !activeConv.isWhatsApp && input.trim() ? "#007AFF" : "rgba(0,0,0,0.15)",
              border: "none",
              cursor: !activeConv.isWhatsApp && input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: !activeConv.isWhatsApp && input.trim() ? "white" : "rgba(0,0,0,0.3)",
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
