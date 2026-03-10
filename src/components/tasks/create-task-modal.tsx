"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { suggestAgents } from "@/lib/utils/agent-suggest";
import { P } from "@/lib/palette";
import type { Agent } from "@/lib/types/agent";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, agentIds?: string[]) => void;
  agents: Agent[];
  preSelectedAgentId?: string;
}

const CATEGORIES = [
  { id: "for-you", icon: "✨", label: "For you" },
  { id: "research", icon: "🔭", label: "Research" },
  { id: "writing", icon: "✒️", label: "Writing" },
  { id: "code", icon: "💻", label: "Code" },
  { id: "data", icon: "📊", label: "Data" },
  { id: "business", icon: "♟️", label: "Business" },
  { id: "finance", icon: "💹", label: "Finance" },
  { id: "planning", icon: "📋", label: "Planning" },
  { id: "health", icon: "💪", label: "Health" },
  { id: "fun", icon: "🔥", label: "Fun" },
];

// Category → agent slug mapping
const CATEGORY_AGENTS: Record<string, string[]> = {
  "for-you": [],
  "research": ["deep-research", "fact-checker", "startup-trends", "academic-researcher", "web-intel"],
  "writing": ["content-creator", "technical-writer", "editor", "blog-to-podcast", "email-drafter"],
  "code": ["system-architect", "python-expert", "fullstack-developer", "code-reviewer", "debugger"],
  "data": ["data-analyst", "visualization-expert"],
  "business": ["strategy-advisor", "sales-rep", "product-launch", "customer-support", "journalist"],
  "finance": ["investment-analyst", "personal-finance"],
  "planning": ["project-planner", "sprint-planner", "meeting-notes", "decision-helper"],
  "health": ["fitness-coach", "recipe-planner", "mental-wellbeing", "travel-planner", "home-renovation"],
  "fun": ["roast-master", "dream-interpreter", "villain-origin", "rap-battle", "meme-caption", "fortune-teller", "alien-anthropologist", "toxic-trait", "dating-profile", "bedtime-story", "song-lyrics", "excuse-generator", "movie-plot", "linkedin-post", "future-coach", "debate-champion", "baby-name", "startup-idea-gen", "cover-letter", "apology-writer"],
};

