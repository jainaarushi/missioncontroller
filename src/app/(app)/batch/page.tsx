"use client";

import { useState } from "react";
import { F } from "@/lib/palette";

const GREEN = "#006c05";
const BLUE = "#423ff7";
const RED = "#ba1a1a";
const TEXT = "#1b1b1b";
const TEXT_SEC = "#6b7280";
const BG = "#f9f9f9";
const CARD_BORDER = "#e2e8f0";
const CARD_RADIUS = "12px";

type RecipientStatus = "delivered" | "sending" | "failed" | "queued";

interface Recipient {
  name: string;
  role: string;
  company: string;
  avatar: string;
  strategy: string;
  status: RecipientStatus;
}

const recipients: Recipient[] = [
  {
    name: "Jane Doe",
    role: "Senior Technical Recruiter",
    company: "Stripe",
    avatar: "https://ui-avatars.com/api/?name=Jane+Doe&background=e8f5e9&color=1e8e3e&bold=true",
    strategy: "Personalized Pitch",
    status: "delivered",
  },
  {
    name: "Michael Smith",
    role: "Head of Talent",
    company: "Vercel",
    avatar: "https://ui-avatars.com/api/?name=Michael+Smith&background=e8f5e9&color=1e8e3e&bold=true",
    strategy: "Project Connection",
    status: "delivered",
  },
  {
    name: "Sarah Williams",
    role: "Director of Engineering",
    company: "Figma",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Williams&background=e8eafd&color=423ff7&bold=true",
    strategy: "Quick Introduction",
    status: "sending",
  },
  {
    name: "Kevin Brown",
    role: "Founding Engineer",
    company: "Linear",
    avatar: "https://ui-avatars.com/api/?name=Kevin+Brown&background=fde8e8&color=ba1a1a&bold=true",
    strategy: "Deep Research",
    status: "failed",
  },
  {
    name: "Linda Ortega",
    role: "Recruiting Lead",
    company: "Atlassian",
    avatar: "https://ui-avatars.com/api/?name=Linda+Ortega&background=f3f4f6&color=6b7280&bold=true",
    strategy: "Standard Invite",
    status: "queued",
  },
];

function StatusInline({ status }: { status: RecipientStatus }) {
  const config: Record<
    RecipientStatus,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    delivered: {
      label: "Delivered",
      color: GREEN,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    sending: {
      label: "Sending...",
      color: BLUE,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ),
    },
    failed: {
      label: "Failed",
      color: RED,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    queued: {
      label: "Queued",
      color: "#94a3b8",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 22h14" />
          <path d="M5 2h14" />
          <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
          <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
      ),
    },
  };

  const c = config[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: c.color,
        fontFamily: F,
      }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function StrategyPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        color: "#334155",
        background: "#f1f5f9",
        fontFamily: F,
      }}
    >
      {label}
    </span>
  );
}

