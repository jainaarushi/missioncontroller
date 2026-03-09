"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { BulkActionsBar } from "@/components/tasks/bulk-actions-bar";
import { Confetti } from "@/components/shared/confetti";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P } from "@/lib/palette";
import { ChevronRight } from "lucide-react";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";

const AGENT_THUMBNAILS: Record<string, string> = {
  scout: "/agents/researcher.jpg",
  quill: "/agents/writer.jpg",
  metric: "/agents/analyst.jpg",
  atlas: "/agents/assistant.jpg",
  voyager: "/agents/travel-planner.jpg",
  pulse: "/agents/finance.jpg",
  sleuth: "/agents/web-intel.jpg",
  caster: "/agents/converter.jpg",
  architect: "/agents/tech-lead.jpg",
  catalyst: "/agents/sales-rep.jpg",
  vitalis: "/agents/fitness-coach.jpg",
  strategist: "/agents/consultant.jpg",
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(true);

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

      {/* Section header — Your AI agents */}
      <div style={{
        marginBottom: 16, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", alignItems: "baseline", gap: 10,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: P.text, margin: 0, letterSpacing: "-0.03em" }}>
          Your AI agents
        </h2>
        <span style={{ fontSize: 13, color: P.textTer, fontWeight: 500 }}>
          {agents.length} available
        </span>
      </div>

      {/* AI Agents — 2-row Canva-style grid with horizontal scroll */}
      <div style={{ marginBottom: 28, animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both", position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div
            ref={scrollRef}
            className="agent-scroll"
            onScroll={() => {
              const el = scrollRef.current;
              if (el) setShowScrollBtn(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
            }}
            style={{
              display: "grid",
              gridTemplateRows: "1fr 1fr",
              gridAutoFlow: "column",
              gridAutoColumns: "170px",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <style>{`.agent-scroll::-webkit-scrollbar { display: none; }`}</style>
            {agents.map((agent, i) => {
              const thumb = AGENT_THUMBNAILS[agent.slug];
              const busy = workingTasks.some((t) => t.agent_id === agent.id);
              // Stagger: column-first order for 2-row grid
              const col = Math.floor(i / 2);
              const row = i % 2;
              const delay = col * 0.06 + row * 0.03;
              return (
                <div
                  key={agent.id}
                  className="agent-card"
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    borderRadius: 14, cursor: "pointer",
                    overflow: "hidden",
                    scrollSnapAlign: "start",
                    animation: `cardReveal 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
                    backgroundColor: P.card,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Thumbnail with zoom-in entrance */}
                  <div className="agent-thumb" style={{
                    width: "100%", height: 90, position: "relative",
                    overflow: "hidden",
                  }}>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={agent.name}
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          animation: `thumbZoom 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        background: agent.gradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28,
                      }}>
                        {agent.icon}
                      </div>
                    )}
                    {/* Busy indicator */}
                    {busy && (
                      <div style={{
                        position: "absolute", top: 6, right: 6, zIndex: 3,
                        display: "flex", gap: 2, backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: 8, padding: "3px 6px",
                        backdropFilter: "blur(4px)",
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

                  {/* Label */}
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div className="agent-label" style={{
                      fontSize: 12.5, fontWeight: 700, color: P.text,
                      marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      transition: "color 0.2s",
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: 10.5, color: P.textSec, fontWeight: 500,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {agent.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right fade + scroll arrow */}
          {showScrollBtn && (
            <>
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 8,
                width: 80, pointerEvents: "none",
                background: "linear-gradient(to right, transparent, #FAFAF8)",
              }} />
              <button
                onClick={() => {
                  scrollRef.current?.scrollBy({ left: 380, behavior: "smooth" });
                }}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  width: 42, height: 42, borderRadius: "50%",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 5,
                  animation: "scrollPulse 2.5s ease-in-out infinite",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.14)";
                  e.currentTarget.style.backgroundColor = "#F5F5F3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                <ChevronRight size={20} color={P.textSec} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Create task — prominent CTA */}
      <div
        onClick={() => setShowCreateModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#E8E8E5";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#F0EFEC";
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        style={{
          marginBottom: 28, padding: "14px 20px", borderRadius: 12,
          backgroundColor: "#F0EFEC",
          fontSize: 14, color: P.text,
          cursor: "pointer", transition: "all 0.2s",
          fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <span style={{ color: P.textSec }}>+ Create a new task</span>
        <kbd style={{
          fontSize: 10, padding: "2px 7px", borderRadius: 5,
          backgroundColor: "rgba(0,0,0,0.06)",
          color: P.textTer,
          fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        }}>⌘N</kbd>
      </div>

      {/* Tasks header — status + select */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: P.textSec, margin: 0 }}>
          {reviewTasks.length > 0 && <><span style={{ color: P.coral, fontWeight: 600 }}>{reviewTasks.length} to review</span></>}
          {reviewTasks.length > 0 && (workingTasks.length > 0 || todoTasks.length > 0) && " · "}
          {workingTasks.length > 0 && <>{workingTasks.length} working</>}
          {workingTasks.length > 0 && todoTasks.length > 0 && " · "}
          {todoTasks.length > 0 && <>{todoTasks.length} to do</>}
          {tasks.length === 0 && "No tasks yet"}
        </p>
        <button
          onClick={() => { setBulkMode(!bulkMode); if (bulkMode) clearSelection(); }}
          style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1.5px solid ${bulkMode ? P.indigo + "50" : P.border}`,
            backgroundColor: bulkMode ? P.indigoLight : P.card,
            color: bulkMode ? P.indigo : P.textSec,
            fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
            boxShadow: bulkMode ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {bulkMode ? "Cancel" : "Select"}
        </button>
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
