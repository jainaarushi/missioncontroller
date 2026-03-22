"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { BulkActionsBar } from "@/components/tasks/bulk-actions-bar";
import { Confetti } from "@/components/shared/confetti";
import { UsagePanel } from "@/components/shared/usage-panel";
import { HireConfirmation } from "@/components/tasks/hire-confirmation";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P, F, FS, FM } from "@/lib/palette";
import { isTemplateAgent, AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import { Search, Code2, Palette, BarChart3, PenTool, TrendingUp, ShieldCheck, BrainCircuit, ChevronLeft, ChevronRight, Plus, ArrowRight, ArrowUpRight, AtSign, LineChart, Wrench, Rocket, Globe, FileEdit, Share2 } from "lucide-react";
import type { TaskWithAgent, TaskPriority } from "@/lib/types/task";
import type { PipelineStep } from "@/lib/ai/pipelines";
import { CATEGORY_META, TEMPLATE_PIPELINES, TEMPLATE_RATINGS, TEMPLATE_RUNS } from "@/lib/template-agents";

// Recommended templates — curated 4 for the grid
const RECOMMENDED_SLUGS = [
  "resume-optimizer", "budget-builder", "lease-reviewer",
  "study-plan-maker",
];

// Specialist agents displayed in the "Specialist Agents" section
const SPECIALIST_PERSONAS: {
  slug: string; icon: React.ReactNode; role: string;
  desc: string; skills: string[];
  bgColor: string; textColor: string; status: "active" | "idle";
}[] = [
  { slug: "deep-research", icon: <Search size={24} />, role: "Research Strategist", desc: "Specializes in deep market analysis and lead generation via web scraping.", skills: ["Market Analysis", "Data Scraping"], bgColor: "bg-blue-50", textColor: "text-blue-600", status: "active" },
  { slug: "fullstack-developer", icon: <Code2 size={24} />, role: "Full-Stack AI Dev", desc: "Handles automated PR reviews, refactoring, and integration testing.", skills: ["CI/CD", "Node.js", "Python"], bgColor: "bg-purple-50", textColor: "text-purple-600", status: "active" },
  { slug: "content-creator", icon: <PenTool size={24} />, role: "Content Specialist", desc: "Generates high-quality newsletters, social posts, and blog content.", skills: ["Copywriting", "Social Media"], bgColor: "bg-amber-50", textColor: "text-amber-600", status: "idle" },
  { slug: "code-reviewer", icon: <ShieldCheck size={24} />, role: "Security Analyst", desc: "Monitors system vulnerabilities and enforces swarm-wide protocols.", skills: ["Compliance", "Audit Log"], bgColor: "bg-rose-50", textColor: "text-rose-600", status: "active" },
  { slug: "ux-designer", icon: <Palette size={24} />, role: "UX/UI Designer", desc: "Creates wireframes, prototypes, and design systems for products.", skills: ["Figma", "User Research"], bgColor: "bg-green-50", textColor: "text-green-600", status: "idle" },
  { slug: "data-analyst", icon: <BarChart3 size={24} />, role: "Data Scientist", desc: "Builds dashboards, runs ML models, and extracts actionable insights.", skills: ["Python", "ML Models"], bgColor: "bg-blue-50", textColor: "text-blue-600", status: "active" },
  { slug: "strategy-advisor", icon: <TrendingUp size={24} />, role: "Growth Hacker", desc: "Optimizes funnels, runs A/B tests, and designs viral loops.", skills: ["A/B Testing", "Funnels"], bgColor: "bg-amber-50", textColor: "text-amber-600", status: "idle" },
  { slug: "sales-coach", icon: <BrainCircuit size={24} />, role: "AI Prompt Engineer", desc: "Designs chain-of-thought prompts, RAG systems, and agent architectures.", skills: ["RAG", "Agent Design"], bgColor: "bg-purple-50", textColor: "text-purple-600", status: "active" },
];

// Featured templates with gradient colors
const FEATURED_TEMPLATES: { slug: string; icon: React.ReactNode; title: string; desc: string; agents: number; category: string; gradient: string }[] = [
  { slug: "resume-optimizer", icon: <AtSign size={28} />, title: "LinkedIn Cold Outreach", desc: "Full-cycle research, personalized drafting, and automated scheduling.", agents: 2, category: "SALES", gradient: "from-[#4b30a1] to-[#6344d4]" },
  { slug: "budget-builder", icon: <LineChart size={28} />, title: "Market Analysis", desc: "Real-time competitor monitoring, price tracking, and sentiment reports.", agents: 3, category: "STRATEGY", gradient: "from-[#006064] to-[#0097a7]" },
  { slug: "lease-reviewer", icon: <Wrench size={28} />, title: "Technical Debt Cleanup", desc: "Automated linting, refactoring suggestions, and dependency updates.", agents: 1, category: "DEVOPS", gradient: "from-[#0d47a1] to-[#1976d2]" },
];

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
  const [hireConfirm, setHireConfirm] = useState<{ name: string; icon: string; color: string } | null>(null);
  const specialistScrollRef = useRef<HTMLDivElement>(null);
  const templateScrollRef = useRef<HTMLDivElement>(null);

  useRealtimeTasks(mutate);
  const searchParams = useSearchParams();

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

    if (firstAgent) {
      setHireConfirm({ name: firstAgent.name, icon: firstAgent.icon, color: firstAgent.color });
    }
  }

  function scrollSpecialists(dir: "left" | "right") {
    specialistScrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  function scrollTemplates(dir: "left" | "right") {
    templateScrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <>
      <Confetti show={showConfetti} />

      <div className="p-8 min-h-screen" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f9f9f9", color: "#1b1b1b" }}>

        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#1b1b1b" }}>System Overview</h1>
            <p className="text-sm font-medium mt-1" style={{ color: "#44474e" }}>Real-time status of your autonomous agent swarm.</p>
          </div>
          <button
            onClick={() => { setCreateAgentId(null); setShowCreateModal(true); }}
            className="px-5 py-2.5 font-bold rounded-lg flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1e8e3e", color: "#fff" }}
          >
            <Plus size={18} />
            <span>Deploy Specialist</span>
          </button>
        </header>

        {/* Create New Initiative CTA */}
        <section className="mb-8">
          <button
            onClick={() => { setCreateAgentId(null); setShowCreateModal(true); }}
            className="w-full p-8 rounded-2xl shadow-lg flex items-center justify-between group overflow-hidden relative text-left transition-all duration-300"
            style={{ backgroundColor: "#1e8e3e", border: "2px solid #156d2e" }}
          >
            <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-20 w-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <Plus size={48} color="#fff" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Create New Initiative</h2>
                <p className="text-lg font-medium mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>Launch a new autonomous task and assign specialist agents instantly.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all relative z-10 text-white" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span>Start Building</span>
              <ArrowRight size={18} />
            </div>
          </button>
        </section>

        {/* Specialist Agents */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: "#1978e5" }} />
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1b1b1b" }}>Specialist Agents</h2>
            </div>
            <div className="flex items-center gap-4">
              <a href="/agents" className="hidden md:flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80" style={{ color: "#1978e5" }}>
                <span>View All Specialists</span>
                <ArrowRight size={16} />
              </a>
              <div className="flex gap-2">
                <button onClick={() => scrollSpecialists("left")} className="p-1.5 rounded-full border bg-white transition-colors hover:text-blue-600" style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollSpecialists("right")} className="p-1.5 rounded-full border bg-white transition-colors hover:text-blue-600" style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          <div ref={specialistScrollRef} className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
            {SPECIALIST_PERSONAS.map((s) => {
              const agent = agents.find((a) => a.slug === s.slug);
              return (
                <div
                  key={s.slug}
                  onClick={() => agent && setPreviewAgent(agent)}
                  className="min-w-[300px] bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer snap-start"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${s.bgColor} ${s.textColor} flex items-center justify-center`}>
                      {s.icon}
                    </div>
                    {s.status === "active" ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        IDLE
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#1b1b1b" }}>{s.role}</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#44474e" }}>{s.desc}</p>
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-1.5" style={{ borderColor: "#f9fafb" }}>
                    {s.skills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 bg-gray-100 text-[10px] font-semibold text-gray-600 rounded">{sk}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Templates */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1b1b1b" }}>Featured Templates</h2>
            <div className="flex items-center gap-4">
              <a href="/agents" className="hidden md:flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80" style={{ color: "#1978e5" }}>
                <span>View All Templates</span>
                <ArrowRight size={16} />
              </a>
              <div className="flex gap-2">
                <button onClick={() => scrollTemplates("left")} className="p-1.5 rounded-full border bg-white transition-colors hover:text-blue-600" style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollTemplates("right")} className="p-1.5 rounded-full border bg-white transition-colors hover:text-blue-600" style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          <div ref={templateScrollRef} className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
            {FEATURED_TEMPLATES.map((t) => (
              <div
                key={t.slug}
                onClick={() => router.push(`/templates/${t.slug}`)}
                className={`min-w-[300px] bg-gradient-to-br ${t.gradient} rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 snap-start group cursor-pointer relative overflow-hidden`}
              >
                <div className="absolute right-0 top-0 -mr-8 -mt-8 w-32 h-32 rounded-full group-hover:scale-125 transition-transform duration-500" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {t.icon}
                  </div>
                  <ArrowUpRight size={20} className="transition-colors" style={{ color: "rgba(255,255,255,0.4)" }} />
                </div>
                <h3 className="text-lg font-bold text-white relative z-10">{t.title}</h3>
                <p className="text-sm mt-2 leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.7)" }}>{t.desc}</p>
                <div className="mt-6 flex gap-2 relative z-10">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded uppercase" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>{t.agents} Agent{t.agents > 1 ? "s" : ""}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded uppercase" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Specialist Orchestration Diagram */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            padding: "60px 40px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            marginBottom: 32,
          }}
        >
          {/* Decorative background blurs */}
          <div style={{ position: "absolute", top: -40, left: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(30,142,62,0.12)", filter: "blur(80px)", opacity: 0.15, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: -30, width: 320, height: 320, borderRadius: "50%", background: "rgba(34,197,94,0.15)", filter: "blur(80px)", opacity: 0.15, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40%", left: "50%", width: 200, height: 200, borderRadius: "50%", background: "rgba(30,142,62,0.08)", filter: "blur(80px)", opacity: 0.15, pointerEvents: "none", transform: "translateX(-50%)" }} />

          {/* Diagram container */}
          <div style={{ position: "relative", width: "100%", maxWidth: 640, height: 300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* SVG connecting lines */}
            <svg
              viewBox="0 0 640 300"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              {/* Top-left: Researcher */}
              <line x1="320" y1="150" x2="120" y2="60" stroke="rgba(30,142,62,0.3)" strokeWidth="2" strokeDasharray="8 8" />
              {/* Top-right: Copywriter */}
              <line x1="320" y1="150" x2="520" y2="60" stroke="rgba(30,142,62,0.3)" strokeWidth="2" strokeDasharray="8 8" />
              {/* Bottom-left: LinkedIn Pro */}
              <line x1="320" y1="150" x2="140" y2="240" stroke="rgba(30,142,62,0.3)" strokeWidth="2" strokeDasharray="8 8" />
              {/* Bottom-right: Visual Agent */}
              <line x1="320" y1="150" x2="500" y2="240" stroke="rgba(30,142,62,0.3)" strokeWidth="2" strokeDasharray="8 8" />
            </svg>

            {/* Central node */}
            <div style={{
              position: "relative",
              zIndex: 20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#1e8e3e",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(30,142,62,0.3), 0 8px 24px rgba(30,142,62,0.2)",
              color: "#fff",
            }}>
              <Rocket size={28} />
              <span style={{ fontSize: 9, fontWeight: 800, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Project</span>
            </div>

            {/* Researcher - top-left */}
            <div
              className="orchestration-float"
              style={{
                position: "absolute",
                top: 10,
                left: "10%",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(239,246,255,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid #bfdbfe",
                borderRadius: 16,
                padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>
                  <Globe size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#1e3a5f" }}>Researcher</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(59,130,246,0.7)", marginTop: 1 }}>Finding insights</div>
                </div>
              </div>
            </div>

            {/* Copywriter - top-right */}
            <div
              className="orchestration-float-delayed"
              style={{
                position: "absolute",
                top: 10,
                right: "10%",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(245,243,255,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid #ddd6fe",
                borderRadius: 16,
                padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
                  <FileEdit size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#3b1f7e" }}>Copywriter</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(139,92,246,0.7)", marginTop: 1 }}>Drafting content</div>
                </div>
              </div>
            </div>

            {/* LinkedIn Pro - bottom-left */}
            <div
              className="orchestration-float-extra-delayed"
              style={{
                position: "absolute",
                bottom: 10,
                left: "12%",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(238,242,255,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid #c7d2fe",
                borderRadius: 16,
                padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
                  <Share2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#312e81" }}>LinkedIn Pro</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(79,70,229,0.7)", marginTop: 1 }}>Managing outreach</div>
                </div>
              </div>
            </div>

            {/* Visual Agent - bottom-right */}
            <div
              className="orchestration-float"
              style={{
                position: "absolute",
                bottom: 20,
                right: "14%",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,241,242,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid #fecdd3",
                borderRadius: 16,
                padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(244,63,94,0.3)" }}>
                  <Palette size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#881337" }}>Visual Agent</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(244,63,94,0.7)", marginTop: 1 }}>Polishing assets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1b1b1b" }}>One Platform. Infinite Specialists.</h3>
            <p style={{ fontSize: 16, color: "#44474e", marginTop: 8, fontStyle: "italic", opacity: 0.8 }}>Your tasks, orchestrated with precision.</p>
          </div>

          {/* Float animation styles */}
          <style>{`
            @keyframes orchestrationFloat {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
            .orchestration-float {
              animation: orchestrationFloat 4s ease-in-out infinite;
            }
            .orchestration-float-delayed {
              animation: orchestrationFloat 4s ease-in-out infinite;
              animation-delay: 1.5s;
            }
            .orchestration-float-extra-delayed {
              animation: orchestrationFloat 4s ease-in-out infinite;
              animation-delay: 2.5s;
            }
          `}</style>
        </section>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(30,142,62,0.1)" }}>
                <BrainCircuit size={20} style={{ color: "#1e8e3e" }} />
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: "#1e8e3e", backgroundColor: "rgba(30,142,62,0.1)" }}>LIVE</span>
            </div>
            <span className="text-sm font-semibold mb-1" style={{ color: "#44474e" }}>Active Agents</span>
            <div className="text-4xl font-black" style={{ color: "#1b1b1b" }}>{workingTasks.length}</div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold" style={{ color: "#1e8e3e" }}>
              <TrendingUp size={14} />
              <span>{tasks.length} tasks today</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(99,91,83,0.1)" }}>
                <ShieldCheck size={20} style={{ color: "#635b53" }} />
              </div>
            </div>
            <span className="text-sm font-semibold mb-1" style={{ color: "#44474e" }}>Total Successful Tasks</span>
            <div className="text-4xl font-black" style={{ color: "#1b1b1b" }}>{reviewTasks.length + tasks.filter(t => t.status === "done").length}</div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold" style={{ color: "#44474e" }}>
              <span>${totalCost < 0.01 ? totalCost.toFixed(4) : totalCost.toFixed(2)} spent</span>
            </div>
          </div>
        </div>

        {/* Active Workflows + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Active Workflows */}
          <div className="lg:col-span-2 space-y-8">
            {runningJobs.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#f3f4f6" }}>
                  <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1b1b1b" }}>Active Workflows</h2>
                  <a href="/analytics" className="text-sm font-bold flex items-center gap-1" style={{ color: "#1e8e3e" }}>
                    <span>View All</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
                <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                  {runningJobs.slice(0, 4).map((t) => {
                    const progress = t.progress || 0;
                    return (
                      <div key={t.id} onClick={() => setSelectedTask(t)} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(30,142,62,0.1)", color: "#1e8e3e" }}>
                            <span className="text-lg">{t.agent?.icon || "📋"}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm" style={{ color: "#1b1b1b" }}>{t.title}</h4>
                            <p className="text-xs" style={{ color: "#44474e" }}>{t.agent?.name || "Unassigned"} {t.current_step ? `· ${t.current_step}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: t.status === "review" ? "#22c55e" : "#1e8e3e" }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: t.status === "review" ? "#16a34a" : "#1e8e3e" }}>{progress}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Sections */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "#1b1b1b" }}>Tasks</h2>
                {tasks.length > 0 && (
                  <button
                    onClick={() => { setBulkMode(!bulkMode); if (bulkMode) clearSelection(); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                      borderColor: bulkMode ? "#1e8e3e" : "#e5e7eb",
                      backgroundColor: bulkMode ? "rgba(30,142,62,0.1)" : "#fff",
                      color: bulkMode ? "#1e8e3e" : "#6b7280",
                    }}
                  >
                    {bulkMode ? "Cancel" : "Select"}
                  </button>
                )}
              </div>
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
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border shadow-sm h-full flex flex-col" style={{ borderColor: "#e5e7eb" }}>
              <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: "#1b1b1b" }}>Recent Activity</h2>
              <div className="flex-1 space-y-6 overflow-y-auto">
                {tasks.slice(0, 4).map((t, i) => (
                  <div key={t.id} className="flex gap-4 relative">
                    {i < 3 && (
                      <div className="absolute w-[2px] bg-gray-100" style={{ left: 15, top: 32, bottom: -24 }} />
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10" style={{ backgroundColor: "rgba(30,142,62,0.1)" }}>
                      <span className="text-sm">{t.agent?.icon || "📋"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#1b1b1b" }}>{t.agent?.name || "Unassigned"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#44474e" }}>{t.title}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-2 block" style={{ color: "#9ca3af" }}>
                        {t.status === "working" ? "In progress" : t.status === "review" ? "Ready for review" : t.status === "done" ? "Completed" : "Queued"}
                      </span>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>No recent activity. Create a task to get started.</p>
                )}
              </div>
              <a href="/analytics" className="mt-8 py-3 w-full bg-gray-50 font-bold text-xs rounded-lg border text-center block uppercase tracking-widest hover:bg-gray-100 transition-colors" style={{ borderColor: "#e5e7eb", color: "#1b1b1b", textDecoration: "none" }}>
                View Full Log
              </a>
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6" style={{ backgroundColor: "#303030", color: "#fff" }}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center animate-pulse" style={{ border: "4px solid rgba(30,142,62,0.3)" }}>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: "#1e8e3e" }} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Swarm Sync Active</h4>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>All specialists are synchronized with the central neural core.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCreateAgentId(null); setShowCreateModal(true); }}
              className="px-6 py-2 font-bold rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1e8e3e", color: "#fff" }}
            >
              Launch New Agent
            </button>
            <button className="px-6 py-2 font-bold rounded-lg transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}>
              Emergency Stop
            </button>
          </div>
        </div>

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
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
          }} />
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
            style={{ width: "min(440px, 92vw)" }}
          >
            <div className="h-20 flex items-center justify-center text-4xl" style={{ background: previewAgent.gradient }}>
              {previewAgent.icon}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-extrabold mb-1" style={{ color: "#1b1b1b" }}>{previewAgent.name}</h3>
              <p className="text-sm font-semibold mb-3" style={{ color: previewAgent.color }}>{previewAgent.description}</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#44474e" }}>
                {previewAgent.long_description || previewAgent.description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setCreateAgentId(previewAgent?.id || null); setPreviewAgent(null); setShowCreateModal(true); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1e8e3e", color: "#fff" }}
                >
                  Hire this specialist
                </button>
                <button
                  onClick={() => setPreviewAgent(null)}
                  className="px-5 py-3 rounded-xl font-semibold text-sm border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
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
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
          }} />
          <div className="bg-white rounded-3xl shadow-xl relative text-center" style={{ width: "min(480px, 90vw)", padding: "48px 28px" }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{
              background: authPrompt === "login"
                ? "linear-gradient(90deg, #1e8e3e, #e91e63)"
                : "linear-gradient(90deg, #f5a623, #fb923c)",
            }} />
            <div className="w-[72px] h-[72px] rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl" style={{
              background: authPrompt === "login"
                ? "linear-gradient(135deg, #1e8e3e, #e91e63)"
                : "linear-gradient(135deg, #f5a623, #fb923c)",
            }}>
              {authPrompt === "login" ? "🔐" : "🔑"}
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#1b1b1b", letterSpacing: "-0.03em" }}>
              {authPrompt === "login" ? "Oh snap! You need to sign in" : "Almost there! Add your API key"}
            </h2>
            <p className="text-sm leading-relaxed mb-7 mx-auto" style={{ color: "#44474e", maxWidth: 340 }}>
              {authPrompt === "login"
                ? "Create a free account to run AI agents and unlock the full power of AgentStudio."
                : "Add your OpenAI, Gemini, or Anthropic API key in Settings to start running agents."}
            </p>
            <a
              href={authPrompt === "login" ? "/login" : "/settings"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1e8e3e", color: "#fff", textDecoration: "none" }}
            >
              {authPrompt === "login" ? "Sign In Free" : "Go to Settings"}
            </a>
            <p className="text-sm mt-5 mb-0" style={{ color: "#9ca3af" }}>
              Redirecting in <span className="font-bold" style={{ color: "#1e8e3e", fontFamily: "monospace" }}>{authCountdown}s</span>
            </p>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{
                width: `${((10 - authCountdown) / 10) * 100}%`,
                background: "linear-gradient(90deg, #1e8e3e, #22c55e)",
              }} />
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <HireConfirmation
        open={!!hireConfirm}
        agentName={hireConfirm?.name || ""}
        agentIcon={hireConfirm?.icon || ""}
        agentColor={hireConfirm?.color || ""}
        onChat={() => setHireConfirm(null)}
        onDashboard={() => setHireConfirm(null)}
        onClose={() => setHireConfirm(null)}
      />

      <button
        onClick={() => { setCreateAgentId(null); setShowCreateModal(true); }}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        style={{ backgroundColor: "#1e8e3e", color: "#fff" }}
      >
        <Plus size={24} />
      </button>
    </>
  );
}
