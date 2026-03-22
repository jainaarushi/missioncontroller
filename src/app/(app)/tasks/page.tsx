"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Static dummy data                                                  */
/* ------------------------------------------------------------------ */

interface Task {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  statusBg: string;
  statusText: string;
  agentName: string;
  agentColor: string;
  agentInitial: string;
  extra?: string;              // e.g. "Scheduled: 14:00"
  progress?: number;           // percentage for running tasks
  resultText?: string;         // e.g. "24 critical bugs fixed"
  tools?: string[];            // e.g. ["API", "DB"]
  trailingIcon?: string;       // material icon name
}

const TODO_TASKS: Task[] = [
  {
    id: "#9922",
    title: "LinkedIn Outreach - Batch #9922",
    status: "todo",
    statusLabel: "READY",
    statusBg: "bg-slate-100",
    statusText: "text-slate-600",
    agentName: "Growth Agent",
    agentColor: "bg-indigo-500",
    agentInitial: "G",
    extra: "Scheduled: 14:00",
  },
  {
    id: "#9925",
    title: "Competitor SEO Audit: FinTech Sector",
    status: "todo",
    statusLabel: "WAITING",
    statusBg: "bg-amber-50",
    statusText: "text-amber-600",
    agentName: "SEO Analyst",
    agentColor: "bg-teal-500",
    agentInitial: "S",
    trailingIcon: "schedule",
  },
  {
    id: "#9930",
    title: "Weekly Newsletter: AI Trends Digest",
    status: "todo",
    statusLabel: "READY",
    statusBg: "bg-slate-100",
    statusText: "text-slate-600",
    agentName: "Content Bot",
    agentColor: "bg-pink-500",
    agentInitial: "C",
    extra: "Scheduled: 09:00",
  },
  {
    id: "#9933",
    title: "Data Pipeline Health Check",
    status: "todo",
    statusLabel: "WAITING",
    statusBg: "bg-amber-50",
    statusText: "text-amber-600",
    agentName: "DevOps Bot",
    agentColor: "bg-orange-500",
    agentInitial: "D",
    trailingIcon: "schedule",
  },
];

const IN_PROGRESS_TASKS: Task[] = [
  {
    id: "#9918",
    title: "Research Phase - Market Landscape Analysis",
    status: "running",
    statusLabel: "RUNNING",
    statusBg: "bg-blue-50",
    statusText: "text-[#4d4bff]",
    agentName: "Research Strategist",
    agentColor: "bg-violet-500",
    agentInitial: "R",
    progress: 65,
    tools: ["API", "DB"],
  },
  {
    id: "#9920",
    title: "Content Generation: Q3 Social Media Pack",
    status: "running",
    statusLabel: "RUNNING",
    statusBg: "bg-blue-50",
    statusText: "text-[#4d4bff]",
    agentName: "Creative Copywriter",
    agentColor: "bg-rose-500",
    agentInitial: "C",
    progress: 22,
    trailingIcon: "image",
  },
];

const IN_REVIEW_TASKS: Task[] = [
  {
    id: "#9910",
    title: "Brand Voice Guidelines Document",
    status: "review",
    statusLabel: "REVIEW",
    statusBg: "bg-purple-50",
    statusText: "text-purple-600",
    agentName: "Brand Strategist",
    agentColor: "bg-purple-500",
    agentInitial: "B",
    extra: "Awaiting approval",
  },
  {
    id: "#9912",
    title: "Customer Sentiment Report - March",
    status: "review",
    statusLabel: "REVIEW",
    statusBg: "bg-purple-50",
    statusText: "text-purple-600",
    agentName: "Analytics Agent",
    agentColor: "bg-cyan-500",
    agentInitial: "A",
    extra: "1 comment",
  },
  {
    id: "#9914",
    title: "API Documentation Update v2.1",
    status: "review",
    statusLabel: "CHANGES",
    statusBg: "bg-amber-50",
    statusText: "text-amber-600",
    agentName: "Tech Writer",
    agentColor: "bg-emerald-500",
    agentInitial: "T",
    extra: "Revision requested",
  },
];

const DONE_TASKS: Task[] = [
  {
    id: "#8810",
    title: "Technical Debt Cleanup",
    status: "done",
    statusLabel: "SUCCESS",
    statusBg: "bg-green-50",
    statusText: "text-[#006c05]",
    agentName: "DevOps Bot",
    agentColor: "bg-orange-500",
    agentInitial: "D",
    resultText: "24 critical bugs fixed",
    extra: "2h ago",
  },
  {
    id: "#8808",
    title: "Email Campaign: Launch Announcement",
    status: "done",
    statusLabel: "SUCCESS",
    statusBg: "bg-green-50",
    statusText: "text-[#006c05]",
    agentName: "Growth Agent",
    agentColor: "bg-indigo-500",
    agentInitial: "G",
    resultText: "1.2k emails dispatched",
    extra: "Yesterday",
  },
  {
    id: "#8805",
    title: "Competitor Pricing Matrix",
    status: "done",
    statusLabel: "SUCCESS",
    statusBg: "bg-green-50",
    statusText: "text-[#006c05]",
    agentName: "Research Strategist",
    agentColor: "bg-violet-500",
    agentInitial: "R",
    resultText: "12 competitors analyzed",
    extra: "2 days ago",
  },
];

