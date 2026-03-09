"use client";

import { useState, useCallback, useEffect } from "react";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { BulkActionsBar } from "@/components/tasks/bulk-actions-bar";
import { Confetti } from "@/components/shared/confetti";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P } from "@/lib/palette";
import { getPastel } from "@/lib/utils/pastels";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning \u2600\uFE0F";
  if (hour < 17) return "Good afternoon";
  return "Good evening \uD83C\uDF19";
}

export default function TodayPage() {
  const { tasks, mutate } = useTasks("today");
  const { agents } = useAgents();
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useRealtimeTasks(mutate);

  const reviewTasks = tasks.filter((t) => t.status === "review");
  const workingTasks = tasks.filter((t) => t.status === "working");
  const todoTasks = tasks.filter((t) => t.status === "todo" || t.status === "failed");
  const totalCost = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  const handleConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }, []);

  function handleToggleSelect(taskId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkMode(false);
  }

  async function handleBulkDelete() {
    setBulkLoading(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/tasks/${id}`, { method: "DELETE" })
      )
    );
    clearSelection();
    mutate();
    setBulkLoading(false);
  }

  async function handleBulkPriority(priority: TaskPriority) {
    setBulkLoading(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        })
      )
    );
    clearSelection();
    mutate();
    setBulkLoading(false);
  }

  async function handleBulkMove(section: "today" | "week" | "later") {
    setBulkLoading(true);
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        })
      )
    );
    clearSelection();
    mutate();
    setBulkLoading(false);
  }

  // Cmd+N opens the create modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setShowCreateModal(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleCreateTask(title: string, agentIds?: string[]) {
    const optimisticTask: TaskWithAgent = {
      id: `temp-${Date.now()}`,
      user_id: "",
      agent_id: null,
      title,
      description: null,
      status: "todo",
      progress: 0,
      current_step: null,
      output: null,
      output_format: "markdown",
      cost_usd: 0,
      tokens_in: 0,
      tokens_out: 0,
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      section: "today",
      sort_order: 0,
      priority: "normal",
      agent: null,
    };

    mutate([optimisticTask, ...tasks], false);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, section: "today" }),
    });

    // If agents were selected, assign the first one and run it
    // (multi-agent pipeline: subsequent agents run after the first completes)
    if (agentIds && agentIds.length > 0 && res.ok) {
      const task = await res.json();
      await fetch(`/api/tasks/${task.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentIds[0] }),
      });
      await fetch(`/api/tasks/${task.id}/run`, { method: "POST" });
    }

    mutate();
  }

  return (
    <>
      <Confetti show={showConfetti} />

      {/* Greeting + Select */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 20, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: P.text, margin: 0, letterSpacing: "-0.04em" }}>
            {getGreeting()}
          </h1>
          <p style={{ fontSize: 14, color: P.textSec, marginTop: 4 }}>
            {reviewTasks.length > 0 && <><span style={{ color: P.coral, fontWeight: 700 }}>{reviewTasks.length} ready for review</span>{" · "}</>}
            {workingTasks.length > 0 && <>{workingTasks.length} agent{workingTasks.length !== 1 ? "s" : ""} working{" · "}</>}
            ${totalCost.toFixed(2)} spent
          </p>
        </div>
        <button
          onClick={() => { setBulkMode(!bulkMode); if (bulkMode) clearSelection(); }}
          style={{
            padding: "7px 14px", borderRadius: 9,
            border: `1.5px solid ${bulkMode ? P.indigo + "50" : P.border}`,
            backgroundColor: bulkMode ? P.indigoLight : P.card,
            color: bulkMode ? P.indigo : P.textSec,
            fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
        >
          {bulkMode ? "Cancel" : "Select"}
        </button>
      </div>

      {/* AI Agents — Canva-style horizontal scroll */}
      <div style={{ marginBottom: 24, animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: P.text, marginBottom: 12 }}>
          Your AI agents
        </div>
        <div style={{
          display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8,
          scrollSnapType: "x mandatory",
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}>
          <style>{`.agent-scroll::-webkit-scrollbar { display: none; }`}</style>
          {agents.map((agent, i) => {
            const pastel = getPastel(agent.color);
            const busy = workingTasks.some((t) => t.agent_id === agent.id);
            return (
              <div
                key={agent.id}
                onClick={() => setShowCreateModal(true)}
                style={{
                  flexShrink: 0, width: 150, minHeight: 120,
                  padding: "16px 14px 12px",
                  backgroundColor: pastel.bg,
                  borderRadius: 16, cursor: "pointer",
                  position: "relative", overflow: "hidden",
                  scrollSnapAlign: "start",
                  animation: `popIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both`,
                  transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = `0 12px 32px ${agent.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Decorative shape */}
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  width: 50, height: 50, borderRadius: 14,
                  backgroundColor: pastel.shape1, opacity: 0.5,
                  transform: "rotate(15deg)",
                }} />
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  width: 30, height: 30, borderRadius: "50%",
                  backgroundColor: pastel.shape2,
                }} />

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: agent.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, marginBottom: 10,
                  boxShadow: `0 4px 12px ${agent.color}25`,
                  position: "relative", zIndex: 2,
                }}>
                  {agent.icon}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 13, fontWeight: 700, color: P.text,
                  position: "relative", zIndex: 2,
                  marginBottom: 2,
                }}>
                  {agent.name}
                </div>
                <div style={{
                  fontSize: 10.5, color: agent.color, fontWeight: 600,
                  position: "relative", zIndex: 2,
                }}>
                  {agent.description}
                </div>

                {/* Busy indicator */}
                {busy && (
                  <div style={{
                    position: "absolute", top: 8, right: 8, zIndex: 3,
                    display: "flex", gap: 2,
                  }}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} style={{
                        width: 4, height: 4, borderRadius: "50%",
                        backgroundColor: agent.color,
                        animation: `bounce 1.2s ease-in-out ${d * 0.15}s infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create task */}
      <div
        onClick={() => setShowCreateModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#E8D990";
          e.currentTarget.style.color = P.textSec;
          e.currentTarget.style.backgroundColor = "#FFF9EC";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = P.border;
          e.currentTarget.style.color = P.textGhost;
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.5)";
        }}
        style={{
          marginBottom: 24, padding: "14px 18px", borderRadius: 14,
          border: `2px dashed ${P.border}`,
          backgroundColor: "rgba(255,255,255,0.5)",
          fontSize: 14.5, color: P.textGhost,
          cursor: "pointer", transition: "all 0.2s",
          fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span>+ Create a new task...</span>
        <kbd style={{
          fontSize: 10, padding: "2px 6px", borderRadius: 5,
          border: `1px solid ${P.border}`, backgroundColor: P.sidebar,
          color: P.textTer,
          fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        }}>⌘N</kbd>
      </div>

      {/* Review section */}
      <TaskSection
        label="READY FOR REVIEW"
        tasks={reviewTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.coral}
        dot
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* Working section */}
      <TaskSection
        label="AGENTS WORKING"
        tasks={workingTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.amber}
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* To do section */}
      <TaskSection
        label="TO DO"
        tasks={todoTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.textGhost}
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
        draggable={!bulkMode}
        onReorder={(dragId, dropId) => {
          // Optimistic reorder
          const dragIdx = todoTasks.findIndex((t) => t.id === dragId);
          const dropIdx = todoTasks.findIndex((t) => t.id === dropId);
          if (dragIdx !== -1 && dropIdx !== -1) {
            const reordered = [...tasks];
            const allDragIdx = reordered.findIndex((t) => t.id === dragId);
            const allDropIdx = reordered.findIndex((t) => t.id === dropId);
            const [moved] = reordered.splice(allDragIdx, 1);
            reordered.splice(allDropIdx, 0, moved);
            mutate(reordered, false);
          }
        }}
      />

      {/* Bulk actions */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkPriority={handleBulkPriority}
        onBulkMove={handleBulkMove}
        loading={bulkLoading}
      />

      {/* Create task modal */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        agents={agents}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
        onConfetti={handleConfetti}
      />
    </>
  );
}
