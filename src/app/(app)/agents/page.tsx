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
        @keyframes createPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,112,102,0.2)}50%{box-shadow:0 0 0 14px rgba(249,112,102,0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.92) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes slideUp { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes gentleFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
        @keyframes imgScale { 0%,100%{transform:scale(1.05)}50%{transform:scale(1.12)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: P.text, margin: "0 0 6px",
              letterSpacing: "-0.03em",
            }}>
              AI Agency
            </h1>
            <p style={{ fontSize: 14, color: P.textSec, lineHeight: 1.5 }}>
              AI specialists across {SPECIALIST_CATEGORIES.length} categories. From idea to revenue.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "10px 20px", borderRadius: 12, border: "none",
              background: P.coralGrad, color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 3px 12px rgba(249,112,102,0.3)",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            + Create Agent
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: 20, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both",
      }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agents..."
          style={{
            width: "100%", padding: "12px 18px", borderRadius: 14,
            border: `2px solid ${P.border}`, fontSize: 14, color: P.text,
            outline: "none", backgroundColor: P.card,
            fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F160"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
        />
      </div>

      {/* Category Pills */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" as const,
        animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
      }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: "8px 16px", borderRadius: 20,
            background: !activeCategory
              ? "linear-gradient(135deg, #1E1B4B, #312E81)"
              : P.card,
            color: !activeCategory ? "#fff" : P.textSec,
            fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.25s",
            boxShadow: !activeCategory ? "0 4px 12px rgba(30,27,75,0.2)" : "none",
            border: activeCategory ? `1.5px solid ${P.border}` : "none",
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
                padding: "8px 16px", borderRadius: 20,
                border: isActive ? "none" : `1.5px solid ${cat.color}25`,
                background: isActive ? cat.gradient : cat.color + "08",
                color: isActive ? "#fff" : cat.color,
                fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.25s",
                boxShadow: isActive ? `0 4px 12px ${cat.color}30` : "none",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat.icon] || ""}</span>
              {cat.name}
              <span style={{
                fontSize: 10, fontWeight: 800, opacity: 0.8,
                backgroundColor: isActive ? "rgba(255,255,255,0.25)" : cat.color + "15",
                padding: "1px 6px", borderRadius: 8,
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
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: P.textSec, marginBottom: 14,
          }}>
            {filteredAgents.length} result{filteredAgents.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
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
            marginBottom: 36,
            animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + catIdx * 0.05}s both`,
          }}>
            {/* Category Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
              padding: "14px 18px", borderRadius: 16,
              background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}04)`,
              border: `1.5px solid ${cat.color}15`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: cat.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
                boxShadow: `0 4px 12px ${cat.color}25`,
              }}>
                {CATEGORY_ICONS[cat.icon] || ""}
              </div>
              <div>
                <div style={{
                  fontSize: 16, fontWeight: 800, color: P.text,
                  letterSpacing: "-0.02em",
                }}>
                  {cat.name}
                </div>
                <div style={{
                  fontSize: 12, color: cat.color, fontWeight: 600,
                }}>
                  {cat.tagline} &middot; {catAgents.length} agent{catAgents.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Agent Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {catAgents.map((agent, i) => (
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
        );
      })}

      {/* Custom agents section */}
      {!filteredAgents && !activeCategory && (categorizedAgents["custom"]?.length > 0 || true) && (
        <div style={{
          marginBottom: 36,
          animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s both`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            padding: "14px 18px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(249,112,102,0.06), rgba(249,112,102,0.02))",
            border: "1.5px solid rgba(249,112,102,0.15)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: P.coralGrad,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              boxShadow: "0 4px 12px rgba(249,112,102,0.25)",
            }}>
              +
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 800, color: P.text,
                letterSpacing: "-0.02em",
              }}>
                Your Custom Agents
              </div>
              <div style={{
                fontSize: 12, color: "#F97066", fontWeight: 600,
              }}>
                Build your own AI specialists
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
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
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 24px 48px rgba(249,112,102,0.12)";
                e.currentTarget.style.borderColor = "rgba(249,112,102,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(249,112,102,0.2)";
              }}
              style={{
                position: "relative",
                padding: "20px 16px 16px",
                borderRadius: 18, cursor: "pointer",
                overflow: "hidden", minHeight: 200,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 10,
                border: "2.5px dashed rgba(249,112,102,0.2)",
                backgroundColor: "#FFFBFA",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: P.coralGrad,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "#fff", fontWeight: 300,
                boxShadow: "0 6px 20px rgba(249,112,102,0.25)",
                animation: "createPulse 3s ease-in-out infinite",
              }}>
                +
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 2 }}>
                  Create your own
                </div>
                <div style={{ fontSize: 11, color: P.textTer }}>
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

// ── Resume Card Component ────────────────────────────────────

interface AgentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  index: number;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onDelete: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
}

function AgentCard({ agent, index, hoveredId, setHoveredId, onDelete, router }: AgentCardProps) {
  const isHovered = hoveredId === agent.id;
  const slug = agent.slug || "";
  const accentColor = agent.color || "#6366F1";

  return (
    <div
      onClick={() => router.push(`/today?agent=${agent.id}`)}
      onMouseEnter={() => setHoveredId(agent.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        borderRadius: 16, cursor: "pointer",
        overflow: "hidden",
        aspectRatio: "3 / 4",
        animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? `0 20px 40px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.1)`
          : `0 2px 8px rgba(0,0,0,0.06)`,
        background: agent.gradient || `linear-gradient(160deg, ${accentColor}, ${accentColor}90)`,
      }}
    >
      {/* Delete for custom */}
      {!agent.is_preset && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 10,
            width: 24, height: 24, borderRadius: 8,
            border: "none",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 10, color: "#fff",
            transition: "all 0.2s", backdropFilter: "blur(4px)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          x
        </button>
      )}

      {/* Icon centered */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 64,
        animation: isHovered ? "gentleFloat 3s ease-in-out infinite" : "none",
      }}>
        {agent.icon || ""}
      </div>

      {/* Bottom gradient overlay with name + role */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "40px 14px 14px",
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
        transition: "padding 0.3s ease",
      }}>
        <div style={{
          fontSize: 16, fontWeight: 800, color: "#fff",
          letterSpacing: "-0.02em", lineHeight: 1.2,
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}>
          {agent.name}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)",
          marginTop: 2,
          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}>
          {agent.description}
        </div>

        {/* Hover CTA */}
        <div style={{
          marginTop: 8,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#fff",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            padding: "5px 14px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
          }}>
            Hire &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
