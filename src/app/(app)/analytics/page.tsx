"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { P, F, FM } from "@/lib/palette";
import { PRIORITY_CONFIG } from "@/lib/utils/constants";
import type { TaskPriority } from "@/lib/types/task";

export default function AnalyticsPage() {
  const { tasks } = useTasks();
  const { agents } = useAgents();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const workingTasks = tasks.filter((t) => t.status === "working");
  const reviewTasks = tasks.filter((t) => t.status === "review");
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const totalCost = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
  const totalTokensIn = tasks.reduce((s, t) => s + (t.tokens_in || 0), 0);
  const totalTokensOut = tasks.reduce((s, t) => s + (t.tokens_out || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
  const avgCost = doneTasks.length > 0 ? totalCost / doneTasks.length : 0;

  // Agent performance
  const agentStats = agents.map((agent) => {
    const agentTasks = tasks.filter((t) => t.agent_id === agent.id);
    const completed = agentTasks.filter((t) => t.status === "done").length;
    const cost = agentTasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
    const avgDuration = completed > 0
      ? agentTasks.filter((t) => t.duration_seconds > 0).reduce((s, t) => s + t.duration_seconds, 0) / completed
      : 0;
    return { agent, total: agentTasks.length, completed, cost, avgDuration };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  // Priority breakdown
  const priorityCounts: Record<TaskPriority, number> = { urgent: 0, high: 0, normal: 0, low: 0 };
  tasks.forEach((t) => { priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1; });

  // Status distribution for bar chart
  const statusData = [
    { label: "Done", count: doneTasks.length, color: P.emerald, gradient: P.emeraldGrad },
    { label: "Review", count: reviewTasks.length, color: P.coral, gradient: P.coralGrad },
    { label: "Working", count: workingTasks.length, color: P.amber, gradient: `linear-gradient(135deg, ${P.amber}, ${P.orange})` },
    { label: "To Do", count: todoTasks.length, color: P.textTer, gradient: `linear-gradient(135deg, ${P.textTer}, ${P.textSec})` },
  ];
  const maxStatusCount = Math.max(...statusData.map((s) => s.count), 1);

  const totalTokens = totalTokensIn + totalTokensOut;
  const inputPct = totalTokens > 0 ? Math.round((totalTokensIn / totalTokens) * 100) : 0;
  const outputPct = totalTokens > 0 ? Math.round((totalTokensOut / totalTokens) * 100) : 0;

  const activePipeline = workingTasks.length + reviewTasks.length;
  const reviewRate = totalTasks > 0 ? Math.round((reviewTasks.length / totalTasks) * 100) : 0;

  const priorityColors: Record<TaskPriority, string> = {
    urgent: "#DC2626",
    high: "#EA580C",
    normal: "#3B82F6",
    low: "#9CA3AF",
  };

  const maxPriorityCount = Math.max(...Object.values(priorityCounts), 1);

  return (
    <>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 36, fontWeight: 900, margin: "0 0 10px",
          letterSpacing: "-0.04em",
          background: `linear-gradient(135deg, #1e8e3e 0%, #423ff7 50%, #15e11e 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Analytics
        </h1>
        <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.5 }}>
          Overview of your workspace performance and spending
        </p>
      </div>

      {/* Bento Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>

        {/* ── Top Stats Row (4 cards, 3 cols each) ── */}
        {[
          { label: "TOTAL TASKS", value: String(totalTasks), trend: "~+12%", trendColor: P.emerald },
          { label: "COMPLETED", value: `${completionRate}%`, trend: completionRate > 0 ? "of all tasks" : "No progress", trendColor: P.textTer },
          { label: "TOTAL SPENT", value: `$${totalCost.toFixed(2)}`, trend: "USD", trendColor: P.textTer },
          { label: "AVG COST", value: `$${avgCost.toFixed(3)}`, trend: "per task", trendColor: P.textTer },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              gridColumn: "span 3",
              padding: 24,
              backgroundColor: P.card,
              borderRadius: 16,
              border: `1px solid ${P.border}`,
              animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
            }}
          >
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: P.textTer, textTransform: "uppercase", marginBottom: 12,
            }}>
              {stat.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em",
                color: P.text, fontFamily: F,
              }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: stat.trendColor }}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}

        {/* ── Status Distribution (8 cols) ── */}
        <div style={{
          gridColumn: "span 8",
          padding: 24,
          backgroundColor: P.card,
          borderRadius: 16,
          border: `1px solid ${P.border}`,
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: P.text }}>Status Distribution</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: P.textTer,
              border: `1px solid ${P.border}`, borderRadius: 9999,
              padding: "4px 12px",
            }}>
              REAL-TIME
            </span>
          </div>

          {/* Horizontal Bar Chart */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {statusData.map((s) => (
              <div key={s.label}>
                <div style={{
                  height: 36,
                  width: `${Math.max((s.count / maxStatusCount) * 100, s.count > 0 ? 12 : 0)}%`,
                  background: s.gradient,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                  minWidth: s.count > 0 ? 48 : 0,
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: "#fff",
                    fontFamily: FM, textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}>
                    {s.count}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: P.textTer, marginTop: 4, paddingLeft: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Stats Row */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
            borderTop: `1px solid ${P.border}`, paddingTop: 16,
          }}>
            {[
              { label: "Active Pipeline", value: `${activePipeline} Tasks` },
              { label: "Review Rate", value: `${reviewRate}%` },
              { label: "Blocked", value: "0" },
              { label: "Efficiency", value: "Stable" },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: P.textTer, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Priority Breakdown (4 cols) ── */}
        <div style={{
          gridColumn: "span 4",
          padding: 24,
          backgroundColor: P.card,
          borderRadius: 16,
          border: `1px solid ${P.border}`,
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: P.text, marginBottom: 20 }}>
            Priority Breakdown
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(["urgent", "high", "normal", "low"] as TaskPriority[]).map((priority) => {
              const config = PRIORITY_CONFIG[priority];
              const count = priorityCounts[priority];
              const dotColor = priorityColors[priority];
              const isActive = count === maxPriorityCount && count > 0;

              return (
                <div key={priority}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor,
                      }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: P.text }}>{config.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: P.text, fontFamily: FM }}>
                      {count}
                    </span>
                  </div>
                  {isActive && (
                    <div style={{
                      height: 3, borderRadius: 2,
                      backgroundColor: dotColor, opacity: 0.6,
                      width: "100%",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Info box */}
          <div style={{
            marginTop: 24, padding: "12px 14px",
            backgroundColor: "rgba(59,130,246,0.06)",
            borderRadius: 10,
          }}>
            <p style={{ fontSize: 12, color: P.textSec, lineHeight: 1.5, margin: 0 }}>
              System automatically assigns Normal priority to new tasks unless specified otherwise.
            </p>
          </div>
        </div>

        {/* ── Agent Performance Table (8 cols) ── */}
        <div style={{
          gridColumn: "span 8",
          backgroundColor: P.card,
          borderRadius: 16,
          border: `1px solid ${P.border}`,
          overflow: "hidden",
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both",
        }}>
          <div style={{ padding: 24, paddingBottom: 16 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: P.text }}>Agent Performance</span>
          </div>

          {agentStats.length === 0 ? (
            <div style={{ color: P.textTer, fontSize: 13, padding: "24px", textAlign: "center" }}>
              No agent data yet
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }}>
                  {["AGENT NAME", "COMPLETION STATUS", "COST BASIS", "ACTION"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 24px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                      color: P.textTer, textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agentStats.map(({ agent, total, completed, cost }) => {
                  const pct = total > 0 ? (completed / total) * 100 : 0;
                  return (
                    <tr
                      key={agent.id}
                      style={{ borderBottom: `1px solid ${P.border}`, transition: "background 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <td style={{ padding: "12px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={28} slug={agent.slug} />
                          <span style={{ fontSize: 14, fontWeight: 500, color: P.text }}>{agent.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: P.textSec, fontFamily: FM, minWidth: 40 }}>
                            {completed} / {total}
                          </span>
                          <div style={{
                            flex: 1, height: 6, backgroundColor: `${P.border}`,
                            borderRadius: 3, overflow: "hidden", maxWidth: 80,
                          }}>
                            <div style={{
                              height: "100%", width: `${pct}%`,
                              backgroundColor: P.emerald, borderRadius: 3,
                              transition: "width 0.8s ease",
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: P.emerald, fontFamily: FM }}>
                          ${cost.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 24px" }}>
                        <button
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: `1px solid ${P.border}`,
                            backgroundColor: "transparent", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: P.textTer, fontSize: 14,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.text; e.currentTarget.style.color = P.text; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textTer; }}
                          aria-label="View agent details"
                        >
                          &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Token Usage Dark Card (4 cols) ── */}
        <div style={{
          gridColumn: "span 4",
          padding: 24,
          backgroundColor: "#111827",
          borderRadius: 16,
          color: "#fff",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both",
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 24,
            }}>
              TOKEN USAGE
            </div>

            {/* Input Tokens */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6,
              }}>
                INPUT TOKENS
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", fontFamily: FM }}>
                  {totalTokensIn.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
                  {inputPct}% OF TOTAL
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" }}>
                <div style={{
                  height: "100%", width: `${inputPct}%`, borderRadius: 2,
                  backgroundColor: "#60a5fa",
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>

            {/* Output Tokens */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6,
              }}>
                OUTPUT TOKENS
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", fontFamily: FM }}>
                  {totalTokensOut.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
                  {outputPct}% OF TOTAL
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" }}>
                <div style={{
                  height: "100%", width: `${outputPct}%`, borderRadius: 2,
                  backgroundColor: "#60a5fa",
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>

            {/* Total Consumed */}
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, marginBottom: 20,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6,
              }}>
                TOTAL CONSUMED
              </div>
              <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em", fontFamily: FM }}>
                {totalTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bottom indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#34d399" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
              High Density Processing
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
