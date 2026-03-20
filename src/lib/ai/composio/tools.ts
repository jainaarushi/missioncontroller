// Composio REST API tool wrappers for Vercel AI SDK
// Replaces MCP connection with direct REST API calls

import { z } from "zod";

const COMPOSIO_API_BASE = "https://backend.composio.dev/api/v2";

// Maps agent slugs to allowed Composio app names
const AGENT_APPS: Record<string, string[]> = {
  "job-hunter":         ["LINKEDIN"],
  "auto-applier":       ["LINKEDIN", "GMAIL"],
  "resume-optimizer":   ["LINKEDIN"],
  "interview-coach":    ["LINKEDIN"],
  "salary-negotiator":  ["LINKEDIN"],
  "linkedin-optimizer": ["LINKEDIN"],
  "career-pivoter":     ["LINKEDIN"],
  "remote-job-finder":  ["LINKEDIN"],
  "networking-coach":   ["LINKEDIN", "GMAIL"],
  "portfolio-builder":  ["LINKEDIN", "GITHUB"],
  // Social media agents
  "social-media":       ["LINKEDIN"],
  "content-creator":    ["LINKEDIN"],
  // Communication agents
  "email-drafter":      ["GMAIL"],
  "code-reviewer":      ["GITHUB"],
  "debugger":           ["GITHUB"],
  "fullstack-developer":["GITHUB"],
};

// Known useful actions per app with their parameter schemas
// These are the Composio actions that agents actually need
const APP_ACTIONS: Record<string, {
  actionName: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
}[]> = {
  LINKEDIN: [
    {
      actionName: "LINKEDIN_SEARCH_JOBS",
      description: "Search for job listings on LinkedIn by keywords, location, and filters",
      parameters: z.object({
        query: z.string().describe("Job search query (e.g., 'Senior React Developer')"),
        location: z.string().optional().describe("Job location (e.g., 'San Francisco, CA')"),
        job_type: z.enum(["full-time", "part-time", "contract", "internship"]).optional().describe("Type of employment"),
        remote: z.boolean().optional().describe("Filter for remote positions only"),
      }),
    },
    {
      actionName: "LINKEDIN_GET_PROFILE",
      description: "Get a LinkedIn profile by URL or username to view experience, skills, and education",
      parameters: z.object({
        profile_url: z.string().optional().describe("LinkedIn profile URL"),
        username: z.string().optional().describe("LinkedIn username/handle"),
      }),
    },
    {
      actionName: "LINKEDIN_SEARCH_PEOPLE",
      description: "Search for people on LinkedIn by name, company, title, or keywords",
      parameters: z.object({
        query: z.string().describe("Search query for people (e.g., 'CTO at fintech startups')"),
        company: z.string().optional().describe("Filter by company name"),
        title: z.string().optional().describe("Filter by job title"),
      }),
    },
    {
      actionName: "LINKEDIN_CREATE_POST",
      description: "Publish a post on LinkedIn. The post will appear on the user's LinkedIn feed.",
      parameters: z.object({
        text: z.string().describe("The post content (supports line breaks, mentions, and hashtags)"),
        visibility: z.enum(["PUBLIC", "CONNECTIONS"]).optional().default("PUBLIC").describe("Who can see the post"),
      }),
    },
  ],
  GMAIL: [
    {
      actionName: "GMAIL_SEND_EMAIL",
      description: "Send an email via Gmail",
      parameters: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content (plain text or HTML)"),
      }),
    },
    {
      actionName: "GMAIL_SEARCH_EMAILS",
      description: "Search emails in Gmail by query",
      parameters: z.object({
        query: z.string().describe("Gmail search query (e.g., 'from:company subject:interview')"),
        max_results: z.number().optional().default(10).describe("Maximum number of results"),
      }),
    },
  ],
  GITHUB: [
    {
      actionName: "GITHUB_LIST_REPOS",
      description: "List repositories for a user or organization on GitHub",
      parameters: z.object({
        username: z.string().optional().describe("GitHub username"),
        org: z.string().optional().describe("GitHub organization name"),
        sort: z.enum(["updated", "stars", "forks"]).optional().describe("Sort order"),
      }),
    },
    {
      actionName: "GITHUB_GET_REPO",
      description: "Get details about a specific GitHub repository",
      parameters: z.object({
        owner: z.string().describe("Repository owner (user or org)"),
        repo: z.string().describe("Repository name"),
      }),
    },
    {
      actionName: "GITHUB_SEARCH_CODE",
      description: "Search for code across GitHub repositories",
      parameters: z.object({
        query: z.string().describe("Code search query"),
        language: z.string().optional().describe("Programming language filter"),
      }),
    },
  ],
  GOOGLE_SHEETS: [
    {
      actionName: "GOOGLESHEETS_CREATE_SPREADSHEET",
      description: "Create a new Google Sheets spreadsheet",
      parameters: z.object({
        title: z.string().describe("Spreadsheet title"),
      }),
    },
    {
      actionName: "GOOGLESHEETS_ADD_ROWS",
      description: "Add rows of data to a Google Sheets spreadsheet",
      parameters: z.object({
        spreadsheet_id: z.string().describe("The spreadsheet ID"),
        sheet_name: z.string().optional().default("Sheet1").describe("Sheet name"),
        rows: z.array(z.array(z.string())).describe("Rows of data to add"),
      }),
    },
  ],
  GOOGLE_CALENDAR: [
    {
      actionName: "GOOGLECALENDAR_CREATE_EVENT",
      description: "Create a new event in Google Calendar",
      parameters: z.object({
        title: z.string().describe("Event title"),
        start_time: z.string().describe("Start time (ISO 8601)"),
        end_time: z.string().describe("End time (ISO 8601)"),
        description: z.string().optional().describe("Event description"),
      }),
    },
    {
      actionName: "GOOGLECALENDAR_LIST_EVENTS",
      description: "List upcoming events from Google Calendar",
      parameters: z.object({
        max_results: z.number().optional().default(10).describe("Maximum number of events"),
        time_min: z.string().optional().describe("Start of time range (ISO 8601)"),
      }),
    },
  ],
};