export default function BatchPage() {
  const [throttle, setThrottle] = useState(65);

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${GREEN};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${GREEN};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: BG,
          fontFamily: F,
          color: TEXT,
          padding: "32px 40px",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 13,
            color: TEXT_SEC,
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          Pipelines{" "}
          <span style={{ margin: "0 6px", color: "#d1d5db" }}>{"\u203A"}</span>
          <span style={{ color: GREEN, fontWeight: 600 }}>Batch #B-9921</span>
        </div>

        {/* Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Active Deployment
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: `1px solid ${CARD_BORDER}`,
                background: "white",
                color: TEXT,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: F,
              }}
            >
              Pause Queue
            </button>
            <button
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "1px solid rgba(186,26,26,0.2)",
                background: "rgba(186,26,26,0.06)",
                color: RED,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: F,
              }}
            >
              Cancel Remaining
            </button>
          </div>
        </div>

        {/* Bento Grid: Hero + Throttle */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Hero Card */}
          <div
            style={{
              gridColumn: "span 8",
              background: "white",
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: CARD_RADIUS,
              padding: 28,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative send icon */}
            <div
              style={{
                position: "absolute",
                bottom: -48,
                right: -48,
                opacity: 0.05,
                pointerEvents: "none",
                transform: "rotate(12deg)",
              }}
            >
              <svg width="256" height="256" viewBox="0 0 24 24" fill={TEXT}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* Badge */}
            <span
              style={{
                display: "inline-block",
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                color: "#3028e9",
                background: "rgba(66,63,247,0.08)",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: "1px solid rgba(48,40,233,0.2)",
              }}
            >
              Sending 12 Approved Drafts
            </span>

            {/* Title row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  LinkedIn Outreach Campaign: Tech Recruiters
                </h2>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={BLUE}
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div style={{ flexShrink: 0, marginLeft: 24, textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: GREEN,
                    lineHeight: 1,
                  }}
                >
                  33%
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "-0.05em",
                    marginTop: 4,
                  }}
                >
                  Overall Progress
                </div>
              </div>
            </div>

            {/* Sent / Pending text row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600, color: "#334155" }}>4 of 12 Sent</span>
              <span style={{ color: "#94a3b8" }}>8 Pending</span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 16,
                borderRadius: 9999,
                background: "#f1f5f9",
                overflow: "hidden",
                marginBottom: 20,
                display: "flex",
              }}
            >
              <div
                style={{
                  width: "33%",
                  background: GREEN,
                  borderRadius: "9999px 0 0 9999px",
                }}
              />
              <div
                style={{
                  width: "8%",
                  background: BLUE,
                  opacity: 0.3,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "#eeeeee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 500 }}>
                    Average Speed
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    2.4s / msg
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "#eeeeee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 500 }}>
                    Total Duration
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    01:45 active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Throttle Control */}
          <div
            style={{
              gridColumn: "span 4",
              background: "white",
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: CARD_RADIUS,
              padding: 24,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Adjust Throttle
              </h3>
            </div>

            <div
              style={{
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
                Current Speed: <span style={{ color: TEXT }}>Balanced</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
                Recommended
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={100}
              value={throttle}
              onChange={(e) => setThrottle(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: GREEN,
                height: 6,
                marginBottom: 8,
                cursor: "pointer",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: TEXT_SEC,
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              <span>Cautious</span>
              <span>Steady</span>
              <span>Aggressive</span>
            </div>

            <div
              style={{
                background: "#eeeeee",
                borderRadius: 8,
                padding: "10px 14px",
                marginTop: "auto",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#475569",
                  fontStyle: "italic",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Balanced speed mimics human interaction patterns to prevent
                LinkedIn rate limiting.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row - Queue Position only */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "white",
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: CARD_RADIUS,
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#eeeeee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 500 }}>
                Queue Position
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                8{" "}
                <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_SEC }}>
                  remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Queue Table */}
        <div
          style={{
            background: "white",
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: `1px solid ${CARD_BORDER}`,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              Recipient Queue
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  border: `1px solid ${CARD_BORDER}`,
                  background: "white",
                  color: TEXT,
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: F,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Logs
              </button>
              <button
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  border: `1px solid ${CARD_BORDER}`,
                  background: "white",
                  color: TEXT,
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: F,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear Finished
              </button>
            </div>
          </div>

          {/* Column Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 1.2fr 1fr 0.8fr",
              padding: "10px 24px",
              borderBottom: `1px solid ${CARD_BORDER}`,
              background: "#f8fafc",
              fontSize: 12,
              fontWeight: 600,
              color: TEXT_SEC,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            <span>Recipient</span>
            <span>Draft Strategy</span>
            <span>Status</span>
            <span style={{ textAlign: "right" }}>Action</span>
          </div>

          {/* Rows */}
          {recipients.map((r, i) => {
            const isFailed = r.status === "failed";
            const isQueued = r.status === "queued";
            const isDelivered = r.status === "delivered";
            const isSending = r.status === "sending";

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1.2fr 1fr 0.8fr",
                  padding: "14px 24px",
                  alignItems: "center",
                  borderBottom:
                    i < recipients.length - 1
                      ? `1px solid ${CARD_BORDER}`
                      : "none",
                  background: isFailed
                    ? "rgba(186,26,26,0.03)"
                    : "transparent",
                }}
              >
                {/* Recipient */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={r.avatar}
                    alt={r.name}
                    width={36}
                    height={36}
                    style={{
                      borderRadius: "50%",
                      flexShrink: 0,
                      ...(isQueued
                        ? { opacity: 0.4, filter: "grayscale(1)" }
                        : {}),
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isQueued ? "#94a3b8" : TEXT,
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isQueued ? "#94a3b8" : TEXT_SEC,
                      }}
                    >
                      {r.role} @ {r.company}
                    </div>
                  </div>
                </div>

                {/* Strategy */}
                <div>
                  <StrategyPill label={r.strategy} />
                </div>

                {/* Status */}
                <div>
                  <StatusInline status={r.status} />
                </div>

                {/* Action */}
                <div style={{ textAlign: "right" }}>
                  {isFailed && (
                    <span
                      style={{
                        color: GREEN,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: F,
                      }}
                    >
                      Retry Now
                    </span>
                  )}
                  {(isDelivered || isSending) && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="View"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  )}
                  {isQueued && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Edit"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_SEC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div
            style={{
              padding: "14px 24px",
              borderTop: `1px solid ${CARD_BORDER}`,
              textAlign: "center",
              fontSize: 13,
              color: BLUE,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View all 12 recipients in queue
          </div>
        </div>
      </div>
    </>
  );
}
