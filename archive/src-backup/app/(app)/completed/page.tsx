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
        fontSize: 28, fontWeight: 800, color: P.text, margin: "0 0 6px",
        letterSpacing: "-0.03em", animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        Completed
      </h1>
      {doneTasks.length > 0 && (
        <p style={{ fontSize: 14, color: P.textSec, marginBottom: 24 }}>
          {doneTasks.length} task{doneTasks.length !== 1 ? "s" : ""} done{totalCost > 0 && ` · $${totalCost < 0.01 ? totalCost.toFixed(4) : totalCost.toFixed(2)} total`}
        </p>
      )}

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
        <div style={{
          textAlign: "center", padding: "48px 20px",
          borderRadius: 16, border: `1.5px dashed ${P.border}`,
          marginTop: 8,
          animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both",
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: P.text, marginBottom: 4 }}>
            No completed tasks yet
          </div>
          <div style={{ fontSize: 13, color: P.textTer, lineHeight: 1.5 }}>
            When you approve an agent's output, it'll appear here
          </div>
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