// Suggested task templates
const TASK_TEMPLATES: Record<string, { title: string; icon: string; color: string }[]> = {
  "for-you": [
    { title: "Roast me based on my LinkedIn bio", icon: "🔥", color: "#EF4444" },
    { title: "Research top competitors in my space", icon: "🔍", color: "#6366F1" },
    { title: "Write a viral LinkedIn post about AI", icon: "💼", color: "#0A66C2" },
    { title: "Generate a startup idea for [industry]", icon: "💡", color: "#F59E0B" },
    { title: "Create a workout plan for busy weeks", icon: "💪", color: "#14B8A6" },
    { title: "Turn my boring life into a villain origin story", icon: "🦹", color: "#581C87" },
  ],
  "research": [
    { title: "Research the top 10 players in [industry]", icon: "🏢", color: "#6366F1" },
    { title: "Find recent funding rounds in AI/ML startups", icon: "💰", color: "#8B5CF6" },
    { title: "Fact-check claims from a recent report", icon: "✅", color: "#059669" },
    { title: "Do a literature review on [topic]", icon: "🎓", color: "#4338CA" },
    { title: "Compare pricing of 5 competing products", icon: "💲", color: "#6366F1" },
    { title: "Research market size for [sector]", icon: "📊", color: "#6366F1" },
  ],
  "writing": [
    { title: "Draft a blog post about [topic]", icon: "📝", color: "#EC4899" },
    { title: "Write a product launch announcement email", icon: "🚀", color: "#EC4899" },
    { title: "Turn this article into a podcast script", icon: "🎙️", color: "#D946EF" },
    { title: "Edit and proofread my draft", icon: "🔍", color: "#BE185D" },
    { title: "Write API documentation for [feature]", icon: "📝", color: "#0891B2" },
    { title: "Create a 3-email follow-up sequence", icon: "📧", color: "#EA580C" },
  ],
  "code": [
    { title: "Design architecture for a real-time chat app", icon: "💬", color: "#DC2626" },
    { title: "Review my Python code for best practices", icon: "🐍", color: "#2563EB" },
    { title: "Debug this error in my React app", icon: "🐛", color: "#E11D48" },
    { title: "Build a REST API with Node.js and Postgres", icon: "💻", color: "#7C3AED" },
    { title: "Review this PR for security issues", icon: "🔎", color: "#9333EA" },
    { title: "Evaluate microservices vs monolith for our scale", icon: "⚖️", color: "#DC2626" },
  ],
  "data": [
    { title: "Analyze website conversion funnel for last 30 days", icon: "📉", color: "#10B981" },
    { title: "Build a KPI dashboard report", icon: "📊", color: "#10B981" },
    { title: "Find trends in customer churn data", icon: "📈", color: "#10B981" },
    { title: "Design the best chart type for this data", icon: "📈", color: "#0D9488" },
  ],
  "business": [
    { title: "Analyze our competitive positioning", icon: "♟️", color: "#1D4ED8" },
    { title: "Build a go-to-market plan for [product]", icon: "🚀", color: "#C026D3" },
    { title: "Find 10 target companies matching our ICP", icon: "🎯", color: "#F97316" },
    { title: "Draft personalized outreach for [prospect]", icon: "✉️", color: "#F97316" },
    { title: "Write a press release for [announcement]", icon: "📰", color: "#334155" },
    { title: "Create a 90-day action plan with KPIs", icon: "📋", color: "#1D4ED8" },
  ],
  "finance": [
    { title: "Analyze AAPL vs MSFT stock performance", icon: "📈", color: "#059669" },
    { title: "Create a monthly budget breakdown", icon: "💳", color: "#16A34A" },
    { title: "Research ETF options for long-term investing", icon: "🏦", color: "#059669" },
    { title: "Build a debt payoff plan", icon: "💰", color: "#16A34A" },
  ],
  "planning": [
    { title: "Break down this project into tasks and milestones", icon: "📋", color: "#0369A1" },
    { title: "Plan the next sprint with story estimates", icon: "🏃", color: "#0284C7" },
    { title: "Summarize today's meeting with action items", icon: "🗒️", color: "#64748B" },
    { title: "Help me decide between these options", icon: "⚖️", color: "#78716C" },
  ],
  "health": [
    { title: "Create a 4-week workout plan for muscle gain", icon: "🏋️", color: "#14B8A6" },
    { title: "Design a meal plan for 2000 cal/day", icon: "🥗", color: "#D97706" },
    { title: "Guide me through a 10-minute meditation", icon: "🧘", color: "#7C3AED" },
    { title: "Plan a 5-day trip to Tokyo", icon: "✈️", color: "#0EA5E9" },
    { title: "Plan a kitchen renovation with budget", icon: "🏠", color: "#92400E" },
  ],
  "fun": [
    { title: "Roast me based on my bio", icon: "🔥", color: "#EF4444" },
    { title: "Interpret my weird dream from last night", icon: "🌙", color: "#6D28D9" },
    { title: "Turn my life into a supervillain origin story", icon: "🦹", color: "#581C87" },
    { title: "Write my dating app profile", icon: "💘", color: "#E11D48" },
    { title: "Drop some rap bars about Monday mornings", icon: "🎤", color: "#1E1B4B" },
    { title: "Write a bedtime story for my kid", icon: "🌟", color: "#7C3AED" },
    { title: "Write meme captions for my situation", icon: "😂", color: "#EA580C" },
    { title: "Read my fortune based on my birth date", icon: "🔮", color: "#7E22CE" },
    { title: "Describe my morning routine as an alien scientist", icon: "👽", color: "#059669" },
    { title: "Analyze my toxic traits (lovingly)", icon: "☠️", color: "#BE123C" },
    { title: "Generate a million-dollar startup idea", icon: "💡", color: "#F59E0B" },
    { title: "Write a song about [topic] in [genre]", icon: "🎵", color: "#DB2777" },
  ],
};

