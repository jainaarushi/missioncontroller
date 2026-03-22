"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { AGENT_CATEGORIES, AGENT_CATEGORY_MAP, SPECIALIST_CATEGORY_IDS, isTemplateAgent } from "@/lib/agent-categories";
import { P, F } from "@/lib/palette";
import { getAgentAvatar } from "@/lib/agent-avatars";


const SPECIALIST_CATEGORIES = AGENT_CATEGORIES.filter(c => SPECIALIST_CATEGORY_IDS.includes(c.id));

// Material Symbols icon mapping for category sidebar
const CATEGORY_MATERIAL_ICONS: Record<string, string> = {
  rocket: "rocket_launch",
  search: "search",
  chart: "trending_up",
  megaphone: "campaign",
  gear: "engineering",
  heart: "fitness_center",
  sparkle: "celebration",
  briefcase: "work",
  wallet: "payments",
  shield: "shield",
  home: "home",
  stethoscope: "health_and_safety",
  graduation: "school",
  tag: "sell",
  zap: "bolt",
  wrench: "build",
  palette: "palette",
  flask: "science",
  target: "target",
  clipboard: "task_alt",
  lifebuoy: "support",
  gamepad: "sports_esports",
  cube: "deployed_code",
  book: "menu_book",
  star: "star",
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
                fontSize: 24,
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
                color: "#414753",
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
                background: "#006c05",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: F,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Create Custom Agent
            </button>
          </div>

          {/* Search + Sort Row */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 28,
            animation: "fadeUp 0.4s ease 0.05s both",
          }}>
            {/* Search Bar */}
            <div style={{ flex: 1, position: "relative" }}>
              <span className="material-symbols-outlined" style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 18, color: "#94a3b8",
                pointerEvents: "none",
              }}>search</span>
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
                  borderRadius: 8,
                  border: `1px solid ${searchFocused ? P.borderHover : "#c1c6d5"}`,
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
              borderRadius: 8,
              border: "1px solid #c1c6d5",
              backgroundColor: "#fff",
              fontSize: 14,
              fontWeight: 500,
              color: "#1b1b1b",
              cursor: "pointer",
              fontFamily: F,
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}>
              <span style={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.1em" }}>Sort:</span>
              <span>Top Rated</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
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
            gap: 24,
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
              fontSize: 12, color: "#94a3b8", fontWeight: 500, margin: "4px 0 0",
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
                background: !activeCategory ? "rgba(22,163,74,0.06)" : "transparent",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 13,
                fontWeight: !activeCategory ? 600 : 500,
                color: !activeCategory ? "#16a34a" : "#64748b",
                transition: "all 0.15s ease",
                width: "100%",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (activeCategory) {
                  e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
              <span style={{ flex: 1 }}>All Agents</span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "2px 8px", borderRadius: !activeCategory ? 9999 : undefined,
                backgroundColor: !activeCategory ? "rgba(22,163,74,0.1)" : "transparent",
                color: !activeCategory ? "#16a34a" : "#71717a",
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
                    background: isActive ? "rgba(22,163,74,0.06)" : "transparent",
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#16a34a" : "#64748b",
                    transition: "all 0.15s ease",
                    width: "100%",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{CATEGORY_MATERIAL_ICONS[cat.icon] || "category"}</span>
                  <span style={{ flex: 1 }}>{cat.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: "2px 8px", borderRadius: isActive ? 9999 : undefined,
                    backgroundColor: isActive ? "rgba(22,163,74,0.1)" : "transparent",
                    color: isActive ? "#16a34a" : "#71717a",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Custom agents */}
            <button
              onClick={() => setActiveCategory(activeCategory === "custom" ? null : "custom")}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: activeCategory === "custom" ? "rgba(22,163,74,0.06)" : "transparent",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 13,
                fontWeight: activeCategory === "custom" ? 600 : 500,
                color: activeCategory === "custom" ? "#16a34a" : "#64748b",
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
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
              <span style={{ flex: 1 }}>Custom Agents</span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: "2px 8px", borderRadius: 6,
                backgroundColor: activeCategory === "custom" ? "rgba(22,163,74,0.1)" : "rgba(0,0,0,0.04)",
                color: activeCategory === "custom" ? "#16a34a" : "#71717a",
              }}>
                {(categorizedAgents["custom"] || []).length}
              </span>
            </button>
          </div>

          {/* Pro Tip Card */}
          <div style={{
            marginTop: 24,
            background: "#ece0d6",
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4d453e", marginBottom: 6, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Pro Tip
            </div>
            <p style={{ fontSize: 11, color: "#4d453e", margin: 0, lineHeight: 1.5, fontFamily: F }}>
              Combine a Designer agent with a Developer agent for full-stack automation.
            </p>
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
        boxShadow: isHovered
          ? "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
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
        height: 160,
        background: getCardGradient(agent, index),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {/* Avatar - centered within header */}
        <div>
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
        padding: "20px 20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        flex: 1,
      }}>
        {/* Agent name */}
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: P.text,
          textAlign: "left",
          lineHeight: 1.3,
          fontFamily: F,
        }}>
          {agent.name}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 13,
          color: P.textTer,
          textAlign: "left",
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
              color: "#475569",
              backgroundColor: "#f1f5f9",
              padding: "4px 8px",
              borderRadius: 4,
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
          opacity: 1,
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            style={{
              width: "100%",
              textAlign: "center",
              padding: "10px 0",
              borderRadius: 8,
              backgroundColor: "#006c05",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: F,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "transform 0.1s ease",
            }}
          >
            Hire me
          </div>
        </div>
      </div>
    </div>
  );
}
