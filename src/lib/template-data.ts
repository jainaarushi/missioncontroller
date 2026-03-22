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
        label: "Target Profile URL",
        type: "text",
        placeholder: "https://linkedin.com/in/username",
        hint: "Paste a direct profile or a LinkedIn search result URL.",
      },
      {
        label: "Outreach Objective",
        type: "textarea",
        placeholder:
          "e.g. Schedule a demo for our new AI tool, or network with CTOs in Fintech...",
      },
      {
        label: "Batch Size",
        type: "range",
        min: 1,
        max: 100,
        defaultValue: 25,
        unit: "Profiles / day",
        rangeLabels: ["Conservative", "Aggressive"],
      },
    ],
    toolConnections: [
      {
        name: "LinkedIn",
        logo: `https://img.logo.dev/linkedin.com?token=${LOGO_TOKEN}`,
        connected: false,
        statusText: "Disconnected",
      },
      {
        name: "Google Search",
        logo: `https://img.logo.dev/google.com?token=${LOGO_TOKEN}`,
        connected: true,
        statusText: "Connected",
      },
    ],
    composioPowered: true,
    warningText:
      "You must connect your LinkedIn account via Composio before this pipeline can be launched. This ensures the Outreach Agent can perform actions on your behalf.",
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
        initials: "SK",
        name: "Sarah Kendrick",
        company: "Lumina Systems",
        preview:
          '"Hi Sarah, I noticed your recent talk on edge computing at DevCon. It really aligned with our..."',
        status: "ready",
        avatarBg: "bg-[#ece0d6]",
        avatarText: "text-[#635b53]",
      },
      {
        initials: "MJ",
        name: "Marcus Jensen",
        company: "Flowstate Labs",
        preview:
          '"Great post about the Series B funding, Marcus! Flowstate seems to be scaling incredibly fast..."',
        status: "drafting",
        avatarBg: "bg-[#e1dfff]",
        avatarText: "text-[#3028e9]",
      },
      {
        initials: "AL",
        name: "Anita Lowe",
        company: "Cognito AI",
        preview:
          '"Hello Anita, saw your interview on the future of LLMs. Your point about context windows..."',
        status: "ready",
        avatarBg: "bg-[#76ff65]",
        avatarText: "text-[#006c05]",
      },
      {
        initials: "DT",
        name: "David Tan",
        company: "Peak Performance",
        preview:
          "\"Hi David, hope you're having a great week! I've been following Peak Performance's growth...\"",
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
};

export function getTemplate(slug: string): TemplateConfig | null {
  return TEMPLATES[slug] || null;
}
