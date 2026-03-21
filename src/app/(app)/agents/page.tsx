"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { AGENT_CATEGORIES, AGENT_CATEGORY_MAP, SPECIALIST_CATEGORY_IDS, isTemplateAgent } from "@/lib/agent-categories";
import { P, F } from "@/lib/palette";
import { getAgentAvatar } from "@/lib/agent-avatars";


const SPECIALIST_CATEGORIES = AGENT_CATEGORIES.filter(c => SPECIALIST_CATEGORY_IDS.includes(c.id));

const CATEGORY_ICONS: Record<string, string> = {
  rocket: "\u{1F680}",
  search: "\u{1F50D}",
  chart: "\u{1F4C8}",
  megaphone: "\u{1F4E3}",
  gear: "\u{2699}\uFE0F",
  heart: "\u{1F496}",
  sparkle: "\u{2728}",
  briefcase: "\u{1F4BC}",
  wallet: "\u{1F4B0}",
  shield: "\u{1F6E1}\uFE0F",
  home: "\u{1F3E0}",
  stethoscope: "\u{1FA7A}",
  graduation: "\u{1F393}",
  tag: "\u{1F3F7}\uFE0F",
  zap: "\u{26A1}",
  wrench: "\u{1F527}",
  palette: "\u{1F3A8}",
  flask: "\u{1F9EA}",
  target: "\u{1F3AF}",
  clipboard: "\u{1F4CB}",
  lifebuoy: "\u{1F6DF}",
  gamepad: "\u{1F3AE}",
  cube: "\u{1F4E6}",
  book: "\u{1F4DA}",
  star: "\u{2B50}",
};

// Soft gradient backgrounds for agent card headers
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #dbeafe, #ede9fe)",
  "linear-gradient(135deg, #fce7f3, #fde68a)",
  "linear-gradient(135deg, #d1fae5, #cffafe)",
  "linear-gradient(135deg, #fef3c7, #fce7f3)",
  "linear-gradient(135deg, #ede9fe, #dbeafe)",
  "linear-gradient(135deg, #cffafe, #d1fae5)",
  "linear-gradient(135deg, #fde68a, #fef9c3)",
  "linear-gradient(135deg, #e0e7ff, #f3e8ff)",
];

