"use client";

import { useState } from "react";
import { P } from "@/lib/palette";
import { ChevronDown, ChevronUp, Zap, DollarSign, Hash } from "lucide-react";
import type { TaskWithAgent } from "@/lib/types/task";

interface UsagePanelProps {
  tasks: TaskWithAgent[];
}

export function UsagePanel({ tasks }: UsagePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const totalSpent = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
  const totalTokensIn = tasks.reduce((s, t) => s + (t.tokens_in || 0), 0);
  const totalTokensOut = tasks.reduce((s, t) => s + (t.tokens_out || 0), 0);
  const totalTokens = totalTokensIn + totalTokensOut;
  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "review");

  // Tasks with cost, sorted by most expensive
  const costTasks = tasks
    .filter((t) => Number(t.cost_usd) > 0 || (t.tokens_in || 0) + (t.tokens_out || 0) > 0)
    .sort((a, b) => (Number(b.cost_usd) || 0) - (Number(a.cost_usd) || 0))
    .slice(0, 8);

  const maxCost = Math.max(...costTasks.map((t) => Number(t.cost_usd) || 0), 0.001);

  // Don't show if no activity at all
  if (totalSpent === 0 && totalTokens === 0 && completedTasks.length === 0) return null;

  function formatCost(n: number) {
    return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
  }

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 16,
      background: `linear-gradient(135deg, ${P.bg2}, ${P.bg3})`,
      border: `1.5px solid ${P.border2}`,
      boxShadow: P.shadow,
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
      position: "relative",
    }}>
      {/* Thin rainbow accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, #1e8e3e, #423ff7, #15e11e)",
      }} />

      {/* Summary bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px", cursor: "pointer",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(30,142,62,0.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Cost */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <DollarSign size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                letterSpacing: "-0.02em",
              }}>
                {formatCost(totalSpent)}
              </div>
              <div style={{ fontSize: 9.5, color: P.textTer, fontWeight: 500 }}>spent</div>
            </div>
          </div>

          {/* Tokens */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #423ff7, #3532d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                letterSpacing: "-0.02em",
              }}>
                {totalTokens.toLocaleString()}
              </div>
              <div style={{ fontSize: 9.5, color: P.textTer, fontWeight: 500 }}>tokens</div>
            </div>
          </div>

          {/* Tasks completed */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #F97066, #EF4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Hash size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: P.text,
                letterSpacing: "-0.02em",
              }}>
                {completedTasks.length}
              </div>
              <div style={{ fontSize: 9.5, color: P.textTer, fontWeight: 500 }}>tasks</div>
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          color: P.indigo, fontSize: 11, fontWeight: 600,
          padding: "4px 10px", borderRadius: 7,
          backgroundColor: "rgba(30,142,62,0.08)",
        }}>
          {expanded ? "Hide" : "Details"}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>

      {/* Expanded detail — per-task breakdown */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${P.border}`,
          padding: "16px 20px",
          animation: "fadeUp 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Token breakdown */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 16, fontSize: 12, flexWrap: "wrap" as const,
          }}>
            <div style={{
              padding: "8px 14px", borderRadius: 8, backgroundColor: P.bg3,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: P.textTer }}>Input</span>
              <span style={{
                fontWeight: 700, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                {totalTokensIn.toLocaleString()}
              </span>
            </div>
            <div style={{
              padding: "8px 14px", borderRadius: 8, backgroundColor: P.bg3,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: P.textTer }}>Output</span>
              <span style={{
                fontWeight: 700, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                {totalTokensOut.toLocaleString()}
              </span>
            </div>
            {completedTasks.length > 0 && (
              <div style={{
                padding: "8px 14px", borderRadius: 8, backgroundColor: P.bg3,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: P.textTer }}>Avg/task</span>
                <span style={{
                  fontWeight: 700, color: P.emerald,
                  fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                }}>
                  {formatCost(totalSpent / completedTasks.length)}
                </span>
              </div>
            )}
          </div>

          {/* Per-task cost bars */}
          {costTasks.length > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: P.textTer,
                marginBottom: 10, letterSpacing: "0.03em",
                textTransform: "uppercase" as const,
              }}>
                Cost per task
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {costTasks.map((t) => {
                  const cost = Number(t.cost_usd) || 0;
                  const tokens = (t.tokens_in || 0) + (t.tokens_out || 0);
                  const pct = Math.max((cost / maxCost) * 100, 3);
                  const agentColor = t.agent?.color || P.indigo;
                  return (
                    <div key={t.id}>
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        marginBottom: 4,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                          {t.agent && (
                            <div style={{
                              width: 20, height: 20, borderRadius: 6,
                              background: t.agent.gradient,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, flexShrink: 0,
                            }}>
                              {t.agent.icon}
                            </div>
                          )}
                          <span style={{
                            fontSize: 12.5, color: P.text, fontWeight: 500,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {t.title}
                          </span>
                        </div>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12,
                          flexShrink: 0, marginLeft: 12,
                        }}>
                          <span style={{
                            fontSize: 11, color: P.textTer,
                            fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                          }}>
                            {tokens.toLocaleString()} tok
                          </span>
                          <span style={{
                            fontSize: 12, fontWeight: 700, color: P.text,
                            fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                            minWidth: 52, textAlign: "right",
                          }}>
                            {formatCost(cost)}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        height: 4, backgroundColor: P.bg4, borderRadius: 2,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: `linear-gradient(90deg, ${agentColor}, ${agentColor}80)`,
                          borderRadius: 2,
                          transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
