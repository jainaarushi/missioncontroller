"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { P, F } from "@/lib/palette";

/* --- hardcoded demo data (Research Strategist) --- */
const DEMO = {
  name: "Research Strategist",
  version: "V4.2.0",
  subtitle: "Internal System Agent",
  avatar: "\uD83E\uDDE0", // brain emoji as psychology icon stand-in
  description:
    "Specializing in comprehensive market intelligence and strategic analysis, this agent synthesizes data from multiple sources to deliver actionable insights. Key strengths include deep-dive research methodology, quantitative modeling, and predictive trend analysis that empowers data-driven decision making.",
  boldTerms: [
    "market intelligence",
    "strategic analysis",
    "quantitative modeling",
    "predictive trend analysis",
  ],
  skills: [
    "Deep Market Research",
    "Quantitative Analysis",
    "Competitor Benchmarking",
    "Trend Forecasting",
    "Sentiment Analysis",
  ],
  presets: [
    "Market Landscape Analysis",
    "Competitor Deep-Dive",
    "Trend Forecast Report",
    "Sentiment Overview",
  ],
};

/* --- tiny SVG icon helpers (inline, no dep) --- */
const ArrowBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a">
    <path d="M12 1l3.09 4.26L20 6.27l-2.18 4.32L18.18 16 12 18.27 5.82 16l.36-5.41L4 6.27l4.91-1.01z" />
    <path d="M10 15.17l-3.59-3.58L7.83 10.17 10 12.34l6.17-6.17 1.42 1.41z" fill="#fff" />
  </svg>
);

const TuneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
);

const SpeedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const KnowledgeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/* --- helpers --- */
function highlightTerms(text: string, terms: string[]) {
  const parts: { text: string; bold: boolean }[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    let earliest = -1;
    let matchTerm = "";
    for (const t of terms) {
      const idx = remaining.toLowerCase().indexOf(t.toLowerCase());
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        matchTerm = t;
      }
    }
    if (earliest === -1) {
      parts.push({ text: remaining, bold: false });
      break;
    }
    if (earliest > 0) parts.push({ text: remaining.slice(0, earliest), bold: false });
    parts.push({ text: remaining.slice(earliest, earliest + matchTerm.length), bold: true });
    remaining = remaining.slice(earliest + matchTerm.length);
  }
  return parts;
}

