"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/shared/command-palette";
import { SWRProvider } from "@/components/providers/swr-provider";
import { useAgents } from "@/lib/hooks/use-agents";
import { useStats } from "@/lib/hooks/use-stats";
import { useTasks } from "@/lib/hooks/use-tasks";
import { P, F, FM } from "@/lib/palette";

function MobileNav({ reviewCount }: { reviewCount: number }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: "#ffffff",
      borderTop: `1px solid ${P.border}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "6px 0",
      paddingBottom: "max(6px, env(safe-area-inset-bottom))",
      minHeight: 56,
    }}>
      {[
        { href: "/today", icon: "\u25A6", label: "Dashboard" },
        { href: "/agents", icon: "\u263A", label: "Agents" },
        { href: "/templates", icon: "\uD83D\uDCC1", label: "Templates" },
        { href: "/analytics", icon: "\uD83D\uDCCA", label: "Analytics" },
        { href: "/settings", icon: "\u2699\uFE0F", label: "Settings" },
      ].map((item) => (
        <a key={item.href} href={item.href} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          textDecoration: "none", color: "#4b5563", fontSize: 10, fontWeight: 500,
          fontFamily: F, position: "relative",
        }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span>{item.label}</span>
          {item.href === "/analytics" && reviewCount > 0 && (
            <span style={{
              position: "absolute", top: -2, right: -6,
              width: 16, height: 16, borderRadius: "50%",
              backgroundColor: "#1e8e3e", color: "#fff",
              fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{reviewCount}</span>
          )}
        </a>
      ))}
    </nav>
  );
}

function Topbar() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "0 24px",
      height: 64, minHeight: 64,
      borderBottom: `1px solid ${P.border}`,
      background: "#ffffff",
      position: "sticky", top: 0, zIndex: 20,
    }}>
      {/* Brand text - mobile only (hidden on desktop via CSS class) */}
      <div className="topbar-brand-mobile" style={{
        fontSize: 18, fontWeight: 700, fontFamily: F, color: "#1e8e3e", flexShrink: 0,
      }}>
        Agent Studio
      </div>

      {/* Horizontal nav links */}
      <div className="topbar-nav-links" style={{
        display: "flex", alignItems: "center", gap: 4, marginLeft: 8,
      }}>
        {[
          { href: "/today", label: "Dashboard" },
          { href: "/agents", label: "Agents" },
          { href: "/templates", label: "Templates" },
          { href: "/settings", label: "Settings" },
        ].map((item) => (
          <a key={item.href} href={item.href} style={{
            padding: "6px 12px",
            fontSize: 13, fontWeight: 500, fontFamily: F,
            color: "#4b5563", textDecoration: "none",
            borderBottom: "2px solid transparent",
            transition: "color 0.15s, border-color 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1e8e3e"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5563"; }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Search bar */}
      <div style={{
        flex: 1, maxWidth: 400,
        display: "flex", alignItems: "center", gap: 8,
        background: "#f3f4f6", border: "none",
        borderRadius: 12, padding: "8px 14px", marginLeft: 16,
      }}>
        <span style={{ color: "#9ca3af", fontSize: 14 }}>&#128269;</span>
        <span style={{ color: "#9ca3af", fontFamily: F, fontSize: 13, flex: 1 }}>
          Search...
        </span>
        <span style={{
          fontSize: 10, color: "#9ca3af",
          background: "#e5e7eb", padding: "2px 7px", borderRadius: 5,
          fontWeight: 500, whiteSpace: "nowrap",
        }}>&#8984;K</span>
      </div>

      {/* Right icons */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          border: `1px solid ${P.border}`, background: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 16,
        }}>&#128276;</div>
        <a href="/settings" style={{
          width: 40, height: 40, borderRadius: 12,
          border: `1px solid ${P.border}`, background: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 16, textDecoration: "none",
        }}>&#9881;&#65039;</a>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #1e8e3e, #15e11e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 14, fontWeight: 700,
          border: "2px solid #ffffff", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
        }}>A</div>
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { agents } = useAgents();
  const { stats } = useStats();
  const { tasks } = useTasks();

  const reviewCount = tasks.filter((t) => t.status === "review").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9f9f9", color: P.text, fontFamily: F, fontSize: 13, lineHeight: 1.5 }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes cardReveal { from{opacity:0;transform:translateY(20px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 4px currentColor;opacity:1}50%{box-shadow:0 0 14px currentColor;opacity:0.7} }
        @keyframes glow { 0%,100%{opacity:1;box-shadow:0 0 4px currentColor}50%{opacity:0.6;box-shadow:0 0 12px currentColor} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes progress { 0%{transform:scaleX(0) translateX(0)} 50%{transform:scaleX(0.7) translateX(30%)} 100%{transform:scaleX(0) translateX(200%)} }
        @keyframes confettiFall { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(200px) rotate(720deg)} }
        .agent-card { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1); }
        .agent-card:hover { transform: translateY(-3px) !important; }
        .agent-card:active { transform: scale(0.97) !important; transition-duration: 0.1s; }
        * { box-sizing:border-box }
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:3px}
        ::selection{background:rgba(30,142,62,0.15)}

        /* Topbar brand: show only on mobile */
        .topbar-brand-mobile { display: none; }

        /* Mobile bottom nav */
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
          .app-content-wrapper { padding: 0 !important; }
          .topbar-brand-mobile { display: block !important; }
          .topbar-nav-links { display: none !important; }
        }
      `}</style>
      <div className="desktop-sidebar">
        <Sidebar
          stats={stats}
          reviewCount={reviewCount}
          tasks={tasks}
        />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 }}>
        <Topbar />
        <div className="app-content-wrapper" style={{ flex: 1, overflowY: "auto", background: "#f9f9f9" }}>
          {children}
        </div>
      </div>
      <div className="mobile-nav">
        <MobileNav reviewCount={reviewCount} />
      </div>
      <CommandPalette tasks={tasks} agents={agents} />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRProvider>
      <AppShell>{children}</AppShell>
    </SWRProvider>
  );
}
