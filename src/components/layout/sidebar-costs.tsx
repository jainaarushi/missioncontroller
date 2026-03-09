"use client";

import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface SidebarCostsProps {
  tasks: TaskWithAgent[];
}

export function SidebarCosts({ tasks }: SidebarCostsProps) {
  // Calculate cost breakdown
  const totalSpent = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
  const totalTokensIn = tasks.reduce((s, t) => s + (t.tokens_in || 0), 0);
  const totalTokensOut = tasks.reduce((s, t) => s + (t.tokens_out || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "review").length;
  const avgCost = completedTasks > 0 ? totalSpent / completedTasks : 0;

  // Today's costs
  const today = new Date().toDateString();
  const todayTasks = tasks.filter((t) => new Date(t.created_at).toDateString() === today);
  const todaySpent = todayTasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  // Cost bar visualization (last 5 completed tasks)
  const recentTasks = tasks
    .filter((t) => (t.status === "done" || t.status === "review") && Number(t.cost_usd) > 0)
    .slice(0, 5);
  const maxCost = Math.max(...recentTasks.map((t) => Number(t.cost_usd) || 0), 0.01);

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: P.textTer,
        padding: "0 12px 10px", letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
      }}>
        Cost Tracker
      </div>

      {/* Main cost display */}
      <div style={{
        margin: "0 8px 12px", padding: "14px",
        borderRadius: 12, backgroundColor: P.card,
        border: `1px solid ${P.border}`,
      }}>
        <div style={{
          fontSize: 24, fontWeight: 800, color: P.text,
          fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
          letterSpacing: "-0.03em",
        }}>
          ${totalSpent.toFixed(4)}
        </div>
        <div style={{ fontSize: 11, color: P.textTer, marginTop: 2 }}>
          total spent
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", borderRadius: 8, backgroundColor: P.card,
          border: `1px solid ${P.border}`,
        }}>
          <div>
            <div style={{ fontSize: 11, color: P.textTer }}>Today</div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: P.indigo,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              ${todaySpent.toFixed(4)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: P.textTer }}>Avg/task</div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: P.emerald,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              ${avgCost.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Tokens */}
        <div style={{
          padding: "8px 12px", borderRadius: 8, backgroundColor: P.card,
          border: `1px solid ${P.border}`,
        }}>
          <div style={{ fontSize: 11, color: P.textTer, marginBottom: 6 }}>Tokens used</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.text, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                {totalTokensIn.toLocaleString()}
              </div>
              <div style={{ fontSize: 9.5, color: P.textGhost }}>input</div>
            </div>
            <div style={{ color: P.textGhost, fontSize: 12, alignSelf: "center" }}>+</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.text, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                {totalTokensOut.toLocaleString()}
              </div>
              <div style={{ fontSize: 9.5, color: P.textGhost }}>output</div>
            </div>
            <div style={{ color: P.textGhost, fontSize: 12, alignSelf: "center" }}>=</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.indigo, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                {(totalTokensIn + totalTokensOut).toLocaleString()}
              </div>
              <div style={{ fontSize: 9.5, color: P.textGhost }}>total</div>
            </div>
          </div>
        </div>

        {/* Recent task costs — mini bar chart */}
        {recentTasks.length > 0 && (
          <div style={{
            padding: "10px 12px", borderRadius: 8, backgroundColor: P.card,
            border: `1px solid ${P.border}`,
          }}>
            <div style={{ fontSize: 11, color: P.textTer, marginBottom: 8 }}>Recent tasks</div>
            {recentTasks.map((t) => {
              const cost = Number(t.cost_usd) || 0;
              const pct = (cost / maxCost) * 100;
              const agentColor = t.agent?.color || P.indigo;
              return (
                <div key={t.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10.5, color: P.text, fontWeight: 500,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: 120,
                    }}>
                      {t.title}
                    </span>
                    <span style={{
                      fontSize: 10, color: P.textTer,
                      fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                    }}>
                      ${cost.toFixed(4)}
                    </span>
                  </div>
                  <div style={{ height: 4, backgroundColor: P.sidebar, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      backgroundColor: agentColor, borderRadius: 2,
                      transition: "width 0.5s ease",
                      minWidth: 4,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tasks completed */}
        <div style={{
          padding: "8px 12px", borderRadius: 8, backgroundColor: P.card,
          border: `1px solid ${P.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: P.textTer }}>Tasks completed</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: P.emerald }}>
            {completedTasks}
          </span>
        </div>
      </div>
    </div>
  );
}
