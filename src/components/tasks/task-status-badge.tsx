import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types/task";

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  todo: {
    label: "To Do",
    dotColor: "bg-gray-300",
    textColor: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  working: {
    label: "Working",
    dotColor: "bg-amber-400 animate-glow-pulse",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  review: {
    label: "Review",
    dotColor: "bg-rose-400",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
  },
  done: {
    label: "Done",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  failed: {
    label: "Failed",
    dotColor: "bg-red-400",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[10.5px] font-semibold tracking-wide",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn("w-[5px] h-[5px] rounded-full flex-shrink-0", config.dotColor)}
        style={status === "working" ? { color: "#f59e0b" } : undefined}
      />
      {config.label}
    </span>
  );
}
