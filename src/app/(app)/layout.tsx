"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/shared/command-palette";
import { SWRProvider } from "@/components/providers/swr-provider";
import { useAgents } from "@/lib/hooks/use-agents";
import { useStats } from "@/lib/hooks/use-stats";
import { useTasks } from "@/lib/hooks/use-tasks";
import { P } from "@/lib/palette";

function MobileNav({ reviewCount }: { reviewCount: number }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
      borderTop: "1px solid rgba(0,0,0,0.06)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0",
      paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      minHeight: 56,
    }}>
      {[
        { href: "/today", icon: "🏠", label: "Today" },
        { href: "/agents", icon: "\u{1F916}", label: "Agents" },
        { href: "/templates", icon: "\u{1F4CB}", label: "Templates" },
        { href: "/analytics", icon: "\u{1F4CA}", label: "Analytics" },
        { href: "/settings", icon: "⚙️", label: "Settings" },
      ].map((item) => (
        <a key={item.href} href={item.href} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          textDecoration: "none", color: P.textSec, fontSize: 10, fontWeight: 600,
          position: "relative",
        }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span>{item.label}</span>
          {item.href === "/today" && reviewCount > 0 && (
            <span style={{
              position: "absolute", top: -2, right: -6,
              width: 16, height: 16, borderRadius: "50%",
              backgroundColor: P.coral, color: "#fff",
              fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{reviewCount}</span>
          )}
        </a>
      ))}
    </nav>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { agents } = useAgents();
  const { stats } = useStats();
  const { tasks } = useTasks();

  const reviewCount = tasks.filter((t) => t.status === "review").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAF8" }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes cardReveal { from{opacity:0;transform:translateY(20px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes thumbZoom { from{transform:scale(1.08)}to{transform:scale(1)} }
        @keyframes scrollPulse { 0%,100%{transform:translateY(-50%) scale(1);box-shadow:0 2px 12px rgba(0,0,0,0.1)}50%{transform:translateY(-50%) scale(1.05);box-shadow:0 4px 20px rgba(0,0,0,0.14)} }
        .agent-card { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1); }
        .agent-card:hover { transform: translateY(-2px) !important; }
        .agent-card:hover .agent-thumb-img { transform: scale(1.05) !important; }
        .agent-card:active { transform: scale(0.97) !important; transition-duration: 0.1s; }
        .agent-thumb-img { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        @keyframes floatY { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(124,58,237,0.15)}50%{border-color:rgba(124,58,237,0.35)} }
        .create-bar { animation: borderGlow 3s ease-in-out infinite; }
        .create-bar:hover { animation: none !important; }
        .usage-panel { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .section-header { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .task-section { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 4px currentColor;opacity:1}50%{box-shadow:0 0 14px currentColor;opacity:0.7} }
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(300px) rotate(720deg);opacity:0} }
        @keyframes inputReveal { from{opacity:0;transform:translateY(-4px);max-height:0}to{opacity:1;transform:translateY(0);max-height:70px} }
        @keyframes glow { 0%,100%{opacity:1;box-shadow:0 0 4px currentColor}50%{opacity:0.6;box-shadow:0 0 12px currentColor} }
        @keyframes slideDown { from{opacity:0;max-height:0}to{opacity:1;max-height:60px} }
        @keyframes dragPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.15)}50%{box-shadow:0 0 0 8px rgba(99,102,241,0)} }
        .task-drag-over { border-color: #6366F1 !important; background-color: #EEF2FF !important; }
        .task-dragging { opacity: 0.5; transform: scale(0.97) rotate(1deg); }
        * { box-sizing:border-box }
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.07);border-radius:3px}
        ::selection{background:#6366F120}

        /* Mobile bottom nav */
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
          .app-gradient { left: 0 !important; }
          .app-content-wrapper { padding: 16px 12px 72px !important; }
          .agent-scroller-bleed { margin-left: -12px !important; margin-right: -12px !important; }
          .agent-scroller-inner { padding-left: 12px !important; }
          .specialist-bleed { margin-left: -12px !important; margin-right: -12px !important; }
          .specialist-header { padding: 0 12px !important; }
          .specialist-scroll { padding-left: 12px !important; padding-right: 12px !important; }
          .header-row { flex-direction: column !important; gap: 8px !important; }
          .team-badge { display: none !important; }
        }
      `}</style>
      <div className="desktop-sidebar">
        <Sidebar
          stats={stats}
          reviewCount={reviewCount}
          tasks={tasks}
        />
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", overflow: "auto" }}>
        <div className="app-gradient" style={{
          position: "fixed", top: 0, left: 72, right: 0, height: 280,
          background: "linear-gradient(180deg, #DDD6FE 0%, #E9D5FF 30%, #FAFAF8 100%)",
          zIndex: 0, pointerEvents: "none",
        }} />
        <div className="app-content-wrapper" style={{ width: "100%", maxWidth: 1100, padding: "24px 24px", position: "relative", zIndex: 1 }}>
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
