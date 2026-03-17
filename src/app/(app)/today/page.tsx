"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { BulkActionsBar } from "@/components/tasks/bulk-actions-bar";
import { Confetti } from "@/components/shared/confetti";
import { UsagePanel } from "@/components/shared/usage-panel";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P, F, FS, FM } from "@/lib/palette";
import { isTemplateAgent, AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import { getAgentAvatar } from "@/lib/agent-avatars";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";
import type { PipelineStep } from "@/lib/ai/pipelines";

// Category metadata for template cards
const CATEGORY_META: Record<string, { label: string; color: string; catBg: string }> = {
  career: { label: "Career", color: "#60a5fa", catBg: "rgba(96,165,250,0.13)" },
  finance_personal: { label: "Finance", color: "#4ade80", catBg: "rgba(74,222,128,0.10)" },
  legal_personal: { label: "Legal", color: "#c084fc", catBg: "rgba(192,132,252,0.10)" },
  housing: { label: "Housing", color: "#fb923c", catBg: "rgba(251,146,60,0.10)" },
  health_personal: { label: "Health", color: "#f472b6", catBg: "rgba(244,114,182,0.10)" },
  education: { label: "Education", color: "#22d3ee", catBg: "rgba(34,211,238,0.10)" },
  shopping: { label: "Shopping", color: "#c084fc", catBg: "rgba(192,132,252,0.10)" },
  freelance: { label: "Freelance", color: "#fb923c", catBg: "rgba(251,146,60,0.10)" },
  parenting: { label: "Parenting", color: "#a99cf5", catBg: "rgba(169,156,245,0.10)" },
  travel_events: { label: "Travel", color: "#2dd4bf", catBg: "rgba(45,212,191,0.10)" },
  personal_growth: { label: "Wellness", color: "#f5a623", catBg: "rgba(245,166,35,0.10)" },
};

// Recommended templates — curated 4 for the grid
const RECOMMENDED_SLUGS = [
  "resume-optimizer", "budget-builder", "lease-reviewer",
  "study-plan-maker",
];

// Ratings per template
const TEMPLATE_RATINGS: Record<string, number> = {
  "resume-optimizer": 4.8,
  "budget-builder": 4.7,
  "lease-reviewer": 4.9,
  "study-plan-maker": 4.6,
  "meal-prep-planner": 4.8,
  "freelance-bid-writer": 4.7,
};

// Pipeline agent preview data per template — matches reference TemplateCard
const TEMPLATE_PIPELINES: Record<string, { icon: string; label: string; color: string }[]> = {
  "resume-optimizer": [
    { icon: "🔍", label: "ATS Scanner", color: "#fb923c" },
    { icon: "🏷️", label: "Keyword Analyzer", color: "#c084fc" },
    { icon: "✏️", label: "Bullet Rewriter", color: "#22d3ee" },
    { icon: "⭐", label: "Scorer", color: "#4ade80" },
  ],
  "budget-builder": [
    { icon: "📊", label: "Income Analyzer", color: "#60a5fa" },
    { icon: "💳", label: "Expense Tracker", color: "#f472b6" },
    { icon: "🎯", label: "Budget Planner", color: "#4ade80" },
    { icon: "📈", label: "Savings Optimizer", color: "#f5a623" },
  ],
  "lease-reviewer": [
    { icon: "📋", label: "Clause Parser", color: "#60a5fa" },
    { icon: "🔒", label: "Risk Analyzer", color: "#ef4444" },
    { icon: "⚖️", label: "Legal Checker", color: "#c084fc" },
    { icon: "📝", label: "Report Writer", color: "#4ade80" },
  ],
  "study-plan-maker": [
    { icon: "📚", label: "Syllabus Analyzer", color: "#22d3ee" },
    { icon: "🧠", label: "Knowledge Mapper", color: "#7c6fef" },
    { icon: "📅", label: "Schedule Builder", color: "#fb923c" },
    { icon: "✅", label: "Progress Tracker", color: "#4ade80" },
  ],
};

// Runs count per template
const TEMPLATE_RUNS: Record<string, string> = {
  "resume-optimizer": "6.1k",
  "budget-builder": "3.4k",
  "lease-reviewer": "2.8k",
  "study-plan-maker": "4.5k",
  "meal-prep-planner": "1.9k",
  "freelance-bid-writer": "2.2k",
};

// Specialist agents displayed in the "Hire a Specialist" section
const SPECIALIST_PERSONAS: {
  slug: string; emoji: string; role: string; xp: string;
  skills: string[]; stats: { tasks: string; rating: string; speed: string };
  color1: string; color2: string; badge: string; specialty: string;
}[] = [
  { slug: "deep-research", emoji: "🧠", role: "Research Strategist", xp: "8 yrs", skills: ["Deep Research", "Data Analysis", "Competitive Intel"], stats: { tasks: "1.2k", rating: "5.0", speed: "Fast" }, color1: "#7c6fef", color2: "#a99cf5", badge: "Top Rated", specialty: "Multi-source" },
  { slug: "fullstack-developer", emoji: "💻", role: "Full-Stack AI Dev", xp: "6 yrs", skills: ["React / Next.js", "Node & APIs", "AI Integration"], stats: { tasks: "980", rating: "4.9", speed: "Fast" }, color1: "#2dd4bf", color2: "#5eead4", badge: "Expert", specialty: "SaaS Products" },
  { slug: "ux-designer", emoji: "🎨", role: "UX/UI Designer", xp: "5 yrs", skills: ["Figma", "User Research", "Design Systems"], stats: { tasks: "750", rating: "4.8", speed: "Medium" }, color1: "#f472b6", color2: "#f9a8d4", badge: "Creative", specialty: "Consumer Apps" },
  { slug: "data-analyst", emoji: "📊", role: "Data Scientist", xp: "7 yrs", skills: ["Python & Pandas", "ML Models", "Dashboards"], stats: { tasks: "860", rating: "5.0", speed: "Thorough" }, color1: "#f5a623", color2: "#fcd34d", badge: "Top Rated", specialty: "Analytics" },
  { slug: "content-creator", emoji: "✍️", role: "Content Strategist", xp: "4 yrs", skills: ["Long-form Writing", "SEO", "Brand Voice"], stats: { tasks: "2.1k", rating: "4.7", speed: "Fast" }, color1: "#60a5fa", color2: "#93c5fd", badge: "Prolific", specialty: "B2C Brands" },
  { slug: "strategy-advisor", emoji: "📈", role: "Growth Hacker", xp: "5 yrs", skills: ["A/B Testing", "Funnel Optimization", "Viral Loops"], stats: { tasks: "640", rating: "4.8", speed: "Fast" }, color1: "#fb923c", color2: "#fdba74", badge: "Results-driven", specialty: "Early Stage" },
  { slug: "code-reviewer", emoji: "🔒", role: "Security Auditor", xp: "9 yrs", skills: ["Pen Testing", "Code Review", "OWASP"], stats: { tasks: "430", rating: "5.0", speed: "Thorough" }, color1: "#ef4444", color2: "#f87171", badge: "Certified", specialty: "SaaS & APIs" },
  { slug: "sales-coach", emoji: "🤖", role: "AI Prompt Engineer", xp: "3 yrs", skills: ["Chain-of-thought", "RAG Systems", "Agent Design"], stats: { tasks: "1.5k", rating: "4.9", speed: "Fast" }, color1: "#22d3ee", color2: "#67e8f9", badge: "Specialist", specialty: "LLM Products" },
];

/* ─── Pill component ─── */
function Pill({ children, color = P.lime, bg = "rgba(197,241,53,0.13)", size = 10 }: {
  children: React.ReactNode; color?: string; bg?: string; size?: number;
}) {
  return (
    <span style={{
      fontSize: size, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
      background: bg, color, letterSpacing: "0.04em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

/* ─── Specialist Card with 3D tilt ─── */
function SpecialistCardH({ s, onClick }: {
  s: typeof SPECIALIST_PERSONAS[0];
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRot({
      x: ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -7,
      y: ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 10,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setRot({ x: 0, y: 0 });
    setHov(false);
  }, []);

  const gx = 50 + rot.y * 3;
  const gy = 50 + rot.x * 3;

  return (
    <div ref={cardRef} onMouseMove={handleMove} onMouseEnter={() => setHov(true)} onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ perspective: 800, cursor: "pointer", flexShrink: 0, width: 220 }}>
      <div style={{
        background: `linear-gradient(150deg, ${P.bg3}, ${P.bg2})`,
        border: `1px solid ${hov ? P.border2 : P.border}`,
        borderRadius: 16, padding: "0 0 14px", overflow: "hidden", position: "relative",
        transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hov ? 1.03 : 1})`,
        transition: hov ? "transform 0.08s" : "transform 0.5s",
        boxShadow: hov ? "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 3px 14px rgba(0,0,0,0.3)",
        transformStyle: "preserve-3d" as const,
      }}>
        {/* Specular highlight */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", zIndex: 10,
          background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.07) 0%, transparent 55%)`,
          transition: "background 0.08s",
        }} />

        {/* Header strip */}
        <div style={{
          height: 52, background: `linear-gradient(135deg, ${s.color1}22, ${s.color2}38)`,
          borderBottom: `1px solid ${P.border}`, position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 75% 35%, ${s.color1}25 0%, transparent 65%)` }} />
          <div style={{ position: "absolute", top: 9, right: 11, zIndex: 2 }}>
            <Pill color={s.color1} bg={`${s.color1}30`} size={9}>{s.badge}</Pill>
          </div>
          {(() => {
            const av = getAgentAvatar(s.slug);
            return av ? (
              <img src={av} alt="" style={{
                width: 40, height: 40, borderRadius: 11, objectFit: "cover",
                border: `2.5px solid ${P.bg3}`,
                position: "absolute", bottom: -16, left: 14,
                boxShadow: `0 5px 18px ${s.color1}44`, zIndex: 2,
              }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: `linear-gradient(135deg, ${s.color1}, ${s.color2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, border: `2.5px solid ${P.bg3}`,
                position: "absolute", bottom: -16, left: 14,
                boxShadow: `0 5px 18px ${s.color1}44`, zIndex: 2,
              }}>{s.emoji}</div>
            );
          })()}
        </div>

        <div style={{ padding: "24px 14px 0", position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F, color: P.text, marginBottom: 2 }}>{s.role}</div>
            <div style={{ fontSize: 10.5, color: P.textSec }}>
              {s.xp} · <span style={{ color: s.color1 }}>{s.specialty}</span>
            </div>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${s.color1}44, transparent)`, margin: "8px 0" }} />

          {/* Skills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 9 }}>
            {s.skills.slice(0, 3).map((sk) => (
              <span key={sk} style={{
                fontSize: 9.5, padding: "3px 8px", borderRadius: 5,
                background: P.bg5, border: `1px solid ${P.border2}`,
                color: P.text, fontFamily: F, fontWeight: 500,
              }}>{sk}</span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 10 }}>
            {Object.entries(s.stats).map(([k, v]) => (
              <div key={k} style={{
                background: P.bg4, borderRadius: 7, padding: "6px 5px",
                textAlign: "center", border: `1px solid ${P.border}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: F, color: s.color1, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 8.5, color: P.textSec, marginTop: 2, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{k}</div>
              </div>
            ))}
          </div>

          <button style={{
            width: "100%", padding: "8px", borderRadius: 8,
            border: `1px solid ${s.color1}`,
            background: `${s.color1}14`,
            color: s.color1, fontWeight: 700, fontSize: 10.5,
            cursor: "pointer", fontFamily: F, transition: "all 0.2s",
          }}>
            Hire →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Job Row ─── */
