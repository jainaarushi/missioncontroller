"use client";

import { useState, useEffect } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { useTask } from "@/lib/hooks/use-task";
import { useAgents } from "@/lib/hooks/use-agents";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskDetailModalProps {
  task: TaskWithAgent | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onConfetti?: () => void;
}

export function TaskDetailModal({ task: initialTask, open, onClose, onUpdate, onConfetti }: TaskDetailModalProps) {
  const { task: fullTask, mutate: mutateTask } = useTask(open && initialTask ? initialTask.id : null);
  const { agents } = useAgents();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const task = fullTask || initialTask;

  // Auto-refresh while task is working
  useEffect(() => {
    if (!open || !task || task.status !== "working") return;
    const interval = setInterval(() => {
      mutateTask();
    }, 1000);
    return () => clearInterval(interval);
  }, [open, task?.status, mutateTask]);

  if (!task || !open) return null;

  const agent = task.agent;
  const isReview = task.status === "review";
  const isWorking = task.status === "working";
  const isTodo = task.status === "todo";
  const isFailed = task.status === "failed";

  async function handleRun() {
    setLoading(true);
    // Don't close — keep modal open to show progress
    await fetch(`/api/tasks/${task!.id}/run`, { method: "POST" });
    mutateTask();
    onUpdate();
    setLoading(false);
  }

  async function handleAssign(agentId: string) {
    setLoading(true);
    await fetch(`/api/tasks/${task!.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    });
    await fetch(`/api/tasks/${task!.id}/run`, { method: "POST" });
    mutateTask();
    onUpdate();
    setLoading(false);
    // Don't close — show progress
  }

  async function handleApprove() {
    setLoading(true);
    await fetch(`/api/tasks/${task!.id}/approve`, { method: "POST" });
    mutateTask();
    onUpdate();
    setLoading(false);
    onClose();
    onConfetti?.();
  }

  async function handleRevise() {
    setLoading(true);
    await fetch(`/api/tasks/${task!.id}/revise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "Please revise based on feedback" }),
    });
    await fetch(`/api/tasks/${task!.id}/run`, { method: "POST" });
    mutateTask();
    onUpdate();
    setLoading(false);
  }

  // Simple markdown renderer
  function renderMarkdown(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Headers
      if (line.startsWith("### ")) {
        elements.push(<h4 key={i} style={{ fontSize: 14, fontWeight: 700, color: P.text, margin: "16px 0 6px", letterSpacing: "-0.01em" }}>{processInline(line.slice(4))}</h4>);
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(<h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: P.text, margin: "20px 0 8px", letterSpacing: "-0.02em" }}>{processInline(line.slice(3))}</h3>);
        continue;
      }
      if (line.startsWith("# ")) {
        elements.push(<h2 key={i} style={{ fontSize: 18, fontWeight: 800, color: P.text, margin: "20px 0 8px", letterSpacing: "-0.02em" }}>{processInline(line.slice(2))}</h2>);
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        elements.push(<hr key={i} style={{ border: "none", borderTop: `1px solid ${P.border}`, margin: "16px 0" }} />);
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        elements.push(
          <div key={i} style={{
            borderLeft: `3px solid ${agent?.color || P.indigo}`,
            paddingLeft: 14, margin: "12px 0",
            fontSize: 13, color: P.textSec, fontStyle: "italic", lineHeight: 1.6,
          }}>
            {processInline(line.slice(2))}
          </div>
        );
        continue;
      }

      // List items
      if (line.match(/^[-*] /)) {
        elements.push(
          <div key={i} style={{ display: "flex", gap: 8, margin: "4px 0", fontSize: 13.5, color: P.text, lineHeight: 1.6 }}>
            <span style={{ color: agent?.color || P.indigo, fontWeight: 700, flexShrink: 0 }}>•</span>
            <span>{processInline(line.slice(2))}</span>
          </div>
        );
        continue;
      }

      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        elements.push(
          <div key={i} style={{ display: "flex", gap: 8, margin: "4px 0", fontSize: 13.5, color: P.text, lineHeight: 1.6 }}>
            <span style={{ color: agent?.color || P.indigo, fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{numMatch[1]}.</span>
            <span>{processInline(line.slice(numMatch[0].length))}</span>
          </div>
        );
        continue;
      }

      // Table
      if (line.includes("|") && line.trim().startsWith("|")) {
        // Collect all table lines
        const tableLines: string[] = [line];
        while (i + 1 < lines.length && lines[i + 1].includes("|")) {
          i++;
          tableLines.push(lines[i]);
        }
        elements.push(renderTable(tableLines, i));
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        elements.push(<div key={i} style={{ height: 8 }} />);
        continue;
      }

      // Regular paragraph
      elements.push(<p key={i} style={{ fontSize: 13.5, color: P.text, lineHeight: 1.7, margin: "4px 0" }}>{processInline(line)}</p>);
    }

    return elements;
  }

  function processInline(text: string): React.ReactNode {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 700, color: P.text }}>{part.slice(2, -2)}</strong>;
      }
      // Inline code
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={`${i}-${j}`} style={{
            fontSize: 12, padding: "1px 5px", borderRadius: 4,
            backgroundColor: P.sidebar, border: `1px solid ${P.border}`,
            fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
          }}>{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    });
  }

  function renderTable(lines: string[], keyBase: number) {
    const rows = lines
      .filter((l) => !l.match(/^\|[-:| ]+\|$/)) // skip separator
      .map((l) => l.split("|").filter((c) => c.trim() !== "").map((c) => c.trim()));

    if (rows.length === 0) return null;
    const header = rows[0];
    const body = rows.slice(1);

    return (
      <div key={keyBase} style={{ overflowX: "auto", margin: "12px 0" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse", fontSize: 12.5,
          border: `1px solid ${P.border}`, borderRadius: 10, overflow: "hidden",
        }}>
          <thead>
            <tr>
              {header.map((cell, ci) => (
                <th key={ci} style={{
                  padding: "8px 12px", textAlign: "left",
                  fontWeight: 700, color: P.text,
                  backgroundColor: agent?.color ? agent.color + "0a" : P.sidebar,
                  borderBottom: `2px solid ${agent?.color || P.border}20`,
                  fontSize: 11.5,
                }}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "7px 12px", color: P.text,
                    borderBottom: `1px solid ${P.border}`,
                    backgroundColor: ri % 2 === 0 ? "transparent" : P.sidebar + "80",
                  }}>
                    {processInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        display: "flex", justifyContent: "center", alignItems: "center",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(24,24,27,0.35)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 850, maxHeight: "85vh", overflowY: "auto",
          backgroundColor: P.card, borderRadius: 20,
          boxShadow: P.shadowFloat, position: "relative",
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {agent && <div style={{ height: 5, background: agent.gradient, borderRadius: "20px 20px 0 0" }} />}

        <div style={{ padding: "26px 30px 30px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: P.text, margin: 0, lineHeight: 1.4, letterSpacing: "-0.02em" }}>
                {task.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                {agent && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 3px", borderRadius: 20, backgroundColor: agent.color + "12" }}>
                    <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: agent.color }}>{agent.name}</span>
                  </div>
                )}
                {isReview && agent && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: agent.gradient, padding: "3px 10px", borderRadius: 20 }}>
                    Needs review
                  </span>
                )}
                {isWorking && agent && (
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, color: agent.color,
                    backgroundColor: agent.color + "12", padding: "3px 10px", borderRadius: 20,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {task.progress}%
                    <span style={{ display: "inline-flex", gap: 2 }}>
                      {[0, 1, 2].map((d) => <span key={d} style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: agent.color, animation: `bounce 1.2s ease-in-out ${d * 0.15}s infinite` }} />)}
                    </span>
                  </span>
                )}
                {task.cost_usd > 0 && (
                  <span style={{ fontSize: 11.5, color: P.textTer, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                    ${task.cost_usd.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10,
                border: `1px solid ${P.border}`, backgroundColor: P.card,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, color: P.textTer,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
            >
              ×
            </button>
          </div>

          {/* Agent picker for unassigned tasks */}
          {!task.agent_id && task.status === "todo" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
                Choose an agent
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {agents.map((a, i) => (
                  <div
                    key={a.id}
                    onMouseEnter={() => setHoveredAgent(a.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    onClick={() => !loading && handleAssign(a.id)}
                    style={{
                      padding: "14px", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer",
                      border: `2px solid ${hoveredAgent === a.id ? a.color + "50" : P.border}`,
                      backgroundColor: hoveredAgent === a.id ? a.color + "08" : P.card,
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      transform: hoveredAgent === a.id ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: hoveredAgent === a.id ? `0 8px 24px ${a.color}15` : "none",
                      animation: `popIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AgentAvatar icon={a.icon} color={a.color} gradient={a.gradient} size={32} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{a.name}</div>
                        <div style={{ fontSize: 11.5, color: P.textTer }}>{a.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run button */}
          {task.agent_id && (isTodo || isFailed) && (
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handleRun}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: agent ? agent.gradient : P.coralGrad,
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  fontFamily: "inherit",
                  boxShadow: agent ? `0 4px 16px ${agent.color}30` : "0 4px 16px rgba(249,112,102,0.3)",
                  transition: "all 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Starting..." : `Run ${agent?.name || "Agent"} →`}
              </button>
            </div>
          )}

          {/* Pipeline progress — visible during working state */}
          {fullTask?.steps && fullTask.steps.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
                {isWorking ? "Working..." : "Activity"}
              </div>

              {/* Progress bar */}
              {isWorking && (
                <div style={{
                  height: 4, backgroundColor: P.border, borderRadius: 2,
                  marginBottom: 16, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${task.progress}%`,
                    background: agent?.gradient || P.coralGrad,
                    borderRadius: 2,
                    transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>
              )}

              {fullTask.steps.map((step, i) => {
                const isCurrent = step.status === "working";
                const stepDone = step.status === "done";
                const isPending = step.status === "pending";

                return (
                  <div key={step.id} style={{
                    display: "flex", gap: 0,
                    animation: isCurrent ? "fadeUp 0.3s ease" : "none",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                        background: stepDone ? P.emeraldGrad : isCurrent && agent ? agent.gradient : P.border,
                        boxShadow: isCurrent && agent ? `0 0 12px ${agent.color}50` : "none",
                        animation: isCurrent ? "pulseGlow 2s ease-in-out infinite" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.3s",
                      }}>
                        {stepDone && <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✓</span>}
                      </div>
                      {i < fullTask.steps.length - 1 && (
                        <div style={{
                          width: 2, flexGrow: 1, minHeight: 20, borderRadius: 1,
                          backgroundColor: stepDone ? P.emerald + "30" : P.border,
                          transition: "background-color 0.3s",
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: 13, paddingBottom: 14, paddingLeft: 10, lineHeight: 1.5,
                      color: stepDone ? P.text : isCurrent && agent ? agent.color : isPending ? P.textGhost : P.textTer,
                      fontWeight: isCurrent ? 650 : stepDone ? 500 : 400,
                      transition: "all 0.3s",
                    }}>
                      {step.description}
                      {isCurrent && (
                        <span style={{ display: "inline-flex", gap: 3, marginLeft: 8, verticalAlign: "middle" }}>
                          {[0, 1, 2].map((d) => (
                            <span key={d} style={{
                              width: 4, height: 4, borderRadius: "50%",
                              backgroundColor: agent?.color || P.indigo,
                              animation: `bounce 1.2s ease-in-out ${d * 0.15}s infinite`,
                            }} />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Output — rendered as formatted markdown */}
          {task.output && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec }}>
                  Output
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(task.output || ""); }}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: `1px solid ${P.border}`,
                    backgroundColor: P.card, fontSize: 11, fontWeight: 600,
                    color: P.textTer, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
                >
                  Copy
                </button>
              </div>
              <div style={{
                padding: "20px 22px", borderRadius: 14,
                backgroundColor: P.sidebar, border: `1px solid ${P.border}`,
              }}>
                {renderMarkdown(task.output)}
              </div>
            </div>
          )}

          {/* Actions */}
          {isReview && (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleApprove}
                disabled={loading}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer",
                  background: P.emeraldGrad, color: "#fff", fontSize: 15, fontWeight: 700,
                  fontFamily: "inherit",
                  boxShadow: `0 4px 16px ${P.emerald}30`,
                  transition: "all 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Approve ✓
              </button>
              <button
                onClick={handleRevise}
                disabled={loading}
                style={{
                  padding: "13px 24px", borderRadius: 12,
                  border: `1.5px solid ${P.border}`,
                  backgroundColor: P.card, color: P.text,
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
              >
                Revise
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
