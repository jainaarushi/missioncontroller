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
}

const CATEGORIES = [
  { id: "for-you", icon: "✨", label: "For you" },
  { id: "research", icon: "🔭", label: "Research" },
  { id: "writing", icon: "✒️", label: "Writing" },
  { id: "data", icon: "📊", label: "Data" },
  { id: "sales", icon: "🎯", label: "Sales" },
  { id: "travel", icon: "✈️", label: "Travel" },
  { id: "finance", icon: "💹", label: "Finance" },
  { id: "health", icon: "💪", label: "Health" },
  { id: "design", icon: "🏗️", label: "Design" },
  { id: "strategy", icon: "♟️", label: "Strategy" },
];

// Category → agent slug mapping
const CATEGORY_AGENTS: Record<string, string[]> = {
  "for-you": [],
  "research": ["scout", "sleuth"],
  "writing": ["quill", "caster"],
  "data": ["metric"],
  "sales": ["catalyst"],
  "travel": ["voyager"],
  "finance": ["pulse"],
  "health": ["vitalis"],
  "design": ["architect"],
  "strategy": ["strategist"],
};

// Suggested task templates
const TASK_TEMPLATES: Record<string, { title: string; icon: string; color: string }[]> = {
  "for-you": [
    { title: "Research top competitors in my space", icon: "🔍", color: "#6366F1" },
    { title: "Draft a weekly newsletter for subscribers", icon: "📧", color: "#EC4899" },
    { title: "Analyze last month's sales metrics", icon: "📈", color: "#10B981" },
    { title: "Plan next quarter's content strategy", icon: "📅", color: "#F59E0B" },
    { title: "Create a cold outreach email sequence", icon: "🎯", color: "#F97316" },
    { title: "Build a workout plan for busy weeks", icon: "💪", color: "#14B8A6" },
  ],
  "research": [
    { title: "Research the top 10 players in [industry]", icon: "🏢", color: "#6366F1" },
    { title: "Find recent funding rounds in AI/ML startups", icon: "💰", color: "#6366F1" },
    { title: "Compare pricing of 5 competing products", icon: "💲", color: "#6366F1" },
    { title: "Research market size and growth trends for [sector]", icon: "📊", color: "#6366F1" },
    { title: "Fact-check claims from a recent report", icon: "✅", color: "#7C3AED" },
    { title: "Monitor competitor product launches this quarter", icon: "🕵️", color: "#7C3AED" },
  ],
  "writing": [
    { title: "Draft a blog post about [topic]", icon: "📝", color: "#EC4899" },
    { title: "Write a product launch announcement email", icon: "🚀", color: "#EC4899" },
    { title: "Create social media posts for this week", icon: "📱", color: "#EC4899" },
    { title: "Turn this article into a podcast script", icon: "🎙️", color: "#D946EF" },
    { title: "Write a case study from customer feedback", icon: "📋", color: "#EC4899" },
    { title: "Convert this report into a Twitter thread", icon: "🧵", color: "#D946EF" },
  ],
  "data": [
    { title: "Analyze website conversion funnel for last 30 days", icon: "📉", color: "#10B981" },
    { title: "Build a KPI dashboard report", icon: "📊", color: "#10B981" },
    { title: "Find trends in customer churn data", icon: "📈", color: "#10B981" },
    { title: "Compare this quarter's metrics vs last quarter", icon: "🔄", color: "#10B981" },
  ],
  "sales": [
    { title: "Find 10 target companies matching our ICP", icon: "🏢", color: "#F97316" },
    { title: "Draft personalized outreach for [prospect]", icon: "✉️", color: "#F97316" },
    { title: "Research a prospect before a sales call", icon: "🔍", color: "#F97316" },
    { title: "Create a 3-email follow-up sequence", icon: "📨", color: "#F97316" },
  ],
  "travel": [
    { title: "Plan a 5-day trip to Tokyo", icon: "🗼", color: "#0EA5E9" },
    { title: "Create a weekend getaway itinerary", icon: "🏖️", color: "#0EA5E9" },
    { title: "Find the best flights and hotels for [destination]", icon: "🛫", color: "#0EA5E9" },
    { title: "Plan a team offsite in [city]", icon: "🏨", color: "#0EA5E9" },
  ],
  "finance": [
    { title: "Analyze AAPL vs MSFT stock performance", icon: "📈", color: "#059669" },
    { title: "Create a monthly budget breakdown", icon: "💳", color: "#059669" },
    { title: "Research ETF options for long-term investing", icon: "🏦", color: "#059669" },
    { title: "Summarize this earnings report", icon: "📄", color: "#059669" },
  ],
  "health": [
    { title: "Create a 4-week workout plan for muscle gain", icon: "🏋️", color: "#14B8A6" },
    { title: "Design a meal plan for 2000 cal/day", icon: "🥗", color: "#14B8A6" },
    { title: "Build a morning routine for productivity", icon: "🌅", color: "#14B8A6" },
    { title: "Plan a macro-balanced meal prep for the week", icon: "🍱", color: "#14B8A6" },
  ],
  "design": [
    { title: "Design the architecture for a real-time chat app", icon: "💬", color: "#DC2626" },
    { title: "Evaluate microservices vs monolith for our scale", icon: "⚖️", color: "#DC2626" },
    { title: "Plan the database schema for [feature]", icon: "🗄️", color: "#DC2626" },
    { title: "Create a technical roadmap for Q2", icon: "🗺️", color: "#DC2626" },
  ],
  "strategy": [
    { title: "Analyze our competitive positioning", icon: "♟️", color: "#1D4ED8" },
    { title: "Build a go-to-market plan for [product]", icon: "🚀", color: "#1D4ED8" },
    { title: "Create a 90-day action plan with KPIs", icon: "📋", color: "#1D4ED8" },
    { title: "Assess market entry strategy for [region]", icon: "🌍", color: "#1D4ED8" },
  ],
};

