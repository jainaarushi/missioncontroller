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

// Composio actions available per agent slug
interface ComposioAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  composioAction: string;
  extractContent: (output: string) => Record<string, unknown>;
}

const COMPOSIO_ACTIONS: Record<string, ComposioAction[]> = {
  "social-media": [
    {
      id: "linkedin-post",
      label: "Post to LinkedIn",
      icon: "LI",
      color: "#0A66C2",
      composioAction: "LINKEDIN_CREATE_POST",
      extractContent: (output) => {
        // Extract the LinkedIn post from between markers or from the "LinkedIn Post" section
        const markerMatch = output.match(/---START LINKEDIN---\n?([\s\S]*?)\n?---END LINKEDIN---/);
        if (markerMatch) return { text: markerMatch[1].trim() };

        // Try to extract from "## LinkedIn Post" section
        const sectionMatch = output.match(/##\s*LinkedIn Post[^\n]*\n([\s\S]*?)(?=\n##\s|\n---|\$)/);
        if (sectionMatch) {
          // Remove markdown formatting for LinkedIn
          const text = sectionMatch[1]
            .replace(/\*\*/g, "")
            .replace(/^[>\-\*]\s*/gm, "")
            .trim();
          if (text.length > 20) return { text };
        }

        // Fallback: use first 3000 chars
        return { text: output.slice(0, 3000) };
      },
    },
  ],
};

export default function ActionButtons({ agentSlug, taskId, taskOutput }: ActionButtonsProps) {
  const [mcpActions] = useState<OutputAction[]>(() => getOutputActions(agentSlug));
  const composioActions = COMPOSIO_ACTIONS[agentSlug] || [];
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [composioEnabled, setComposioEnabled] = useState(false);
  const [composioLinkedIn, setComposioLinkedIn] = useState(false);
  const [loadingServers, setLoadingServers] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  const hasAnyActions = mcpActions.length > 0 || composioActions.length > 0;

  // Fetch user's connected servers and Composio status
  useEffect(() => {
    if (!hasAnyActions) { setLoadingServers(false); return; }
    let cancelled = false;

    async function fetchStatuses() {
      try {
        const [mcpRes, composioRes] = await Promise.allSettled([
          fetch("/api/user/mcp-servers"),
          fetch("/api/user/composio/status"),
        ]);

        if (cancelled) return;

        // MCP servers
        if (mcpRes.status === "fulfilled" && mcpRes.value.ok) {
          const data = await mcpRes.value.json();
          const servers: Array<{ serverType: string; enabled: boolean }> = data.servers || [];
          const statuses: Record<string, ServerStatus> = {};
          for (const action of mcpActions) {
            const match = servers.find(s => s.serverType === action.serverType && s.enabled);
            statuses[action.serverType] = { connected: !!match, serverType: action.serverType };
          }
          setServerStatuses(statuses);
        }

        // Composio
        if (composioRes.status === "fulfilled" && composioRes.value.ok) {
          const data = await composioRes.value.json();
          setComposioEnabled(data.enabled);
          setComposioLinkedIn(data.connections?.linkedin === true);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoadingServers(false);
      }
    }

    fetchStatuses();
    return () => { cancelled = true; };
  }, [hasAnyActions, mcpActions, composioActions]);

  if (!hasAnyActions) return null;

  async function handleMCPAction(action: OutputAction) {
    setActionStates(prev => ({ ...prev, [action.serverType]: "loading" }));
    setActionErrors(prev => { const next = { ...prev }; delete next[action.serverType]; return next; });

    try {
      const res = await fetch(`/api/tasks/${taskId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverType: action.serverType, toolPattern: action.toolPattern, output: taskOutput }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Action failed" }));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      setActionStates(prev => ({ ...prev, [action.serverType]: "done" }));
      setTimeout(() => setActionStates(prev => ({ ...prev, [action.serverType]: "idle" })), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setActionStates(prev => ({ ...prev, [action.serverType]: "error" }));
      setActionErrors(prev => ({ ...prev, [action.serverType]: msg }));
      setTimeout(() => setActionStates(prev => ({ ...prev, [action.serverType]: "idle" })), 5000);
    }
  }

  async function handleComposioAction(action: ComposioAction) {
    setActionStates(prev => ({ ...prev, [action.id]: "loading" }));
    setActionErrors(prev => { const next = { ...prev }; delete next[action.id]; return next; });

    try {
      const composioParams = action.extractContent(taskOutput);
      const res = await fetch(`/api/tasks/${taskId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ composioAction: action.composioAction, composioParams }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Action failed" }));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      setActionStates(prev => ({ ...prev, [action.id]: "done" }));
      setTimeout(() => setActionStates(prev => ({ ...prev, [action.id]: "idle" })), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setActionStates(prev => ({ ...prev, [action.id]: "error" }));
      setActionErrors(prev => ({ ...prev, [action.id]: msg }));
      setTimeout(() => setActionStates(prev => ({ ...prev, [action.id]: "idle" })), 5000);
    }
  }

  if (loadingServers) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {[...mcpActions.slice(0, 2), ...composioActions.slice(0, 1)].map((_, i) => (
          <div key={i} style={{
            padding: "7px 14px", borderRadius: 8,
            background: P.bg4, border: `1px solid ${P.border}`,
            width: 140, height: 32,
            animation: "tpl-fadeUp 0.3s ease both",
          }} />
        ))}
      </div>
    );
  }

  const hasVisibleActions = mcpActions.length > 0 || composioActions.length > 0;
  if (!hasVisibleActions) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, color: P.textTer, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Send to
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* Composio actions (e.g., Post to LinkedIn) */}
        {composioActions.map(action => {
          const isConnected = composioEnabled && composioLinkedIn;
          const state = actionStates[action.id] || "idle";
          const error = actionErrors[action.id];

          if (!isConnected) {
            return (
              <a key={action.id} href="/settings" style={{
                padding: "7px 14px", borderRadius: 8,
                background: "transparent", border: `1px dashed ${P.border2}`,
                color: P.textTer, fontSize: 11, fontFamily: F, fontWeight: 500,
                textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                cursor: "pointer", transition: "all 0.15s", opacity: 0.7,
              }} title={`Connect LinkedIn in Settings to publish directly`}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: `${action.color}22`, color: action.color,
                  fontSize: 8, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5,
                }}>{action.icon}</span>
                {action.label}
                <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>Connect</span>
              </a>
            );
          }

          return (
            <button key={action.id} onClick={() => state === "idle" && handleComposioAction(action)}
              disabled={state === "loading"} title={error || action.label}
              style={{
                padding: "7px 14px", borderRadius: 8,
                background: state === "done" ? `${action.color}22` : P.bg4,
                border: `1px solid ${state === "done" ? action.color : state === "error" ? "#ef4444" : P.border2}`,
                color: state === "done" ? action.color : state === "error" ? "#ef4444" : P.text,
                fontSize: 11, fontFamily: F, fontWeight: 600,
                cursor: state === "loading" ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s", opacity: state === "loading" ? 0.7 : 1,
              }}>
              <span style={{
                width: 18, height: 18, borderRadius: 4,
                background: `${action.color}22`, color: action.color,
                fontSize: 8, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{action.icon}</span>
              {state === "loading" && (
                <span className="animate-spin" style={{ width: 12, height: 12, border: "2px solid transparent", borderTop: `2px solid ${action.color}`, borderRadius: "50%", display: "inline-block" }} />
              )}
              {state === "done" ? "Posted!" : state === "error" ? "Failed" : action.label}
            </button>
          );
        })}

        {/* MCP actions (existing) */}
        {mcpActions.map(action => {
          const status = serverStatuses[action.serverType];
          const isConnected = status?.connected ?? false;
          const state = actionStates[action.serverType] || "idle";
          const error = actionErrors[action.serverType];

          if (!isConnected) {
            return (
              <a key={action.serverType} href="/settings" style={{
                padding: "7px 14px", borderRadius: 8,
                background: "transparent", border: `1px dashed ${P.border2}`,
                color: P.textTer, fontSize: 11, fontFamily: F, fontWeight: 500,
                textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                cursor: "pointer", transition: "all 0.15s", opacity: 0.7,
              }} title={`Connect ${action.label.replace(/^(Save to |Send as |Share to |Create |Add |Post to )/, "")} in Settings`}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: `${action.color}22`, color: action.color,
                  fontSize: 8, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5,
                }}>{action.icon}</span>
                {action.label}
                <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>Connect</span>
              </a>
            );
          }

          return (
            <button key={action.serverType} onClick={() => state === "idle" && handleMCPAction(action)}
              disabled={state === "loading"} title={error || action.label}
              style={{
                padding: "7px 14px", borderRadius: 8,
                background: state === "done" ? `${action.color}22` : P.bg4,
                border: `1px solid ${state === "done" ? action.color : state === "error" ? "#ef4444" : P.border2}`,
                color: state === "done" ? action.color : state === "error" ? "#ef4444" : P.text,
                fontSize: 11, fontFamily: F, fontWeight: 600,
                cursor: state === "loading" ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s", opacity: state === "loading" ? 0.7 : 1,
              }}>
              <span style={{
                width: 18, height: 18, borderRadius: 4,
                background: `${action.color}22`, color: action.color,
                fontSize: 8, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{action.icon}</span>
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
