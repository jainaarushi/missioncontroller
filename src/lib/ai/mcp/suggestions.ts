import type { MCPServerSuggestion } from "./types";

/**
 * Pre-built MCP server suggestions for the Settings UI.
 * These are popular MCP servers that work well with specific agents.
 * Inspired by awesome-llm-apps tool integrations (GitHub, Slack, DBs, CRMs).
 */
export const MCP_SERVER_SUGGESTIONS: MCPServerSuggestion[] = [
  {
    type: "github",
    name: "GitHub",
    description: "Access repos, PRs, issues, and code. Agents can review code, manage issues, and read repo contents.",
    icon: "GH",
    color: "#24292F",
    urlPlaceholder: "https://mcp.github.com/sse",
    authPlaceholder: "GitHub personal access token (ghp_...)",
    authRequired: true,
    recommendedAgents: ["code-reviewer", "debugger", "sprint-planner", "project-planner", "fullstack-developer", "resume-optimizer", "portfolio-builder"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Read channels, send messages, search history. Agents can access team context and post updates.",
    icon: "SL",
    color: "#4A154B",
    urlPlaceholder: "http://localhost:3001/sse",
    authPlaceholder: "Slack Bot Token (xoxb-...)",
    authRequired: true,
    recommendedAgents: ["meeting-notes", "project-planner", "customer-support"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
  },
  {
    type: "postgres",
    name: "PostgreSQL",
    description: "Query your database directly. Agents can analyze data, generate reports, and explore schemas.",
    icon: "PG",
    color: "#336791",
    urlPlaceholder: "http://localhost:3002/sse",
    authPlaceholder: "PostgreSQL connection string",
    authRequired: true,
    recommendedAgents: ["data-analyst", "debugger", "fullstack-developer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
  },
  {
    type: "google-sheets",
    name: "Google Sheets",
    description: "Read and write spreadsheet data. Agents can analyze and update your Google Sheets.",
    icon: "GS",
    color: "#34A853",
    urlPlaceholder: "http://localhost:3003/sse",
    authPlaceholder: "Google service account JSON key",
    authRequired: true,
    recommendedAgents: ["data-analyst", "project-planner", "recruitment-agent", "budget-builder", "retirement-planner", "debt-snowball", "invoice-generator", "grocery-optimizer", "college-savings", "chore-organizer", "client-proposal", "rate-calculator", "meal-prep-planner", "renovation-planner", "moving-coordinator", "wedding-planner", "scholarship-hunter", "college-advisor"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/google-sheets",
  },
  {
    type: "linear",
    name: "Linear",
    description: "Manage issues, projects, and cycles. Agents can create tickets, update status, and plan sprints.",
    icon: "LN",
    color: "#5E6AD2",
    urlPlaceholder: "http://localhost:3004/sse",
    authPlaceholder: "Linear API key (lin_api_...)",
    authRequired: true,
    recommendedAgents: ["sprint-planner", "project-planner", "debugger"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/linear",
  },
  {
    type: "jira",
    name: "Jira",
    description: "Access projects, issues, and boards. Agents can manage tickets and plan sprints.",
    icon: "JR",
    color: "#0052CC",
    urlPlaceholder: "http://localhost:3005/sse",
    authPlaceholder: "Jira API token",
    authRequired: true,
    recommendedAgents: ["sprint-planner", "project-planner", "debugger"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/jira",
  },
  {
    type: "notion",
    name: "Notion",
    description: "Read and write pages, databases. Agents can access your knowledge base and documentation.",
    icon: "NT",
    color: "#000000",
    urlPlaceholder: "http://localhost:3006/sse",
    authPlaceholder: "Notion integration token (secret_...)",
    authRequired: true,
    recommendedAgents: ["meeting-notes", "project-planner", "technical-writer", "chore-organizer", "contract-reviewer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/notion",
  },
  {
    type: "sentry",
    name: "Sentry",
    description: "Access error tracking and performance data. Agents can analyze bugs and diagnose issues.",
    icon: "ST",
    color: "#362D59",
    urlPlaceholder: "http://localhost:3007/sse",
    authPlaceholder: "Sentry auth token",
    authRequired: true,
    recommendedAgents: ["debugger", "code-reviewer", "fullstack-developer"],
    docsUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry",
  },
  {
    type: "browserbase",
    name: "Browserbase",
    description: "Full browser automation. Agents can interact with web apps, fill forms, and extract data from JS-heavy sites.",
    icon: "BB",
    color: "#FF6B00",
    urlPlaceholder: "http://localhost:3008/sse",
    authPlaceholder: "Browserbase API key",
    authRequired: true,
    recommendedAgents: ["web-intel", "competitor-intel", "sales-rep", "job-hunter", "auto-applier", "deal-spotter", "tech-buyer", "flight-deal-hunter", "car-buy-negotiator", "school-chooser", "linkedin-optimizer", "apartment-scout", "gift-finder", "scholarship-hunter", "college-advisor"],
    docsUrl: "https://github.com/browserbase/mcp-server-browserbase",
  },
  {
    type: "gmail",
    name: "Gmail",
    description: "Read, send, and manage emails. Agents can draft replies, search messages, and manage labels.",
    icon: "GM",
    color: "#EA4335",
    urlPlaceholder: "http://localhost:3009/sse",
    authPlaceholder: "Google OAuth token or service account key",
    authRequired: true,
    recommendedAgents: ["email-drafter", "customer-support", "sales-rep", "outbound-strategist", "job-hunter", "auto-applier", "bill-negotiator", "subscription-killer", "invoice-generator", "freelance-bid-writer", "client-proposal", "dispute-fighter", "tenant-rights", "flight-deal-hunter", "networking-coach"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "google-calendar",
    name: "Google Calendar",
    description: "Manage events, check availability, and schedule meetings. Agents can read and create calendar events.",
    icon: "GC",
    color: "#4285F4",
    urlPlaceholder: "http://localhost:3010/sse",
    authPlaceholder: "Google OAuth token or service account key",
    authRequired: true,
    recommendedAgents: ["meeting-notes", "project-planner", "sprint-planner", "wedding-planner", "road-trip-planner", "moving-coordinator"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "stripe",
    name: "Stripe",
    description: "Access payment data, invoices, and subscriptions. Agents can analyze revenue and customer billing.",
    icon: "ST",
    color: "#635BFF",
    urlPlaceholder: "http://localhost:3011/sse",
    authPlaceholder: "Stripe secret key (sk_...)",
    authRequired: true,
    recommendedAgents: ["data-analyst", "personal-finance", "invoice-generator", "subscription-killer", "budget-builder"],
    docsUrl: "https://github.com/stripe/agent-toolkit",
  },
  {
    type: "discord",
    name: "Discord",
    description: "Read messages, manage channels, and interact with communities. Agents can monitor and post to servers.",
    icon: "DC",
    color: "#5865F2",
    urlPlaceholder: "http://localhost:3012/sse",
    authPlaceholder: "Discord bot token",
    authRequired: true,
    recommendedAgents: ["customer-support", "social-media", "reddit-community-builder"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "trello",
    name: "Trello",
    description: "Manage boards, lists, and cards. Agents can organize tasks and track project progress.",
    icon: "TR",
    color: "#0052CC",
    urlPlaceholder: "http://localhost:3013/sse",
    authPlaceholder: "Trello API key + token",
    authRequired: true,
    recommendedAgents: ["project-planner", "sprint-planner", "scrum-master"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "asana",
    name: "Asana",
    description: "Manage projects, tasks, and team workflows. Agents can create and update work items.",
    icon: "AS",
    color: "#F06A6A",
    urlPlaceholder: "http://localhost:3014/sse",
    authPlaceholder: "Asana personal access token",
    authRequired: true,
    recommendedAgents: ["project-planner", "sprint-planner", "scrum-master"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "figma",
    name: "Figma",
    description: "Access design files, components, and comments. Agents can review designs and extract specs.",
    icon: "FG",
    color: "#F24E1E",
    urlPlaceholder: "http://localhost:3015/sse",
    authPlaceholder: "Figma personal access token",
    authRequired: true,
    recommendedAgents: ["ui-designer", "ux-designer", "frontend-developer", "portfolio-builder"],
    docsUrl: "https://github.com/nicholasgriffintn/mcp-figma",
  },
  {
    type: "twitter",
    name: "X / Twitter",
    description: "Read timelines, post tweets, and analyze engagement. Agents can manage your social presence.",
    icon: "X",
    color: "#000000",
    urlPlaceholder: "http://localhost:3016/sse",
    authPlaceholder: "Twitter API bearer token",
    authRequired: true,
    recommendedAgents: ["social-media", "twitter-engager", "growth-hacker", "tiktok-strategist"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "gitlab",
    name: "GitLab",
    description: "Access repos, merge requests, pipelines, and issues. Full GitLab project management.",
    icon: "GL",
    color: "#FC6D26",
    urlPlaceholder: "http://localhost:3017/sse",
    authPlaceholder: "GitLab personal access token",
    authRequired: true,
    recommendedAgents: ["code-reviewer", "debugger", "fullstack-developer", "devops-agent"],
    docsUrl: "https://gitlab.com/gitlab-org/editor-extensions/gitlab-mcp-server",
  },
  {
    type: "calendly",
    name: "Calendly",
    description: "Manage scheduling links, events, and availability. Agents can check bookings and set up meetings.",
    icon: "CL",
    color: "#006BFF",
    urlPlaceholder: "http://localhost:3018/sse",
    authPlaceholder: "Calendly personal access token",
    authRequired: true,
    recommendedAgents: ["meeting-notes", "sales-rep", "recruitment-agent", "networking-coach"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "posthog",
    name: "PostHog",
    description: "Access product analytics, feature flags, and session recordings. Agents can analyze user behavior.",
    icon: "PH",
    color: "#F9BD2B",
    urlPlaceholder: "http://localhost:3019/sse",
    authPlaceholder: "PostHog personal API key",
    authRequired: true,
    recommendedAgents: ["data-analyst", "product-manager", "growth-hacker"],
    docsUrl: "https://github.com/PostHog/posthog-mcp",
  },
  {
    type: "snowflake",
    name: "Snowflake",
    description: "Query your data warehouse. Agents can run SQL, analyze large datasets, and build reports.",
    icon: "SF",
    color: "#29B5E8",
    urlPlaceholder: "http://localhost:3020/sse",
    authPlaceholder: "Snowflake account credentials",
    authRequired: true,
    recommendedAgents: ["data-analyst", "data-engineer", "investment-analyst"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "intercom",
    name: "Intercom",
    description: "Access conversations, contacts, and help articles. Agents can assist with customer support workflows.",
    icon: "IC",
    color: "#286EFA",
    urlPlaceholder: "http://localhost:3021/sse",
    authPlaceholder: "Intercom access token",
    authRequired: true,
    recommendedAgents: ["customer-support", "support-responder", "sales-rep"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "telegram",
    name: "Telegram",
    description: "Send and read messages in Telegram groups and channels. Agents can manage community interactions.",
    icon: "TG",
    color: "#26A5E4",
    urlPlaceholder: "http://localhost:3022/sse",
    authPlaceholder: "Telegram bot token (from @BotFather)",
    authRequired: true,
    recommendedAgents: ["social-media", "customer-support"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "whatsapp",
    name: "WhatsApp",
    description: "Send messages and manage conversations via WhatsApp Business. Agents can handle customer chats.",
    icon: "WA",
    color: "#25D366",
    urlPlaceholder: "http://localhost:3023/sse",
    authPlaceholder: "WhatsApp Business API token",
    authRequired: true,
    recommendedAgents: ["customer-support", "sales-rep"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "zendesk",
    name: "Zendesk",
    description: "Access tickets, knowledge base, and customer data. Agents can manage support workflows.",
    icon: "ZD",
    color: "#03363D",
    urlPlaceholder: "http://localhost:3024/sse",
    authPlaceholder: "Zendesk API token",
    authRequired: true,
    recommendedAgents: ["customer-support", "support-responder"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "shopify",
    name: "Shopify",
    description: "Access products, orders, and store data. Agents can manage inventory and analyze sales.",
    icon: "SH",
    color: "#96BF48",
    urlPlaceholder: "http://localhost:3025/sse",
    authPlaceholder: "Shopify Admin API access token",
    authRequired: true,
    recommendedAgents: ["data-analyst", "deal-spotter", "growth-hacker"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "supabase",
    name: "Supabase",
    description: "Access your Supabase database, auth, and storage. Agents can query data and manage resources.",
    icon: "SB",
    color: "#3ECF8E",
    urlPlaceholder: "http://localhost:3026/sse",
    authPlaceholder: "Supabase service role key",
    authRequired: true,
    recommendedAgents: ["fullstack-developer", "data-analyst", "debugger"],
    docsUrl: "https://github.com/supabase-community/supabase-mcp",
  },
  {
    type: "firebase",
    name: "Firebase",
    description: "Access Firestore, Auth, and Cloud Functions. Agents can query data and manage Firebase services.",
    icon: "FB",
    color: "#FFCA28",
    urlPlaceholder: "http://localhost:3027/sse",
    authPlaceholder: "Firebase service account JSON key",
    authRequired: true,
    recommendedAgents: ["fullstack-developer", "mobile-app-builder", "debugger"],
    docsUrl: "https://github.com/nicholasgriffintn/mcp-firebase",
  },
  {
    type: "confluence",
    name: "Confluence",
    description: "Access pages, spaces, and team documentation. Agents can search and update your knowledge base.",
    icon: "CF",
    color: "#1868DB",
    urlPlaceholder: "http://localhost:3028/sse",
    authPlaceholder: "Atlassian API token",
    authRequired: true,
    recommendedAgents: ["technical-writer", "meeting-notes", "project-planner"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "airtable",
    name: "Airtable",
    description: "Read and write Airtable bases. Agents can manage records, views, and automate data workflows.",
    icon: "AT",
    color: "#18BFFF",
    urlPlaceholder: "http://localhost:3029/sse",
    authPlaceholder: "Airtable personal access token",
    authRequired: true,
    recommendedAgents: ["data-analyst", "project-planner", "recruitment-agent"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "monday",
    name: "Monday.com",
    description: "Manage boards, items, and workflows. Agents can track projects and update work status.",
    icon: "MN",
    color: "#FF3D57",
    urlPlaceholder: "http://localhost:3030/sse",
    authPlaceholder: "Monday.com API token",
    authRequired: true,
    recommendedAgents: ["project-planner", "sprint-planner", "scrum-master"],
    docsUrl: "https://github.com/modelcontextprotocol/servers",
  },
  {
    type: "composio",
    name: "Composio (LinkedIn, Gmail, Google, GitHub)",
    description: "Connect your accounts to give agents access to real data from LinkedIn, Gmail, Google Sheets, and more. Platform-managed OAuth.",
    icon: "CO",
    color: "#6C5CE7",
    urlPlaceholder: "https://backend.composio.dev/v3/mcp/...",
    authPlaceholder: "Composio API key",
    authRequired: true,
    recommendedAgents: ["job-hunter", "auto-applier", "linkedin-optimizer", "email-drafter", "networking-coach", "resume-optimizer", "interview-coach", "salary-negotiator", "career-pivoter", "remote-job-finder"],
    docsUrl: "https://docs.composio.dev/mcp/overview",
  },
  {
    type: "custom",
    name: "Custom Server",
    description: "Connect any MCP-compatible server. Provide the Streamable HTTP or SSE endpoint URL.",
    icon: "MCP",
    color: "#6366F1",
    urlPlaceholder: "https://your-server.com/mcp or http://localhost:PORT/sse",
    authPlaceholder: "Auth token (optional)",
    authRequired: false,
    recommendedAgents: [],
    docsUrl: "https://modelcontextprotocol.io/docs",
  },
];

export function getSuggestionForType(type: string): MCPServerSuggestion | undefined {
  return MCP_SERVER_SUGGESTIONS.find(s => s.type === type);
}

/**
 * Agents that strongly benefit from MCP — running them without MCP
 * produces generic output. Returns the recommended MCP server types
 * and a user-facing message explaining what MCP would unlock.
 */
export interface MCPRecommendation {
  serverTypes: string[];
  serverNames: string[];
  message: string;
  settingsHint: string;
}

const AGENT_MCP_RECOMMENDATIONS: Record<string, MCPRecommendation> = {
  // ── Dev tools ──
  "code-reviewer": {
    serverTypes: ["github", "gitlab"],
    serverNames: ["GitHub", "GitLab"],
    message: "Connect your GitHub or GitLab to review actual PRs, diffs, and repo code instead of generic advice.",
    settingsHint: "Add a GitHub or GitLab MCP server in Settings → Integrations.",
  },
  "debugger": {
    serverTypes: ["github", "sentry", "gitlab"],
    serverNames: ["GitHub", "Sentry", "GitLab"],
    message: "Connect GitHub/GitLab and Sentry to pull real error logs, stack traces, and code context.",
    settingsHint: "Add GitHub, GitLab, or Sentry MCP servers in Settings → Integrations.",
  },
  "fullstack-developer": {
    serverTypes: ["github", "gitlab", "supabase", "firebase"],
    serverNames: ["GitHub", "GitLab", "Supabase", "Firebase"],
    message: "Connect your repos and backend to get contextualized development help.",
    settingsHint: "Add GitHub, Supabase, or Firebase MCP servers in Settings → Integrations.",
  },
  "devops-agent": {
    serverTypes: ["github", "gitlab", "sentry"],
    serverNames: ["GitHub", "GitLab", "Sentry"],
    message: "Connect your repos and error tracking for real CI/CD and infrastructure management.",
    settingsHint: "Add GitHub, GitLab, or Sentry MCP servers in Settings → Integrations.",
  },

  // ── Project management ──
  "sprint-planner": {
    serverTypes: ["linear", "jira", "trello", "asana", "monday"],
    serverNames: ["Linear", "Jira", "Trello", "Asana", "Monday.com"],
    message: "Connect your project tracker to read the real backlog and plan sprints with actual tickets.",
    settingsHint: "Add a project management MCP server in Settings → Integrations.",
  },
  "project-planner": {
    serverTypes: ["linear", "jira", "notion", "trello", "asana", "monday"],
    serverNames: ["Linear", "Jira", "Notion", "Trello", "Asana", "Monday.com"],
    message: "Connect your project management tools to create plans based on real project data.",
    settingsHint: "Add a project management MCP server in Settings → Integrations.",
  },
  "scrum-master": {
    serverTypes: ["linear", "jira", "trello", "asana", "monday"],
    serverNames: ["Linear", "Jira", "Trello", "Asana", "Monday.com"],
    message: "Connect your task tracker to manage real sprints, standups, and retrospectives.",
    settingsHint: "Add a project management MCP server in Settings → Integrations.",
  },

  // ── Communication & support ──
  "customer-support": {
    serverTypes: ["slack", "zendesk", "intercom", "discord"],
    serverNames: ["Slack", "Zendesk", "Intercom", "Discord"],
    message: "Connect your support channels to access real customer conversations and ticket history.",
    settingsHint: "Add Slack, Zendesk, or Intercom MCP servers in Settings → Integrations.",
  },
  "support-responder": {
    serverTypes: ["zendesk", "intercom", "slack"],
    serverNames: ["Zendesk", "Intercom", "Slack"],
    message: "Connect your help desk to draft responses based on real ticket context.",
    settingsHint: "Add a Zendesk or Intercom MCP server in Settings → Integrations.",
  },
  "meeting-notes": {
    serverTypes: ["slack", "notion", "google-calendar", "confluence"],
    serverNames: ["Slack", "Notion", "Google Calendar", "Confluence"],
    message: "Connect your calendar and docs to pull meeting context, attendees, and prior notes.",
    settingsHint: "Add Slack, Notion, or Google Calendar MCP servers in Settings → Integrations.",
  },
  "email-drafter": {
    serverTypes: ["gmail"],
    serverNames: ["Gmail"],
    message: "Connect Gmail to draft and send emails directly from the agent.",
    settingsHint: "Add a Gmail MCP server in Settings → Integrations.",
  },

  // ── Data & analytics ──
  "data-analyst": {
    serverTypes: ["postgres", "google-sheets", "snowflake", "airtable", "posthog", "supabase"],
    serverNames: ["PostgreSQL", "Google Sheets", "Snowflake", "Airtable", "PostHog", "Supabase"],
    message: "Connect your database or spreadsheets to analyze real data instead of just uploaded files.",
    settingsHint: "Add a data source MCP server in Settings → Integrations.",
  },
  "data-engineer": {
    serverTypes: ["postgres", "snowflake", "supabase", "firebase"],
    serverNames: ["PostgreSQL", "Snowflake", "Supabase", "Firebase"],
    message: "Connect your databases for real schema analysis, query optimization, and pipeline design.",
    settingsHint: "Add a database MCP server in Settings → Integrations.",
  },
  "product-manager": {
    serverTypes: ["posthog", "linear", "jira", "notion"],
    serverNames: ["PostHog", "Linear", "Jira", "Notion"],
    message: "Connect analytics and project tools for data-driven product decisions.",
    settingsHint: "Add PostHog or a project management MCP server in Settings → Integrations.",
  },

  // ── Sales & CRM ──
  "sales-rep": {
    serverTypes: ["hubspot", "salesforce", "gmail", "calendly"],
    serverNames: ["HubSpot", "Salesforce", "Gmail", "Calendly"],
    message: "Connect your CRM and email to pull real prospect data and schedule follow-ups.",
    settingsHint: "Add HubSpot, Salesforce, or Gmail MCP servers in Settings → Integrations.",
  },
  "outbound-strategist": {
    serverTypes: ["hubspot", "salesforce", "gmail"],
    serverNames: ["HubSpot", "Salesforce", "Gmail"],
    message: "Connect your CRM and email to automate real outbound sequences.",
    settingsHint: "Add HubSpot or Gmail MCP servers in Settings → Integrations.",
  },
  "recruitment-agent": {
    serverTypes: ["google-sheets", "notion", "airtable", "gmail"],
    serverNames: ["Google Sheets", "Notion", "Airtable", "Gmail"],
    message: "Connect your ATS or spreadsheets to manage real candidate pipelines.",
    settingsHint: "Add Google Sheets, Notion, or Airtable MCP servers in Settings → Integrations.",
  },

  // ── Design ──
  "ui-designer": {
    serverTypes: ["figma"],
    serverNames: ["Figma"],
    message: "Connect Figma to review actual design files, extract specs, and suggest improvements.",
    settingsHint: "Add a Figma MCP server in Settings → Integrations.",
  },
  "ux-designer": {
    serverTypes: ["figma"],
    serverNames: ["Figma"],
    message: "Connect Figma to analyze your design system and provide UX recommendations.",
    settingsHint: "Add a Figma MCP server in Settings → Integrations.",
  },

  // ── Social & growth ──
  "social-media": {
    serverTypes: ["twitter", "discord", "telegram"],
    serverNames: ["X/Twitter", "Discord", "Telegram"],
    message: "Connect your social platforms to manage posts and analyze engagement.",
    settingsHint: "Add Twitter, Discord, or Telegram MCP servers in Settings → Integrations.",
  },
  "twitter-engager": {
    serverTypes: ["twitter"],
    serverNames: ["X/Twitter"],
    message: "Connect X/Twitter to read timelines, post tweets, and engage with your audience.",
    settingsHint: "Add a Twitter MCP server in Settings → Integrations.",
  },
  "growth-hacker": {
    serverTypes: ["posthog", "twitter", "shopify"],
    serverNames: ["PostHog", "X/Twitter", "Shopify"],
    message: "Connect analytics and social platforms for data-driven growth strategies.",
    settingsHint: "Add PostHog, Twitter, or Shopify MCP servers in Settings → Integrations.",
  },

  // ── Writing & docs ──
  "technical-writer": {
    serverTypes: ["notion", "confluence", "github"],
    serverNames: ["Notion", "Confluence", "GitHub"],
    message: "Connect your documentation platform to write and update real docs.",
    settingsHint: "Add Notion, Confluence, or GitHub MCP servers in Settings → Integrations.",
  },

  // ── Web & scraping ──
  "web-intel": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase for full browser automation to scrape JS-heavy sites.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },
  "competitor-intel": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to scrape competitor websites and extract real-time data.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },

  // ── E-commerce ──
  "deal-spotter": {
    serverTypes: ["browserbase", "shopify"],
    serverNames: ["Browserbase", "Shopify"],
    message: "Connect Browserbase to scrape live prices, or Shopify to analyze your store data.",
    settingsHint: "Add Browserbase or Shopify MCP servers in Settings → Integrations.",
  },
  "tech-buyer": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to extract specs and prices from review sites and retailers.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },

  // ── Template pipeline agents ──
  "job-hunter": {
    serverTypes: ["browserbase", "gmail"],
    serverNames: ["Browserbase", "Gmail"],
    message: "Connect Browserbase to scrape JS-heavy job boards, or Gmail to send applications directly.",
    settingsHint: "Add Browserbase or Gmail MCP servers in Settings → Integrations.",
  },
  "auto-applier": {
    serverTypes: ["browserbase", "gmail"],
    serverNames: ["Browserbase", "Gmail"],
    message: "Connect Browserbase to fill out applications, or Gmail to send cover letters.",
    settingsHint: "Add Browserbase or Gmail MCP servers in Settings → Integrations.",
  },
  "resume-optimizer": {
    serverTypes: ["github"],
    serverNames: ["GitHub"],
    message: "Connect GitHub to pull your actual repos and contributions for a more accurate resume.",
    settingsHint: "Add a GitHub MCP server in Settings → Integrations.",
  },
  "portfolio-builder": {
    serverTypes: ["github", "figma"],
    serverNames: ["GitHub", "Figma"],
    message: "Connect GitHub for repos or Figma for design work to showcase in your portfolio.",
    settingsHint: "Add GitHub or Figma MCP servers in Settings → Integrations.",
  },
  "linkedin-optimizer": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to analyze your current LinkedIn profile and competitor profiles.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },
  "networking-coach": {
    serverTypes: ["gmail", "calendly"],
    serverNames: ["Gmail", "Calendly"],
    message: "Connect Gmail for outreach drafts or Calendly to schedule networking meetings.",
    settingsHint: "Add Gmail or Calendly MCP servers in Settings → Integrations.",
  },

  // Finance templates
  "subscription-killer": {
    serverTypes: ["stripe", "gmail"],
    serverNames: ["Stripe", "Gmail"],
    message: "Connect Stripe to see real subscriptions, or Gmail to find subscription confirmation emails.",
    settingsHint: "Add Stripe or Gmail MCP servers in Settings → Integrations.",
  },
  "bill-negotiator": {
    serverTypes: ["gmail"],
    serverNames: ["Gmail"],
    message: "Connect Gmail to find your actual bills and draft negotiation emails.",
    settingsHint: "Add a Gmail MCP server in Settings → Integrations.",
  },
  "budget-builder": {
    serverTypes: ["google-sheets", "stripe"],
    serverNames: ["Google Sheets", "Stripe"],
    message: "Connect Google Sheets to export your budget, or Stripe to analyze real spending.",
    settingsHint: "Add Google Sheets or Stripe MCP servers in Settings → Integrations.",
  },
  "retirement-planner": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to create a live retirement projection spreadsheet.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },
  "invoice-generator": {
    serverTypes: ["stripe", "gmail", "google-sheets"],
    serverNames: ["Stripe", "Gmail", "Google Sheets"],
    message: "Connect Stripe for payment data, Gmail to send invoices, or Sheets to track them.",
    settingsHint: "Add Stripe, Gmail, or Google Sheets MCP servers in Settings → Integrations.",
  },
  "debt-snowball": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to create a live debt payoff tracker spreadsheet.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },

  // Shopping templates
  "car-buy-negotiator": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to pull real dealer inventory and pricing data.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },
  "grocery-optimizer": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to export your optimized shopping list to a shareable spreadsheet.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },
  "gift-finder": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to scrape real prices and availability from gift retailers.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },

  // Travel templates
  "flight-deal-hunter": {
    serverTypes: ["browserbase", "gmail"],
    serverNames: ["Browserbase", "Gmail"],
    message: "Connect Browserbase to scrape live flight prices, or Gmail to set up deal alerts.",
    settingsHint: "Add Browserbase or Gmail MCP servers in Settings → Integrations.",
  },
  "wedding-planner": {
    serverTypes: ["google-sheets", "google-calendar"],
    serverNames: ["Google Sheets", "Google Calendar"],
    message: "Connect Google Sheets for budget tracking or Calendar for timeline management.",
    settingsHint: "Add Google Sheets or Calendar MCP servers in Settings → Integrations.",
  },
  "road-trip-planner": {
    serverTypes: ["google-calendar"],
    serverNames: ["Google Calendar"],
    message: "Connect Google Calendar to block out your road trip dates automatically.",
    settingsHint: "Add a Google Calendar MCP server in Settings → Integrations.",
  },

  // Parenting templates
  "school-chooser": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to scrape school ratings from GreatSchools and Niche.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },
  "college-savings": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to create a live college savings projection tracker.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },
  "chore-organizer": {
    serverTypes: ["google-sheets", "notion"],
    serverNames: ["Google Sheets", "Notion"],
    message: "Connect Google Sheets or Notion to create a shareable family chore chart.",
    settingsHint: "Add Google Sheets or Notion MCP servers in Settings → Integrations.",
  },

  // Freelance templates
  "freelance-bid-writer": {
    serverTypes: ["gmail"],
    serverNames: ["Gmail"],
    message: "Connect Gmail to send your bid proposal directly to the client.",
    settingsHint: "Add a Gmail MCP server in Settings → Integrations.",
  },
  "client-proposal": {
    serverTypes: ["gmail", "google-sheets"],
    serverNames: ["Gmail", "Google Sheets"],
    message: "Connect Gmail to send proposals, or Sheets to track your pipeline.",
    settingsHint: "Add Gmail or Google Sheets MCP servers in Settings → Integrations.",
  },
  "contract-reviewer": {
    serverTypes: ["notion", "google-sheets"],
    serverNames: ["Notion", "Google Sheets"],
    message: "Connect Notion to store contract notes, or Sheets to track contract terms.",
    settingsHint: "Add Notion or Google Sheets MCP servers in Settings → Integrations.",
  },
  "rate-calculator": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to export your rate calculations to a trackable spreadsheet.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },

  // Legal templates
  "dispute-fighter": {
    serverTypes: ["gmail"],
    serverNames: ["Gmail"],
    message: "Connect Gmail to send dispute letters directly.",
    settingsHint: "Add a Gmail MCP server in Settings → Integrations.",
  },
  "tenant-rights": {
    serverTypes: ["gmail"],
    serverNames: ["Gmail"],
    message: "Connect Gmail to send demand letters to your landlord directly.",
    settingsHint: "Add a Gmail MCP server in Settings → Integrations.",
  },

  // Education templates
  "college-advisor": {
    serverTypes: ["google-sheets", "browserbase"],
    serverNames: ["Google Sheets", "Browserbase"],
    message: "Connect Sheets to track applications, or Browserbase to scrape admission data.",
    settingsHint: "Add Google Sheets or Browserbase MCP servers in Settings → Integrations.",
  },
  "scholarship-hunter": {
    serverTypes: ["browserbase", "google-sheets"],
    serverNames: ["Browserbase", "Google Sheets"],
    message: "Connect Browserbase to scrape scholarship databases, or Sheets to track applications.",
    settingsHint: "Add Browserbase or Google Sheets MCP servers in Settings → Integrations.",
  },

  // Health templates
  "meal-prep-planner": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to export your meal plan and grocery list.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },

  // Housing templates
  "apartment-scout": {
    serverTypes: ["browserbase"],
    serverNames: ["Browserbase"],
    message: "Connect Browserbase to scrape real listings from apartment sites.",
    settingsHint: "Add a Browserbase MCP server in Settings → Integrations.",
  },
  "renovation-planner": {
    serverTypes: ["google-sheets"],
    serverNames: ["Google Sheets"],
    message: "Connect Google Sheets to create a live renovation budget tracker.",
    settingsHint: "Add a Google Sheets MCP server in Settings → Integrations.",
  },
  "moving-coordinator": {
    serverTypes: ["google-sheets", "google-calendar"],
    serverNames: ["Google Sheets", "Google Calendar"],
    message: "Connect Sheets for the moving checklist, or Calendar to schedule moving tasks.",
    settingsHint: "Add Google Sheets or Calendar MCP servers in Settings → Integrations.",
  },
};

/**
 * Check if an agent would benefit from MCP servers that aren't configured.
 * Returns null if no recommendation, or the recommendation if MCP would help.
 */
// When Composio is connected, it covers these server types — suppress recommendations for them
const COMPOSIO_COVERS: Set<string> = new Set(["linkedin", "gmail", "google-sheets", "google-calendar", "github"]);

export function getAgentMCPRecommendation(
  agentSlug: string,
  configuredServerTypes: string[],
): MCPRecommendation | null {
  const rec = AGENT_MCP_RECOMMENDATIONS[agentSlug];
  if (!rec) return null;

  const hasComposio = configuredServerTypes.includes("composio");

  // Check if ANY recommended server type is already configured or covered by Composio
  const hasAny = rec.serverTypes.some(t =>
    configuredServerTypes.includes(t) || (hasComposio && COMPOSIO_COVERS.has(t))
  );
  if (hasAny) return null;

  return rec;
}
