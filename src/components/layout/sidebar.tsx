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
      width: 76,
      background: "linear-gradient(180deg, #1A1A2E 0%, #16162A 100%)",
      padding: "20px 8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "sticky",
      top: 0,
      height: "100vh",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <a href="/today" style={{
        width: 42, height: 42, borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(139,61,255,0.35)",
        marginBottom: 28,
        cursor: "pointer",
        display: "block", flexShrink: 0,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,61,255,0.5)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,61,255,0.35)"; }}
      >
        <img src="/logo.png" alt="AgentStudio" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </a>

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
              width: 40, height: 40, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s ease",
              backgroundColor: showCost ? "rgba(139,61,255,0.2)" : "transparent",
              color: totalSpent > 0 ? "#00BFA6" : "rgba(255,255,255,0.35)",
            }}
            onMouseEnter={(e) => { if (!showCost) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={(e) => { if (!showCost) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Coins size={18} strokeWidth={1.6} />
          </div>

          {showCost && (
            <>
              <div onClick={() => setShowCost(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{
                position: "absolute", bottom: 0, left: 56,
                width: 220, backgroundColor: "#fff",
                borderRadius: 16, padding: "16px 18px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
                zIndex: 100,
                animation: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.textTer, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                  Usage
                </div>
                <div style={{
                  fontSize: 26, fontWeight: 800, color: P.text,
                  fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ${totalSpent < 0.01 ? totalSpent.toFixed(4) : totalSpent.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: P.textTer, marginTop: 2, marginBottom: 14 }}>total spent</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "10px 0 0", borderTop: `1px solid ${P.border}` }}>
                  <div>
                    <div style={{ color: P.textTer, fontSize: 10.5, marginBottom: 2 }}>Tasks</div>
                    <div style={{ fontWeight: 700, color: P.text }}>{completedTasks}</div>
                  </div>
                  <div>
                    <div style={{ color: P.textTer, fontSize: 10.5, marginBottom: 2 }}>Tokens</div>
                    <div style={{ fontWeight: 700, color: P.text }}>{totalTokens.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shortcut badge */}
      <kbd style={{
        fontSize: 9, padding: "4px 8px", borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.35)",
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        marginBottom: 14,
      }}>
        ⌘K
      </kbd>

      {/* User avatar / Sign in */}
      <div style={{ position: "relative" }}>
        {isDemo ? (
          <a
            href="/login"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(139,61,255,0.35)",
            }}
            title="Sign in"
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(139,61,255,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(139,61,255,0.35)"; }}
          >
            <User size={18} color="#fff" strokeWidth={2} />
          </a>
        ) : (
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #8B3DFF, #667eea)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              fontSize: 15, fontWeight: 800, color: "#fff",
              transition: "all 0.2s ease",
              boxShadow: showMenu ? "0 0 0 3px rgba(139,61,255,0.3)" : "0 4px 12px rgba(139,61,255,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
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
              position: "absolute", bottom: 0, left: 56,
              width: 250, backgroundColor: "#fff",
              borderRadius: 16, padding: "8px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
              zIndex: 100,
              animation: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {/* User info */}
              <div style={{
                padding: "14px 16px", borderBottom: `1px solid ${P.border}`,
                marginBottom: 4,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B3DFF, #667eea)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 800, color: "#fff",
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: P.text,
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
                  padding: "10px 16px", borderRadius: 10,
                  fontSize: 13, color: P.textSec, textDecoration: "none",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.purpleLight; e.currentTarget.style.color = P.purple; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = P.textSec; }}
              >
                <Settings size={15} strokeWidth={1.8} />
                Settings
              </a>

              <div
                onClick={() => { setShowMenu(false); handleSignOut(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", borderRadius: 10,
                  fontSize: 13, color: P.textSec,
                  cursor: "pointer", transition: "all 0.15s",
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
