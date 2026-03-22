"use client";

import { useState, useRef, useEffect } from "react";
import { P, F } from "@/lib/palette";

/* ------------------------------------------------------------------ */
/*  Static demo messages                                               */
/* ------------------------------------------------------------------ */

type Msg = {
  id: number;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  actionCard?: { icon: string; label: string };
};

const MESSAGES: Msg[] = [
  {
    id: 1,
    role: "user",
    text: "I need a list of the top 10 AI researchers currently at DeepMind specializing in multi-modal LLMs. For each, include their name, role, and one notable publication from the last 12 months.",
    timestamp: "10:42 AM",
  },
  {
    id: 2,
    role: "ai",
    text: "Understood. I\u2019ve initiated the research protocol. Scanning academic databases, Google Scholar profiles, and DeepMind\u2019s official publications page. I\u2019ll cross-reference with recent conference proceedings (NeurIPS 2025, ICML 2025).",
    timestamp: "10:43 AM",
    actionCard: {
      icon: "data_exploration",
      label: "Searching: Multi-modal LLM Researchers",
    },
  },
  {
    id: 3,
    role: "user",
    text: "Great. Once you have the list, pull their LinkedIn profile URLs and draft a short personalized outreach message for each based on their research focus.",
    timestamp: "10:45 AM",
  },
  {
    id: 4,
    role: "ai",
    text: 'Task updated: Sequence [Research \u2192 Extraction \u2192 Drafting] initiated. I\u2019ll compile the researcher profiles first, then extract LinkedIn URLs, and finally generate tailored outreach messages. Estimated completion: 4 minutes.',
    timestamp: "10:46 AM",
    actionCard: {
      icon: "data_exploration",
      label: "Pipeline: Research \u2192 Extraction \u2192 Drafting",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Static dots (3 dots with decreasing opacity)                       */
/* ------------------------------------------------------------------ */

function StaticDots() {
  const opacities = [1.0, 0.4, 0.2];
  return (
    <span style={{ display: "inline-flex", justifyContent: "space-between", gap: 4, marginLeft: 8 }}>
      {opacities.map((op, i) => (
        <span
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#1e8e3e",
            opacity: op,
          }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Material icon helper                                               */
/* ------------------------------------------------------------------ */

function Icon({
  name,
  size = 20,
  color = P.textSec,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, color, userSelect: "none", ...style }}
    >
      {name}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [sendHovered, setSendHovered] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, []);

  return (
    <>
      {/* Google Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          fontFamily: F,
          background: P.bg,
          color: P.text,
        }}
      >
        {/* ---- Header ---- */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 24px",
            background: P.bg2,
            borderBottom: `1px solid ${P.border}`,
          }}
        >
          {/* Agent avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ece0d6",
              border: "1px solid rgba(124,115,107,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="psychology" size={22} color="#635b53" />
          </div>

          {/* Name + status */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.3,
                color: P.text,
              }}
            >
              Research Strategist
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#717785",
                fontWeight: 500,
                marginTop: 1,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: P.lime,
                  animation: "statusPulse 2s ease-in-out infinite",
                }}
              />
              Analyzing LinkedIn Profiles...
            </div>
          </div>

          {/* Actions */}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Icon name="share" size={20} color={P.textTer} />
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Icon name="more_vert" size={20} color={P.textTer} />
          </button>
        </header>

        {/* ---- Messages ---- */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 24px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {MESSAGES.map((msg) =>
            msg.role === "user" ? (
              <div
                key={msg.id}
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background: "#3028e9",
                    color: "#ffffff",
                    borderRadius: "12px 0px 12px 12px",
                    padding: "12px 18px",
                    fontSize: 14,
                    lineHeight: 1.6,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#717785",
                    fontWeight: 500,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "90%",
                  display: "flex",
                  gap: 16,
                }}
              >
                {/* AI avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#ece0d6",
                    border: "1px solid rgba(124,115,107,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Icon name="psychology" size={18} color="#635b53" />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      background: P.bg2,
                      border: `1px solid #e5e7eb`,
                      borderRadius: "0px 12px 12px 12px",
                      padding: 16,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: P.text,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {msg.text}

                    {/* Action card inside bubble */}
                    {msg.actionCard && (
                      <div
                        style={{
                          background: "#f3f3f3",
                          border: "1px solid rgba(193,198,213,0.3)",
                          borderRadius: 12,
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 13,
                          color: "#1b1b1b",
                          fontWeight: 600,
                          marginTop: 12,
                        }}
                      >
                        <Icon
                          name="data_exploration"
                          size={18}
                          color="#1e8e3e"
                        />
                        {msg.actionCard.label}
                        <StaticDots />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#717785",
                      fontWeight: 500,
                      marginTop: -4,
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* ---- Input area ---- */}
        <div
          style={{
            padding: 24,
            borderTop: `1px solid ${P.border}`,
            background: P.bg2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              background: P.bg,
              border: `1px solid #e5e7eb`,
              borderRadius: 16,
              padding: "8px 12px",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 8,
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              <Icon name="attach_file" size={20} color={P.textTer} />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or command..."
              rows={1}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: F,
                fontSize: 14,
                lineHeight: 1.5,
                color: P.text,
                background: "transparent",
                padding: "4px 0",
                maxHeight: 120,
              }}
            />

            <button
              onMouseEnter={() => setSendHovered(true)}
              onMouseLeave={() => setSendHovered(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: P.lime,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 8px rgba(30,142,62,0.35)`,
                transform: sendHovered ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.15s ease",
              }}
            >
              <Icon name="send" size={18} color="#ffffff" />
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "#717785",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              padding: "8px 0 4px",
            }}
          >
            Research Strategist Agent v2.4 (Active Pipeline)
          </div>
        </div>

        {/* Global keyframe */}
        <style>{`
          @keyframes statusPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </>
  );
}
