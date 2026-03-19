// MCP Server configuration stored per user (encrypted in Supabase)

export interface MCPServerConfig {
  /** Unique ID for this server config */
  id: string;
  /** Human-readable name (e.g., "My GitHub", "Production DB") */
  name: string;
  /** MCP server URL (Streamable HTTP endpoint) */
  url: string;
  /** Optional auth header value (e.g., "Bearer ghp_xxxx") — stored encrypted */
  authToken?: string;
  /** Which agents can use this server. Empty array = all agents */
  agentSlugs: string[];
  /** Whether this server is enabled */
  enabled: boolean;
  /** Server type for UI display */
  serverType: MCPServerType;
  /** When this config was created */
  createdAt: string;
}

export type MCPServerType =
  | "github"
  | "slack"
  | "postgres"
  | "mysql"
  | "google-sheets"
  | "google-calendar"
  | "gmail"
  | "jira"
  | "linear"
  | "notion"
  | "salesforce"
  | "hubspot"
  | "sentry"
  | "browserbase"
  | "stripe"
  | "discord"
  | "trello"
  | "asana"
  | "figma"
  | "twitter"
  | "gitlab"
  | "calendly"
  | "posthog"
  | "snowflake"
  | "intercom"
  | "telegram"
  | "whatsapp"
  | "zendesk"
  | "shopify"
  | "supabase"
  | "firebase"
  | "confluence"
  | "airtable"
  | "monday"
  | "composio"
  | "custom";

/** Pre-built MCP server suggestions shown in settings */
export interface MCPServerSuggestion {
  type: MCPServerType;
  name: string;
  description: string;
  icon: string;
  color: string;
  urlPlaceholder: string;
  authPlaceholder: string;
  authRequired: boolean;
  /** Which agents benefit from this server */
  recommendedAgents: string[];
  /** Setup documentation link */
  docsUrl: string;
}

/** Stored in Supabase users table as encrypted JSON */
export interface UserMCPConfig {
  servers: MCPServerConfig[];
}
