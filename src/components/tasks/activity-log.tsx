import { cn } from "@/lib/utils";
import type { TaskStep } from "@/lib/types/task";

interface ActivityLogProps {
  steps: TaskStep[];
  agentColor?: string;
}

export function ActivityLog({ steps, agentColor }: ActivityLogProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.id} className="flex gap-3">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                step.status === "done" && "bg-emerald-500",
                step.status === "working" && "animate-glow-pulse",
                step.status === "pending" && "bg-gray-200",
                step.status === "failed" && "bg-red-500"
              )}
              style={
                step.status === "working"
                  ? { backgroundColor: agentColor || "#f59e0b" }
                  : undefined
              }
            />
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-border min-h-[16px]" />
            )}
          </div>

          {/* Step content */}
          <div className="pb-3 min-w-0">
            <p
              className={cn(
                "text-sm",
                step.status === "done" && "text-ink",
                step.status === "working" && "text-ink font-medium",
                step.status === "pending" && "text-ink-tertiary",
                step.status === "failed" && "text-red-600"
              )}
            >
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
