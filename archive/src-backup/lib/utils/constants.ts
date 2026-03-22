import { TaskStatus, TaskPriority } from "@/lib/types/task";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  todo: {
    label: "To Do",
    color: "text-ink-secondary",
    bgColor: "bg-gray-100",
  },
  working: {
    label: "Working",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  review: {
    label: "Review",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
  },
  done: {
    label: "Done",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  failed: {
    label: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
};

export const SECTION_LABELS = {
  review: "READY FOR REVIEW",
  working: "AGENTS WORKING",
  todo: "TO DO",
} as const;

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; icon: string; color: string; bgColor: string; sortWeight: number }
> = {
  urgent: {
    label: "Urgent",
    icon: "🔴",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    sortWeight: 0,
  },
  high: {
    label: "High",
    icon: "🟠",
    color: "#EA580C",
    bgColor: "#FFF7ED",
    sortWeight: 1,
  },
  normal: {
    label: "Normal",
    icon: "🔵",
    color: "#1e8e3e",
    bgColor: "#eef7f0",
    sortWeight: 2,
  },
  low: {
    label: "Low",
    icon: "⚪",
    color: "#9CA3AF",
    bgColor: "#F9FAFB",
    sortWeight: 3,
  },
};
