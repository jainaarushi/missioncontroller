"use client";

import React, { useState } from "react";
import { P, F } from "@/lib/palette";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type DraftStatus = "ready" | "drafting" | "manual";

interface DraftRow {
  id: number;
  name: string;
  initials: string;
  company: string;
  message: string;
  status: DraftStatus;
}

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const ROWS: DraftRow[] = [
  {
    id: 1,
    name: "Sarah Kendrick",
    initials: "SK",
    company: "Lumina Systems",
    message: "Hi Sarah, I noticed your recent talk...",
    status: "ready",
  },
  {
    id: 2,
    name: "Marcus Jensen",
    initials: "MJ",
    company: "Flowstate Labs",
    message: "Great post about the Series B funding...",
    status: "drafting",
  },
  {
    id: 3,
    name: "Anita Lowe",
    initials: "AL",
    company: "Cognito AI",
    message: "Hello Anita, saw your interview...",
    status: "ready",
  },
  {
    id: 4,
    name: "David Tan",
    initials: "DT",
    company: "Peak Performance",
    message: "Hi David, hope you're having a great week!",
    status: "manual",
  },
];

const STATUS_LABELS: Record<DraftStatus, string> = {
  ready: "Ready for Review",
  drafting: "AI Drafting...",
  manual: "Manual Check Req.",
};

const STATUS_COLORS: Record<DraftStatus, { bg: string; text: string; border: string }> = {
  ready: { bg: "#f0fdf4", text: "#15803d", border: "1px solid #bbf7d0" },
  drafting: { bg: "#eff6ff", text: "#1d4ed8", border: "1px solid #bfdbfe" },
  manual: { bg: "#fff7ed", text: "#c2410c", border: "1px solid #fed7aa" },
};

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  SK: { bg: "#ece0d6", text: "#423ff7" },
  MJ: { bg: "#e1dfff", text: "#423ff7" },
  AL: { bg: "#76ff65", text: "#006c05" },
  DT: { bg: "#e5e7eb", text: "#4b5563" },
};

/* ------------------------------------------------------------------ */
/*  Keyframe injection (once)                                          */
/* ------------------------------------------------------------------ */

const KEYFRAMES_ID = "__drafting_keyframes";
if (typeof document !== "undefined" && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
    @keyframes wiggle-edit { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
  `;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  Phase indicator                                                    */
/* ------------------------------------------------------------------ */

function PhaseIndicator() {
  const steps = [
    { label: "Research", state: "completed" as const },
    { label: "Drafting", state: "active" as const },
    { label: "Sending", state: "pending" as const },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        fontFamily: F,
      }}
    >
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          {/* connector line before (except first) */}
          {i > 0 && (
            <div
              style={{
                width: 80,
                height: 3,
                borderRadius: 2,
                background:
                  step.state === "pending" ? "#d1d5db" : "#1e8e3e",
              }}
            />
          )}

          {/* step circle + label */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {step.state === "completed" ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#1e8e3e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* check icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : step.state === "active" ? (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "4px solid #1e8e3e",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px rgba(30,142,62,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* edit / pencil icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e8e3e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "wiggle-edit 1.2s ease-in-out infinite" }}
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "2px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
            )}

            <span
              style={{
                fontSize: 13,
                fontWeight: step.state === "active" ? 600 : 500,
                color:
                  step.state === "active" ? "#1e8e3e" : step.state === "pending" ? "#9ca3af" : P.text,
              }}
            >
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status card                                                        */
/* ------------------------------------------------------------------ */

function StatusCard() {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: F,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* psychology icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 10,
            background: "#4d4bff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 1.76-.57 3.39-1.53 4.72l1.43 1.44A9.932 9.932 0 0022 12c0-5.18-3.95-9.45-9-9.95zM12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 4h2v5h-2zm0 7h2v2h-2z" />
          </svg>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* green pulse dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#1e8e3e",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: P.text,
              }}
            >
              Drafting in Progress
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            Research Strategist is synthesizing LinkedIn profiles and company news into personalized outreach.
          </p>
        </div>
      </div>

      {/* send button */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1e8e3e",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: F,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {/* rocket icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
        Send All Approved Drafts
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data table                                                         */
/* ------------------------------------------------------------------ */

function DataTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: F,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      {/* table header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: P.text,
          }}
        >
          Generated Message Pipeline
        </h3>

        <div style={{ display: "flex", gap: 8 }}>
          {/* filter button */}
          <button
            style={{
              background: "none",
              border: "none",
              borderRadius: 6,
              padding: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#9ca3af",
              fontFamily: F,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          {/* more button */}
          <button
            style={{
              background: "none",
              border: "none",
              borderRadius: 6,
              padding: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#9ca3af",
              fontFamily: F,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#9ca3af"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#eeeeee",
              textAlign: "left",
            }}
          >
            {["Profile Name", "Company", "Drafted Message Preview", "Status", "Actions"].map(
              (col) => (
                <th
                  key={col}
                  style={{
                    padding: "16px 24px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {ROWS.map((row) => {
            const isHovered = hoveredRow === row.id;
            const sc = STATUS_COLORS[row.status];

            return (
              <tr
                key={row.id}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  background: isHovered ? "#fafafa" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                {/* Profile Name */}
                <td style={{ padding: "14px 16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: AVATAR_COLORS[row.initials]?.bg ?? "rgba(66,63,247,0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: AVATAR_COLORS[row.initials]?.text ?? "#423ff7",
                        flexShrink: 0,
                      }}
                    >
                      {row.initials}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: P.text,
                      }}
                    >
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* Company */}
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 14,
                    color: "#6b7280",
                  }}
                >
                  {row.company}
                </td>

                {/* Drafted Message Preview */}
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    fontStyle: "italic",
                    color: "#6b7280",
                    maxWidth: 280,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.message}
                </td>

                {/* Status */}
                <td style={{ padding: "14px 16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      background: sc.bg,
                      color: sc.text,
                      border: sc.border,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: "14px 16px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      opacity: row.status === "drafting" ? 0.4 : isHovered ? 1 : 0,
                      cursor: row.status === "drafting" ? "not-allowed" : "default",
                      pointerEvents: row.status === "drafting" ? "none" : "auto",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {/* approve (check_circle) */}
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Approve"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1e8e3e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </button>

                    {/* edit */}
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Edit"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>

                    {/* refresh */}
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Regenerate"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* pagination footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderTop: "1px solid #e5e7eb",
          fontSize: 13,
          color: "#6b7280",
          background: "#f9fafb",
        }}
      >
        <span>Showing 4 of 128 drafted messages</span>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              color: "#6b7280",
              cursor: "pointer",
              fontFamily: F,
            }}
          >
            Previous
          </button>
          <button
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              color: "#6b7280",
              cursor: "pointer",
              fontFamily: F,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DraftingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f3f3",
        fontFamily: F,
      }}
    >
      <PhaseIndicator />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <StatusCard />
        <DataTable />
      </div>
    </div>
  );
}
