"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { P } from "@/lib/palette";
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
    { label: "Working", count: workingTasks.length, color: P.amber, gradient: `linear-gradient(135deg, ${P.amber}, #FBBF24)` },
    { label: "To Do", count: todoTasks.length, color: P.textTer, gradient: `linear-gradient(135deg, ${P.textTer}, #D4D4D8)` },
  ];
  const maxStatusCount = Math.max(...statusData.map((s) => s.count), 1);

  return (
    <>
      <div style={{ marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: P.text, margin: "0 0 6px",
          letterSpacing: "-0.03em",
        }}>
          Analytics
        </h1>
        <p style={{ fontSize: 15, color: P.textSec }}>
          Overview of your workspace performance and spending.
        </p>
      </div>

      {/* Top stats grid */}
      <div className="analytics-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Tasks", value: totalTasks, color: P.indigo },
          { label: "Completed", value: `${completionRate}%`, color: P.emerald },
          { label: "Total Spent", value: `$${totalCost.toFixed(2)}`, color: P.coral },
          { label: "Avg Cost", value: `$${avgCost.toFixed(3)}`, color: P.amber },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: "18px", backgroundColor: P.card, borderRadius: 14,
              border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
              animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: P.textTer, letterSpacing: "0.04em", marginBottom: 6 }}>
              {stat.label.toUpperCase()}
            </div>
            <div style={{
              fontSize: 26, fontWeight: 800, color: stat.color,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              letterSpacing: "-0.03em",
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <div style={{
        padding: "22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
        marginBottom: 20, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 18 }}>
          Status Distribution
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {statusData.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: P.textSec, textAlign: "right" }}>
                {s.label}
              </div>
              <div style={{ flex: 1, height: 28, backgroundColor: P.sidebar, borderRadius: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(s.count / maxStatusCount) * 100}%`,
                  background: s.gradient,
                  borderRadius: 8,
                  transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                  minWidth: s.count > 0 ? 28 : 0,
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  paddingRight: 8,
                }} />
              </div>
              <div style={{
                width: 30, fontSize: 14, fontWeight: 700, color: s.color,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                {s.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Agent Performance + Priority Breakdown */}
      <div className="analytics-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Agent Performance */}
        <div style={{
          padding: "22px", backgroundColor: P.card, borderRadius: 16,
          border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 16 }}>
            Top Agent Performance
          </div>
          {agentStats.length === 0 && (
            <div style={{ color: P.textTer, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
              No agent data yet
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {agentStats.map(({ agent, total, completed, cost }) => (
              <div
                key={agent.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  backgroundColor: P.sidebar,
                }}
              >
                <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: P.textTer }}>
                    {completed}/{total} done
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: P.textSec,
                  fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                }}>
                  ${cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div style={{
          padding: "22px", backgroundColor: P.card, borderRadius: 16,
          border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 16 }}>
            Priority Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["urgent", "high", "normal", "low"] as TaskPriority[]).map((priority) => {
              const config = PRIORITY_CONFIG[priority];
              const count = priorityCounts[priority];
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;

              return (
                <div key={priority} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{config.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: P.text }}>{config.label}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: config.color,
                        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                      }}>
                        {count}
                      </span>
                    </div>
                    <div style={{ height: 6, backgroundColor: P.sidebar, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: config.color,
                        borderRadius: 3,
                        transition: "width 0.8s ease",
                        minWidth: count > 0 ? 6 : 0,
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Token Usage */}
      <div style={{
        padding: "22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 16 }}>
          Token Usage
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Input Tokens", value: totalTokensIn.toLocaleString(), color: P.indigo },
            { label: "Output Tokens", value: totalTokensOut.toLocaleString(), color: P.coral },
            { label: "Total Tokens", value: (totalTokensIn + totalTokensOut).toLocaleString(), color: P.emerald },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center", padding: "14px", borderRadius: 10, backgroundColor: P.sidebar }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.textTer, letterSpacing: "0.04em", marginBottom: 6 }}>
                {item.label.toUpperCase()}
              </div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: item.color,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                letterSpacing: "-0.02em",
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
