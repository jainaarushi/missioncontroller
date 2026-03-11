"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AgentCreateModal } from "@/components/agents/agent-create-modal";
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
};

function getPastel(color: string) {
  return PASTEL_MAP[color] || { bg: "#F5F3FF", shape1: "#DDD6FE", shape2: "#C4B5FD60", shape3: "#A78BFA40" };
}

export default function AgentsPage() {
  const { agents, mutate } = useAgents();
  const { tasks } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

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

  return (
    <>
      <style>{`
        @keyframes floatIcon { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(-3deg)} }
        @keyframes orbit1 { 0%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(6px,-4px) rotate(12deg)}50%{transform:translate(0,-8px) rotate(0deg)}75%{transform:translate(-6px,-4px) rotate(-12deg)}100%{transform:translate(0,0) rotate(0deg)} }
        @keyframes orbit2 { 0%{transform:translate(0,0) scale(1)}50%{transform:translate(-4px,6px) scale(1.15)}100%{transform:translate(0,0) scale(1)} }
        @keyframes orbit3 { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{opacity:0.4}50%{opacity:0.7}100%{opacity:0.4} }
        @keyframes createPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,112,102,0.2)}50%{box-shadow:0 0 0 14px rgba(249,112,102,0)} }
      `}</style>

      <div style={{ marginBottom: 32, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: P.text, margin: "0 0 8px",
              letterSpacing: "-0.03em",
            }}>
              Explore agents
            </h1>
            <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.5 }}>
              {agents.length} specialists ready to work. Pick one and assign a task.
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
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,112,102,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(249,112,102,0.3)"; }}
          >
            + Create Agent
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {agents.map((agent, i) => {
          const done = tasks.filter((t) => t.agent_id === agent.id && t.status === "done").length;
          const pastel = getPastel(agent.color);
          const isHovered = hoveredId === agent.id;
          const totalDone = agent.tasks_completed + done;

          return (
            <div
              key={agent.id}
              onClick={() => router.push(`/today?agent=${agent.id}`)}
              onMouseEnter={() => setHoveredId(agent.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: "relative",
                padding: "20px 16px 16px",
                backgroundColor: pastel.bg,
                borderRadius: 18,
                cursor: "pointer",
                overflow: "hidden",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`,
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? `0 24px 48px ${agent.color}18, 0 8px 16px ${agent.color}10`
                  : `0 2px 8px ${agent.color}06`,
              }}
            >
              {/* Decorative shapes — layered depth */}
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
              {/* Extra small dots for richness */}
              <div style={{
                position: "absolute", top: 20, right: 45,
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: agent.color + "20",
                animation: "shimmer 3s ease-in-out 0.5s infinite",
              }} />
              <div style={{
                position: "absolute", bottom: 50, right: 55,
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: agent.color + "25",
                animation: "shimmer 5s ease-in-out 1s infinite",
              }} />

              {/* Delete for custom */}
              {!agent.is_preset && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(agent.id); }}
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
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = P.textTer; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.6)"; }}
                >
                  ✕
                </button>
              )}

              {/* Icon — large, centered, hero element */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: agent.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
                boxShadow: isHovered
                  ? `0 14px 28px ${agent.color}35, 0 4px 10px ${agent.color}20`
                  : `0 6px 16px ${agent.color}20`,
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                animation: isHovered ? "floatIcon 3s ease-in-out infinite" : "none",
                marginBottom: 14,
                position: "relative", zIndex: 2,
              }}>
                {agent.icon}
              </div>

              {/* Text content */}
              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <div style={{
                  fontSize: 15, fontWeight: 800, color: P.text,
                  letterSpacing: "-0.02em", marginBottom: 3,
                  lineHeight: 1.3,
                }}>
                  {agent.name}
                </div>
                <div style={{
                  fontSize: 11.5, color: agent.color, fontWeight: 650,
                  marginBottom: 6,
                }}>
                  {agent.description}
                </div>
                <div style={{
                  fontSize: 11, color: P.textSec, lineHeight: 1.5,
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
                display: "flex", alignItems: "center", gap: 6, marginTop: 10,
                position: "relative", zIndex: 2,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: agent.color,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(4px)",
                  padding: "2px 7px", borderRadius: 5,
                }}>
                  {agent.is_preset ? "Built-in" : "Custom"}
                </span>
                {totalDone > 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, color: P.textSec,
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
                  Use {agent.name} →
                </span>
              </div>
            </div>
          );
        })}

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
            borderRadius: 18,
            cursor: "pointer",
            overflow: "hidden",
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            border: "2.5px dashed rgba(249,112,102,0.2)",
            backgroundColor: "#FFFBFA",
            animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${agents.length * 0.05}s both`,
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

      <AgentCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => mutate()}
      />
    </>
  );
}
