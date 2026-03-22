"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface TaskAgent {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  status: "todo" | "working" | "review" | "done" | "failed";
  progress: number;
  current_step: string | null;
  output: string | null;
  cost_usd: number;
  created_at: string;
  completed_at: string | null;
  section: string;
  priority: string;
  agent: TaskAgent | null;
}

function statusDisplay(status: string): { label: string; bg: string; text: string } {
  switch (status) {
    case "todo": return { label: "READY", bg: "bg-slate-100", text: "text-slate-600" };
    case "working": return { label: "RUNNING", bg: "bg-blue-50", text: "text-[#4d4bff]" };
    case "review": return { label: "REVIEW", bg: "bg-purple-50", text: "text-purple-600" };
    case "done": return { label: "SUCCESS", bg: "bg-green-50", text: "text-[#006c05]" };
    case "failed": return { label: "FAILED", bg: "bg-red-50", text: "text-red-600" };
    default: return { label: status.toUpperCase(), bg: "bg-slate-100", text: "text-slate-600" };
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface ColumnDef {
  label: string;
  dotColor: string;
  countBg: string;
  countText: string;
  statuses: string[];
  trailingIcon: string;
  highlighted?: boolean;
}

const COLUMN_DEFS: ColumnDef[] = [
  { label: "Queue / To Do", dotColor: "bg-slate-300", countBg: "bg-slate-100", countText: "text-slate-500", statuses: ["todo"], trailingIcon: "add" },
  { label: "Running / In Progress", dotColor: "bg-blue-500", countBg: "bg-blue-100", countText: "text-blue-600", statuses: ["working"], trailingIcon: "more_horiz", highlighted: true },
  { label: "In Review", dotColor: "bg-purple-500", countBg: "bg-purple-100", countText: "text-purple-600", statuses: ["review"], trailingIcon: "rate_review" },
  { label: "Completed / Done", dotColor: "bg-[#006c05]", countBg: "bg-green-100", countText: "text-[#006c05]", statuses: ["done", "failed"], trailingIcon: "checklist" },
];

function TaskCard({ task, onAction }: { task: Task; onAction: () => void }) {
  const isRunning = task.status === "working";
  const isDone = task.status === "done";
  const isReview = task.status === "review";
  const isFailed = task.status === "failed";
  const sd = statusDisplay(task.status);

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.post(`/api/tasks/${task.id}/approve`);
    onAction();
  };

  const handleRevise = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.post(`/api/tasks/${task.id}/revise`, { note: "Needs revision" });
    onAction();
  };

  return (
    <div
      className={`bg-white p-4 rounded-xl border border-slate-200 transition-all group cursor-pointer ${
        isRunning ? "shadow-md border-l-4 border-l-[#4d4bff]"
        : isDone ? "shadow-sm opacity-90 hover:opacity-100"
        : "shadow-sm hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        {isRunning ? (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sd.bg} ${sd.text} flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d4bff] animate-pulse" />
            {sd.label}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            #{task.id.slice(0, 8)}
          </span>
        )}
        {isRunning && task.progress > 0 ? (
          <span className="text-xs font-bold text-[#4d4bff]">{task.progress}%</span>
        ) : (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sd.bg} ${sd.text}`}>{sd.label}</span>
        )}
      </div>

      <h4 className={`font-semibold leading-tight ${
        isRunning ? "text-slate-900 mb-3" : "text-slate-800 mb-4 group-hover:text-[#4d4bff]"
      }${isDone || isFailed ? " mb-3" : ""}`}>
        {task.title}
      </h4>

      {isRunning && task.progress > 0 && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
          <div className="bg-[#4d4bff] h-full rounded-full" style={{ width: `${task.progress}%` }} />
        </div>
      )}

      {isDone && task.output && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006c05] text-sm">check_circle</span>
          <span className="text-[11px] text-slate-600 font-medium line-clamp-1">{task.output.slice(0, 80)}</span>
        </div>
      )}

      {isReview && (
        <div className="flex gap-2 mb-3">
          <button onClick={handleApprove} className="flex-1 text-[10px] font-bold py-1.5 bg-[#006c05] text-white rounded-lg hover:bg-[#008808] transition-colors">
            Approve
          </button>
          <button onClick={handleRevise} className="flex-1 text-[10px] font-bold py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Revise
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {task.agent ? (
            <>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white" style={{ backgroundColor: task.agent.color }}>
                {task.agent.name[0]}
              </div>
              <span className="text-xs text-slate-500 font-medium">{task.agent.name}</span>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">No agent</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400">{timeAgo(task.created_at)}</span>
      </div>
    </div>
  );
}

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.get<Task[]>("/api/tasks");
      setTasks(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Poll running tasks
  useEffect(() => {
    const hasRunning = tasks.some((t) => t.status === "working");
    if (!hasRunning) return;
    const id = setInterval(loadTasks, 5000);
    return () => clearInterval(id);
  }, [tasks, loadTasks]);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="pt-8 px-8 pb-6 flex justify-between items-end">
        <div>
          <nav className="flex text-xs text-slate-400 gap-2 mb-1">
            <span>AI Studio</span>
            <span>/</span>
            <span className="text-slate-600">Task Board</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agent Workflow</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span>Filter</span>
          </button>
          <button
            onClick={loadTasks}
            className="px-4 py-2 text-sm font-medium bg-[#4d4bff] text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-244px)] overflow-hidden">
          {COLUMN_DEFS.map((col) => {
            const colTasks = tasks.filter((t) => col.statuses.includes(t.status));
            return (
              <div
                key={col.label}
                className={`flex flex-col h-full ${col.highlighted ? "bg-slate-50/50 rounded-2xl p-3 border border-slate-100" : ""}`}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="font-bold text-slate-700">{col.label}</h3>
                    <span className={`text-xs font-medium ${col.countBg} ${col.countText} px-2 py-0.5 rounded-full`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined">{col.trailingIcon}</span>
                  </button>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onAction={loadTasks} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-300">
                      <span className="material-symbols-outlined text-3xl">inbox</span>
                      <p className="text-xs mt-1">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
