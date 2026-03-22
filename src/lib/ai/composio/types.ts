// Composio MCP integration types

export type ComposioApp = "linkedin" | "gmail" | "google_sheets" | "google_calendar" | "github";

export interface ComposioConnection {
  app: ComposioApp;
  connected: boolean;
  connectedAt?: string;
}

export type ComposioConnectionStatus = Record<ComposioApp, boolean>;

export const COMPOSIO_APPS: { id: ComposioApp; name: string; icon: string; color: string; description: string }[] = [
  { id: "linkedin", name: "LinkedIn", icon: "LI", color: "#0A66C2", description: "Job search, profile data, and connections" },
  { id: "gmail", name: "Gmail", icon: "GM", color: "#EA4335", description: "Send and read emails" },
  { id: "google_sheets", name: "Google Sheets", icon: "GS", color: "#34A853", description: "Read and write spreadsheet data" },
  { id: "google_calendar", name: "Google Calendar", icon: "GC", color: "#4285F4", description: "Manage events and schedules" },
  { id: "github", name: "GitHub", icon: "GH", color: "#24292F", description: "Repos, issues, and pull requests" },
];
