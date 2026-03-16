"use client";

import { useState } from "react";
import { TaskCard } from "./task-card";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskSectionProps {
  label: string;
  sectionId?: string;
  tasks: TaskWithAgent[];
  onTaskClick: (task: TaskWithAgent) => void;
  onRunTask?: (taskId: string) => void;
  onDropTask?: (taskId: string, targetSection: string) => void;
  accentColor?: string;
  dot?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (taskId: string) => void;
  draggable?: boolean;
  onReorder?: (dragId: string, dropId: string) => void;
}

export function TaskSection({
  label, sectionId, tasks, onTaskClick, onRunTask, onDropTask, accentColor, dot,
  selectable, selectedIds, onSelect,
  draggable, onReorder,
}: TaskSectionProps) {
  const color = accentColor || P.textGhost;
  const [dragOver, setDragOver] = useState(false);
  let draggedId: string | null = null;

  function handleSectionDragOver(e: React.DragEvent) {
    if (!sectionId || !onDropTask) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleSectionDragLeave() {
    setDragOver(false);
  }

  function handleSectionDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (!sectionId || !onDropTask) return;
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onDropTask(taskId, sectionId);
    }
  }

  return (
    <div
      style={{ marginBottom: 32 }}
      onDragOver={handleSectionDragOver}
      onDragLeave={handleSectionDragLeave}
      onDrop={handleSectionDrop}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingLeft: 2,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%", backgroundColor: color,
          ...(dot && tasks.length > 0 ? { animation: "pulseGlow 2s infinite", boxShadow: `0 0 8px ${color}50` } : {}),
          opacity: tasks.length === 0 ? 0.35 : 1,
          transition: "all 0.3s",
        }} />
        <span style={{
          fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
          color: color === P.textGhost ? P.textTer : color,
          opacity: tasks.length === 0 ? 0.5 : 1,
        }}>{label}</span>
        {tasks.length > 0 && (
          <span style={{
            fontSize: 11.5, fontWeight: 700, color: "#0b0b0e",
            backgroundColor: color === P.textGhost ? P.textTer : color,
            padding: "2px 8px", borderRadius: 10,
            marginLeft: 2,
            lineHeight: "16px",
          }}>
            {tasks.length}
          </span>
        )}
      </div>
      {tasks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onRun={onRunTask}
              delay={i * 0.05}
              selectable={selectable}
              selected={selectedIds?.has(task.id)}
              onSelect={onSelect}
              draggable={draggable}
              onDragStart={(id) => { draggedId = id; }}
              onDragOver={(id) => {
                if (draggedId && draggedId !== id) {
                  onReorder?.(draggedId, id);
                }
              }}
              onDragEnd={() => { draggedId = null; }}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: "18px 20px", borderRadius: 14,
          border: `2px dashed ${dragOver ? P.violet : P.border}`,
          backgroundColor: dragOver ? `${P.violet}12` : "transparent",
          fontSize: 13, color: dragOver ? P.violet : P.textGhost,
          fontWeight: dragOver ? 600 : 400,
          textAlign: "center",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
          {dragOver ? "Drop here to deploy agent" : "No tasks"}
        </div>
      )}
    </div>
  );
}
