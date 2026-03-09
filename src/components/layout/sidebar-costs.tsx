"use client";

import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface SidebarCostsProps {
  tasks: TaskWithAgent[];
}

export function SidebarCosts({ tasks }: SidebarCostsProps) {
  const totalSpent = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
  const totalTokensIn = tasks.reduce((s, t) => s + (t.tokens_in || 0), 0);
  const totalTokensOut = tasks.reduce((s, t) => s + (t.tokens_out || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "review").length;
  const avgCost = completedTasks > 0 ? totalSpent / completedTasks : 0;
  const hasActivity = totalSpent > 0 || totalTokensIn > 0 || completedTasks > 0;

  const today = new Date().toDateString();
  const todayTasks = tasks.filter((t) => new Date(t.created_at).toDateString() === today);
  const todaySpent = todayTasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  const recentTasks = tasks
    .filter((t) => (t.status === "done" || t.status === "review") && Number(t.cost_usd) > 0)
    .slice(0, 5);
  const maxCost = Math.max(...recentTasks.map((t) => Number(t.cost_usd) || 0), 0.01);

  // No activity — show a friendly getting started hint
  if (!hasActivity) {
    return (
      <div style={{ overflowY: "auto", flex: 1, padding: "0 8px" }}>
        <div style={{
          padding: "20px 16px", borderRadius: 12,
          backgroundColor: P.card, border: `1px solid ${P.border}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            {tasks.length > 0 ? "👋" : "✨"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 4 }}>
            {tasks.length > 0 ? "Run your first agent" : "Create your first task"}
          </div>
          <div style={{ fontSize: 11.5, color: P.textTer, lineHeight: 1.5 }}>
            {tasks.length > 0
              ? "Assign an agent to a task and hit Run to see the magic."
              : "Click \"+ Create a new task\" above to get started."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: P.textTer,
        padding: "0 12px 10px", letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
      }}>
        Usage
      </div>

      {/* Main cost — compact */}
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          padding: "12px 14px", borderRadius: 10, backgroundColor: P.card,
          border: `1px solid ${P.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <div>
            <div style={{
              fontSize: 20, fontWeight: 800, color: P.text,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              letterSpacing: "-0.03em",
            }}>
              ${totalSpent < 0.01 ? totalSpent.toFixed(4) : totalSpent.toFixed(2)}
            </div>
            <div style={{ fontSize: 10.5, color: P.textTer, marginTop: 1 }}>total spent</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: P.emerald,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              {completedTasks}
            </div>
            <div style={{ fontSize: 10.5, color: P.textTer }}>done</div>
          </div>
        </div>

        {/* Today + Avg — single row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
        }}>
          <div style={{
            padding: "8px 10px", borderRadius: 8, backgroundColor: P.card,
            border: `1px solid ${P.border}`,
          }}>
            <div style={{ fontSize: 10, color: P.textTer }}>Today</div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: P.indigo,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              ${todaySpent < 0.01 ? todaySpent.toFixed(4) : todaySpent.toFixed(2)}
            </div>
          </div>
          <div style={{
            padding: "8px 10px", borderRadius: 8, backgroundColor: P.card,
            border: `1px solid ${P.border}`,
          }}>
            <div style={{ fontSize: 10, color: P.textTer }}>Avg/task</div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: P.emerald,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              ${avgCost < 0.01 ? avgCost.toFixed(4) : avgCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tokens — compact single row */}
        {(totalTokensIn > 0 || totalTokensOut > 0) && (
          <div style={{
            padding: "8px 10px", borderRadius: 8, backgroundColor: P.card,
            border: `1px solid ${P.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 11,
          }}>
            <span style={{ color: P.textTer }}>Tokens</span>
            <span style={{
              fontWeight: 700, color: P.text,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              {(totalTokensIn + totalTokensOut).toLocaleString()}
            </span>
          </div>
        )}

        {/* Recent task costs */}
        {recentTasks.length > 0 && (
          <div style={{
            padding: "10px 12px", borderRadius: 8, backgroundColor: P.card,
            border: `1px solid ${P.border}`,
          }}>
            <div style={{ fontSize: 10.5, color: P.textTer, marginBottom: 6 }}>Recent</div>
            {recentTasks.map((t) => {
              const cost = Number(t.cost_usd) || 0;
              const pct = (cost / maxCost) * 100;
              const agentColor = t.agent?.color || P.indigo;
              return (
                <div key={t.id} style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10, color: P.text, fontWeight: 500,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: 110,
                    }}>
                      {t.title}
                    </span>
                    <span style={{
                      fontSize: 9.5, color: P.textTer,
                      fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                    }}>
                      ${cost.toFixed(4)}
                    </span>
                  </div>
                  <div style={{ height: 3, backgroundColor: P.sidebar, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      backgroundColor: agentColor, borderRadius: 2,
                      transition: "width 0.5s ease",
                      minWidth: 3,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
