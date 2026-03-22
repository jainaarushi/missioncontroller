"use client";

import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/types/agent";

interface AgentPickerProps {
  agents: Agent[];
  onAssign: (agentId: string) => void;
  loading?: boolean;
}

export function AgentPicker({ agents, onAssign, loading }: AgentPickerProps) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-secondary mb-3">
        Assign an agent
      </p>
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onAssign(agent.id)}
            disabled={loading}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border border-border",
              "hover:-translate-y-0.5 hover:shadow-card-hover hover:border-transparent",
              "transition-all duration-200 text-left",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{
              background: loading ? undefined : `${agent.color}06`,
            }}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{
                background: agent.gradient,
              }}
            >
              {agent.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{agent.name}</p>
              <p className="text-[11px] text-ink-tertiary truncate">
                {agent.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