export function CreateTaskModal({ open, onClose, onSubmit, agents }: CreateTaskModalProps) {
  const [value, setValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart agent suggestions based on what the user types
  const suggestions = useMemo(() => suggestAgents(value, agents), [value, agents]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setSelectedAgentIds([]);
      setValue("");
      setActiveCategory("for-you");
    }
  }, [open]);

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
              placeholder="What do you need done?"
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

          {/* Agent pipeline visualization — shows selected agent flow */}
          {selectedAgents.length > 0 && (
            <div style={{
              marginBottom: 20, padding: "14px 16px", borderRadius: 14,
              backgroundColor: P.sidebar, border: `1.5px solid ${P.border}`,
              animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: P.textTer,
                letterSpacing: "0.05em", marginBottom: 10,
              }}>
                AGENT PIPELINE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
                {selectedAgents.map((agent, i) => (
                  <div key={agent.id} style={{ display: "flex", alignItems: "center" }}>
                    <div
                      onClick={() => toggleAgent(agent.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "6px 12px 6px 6px", borderRadius: 20,
                        backgroundColor: agent.color + "12",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        animation: `popIn 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = agent.color + "20"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = agent.color + "12"; }}
                    >
                      <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={26} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: agent.color }}>{agent.name}</span>
                      <span style={{
                        fontSize: 10, color: agent.color, opacity: 0.6, cursor: "pointer",
                        marginLeft: 2,
                      }}>✕</span>
                    </div>
                    {i < selectedAgents.length - 1 && (
                      <div style={{
                        margin: "0 8px", color: P.textGhost, fontSize: 14, fontWeight: 600,
                      }}>→</div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: P.textTer, marginTop: 8 }}>
                {selectedAgents.length === 1
                  ? `${selectedAgents[0].name} will handle this task`
                  : `${selectedAgents.map((a) => a.name).join(" → ")} will work sequentially`
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
