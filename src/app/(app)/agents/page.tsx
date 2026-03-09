"use client";

import { useAgents } from "@/lib/hooks/use-agents";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { P } from "@/lib/palette";

export default function AgentsPage() {
  const { agents } = useAgents();
  const { tasks } = useTasks();

  return (
    <>
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: P.text, margin: "0 0 6px",
        letterSpacing: "-0.04em", animation: "slideUp 0.5s ease",
      }}>
        Your agents
      </h1>
      <p style={{ fontSize: 15, color: P.textSec, marginBottom: 28 }}>
        Plug and play. Assign them tasks and watch them work.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {agents.map((agent, i) => {
          const done = tasks.filter((t) => t.agent_id === agent.id && t.status === "done").length;

          return (
            <div
              key={agent.id}
              style={{
                padding: "22px", backgroundColor: P.card, borderRadius: 16,
                border: `1.5px solid ${P.border}`,
                boxShadow: P.shadow,
                animation: `popIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 10px 30px ${agent.color}12`;
                e.currentTarget.style.borderColor = agent.color + "30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = P.shadow;
                e.currentTarget.style.borderColor = P.border;
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size="lg" />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: P.text, letterSpacing: "-0.02em" }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: P.textTer }}>
                    {agent.description}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: P.textSec, lineHeight: 1.6, marginBottom: 12 }}>
                {agent.long_description}
              </div>
              <div style={{
                display: "flex", gap: 10, fontSize: 11, color: P.textTer,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
              }}>
                <span>{agent.tasks_completed + done} completed</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
