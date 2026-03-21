"use client";

import { useState } from "react";
import { SidebarNav } from "./sidebar-nav";
import { P, F, FM } from "@/lib/palette";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
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
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const isDemo = !user || user.email === "demo@agentstudio.world";
  const totalSpent = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  const initial = isDemo ? "" : (user?.email?.[0] || "U").toUpperCase();
  const displayName = isDemo ? "Guest" : (user?.email?.split("@")[0] || "User");
  const displayEmail = isDemo ? "Sign in to get started" : (user?.email || "");

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{
      width: 256, minWidth: 256,
      background: "#ffffff",
      borderRight: `1px solid ${P.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo header */}
      <a href="/today" style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "18px 18px 16px",
        textDecoration: "none", color: P.text,
      }}>
        <div style={{
          width: 27, height: 27, background: "#1e8e3e", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.5" fill="#fff"/>
            <rect x="8" y="1" width="5" height="5" rx="1.5" fill="#fff" opacity=".6"/>
            <rect x="1" y="8" width="5" height="5" rx="1.5" fill="#fff" opacity=".6"/>
            <rect x="8" y="8" width="5" height="5" rx="1.5" fill="#fff" opacity=".3"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: P.text, lineHeight: 1.2 }}>
            Agent Studio
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.2, marginTop: 1 }}>
            V1.0.2
          </div>
        </div>
      </a>

      {/* Navigation */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 4, overflowY: "auto" }}>
        <SidebarNav reviewCount={reviewCount} doneTasks={stats.working + stats.review} />
      </div>

      {/* Create Agent button */}
      <div style={{ padding: "0 14px 14px" }}>
        <a
          href="/agents"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", padding: "12px 0",
            background: "#1e8e3e", color: "#ffffff",
            borderRadius: 12, fontSize: 14, fontWeight: 700,
            fontFamily: F, textDecoration: "none",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#167a34"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#1e8e3e"; }}
        >
          + Create Agent
        </a>
      </div>

      {/* User profile at bottom */}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${P.border}`, position: "relative" }}>
        <div
          onClick={() => isDemo ? (window.location.href = "/login") : setShowMenu(!showMenu)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 4px", borderRadius: 8, cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #1e8e3e, #15e11e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, flexShrink: 0, color: "#fff",
          }}>
            {initial || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: F, color: P.text, lineHeight: 1.3 }}>
              {displayName}
            </div>
            <div style={{
              fontSize: 11, color: "#9ca3af", lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {isDemo ? "Sign in" : displayEmail}
            </div>
          </div>
        </div>

        {/* Profile popover */}
        {showMenu && !isDemo && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
            <div style={{
              position: "absolute", bottom: "100%", left: 14, marginBottom: 8,
              width: 220, backgroundColor: "#ffffff",
              borderRadius: 12, padding: "8px",
              border: `1px solid ${P.border}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              zIndex: 100,
            }}>
              <div style={{ padding: "10px 12px", borderBottom: `1px solid ${P.border}`, marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.text, fontFamily: F }}>
                  {user?.email?.split("@")[0] || "User"}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{user?.email}</div>
              </div>
              <a href="/settings" onClick={() => setShowMenu(false)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 8,
                fontSize: 13, color: "#4b5563", textDecoration: "none",
                fontFamily: F, cursor: "pointer",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#1e8e3e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; }}
              >
                Settings
              </a>
              <div onClick={() => { setShowMenu(false); handleSignOut(); }} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 8,
                fontSize: 13, color: "#4b5563", cursor: "pointer", fontFamily: F,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; }}
              >
                Log out
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
