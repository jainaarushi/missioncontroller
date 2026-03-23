import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserAIConfig } from "@/lib/ai/get-user-key";
import {
  createUserOpenAI,
  createUserGemini,
  createUserAnthropic,
  PROVIDER_MODELS,
} from "@/lib/ai/client";
import { generateText } from "ai";
import { rateLimit } from "@/lib/rate-limit";

/** Extract LinkedIn usernames from a block of text (one URL per line, or mixed with CSV noise). */
function parseLinkedInProfiles(raw: string): { url: string; username: string }[] {
  const lines = raw.split(/[\n,]/).map((s) => s.trim().replace(/^["']|["']$/g, ""));
  const profiles: { url: string; username: string }[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const match = line.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const username = match[1].toLowerCase();
      if (!seen.has(username)) {
        seen.add(username);
        profiles.push({
          url: line.startsWith("http") ? line.split("?")[0] : `https://www.linkedin.com/in/${username}`,
          username,
        });
      }
    }
  }
  return profiles;
}

/** Turn a LinkedIn username slug into a display name guess. */
function usernameToName(username: string): string {
  return username
    .replace(/-/g, " ")
    .replace(/\d+$/, "")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json(
      { error: "Sign in to generate drafts" },
      { status: 401 }
    );
  }

  const rl = rateLimit(`tmpl-gen:${user.id}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429 }
    );
  }

  let body: {
    slug?: string;
    formValues?: Record<string, string>;
    batchSize?: number;
    regenerateIndex?: number;
    profiles?: { url: string; username: string }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { slug, formValues } = body;
  if (!slug || !formValues) {
    return NextResponse.json(
      { error: "slug and formValues are required" },
      { status: 400 }
    );
  }

  const aiConfig = await getUserAIConfig(user.id);
  if (!aiConfig) {
    return NextResponse.json(
      { error: "Add your API key in Settings first" },
      { status: 402 }
    );
  }

  // Build prompt based on template type
  let systemPrompt: string;
  let userPrompt: string;

  if (slug === "linkedin-outreach") {
    // Parse real profile URLs from the input
    const profileInput = formValues["Target LinkedIn Profiles"] || "";
    let profiles = parseLinkedInProfiles(profileInput);

    // If regenerating a single row, the caller passes the specific profile
    if (body.profiles && body.profiles.length > 0) {
      profiles = body.profiles;
    }

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: "No valid LinkedIn profile URLs found. Paste URLs like https://linkedin.com/in/username" },
        { status: 400 }
      );
    }

    // Cap at 20 profiles per request
    profiles = profiles.slice(0, 20);

    const objective = formValues["Outreach Objective"] || "";

    systemPrompt = `You are an expert LinkedIn outreach specialist. You generate highly personalized, professional connection messages that get responses. Each message must feel genuinely researched and human — never generic or spammy.

You always return valid JSON and nothing else.`;

    const profileList = profiles
      .map((p, i) => `${i + 1}. Name: "${usernameToName(p.username)}" | Profile: ${p.url}`)
      .join("\n");

    userPrompt = `Generate a personalized LinkedIn outreach message for EACH of these specific people:

${profileList}

Outreach Objective: ${objective}

For each person, create a warm, professional outreach message (2-3 sentences) that:
- Addresses them by their actual name (derived from their LinkedIn profile URL above)
- Focuses on the outreach objective — do NOT guess or make up their company, title, or school
- For the "company" field, just put "LinkedIn" since we only have their profile URL
- Feels personal, not templated

Return a JSON array with exactly ${profiles.length} objects (one per profile, in the same order), each having:
{
  "initials": "XX",
  "name": "Their Full Name",
  "company": "LinkedIn",
  "preview": "The personalized outreach message",
  "profileUrl": "their linkedin URL from above"
}

Return ONLY the JSON array, no other text.`;
  } else if (slug === "market-analysis") {
    const count = Math.min(body.batchSize || 5, 20);

    systemPrompt = `You are a market research analyst. You generate structured analysis sections with data-driven insights. Each section should be substantive and actionable.

You always return valid JSON and nothing else.`;

    const market = formValues["Company or Market"] || "";
    const focus = formValues["Analysis Focus"] || "";

    userPrompt = `Generate ${count} analysis sections for a market research report.

Market/Company: ${market}
Analysis Focus: ${focus}

For each section, create:
- A section title (e.g. "Market Overview", "Competitor Analysis", "Financial Projections", "Risk Assessment", "Growth Drivers")
- A category label (e.g. "Industry", "Analysis", "Projections", "Strategy")
- Initials based on the section title
- A preview of the analysis content (2-3 sentences with specific data points, percentages, or projections)

Return a JSON array with exactly ${count} objects, each having:
{
  "initials": "XX",
  "name": "Section Title",
  "company": "Category",
  "preview": "The analysis content preview"
}

Return ONLY the JSON array, no other text.`;
  } else {
    const count = Math.min(body.batchSize || 5, 20);

    systemPrompt = `You are an AI assistant that generates structured draft content. You always return valid JSON and nothing else.`;

    const inputs = Object.entries(formValues)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    userPrompt = `Generate ${count} content drafts based on these inputs:

${inputs}

Return a JSON array with exactly ${count} objects, each having:
{
  "initials": "XX",
  "name": "Item Title",
  "company": "Category",
  "preview": "The draft content (2-3 sentences)"
}

Return ONLY the JSON array, no other text.`;
  }

  try {
    const { provider, apiKey } = aiConfig;
    const modelId = PROVIDER_MODELS[provider].fast;

    let model;
    switch (provider) {
      case "openai":
        model = createUserOpenAI(apiKey)(modelId);
        break;
      case "gemini":
        model = createUserGemini(apiKey)(modelId);
        break;
      case "anthropic":
        model = createUserAnthropic(apiKey)(modelId);
        break;
    }

    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    });

    // Parse JSON from response — handle markdown code blocks
    let text = result.text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const drafts = JSON.parse(text);

    if (!Array.isArray(drafts)) {
      return NextResponse.json(
        { error: "AI returned invalid format" },
        { status: 500 }
      );
    }

    // Assign colors to each draft
    const colors = [
      { bg: "bg-[#ece0d6]", text: "text-[#635b53]" },
      { bg: "bg-[#e1dfff]", text: "text-[#3028e9]" },
      { bg: "bg-[#76ff65]", text: "text-[#006c05]" },
      { bg: "bg-[#dbeafe]", text: "text-[#1e40af]" },
      { bg: "bg-[#dcfce7]", text: "text-[#166534]" },
      { bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
      { bg: "bg-[#fce7f3]", text: "text-[#9d174d]" },
      { bg: "bg-[#e0e7ff]", text: "text-[#3730a3]" },
      { bg: "bg-[#ccfbf1]", text: "text-[#065f46]" },
      { bg: "bg-gray-200", text: "text-gray-600" },
    ];

    const rows = drafts.map(
      (
        d: { initials?: string; name?: string; company?: string; preview?: string; profileUrl?: string },
        i: number
      ) => ({
        initials: (d.initials || "??").slice(0, 2).toUpperCase(),
        name: d.name || `Draft ${i + 1}`,
        company: d.company || "",
        preview: d.preview || "",
        profileUrl: d.profileUrl || "",
        status: "ready",
        avatarBg: colors[i % colors.length].bg,
        avatarText: colors[i % colors.length].text,
      })
    );

    return NextResponse.json({ drafts: rows });
  } catch (err) {
    console.error("Template generation error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate drafts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
