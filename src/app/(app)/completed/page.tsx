"use client";

import { useState } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

export default function CompletedPage() {
  const { tasks, mutate } = useTasks();
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);

  const doneTasks = tasks.filter((t) => t.status === "done");
  const totalCost = doneTasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  return (
    <>
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: P.text, margin: "0 0 6px",
        letterSpacing: "-0.04em", animation: "slideUp 0.5s ease",
      }}>
        Completed
      </h1>
      <p style={{ fontSize: 15, color: P.textSec, marginBottom: 28 }}>
        {doneTasks.length} tasks done · ${totalCost.toFixed(2)} total
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {doneTasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => setSelectedTask(task)}
            delay={i * 0.04}
          />
        ))}
      </div>

      {doneTasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: P.textTer, fontSize: 14 }}>
          No completed tasks yet. Approve agent output to see tasks here.
        </div>
      )}

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
      />
    </>
  );
}