export function CreateTaskModal({ open, onClose, onSubmit, agents, preSelectedAgentId }: CreateTaskModalProps) {
  const [value, setValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [dragPipelineIdx, setDragPipelineIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart agent suggestions based on what the user types
  const suggestions = useMemo(() => suggestAgents(value, agents), [value, agents]);

  // Auto-select the top suggested agent when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      const topAgentId = suggestions[0].agent.id;
      setSelectedAgentIds((prev) => {
        // Replace selection with top suggestion if user hasn't manually picked one from the suggestions
        if (prev.length === 0 || !suggestions.some((s) => prev.includes(s.agent.id))) {
          return [topAgentId];
        }
        return prev;
      });
    } else if (value.trim().length < 3) {
      setSelectedAgentIds([]);
    }
  }, [suggestions]);

  useEffect(() => {
    if (open) {
      if (preSelectedAgentId) {
        setSelectedAgentIds([preSelectedAgentId]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSelectedAgentIds([]);
      setValue("");
      setActiveCategory("for-you");
    }
  }, [open, preSelectedAgentId]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  function toggleAgent(agentId: string) {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  }

  function handlePipelineDragStart(idx: number) {
    setDragPipelineIdx(idx);
  }

  function handlePipelineDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragPipelineIdx === null || dragPipelineIdx === idx) return;
    // Reorder
    setSelectedAgentIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragPipelineIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragPipelineIdx(idx);
  }

  function handlePipelineDragEnd() {
    setDragPipelineIdx(null);
  }

  function handleSubmit(title?: string) {
    const text = (title || value).trim();
    if (!text) return;
    onSubmit(text, selectedAgentIds.length > 0 ? selectedAgentIds : undefined);
    setValue("");
    setSelectedAgentIds([]);
    onClose();
  }

  const selectedAgents = selectedAgentIds.map((id) => agents.find((a) => a.id === id)).filter(Boolean) as Agent[];

  // Filter agents by category
  const categoryAgentSlugs = CATEGORY_AGENTS[activeCategory] || [];
  const filteredAgents = activeCategory === "for-you"
    ? agents.slice(0, 6)
    : agents.filter((a) => categoryAgentSlugs.includes(a.slug));

  const templates = TASK_TEMPLATES[activeCategory] || TASK_TEMPLATES["for-you"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 700,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: "5vh",
      }}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(24,24,27,0.45)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }} />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 820, maxHeight: "88vh",
          backgroundColor: P.card, borderRadius: 20,
          boxShadow: P.shadowFloat, position: "relative",
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", overflow: "hidden",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            width: 34, height: 34, borderRadius: 10,
            border: `1px solid ${P.border}`, backgroundColor: P.card,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 18, color: P.textTer,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
        >
          ×
        </button>

        {/* Left sidebar — categories */}
        <div style={{
          width: 200, borderRight: `1px solid ${P.border}`,
          padding: "28px 0", flexShrink: 0,
          overflowY: "auto",
        }}>
          <h2 style={{
            fontSize: 24, fontWeight: 800, color: P.text,
            padding: "0 20px 20px", letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}>
            Create a task
          </h2>

          <nav>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 20px", cursor: "pointer",
                    backgroundColor: isActive ? `${P.indigo}08` : "transparent",
                    borderLeft: isActive ? `3px solid ${P.indigo}` : "3px solid transparent",
                    color: isActive ? P.indigo : P.textSec,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14, transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 30px 30px" }}>
          {/* Search input */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 12,
            border: `2px solid ${P.indigo}30`,
            backgroundColor: P.card,
            marginBottom: 24,
            transition: "border-color 0.2s",
          }}>
            <span style={{ fontSize: 18, color: P.textTer }}>&#128269;</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Create a task"
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 16, color: P.text, backgroundColor: "transparent",
                fontWeight: 500, fontFamily: "inherit",
              }}
            />
            {value.trim() && (
              <button
                onClick={() => handleSubmit()}
                style={{
                  padding: "7px 18px", borderRadius: 9, border: "none",
                  background: P.coralGrad, color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 3px 10px rgba(249,112,102,0.3)",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                Create
              </button>
            )}
          </div>

          {/* Smart agent suggestions — appears as user types */}
          {suggestions.length > 0 && (
            <div style={{
              marginBottom: 20,
              animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: P.indigo,
                marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 14 }}>✨</span>
                Suggested agents for this task
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {suggestions.map(({ agent, reason }, i) => {
                  const isSelected = selectedAgentIds.includes(agent.id);
                  const orderNum = isSelected ? selectedAgentIds.indexOf(agent.id) + 1 : null;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                        backgroundColor: isSelected ? agent.color + "0a" : P.sidebar,
                        border: `2px solid ${isSelected ? agent.color + "40" : "transparent"}`,
                        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                        animation: `fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s both`,
                        transform: isSelected ? "scale(1.01)" : "scale(1)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = agent.color + "08";
                          e.currentTarget.style.borderColor = agent.color + "20";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = P.sidebar;
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                    >
                      {/* Selection order badge */}
                      <div style={{
                        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                        border: `2px solid ${isSelected ? agent.color : P.textGhost}`,
                        backgroundColor: isSelected ? agent.color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                        fontSize: 11, fontWeight: 800, color: isSelected ? "#fff" : "transparent",
                      }}>
                        {orderNum || ""}
                      </div>
                      <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{agent.name}</div>
                        <div style={{ fontSize: 12, color: P.textTer, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {reason}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 7,
                        color: isSelected ? agent.color : P.textTer,
                        backgroundColor: isSelected ? agent.color + "15" : P.border + "80",
                        transition: "all 0.2s",
                      }}>
                        {isSelected ? "Added" : "+ Add"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agent pipeline — drag-and-drop to reorder */}
          {selectedAgents.length > 0 && (
            <div style={{
              marginBottom: 20, padding: "16px 18px", borderRadius: 14,
              backgroundColor: P.sidebar, border: `1.5px solid ${P.border}`,
              animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: P.textTer,
                  letterSpacing: "0.05em",
                }}>
                  AGENT PIPELINE
                </div>
                <div style={{ fontSize: 10.5, color: P.textGhost }}>
                  Drag to reorder
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
                {selectedAgents.map((agent, i) => (
                  <div key={agent.id} style={{ display: "flex", alignItems: "center" }}>
                    <div
                      draggable
                      onDragStart={() => handlePipelineDragStart(i)}
                      onDragOver={(e) => handlePipelineDragOver(e, i)}
                      onDragEnd={handlePipelineDragEnd}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 10px 7px 7px", borderRadius: 22,
                        backgroundColor: dragPipelineIdx === i ? agent.color + "20" : agent.color + "12",
                        cursor: "grab",
                        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                        animation: `popIn 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`,
                        border: `2px solid ${dragPipelineIdx === i ? agent.color + "40" : "transparent"}`,
                        transform: dragPipelineIdx === i ? "scale(1.05)" : "scale(1)",
                        boxShadow: dragPipelineIdx === i ? `0 4px 12px ${agent.color}20` : "none",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = agent.color + "1a"; }}
                      onMouseLeave={(e) => { if (dragPipelineIdx !== i) e.currentTarget.style.backgroundColor = agent.color + "12"; }}
                    >
                      {/* Drag grip dots */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 1.5, marginRight: 2, opacity: 0.4 }}>
                        {[0, 1].map((r) => (
                          <div key={r} style={{ display: "flex", gap: 1.5 }}>
                            <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", backgroundColor: agent.color }} />
                            <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", backgroundColor: agent.color }} />
                          </div>
                        ))}
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: 7,
                        background: agent.gradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, flexShrink: 0,
                        boxShadow: `0 2px 6px ${agent.color}25`,
                      }}>
                        {agent.icon}
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: agent.color }}>{agent.name}</span>
                      {/* Step number badge */}
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: "#fff",
                        backgroundColor: agent.color,
                        width: 18, height: 18, borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      {/* Remove button */}
                      <span
                        onClick={(e) => { e.stopPropagation(); toggleAgent(agent.id); }}
                        style={{
                          fontSize: 10, color: agent.color, opacity: 0.5, cursor: "pointer",
                          marginLeft: -2, padding: "0 2px",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                      >✕</span>
                    </div>
                    {i < selectedAgents.length - 1 && (
                      <div style={{
                        margin: "0 6px", color: P.textGhost, fontSize: 16, fontWeight: 500,
                        transition: "all 0.2s",
                      }}>→</div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{
                fontSize: 11.5, color: P.textSec, marginTop: 10,
                lineHeight: 1.5,
              }}>
                {selectedAgents.length === 1
                  ? `${selectedAgents[0].name} will handle this task solo`
                  : `${selectedAgents.map((a) => a.name).join(" → ")} — each agent builds on the previous output`
                }
              </div>
            </div>
          )}

          {/* Quick actions — agent cards */}
          {filteredAgents.length > 0 && (
            <>
              <div style={{
                fontSize: 16, fontWeight: 700, color: P.text,
                marginBottom: 14, letterSpacing: "-0.01em",
              }}>
                Quick actions
              </div>
              <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                {filteredAgents.map((agent, i) => (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 8, cursor: "pointer", width: 80,
                      animation: `popIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: agent.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24,
                      boxShadow: `0 4px 14px ${agent.color}25`,
                      transition: "all 0.2s",
                    }}>
                      {agent.icon}
                    </div>
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, color: P.textSec,
                      textAlign: "center", lineHeight: 1.3,
                    }}>
                      {agent.description?.split(" ")[0] || agent.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Category filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {CATEGORIES.slice(0, 8).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 20,
                    border: isActive ? "none" : `1.5px solid ${P.border}`,
                    backgroundColor: isActive ? P.indigo : P.card,
                    color: isActive ? "#fff" : P.textSec,
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) { e.currentTarget.style.borderColor = P.borderHover; e.currentTarget.style.backgroundColor = P.sidebar; }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.backgroundColor = P.card; }
                  }}
                >
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Suggested templates */}
          <div style={{
            fontSize: 16, fontWeight: 700, color: P.text,
            marginBottom: 14, letterSpacing: "-0.01em",
          }}>
            {activeCategory === "for-you" ? "Popular" : CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {templates.map((tpl, i) => (
              <div
                key={tpl.title}
                onClick={() => handleSubmit(tpl.title)}
                style={{
                  padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                  backgroundColor: P.sidebar,
                  border: `1.5px solid transparent`,
                  transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                  animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tpl.color + "08";
                  e.currentTarget.style.borderColor = tpl.color + "25";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${tpl.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = P.sidebar;
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    fontSize: 20, flexShrink: 0, marginTop: 1,
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: tpl.color + "12",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {tpl.icon}
                  </span>
                  <div style={{
                    fontSize: 13.5, fontWeight: 550, color: P.text,
                    lineHeight: 1.45,
                  }}>
                    {tpl.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
