"use client";

import { useState } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { EmptyState } from "@/components/tasks/empty-state";
import type { TaskWithAgent } from "@/lib/types/task";

export default function WeekPage() {
  const { tasks, mutate } = useTasks("week");
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);

  const reviewTasks = tasks.filter((t) => t.status === "review");
  const workingTasks = tasks.filter((t) => t.status === "working");
  const todoTasks = tasks.filter((t) => t.status === "todo");

  return (
    <>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          This Week
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} this week
        </p>
      </div>

      <TaskSection
        label="READY FOR REVIEW"
        tasks={reviewTasks}
        onTaskClick={setSelectedTask}
        accentColor="#e11d48"
      />
      <TaskSection
        label="AGENTS WORKING"
        tasks={workingTasks}
        onTaskClick={setSelectedTask}
        accentColor="#f59e0b"
      />
      <TaskSection
        label="TO DO"
        tasks={todoTasks}
        onTaskClick={setSelectedTask}
        accentColor="#9ca3af"
      />

      {tasks.length === 0 && (
        <EmptyState
          message="No tasks this week"
          description="Tasks with the 'week' section will appear here."
        />
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
