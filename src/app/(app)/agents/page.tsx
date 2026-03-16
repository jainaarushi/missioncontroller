"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { AGENT_CATEGORIES, AGENT_CATEGORY_MAP, SPECIALIST_CATEGORY_IDS, isTemplateAgent } from "@/lib/agent-categories";
import { P } from "@/lib/palette";


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

  const visibleCategories = activeCategory
    ? SPECIALIST_CATEGORIES.filter(c => c.id === activeCategory)
    : SPECIALIST_CATEGORIES;

  return (
    <>
      <style>{`
        @keyframes createPulse { 0%,100%{box-shadow:0 0 0 0 rgba(139,61,255,0.18)}50%{box-shadow:0 0 0 14px rgba(139,61,255,0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.92) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes slideUp { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes gentleFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes gradientShift { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
      `}</style>

      {/* Hero Header */}
      <div style={{
        marginBottom: 32,
        animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        padding: "36px 40px 32px",
        borderRadius: 24,
        background: "linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 30%, #FDF2F8 60%, #EFF6FF 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: "absolute", top: -40, right: -20,
          width: 180, height: 180, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,61,255,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: "40%",
          width: 120, height: 120, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,196,204,0.06) 0%, transparent 70%)",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{
              fontSize: 38, fontWeight: 900, margin: "0 0 8px",
              letterSpacing: "-0.04em",
              background: P.purpleGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
            }}>
              AI Agency
            </h1>
            <p style={{
              fontSize: 16, color: P.textSec, lineHeight: 1.6, margin: 0,
              maxWidth: 440,
            }}>
              Your team of AI specialists across {SPECIALIST_CATEGORIES.length} categories.
              <span style={{ color: P.purple, fontWeight: 600 }}> From idea to revenue.</span>
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "14px 28px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(102,126,234,0.35)",
              transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(102,126,234,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(102,126,234,0.35)";
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Create Agent
          </button>
        </div>
      </div>

      {/* Large Search Bar */}
      <div style={{
        marginBottom: 24, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
          fontSize: 18, color: searchFocused ? P.purple : P.textTer,
          transition: "color 0.2s",
          pointerEvents: "none",
          zIndex: 1,
        }}>
          {"\u{1F50D}"}
        </div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agents..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: "100%", height: 56, padding: "0 20px 0 52px",
            borderRadius: 16,
            border: `2px solid ${searchFocused ? P.purple : P.border}`,
            fontSize: 16, color: P.text,
            outline: "none",
            backgroundColor: P.card,
            fontFamily: "inherit",
            transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: searchFocused
              ? `0 0 0 4px ${P.purple}15, 0 4px 16px rgba(0,0,0,0.06)`
              : P.shadow,
          }}
        />
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" as const,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: "10px 20px", borderRadius: 20,
            background: !activeCategory
              ? "linear-gradient(135deg, #667eea, #764ba2)"
              : P.card,
            color: !activeCategory ? "#fff" : P.textSec,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: !activeCategory
              ? "0 4px 14px rgba(102,126,234,0.3)"
              : P.shadow,
            border: activeCategory ? `1.5px solid ${P.border}` : "1.5px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (activeCategory) {
              e.currentTarget.style.borderColor = P.borderHover;
              e.currentTarget.style.boxShadow = P.shadowHover;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategory) {
              e.currentTarget.style.borderColor = P.border;
              e.currentTarget.style.boxShadow = P.shadow;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          All
        </button>
        {SPECIALIST_CATEGORIES.map((cat) => {
          const count = categorizedAgents[cat.id]?.length || 0;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              style={{
                padding: "10px 18px", borderRadius: 20,
                border: isActive ? "1.5px solid transparent" : `1.5px solid ${P.border}`,
                background: isActive ? cat.gradient : P.card,
                color: isActive ? "#fff" : P.textSec,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: isActive ? `0 4px 14px ${cat.color}30` : P.shadow,
                display: "flex", alignItems: "center", gap: 7,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = cat.color + "60";
                  e.currentTarget.style.color = cat.color;
                  e.currentTarget.style.boxShadow = P.shadowHover;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = P.border;
                  e.currentTarget.style.color = P.textSec;
                  e.currentTarget.style.boxShadow = P.shadow;
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <span style={{ fontSize: 15 }}>{CATEGORY_ICONS[cat.icon] || ""}</span>
              {cat.name}
              <span style={{
                fontSize: 11, fontWeight: 800,
                backgroundColor: isActive ? "rgba(255,255,255,0.25)" : cat.color + "12",
                padding: "2px 8px", borderRadius: 10,
                color: isActive ? "#fff" : cat.color,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Results */}
      {filteredAgents && (
        <div style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: P.textSec, marginBottom: 18,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 8,
              background: P.purpleGrad, color: "#fff", fontSize: 12, fontWeight: 800,
            }}>
              {filteredAgents.length}
            </span>
            result{filteredAgents.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {filteredAgents.map((agent, i) => (
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
        </div>
      )}

      {/* Category Sections */}
      {!filteredAgents && visibleCategories.map((cat, catIdx) => {
        const catAgents = categorizedAgents[cat.id] || [];
        if (catAgents.length === 0) return null;
        return (
          <div key={cat.id} style={{
            marginBottom: 40,
            animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + catIdx * 0.05}s both`,
          }}>
            {/* Category Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
              padding: "16px 20px", borderRadius: 18,
              background: P.card,
              border: `1.5px solid ${P.border}`,
              boxShadow: P.shadow,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: cat.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                boxShadow: `0 4px 14px ${cat.color}25`,
                flexShrink: 0,
              }}>
                {CATEGORY_ICONS[cat.icon] || ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 17, fontWeight: 800, color: P.text,
                  letterSpacing: "-0.02em",
                }}>
                  {cat.name}
                </div>
                <div style={{
                  fontSize: 13, color: P.textSec, fontWeight: 500,
                }}>
                  {cat.tagline}
                </div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 20,
                background: cat.color + "10",
                fontSize: 12, fontWeight: 800, color: cat.color,
              }}>
                {catAgents.length} agent{catAgents.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Agent Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}>
              {catAgents.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                  onDelete={handleDelete}
                  router={router}
                  categoryColor={cat.color}
                  categoryName={cat.name}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Custom agents section */}
      {!filteredAgents && !activeCategory && (categorizedAgents["custom"]?.length > 0 || true) && (
        <div style={{
          marginBottom: 40,
          animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s both`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
            padding: "16px 20px", borderRadius: 18,
            background: P.card,
            border: `1.5px solid ${P.border}`,
            boxShadow: P.shadow,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#fff", fontWeight: 700,
              boxShadow: "0 4px 14px rgba(102,126,234,0.25)",
              flexShrink: 0,
            }}>
              +
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 17, fontWeight: 800, color: P.text,
                letterSpacing: "-0.02em",
              }}>
                Your Custom Agents
              </div>
              <div style={{
                fontSize: 13, color: P.textSec, fontWeight: 500,
              }}>
                Build your own AI specialists
              </div>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {(categorizedAgents["custom"] || []).map((agent, i) => (
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
            {/* Create Agent card */}
            <div
              onClick={() => setShowCreate(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
                e.currentTarget.style.boxShadow = P.shadowFloat;
                e.currentTarget.style.borderColor = P.purple + "50";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = P.shadow;
                e.currentTarget.style.borderColor = P.purple + "30";
              }}
              style={{
                position: "relative",
                padding: "24px 20px 20px",
                borderRadius: 16, cursor: "pointer",
                overflow: "hidden", minHeight: 220,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 14,
                border: `2.5px dashed ${P.purple}30`,
                backgroundColor: P.purpleLight,
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: P.shadow,
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, color: "#fff", fontWeight: 300,
                boxShadow: "0 6px 20px rgba(102,126,234,0.3)",
                animation: "createPulse 3s ease-in-out infinite",
              }}>
                +
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginBottom: 4 }}>
                  Create your own
                </div>
                <div style={{ fontSize: 13, color: P.textSec }}>
                  Custom AI agent
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

function AgentCard({ agent, index, hoveredId, setHoveredId, onDelete, router, categoryColor, categoryName }: AgentCardProps) {
  const isHovered = hoveredId === agent.id;
  const accentColor = categoryColor || agent.color || P.purple;

  return (
    <div
      onClick={() => router.push(`/today?agent=${agent.id}`)}
      onMouseEnter={() => setHoveredId(agent.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        borderRadius: 16, cursor: "pointer",
        overflow: "hidden",
        backgroundColor: P.card,
        animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        transform: isHovered ? "translateY(-4px) scale(1.03)" : "translateY(0) scale(1)",
        boxShadow: isHovered ? P.shadowHover : P.shadow,
        border: `1.5px solid ${isHovered ? accentColor + "30" : P.border}`,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Gradient accent bar at top */}
      <div style={{
        height: 4,
        background: agent.gradient || `linear-gradient(135deg, ${accentColor}, ${accentColor}90)`,
        transition: "height 0.25s ease",
      }} />

      {/* Delete for custom */}
      {!agent.is_preset && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            width: 28, height: 28, borderRadius: 8,
            border: `1px solid ${P.border}`,
            backgroundColor: P.card,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 12, color: P.textSec,
            transition: "all 0.2s",
            opacity: isHovered ? 1 : 0,
            boxShadow: P.shadow,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FEF2F2";
            e.currentTarget.style.borderColor = "#FCA5A5";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = P.card;
            e.currentTarget.style.borderColor = P.border;
            e.currentTarget.style.color = P.textSec;
          }}
        >
          x
        </button>
      )}

      {/* Card body */}
      <div style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Icon area */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}06)`,
          border: `1.5px solid ${accentColor}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
          transition: "all 0.3s ease",
          animation: isHovered ? "gentleFloat 3s ease-in-out infinite" : "none",
        }}>
          {agent.icon || ""}
        </div>

        {/* Text content */}
        <div>
          <div style={{
            fontSize: 16, fontWeight: 700, color: P.text,
            letterSpacing: "-0.02em", lineHeight: 1.3,
            marginBottom: 6,
          }}>
            {agent.name}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 400, color: P.textSec,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {agent.description}
          </div>
        </div>

        {/* Category badge + Hire CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto",
        }}>
          {categoryName ? (
            <span style={{
              fontSize: 11, fontWeight: 700, color: accentColor,
              backgroundColor: accentColor + "10",
              padding: "4px 10px", borderRadius: 8,
              letterSpacing: "0.02em",
            }}>
              {categoryName}
            </span>
          ) : (
            <span />
          )}

          {/* Hover CTA */}
          <div style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateX(0)" : "translateX(6px)",
            transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              padding: "6px 16px", borderRadius: 8,
              boxShadow: "0 2px 8px rgba(102,126,234,0.3)",
            }}>
              Hire &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
