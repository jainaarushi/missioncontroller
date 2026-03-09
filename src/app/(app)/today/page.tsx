"use client";

import { useState, useCallback } from "react";
import { NewTaskInput } from "@/components/tasks/new-task-input";
import { TaskSection } from "@/components/tasks/task-section";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { Confetti } from "@/components/shared/confetti";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useRealtimeTasks } from "@/lib/hooks/use-realtime";
import { P } from "@/lib/palette";
import type { TaskWithAgent } from "@/lib/types/task";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning \u2600\uFE0F";
  if (hour < 17) return "Good afternoon";
  return "Good evening \uD83C\uDF19";
}

export default function TodayPage() {
  const { tasks, mutate } = useTasks("today");
  const [selectedTask, setSelectedTask] = useState<TaskWithAgent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useRealtimeTasks(mutate);

  const reviewTasks = tasks.filter((t) => t.status === "review");
  const workingTasks = tasks.filter((t) => t.status === "working");
  const todoTasks = tasks.filter((t) => t.status === "todo" || t.status === "failed");
  const totalCost = tasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);

  const handleConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }, []);

  async function handleCreateTask(title: string) {
    const optimisticTask: TaskWithAgent = {
      id: `temp-${Date.now()}`,
      user_id: "",
      agent_id: null,
      title,
      description: null,
      status: "todo",
      progress: 0,
      current_step: null,
      output: null,
      output_format: "markdown",
      cost_usd: 0,
      tokens_in: 0,
      tokens_out: 0,
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      section: "today",
      sort_order: 0,
      agent: null,
    };

    mutate([optimisticTask, ...tasks], false);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, section: "today" }),
    });

    mutate();
  }

  return (
    <>
      <Confetti show={showConfetti} />

      {/* Greeting */}
      <div style={{ marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, color: P.text, margin: 0,
          letterSpacing: "-0.04em",
        }}>
          {getGreeting()}
        </h1>
        <p style={{ fontSize: 15, color: P.textSec, marginTop: 5, lineHeight: 1.5 }}>
          {reviewTasks.length > 0 && (
            <>
              <span style={{ color: P.coral, fontWeight: 700 }}>
                {reviewTasks.length} task{reviewTasks.length > 1 ? "s" : ""} ready for review
              </span>
              {" \u00B7 "}
            </>
          )}
          {workingTasks.length > 0 && (
            <>
              {workingTasks.length} agent{workingTasks.length !== 1 ? "s" : ""} working
              {" \u00B7 "}
            </>
          )}
          ${totalCost.toFixed(2)} spent today
        </p>
      </div>

      {/* New task input */}
      <NewTaskInput onSubmit={handleCreateTask} />

      {/* Review section */}
      <TaskSection
        label="READY FOR REVIEW"
        tasks={reviewTasks}
        onTaskClick={setSelectedTask}
        accentColor={P.coral}
        dot
      />

      {/* Working section */}
      <TaskSection
        label="AGENTS WORKING"
        tasks={workingTasks}
        onTaskClick={setSelectedTask}
        accentColor={P.amber}
      />

      {/* To do section */}
      <TaskSection
        label="TO DO"
        tasks={todoTasks}
        onTaskClick={setSelectedTask}
        accentColor={P.textGhost}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
        onConfetti={handleConfetti}
      />
    </>
  );
}
