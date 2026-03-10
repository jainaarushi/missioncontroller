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

  // Show demo data if no activity at all
  const isDemo = totalSpent === 0 && totalTokens === 0 && completedTasks.length === 0;
  const displaySpent = isDemo ? 0.1847 : totalSpent;
  const displayTokensIn = isDemo ? 12480 : totalTokensIn;
  const displayTokensOut = isDemo ? 3920 : totalTokensOut;
  const displayTokens = isDemo ? 16400 : totalTokens;
  const displayCompleted = isDemo ? 3 : completedTasks.length;

  function formatCost(n: number) {
    return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
  }

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 16,
      backgroundColor: "#fff",
      border: `1px solid ${P.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Summary bar — always visible */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", cursor: "pointer",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAFAF8"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Cost */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: P.emerald + "12",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <DollarSign size={16} color={P.emerald} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                letterSpacing: "-0.02em",
              }}>
                {formatCost(displaySpent)}
              </div>
              <div style={{ fontSize: 10.5, color: P.textTer }}>total spent</div>
            </div>
          </div>

          {/* Tokens */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: P.indigo + "12",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={16} color={P.indigo} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                letterSpacing: "-0.02em",
              }}>
                {displayTokens.toLocaleString()}
              </div>
              <div style={{ fontSize: 10.5, color: P.textTer }}>tokens used</div>
            </div>
          </div>

          {/* Tasks completed */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: P.coral + "12",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Hash size={16} color={P.coral} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: P.text,
                letterSpacing: "-0.02em",
              }}>
                {displayCompleted}
              </div>
              <div style={{ fontSize: 10.5, color: P.textTer }}>tasks run</div>
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          color: P.textTer, fontSize: 12, fontWeight: 500,
        }}>
          {expanded ? "Hide details" : "View per task"}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
            display: "flex", gap: 16, marginBottom: 16, fontSize: 12,
          }}>
            <div style={{
              padding: "8px 14px", borderRadius: 8, backgroundColor: "#F5F5F3",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: P.textTer }}>Input</span>
              <span style={{
                fontWeight: 700, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                {displayTokensIn.toLocaleString()}
              </span>
            </div>
            <div style={{
              padding: "8px 14px", borderRadius: 8, backgroundColor: "#F5F5F3",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: P.textTer }}>Output</span>
              <span style={{
                fontWeight: 700, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                {displayTokensOut.toLocaleString()}
              </span>
            </div>
            {displayCompleted > 0 && (
              <div style={{
                padding: "8px 14px", borderRadius: 8, backgroundColor: "#F5F5F3",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: P.textTer }}>Avg/task</span>
                <span style={{
                  fontWeight: 700, color: P.emerald,
                  fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                }}>
                  {formatCost(displaySpent / displayCompleted)}
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
                        height: 4, backgroundColor: "#F5F5F3", borderRadius: 2,
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
