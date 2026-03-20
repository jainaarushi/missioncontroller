import type { MCPServerType } from "./types";
import { MCP_SERVER_SUGGESTIONS } from "./suggestions";

/**
 * Output action definition — maps an MCP server type to a user-facing action.
 */
export interface OutputAction {
  serverType: MCPServerType;
  label: string;
  icon: string;
  color: string;
  /** Regex pattern to match a compatible tool name on the MCP server */
  toolPattern: string;
}

/**
 * Common action templates — one per MCP server type that supports output actions.
 * Only server types where "push output somewhere" makes sense are listed.
 */
const COMMON_ACTIONS: Partial<Record<MCPServerType, Omit<OutputAction, "serverType">>> = {
  "google-sheets": { label: "Save to Google Sheets", icon: "GS", color: "#34A853", toolPattern: "create|append|write|update|add" },
  "gmail":         { label: "Send as Email",         icon: "GM", color: "#EA4335", toolPattern: "send|create|draft|compose" },
  "notion":        { label: "Save to Notion",        icon: "NT", color: "#000000", toolPattern: "create|add|append|page" },
  "slack":         { label: "Share to Slack",         icon: "SL", color: "#4A154B", toolPattern: "send|post|message" },
  "linear":        { label: "Create Linear Issue",    icon: "LN", color: "#5E6AD2", toolPattern: "create|issue|ticket" },
  "jira":          { label: "Create Jira Ticket",     icon: "JR", color: "#0052CC", toolPattern: "create|issue|ticket" },
  "trello":        { label: "Add Trello Card",        icon: "TR", color: "#0079BF", toolPattern: "create|add|card" },
  "discord":       { label: "Post to Discord",        icon: "DC", color: "#5865F2", toolPattern: "send|post|message" },
  "google-calendar": { label: "Create Calendar Event", icon: "GC", color: "#4285F4", toolPattern: "create|add|event|insert" },
  "confluence":    { label: "Save to Confluence",     icon: "CF", color: "#172B4D", toolPattern: "create|page|add" },
  "airtable":      { label: "Add to Airtable",        icon: "AT", color: "#18BFFF", toolPattern: "create|add|record" },
};

/**
 * Build a reverse index: agent slug → recommended server types.
 * Derived from MCP_SERVER_SUGGESTIONS.recommendedAgents.
 */
function buildAgentServerTypeMap(): Record<string, MCPServerType[]> {
  const map: Record<string, MCPServerType[]> = {};
  for (const suggestion of MCP_SERVER_SUGGESTIONS) {
    for (const agentSlug of suggestion.recommendedAgents) {
      if (!map[agentSlug]) map[agentSlug] = [];
      if (!map[agentSlug].includes(suggestion.type)) {
        map[agentSlug].push(suggestion.type);
      }
    }
  }
  return map;
}

const AGENT_SERVER_TYPES = buildAgentServerTypeMap();

/**
 * Get available output actions for a given agent slug.
 * Returns only actions where a COMMON_ACTION template exists for the server type.
 */
export function getOutputActions(slug: string): OutputAction[] {
  const serverTypes = AGENT_SERVER_TYPES[slug];
  if (!serverTypes) return [];

  const actions: OutputAction[] = [];
  for (const st of serverTypes) {
    const template = COMMON_ACTIONS[st];
    if (template) {
      actions.push({ serverType: st, ...template });
    }
  }
  return actions;
}