function getCardGradient(agent: { gradient?: string; color?: string }, index: number): string {
  if (agent.gradient) return agent.gradient;
  if (agent.color) return `linear-gradient(135deg, ${agent.color}20, ${agent.color}10)`;
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

export default function AgentsPage() {
  const { agents, mutate } = useAgents();
  const [showCreate, setShowCreate] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();

  // Group agents by specialist category only
  const categorizedAgents = useMemo(() => {
    const groups: Record<string, typeof agents> = {};
    for (const cat of SPECIALIST_CATEGORIES) {
      groups[cat.id] = [];
    }
    groups["custom"] = [];

    for (const agent of agents) {
      const slug = agent.slug || "";
      if (!agent.is_preset) {
        groups["custom"].push(agent);
      } else if (!isTemplateAgent(slug)) {
        const catId = AGENT_CATEGORY_MAP[slug] || "creative";
        if (groups[catId]) {
          groups[catId].push(agent);
        } else if (groups["creative"]) {
          groups["creative"].push(agent);
        }
      }
    }
    return groups;
  }, [agents]);

  // Filter by search (exclude template agents)
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return agents.filter(a =>
      !isTemplateAgent(a.slug || "") &&
      (a.name.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.long_description || "").toLowerCase().includes(q))
    );
  }, [agents, searchQuery]);

  async function handleDelete(agentId: string) {
    if (deletingId) return;
    setDeletingId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (res.ok) mutate();
    } finally {
      setDeletingId(null);
    }
  }

  // Compute total visible agent count
  const totalAgentCount = useMemo(() => {
    let count = 0;
    for (const cat of SPECIALIST_CATEGORIES) {
      count += (categorizedAgents[cat.id] || []).length;
    }
    count += (categorizedAgents["custom"] || []).length;
    return count;
  }, [categorizedAgents]);

  // All agents to display in the grid (filtered or category-filtered)
  const displayAgents = useMemo(() => {
    if (filteredAgents) return filteredAgents;
    if (activeCategory) {
      return categorizedAgents[activeCategory] || [];
    }
    // All agents from all categories
    const all: typeof agents = [];
    for (const cat of SPECIALIST_CATEGORIES) {
      all.push(...(categorizedAgents[cat.id] || []));
    }
    all.push(...(categorizedAgents["custom"] || []));
    return all;
  }, [filteredAgents, activeCategory, categorizedAgents]);

  return (
    <>
      <style>{`
        @keyframes popIn { 0%{opacity:0;transform:scale(0.95) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ display: "flex", gap: 0, minHeight: "100%" }}>
        {/* ── Main Content Area ── */}
        <div style={{ flex: 1, minWidth: 0, padding: "32px 32px 48px" }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            marginBottom: 28,
            animation: "fadeUp 0.4s ease both",
          }}>
            <div>
              <h1 style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: P.text,
                margin: 0,
                lineHeight: 1.2,
                fontFamily: F,
              }}>
                AI Agent Agency
              </h1>
              <p style={{
                fontSize: 14,
                color: P.textTer,
                margin: "6px 0 0",
                fontFamily: F,
              }}>
                {totalAgentCount} specialized agents ready to deploy
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: "10px 22px",
                borderRadius: 12,
                border: "none",
                background: "#1e8e3e",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: F,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(30,142,62,0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#177332";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(30,142,62,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e8e3e";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(30,142,62,0.25)";
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 400 }}>+</span>
              Create Agent
            </button>
          </div>

          {/* Search + Sort Row */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 28,
            animation: "fadeUp 0.4s ease 0.05s both",
          }}>
            {/* Search Bar */}
            <div style={{ flex: 1, position: "relative" }}>
              <svg
                style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  width: 18, height: 18, color: searchFocused ? P.textSec : P.textGhost,
                  transition: "color 0.2s",
                  pointerEvents: "none",
                }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for agents..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 16px 0 42px",
                  borderRadius: 12,
                  border: `1px solid ${searchFocused ? P.borderHover : "rgba(0,0,0,0.08)"}`,
                  fontSize: 14,
                  color: P.text,
                  outline: "none",
                  backgroundColor: "#fff",
                  fontFamily: F,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: searchFocused ? "0 0 0 3px rgba(30,142,62,0.08)" : "none",
                }}
              />
            </div>
            {/* Sort Dropdown */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 16px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
              fontSize: 12,
              fontWeight: 600,
              color: P.textSec,
              cursor: "pointer",
              fontFamily: F,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}>
              <span style={{ color: P.textTer, fontWeight: 500, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>Sort:</span>
              <span>Top Rated</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ marginLeft: 2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search result count */}
          {filteredAgents && (
            <div style={{
              fontSize: 13, fontWeight: 600, color: P.textSec, marginBottom: 16,
              fontFamily: F,
              animation: "fadeUp 0.3s ease both",
            }}>
              {filteredAgents.length} result{filteredAgents.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Agent Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
            animation: "fadeUp 0.4s ease 0.1s both",
          }}>
            {displayAgents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={i}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
                onDelete={handleDelete}
                router={router}
              />
            ))}
          </div>

          {displayAgents.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              color: P.textTer, fontSize: 14, fontFamily: F,
            }}>
              No agents found.
            </div>
          )}
        </div>

        {/* ── Right Category Sidebar ── */}
        <div style={{
          width: 288,
          flexShrink: 0,
          borderLeft: "1px solid rgba(0,0,0,0.06)",
          padding: "32px 20px",
          overflowY: "auto",
          animation: "fadeUp 0.4s ease 0.15s both",
        }}>
          <div style={{ marginBottom: 4 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, color: P.text, margin: 0,
              fontFamily: F,
            }}>
              Categories
            </h2>
            <p style={{
              fontSize: 12, color: "#1e8e3e", fontWeight: 500, margin: "4px 0 0",
              fontFamily: F,
            }}>
              Filter by expertise
            </p>
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* All category */}
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: !activeCategory ? "rgba(30,142,62,0.06)" : "transparent",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 13,
                fontWeight: !activeCategory ? 600 : 500,
                color: !activeCategory ? "#1e8e3e" : P.textSec,
                transition: "all 0.15s ease",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (activeCategory) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
              }}
              onMouseLeave={(e) => {
                if (activeCategory) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>*</span>
              <span style={{ flex: 1 }}>All Agents</span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "2px 8px", borderRadius: 6,
                backgroundColor: !activeCategory ? "rgba(30,142,62,0.1)" : "rgba(0,0,0,0.04)",
                color: !activeCategory ? "#1e8e3e" : P.textTer,
              }}>
                {totalAgentCount}
              </span>
            </button>

            {SPECIALIST_CATEGORIES.map((cat) => {
              const count = categorizedAgents[cat.id]?.length || 0;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: isActive ? "rgba(30,142,62,0.06)" : "transparent",
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#1e8e3e" : P.textSec,
                    transition: "all 0.15s ease",
                    width: "100%",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{CATEGORY_ICONS[cat.icon] || ""}</span>
                  <span style={{ flex: 1 }}>{cat.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: "2px 8px", borderRadius: 6,
                    backgroundColor: isActive ? "rgba(30,142,62,0.1)" : "rgba(0,0,0,0.04)",
                    color: isActive ? "#1e8e3e" : P.textTer,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Custom agents category */}
            <button
              onClick={() => setActiveCategory(activeCategory === "custom" ? null : "custom")}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: activeCategory === "custom" ? "rgba(30,142,62,0.06)" : "transparent",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 13,
                fontWeight: activeCategory === "custom" ? 600 : 500,
                color: activeCategory === "custom" ? "#1e8e3e" : P.textSec,
                transition: "all 0.15s ease",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== "custom") e.currentTarget.style.background = "rgba(0,0,0,0.03)";
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== "custom") e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>+</span>
              <span style={{ flex: 1 }}>Custom Agents</span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "2px 8px", borderRadius: 6,
                backgroundColor: activeCategory === "custom" ? "rgba(30,142,62,0.1)" : "rgba(0,0,0,0.04)",
                color: activeCategory === "custom" ? "#1e8e3e" : P.textTer,
              }}>
                {(categorizedAgents["custom"] || []).length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <AgentCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => mutate()}
      />
    </>
  );
}

// ── Agent Card Component ────────────────────────────────────

interface AgentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  index: number;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onDelete: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  categoryColor?: string;
  categoryName?: string;
}

function AgentCard({ agent, index, hoveredId, setHoveredId, onDelete, router }: AgentCardProps) {
  const isHovered = hoveredId === agent.id;

  // Extract skill tags from agent
  const tags = useMemo(() => {
    const t: string[] = [];
    if (agent.slug) {
      const parts = agent.slug.split("-");
      if (parts.length >= 2) {
        t.push(parts[0].toUpperCase());
        t.push(parts[parts.length - 1].toUpperCase());
      } else {
        t.push(parts[0].toUpperCase());
      }
    }
    if (t.length === 0) {
      t.push("AI", "AGENT");
    }
    return t.slice(0, 2);
  }, [agent.slug]);

  return (
    <div
      onClick={() => router.push(`/today?agent=${agent.id}`)}
      onMouseEnter={() => setHoveredId(agent.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        borderRadius: 12,
        cursor: "pointer",
        overflow: "hidden",
        backgroundColor: "#fff",
        animation: `popIn 0.4s ease ${index * 0.03}s both`,
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Delete for custom */}
      {!agent.is_preset && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 10,
            width: 26, height: 26, borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 11, color: P.textTer,
            transition: "all 0.2s",
            opacity: isHovered ? 1 : 0,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
            e.currentTarget.style.color = P.textTer;
          }}
        >
          x
        </button>
      )}

      {/* Gradient Header Area */}
      <div style={{
        height: 140,
        background: getCardGradient(agent, index),
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 0,
        position: "relative",
      }}>
        {/* Avatar - centered, overlapping bottom edge */}
        <div style={{
          position: "absolute",
          bottom: -32,
          left: "50%",
          transform: "translateX(-50%)",
        }}>
          {(() => {
            const av = getAgentAvatar(agent.slug);
            return av ? (
              <img src={av} alt="" style={{
                width: 96, height: 96, borderRadius: 12, objectFit: "cover",
                border: "4px solid #fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              }} />
            ) : (
              <div style={{
                width: 96, height: 96, borderRadius: 12,
                background: `linear-gradient(135deg, ${agent.color || P.lime}30, ${agent.color || P.lime}15)`,
                border: "4px solid #fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42,
              }}>
                {agent.icon || ""}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Card Body */}
      <div style={{
        padding: "44px 20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        flex: 1,
      }}>
        {/* Agent name */}
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: P.text,
          textAlign: "center",
          lineHeight: 1.3,
          fontFamily: F,
        }}>
          {agent.name}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 13,
          color: P.textTer,
          textAlign: "center",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontFamily: F,
        }}>
          {agent.description}
        </div>

        {/* Tags */}
        <div style={{
          display: "flex", gap: 6, marginTop: 4,
        }}>
          {tags.map((tag, ti) => (
            <span key={ti} style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: P.textTer,
              backgroundColor: "rgba(0,0,0,0.04)",
              padding: "4px 8px",
              borderRadius: 6,
              fontFamily: F,
              textTransform: "uppercase",
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Hire Me Button */}
        <div style={{
          width: "100%",
          marginTop: "auto",
          paddingTop: 12,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(6px)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{
            width: "100%",
            textAlign: "center",
            padding: "10px 0",
            borderRadius: 12,
            backgroundColor: "#1e8e3e",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: F,
            boxShadow: "0 2px 8px rgba(30,142,62,0.25)",
          }}>
            Hire me
          </div>
        </div>
      </div>
    </div>
  );
}