/**
 * Execute a Composio action via REST API.
 */
async function executeAction(
  apiKey: string,
  actionName: string,
  entityId: string,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = `${COMPOSIO_API_BASE}/actions/${actionName}/execute`;

  console.log(`[Composio] Executing ${actionName} for entity ${entityId}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      entityId,
      input: params,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    console.error(`[Composio] ${actionName} failed (${res.status}): ${errText}`);
    throw new Error(`Composio action ${actionName} failed: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  console.log(`[Composio] ${actionName} succeeded`);

  // Composio returns { data, error, successfull }
  if (data.error) {
    throw new Error(`Composio action ${actionName}: ${data.error}`);
  }

  return data.data || data;
}

/**
 * Get Composio tools for a specific agent as Vercel AI SDK tool objects.
 * Only returns tools relevant to the agent's use case.
 */
export function getComposioToolsForAgent(
  apiKey: string,
  userId: string,
  agentSlug: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { tools: Record<string, any>; toolNames: string[] } {
  const allowedApps = AGENT_APPS[agentSlug];
  if (!allowedApps) {
    return { tools: {}, toolNames: [] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};
  const toolNames: string[] = [];

  for (const appName of allowedApps) {
    const actions = APP_ACTIONS[appName];
    if (!actions) continue;

    for (const action of actions) {
      const toolName = `composio_${action.actionName.toLowerCase()}`;
      toolNames.push(toolName);

      tools[toolName] = {
        description: action.description,
        parameters: action.parameters,
        execute: async (params: z.infer<typeof action.parameters>) => {
          return executeAction(apiKey, action.actionName, userId, params as Record<string, unknown>);
        },
      };
    }
  }

  if (toolNames.length > 0) {
    console.log(`[Composio] Created ${toolNames.length} tools for "${agentSlug}": ${toolNames.join(", ")}`);
  }

  return { tools, toolNames };
}

/**
 * Check if an agent has any Composio tools available.
 */
export function agentHasComposioTools(agentSlug: string): boolean {
  return agentSlug in AGENT_APPS;
}
