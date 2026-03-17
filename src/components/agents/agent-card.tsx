"use client";

import { cn } from "@/lib/utils";
import { AgentAvatar } from "./agent-avatar";
import { formatCost } from "@/lib/utils/dates";
import type { Agent } from "@/lib/types/agent";

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-xl p-5 shadow-card",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        "transition-all duration-200 cursor-pointer animate-fade-up"
      )}
    >
      <div className="flex items-start gap-4">
        <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={48} slug={agent.slug} />
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            {agent.name}
          </h3>
          <p className="text-sm text-ink-secondary mt-0.5">
            {agent.description}
          </p>
          <p className="text-xs text-ink-tertiary mt-2 line-clamp-2">
            {agent.long_description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] font-[family-name:var(--font-mono)] text-ink-tertiary">
            <span>{agent.tasks_completed} tasks</span>
          </div>
        </div>
      </div>
    </button>
  );
}
