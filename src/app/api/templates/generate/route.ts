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
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { slug, formValues, batchSize } = body;
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

  const count = Math.min(batchSize || 5, 20);

  // Build prompt based on template type
  let systemPrompt: string;
  let userPrompt: string;

  if (slug === "linkedin-outreach") {
    systemPrompt = `You are an expert LinkedIn outreach specialist. You generate highly personalized, professional connection messages that get responses. Each message must feel genuinely researched and human — never generic or spammy.

You always return valid JSON and nothing else.`;

    const targetUrl = formValues["Target Profile URL"] || "";
    const objective = formValues["Outreach Objective"] || "";

    userPrompt = `Generate ${count} personalized LinkedIn outreach drafts.

Target/Context: ${targetUrl}
Outreach Objective: ${objective}

For each draft, create a realistic prospect with:
- A plausible full name
- A company name
- Their initials (first letter of first + last name)
- A personalized outreach message (2-3 sentences, professional but warm, referencing something specific about them or their company)

Return a JSON array with exactly ${count} objects, each having:
{
  "initials": "XX",
  "name": "Full Name",
  "company": "Company Name",
  "preview": "The personalized message draft"
}

Return ONLY the JSON array, no other text.`;
  } else if (slug === "market-analysis") {
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

    const rows = drafts.slice(0, count).map(
      (
        d: { initials?: string; name?: string; company?: string; preview?: string },
        i: number
      ) => ({
        initials: (d.initials || "??").slice(0, 2).toUpperCase(),
        name: d.name || `Draft ${i + 1}`,
        company: d.company || "",
        preview: d.preview || "",
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
