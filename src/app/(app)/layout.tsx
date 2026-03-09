"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/shared/command-palette";
import { SWRProvider } from "@/components/providers/swr-provider";
import { useAgents } from "@/lib/hooks/use-agents";
import { useStats } from "@/lib/hooks/use-stats";
import { useTasks } from "@/lib/hooks/use-tasks";
import { P } from "@/lib/palette";

function AppShell({ children }: { children: React.ReactNode }) {
  const { agents } = useAgents();
  const { stats } = useStats();
  const { tasks } = useTasks();

  const reviewCount = tasks.filter((t) => t.status === "review").length;
  const workingTasks = tasks.filter((t) => t.status === "working");

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
        .agent-card:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06) !important; }
        .agent-card:hover .agent-thumb img { transform: scale(1.06); }
        .agent-card:active { transform: translateY(-1px) scale(0.98) !important; transition-duration: 0.1s; }
        .agent-thumb img { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .agent-card:hover .agent-label { color: #6366F1 !important; }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }
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
      `}</style>
      <Sidebar
        stats={stats}
        reviewCount={reviewCount}
        tasks={tasks}
      />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", overflow: "auto" }}>
        <div style={{ width: "100%", maxWidth: 1100, padding: "40px 40px" }}>
          {children}
        </div>
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
