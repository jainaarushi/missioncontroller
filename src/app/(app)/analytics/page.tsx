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

  return (
    <>
      <div style={{ marginBottom: 32, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 36, fontWeight: 900, margin: "0 0 10px",
          letterSpacing: "-0.04em",
          background: `linear-gradient(135deg, ${P.violet} 0%, ${P.purple} 50%, ${P.rose} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Analytics
        </h1>
        <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.5 }}>
          Overview of your workspace performance and spending
        </p>
      </div>

      {/* Top stats grid */}
      <div className="analytics-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Tasks", value: totalTasks, color: P.purple, bg: P.purpleSoft },
          { label: "Completed", value: `${completionRate}%`, color: P.emerald, bg: P.emeraldSoft },
          { label: "Total Spent", value: `$${totalCost.toFixed(2)}`, color: P.coral, bg: P.coralSoft },
          { label: "Avg Cost", value: `$${avgCost.toFixed(3)}`, color: P.amber, bg: P.amberSoft },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: "22px", backgroundColor: P.card, borderRadius: 16,
              border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
              animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = P.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = P.shadow; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", backgroundColor: stat.color,
                boxShadow: `0 0 8px ${stat.color}40`,
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: P.textTer, letterSpacing: "0.05em" }}>
                {stat.label.toUpperCase()}
              </div>
            </div>
            <div style={{
              fontSize: 30, fontWeight: 800, color: stat.color,
              fontFamily: FM,
              letterSpacing: "-0.03em",
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <div style={{
        padding: "24px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
        marginBottom: 20, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 20, letterSpacing: "-0.02em" }}>
          Status Distribution
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {statusData.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 64, fontSize: 12.5, fontWeight: 600, color: P.textSec, textAlign: "right" }}>
                {s.label}
              </div>
              <div style={{ flex: 1, height: 32, backgroundColor: `${P.border}60`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(s.count / maxStatusCount) * 100}%`,
                  background: s.gradient,
                  borderRadius: 10,
                  transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                  minWidth: s.count > 0 ? 32 : 0,
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  paddingRight: 10,
                }} />
              </div>
              <div style={{
                width: 36, fontSize: 15, fontWeight: 700, color: s.color,
                fontFamily: FM,
              }}>
                {s.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Agent Performance + Priority Breakdown */}
      <div className="analytics-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Agent Performance */}
        <div style={{
          padding: "24px", backgroundColor: P.card, borderRadius: 16,
          border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 18, letterSpacing: "-0.02em" }}>
            Top Agents
          </div>
          {agentStats.length === 0 && (
            <div style={{ color: P.textTer, fontSize: 13, padding: "24px 0", textAlign: "center" }}>
              No agent data yet
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {agentStats.map(({ agent, total, completed, cost }) => (
              <div
                key={agent.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  backgroundColor: P.bg,
                  border: `1px solid ${P.border}`,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = agent.color + "40"; e.currentTarget.style.backgroundColor = agent.color + "12"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.backgroundColor = P.bg; }}
              >
                <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: P.textTer }}>
                    {completed}/{total} done
                  </div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: P.textSec,
                  fontFamily: FM,
                  backgroundColor: P.card,
                  padding: "4px 10px", borderRadius: 8,
                  border: `1px solid ${P.border}`,
                }}>
                  ${cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div style={{
          padding: "24px", backgroundColor: P.card, borderRadius: 16,
          border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both",
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 18, letterSpacing: "-0.02em" }}>
            Priority Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(["urgent", "high", "normal", "low"] as TaskPriority[]).map((priority) => {
              const config = PRIORITY_CONFIG[priority];
              const count = priorityCounts[priority];
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;

              return (
                <div key={priority} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{config.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{config.label}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: config.color,
                        fontFamily: FM,
                      }}>
                        {count}
                      </span>
                    </div>
                    <div style={{ height: 8, backgroundColor: `${P.border}80`, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: config.color,
                        borderRadius: 4,
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                        minWidth: count > 0 ? 8 : 0,
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
        padding: "24px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 18, letterSpacing: "-0.02em" }}>
          Token Usage
        </div>
        <div className="analytics-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Input Tokens", value: totalTokensIn.toLocaleString(), color: P.purple, bg: P.purpleSoft },
            { label: "Output Tokens", value: totalTokensOut.toLocaleString(), color: P.coral, bg: P.coralSoft },
            { label: "Total Tokens", value: (totalTokensIn + totalTokensOut).toLocaleString(), color: P.emerald, bg: P.emeraldSoft },
          ].map((item) => (
            <div key={item.label} style={{
              textAlign: "center", padding: "18px", borderRadius: 14,
              backgroundColor: item.bg,
              border: `1px solid ${item.color}15`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.textTer, letterSpacing: "0.05em", marginBottom: 8 }}>
                {item.label.toUpperCase()}
              </div>
              <div style={{
                fontSize: 24, fontWeight: 800, color: item.color,
                fontFamily: FM,
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
