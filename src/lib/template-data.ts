const LOGO_TOKEN = "pk_L7siVlltSTuo-xbA1lvUKA";

export interface PipelineNode {
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export interface ToolConnection {
  name: string;
  logo: string;
  connected: boolean;
  statusText: string;
}

export interface FormField {
  label: string;
  type: "text" | "textarea" | "range";
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  rangeLabels?: [string, string];
}

export interface DraftRow {
  initials: string;
  name: string;
  company: string;
  preview: string;
  status: "ready" | "drafting" | "manual";
  avatarBg: string;
  avatarText: string;
}

export interface BatchRecipient {
  name: string;
  title: string;
  strategy: string;
  status: "delivered" | "sending" | "failed" | "queued";
  companyLogo: string;
}

export interface TemplateConfig {
  slug: string;
  title: string;
  configTitle: string;
  pipelineNodes: PipelineNode[];
  formFields: FormField[];
  toolConnections: ToolConnection[];
  composioPowered: boolean;
  warningText: string;
  // Drafting phase
  draftingAgent: string;
  draftingDescription: string;
  draftPhases: { label: string; status: "done" | "active" | "pending" }[];
  draftRows: DraftRow[];
  // Batch phase
  batchTitle: string;
  batchTag: string;
  batchRecipients: BatchRecipient[];
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  "linkedin-outreach": {
    slug: "linkedin-outreach",
    title: "LinkedIn Outreach",
    configTitle: "Configure LinkedIn Outreach Pipeline",
    pipelineNodes: [
      {
        name: "Research Specialist",
        description: "Scrapes profiles & company data",
        icon: "travel_explore",
        bgColor: "bg-[#008808]",
        textColor: "text-[#f8fff0]",
      },
      {
        name: "Copywriter Agent",
        description: "Drafts personalized messages",
        icon: "edit_note",
        bgColor: "bg-[#4d4bff]",
        textColor: "text-[#e8e6ff]",
      },
      {
        name: "LinkedIn Integration",
        description: "Automates connection requests",
        icon: "bolt",
        bgColor: "bg-[#7c736b]",
        textColor: "text-white",
      },
    ],
    formFields: [
      {
        label: "Target LinkedIn Profiles",
        type: "textarea",
        placeholder:
          "https://linkedin.com/in/johndoe\nhttps://linkedin.com/in/janesmith\n\nPaste one profile URL per line, or upload a CSV below.",
      },
      {
        label: "Outreach Objective",
        type: "textarea",
        placeholder:
          "e.g. Schedule a demo for our new AI tool, or network with CTOs in Fintech...",
      },
    ],
    toolConnections: [
      {
        name: "LinkedIn Cookie",
        logo: `https://img.logo.dev/linkedin.com?token=${LOGO_TOKEN}`,
        connected: false,
        statusText: "Not configured",
      },
      {
        name: "Google Search",
        logo: `https://img.logo.dev/google.com?token=${LOGO_TOKEN}`,
        connected: true,
        statusText: "Connected",
      },
    ],
    composioPowered: false,
    warningText: "",
    // Drafting
    draftingAgent: "Research Strategist",
    draftingDescription:
      "Research Strategist is synthesizing LinkedIn profiles and company news into personalized outreach.",
    draftPhases: [
      { label: "Research", status: "done" },
      { label: "Drafting", status: "active" },
      { label: "Sending", status: "pending" },
    ],
    draftRows: [
      {
        initials: "??",
        name: "Add profile URLs",
        company: "—",
        preview:
          "Paste LinkedIn profile URLs in the config page to generate personalized drafts for real people.",
        status: "manual",
        avatarBg: "bg-gray-200",
        avatarText: "text-gray-600",
      },
    ],
    // Batch
    batchTitle: "LinkedIn Outreach Campaign: Tech Recruiters",
    batchTag: "Sending 12 Approved Drafts",
    batchRecipients: [
      {
        name: "Jane Doe",
        title: "Senior Technical Recruiter @ Stripe",
        strategy: "Personalized Pitch",
        status: "delivered",
        companyLogo: `https://img.logo.dev/stripe.com?token=${LOGO_TOKEN}`,
      },
      {
        name: "Michael Smith",
        title: "Head of Talent @ Vercel",
        strategy: "Project Connection",
        status: "delivered",
        companyLogo: `https://img.logo.dev/vercel.com?token=${LOGO_TOKEN}`,
      },
      {
        name: "Sarah Williams",
        title: "Director of Engineering @ Figma",
        strategy: "Quick Introduction",
        status: "sending",
        companyLogo: `https://img.logo.dev/figma.com?token=${LOGO_TOKEN}`,
      },
      {
        name: "Kevin Brown",
        title: "Founding Engineer @ Linear",
        strategy: "Deep Research",
        status: "failed",
        companyLogo: `https://img.logo.dev/linear.app?token=${LOGO_TOKEN}`,
      },
      {
        name: "Linda Ortega",
        title: "Recruiting Lead @ Atlassian",
        strategy: "Standard Invite",
        status: "queued",
        companyLogo: `https://img.logo.dev/atlassian.com?token=${LOGO_TOKEN}`,
      },
    ],
  },
  "market-analysis": {
    slug: "market-analysis",
    title: "Market Analysis",
    configTitle: "Configure Market Analysis Pipeline",
    pipelineNodes: [
      {
        name: "Research Agent",
        description: "Gathers industry data & trends",
        icon: "query_stats",
        bgColor: "bg-[#6366F1]",
        textColor: "text-[#e8e6ff]",
      },
      {
        name: "Data Analyst",
        description: "Processes numbers & builds models",
        icon: "analytics",
        bgColor: "bg-[#059669]",
        textColor: "text-[#ecfdf5]",
      },
      {
        name: "Strategy Writer",
        description: "Synthesizes into actionable report",
        icon: "description",
        bgColor: "bg-[#D97706]",
        textColor: "text-[#fffbeb]",
      },
    ],
    formFields: [
      {
        label: "Company or Market",
        type: "text",
        placeholder: "e.g. Electric vehicle market in Southeast Asia",
        hint: "Enter a company name, industry, or market segment to analyze.",
      },
      {
        label: "Analysis Focus",
        type: "textarea",
        placeholder:
          "e.g. Identify top 5 competitors, estimate TAM/SAM/SOM, highlight growth drivers and risks...",
      },
      {
        label: "Depth",
        type: "range",
        min: 1,
        max: 5,
        defaultValue: 3,
        unit: "Research depth",
        rangeLabels: ["Quick scan", "Deep dive"],
      },
    ],
    toolConnections: [
      {
        name: "Google Search",
        logo: `https://img.logo.dev/google.com?token=${LOGO_TOKEN}`,
        connected: true,
        statusText: "Connected",
      },
      {
        name: "Yahoo Finance",
        logo: `https://img.logo.dev/yahoo.com?token=${LOGO_TOKEN}`,
        connected: true,
        statusText: "Connected",
      },
    ],
    composioPowered: false,
    warningText:
      "For the best results, add a Tavily API key in Settings to enable live web research. The pipeline works without it using free search.",
    // Drafting
    draftingAgent: "Data Analyst",
    draftingDescription:
      "Data Analyst is pulling financial data, market reports, and competitor filings to build a comprehensive analysis.",
    draftPhases: [
      { label: "Research", status: "done" },
      { label: "Analysis", status: "active" },
      { label: "Report", status: "pending" },
    ],
    draftRows: [
      {
        initials: "EV",
        name: "EV Market Overview",
        company: "Industry",
        preview:
          '"The global EV market reached $388B in 2024, with Southeast Asia emerging as the fastest-growing..."',
        status: "ready",
        avatarBg: "bg-[#dbeafe]",
        avatarText: "text-[#1e40af]",
      },
      {
        initials: "CM",
        name: "Competitor Matrix",
        company: "Analysis",
        preview:
          '"BYD leads with 34% regional share, followed by VinFast (18%) and Hyundai (12%). Key differentiator..."',
        status: "ready",
        avatarBg: "bg-[#dcfce7]",
        avatarText: "text-[#166534]",
      },
      {
        initials: "FM",
        name: "Financial Model",
        company: "Projections",
        preview:
          '"TAM estimated at $42B by 2028 (CAGR 28%). SAM for premium segment: $8.4B. Key assumption..."',
        status: "drafting",
        avatarBg: "bg-[#fef3c7]",
        avatarText: "text-[#92400e]",
      },
      {
        initials: "RS",
        name: "Risk Summary",
        company: "Strategy",
        preview:
          '"Primary risks: (1) Regulatory fragmentation across ASEAN, (2) Charging infrastructure gap..."',
        status: "manual",
        avatarBg: "bg-gray-200",
        avatarText: "text-gray-600",
      },
    ],
    // Batch
    batchTitle: "Market Analysis: EV Sector Southeast Asia",
    batchTag: "Generating 4 Report Sections",
    batchRecipients: [
      {
        name: "Executive Summary",
        title: "C-Suite Brief @ Strategy Team",
        strategy: "High-level Overview",
        status: "delivered",
        companyLogo: `https://img.logo.dev/mckinsey.com?token=${LOGO_TOKEN}`,
      },
      {
        name: "Competitor Deep-Dive",
        title: "Detailed Analysis @ Research Team",
        strategy: "Full Breakdown",
        status: "delivered",
        companyLogo: `https://img.logo.dev/bloomberg.com?token=${LOGO_TOKEN}`,
      },
      {
        name: "Financial Projections",
        title: "TAM/SAM/SOM Model @ Finance Team",
        strategy: "Data-Driven",
        status: "sending",
        companyLogo: `https://img.logo.dev/pitchbook.com?token=${LOGO_TOKEN}`,
      },
      {
        name: "Risk Assessment",
        title: "Risk Matrix @ Compliance Team",
        strategy: "Scenario Analysis",
        status: "queued",
        companyLogo: `https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}`,
      },
    ],
  },
};

export function getTemplate(slug: string): TemplateConfig | null {
  return TEMPLATES[slug] || null;
}
