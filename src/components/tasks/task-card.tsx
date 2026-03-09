"use client";

import { AgentAvatar } from "@/components/agents/agent-avatar";
import { ProgressArc } from "@/components/shared/progress-arc";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskCardProps {
  task: TaskWithAgent;
  onClick: () => void;
  delay?: number;
}

export function TaskCard({ task, onClick, delay = 0 }: TaskCardProps) {
  const agent = task.agent;
  const isWorking = task.status === "working";
  const isReview = task.status === "review";
  const isDone = task.status === "done";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px",
        backgroundColor: P.card, borderRadius: 14, cursor: "pointer",
        border: `1.5px solid ${isReview && agent ? agent.color + "35" : P.border}`,
        boxShadow: isReview && agent ? `0 4px 16px ${agent.color}10` : P.shadow,
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = P.shadowHover;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = isReview && agent ? agent.color + "50" : P.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isReview && agent ? `0 4px 16px ${agent.color}10` : P.shadow;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = isReview && agent ? agent.color + "35" : P.border;
      }}
    >
      {/* Top progress line */}
      {isWorking && agent && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: agent.color + "12", borderRadius: "14px 14px 0 0" }}>
          <div style={{ height: "100%", width: `${task.progress}%`, background: agent.gradient, borderRadius: "14px 14px 3px 0", transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </div>
      )}
      {isReview && agent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: agent.gradient, borderRadius: "14px 14px 0 0" }} />}

      {/* Status indicator */}
      <div style={{ marginTop: 3, flexShrink: 0 }}>
        {isDone ? (
          <div style={{ width: 22, height: 22, borderRadius: 7, background: P.emeraldGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</div>
        ) : isWorking && agent ? (
          <ProgressArc pct={task.progress} color={agent.color} size={22} />
        ) : isReview && agent ? (
          <div style={{ width: 22, height: 22, borderRadius: 7, background: agent.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fff" }} />
          </div>
        ) : (
          <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${P.textGhost}`, transition: "border-color 0.2s" }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 520, color: isDone ? P.textTer : P.text, lineHeight: 1.5,
          textDecoration: isDone ? "line-through" : "none",
        }}>{task.title}</div>

        {isWorking && agent && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 7, padding: "4px 10px 4px 4px", borderRadius: 20, backgroundColor: agent.color + "08" }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={20} />
            <span style={{ fontSize: 12, color: agent.color, fontWeight: 600 }}>{task.current_step || "Working..."}</span>
            <span style={{ display: "inline-flex", gap: 2 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: agent.color, animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
            </span>
          </div>
        )}

        {isReview && agent && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 7, padding: "4px 10px 4px 4px", borderRadius: 20, backgroundColor: agent.color + "0a" }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={20} />
            <span style={{ fontSize: 12, color: agent.color, fontWeight: 700 }}>Ready for your review →</span>
          </div>
        )}
      </div>

      {/* Right meta */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0, paddingTop: 2 }}>
        {task.cost_usd > 0 && <span style={{ fontSize: 10.5, color: P.textGhost, fontFamily: "'JetBrains Mono', var(--font-mono), monospace", fontWeight: 500 }}>${task.cost_usd.toFixed(2)}</span>}
        {!task.agent_id && !isDone && (
          <span style={{ fontSize: 11, fontWeight: 600, color: P.indigo, backgroundColor: P.indigoLight, padding: "2px 8px", borderRadius: 6 }}>+ assign</span>
        )}
      </div>
    </div>
  );
}
