"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { BulkActionsBar } from "@/components/tasks/bulk-actions-bar";
import { Confetti } from "@/components/shared/confetti";
import { UsagePanel } from "@/components/shared/usage-panel";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P } from "@/lib/palette";
import { ChevronRight } from "lucide-react";
import { useAvatars } from "@/lib/hooks/use-avatars";
import { AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import { AGENT_AVATAR_MAP } from "@/lib/agent-avatars";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";

// Canva-style: only 4 pastel colors that rotate
const CANVA_PASTELS = ["#F5D5E0", "#E8D5F5", "#F5E6D5", "#FFF5CC"];


const AGENT_THUMBNAILS: Record<string, string> = {
  // Fun agents
  "roast-master": "/agents/roast-master.png",
  "dream-interpreter": "/agents/dream-interpreter.png",
  "startup-idea-gen": "/agents/startup-idea-gen.png",
  "villain-origin": "/agents/villain-origin.png",
  "fortune-teller": "/agents/fortune-teller.png",
  "rap-battle": "/agents/rap-battle.png",
  "alien-anthropologist": "/agents/alien-anthropologist.png",
  "toxic-trait": "/agents/toxic-trait.png",
  "dating-profile": "/agents/dating-profile.png",
  "meme-caption": "/agents/meme-caption.png",
  "movie-plot": "/agents/movie-plot.png",
  "song-lyrics": "/agents/song-lyrics.png",
  "bedtime-story": "/agents/bedtime-story.png",
  "linkedin-post": "/agents/linkedin-post.png",
  "cover-letter": "/agents/cover-letter.png",
  "excuse-generator": "/agents/excuse-generator.png",
  "apology-writer": "/agents/apology-writer.png",
  "future-coach": "/agents/future-coach.png",
  "debate-champion": "/agents/debate-champion.png",
  "baby-name": "/agents/baby-name.png",
  // Professional agents
  "product-launch": "/agents/product-launch.png",
  "deep-research": "/agents/deep-research.png",
  "content-creator": "/agents/content-creator.png",
  "data-analyst": "/agents/data-analyst.png",
  "system-architect": "/agents/system-architect.png",
  "sales-rep": "/agents/sales-rep.png",
  "investment-analyst": "/agents/investment-analyst.png",
  "fitness-coach": "/agents/fitness-coach.png",
  "blog-to-podcast": "/agents/blog-to-podcast.png",
  "web-intel": "/agents/web-intel.png",
  "general-assistant": "/agents/general-assistant.png",
  "fact-checker": "/agents/fact-checker.png",
  "startup-trends": "/agents/startup-trends.png",
  "academic-researcher": "/agents/academic-researcher.png",
  "technical-writer": "/agents/technical-writer.png",
  "editor": "/agents/editor.png",
  "visualization-expert": "/agents/visualization-expert.png",
  "email-drafter": "/agents/email-drafter.png",
  "personal-finance": "/agents/personal-finance.png",
  "python-expert": "/agents/python-expert.png",
  "fullstack-developer": "/agents/fullstack-developer.png",
  "debugger": "/agents/debugger.png",
  "project-planner": "/agents/project-planner.png",
  "sprint-planner": "/agents/sprint-planner.png",
  "meeting-notes": "/agents/meeting-notes.png",
  "decision-helper": "/agents/decision-helper.png",
  "recipe-planner": "/agents/recipe-planner.png",
  "home-renovation": "/agents/home-renovation.png",
  "ux-designer": "/agents/ux-designer.png",
  "journalist": "/agents/journalist.png",
  "speech-trainer": "/agents/speech-trainer.png",
  "customer-support": "/agents/customer-support.png",
  "strategy-advisor": "/agents/strategy_advisor.png",
  "travel-planner": "/agents/Travel_planner.png",
  "code-reviewer": "/agents/code_reviewer.png",
  "mental-wellbeing": "/agents/wellbeing.png",
};

export default function TodayPage() {
  const { tasks, mutate } = useTasks("today");
  const { agents } = useAgents();
  const { avatars: userAvatars } = useAvatars();
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewAgent, setPreviewAgent] = useState<typeof agents[0] | null>(null);
  const [createAgentId, setCreateAgentId] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<"login" | "key" | null>(null);
  const [authCountdown, setAuthCountdown] = useState(10);

  useRealtimeTasks(mutate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(true);
  const searchParams = useSearchParams();

  // Open create modal with pre-selected agent from URL param (from agents page)
  useEffect(() => {
    const agentId = searchParams.get("agent");
    if (agentId && agents.length > 0) {
      setCreateAgentId(agentId);
      setShowCreateModal(true);
      // Clean up URL
      window.history.replaceState({}, "", "/today");
    }
  }, [searchParams, agents]);

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
        setPreviewAgent(null);
        setCreateAgentId(null);
        setShowCreateModal(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleRunTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}/run`, { method: "POST" });
    if (res.status === 401) {
      setAuthCountdown(10);
      setAuthPrompt("login");
      return;
    }
    if (res.status === 402) {
      setAuthCountdown(10);
      setAuthPrompt("key");
      return;
    }
    mutate();
  }

  // Countdown timer for auth prompt
  useEffect(() => {
    if (!authPrompt) return;
    if (authCountdown <= 0) {
      window.location.href = authPrompt === "login" ? "/login" : "/settings";
      return;
    }
    const timer = setTimeout(() => setAuthCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [authPrompt, authCountdown]);

  async function handleDropTask(taskId: string, targetSection: string) {
    if (targetSection === "working") {
      // Dropping a task onto AGENTS WORKING = run the agent
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (!task.agent_id) {
        // No agent assigned — open the task detail to assign one
        setSelectedTask(task);
        return;
      }
      // Agent assigned — run it
      handleRunTask(taskId);
    }
  }

  async function handleCreateTask(title: string, agentIds?: string[], fileContent?: string) {
    const firstAgent = agentIds?.[0] ? agents.find((a) => a.id === agentIds[0]) : null;
    const teamSize = agentIds?.length || 0;
    const optimisticTask: TaskWithAgent = {
      id: `temp-${Date.now()}`,
      user_id: "",
      agent_id: firstAgent?.id || null,
      title,
      description: fileContent || null,
      status: teamSize > 0 ? "working" : "todo",
      progress: teamSize > 0 ? 5 : 0,
      current_step: teamSize > 1 ? `Deploying team of ${teamSize}...` : teamSize === 1 ? `${firstAgent?.name} starting...` : null,
      output: null,
      output_format: "markdown",
      cost_usd: 0,
      tokens_in: 0,
      tokens_out: 0,
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      started_at: teamSize > 0 ? new Date().toISOString() : null,
      completed_at: null,
      section: "today",
      sort_order: 0,
      priority: "normal",
      agent: firstAgent
        ? { id: firstAgent.id, name: firstAgent.name, icon: firstAgent.icon, color: firstAgent.color, gradient: firstAgent.gradient }
        : null,
    };

    mutate([optimisticTask, ...tasks], false);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, section: "today" }),
    });

    if (res.ok) {
      const task = await res.json();

      // Save file content as description
      if (fileContent) {
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: fileContent }),
        });
      }

      // If agents were selected, assign the first one and auto-run with team
      if (agentIds && agentIds.length > 0) {
        await fetch(`/api/tasks/${task.id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agentIds[0] }),
        });

        // Auto-run with the full team
        const teamIds = agentIds.length > 1 ? agentIds.slice(1) : [];
        const runRes = await fetch(`/api/tasks/${task.id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team: teamIds }),
        });

        if (runRes.status === 401) {
          setAuthPrompt("login");
        } else if (runRes.status === 402) {
          setAuthPrompt("key");
        }
      }
    }

    await mutate();
  }

  return (
    <>
      <Confetti show={showConfetti} />

      {/* Section header + coming soon */}
      <div className="header-row" style={{
        marginBottom: 14, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Agent Studio
            </h2>
            <span style={{
              fontSize: 10, fontWeight: 700, color: P.indigo,
              backgroundColor: P.indigoLight, padding: "3px 8px", borderRadius: 20,
              letterSpacing: "0.04em",
            }}>
              {agents.length} AGENTS
            </span>
          </div>
          {tasks.length === 0 && (
            <p style={{ fontSize: 13, color: P.textTer, margin: "6px 0 0", lineHeight: 1.4 }}>
              Pick an agent, describe your task, and let AI handle the rest
            </p>
          )}
        </div>

        {/* Team collaboration — coming soon */}
        <div className="team-badge" style={{
          padding: "10px 16px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(124,58,237,0.08))",
          border: "1px solid rgba(99,102,241,0.12)",
          animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both",
          display: "flex", alignItems: "center", gap: 10,
          cursor: "default",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13,
            animation: "floatY 3s ease-in-out infinite",
          }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.text, letterSpacing: "-0.01em" }}>
              Team Collaboration
            </div>
            <div style={{ fontSize: 10, color: P.textTer, fontWeight: 500 }}>
              Coming soon
            </div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
            background: "linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899, #7C3AED, #4F46E5)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
            color: "#fff", letterSpacing: "0.05em",
            marginLeft: 2,
          }}>
            SOON
          </span>
        </div>
      </div>

      {/* AI Agents — 2-row Canva-style grid with horizontal scroll — full width */}
      <div className="agent-scroller-bleed" style={{ marginBottom: 28, marginLeft: -24, marginRight: -24, marginTop: -6, animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both", position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div
            ref={scrollRef}
            className="agent-scroll agent-scroller-inner"
            onScroll={() => {
              const el = scrollRef.current;
              if (el) setShowScrollBtn(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
            }}
            style={{
              display: "grid",
              gridTemplateRows: "1fr",
              gridAutoFlow: "column",
              gridAutoColumns: "170px",
              gap: 10,
              overflowX: "auto",
              paddingLeft: 24,
              paddingRight: 0,
              paddingBottom: 8,
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <style>{`.agent-scroll::-webkit-scrollbar { display: none; }`}</style>
            {(() => {
              const prioritySlugs = ["ux-designer", "content-creator", "linkedin-post", "academic-researcher", "product-launch", "travel-planner", "recipe-planner"];
              const sorted = [...agents].sort((a, b) => {
                const aIdx = prioritySlugs.indexOf(a.slug);
                const bIdx = prioritySlugs.indexOf(b.slug);
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                return 0;
              });
              return sorted;
            })().map((agent, i) => {
              const catId = AGENT_CATEGORY_MAP[agent.slug];
              const avatarUrl = catId ? userAvatars[catId] : undefined;
              const chibiAvatar = AGENT_AVATAR_MAP[agent.slug];
              const thumb = avatarUrl || chibiAvatar || AGENT_THUMBNAILS[agent.slug];
              const pastelBg = CANVA_PASTELS[i % CANVA_PASTELS.length];
              const delay = i * 0.04;
              return (
                <div
                  key={agent.id}
                  className="agent-card"
                  onClick={() => setPreviewAgent(agent)}
                  style={{
                    borderRadius: 16, cursor: "pointer",
                    overflow: "hidden",
                    scrollSnapAlign: "start",
                    animation: `cardReveal 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
                    backgroundColor: thumb ? "transparent" : pastelBg,
                    position: "relative",
                    minHeight: 0,
                  }}
                >
                  {thumb ? (
                    /* Full image card — chibi avatar, user avatar, or preset thumbnail */
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <img
                        src={thumb}
                        alt={agent.name}
                        className="agent-thumb-img"
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover", display: "block",
                          transform: (avatarUrl || chibiAvatar) ? "scale(1)" : "scale(1.15)",
                        }}
                      />
                      {(avatarUrl || chibiAvatar) && (
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          padding: "20px 10px 8px",
                          background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                        }}>
                          <div style={{
                            fontSize: 11.5, fontWeight: 800, color: "#fff",
                            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                            lineHeight: 1.2,
                          }}>
                            {agent.name}
                          </div>
                          <div style={{
                            fontSize: 9.5, fontWeight: 500, color: "rgba(255,255,255,0.8)",
                            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                            marginTop: 1,
                          }}>
                            {agent.description}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback — pastel card with icon */
                    <div style={{
                      padding: "14px 14px 12px",
                      display: "flex", flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}>
                      <div style={{
                        fontSize: 12.5, fontWeight: 700, color: P.text,
                        lineHeight: 1.3, maxWidth: "65%",
                      }}>
                        {agent.name}
                      </div>
                      <div className="agent-thumb-img" style={{
                        position: "absolute", bottom: 6, right: 6,
                        width: 48, height: 48, borderRadius: 12,
                        background: agent.gradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22,
                        boxShadow: `0 4px 12px ${agent.color}20`,
                      }}>
                        {agent.icon}
                      </div>
                    </div>
                  )}
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
                background: "linear-gradient(to right, transparent, #EBE2FE)",
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

      {/* Create task — Canva-style search bar */}
      <div
        className="create-bar"
        onClick={() => { setPreviewAgent(null); setCreateAgentId(null); setShowCreateModal(true); }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12), 0 4px 20px rgba(0,0,0,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)";
        }}
        style={{
          marginBottom: 28, padding: "16px 22px", borderRadius: 16,
          backgroundColor: "#fff",
          border: "2px solid rgba(124,58,237,0.25)",
          fontSize: 15, color: P.text,
          cursor: "pointer", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 0 0 2px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ flex: 1, color: P.textTer, fontWeight: 500 }}>Create a task</span>
        <kbd style={{
          fontSize: 10, padding: "3px 8px", borderRadius: 6,
          backgroundColor: "#F5F5F3",
          color: P.textTer,
          fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
          border: "1px solid #EBEBEB",
        }}>⌘N</kbd>
      </div>

      {/* Usage panel — cost & tokens */}
      <div className="usage-panel">
        <UsagePanel tasks={tasks} />
      </div>

      {/* Tasks header — status + select */}
      <div className="section-header" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: P.textSec, margin: 0 }}>
          {tasks.length > 0 ? (
            <>
              {reviewTasks.length > 0 && <><span style={{ color: P.coral, fontWeight: 600 }}>{reviewTasks.length} to review</span></>}
              {reviewTasks.length > 0 && (workingTasks.length > 0 || todoTasks.length > 0) && " · "}
              {workingTasks.length > 0 && <>{workingTasks.length} working</>}
              {workingTasks.length > 0 && todoTasks.length > 0 && " · "}
              {todoTasks.length > 0 && <>{todoTasks.length} to do</>}
            </>
          ) : (
            "Create a task to get started"
          )}
        </p>
        {tasks.length > 0 && (
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
        )}
      </div>

      {/* Review section */}
      <TaskSection
        label="AWAITING DEBRIEF"
        sectionId="review"
        tasks={reviewTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        accentColor={P.coral}
        dot
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* Working section — drop zone for running agents */}
      <TaskSection
        label="ON MISSION"
        sectionId="working"
        tasks={workingTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        onDropTask={handleDropTask}
        accentColor={P.amber}
        selectable={bulkMode}
        selectedIds={selectedIds}
        onSelect={handleToggleSelect}
      />

      {/* To do section */}
      <TaskSection
        label="READY TO DEPLOY"
        sectionId="todo"
        tasks={todoTasks}
        onTaskClick={bulkMode ? () => {} : setSelectedTask}
        onRunTask={handleRunTask}
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

      {/* Agent preview modal */}
      {previewAgent && (
        <div
          onClick={() => setPreviewAgent(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 600,
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
              width: "min(440px, 92vw)", backgroundColor: P.card, borderRadius: 20,
              boxShadow: P.shadowFloat, position: "relative",
              animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
              overflow: "hidden",
            }}
          >
            {/* Gradient header */}
            <div style={{
              height: 80, background: previewAgent.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
            }}>
              {previewAgent.icon}
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Name + description */}
              <h3 style={{
                fontSize: 20, fontWeight: 800, color: P.text, margin: "0 0 4px",
                letterSpacing: "-0.02em",
              }}>
                {previewAgent.name}
              </h3>
              <p style={{ fontSize: 13, color: previewAgent.color, fontWeight: 600, margin: "0 0 12px" }}>
                {previewAgent.description}
              </p>

              {/* Long description */}
              <p style={{
                fontSize: 14, color: P.textSec, lineHeight: 1.6, margin: "0 0 20px",
              }}>
                {previewAgent.long_description || previewAgent.description}
              </p>

              {/* Model badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 6,
                backgroundColor: P.sidebar, fontSize: 11, color: P.textTer,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                marginBottom: 20,
              }}>
                {previewAgent.model.includes("claude") ? "Anthropic Claude" : previewAgent.model.includes("gemini") ? "Google Gemini" : previewAgent.model.includes("gpt") ? "OpenAI GPT" : "AI-Powered"}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setCreateAgentId(previewAgent?.id || null); setPreviewAgent(null); setShowCreateModal(true); }}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                    background: previewAgent.gradient, color: "#fff",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: `0 4px 14px ${previewAgent.color}30`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Use this agent
                </button>
                <button
                  onClick={() => setPreviewAgent(null)}
                  style={{
                    padding: "12px 20px", borderRadius: 12,
                    border: `1.5px solid ${P.border}`,
                    backgroundColor: P.card, color: P.textSec,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create task modal */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateAgentId(null); }}
        onSubmit={handleCreateTask}
        agents={agents}
        preSelectedAgentId={createAgentId || undefined}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
        onConfetti={handleConfetti}
      />

      {/* Auth prompt overlay */}
      {authPrompt && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 900,
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundColor: "rgba(24,24,27,0.5)",
            backdropFilter: "blur(8px)",
            animation: "fadeIn 0.3s ease",
          }} />
          <div style={{
            position: "relative", width: "min(480px, 90vw)", padding: "48px 28px",
            backgroundColor: "#fff", borderRadius: 24,
            boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            textAlign: "center",
            animation: "modalIn 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Top gradient accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: "linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899)",
              borderRadius: "24px 24px 0 0",
            }} />

            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
              background: authPrompt === "login"
                ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                : "linear-gradient(135deg, #F59E0B, #F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
              boxShadow: authPrompt === "login"
                ? "0 8px 24px rgba(99,102,241,0.3)"
                : "0 8px 24px rgba(245,158,11,0.3)",
              animation: "floatY 3s ease-in-out infinite",
            }}>
              {authPrompt === "login" ? "🔐" : "🔑"}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: 24, fontWeight: 900, color: P.text,
              letterSpacing: "-0.03em", margin: "0 0 8px",
            }}>
              {authPrompt === "login" ? "Oh snap! You need to sign in" : "Almost there! Add your API key"}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: 15, color: P.textSec, lineHeight: 1.6,
              margin: "0 0 28px", maxWidth: 340, marginLeft: "auto", marginRight: "auto",
            }}>
              {authPrompt === "login"
                ? "Create a free account to run AI agents and unlock the full power of AgentStudio."
                : "Add your OpenAI, Gemini, or Anthropic API key in Settings to start running agents."}
            </p>

            {/* CTA Button */}
            <a
              href={authPrompt === "login" ? "/login" : "/settings"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 14,
                background: authPrompt === "login"
                  ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
                  : "linear-gradient(135deg, #F59E0B, #F97316)",
                color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: authPrompt === "login"
                  ? "0 4px 20px rgba(99,102,241,0.35)"
                  : "0 4px 20px rgba(245,158,11,0.35)",
                transition: "all 0.2s",
              }}
            >
              {authPrompt === "login" ? "Sign In Free" : "Go to Settings"}
            </a>

            {/* Countdown */}
            <p style={{
              fontSize: 13, color: P.textTer, marginTop: 20, marginBottom: 0,
            }}>
              Redirecting in <span style={{
                fontWeight: 700, color: P.indigo,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>{authCountdown}s</span>
            </p>

            {/* Progress bar */}
            <div style={{
              marginTop: 12, height: 3, backgroundColor: P.border,
              borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${((10 - authCountdown) / 10) * 100}%`,
                background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
                borderRadius: 2,
                transition: "width 1s linear",
              }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
