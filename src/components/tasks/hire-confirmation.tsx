"use client";

import { useState, useEffect } from "react";
import { P, F } from "@/lib/palette";

interface HireConfirmationProps {
  open: boolean;
  agentName: string;
  agentIcon: string;
  agentColor: string;
  onChat?: () => void;
  onDashboard?: () => void;
  onClose: () => void;
}

export function HireConfirmation({ open, agentName, agentIcon, agentColor, onChat, onDashboard, onClose }: HireConfirmationProps) {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([
    { label: "Initializing Connections", done: false },
    { label: "LinkedIn API (Connected)", done: false },
    { label: "Google Search (Connected)", done: false },
    { label: "Proprietary Knowledge Base (Loading)", done: false },
  ]);

  useEffect(() => {
    if (!open) { setProgress(0); return; }
    // Simulate deployment progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15 + 5;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    // Update steps based on progress
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      done: progress > (i + 1) * 25,
    })));
  }, [progress]);

  if (!open) return null;

  const pct = Math.min(100, Math.round(progress));
  const deploying = pct < 100;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
      }} />
      <div style={{
        position: "relative", width: "min(640px, 92vw)",
        background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb",
        boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
        padding: "48px 40px", textAlign: "center",
        animation: "modalIn 0.4s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "#20e524",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#002200">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1b1b1b", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Agent Successfully Hired!
        </h1>
        <p style={{ fontSize: 15, color: "#717785", maxWidth: 512, margin: "0 auto", marginBottom: 40, lineHeight: 1.6 }}>
          Your autonomous agent has been provisioned and is currently initializing its environment.
        </p>

        {/* Deployment tracker card */}
        <div style={{
          background: "#f3f3f3", borderRadius: 8, padding: 24,
          border: "1px solid #c1c6d5", textAlign: "left", marginBottom: 32,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: agentColor || "#423ff7",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#fff",
              }}>
                {agentIcon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1b1b1b" }}>{agentName}</div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: deploying ? "#3028e9" : "#16a34a",
                  letterSpacing: "0.05em",
                }}>
                  {deploying ? "DEPLOYING" : "DEPLOYED"}
                </div>
              </div>
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#1b1b1b" }}>{pct}%</span>
          </div>

          {/* Progress bar */}
          <div style={{
            width: "100%", height: 12, background: "#e2e2e2",
            borderRadius: 6, overflow: "hidden", marginBottom: 32,
          }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: "#006c05", borderRadius: 6,
              transition: "width 0.5s ease",
            }} />
          </div>

          {/* Checklist */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {steps.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                {s.done ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#006c05" stroke="#006c05" strokeWidth="0">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ) : (
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: "2px solid #006c05", borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                  }} />
                )}
                <span style={{ color: "#1b1b1b", fontWeight: s.done ? 400 : 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
          <button
            onClick={onChat || onClose}
            style={{
              background: "#006c05", color: "#fff",
              padding: "16px 48px", borderRadius: 8,
              fontSize: 14, fontWeight: 700, border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 10px 15px -3px rgba(0,108,5,0.2)",
              transition: "opacity 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            Start Chatting with Agent
          </button>
          <button
            onClick={onDashboard || onClose}
            style={{
              background: "#e2e2e2", color: "#1b1b1b",
              padding: "16px 32px", borderRadius: 8,
              fontSize: 14, fontWeight: 700, border: "none",
              cursor: "pointer", transition: "background 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d1d5db"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#e2e2e2"; }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
