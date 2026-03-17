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
        display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 22px",
        backgroundColor: selected ? P.purpleSoft : P.card, borderRadius: 16, cursor: draggable ? "grab" : "pointer",
        border: `1.5px solid ${selected ? P.purple + "40" : isReview && agent ? agent.color + "50" : P.border}`,
        boxShadow: isReview && agent ? `0 4px 20px ${agent.color}20` : P.shadow,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `slideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = P.shadowHover;
        e.currentTarget.style.transform = "translateY(-3px) scale(1.008)";
        e.currentTarget.style.borderColor = selected ? P.purple + "60" : isReview && agent ? agent.color + "70" : P.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isReview && agent ? `0 4px 20px ${agent.color}20` : P.shadow;
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.borderColor = selected ? P.purple + "40" : isReview && agent ? agent.color + "50" : P.border;
      }}
    >
      {/* Top progress line */}
      {isWorking && agent && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: agent.color + "10", borderRadius: "16px 16px 0 0" }}>
          <div style={{ height: "100%", width: `${task.progress}%`, background: agent.gradient, borderRadius: "16px 16px 3px 0", transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>
      )}
      {isReview && agent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: agent.gradient, borderRadius: "16px 16px 0 0" }} />}

      {/* Drag handle */}
      {draggable && !selectable && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 2.5, marginTop: 6, marginRight: -4,
          cursor: "grab", opacity: 0.2, flexShrink: 0,
          transition: "opacity 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.2"; }}
        >
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ display: "flex", gap: 2.5 }}>
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
            marginTop: 3, flexShrink: 0, width: 22, height: 22, borderRadius: 7,
            border: `2px solid ${selected ? P.purple : P.textGhost}`,
            backgroundColor: selected ? P.purple : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: selected ? "scale(1.1)" : "scale(1)",
            boxShadow: selected ? `0 2px 8px ${P.purple}30` : "none",
          }}
        >
          {selected && <span style={{ color: P.text, fontSize: 11, fontWeight: 900 }}>✓</span>}
        </div>
      )}

      {/* Status indicator */}
      {!selectable && (
        <div style={{ marginTop: 3, flexShrink: 0 }}>
          {isDone ? (
            <div style={{ width: 26, height: 26, borderRadius: 9, background: P.emeraldGrad, display: "flex", alignItems: "center", justifyContent: "center", color: P.text, fontSize: 12, fontWeight: 700, boxShadow: `0 3px 10px ${P.emerald}30` }}>✓</div>
          ) : isWorking && agent ? (
            <ProgressArc pct={task.progress} color={agent.color} size={26} />
          ) : isReview && agent ? (
            <div style={{ width: 26, height: 26, borderRadius: 9, background: agent.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px ${agent.color}25` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: P.text, animation: "pulseGlow 2s infinite" }} />
            </div>
          ) : agent ? (
            <div style={{ width: 26, height: 26, borderRadius: 9, border: `2px solid ${agent.color}35`, backgroundColor: agent.color + "08", transition: "all 0.2s" }} />
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: 9, border: `2px solid ${P.textGhost}`, transition: "all 0.2s" }} />
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 560, color: isDone ? P.textTer : P.text, lineHeight: 1.5,
          textDecoration: isDone ? "line-through" : "none",
          letterSpacing: "-0.01em",
        }}>{task.title}</div>

        {isWorking && agent && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8,
            padding: "6px 14px 6px 6px", borderRadius: 20, backgroundColor: agent.color + "0A",
            border: `1px solid ${agent.color}15`,
            transition: "all 0.3s",
          }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} slug={agent.slug} />
            <span style={{ fontSize: 12.5, color: agent.color, fontWeight: 600 }}>{task.current_step || "Working..."}</span>
            <span style={{ display: "inline-flex", gap: 3 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: agent.color, animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
            </span>
          </div>
        )}

        {isReview && agent && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8,
            padding: "6px 14px 6px 6px", borderRadius: 20,
            background: `linear-gradient(135deg, ${agent.color}12, ${agent.color}08)`,
            border: `1px solid ${agent.color}20`,
            transition: "all 0.3s",
          }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} slug={agent.slug} />
            <span style={{ fontSize: 12.5, color: agent.color, fontWeight: 800 }}>Mission complete — debrief ready</span>
            <span style={{ fontSize: 14 }}>→</span>
          </div>
        )}

        {/* Show assigned agent on todo/failed tasks */}
        {!isWorking && !isReview && !isDone && agent && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8,
            padding: "6px 14px 6px 6px", borderRadius: 20, backgroundColor: agent.color + "08",
            border: `1px solid ${agent.color}10`,
            transition: "all 0.3s",
          }}>
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} slug={agent.slug} />
            <span style={{ fontSize: 12.5, color: agent.color, fontWeight: 600 }}>{agent.name}</span>
          </div>
        )}
      </div>

      {/* Right meta */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0, paddingTop: 2 }}>
        {task.priority && task.priority !== "normal" && (
          <span style={{
            fontSize: 10.5, fontWeight: 700,
            color: PRIORITY_CONFIG[task.priority].color,
            backgroundColor: PRIORITY_CONFIG[task.priority].bgColor,
            padding: "4px 10px", borderRadius: 8,
            letterSpacing: "0.02em",
            transition: "all 0.2s",
          }}>
            {PRIORITY_CONFIG[task.priority].icon} {PRIORITY_CONFIG[task.priority].label}
          </span>
        )}
        {task.cost_usd > 0 && <span style={{ fontSize: 11, color: P.textGhost, fontFamily: "'JetBrains Mono', var(--font-mono), monospace", fontWeight: 500 }}>${task.cost_usd < 0.01 ? task.cost_usd.toFixed(4) : task.cost_usd.toFixed(2)}</span>}
        {!task.agent_id && !isDone && (
          <span style={{
            fontSize: 11.5, fontWeight: 600, color: P.purple, backgroundColor: P.purpleLight,
            padding: "4px 12px", borderRadius: 8,
            transition: "all 0.2s",
          }}>+ assign</span>
        )}
        {task.agent_id && task.status === "todo" && onRun && (
          <button
            onClick={(e) => { e.stopPropagation(); onRun(task.id); }}
            style={{
              fontSize: 11.5, fontWeight: 700, color: P.text,
              background: agent?.gradient || P.purpleGrad,
              padding: "6px 16px", borderRadius: 10,
              border: "none", cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: `0 3px 12px ${agent?.color || P.purple}30`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = `0 6px 20px ${agent?.color || P.purple}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 3px 12px ${agent?.color || P.purple}30`;
            }}
          >Deploy</button>
        )}
      </div>
    </div>
  );
}