/* ------------------------------------------------------------------ */
/*  Column component                                                   */
/* ------------------------------------------------------------------ */

interface ColumnDef {
  label: string;
  dotColor: string;
  countBg: string;
  countText: string;
  tasks: Task[];
  trailingIcon: string;
  highlighted?: boolean;
}

function KanbanColumn({ col }: { col: ColumnDef }) {
  return (
    <div
      className={`flex flex-col h-full ${
        col.highlighted
          ? "bg-slate-50/50 rounded-2xl p-3 border border-slate-100"
          : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}
          />
          <h3 className="font-bold text-slate-700">{col.label}</h3>
          <span
            className={`text-xs font-medium ${col.countBg} ${col.countText} px-2 py-0.5 rounded-full`}
          >
            {col.tasks.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined">
            {col.trailingIcon}
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-4 overflow-y-auto pr-2 flex-1">
        {col.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Task card                                                          */
/* ------------------------------------------------------------------ */

function TaskCard({ task }: { task: Task }) {
  const isRunning = task.status === "running";
  const isDone = task.status === "done";

  return (
    <div
      className={`bg-white p-4 rounded-xl border border-slate-200 transition-all group cursor-pointer ${
        isRunning
          ? "shadow-md border-l-4 border-l-[#4d4bff]"
          : isDone
          ? "shadow-sm opacity-90 hover:opacity-100"
          : "shadow-sm hover:border-blue-200 hover:shadow-md"
      }`}
    >
      {/* Top row — ID / status */}
      <div className="flex justify-between items-start mb-3">
        {isRunning ? (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.statusBg} ${task.statusText} flex items-center gap-1`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d4bff] animate-pulse" />
            {task.statusLabel}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {task.id}
          </span>
        )}
        {isRunning && task.progress !== undefined ? (
          <span className="text-xs font-bold text-[#4d4bff]">
            {task.progress}%
          </span>
        ) : (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.statusBg} ${task.statusText}`}
          >
            {task.statusLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <h4
        className={`font-semibold leading-tight ${
          isRunning ? "text-slate-900 mb-3" : "text-slate-800 mb-4 group-hover:text-[#4d4bff]"
        }${isDone ? " mb-3" : ""}`}
      >
        {task.title}
      </h4>

      {/* Progress bar (running only) */}
      {isRunning && task.progress !== undefined && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
          <div
            className="bg-[#4d4bff] h-full rounded-full"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      )}

      {/* Result pill (done only) */}
      {isDone && task.resultText && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006c05] text-sm">
            check_circle
          </span>
          <span className="text-[11px] text-slate-600 font-medium">
            {task.resultText}
          </span>
        </div>
      )}

      {/* Bottom row — agent + meta */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full ${task.agentColor} ring-2 ring-white flex items-center justify-center text-white text-[9px] font-bold`}
          >
            {task.agentInitial}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {task.agentName}
          </span>
        </div>

        {/* Trailing: tools, icon, or timestamp */}
        {task.tools && task.tools.length > 0 ? (
          <div className="flex -space-x-2">
            {task.tools.map((t) => (
              <div
                key={t}
                className="w-5 h-5 rounded-full bg-slate-200 border border-white text-[8px] flex items-center justify-center font-bold"
              >
                {t}
              </div>
            ))}
          </div>
        ) : task.trailingIcon ? (
          <span className="material-symbols-outlined text-slate-300 text-lg">
            {task.trailingIcon}
          </span>
        ) : task.extra ? (
          <span className="text-[10px] text-slate-400">{task.extra}</span>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const COLUMNS: ColumnDef[] = [
  {
    label: "Queue / To Do",
    dotColor: "bg-slate-300",
    countBg: "bg-slate-100",
    countText: "text-slate-500",
    tasks: TODO_TASKS,
    trailingIcon: "add",
  },
  {
    label: "Running / In Progress",
    dotColor: "bg-blue-500",
    countBg: "bg-blue-100",
    countText: "text-blue-600",
    tasks: IN_PROGRESS_TASKS,
    trailingIcon: "more_horiz",
    highlighted: true,
  },
  {
    label: "In Review",
    dotColor: "bg-purple-500",
    countBg: "bg-purple-100",
    countText: "text-purple-600",
    tasks: IN_REVIEW_TASKS,
    trailingIcon: "rate_review",
  },
  {
    label: "Completed / Done",
    dotColor: "bg-[#006c05]",
    countBg: "bg-green-100",
    countText: "text-[#006c05]",
    tasks: DONE_TASKS,
    trailingIcon: "checklist",
  },
];

export default function TaskBoardPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Board Header */}
      <div className="pt-8 px-8 pb-6 flex justify-between items-end">
        <div>
          <nav className="flex text-xs text-slate-400 gap-2 mb-1">
            <span>AI Studio</span>
            <span>/</span>
            <span className="text-slate-600">Task Board</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Agent Workflow
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-lg">
              filter_list
            </span>
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-[#4d4bff] text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span>Automate Board</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-244px)] overflow-hidden">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.label} col={col} />
        ))}
      </div>
    </div>
  );
}
