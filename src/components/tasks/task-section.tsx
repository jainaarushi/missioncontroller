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
      style={{ marginBottom: 28 }}
      onDragOver={handleSectionDragOver}
      onDragLeave={handleSectionDragLeave}
      onDrop={handleSectionDrop}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingLeft: 2,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", backgroundColor: color,
          ...(dot && tasks.length > 0 ? { animation: "pulseGlow 2s infinite", boxShadow: `0 0 6px ${color}60` } : {}),
          opacity: tasks.length === 0 ? 0.4 : 1,
        }} />
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
          color: color === P.textGhost ? P.textTer : color,
          opacity: tasks.length === 0 ? 0.5 : 1,
        }}>{label}</span>
        {tasks.length > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: P.textGhost,
            marginLeft: 2,
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
          padding: "14px 16px", borderRadius: 12,
          border: `2px dashed ${dragOver ? P.indigo : P.border}`,
          backgroundColor: dragOver ? P.indigo + "06" : "transparent",
          fontSize: 12.5, color: dragOver ? P.indigo : P.textGhost,
          fontWeight: dragOver ? 600 : 400,
          textAlign: "center",
          transition: "all 0.2s",
        }}>
          {dragOver ? "Drop here to deploy agent" : "No tasks"}
        </div>
      )}
    </div>
  );
}