function JobRow({ task, onClick }: { task: TaskWithAgent; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const progress = task.progress || 0;
  const statusColor = task.status === "review" ? P.amber : task.status === "working" ? P.teal : task.status === "done" ? P.lime : P.textTer;
  const statusBg = `${statusColor}15`;
  const statusLabel = task.status === "review" ? "Review Ready" : task.status === "working" ? "Running" : task.status === "done" ? "Done" : "Queued";
  const cost = Number(task.cost_usd) || 0;

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 15px",
        background: hov ? P.bg3 : P.bg2,
        border: `1px solid ${hov ? P.border2 : P.border}`,
        borderRadius: 11, cursor: "pointer",
        transition: "all 0.15s",
      }}>
      <div style={{
        width: 31, height: 31, borderRadius: 9,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0, background: statusBg,
      }}>
        {task.agent?.icon || "📋"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, fontFamily: F, color: P.text,
          marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{task.title}</div>
        <div style={{ fontSize: 11, color: P.textSec }}>
          {task.agent?.name || "Unassigned"} {task.current_step ? `· ${task.current_step}` : ""}
        </div>
      </div>
      <div style={{
        width: 68, background: P.bg4, borderRadius: 100,
        height: 3.5, overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          height: "100%", borderRadius: 100,
          width: `${progress}%`,
          background: task.status === "review" ? P.amber : P.lime,
        }} />
      </div>
      <Pill color={statusColor} bg={statusBg} size={9.5}>{statusLabel}</Pill>
      <div style={{ fontSize: 10.5, color: P.textSec, flexShrink: 0 }}>
        ${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(2)}
      </div>
    </div>
  );
}


