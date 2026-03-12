"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { AGENT_CATEGORIES, AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import { P } from "@/lib/palette";

const PASTEL_MAP: Record<string, { bg: string; shape1: string; shape2: string; shape3: string }> = {
  "#6366F1": { bg: "#EDE9FE", shape1: "#DDD6FE", shape2: "#C4B5FD60", shape3: "#A78BFA40" },
  "#EC4899": { bg: "#FCE7F3", shape1: "#F9A8D4", shape2: "#F472B660", shape3: "#EC489940" },
  "#10B981": { bg: "#ECFDF5", shape1: "#A7F3D0", shape2: "#6EE7B760", shape3: "#34D39940" },
  "#F59E0B": { bg: "#FEF3C7", shape1: "#FCD34D", shape2: "#FBBF2460", shape3: "#F59E0B40" },
  "#0EA5E9": { bg: "#E0F2FE", shape1: "#7DD3FC", shape2: "#38BDF860", shape3: "#0EA5E940" },
  "#059669": { bg: "#ECFDF5", shape1: "#6EE7B7", shape2: "#34D39960", shape3: "#05966940" },
  "#7C3AED": { bg: "#EDE9FE", shape1: "#C4B5FD", shape2: "#A78BFA60", shape3: "#7C3AED40" },
  "#D946EF": { bg: "#FAE8FF", shape1: "#E879F9", shape2: "#D946EF60", shape3: "#C026D340" },
  "#DC2626": { bg: "#FEF2F2", shape1: "#FECACA", shape2: "#F8717160", shape3: "#DC262640" },
  "#F97316": { bg: "#FFF7ED", shape1: "#FED7AA", shape2: "#FDBA7460", shape3: "#FB923C40" },
  "#14B8A6": { bg: "#F0FDFA", shape1: "#99F6E4", shape2: "#5EEAD460", shape3: "#14B8A640" },
  "#1D4ED8": { bg: "#EFF6FF", shape1: "#93C5FD", shape2: "#60A5FA60", shape3: "#3B82F640" },
  "#E11D48": { bg: "#FFF1F2", shape1: "#FECDD3", shape2: "#FDA4AF60", shape3: "#FB718540" },
  "#0891B2": { bg: "#ECFEFF", shape1: "#A5F3FC", shape2: "#67E8F960", shape3: "#22D3EE40" },
  "#6D28D9": { bg: "#F5F3FF", shape1: "#C4B5FD", shape2: "#A78BFA60", shape3: "#7C3AED40" },
  "#2563EB": { bg: "#EFF6FF", shape1: "#93C5FD", shape2: "#60A5FA60", shape3: "#3B82F640" },
  "#475569": { bg: "#F1F5F9", shape1: "#CBD5E1", shape2: "#94A3B860", shape3: "#64748B40" },
  "#0D9488": { bg: "#F0FDFA", shape1: "#99F6E4", shape2: "#5EEAD460", shape3: "#14B8A640" },
  "#06B6D4": { bg: "#ECFEFF", shape1: "#A5F3FC", shape2: "#67E8F960", shape3: "#22D3EE40" },
  "#EF4444": { bg: "#FEF2F2", shape1: "#FECACA", shape2: "#FCA5A560", shape3: "#F8717140" },
};

function getPastel(color: string) {
  return PASTEL_MAP[color] || { bg: "#F5F3FF", shape1: "#DDD6FE", shape2: "#C4B5FD60", shape3: "#A78BFA40" };
}

const CATEGORY_ICONS: Record<string, string> = {
  rocket: "\u{1F680}",
  search: "\u{1F50D}",
  chart: "\u{1F4C8}",
  megaphone: "\u{1F4E3}",
  gear: "\u{2699}\uFE0F",
  heart: "\u{1F496}",
  sparkle: "\u{2728}",
};

