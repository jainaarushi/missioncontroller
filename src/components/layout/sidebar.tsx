"use client";

import { SidebarNav } from "./sidebar-nav";
import { SidebarCosts } from "./sidebar-costs";
import { SidebarFooter } from "./sidebar-footer";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface SidebarProps {
  stats: {
    working: number;
    review: number;
    spent: number;
  };
  reviewCount: number;
  tasks: TaskWithAgent[];
}

export function Sidebar({ stats, reviewCount, tasks }: SidebarProps) {
  return (
    <div style={{
      width: 244,
      backgroundColor: P.sidebar,
      borderRight: `1px solid ${P.border}`,
      padding: "18px 12px",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: P.coralGrad,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, color: "#fff",
          boxShadow: "0 3px 10px rgba(249,112,102,0.3)",
        }}>
          C
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: P.text, letterSpacing: "-0.03em" }}>
          Cadre
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: P.indigo,
          backgroundColor: P.indigoLight, padding: "1px 6px",
          borderRadius: 5, marginLeft: 2,
        }}>
          beta
        </span>
      </div>

      {/* Navigation */}
      <SidebarNav reviewCount={reviewCount} doneTasks={stats.working + stats.review} />

      {/* Separator */}
      <div style={{ height: 1, backgroundColor: P.border, margin: "16px 8px" }} />

      {/* Cost Tracker */}
      <SidebarCosts tasks={tasks} />

      {/* Footer */}
      <SidebarFooter stats={stats} />
    </div>
  );
}