export default function TodayPage() {
  const { tasks, mutate } = useTasks("today");
  const { agents } = useAgents();
  const router = useRouter();
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
      window.history.replaceState({}, "", "/today");
    }
  }, [searchParams, agents]);

  const reviewTasks = tasks.filter((t) => t.status === "review");
  const workingTasks = tasks.filter((t) => t.status === "working");
  const todoTasks = tasks.filter((t) => t.status === "todo" || t.status === "failed");
  const totalCost = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
  const runningJobs = tasks.filter((t) => t.status === "working" || t.status === "review");

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
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      if (!task.agent_id) {
        setSelectedTask(task);
        return;
      }
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
        ? { id: firstAgent.id, name: firstAgent.name, slug: firstAgent.slug, icon: firstAgent.icon, color: firstAgent.color, gradient: firstAgent.gradient }
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

      if (fileContent) {
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: fileContent }),
        });
      }

      if (agentIds && agentIds.length > 0) {
        await fetch(`/api/tasks/${task.id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agentIds[0] }),
        });

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

      <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 26 }}>

        {/* Compact greeting banner */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 18px", background: P.bg2,
          border: `1px solid ${P.border}`, borderRadius: 12,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{
            position: "absolute", right: -40, top: -40, width: 180, height: 180,
            background: `radial-gradient(circle, ${P.violet}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div>
            <div style={{ fontFamily: FS, fontSize: 18, fontWeight: 500, lineHeight: 1.2, color: P.text }}>
              Good morning. <span style={{ fontStyle: "italic", color: P.lime2 }}>What are we shipping?</span>
            </div>
            <div style={{ fontSize: 12, color: P.textSec, marginTop: 4 }}>
              50+ specialist agents · pre-built pipelines · results in seconds.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {[
              { num: String(tasks.length), label: "Jobs today", c: P.lime },
              { num: `$${totalCost < 0.01 ? totalCost.toFixed(4) : totalCost.toFixed(2)}`, label: "Cost", c: P.amber },
              { num: String(workingTasks.length), label: "Running", c: P.teal },
            ].map((s) => (
              <div key={s.label} style={{
                textAlign: "center", padding: "8px 14px",
                background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 9,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.c, lineHeight: 1, fontFamily: F }}>{s.num}</div>
                <div style={{ fontSize: 9.5, color: P.textSec, marginTop: 3, textTransform: "uppercase" as const, letterSpacing: "0.07em", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready-to-run Templates */}
        <div style={{
          background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 16,
          padding: "18px 20px 20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: -60, bottom: -60, width: 200, height: 200,
            background: `radial-gradient(circle, ${P.lime}08 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: F, marginBottom: 3, margin: 0, color: P.text }}>
                🗂️ Ready-to-run Templates
              </h2>
              <div style={{ fontSize: 11.5, color: P.textSec }}>Click Use to start a new job with this pipeline</div>
            </div>
            <a href="/templates" style={{ fontSize: 11.5, color: P.lime2, textDecoration: "none", fontFamily: F, fontWeight: 600 }}>Browse all →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {RECOMMENDED_SLUGS.map((slug) => {
              const agent = agents.find((a) => a.slug === slug);
              if (!agent) return null;
              const catId = AGENT_CATEGORY_MAP[slug] || "career";
              const cat = CATEGORY_META[catId] || CATEGORY_META.career;
              const rating = TEMPLATE_RATINGS[slug] || 4.7;

              const pipeline = TEMPLATE_PIPELINES[slug] || [];
              const runs = TEMPLATE_RUNS[slug] || "1.0k";

              return (
                <TemplateCard
                  key={slug}
                  agent={agent}
                  cat={cat}
                  rating={rating}
                  runs={runs}
                  pipeline={pipeline}
                  onUse={() => {
                    router.push(`/templates/${slug}`);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Hire a Specialist */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: F, marginBottom: 3, margin: 0, color: P.text }}>
                🤝 Hire a Specialist
              </h2>
              <div style={{ fontSize: 11.5, color: P.textSec }}>Expert agents — hover any card for full profile</div>
            </div>
            <a href="/agents" style={{ fontSize: 11.5, color: P.lime2, textDecoration: "none", fontFamily: F, fontWeight: 600 }}>Meet all →</a>
          </div>
          <div style={{
            display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8,
            scrollbarWidth: "thin" as const, scrollbarColor: `${P.border2} transparent`,
          }}>
            {SPECIALIST_PERSONAS.map((s) => {
              const agent = agents.find((a) => a.slug === s.slug);
              return (
                <SpecialistCardH
                  key={s.slug}
                  s={s}
                  onClick={() => agent && setPreviewAgent(agent)}
                />
              );
            })}
          </div>
        </div>

        {/* Running Jobs */}
        {runningJobs.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: F, margin: 0, color: P.text }}>🟢 Running Jobs</h2>
              <a href="/analytics" style={{ fontSize: 11.5, color: P.lime2, textDecoration: "none", fontFamily: F, fontWeight: 600 }}>View all →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {runningJobs.slice(0, 3).map((t) => (
                <JobRow key={t.id} task={t} onClick={() => setSelectedTask(t)} />
              ))}
            </div>
          </div>
        )}

        {/* Usage panel */}
        <UsagePanel tasks={tasks} />

        {/* Tasks header — status + select */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
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
                border: `1.5px solid ${bulkMode ? P.violet + "50" : P.border}`,
                backgroundColor: bulkMode ? P.indigoLight : P.bg2,
                color: bulkMode ? P.violet : P.textSec,
                fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                fontFamily: F, transition: "all 0.15s",
              }}
            >
              {bulkMode ? "Cancel" : "Select"}
            </button>
          )}
        </div>

        {/* Task sections */}
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

        <BulkActionsBar
          selectedCount={selectedIds.size}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkPriority={handleBulkPriority}
          onBulkMove={handleBulkMove}
          loading={bulkLoading}
        />
      </div>

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
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            animation: "fadeIn 0.2s ease",
          }} />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(440px, 92vw)", backgroundColor: P.bg2,
              border: `1px solid ${P.border2}`,
              borderRadius: 20, boxShadow: P.shadowFloat,
              position: "relative",
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
              <h3 style={{
                fontSize: 20, fontWeight: 800, color: P.text, margin: "0 0 4px",
                letterSpacing: "-0.02em", fontFamily: F,
              }}>
                {previewAgent.name}
              </h3>
              <p style={{ fontSize: 13, color: previewAgent.color, fontWeight: 600, margin: "0 0 12px" }}>
                {previewAgent.description}
              </p>
              <p style={{
                fontSize: 14, color: P.textSec, lineHeight: 1.6, margin: "0 0 20px",
              }}>
                {previewAgent.long_description || previewAgent.description}
              </p>

              {/* Model badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 6,
                backgroundColor: `${P.violet}18`, fontSize: 11, color: P.violet2,
                fontFamily: FM, marginBottom: 20,
              }}>
                {previewAgent.model.includes("claude") ? "Anthropic Claude" : previewAgent.model.includes("gemini") ? "Google Gemini" : previewAgent.model.includes("gpt") ? "OpenAI GPT" : "AI-Powered"}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setCreateAgentId(previewAgent?.id || null); setPreviewAgent(null); setShowCreateModal(true); }}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                    background: P.lime, color: "#0b0b0e",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: F, transition: "all 0.2s",
                  }}
                >
                  Hire this specialist
                </button>
                <button
                  onClick={() => setPreviewAgent(null)}
                  style={{
                    padding: "12px 20px", borderRadius: 12,
                    border: `1px solid ${P.border2}`,
                    backgroundColor: P.bg3, color: P.textSec,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: F, transition: "all 0.15s",
                  }}
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
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            animation: "fadeIn 0.3s ease",
          }} />
          <div style={{
            position: "relative", width: "min(480px, 90vw)", padding: "48px 28px",
            backgroundColor: P.bg2, borderRadius: 24,
            border: `1px solid ${P.border2}`,
            boxShadow: P.shadowFloat,
            textAlign: "center",
            animation: "modalIn 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Top gradient accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: authPrompt === "login"
                ? `linear-gradient(90deg, ${P.violet}, ${P.rose})`
                : `linear-gradient(90deg, ${P.amber}, ${P.orange})`,
              borderRadius: "24px 24px 0 0",
            }} />

            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
              background: authPrompt === "login"
                ? `linear-gradient(135deg, ${P.violet}, ${P.rose})`
                : `linear-gradient(135deg, ${P.amber}, ${P.orange})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
              boxShadow: authPrompt === "login"
                ? `0 8px 24px ${P.violet}4D`
                : `0 8px 24px ${P.amber}4D`,
            }}>
              {authPrompt === "login" ? "🔐" : "🔑"}
            </div>

            <h2 style={{
              fontSize: 24, fontWeight: 900, color: P.text,
              letterSpacing: "-0.03em", margin: "0 0 8px", fontFamily: F,
            }}>
              {authPrompt === "login" ? "Oh snap! You need to sign in" : "Almost there! Add your API key"}
            </h2>

            <p style={{
              fontSize: 15, color: P.textSec, lineHeight: 1.6,
              margin: "0 0 28px", maxWidth: 340, marginLeft: "auto", marginRight: "auto",
            }}>
              {authPrompt === "login"
                ? "Create a free account to run AI agents and unlock the full power of AgentStudio."
                : "Add your OpenAI, Gemini, or Anthropic API key in Settings to start running agents."}
            </p>

            <a
              href={authPrompt === "login" ? "/login" : "/settings"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 14,
                background: P.lime, color: "#0b0b0e",
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                fontFamily: F, transition: "all 0.2s",
              }}
            >
              {authPrompt === "login" ? "Sign In Free" : "Go to Settings"}
            </a>

            <p style={{
              fontSize: 13, color: P.textTer, marginTop: 20, marginBottom: 0,
            }}>
              Redirecting in <span style={{
                fontWeight: 700, color: P.lime,
                fontFamily: FM,
              }}>{authCountdown}s</span>
            </p>

            <div style={{
              marginTop: 12, height: 3, backgroundColor: P.bg4,
              borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${((10 - authCountdown) / 10) * 100}%`,
                background: `linear-gradient(90deg, ${P.violet}, ${P.lime})`,
                borderRadius: 2, transition: "width 1s linear",
              }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* ─── Template Card ─── */
function TemplateCard({ agent, cat, rating, runs, pipeline, onUse }: {
  agent: { id: string; icon: string; name: string; description: string | null; slug?: string };
  cat: { label: string; color: string; catBg: string };
  rating: number;
  runs: string;
  pipeline: { icon: string; label: string; color: string }[];
  onUse: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onUse}
      style={{
        background: P.bg3, border: `1px solid ${hov ? P.border2 : P.border}`,
        borderRadius: 15, overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.2s", minWidth: 0,
      }}
    >
      {/* Gradient stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}44)` }} />

      <div style={{ padding: "13px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header: icon + name + category pill + rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: cat.catBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>{agent.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F, marginBottom: 2, color: P.text }}>{agent.name}</div>
              <Pill color={cat.color} bg={cat.catBg} size={9.5}>{cat.label}</Pill>
            </div>
          </div>
          <span style={{ fontSize: 11, color: P.amber, fontWeight: 700 }}>★ {rating}</span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 11.5, color: P.textSec, lineHeight: 1.55, marginBottom: 10 }}>
          {agent.description}
        </div>

        {/* Pipeline agent preview */}
        {pipeline.length > 0 && (
          <div style={{
            padding: "9px 11px", background: P.bg4,
            borderRadius: 8, border: `1px solid ${P.border}`, marginBottom: 10,
          }}>
            <div style={{
              fontSize: 9.5, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: P.textSec, fontWeight: 600, marginBottom: 6,
            }}>
              {pipeline.length} agents
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {pipeline.map((step, i) => (
                <span key={step.label}>
                  <span style={{
                    fontSize: 9.5, padding: "3px 7px", borderRadius: 5,
                    background: `${step.color}15`, border: `1px solid ${step.color}33`,
                    color: step.color, fontFamily: F, fontWeight: 600,
                  }}>
                    {step.icon} {step.label}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span style={{ color: P.textTer, fontSize: 9, margin: "0 1px" }}>›</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer: runs + Use Template button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto", paddingTop: 9,
          borderTop: `1px solid ${P.border}`,
        }}>
          <span style={{ fontSize: 10.5, color: P.textSec, fontWeight: 500 }}>{runs} runs</span>
          <button onClick={(e) => { e.stopPropagation(); onUse(); }} style={{
            fontSize: 10.5, fontWeight: 700, padding: "5px 12px", borderRadius: 7,
            background: P.lime, color: "#0b0b0e", border: "none",
            cursor: "pointer", fontFamily: F,
          }}>
            Use Template →
          </button>
        </div>
      </div>
    </div>
  );
}
