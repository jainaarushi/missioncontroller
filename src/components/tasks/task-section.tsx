"use client";

import { TaskCard } from "./task-card";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskSectionProps {
  label: string;
  tasks: TaskWithAgent[];
  onTaskClick: (task: TaskWithAgent) => void;
  accentColor?: string;
  dot?: boolean;
}

export function TaskSection({ label, tasks, onTaskClick, accentColor, dot }: TaskSectionProps) {
  if (tasks.length === 0) return null;

  const color = accentColor || P.textGhost;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, paddingLeft: 2 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%", backgroundColor: color,
          ...(dot ? { animation: "pulseGlow 2s infinite", boxShadow: `0 0 6px ${color}60` } : {}),
        }} />
        <span style={{
          fontSize: 11.5, fontWeight: 700, letterSpacing: "0.05em",
          color: color === P.textGhost ? P.textTer : color,
        }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            delay={i * 0.04}
          />
        ))}
      </div>
    </div>
  );
}