export default function AgentProfilePage() {
  const params = useParams();
  const _slug = params.slug as string;
  const [selectedPreset, setSelectedPreset] = useState(DEMO.presets[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  const descParts = highlightTerms(DEMO.description, DEMO.boldTerms);

  return (
    <div style={{ fontFamily: F, background: "#F8FAFC", minHeight: "100vh" }}>
      {/* --- Header Bar --- */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/agents"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: 500,
              color: backHovered ? "#16a34a" : "#64748b",
              textDecoration: "none",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
          >
            <ArrowBack />
            Back to Directory
          </Link>
          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Specialist Profile</span>
            <span style={{ color: "#94A3B8", margin: "0 2px" }}>/</span>
            <span style={{ color: "#64748b" }}>{DEMO.name}</span>
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Operational pill */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: "#16a34a",
              background: "#f0fdf4",
              border: "1px solid #dcfce7",
              padding: "5px 14px",
              borderRadius: 999,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#16a34a",
                display: "inline-block",
                animation: "pulse-dot 2s infinite",
              }}
            />
            Operational
          </span>
          {/* Share - icon only circle */}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <ShareIcon />
          </button>
        </div>
      </header>

      {/* --- Main Grid --- */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          paddingTop: 128,
          paddingLeft: 32,
          paddingRight: 32,
          paddingBottom: 64,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* === Left Column === */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Hero Profile Card */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: 40,
              boxShadow: P.shadow,
            }}
          >
            {/* Decorative green blob */}
            <div
              style={{
                position: "absolute",
                top: -128,
                right: -128,
                width: 256,
                height: 256,
                borderRadius: "50%",
                background: "rgba(22,163,74,0.05)",
                filter: "blur(48px)",
                pointerEvents: "none",
              }}
            />
            {/* Avatar + meta */}
            <div style={{ display: "flex", gap: 28, marginBottom: 28, position: "relative" }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 20,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    outline: "4px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 64,
                  }}
                >
                  {DEMO.avatar}
                </div>
                {/* Active badge - rectangular, wrapped in white container */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -6,
                    right: -6,
                    background: "#fff",
                    borderRadius: 8,
                    padding: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      background: "#16a34a",
                      padding: "3px 10px",
                      borderRadius: 6,
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                {/* Name + Verified on same line */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h1
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: 0,
                      lineHeight: 1.15,
                    }}
                  >
                    {DEMO.name}
                  </h1>
                  {/* Verified badge */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#16a34a",
                      background: "rgba(22,163,74,0.08)",
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                  >
                    <VerifiedIcon />
                    Verified Expert
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "#94A3B8",
                    margin: "10px 0 0",
                    fontWeight: 500,
                  }}
                >
                  {DEMO.subtitle} &middot; {DEMO.version}
                </p>
              </div>
            </div>

            {/* Expertise & Focus */}
            <div style={{ position: "relative" }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0F172A",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  margin: "0 0 10px",
                }}
              >
                Expertise &amp; Focus
              </h3>
              <p style={{ fontSize: 18, lineHeight: 1.625, color: "#475569", margin: 0 }}>
                {descParts.map((p, i) =>
                  p.bold ? (
                    <strong key={i} style={{ color: "#0F172A" }}>
                      {p.text}
                    </strong>
                  ) : (
                    <span key={i}>{p.text}</span>
                  )
                )}
              </p>
            </div>

            {/* Skill tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, position: "relative" }}>
              {DEMO.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                    background: "#F1F5F9",
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    transition: "border-color 0.15s",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Two capability cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Processing Speed */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 24,
                padding: 32,
                boxShadow: P.shadow,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(22,163,74,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <SpeedIcon />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                Processing Speed
              </h4>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                Capable of analyzing and synthesizing over{" "}
                <strong style={{ color: "#0F172A" }}>500+ documents per minute</strong>, enabling rapid
                turnaround on complex research tasks.
              </p>
            </div>

            {/* Knowledge Base */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 24,
                padding: 32,
                boxShadow: P.shadow,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(59,130,246,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <KnowledgeIcon />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                Knowledge Base
              </h4>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                Equipped with{" "}
                <strong style={{ color: "#0F172A" }}>live web access</strong> and continuously
                updated data feeds for real-time market intelligence and trend monitoring.
              </p>
            </div>
          </div>

          {/* Dark CTA card */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#0f172a",
              borderRadius: 24,
              padding: 40,
              border: "1px solid #1e293b",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 32,
            }}
          >
            {/* Decorative green glow - larger */}
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 384,
                height: 384,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ flex: 1, position: "relative" }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Need a custom strategic directive?
              </h3>
              <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                Tailor this agent&apos;s capabilities to your exact requirements with a bespoke
                configuration and specialized prompt engineering.
              </p>
            </div>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: "#16a34a",
                border: "none",
                borderRadius: 10,
                padding: "10px 22px",
                cursor: "pointer",
                transition: "background 0.15s",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <TuneIcon />
              Configure Custom Task
            </button>
          </div>
        </div>

        {/* === Right Column (sticky) === */}
        <div
          style={{
            position: "sticky",
            top: 108,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Deployment Console */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: P.shadow,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px 32px",
                background: "#F8FAFC",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94A3B8",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Deployment Console
              </span>
            </div>

            <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Dropdown */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#475569",
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Select Directive Preset
                </label>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#0F172A",
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "16px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {selectedPreset}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        boxShadow: P.shadowFloat,
                        zIndex: 20,
                        overflow: "hidden",
                      }}
                    >
                      {DEMO.presets.map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setSelectedPreset(p);
                            setDropdownOpen(false);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            fontSize: 13,
                            fontWeight: selectedPreset === p ? 600 : 400,
                            color: selectedPreset === p ? "#16a34a" : "#0F172A",
                            background: selectedPreset === p ? "rgba(22,163,74,0.05)" : "transparent",
                            border: "none",
                            padding: "10px 14px",
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Details card */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #f1f5f9",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
                    Deployment Priority
                  </span>
                  <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 700 }}>Standard</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
                    Est. Completion
                  </span>
                  <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 700 }}>
                    12-18 Minutes
                  </span>
                </div>
                <div style={{ height: 1, background: "#e2e8f0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>Credit Cost</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 18,
                      color: "#0F172A",
                      fontWeight: 800,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#16a34a" }}>generating_tokens</span>
                    450
                  </span>
                </div>
              </div>

              {/* Execute button */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button
                  style={{
                    width: "100%",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#fff",
                    background: "#16a34a",
                    border: "none",
                    borderRadius: 12,
                    padding: "20px 0",
                    cursor: "pointer",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(22,163,74,0.1)",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <span>Execute Deployment</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span>
                </button>

                {/* Fine print */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 11,
                    color: "#94A3B8",
                    fontWeight: 500,
                    fontStyle: "italic",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                  Credits are auto-deducted upon initialization.
                </div>
              </div>
            </div>
          </div>

          {/* Help card */}
          <div
            style={{
              marginTop: 24,
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: 24,
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#94A3B8", flexShrink: 0 }}>help_outline</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", margin: 0, marginBottom: 4 }}>
                Need help with presets?
              </p>
              <p style={{ fontSize: 11, color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>
                View the{" "}
                <a href="#" style={{ color: "#16a34a", textDecoration: "none" }}>
                  Directive Documentation
                </a>{" "}
                to understand the output of each preset.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer bar (tablet/mobile only — hidden on lg) */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: "#fff",
          borderTop: "1px solid #e2e8f0",
          padding: 16,
        }}
        className="lg:hidden"
      >
        <div style={{ maxWidth: 448, margin: "0 auto" }}>
          <button
            style={{
              width: "100%",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "#16a34a",
              border: "none",
              borderRadius: 12,
              padding: "16px 0",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span>
            Confirm & Deploy
          </button>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
