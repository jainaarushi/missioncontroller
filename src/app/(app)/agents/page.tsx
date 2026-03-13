"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
import { AGENT_CATEGORIES, AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import { P } from "@/lib/palette";
import { getAgentPersona, type AgentPersona } from "@/lib/agent-personas";

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

// ── Resume Card Component ────────────────────────────────────

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
  const isHovered = hoveredId === agent.id;
  const totalDone = (agent.tasks_completed || 0) + done;
  const slug = agent.slug || "";
  const catId = AGENT_CATEGORY_MAP[slug];
  const category = catId ? AGENT_CATEGORIES.find(c => c.id === catId) : null;
  const persona = agent.is_preset ? getAgentPersona(slug) : null;

  const accentColor = agent.color || "#6366F1";
  const pastelBg = accentColor + "08";
  const pastelBorder = accentColor + "18";

  // For resume cards (preset agents with persona)
  if (persona) {
    return (
      <ResumeCard
        agent={agent}
        persona={persona}
        index={index}
        isHovered={isHovered}
        totalDone={totalDone}
        accentColor={accentColor}
        pastelBg={pastelBg}
        pastelBorder={pastelBorder}
        category={category}
        setHoveredId={setHoveredId}
        router={router}
      />
    );
  }

  // Fallback for custom agents — simple card with emoji
  return (
    <div
      onClick={() => router.push(`/today?agent=${agent.id}`)}
      onMouseEnter={() => setHoveredId(agent.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        padding: "18px 16px 16px",
        backgroundColor: "#FAFAF8",
        borderRadius: 18, cursor: "pointer",
        overflow: "hidden", minHeight: 200,
        display: "flex", flexDirection: "column",
        border: `1.5px solid ${P.border}`,
        animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 20px 40px ${accentColor}12, 0 6px 12px ${accentColor}08`
          : P.shadow,
      }}
    >
      {/* Delete for custom */}
      {!agent.is_preset && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 10,
            width: 22, height: 22, borderRadius: 6,
            border: "none",
            backgroundColor: "rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 9, color: P.textTer,
            transition: "all 0.2s",
            opacity: isHovered ? 1 : 0,
          }}
        >
          x
        </button>
      )}

      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: agent.gradient || accentColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 12,
      }}>
        {agent.icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: P.text, marginBottom: 2, letterSpacing: "-0.02em" }}>
          {agent.name}
        </div>
        <div style={{ fontSize: 11, color: accentColor, fontWeight: 650, marginBottom: 6 }}>
          {agent.description}
        </div>
        <div style={{
          fontSize: 10.5, color: P.textSec, lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
        }}>
          {agent.long_description}
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" as const }}>
        <span style={{
          fontSize: 8.5, fontWeight: 700, color: "#F97066",
          backgroundColor: "#FEF3F2", padding: "2px 7px", borderRadius: 5,
        }}>Custom</span>
        {totalDone > 0 && (
          <span style={{
            fontSize: 8.5, fontWeight: 600, color: P.textSec,
            backgroundColor: "#F5F5F5", padding: "2px 7px", borderRadius: 5,
          }}>{totalDone} done</span>
        )}
      </div>

      {/* Hover CTA */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "8px 16px 12px",
        background: `linear-gradient(to top, #FAFAF8 60%, transparent)`,
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        zIndex: 5, display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#fff",
          background: agent.gradient || accentColor,
          padding: "5px 16px", borderRadius: 8,
          boxShadow: `0 4px 12px ${accentColor}30`,
        }}>
          Use {agent.name} &rarr;
        </span>
      </div>
    </div>
  );
}

// ── Resume Card (preset agents with persona) ────────────────

function ResumeCard({
  agent,
  persona,
  index,
  isHovered,
  totalDone,
  accentColor,
  pastelBg,
  pastelBorder,
  category,
  setHoveredId,
  router,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent: any;
  persona: AgentPersona;
  index: number;
  isHovered: boolean;
  totalDone: number;
  accentColor: string;
  pastelBg: string;
  pastelBorder: string;
  category: { name: string; color: string } | null | undefined;
  setHoveredId: (id: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
}) {
  const firstName = persona.humanName.split(" ")[0];
  const displayTasks = totalDone > 0 ? `${totalDone} done` : persona.tasksLabel;

  return (
    <div
      onClick={() => router.push(`/today?agent=${agent.id}`)}
      onMouseEnter={() => setHoveredId(agent.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        padding: "18px 16px 16px",
        backgroundColor: pastelBg,
        borderRadius: 18, cursor: "pointer",
        overflow: "hidden", minHeight: 200,
        display: "flex", flexDirection: "column",
        borderLeft: `3px solid ${accentColor}40`,
        borderTop: `1px solid ${pastelBorder}`,
        borderRight: `1px solid ${pastelBorder}`,
        borderBottom: `1px solid ${pastelBorder}`,
        animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s both`,
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 20px 40px ${accentColor}15, 0 6px 12px ${accentColor}08`
          : `0 2px 8px ${accentColor}06`,
      }}
    >
      {/* Top row: avatar + name + available dot */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={persona.photoUrl}
          alt={persona.humanName}
          width={44}
          height={44}
          style={{
            borderRadius: 12,
            backgroundColor: accentColor + "12",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 800, color: P.text,
              letterSpacing: "-0.02em", lineHeight: 1.2,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {persona.humanName}
            </div>
            {/* Green available dot */}
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              backgroundColor: "#10B981",
              flexShrink: 0,
              boxShadow: "0 0 0 2px #10B98130",
            }} />
          </div>
          <div style={{
            fontSize: 11, fontWeight: 650, color: accentColor,
            lineHeight: 1.3, marginTop: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {persona.title}
          </div>
          <div style={{
            fontSize: 10, color: P.textSec, marginTop: 2,
          }}>
            {persona.yearsExp}+ yrs experience
          </div>
        </div>
      </div>

      {/* Rating + tasks */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
      }}>
        <div style={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} style={{
              fontSize: 11,
              color: star <= Math.round(persona.rating) ? "#F59E0B" : "#E5E7EB",
            }}>
              &#9733;
            </span>
          ))}
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: P.text }}>{persona.rating}</span>
        <span style={{ fontSize: 10, color: P.textTer }}>&middot;</span>
        <span style={{ fontSize: 10, color: P.textSec, fontWeight: 600 }}>{displayTasks}</span>
      </div>

      {/* Specialty pills */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {persona.specialties.map((s) => (
          <span key={s} style={{
            fontSize: 9, fontWeight: 700,
            color: accentColor,
            backgroundColor: accentColor + "12",
            padding: "2px 8px", borderRadius: 6,
          }}>
            {s}
          </span>
        ))}
      </div>

      {/* Category + Available */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: "auto",
      }}>
        {category && (
          <span style={{
            fontSize: 9, fontWeight: 700,
            color: category.color,
            backgroundColor: category.color + "10",
            padding: "2px 8px", borderRadius: 6,
          }}>
            {category.name.split(" ")[0]}
          </span>
        )}
        <span style={{
          fontSize: 9.5, fontWeight: 650, color: "#10B981",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          Available
        </span>
      </div>

      {/* Hover CTA */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "10px 16px 14px",
        background: `linear-gradient(to top, ${pastelBg} 70%, transparent)`,
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        zIndex: 5, display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 11.5, fontWeight: 700, color: "#fff",
          background: agent.gradient || `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
          padding: "6px 18px", borderRadius: 9,
          boxShadow: `0 4px 14px ${accentColor}35`,
          letterSpacing: "-0.01em",
        }}>
          Hire {firstName} &rarr;
        </span>
      </div>
    </div>
  );
}
