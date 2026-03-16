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

  // Get recent tasks for sidebar
  const recentTasks = tasks
    .filter((t) => t.status === "done" || t.status === "review" || t.status === "working")
    .slice(0, 3);

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{
      width: 208, minWidth: 208,
      background: P.bg2,
      borderRight: `1px solid ${P.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo header */}
      <a href="/today" style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "17px 17px 15px",
        borderBottom: `1px solid ${P.border}`,
        fontFamily: F, fontSize: 14, fontWeight: 700,
        textDecoration: "none", color: P.text,
      }}>
        <div style={{
          width: 27, height: 27, background: P.lime, borderRadius: 7,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.5" fill="#0b0b0e"/>
            <rect x="8" y="1" width="5" height="5" rx="1.5" fill="#0b0b0e" opacity=".5"/>
            <rect x="1" y="8" width="5" height="5" rx="1.5" fill="#0b0b0e" opacity=".5"/>
            <rect x="8" y="8" width="5" height="5" rx="1.5" fill="#0b0b0e" opacity=".28"/>
          </svg>
        </div>
        AgentStudio
      </a>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "8px 7px", overflowY: "auto" }}>
        <SidebarNav reviewCount={reviewCount} doneTasks={stats.working + stats.review} />

        {/* Recent Jobs */}
        {recentTasks.length > 0 && (
          <>
            <div style={{
              fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: P.textTer, padding: "16px 10px 5px", fontFamily: F,
            }}>
              Recent Jobs
            </div>
            {recentTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderRadius: 8,
                  cursor: "pointer", fontSize: 11, color: P.textSec, fontFamily: F,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = P.bg3; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span>{t.agent?.icon || "📋"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.title}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Account section */}
        <div style={{
          fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" as const,
          color: P.textTer, padding: "16px 10px 5px", fontFamily: F,
        }}>
          Account
        </div>
        <a
          href="/settings"
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 8,
            cursor: "pointer", fontSize: 12, color: P.textSec, fontFamily: F,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = P.bg3; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 13 }}>⚙️</span>
          Settings
        </a>
      </div>

      {/* User profile at bottom */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${P.border}`, position: "relative" }}>
        <div
          onClick={() => isDemo ? (window.location.href = "/login") : setShowMenu(!showMenu)}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "7px 8px", borderRadius: 8, cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = P.bg3; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `linear-gradient(135deg, ${P.violet}, ${P.rose})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, flexShrink: 0, color: "#fff",
          }}>
            {initial || "?"}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, fontFamily: F, color: P.text }}>{displayName}</div>
            <div style={{ fontSize: 9.5, color: P.textTer }}>
              {isDemo ? "Sign in" : `$${totalSpent < 0.01 ? totalSpent.toFixed(4) : totalSpent.toFixed(2)} used`}
            </div>
          </div>
        </div>

        {/* Profile popover */}
        {showMenu && !isDemo && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
            <div style={{
              position: "absolute", bottom: "100%", left: 10, marginBottom: 8,
              width: 200, backgroundColor: P.bg3,
              borderRadius: 12, padding: "8px",
              border: `1px solid ${P.border2}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              zIndex: 100,
            }}>
              <div style={{ padding: "10px 12px", borderBottom: `1px solid ${P.border}`, marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P.text, fontFamily: F }}>
                  {user?.email?.split("@")[0] || "User"}
                </div>
                <div style={{ fontSize: 10, color: P.textTer, marginTop: 1 }}>{user?.email}</div>
              </div>
              <a href="/settings" onClick={() => setShowMenu(false)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 8,
                fontSize: 12, color: P.textSec, textDecoration: "none",
                fontFamily: F, cursor: "pointer",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = P.bg4; e.currentTarget.style.color = P.lime; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = P.textSec; }}
              >
                ⚙️ Settings
              </a>
              <div onClick={() => { setShowMenu(false); handleSignOut(); }} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 8,
                fontSize: 12, color: P.textSec, cursor: "pointer", fontFamily: F,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = P.textSec; }}
              >
                🚪 Log out
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
