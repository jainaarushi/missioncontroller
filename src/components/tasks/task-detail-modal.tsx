"use client";

import { useState } from "react";
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
  if (!task || !open) return null;

  const agent = task.agent;
  const isReview = task.status === "review";
  const isWorking = task.status === "working";

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
    onClose();
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
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        display: "flex", justifyContent: "center", alignItems: "center",
      }}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(24,24,27,0.35)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }} />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600, maxHeight: "82vh", overflowY: "auto",
          backgroundColor: P.card, borderRadius: 20,
          boxShadow: P.shadowFloat, position: "relative",
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top accent */}
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
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: agent.color, backgroundColor: agent.color + "12", padding: "3px 10px", borderRadius: 20 }}>
                    {task.progress}%
                  </span>
                )}
                {task.cost_usd > 0 && (
                  <span style={{ fontSize: 11.5, color: P.textTer, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                    ${task.cost_usd.toFixed(2)}
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
                      padding: "16px", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer",
                      border: `2px solid ${hoveredAgent === a.id ? a.color + "50" : P.border}`,
                      backgroundColor: hoveredAgent === a.id ? a.color + "08" : P.card,
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      transform: hoveredAgent === a.id ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
                      boxShadow: hoveredAgent === a.id ? `0 8px 24px ${a.color}18` : "none",
                      animation: `popIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <AgentAvatar icon={a.icon} color={a.color} gradient={a.gradient} size={36} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: P.textTer }}>{a.description}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: P.textSec, lineHeight: 1.55 }}>
                      {a.long_description}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 10.5, color: P.textTer, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                      <span>{a.tasks_completed} done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity log */}
          {fullTask?.steps && fullTask.steps.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
                Activity
              </div>
              {fullTask.steps.map((step, i) => {
                const isCurrent = step.status === "working";
                const stepDone = step.status === "done";

                return (
                  <div key={step.id} style={{ display: "flex", gap: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                        background: stepDone ? P.emeraldGrad : isCurrent && agent ? agent.gradient : P.border,
                        boxShadow: isCurrent && agent ? `0 0 10px ${agent.color}40` : "none",
                        animation: isCurrent ? "pulseGlow 2s ease-in-out infinite" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {stepDone && <span style={{ color: "#fff", fontSize: 7, fontWeight: 900 }}>✓</span>}
                      </div>
                      {i < fullTask.steps.length - 1 && (
                        <div style={{
                          width: 2, flexGrow: 1, minHeight: 22, borderRadius: 1,
                          backgroundColor: stepDone ? P.emerald + "25" : P.border,
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: 13.5, paddingBottom: 16, paddingLeft: 10, lineHeight: 1.5,
                      color: stepDone ? P.text : isCurrent && agent ? agent.color : P.textGhost,
                      fontWeight: isCurrent ? 600 : 450,
                    }}>
                      {step.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Output */}
          {task.output && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 10 }}>
                Output
              </div>
              <div style={{
                padding: "20px", borderRadius: 14,
                backgroundColor: P.sidebar, border: `1px solid ${P.border}`,
                fontSize: 13.5, color: P.text, lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}>
                {task.output}
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
                  transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${P.emerald}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${P.emerald}30`; }}
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
                  fontFamily: "inherit",
                  transition: "all 0.15s",
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
