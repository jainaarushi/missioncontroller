"use client";

import { useState, useCallback } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { P, F } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

export default function TaskBoardPage() {
  const { tasks, mutate } = useTasks();
  const { agents } = useAgents();
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const todoTasks = tasks.filter(t => t.status === "todo" || t.status === "failed");
  const runningTasks = tasks.filter(t => t.status === "working" || t.status === "review");
  const doneTasks = tasks.filter(t => t.status === "done");

  const columns = [
    { key: "todo" as const, title: "Queue / To Do", count: todoTasks.length, tasks: todoTasks, dotColor: "#9ca3af", addable: true },
    { key: "running" as const, title: "Running / In Progress", count: runningTasks.length, tasks: runningTasks, dotColor: "#3b82f6" },
    { key: "done" as const, title: "Completed / Done", count: doneTasks.length, tasks: doneTasks, dotColor: "#22c55e" },
  ];

  async function handleCreateTask(title: string, agentIds?: string[]) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, section: "today" }),
    });
    if (res.ok) {
      const task = await res.json();
      if (agentIds?.[0]) {
        await fetch(`/api/tasks/${task.id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agentIds[0] }),
        });
      }
    }
    await mutate();
  }

  return (
    <div style={{ padding: "32px", fontFamily: F, minHeight: "100vh" }}>
      {/* Pulse animation for running badge */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
        AI Studio / Task Board
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1b1b1b", letterSpacing: "-0.02em" }}>
          Agent Workflow
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            padding: "10px 20px", borderRadius: 10,
            border: "1px solid #e5e7eb", background: "#fff",
            fontSize: 13, fontWeight: 600, color: "#4b5563",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: F,
          }}>
            Filter
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "10px 20px", borderRadius: 10,
              background: "#3028e9", color: "#fff",
              fontSize: 13, fontWeight: 700, border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontFamily: F,
            }}
          >
            + Automate Board
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, alignItems: "flex-start" }}>
        {columns.map((col) => {
          const isRunningCol = col.key === "running";
          const isDoneCol = col.key === "done";

          return (
            <div
              key={col.title}
              style={isRunningCol ? {
                background: "rgba(248,250,252,0.5)",
                borderRadius: 16,
                padding: 12,
                border: "1px solid #f1f5f9",
              } : undefined}
            >
              {/* Column header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 16, paddingBottom: 12,
                borderBottom: "2px solid #e5e7eb",
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  backgroundColor: col.dotColor,
                }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1b1b1b" }}>
                  {col.title}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#6b7280",
                  background: "#f3f4f6", padding: "2px 8px", borderRadius: 10,
                }}>
                  {col.count}
                </span>
                {col.addable && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      marginLeft: "auto", width: 28, height: 28,
                      borderRadius: 8, border: "1px solid #e5e7eb",
                      background: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: "#9ca3af",
                      fontFamily: F,
                    }}
                  >+</button>
                )}
                {isRunningCol && (
                  <button
                    style={{
                      marginLeft: col.addable ? undefined : "auto",
                      width: 28, height: 28,
                      borderRadius: 8, border: "1px solid #e5e7eb",
                      background: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, color: "#9ca3af", lineHeight: 1,
                      fontFamily: F,
                    }}
                    title="More options"
                  >&#8943;</button>
                )}
                {isDoneCol && (
                  <button
                    style={{
                      marginLeft: "auto",
                      width: 28, height: 28,
                      borderRadius: 8, border: "1px solid #e5e7eb",
                      background: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: "#9ca3af", lineHeight: 1,
                      fontFamily: F,
                    }}
                    title="Checklist"
                  >&#9745;</button>
                )}
              </div>

              {/* Task cards */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 12,
                maxHeight: "calc(100vh - 220px)", overflowY: "auto",
              }}>
                {col.tasks.map((task) => {
                  const isRunning = task.status === "working";
                  const isReview = task.status === "review";
                  const isDone = task.status === "done";
                  const isHovered = hoveredCardId === task.id;
                  const isInRunningCol = isRunning || isReview;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      onMouseEnter={(e) => {
                        setHoveredCardId(task.id);
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.borderColor = "#bfdbfe";
                        if (isDone) e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        setHoveredCardId(null);
                        e.currentTarget.style.boxShadow = isInRunningCol ? "0 2px 12px rgba(59,130,246,0.06)" : "0 1px 3px rgba(0,0,0,0.04)";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = isInRunningCol ? "#e5e7eb" : "#e5e7eb";
                        if (isDone) e.currentTarget.style.opacity = "0.9";
                      }}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        ...(isInRunningCol ? { borderLeft: "4px solid #4d4bff" } : {}),
                        borderRadius: 12,
                        padding: "16px",
                        cursor: "pointer",
                        opacity: isDone ? 0.9 : 1,
                        boxShadow: isInRunningCol ? "0 2px 12px rgba(59,130,246,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "all 0.15s",
                      }}
                    >
                      {/* Top row: ID + status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace" }}>
                          #{task.id.slice(-4)}
                        </span>
                        {isRunning && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#3028e9",
                            background: "rgba(59,130,246,0.08)", padding: "3px 8px",
                            borderRadius: 6, display: "flex", alignItems: "center", gap: 4,
                          }}>
                            <span style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: "#3028e9", display: "inline-block",
                              animation: "pulse-dot 2s infinite",
                            }} />
                            RUNNING {task.progress > 0 && `${task.progress}%`}
                          </span>
                        )}
                        {isReview && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#f59e0b",
                            background: "rgba(245,158,11,0.08)", padding: "3px 8px",
                            borderRadius: 6,
                          }}>
                            REVIEW
                          </span>
                        )}
                        {task.status === "todo" && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#6b7280",
                            background: "#f3f4f6", padding: "3px 8px", borderRadius: 6,
                          }}>
                            READY
                          </span>
                        )}
                        {isDone && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#16a34a",
                            background: "rgba(22,163,106,0.08)", padding: "3px 8px",
                            borderRadius: 6,
                          }}>
                            SUCCESS
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: "#1b1b1b",
                        marginBottom: 10, lineHeight: 1.4,
                      }}>
                        {task.title}
                      </div>

                      {/* Progress bar for running tasks */}
                      {isRunning && task.progress > 0 && (
                        <div style={{
                          width: "100%", height: 4, background: "#e5e7eb",
                          borderRadius: 2, overflow: "hidden", marginBottom: 10,
                        }}>
                          <div style={{
                            height: "100%", width: `${task.progress}%`,
                            background: "#3b82f6", borderRadius: 2,
                            transition: "width 1s ease",
                          }} />
                        </div>
                      )}

                      {/* Current step for running */}
                      {isRunning && task.current_step && (
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
                          {task.current_step}
                        </div>
                      )}

                      {/* Done task result preview */}
                      {isDone && task.output && (
                        <div style={{
                          background: "#f8fafc",
                          border: "1px solid #f1f5f9",
                          borderRadius: 8,
                          padding: "8px 12px",
                          marginBottom: 10,
                        }}>
                          <div style={{
                            fontSize: 12, color: "#16a34a",
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            <span>{task.output.slice(0, 40)}...</span>
                          </div>
                        </div>
                      )}

                      {/* Agent footer */}
                      {task.agent && (
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          paddingTop: 10, borderTop: "1px solid #f3f4f6",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 6,
                              background: task.agent.gradient || task.agent.color + "20",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12,
                            }}>
                              {task.agent.icon}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#4b5563" }}>
                              {task.agent.name}
                            </span>
                          </div>
                          {task.cost_usd > 0 && (
                            <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace" }}>
                              ${task.cost_usd.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {col.tasks.length === 0 && (
                  <div style={{
                    padding: "24px 16px", textAlign: "center",
                    border: "2px dashed #e5e7eb", borderRadius: 12,
                    color: "#9ca3af", fontSize: 13,
                  }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        agents={agents}
      />

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
      />
    </div>
  );
}
