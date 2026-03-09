import { TaskStatus } from "@/lib/types/task";

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
