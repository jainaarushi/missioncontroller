"use client";

import { AgentAvatar } from "@/components/agents/agent-avatar";
import { P } from "@/lib/palette";
import type { Agent } from "@/lib/types/agent";
import type { TaskWithAgent } from "@/lib/types/task";

interface SidebarAgentsProps {
  agents: Agent[];
  workingTasks: TaskWithAgent[];
}

export function SidebarAgents({ agents, workingTasks }: SidebarAgentsProps) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: P.textGhost,
        padding: "0 12px 8px", letterSpacing: "0.05em",
      }}>
        AGENTS
      </div>
      {agents.map((agent) => {
        const busy = workingTasks.some((t) => t.agent_id === agent.id);

        return (
          <div
            key={agent.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "6px 12px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.025)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{agent.name}</div>
              <div style={{ fontSize: 10.5, color: P.textTer }}>{agent.description}</div>
            </div>
            {busy && (
              <div style={{ display: "flex", gap: 2 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 3, height: 3, borderRadius: "50%",
                    backgroundColor: agent.color,
                    animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