export default function AgentsPage() {
  const { agents, mutate } = useAgents();
  const { tasks } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Group agents by category
  const categorizedAgents = useMemo(() => {
    const groups: Record<string, typeof agents> = {};
    for (const cat of AGENT_CATEGORIES) {
      groups[cat.id] = [];
    }
    groups["custom"] = [];

    for (const agent of agents) {
      const slug = agent.slug || "";
      if (!agent.is_preset) {
        groups["custom"].push(agent);
      } else {
        const catId = AGENT_CATEGORY_MAP[slug] || "creative";
        if (groups[catId]) {
          groups[catId].push(agent);
        } else {
          groups["creative"].push(agent);
        }
      }
    }
    return groups;
  }, [agents]);

  // Filter by search
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return agents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.long_description || "").toLowerCase().includes(q)
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
    ? AGENT_CATEGORIES.filter(c => c.id === activeCategory)
    : AGENT_CATEGORIES;

  return (
    <>
      <style>{`
        @keyframes floatIcon { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(-3deg)} }
        @keyframes orbit1 { 0%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(6px,-4px) rotate(12deg)}50%{transform:translate(0,-8px) rotate(0deg)}75%{transform:translate(-6px,-4px) rotate(-12deg)}100%{transform:translate(0,0) rotate(0deg)} }
        @keyframes orbit2 { 0%{transform:translate(0,0) scale(1)}50%{transform:translate(-4px,6px) scale(1.15)}100%{transform:translate(0,0) scale(1)} }
        @keyframes shimmer { 0%{opacity:0.4}50%{opacity:0.7}100%{opacity:0.4} }
        @keyframes createPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,112,102,0.2)}50%{box-shadow:0 0 0 14px rgba(249,112,102,0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.92) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes slideUp { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: P.text, margin: "0 0 6px",
              letterSpacing: "-0.03em",
            }}>
              Agent Gallery
            </h1>
            <p style={{ fontSize: 14, color: P.textSec, lineHeight: 1.5 }}>
              {agents.length} AI specialists across {AGENT_CATEGORIES.length} categories. From idea to revenue.
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
          All ({agents.length})
        </button>
        {AGENT_CATEGORIES.map((cat) => {
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
                tasks={tasks}
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
                  tasks={tasks}
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
                tasks={tasks}
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

// ── Agent Card Component ────────────────────────────────────

interface AgentCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onDelete: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
}

function AgentCard({ agent, index, tasks, hoveredId, setHoveredId, onDelete, router }: AgentCardProps) {
  const done = tasks.filter((t: { agent_id: string; status: string }) => t.agent_id === agent.id && t.status === "done").length;
  const pastel = getPastel(agent.color);
  const isHovered = hoveredId === agent.id;
  const totalDone = (agent.tasks_completed || 0) + done;
  const slug = agent.slug || "";
  const catId = AGENT_CATEGORY_MAP[slug];
  const category = catId ? AGENT_CATEGORIES.find(c => c.id === catId) : null;

  return (
    <div
      onClick={() => router.push(`/today?agent=${agent.id}`)}
      onMouseEnter={() => setHoveredId(agent.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        padding: "20px 16px 16px",
        backgroundColor: pastel.bg,
        borderRadius: 18, cursor: "pointer",
        overflow: "hidden", minHeight: 200,
        display: "flex", flexDirection: "column",
        animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? `0 24px 48px ${agent.color}18, 0 8px 16px ${agent.color}10`
          : `0 2px 8px ${agent.color}06`,
      }}
    >
      {/* Decorative shapes */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 70, height: 70, borderRadius: 18,
        backgroundColor: pastel.shape1,
        transform: "rotate(20deg)", opacity: 0.5,
        animation: "orbit1 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: 30, right: -8,
        width: 40, height: 40, borderRadius: "50%",
        backgroundColor: pastel.shape2,
        animation: "orbit2 6s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "50%", right: 20,
        width: 24, height: 24, borderRadius: 8,
        backgroundColor: pastel.shape3,
        animation: "shimmer 4s ease-in-out infinite",
      }} />

      {/* Delete for custom */}
      {!agent.is_preset && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 10,
            width: 22, height: 22, borderRadius: 6,
            border: "none",
            backgroundColor: "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 9, color: P.textTer,
            transition: "all 0.2s", backdropFilter: "blur(4px)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          x
        </button>
      )}

      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 15,
        background: agent.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
        boxShadow: isHovered
          ? `0 14px 28px ${agent.color}35, 0 4px 10px ${agent.color}20`
          : `0 6px 16px ${agent.color}20`,
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        animation: isHovered ? "floatIcon 3s ease-in-out infinite" : "none",
        marginBottom: 12,
        position: "relative", zIndex: 2,
      }}>
        {agent.icon}
      </div>

      {/* Text */}
      <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 800, color: P.text,
          letterSpacing: "-0.02em", marginBottom: 2, lineHeight: 1.3,
        }}>
          {agent.name}
        </div>
        <div style={{
          fontSize: 11, color: agent.color, fontWeight: 650, marginBottom: 5,
        }}>
          {agent.description}
        </div>
        <div style={{
          fontSize: 10.5, color: P.textSec, lineHeight: 1.5,
          opacity: isHovered ? 1 : 0.7,
          transition: "opacity 0.3s",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>
          {agent.long_description}
        </div>
      </div>

      {/* Bottom badges */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5, marginTop: 10,
        position: "relative", zIndex: 2, flexWrap: "wrap" as const,
      }}>
        {category && (
          <span style={{
            fontSize: 8.5, fontWeight: 700, color: category.color,
            backgroundColor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(4px)",
            padding: "2px 7px", borderRadius: 5,
          }}>
            {category.name.split(" ")[0]}
          </span>
        )}
        {!agent.is_preset && (
          <span style={{
            fontSize: 8.5, fontWeight: 700, color: "#F97066",
            backgroundColor: "rgba(255,255,255,0.7)",
            padding: "2px 7px", borderRadius: 5,
          }}>
            Custom
          </span>
        )}
        {totalDone > 0 && (
          <span style={{
            fontSize: 8.5, fontWeight: 600, color: P.textSec,
            backgroundColor: "rgba(255,255,255,0.5)",
            padding: "2px 7px", borderRadius: 5,
          }}>
            {totalDone} done
          </span>
        )}
      </div>

      {/* Hover CTA */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "8px 16px 12px",
        background: `linear-gradient(to top, ${pastel.bg} 60%, transparent)`,
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        zIndex: 5,
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#fff",
          background: agent.gradient,
          padding: "5px 16px", borderRadius: 8,
          boxShadow: `0 4px 12px ${agent.color}30`,
        }}>
          Use {agent.name} &rarr;
        </span>
      </div>
    </div>
  );
}
