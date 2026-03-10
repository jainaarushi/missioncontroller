"use client";

import { useRef } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { ProgressArc } from "@/components/shared/progress-arc";
import { P } from "@/lib/palette";
import { PRIORITY_CONFIG } from "@/lib/utils/constants";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskCardProps {
  task: TaskWithAgent;
  onClick: () => void;
  onRun?: (taskId: string) => void;
  delay?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (taskId: string) => void;
  draggable?: boolean;
  onDragStart?: (taskId: string) => void;
  onDragOver?: (taskId: string) => void;
  onDragEnd?: () => void;
}

export function TaskCard({
  task, onClick, onRun, delay = 0, selectable, selected, onSelect,
  draggable, onDragStart, onDragOver, onDragEnd,
}: TaskCardProps) {
  const agent = task.agent;
  const isWorking = task.status === "working";
  const isReview = task.status === "review";
  const isDone = task.status === "done";
  const cardRef = useRef<HTMLDivElement>(null);

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    cardRef.current?.classList.add("task-dragging");
    onDragStart?.(task.id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    cardRef.current?.classList.add("task-drag-over");
    onDragOver?.(task.id);
  }

  function handleDragLeave() {
    cardRef.current?.classList.remove("task-drag-over");
  }

  function handleDragEndLocal() {
    cardRef.current?.classList.remove("task-dragging");
    onDragEnd?.();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    cardRef.current?.classList.remove("task-drag-over");
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragOver={draggable ? handleDragOver : undefined}
      onDragLeave={draggable ? handleDragLeave : undefined}
      onDragEnd={draggable ? handleDragEndLocal : undefined}
      onDrop={draggable ? handleDrop : undefined}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
        backgroundColor: selected ? P.indigoSoft : P.card, borderRadius: 16, cursor: draggable ? "grab" : "pointer",
        border: `1.5px solid ${selected ? P.indigo + "40" : isReview && agent ? agent.color + "60" : P.border}`,
        boxShadow: isReview && agent ? `0 4px 16px ${agent.color}25, 0 0 0 2px ${agent.color}15` : P.shadow,
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        animation: `slideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = P.shadowHover;
        e.currentTarget.style.transform = "translateY(-3px) scale(1.005)";
        e.currentTarget.style.borderColor = selected ? P.indigo + "60" : isReview && agent ? agent.color + "80" : P.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isReview && agent ? `0 4px 16px ${agent.color}25, 0 0 0 2px ${agent.color}15` : P.shadow;
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.borderColor = selected ? P.indigo + "40" : isReview && agent ? agent.color + "60" : P.border;
      }}
    >
      {/* Top progress line */}
      {isWorking && agent && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: agent.color + "12", borderRadius: "16px 16px 0 0" }}>
          <div style={{ height: "100%", width: `${task.progress}%`, background: agent.gradient, borderRadius: "16px 16px 3px 0", transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>
      )}
      {isReview && agent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: agent.gradient, borderRadius: "16px 16px 0 0" }} />}

      {/* Drag handle */}
      {draggable && !selectable && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 2, marginTop: 6, marginRight: -4,
          cursor: "grab", opacity: 0.25, flexShrink: 0,
          transition: "opacity 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.25"; }}
        >
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ display: "flex", gap: 2 }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: P.textTer }} />
              <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: P.textTer }} />
            </div>
          ))}
        </div>
      )}

      {/* Selection checkbox */}
      {selectable && (
        <div
          onClick={(e) => { e.stopPropagation(); onSelect?.(task.id); }}
          style={{
            marginTop: 3, flexShrink: 0, width: 20, height: 20, borderRadius: 6,
            border: `2px solid ${selected ? P.indigo : P.textGhost}`,
            backgroundColor: selected ? P.indigo : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
            transform: selected ? "scale(1.1)" : "scale(1)",
          }}
        >
          {selected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
        </div>
      )}

      {/* Status indicator */}
      {!selectable && (
        <div style={{ marginTop: 3, flexShrink: 0 }}>
          {isDone ? (
            <div style={{ width: 24, height: 24, borderRadius: 8, background: P.emeraldGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${P.emerald}30` }}>✓</div>
          ) : isWorking && agent ? (
            <ProgressArc pct={task.progress} color={agent.color} size={24} />
          ) : isReview && agent ? (
            <div style={{ width: 24, height: 24, borderRadius: 8, background: agent.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${agent.color}25` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fff" }} />
            </div>
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${P.textGhost}`, transition: "all 0.2s" }} />
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 540, color: isDone ? P.textTer : P.text, lineHeight: 1.5,
          textDecoration: isDone ? "line-through" : "none",
          letterSpacing: "-0.01em",
        }}>{task.title}</div>

        {isWorking && agent && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8,
            padding: "5px 12px 5px 5px", borderRadius: 20, backgroundColor: agent.color + "08",
            transition: "all 0.3s",
          }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} />
            <span style={{ fontSize: 12.5, color: agent.color, fontWeight: 600 }}>{task.current_step || "Working..."}</span>
            <span style={{ display: "inline-flex", gap: 3 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 3.5, height: 3.5, borderRadius: "50%", backgroundColor: agent.color, animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
            </span>
          </div>
        )}

        {isReview && agent && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8,
            padding: "5px 12px 5px 5px", borderRadius: 20, backgroundColor: agent.color + "18",
            transition: "all 0.3s",
          }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} />
            <span style={{ fontSize: 12.5, color: agent.color, fontWeight: 800 }}>Ready for your review →</span>
          </div>
        )}
      </div>

      {/* Right meta */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0, paddingTop: 2 }}>
        {task.priority && task.priority !== "normal" && (
          <span style={{
            fontSize: 10.5, fontWeight: 700,
            color: PRIORITY_CONFIG[task.priority].color,
            backgroundColor: PRIORITY_CONFIG[task.priority].bgColor,
            padding: "3px 8px", borderRadius: 6,
            letterSpacing: "0.02em",
            transition: "all 0.2s",
          }}>
            {PRIORITY_CONFIG[task.priority].icon} {PRIORITY_CONFIG[task.priority].label}
          </span>
        )}
        {task.cost_usd > 0 && <span style={{ fontSize: 11, color: P.textGhost, fontFamily: "'JetBrains Mono', var(--font-mono), monospace", fontWeight: 500 }}>${task.cost_usd < 0.01 ? task.cost_usd.toFixed(4) : task.cost_usd.toFixed(2)}</span>}
        {!task.agent_id && !isDone && (
          <span style={{
            fontSize: 11.5, fontWeight: 600, color: P.indigo, backgroundColor: P.indigoLight,
            padding: "3px 10px", borderRadius: 7,
            transition: "all 0.2s",
          }}>+ assign</span>
        )}
        {task.agent_id && task.status === "todo" && onRun && (
          <button
            onClick={(e) => { e.stopPropagation(); onRun(task.id); }}
            style={{
              fontSize: 11.5, fontWeight: 700, color: "#fff",
              background: agent?.gradient || P.indigo,
              padding: "5px 14px", borderRadius: 8,
              border: "none", cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 2px 8px ${agent?.color || P.indigo}30`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = `0 4px 14px ${agent?.color || P.indigo}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 2px 8px ${agent?.color || P.indigo}30`;
            }}
          >▶ Run</button>
        )}
      </div>
    </div>
  );
}
