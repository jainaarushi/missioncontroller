"use client";

import { useState, useEffect } from "react";
import { P, F } from "@/lib/palette";
import { getOutputActions, type OutputAction } from "@/lib/ai/mcp/actions";

interface ActionButtonsProps {
  agentSlug: string;
  taskId: string;
  taskOutput: string;
}

interface ServerStatus {
  connected: boolean;
  serverType: string;
}

export default function ActionButtons({ agentSlug, taskId, taskOutput }: ActionButtonsProps) {
  const [actions] = useState<OutputAction[]>(() => getOutputActions(agentSlug));
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [loadingServers, setLoadingServers] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  // Fetch user's connected MCP servers
  useEffect(() => {
    if (actions.length === 0) return;
    let cancelled = false;

    async function fetchServers() {
      try {
        const res = await fetch("/api/user/mcp-servers");
        if (!res.ok) {
          setLoadingServers(false);
          return;
        }
        const data = await res.json();
        const servers: Array<{ serverType: string; enabled: boolean }> = data.servers || [];
        if (cancelled) return;

        const statuses: Record<string, ServerStatus> = {};
        for (const action of actions) {
          const match = servers.find(s => s.serverType === action.serverType && s.enabled);
          statuses[action.serverType] = {
            connected: !!match,
            serverType: action.serverType,
          };
        }
        setServerStatuses(statuses);
      } catch {
        // Silently fail — buttons will show as disconnected
      } finally {
        if (!cancelled) setLoadingServers(false);
      }
    }

    fetchServers();
    return () => { cancelled = true; };
  }, [actions]);

  if (actions.length === 0) return null;

  async function handleAction(action: OutputAction) {
    setActionStates(prev => ({ ...prev, [action.serverType]: "loading" }));
    setActionErrors(prev => { const next = { ...prev }; delete next[action.serverType]; return next; });

    try {
      const res = await fetch(`/api/tasks/${taskId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverType: action.serverType,
          toolPattern: action.toolPattern,
          output: taskOutput,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Action failed" }));
        throw new Error(data.error || `Failed (${res.status})`);
      }

      setActionStates(prev => ({ ...prev, [action.serverType]: "done" }));
      // Reset to idle after 3s
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [action.serverType]: "idle" }));
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setActionStates(prev => ({ ...prev, [action.serverType]: "error" }));
      setActionErrors(prev => ({ ...prev, [action.serverType]: msg }));
      // Reset to idle after 5s
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [action.serverType]: "idle" }));
      }, 5000);
    }
  }

  if (loadingServers) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {actions.slice(0, 3).map(a => (
          <div key={a.serverType} style={{
            padding: "7px 14px", borderRadius: 8,
            background: P.bg4, border: `1px solid ${P.border}`,
            width: 120, height: 32,
            animation: "tpl-fadeUp 0.3s ease both",
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, color: P.textTer, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Send to
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {actions.map(action => {
          const status = serverStatuses[action.serverType];
          const isConnected = status?.connected ?? false;
          const state = actionStates[action.serverType] || "idle";
          const error = actionErrors[action.serverType];

          if (!isConnected) {
            // Disconnected — ghost button linking to settings
            return (
              <a
                key={action.serverType}
                href="/settings"
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "transparent",
                  border: `1px dashed ${P.border2}`,
                  color: P.textTer,
                  fontSize: 11,
                  fontFamily: F,
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  opacity: 0.7,
                }}
                title={`Connect ${action.label.replace(/^(Save to |Send as |Share to |Create |Add |Post to )/, "")} in Settings`}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: `${action.color}22`,
                  color: action.color,
                  fontSize: 8, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0.5,
                }}>
                  {action.icon}
                </span>
                {action.label}
                <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>Connect</span>
              </a>
            );
          }

          // Connected — active action button
          return (
            <button
              key={action.serverType}
              onClick={() => state === "idle" && handleAction(action)}
              disabled={state === "loading"}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                background: state === "done" ? `${action.color}22` : P.bg4,
                border: `1px solid ${state === "done" ? action.color : state === "error" ? "#ef4444" : P.border2}`,
                color: state === "done" ? action.color : state === "error" ? "#ef4444" : P.text,
                fontSize: 11,
                fontFamily: F,
                fontWeight: 600,
                cursor: state === "loading" ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
                opacity: state === "loading" ? 0.7 : 1,
              }}
              title={error || action.label}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 4,
                background: `${action.color}22`,
                color: action.color,
                fontSize: 8, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {action.icon}
              </span>
              {state === "loading" && (
                <span className="animate-spin" style={{ width: 12, height: 12, border: "2px solid transparent", borderTop: `2px solid ${action.color}`, borderRadius: "50%", display: "inline-block" }} />
              )}
              {state === "done" ? "Done!" : state === "error" ? "Failed" : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
