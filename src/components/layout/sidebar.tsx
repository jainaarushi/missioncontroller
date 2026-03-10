"use client";

import { useState } from "react";
import { SidebarNav } from "./sidebar-nav";
import { P } from "@/lib/palette";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Settings, User, Coins } from "lucide-react";
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
  const [showCost, setShowCost] = useState(false);
  const isDemo = !user || user.email === "demo@agentstudio.world";
  const totalSpent = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
  const totalTokens = tasks.reduce((s, t) => s + (t.tokens_in || 0) + (t.tokens_out || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "review").length;

  const initial = isDemo ? "" : (user?.email?.[0] || "U").toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{
      width: 72,
      backgroundColor: P.sidebar,
      borderRight: `1px solid ${P.border}`,
      padding: "16px 6px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, fontWeight: 900, color: "#fff",
        boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
        marginBottom: 24,
        cursor: "pointer",
      }}>
        A
      </div>

      {/* Navigation */}
      <SidebarNav reviewCount={reviewCount} doneTasks={stats.working + stats.review} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Cost tracker icon */}
      {(
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div
            onClick={() => setShowCost(!showCost)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.15s",
              backgroundColor: showCost ? P.sidebarActive : "transparent",
              color: totalSpent > 0 ? P.emerald : P.textSec,
            }}
            onMouseEnter={(e) => { if (!showCost) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)"; }}
            onMouseLeave={(e) => { if (!showCost) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Coins size={18} strokeWidth={1.6} />
          </div>

          {showCost && (
            <>
              <div onClick={() => setShowCost(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{
                position: "absolute", bottom: 0, left: 52,
                width: 200, backgroundColor: "#fff",
                borderRadius: 14, padding: "14px 16px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                zIndex: 100,
                animation: "scaleIn 0.15s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: P.textTer, marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                  Usage
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: P.text,
                  fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                  letterSpacing: "-0.03em",
                }}>
                  ${totalSpent < 0.01 ? totalSpent.toFixed(4) : totalSpent.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: P.textTer, marginTop: 2, marginBottom: 12 }}>total spent</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <div>
                    <div style={{ color: P.textTer, fontSize: 10.5 }}>Tasks</div>
                    <div style={{ fontWeight: 700, color: P.text }}>{completedTasks}</div>
                  </div>
                  <div>
                    <div style={{ color: P.textTer, fontSize: 10.5 }}>Tokens</div>
                    <div style={{ fontWeight: 700, color: P.text }}>{totalTokens.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ⌘K shortcut */}
      <kbd style={{
        fontSize: 9, padding: "3px 6px", borderRadius: 5,
        border: `1px solid ${P.border}`, backgroundColor: P.sidebar,
        color: P.textTer,
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        marginBottom: 12,
      }}>
        ⌘K
      </kbd>

      {/* User avatar / Sign in */}
      <div style={{ position: "relative" }}>
        {isDemo ? (
          <a
            href="/login"
            style={{
              width: 38, height: 38, borderRadius: "50%",
              backgroundColor: P.indigo,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
            }}
            title="Sign in"
          >
            <User size={18} color="#fff" strokeWidth={2} />
          </a>
        ) : (
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, #7C3AED, #6366F1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              fontSize: 15, fontWeight: 800, color: "#fff",
              transition: "all 0.2s",
              boxShadow: showMenu ? "0 0 0 3px rgba(99,102,241,0.2)" : "0 2px 8px rgba(99,102,241,0.25)",
            }}
          >
            {initial}
          </div>
        )}

        {/* Profile popover menu */}
        {showMenu && !isDemo && (
          <>
            <div
              onClick={() => setShowMenu(false)}
              style={{ position: "fixed", inset: 0, zIndex: 99 }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 52,
              width: 240, backgroundColor: "#fff",
              borderRadius: 14, padding: "8px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
              zIndex: 100,
              animation: "scaleIn 0.15s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {/* User info */}
              <div style={{
                padding: "12px 14px", borderBottom: `1px solid ${P.border}`,
                marginBottom: 4,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: "#fff",
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: P.text,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {user?.email?.split("@")[0] || "User"}
                    </div>
                    <div style={{
                      fontSize: 11, color: P.textTer,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <a
                href="/settings"
                onClick={() => setShowMenu(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", borderRadius: 8,
                  fontSize: 13, color: P.textSec, textDecoration: "none",
                  cursor: "pointer", transition: "all 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F5F5F3"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Settings size={15} strokeWidth={1.8} />
                Settings
              </a>

              <div
                onClick={() => { setShowMenu(false); handleSignOut(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", borderRadius: 8,
                  fontSize: 13, color: P.textSec,
                  cursor: "pointer", transition: "all 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = P.textSec; }}
              >
                <LogOut size={15} strokeWidth={1.8} />
                Log out
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
