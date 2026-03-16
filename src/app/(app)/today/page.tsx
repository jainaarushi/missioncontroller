"use client";

import { useState, useCallback, useEffect } from "react";
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
import { isTemplateAgent, AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";
import type { PipelineStep } from "@/lib/ai/pipelines";

// Category metadata for template cards
const CATEGORY_META: Record<string, { label: string; color: string; gradient: string }> = {
  career: { label: "Career", color: "#2563EB", gradient: "linear-gradient(135deg, #2563EB, #60A5FA)" },
  finance_personal: { label: "Finance", color: "#059669", gradient: "linear-gradient(135deg, #059669, #34D399)" },
  legal_personal: { label: "Legal", color: "#7C3AED", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)" },
  housing: { label: "Housing", color: "#D97706", gradient: "linear-gradient(135deg, #D97706, #FBBF24)" },
  health_personal: { label: "Health", color: "#DC2626", gradient: "linear-gradient(135deg, #DC2626, #F87171)" },
  education: { label: "Education", color: "#0891B2", gradient: "linear-gradient(135deg, #0891B2, #22D3EE)" },
  shopping: { label: "Shopping", color: "#C026D3", gradient: "linear-gradient(135deg, #C026D3, #E879F9)" },
  freelance: { label: "Freelance", color: "#EA580C", gradient: "linear-gradient(135deg, #EA580C, #FB923C)" },
  parenting: { label: "Parenting", color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)" },
  travel_events: { label: "Travel", color: "#0891B2", gradient: "linear-gradient(135deg, #0891B2, #22D3EE)" },
  personal_growth: { label: "Wellness", color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)" },
};

// Recommended templates — curated 6 for the grid
const RECOMMENDED_SLUGS = [
  "resume-optimizer", "budget-builder", "lease-reviewer",
  "study-plan-maker", "meal-prep-planner", "freelance-bid-writer",
];

// Use cases per template slug
const TEMPLATE_USE_CASES: Record<string, string[]> = {
  "resume-optimizer": ["Resume Rewrite", "ATS Optimization"],
  "budget-builder": ["Monthly Budget", "Savings Plan"],
  "lease-reviewer": ["Lease Audit", "Red Flag Check"],
  "study-plan-maker": ["Exam Prep", "Study Schedule"],
  "meal-prep-planner": ["Weekly Meals", "Grocery Lists"],
  "freelance-bid-writer": ["Bid Writing", "Client Pitches"],
};

// Ratings per template
const TEMPLATE_RATINGS: Record<string, number> = {
  "resume-optimizer": 4.8,
  "budget-builder": 4.7,
  "lease-reviewer": 4.9,
  "study-plan-maker": 4.6,
  "meal-prep-planner": 4.8,
  "freelance-bid-writer": 4.7,
};

// Specialist agents displayed in the "Hire a Specialist" section — slug to human persona
const SPECIALIST_PERSONAS: { slug: string; name: string; title: string; rating: number; skills: string[] }[] = [
  { slug: "deep-research", name: "Dr. Evelyn Reed", title: "Research Strategist", rating: 5.0, skills: ["Deep Research", "Data Analysis"] },
  { slug: "fullstack-developer", name: "Liam Chen", title: "Full-Stack AI Dev", rating: 4.9, skills: ["Full-Stack AI", "Stack Architecture"] },
  { slug: "ux-designer", name: "Sofia Patel", title: "UX/UI Designer", rating: 4.8, skills: ["UX Design", "UI Prototyping"] },
  { slug: "data-analyst", name: "Noah Smith", title: "Data Scientist", rating: 5.0, skills: ["Data Science", "ML Analytics"] },
  { slug: "content-creator", name: "Maya Johnson", title: "Content Strategist", rating: 4.7, skills: ["SEO Content", "Brand Voice"] },
  { slug: "strategy-advisor", name: "James Park", title: "Strategy Consultant", rating: 4.9, skills: ["Business Strategy", "Growth Plans"] },
  { slug: "code-reviewer", name: "Priya Sharma", title: "Code Quality Lead", rating: 4.8, skills: ["Code Review", "Code Analysis"] },
  { slug: "sales-coach", name: "Marcus Lee", title: "Sales Director", rating: 4.7, skills: ["Sales Strategy", "Negotiation"] },
];


export default function TodayPage() {
  const { tasks, mutate } = useTasks("today");
  const { agents } = useAgents();
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

  async function handleCreateTask(title: string, agentIds?: string[], fileContent?: string, customPipeline?: PipelineStep[]) {
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
          body: JSON.stringify({
            team: teamIds,
            ...(customPipeline ? { customPipeline } : {}),
          }),
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

      {/* Page title bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: P.text, margin: 0, letterSpacing: "-0.03em" }}>
          Templates
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => { setPreviewAgent(null); setCreateAgentId(null); setShowCreateModal(true); }}
            style={{
              padding: "10px 22px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #8B3DFF, #D946EF)",
              color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              boxShadow: `0 4px 14px ${P.purple}30`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${P.purple}40`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px ${P.purple}30`; }}
          >
            New project
          </button>
        </div>
      </div>

      {/* Big heading */}
      <h2 style={{
        fontSize: 36, fontWeight: 900, color: P.text, margin: "0 0 24px",
        letterSpacing: "-0.04em", lineHeight: 1.1,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both",
      }}>
        What would you like to build today?
      </h2>

      {/* Search bar + Filters */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 36,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <div
          className="create-bar"
          onClick={() => { setPreviewAgent(null); setCreateAgentId(null); setShowCreateModal(true); }}
          style={{
            flex: 1, padding: "14px 20px", borderRadius: 50,
            backgroundColor: "#fff",
            border: `1.5px solid ${P.border}`,
            cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: P.shadow,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,61,255,0.12), 0 8px 24px rgba(0,0,0,0.06)";
            e.currentTarget.style.borderColor = P.purple + "40";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = P.shadow;
            e.currentTarget.style.borderColor = P.border;
          }}
        >
          <Search size={18} color={P.textTer} />
          <span style={{ flex: 1, color: P.textTer, fontWeight: 500, fontSize: 15 }}>
            Search for templates, agents, or tasks...
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #8B3DFF, #D946EF)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Search size={16} color="#fff" />
          </div>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 20px", borderRadius: 50,
          backgroundColor: "#fff", border: `1.5px solid ${P.border}`,
          fontSize: 14, fontWeight: 600, color: P.text,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: P.shadow, transition: "all 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.purple + "40"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; }}
        >
          <SlidersHorizontal size={16} color={P.textSec} />
          Filters
        </button>
      </div>

      {/* Recommended Templates heading */}
      <h3 style={{
        fontSize: 20, fontWeight: 800, color: P.text, margin: "0 0 16px",
        letterSpacing: "-0.02em",
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both",
      }}>
        Recommended Templates
      </h3>

      {/* Template cards grid — 3 columns, 2 rows */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
        marginBottom: 40,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both",
      }}>
        {RECOMMENDED_SLUGS.map((slug, i) => {
          const agent = agents.find(a => a.slug === slug);
          if (!agent) return null;
          const catId = AGENT_CATEGORY_MAP[slug] || "career";
          const cat = CATEGORY_META[catId] || CATEGORY_META.career;
          const rating = TEMPLATE_RATINGS[slug] || 4.7;
          const useCases = TEMPLATE_USE_CASES[slug] || [agent.name];

          return (
            <div
              key={slug}
              onClick={() => {
                setCreateAgentId(agent.id);
                setPreviewAgent(null);
                setShowCreateModal(true);
              }}
              style={{
                backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
                border: `1.5px solid ${P.border}`,
                boxShadow: P.shadow, cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.06}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = P.shadowHover;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = cat.color + "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = P.shadow;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = P.border;
              }}
            >
              {/* Full-width category banner */}
              <div style={{
                background: cat.gradient,
                padding: "8px 16px",
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  letterSpacing: "0.01em",
                }}>
                  {cat.label}
                </span>
              </div>

              <div style={{ padding: "16px 18px 18px" }}>
                {/* Icon + rating row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)`,
                    border: `1px solid ${cat.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    {agent.icon}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 3,
                    fontSize: 13, fontWeight: 700, color: P.text,
                  }}>
                    <Star size={13} fill="#FBBF24" color="#FBBF24" />
                    {rating}
                  </div>
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 16, fontWeight: 800, color: P.text,
                  letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.2,
                }}>
                  {agent.name}
                </div>

                {/* Description */}
                <div style={{
                  fontSize: 13, color: P.textSec, lineHeight: 1.5,
                  marginBottom: 14, minHeight: 40,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }}>
                  {agent.description}
                </div>

                {/* Use cases */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: P.text, marginBottom: 3 }}>
                    Use Cases
                  </div>
                  <div style={{ fontSize: 12.5, color: P.textSec, fontWeight: 400 }}>
                    {useCases.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hire a Specialist heading */}
      <h3 style={{
        fontSize: 20, fontWeight: 800, color: P.text, margin: "0 0 16px",
        letterSpacing: "-0.02em",
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both",
      }}>
        Hire a Specialist
      </h3>

      {/* Specialist cards — 4-column grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
        marginBottom: 40,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both",
      }}>
        {SPECIALIST_PERSONAS.map((persona, i) => {
          const agent = agents.find(a => a.slug === persona.slug);
          if (!agent) return null;

          return (
            <div
              key={persona.slug}
              onClick={() => setPreviewAgent(agent)}
              style={{
                backgroundColor: "#fff", borderRadius: 16, padding: "18px 16px 16px",
                border: `1.5px solid ${P.border}`,
                boxShadow: P.shadow, cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${0.35 + i * 0.06}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = P.shadowHover;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = agent.color + "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = P.shadow;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = P.border;
              }}
            >
              {/* Avatar + rating — side by side */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: agent.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26,
                  boxShadow: `0 4px 12px ${agent.color}20`,
                }}>
                  {agent.icon}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 3,
                  fontSize: 13, fontWeight: 700, color: P.text,
                }}>
                  <Star size={12} fill="#FBBF24" color="#FBBF24" />
                  {persona.rating}
                </div>
              </div>

              {/* Name */}
              <div style={{ fontSize: 15, fontWeight: 800, color: P.text, letterSpacing: "-0.01em", marginBottom: 2 }}>
                {persona.name}
              </div>

              {/* Title */}
              <div style={{ fontSize: 12, color: P.textSec, fontWeight: 500, marginBottom: 10 }}>
                {persona.title}
              </div>

              {/* Skills */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: P.text, marginBottom: 3 }}>
                  Key Skills
                </div>
                <div style={{
                  fontSize: 12.5, color: P.textSec, fontWeight: 400,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                }}>
                  {persona.skills.join(", ")}
                </div>
              </div>

              {/* View Profile button */}
              <button
                style={{
                  width: "100%", padding: "9px 0", borderRadius: 10,
                  border: `1.5px solid ${P.border}`,
                  backgroundColor: "#fff", color: P.text,
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = agent.color + "08";
                  e.currentTarget.style.borderColor = agent.color + "40";
                  e.currentTarget.style.color = agent.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = P.border;
                  e.currentTarget.style.color = P.text;
                }}
              >
                View Profile
              </button>
            </div>
          );
        })}
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
                backgroundColor: P.purpleSoft, fontSize: 11, color: P.purple,
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
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.bg; }}
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
              background: `linear-gradient(90deg, ${P.purple}, #D946EF, ${P.pink})`,
              borderRadius: "24px 24px 0 0",
            }} />

            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
              background: authPrompt === "login"
                ? `linear-gradient(135deg, ${P.purple}, #D946EF)`
                : "linear-gradient(135deg, #F59E0B, #F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
              boxShadow: authPrompt === "login"
                ? `0 8px 24px ${P.purple}4D`
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
                  ? `linear-gradient(135deg, ${P.purple}, #D946EF)`
                  : "linear-gradient(135deg, #F59E0B, #F97316)",
                color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: authPrompt === "login"
                  ? `0 4px 20px ${P.purple}59`
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
                background: `linear-gradient(90deg, ${P.purple}, #D946EF)`,
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
