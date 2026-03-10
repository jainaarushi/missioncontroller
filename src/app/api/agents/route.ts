import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { listAgents, createAgent } from "@/lib/data/agents";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { PRESET_AGENTS } from "@/seed/agents";
import { mockAgents } from "@/lib/mock-data";
import { z } from "zod";

const DEMO_USER_ID = "u1000000-0000-0000-0000-000000000001";

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  long_description: z.string().max(2000).nullable().optional(),
  icon: z.string().min(1).max(10),
  color: z.string().min(1),
  gradient: z.string().min(1),
  system_prompt: z.string().min(1).max(10000),
  model: z.string().min(1),
});

export async function GET() {
  const user = await getAuthUser();

  // Demo user — return mock agents
  if (user.isDemo) {
    return NextResponse.json(mockAgents);
  }

  let agents = await listAgents(user.id);

  // Auto-sync: ensure preset agents match the codebase exactly
  if (isSupabaseEnabled()) {
    const presetAgents = agents.filter((a: { is_preset?: boolean }) => a.is_preset);
    const existingSlugs = new Set(presetAgents.map((a: { slug: string }) => a.slug));
    const expectedSlugs = new Set(PRESET_AGENTS.map((a) => a.slug));
    const missing = PRESET_AGENTS.filter((a) => !existingSlugs.has(a.slug));
    const stale = presetAgents.filter((a: { slug: string }) => !expectedSlugs.has(a.slug));

    // If there are stale agents (old slugs) or missing agents, do a full refresh
    if (stale.length > 0 || missing.length > 0) {
      const supabase = await createClient();
      if (supabase) {
        // Delete all old preset agents
        if (stale.length > 0) {
          await supabase
            .from("agents")
            .delete()
            .eq("user_id", user.id)
            .eq("is_preset", true);
        }

        // Insert all preset agents fresh (or just missing ones if no stale)
        const toInsert = (stale.length > 0 ? PRESET_AGENTS : missing).map((a) => ({
          name: a.name,
          slug: a.slug,
          description: a.description,
          long_description: a.long_description,
          icon: a.icon,
          color: a.color,
          gradient: a.gradient,
          system_prompt: a.system_prompt,
          model: a.model,
          is_preset: true,
          is_public: true,
          user_id: user.id,
        }));

        await supabase.from("agents").insert(toInsert);
        agents = await listAgents(user.id);
      }
    }
  }

  // Sort agents to match PRESET_AGENTS order (presets first, then custom)
  const slugOrder = new Map(PRESET_AGENTS.map((a, i) => [a.slug, i]));
  agents.sort((a: { slug: string; is_preset?: boolean }, b: { slug: string; is_preset?: boolean }) => {
    const aOrder = slugOrder.get(a.slug) ?? 9999;
    const bOrder = slugOrder.get(b.slug) ?? 9999;
    return aOrder - bOrder;
  });

  return NextResponse.json(agents);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (user.isDemo) return NextResponse.json({ error: "Sign up to create agents", login: true }, { status: 401 });

  const body = await request.json();
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const agent = await createAgent(user.id, {
    ...parsed.data,
    description: parsed.data.description ?? null,
    long_description: parsed.data.long_description ?? null,
  });

  return NextResponse.json(agent, { status: 201 });
}
