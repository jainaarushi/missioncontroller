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

  // Auto-seed + cleanup using a single Supabase client
  if (isSupabaseEnabled()) {
    const supabase = await createClient();
    if (supabase) {
      // Auto-seed: add any missing preset agents
      const existingSlugs = new Set(agents.filter((a: { is_preset?: boolean }) => a.is_preset).map((a: { slug: string }) => a.slug));
      const missing = PRESET_AGENTS.filter((a) => !existingSlugs.has(a.slug));

      if (missing.length > 0) {
        const toInsert = missing.map((a) => ({
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

      // Clean up: delete ALL duplicates and any agent with a slug not in the seed
      // (unless it's a user-created custom agent with is_preset=false and a truly custom slug)
      const validSlugs = new Set(PRESET_AGENTS.map((a) => a.slug));

      // Delete duplicates — keep only the first occurrence per slug
      const seenSlugs = new Set<string>();
      const dupeIds: string[] = [];
      for (const a of agents as { id: string; slug: string }[]) {
        if (seenSlugs.has(a.slug)) dupeIds.push(a.id);
        else seenSlugs.add(a.slug);
      }

      // Delete agents with unknown slugs that look like old presets
      // (any agent with is_preset, is_public, OR a slug that matches a known pattern but isn't in the current seed)
      const staleIds = agents
        .filter((a: { id: string; slug: string; is_preset?: boolean; is_public?: boolean }) => {
          // Skip if it's already marked for dupe deletion
          if (dupeIds.includes(a.id)) return false;
          // Skip if slug is in current seed (it's valid)
          if (validSlugs.has(a.slug)) return false;
          // Delete if is_preset or is_public (definitely an old preset)
          if (a.is_preset || a.is_public) return true;
          // Keep truly custom agents (user-created)
          return false;
        })
        .map((a: { id: string }) => a.id);

      const toDelete = [...staleIds, ...dupeIds];
      if (toDelete.length > 0) {
        const { error: delError } = await supabase.from("agents").delete().in("id", toDelete);
        if (delError) console.error("Agent cleanup failed:", delError);
        agents = await listAgents(user.id);
      }
    }
  }

  // Deduplicate by slug (safety net for the response)
  const seen = new Set<string>();
  agents = agents.filter((a: { slug: string }) => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });

  // Sort agents to match the seed file order (preset first in defined order, custom at end)
  const slugOrder = new Map(PRESET_AGENTS.map((a, i) => [a.slug, i]));
  agents.sort((a: { slug: string; is_preset?: boolean }, b: { slug: string; is_preset?: boolean }) => {
    const aIdx = slugOrder.get(a.slug) ?? 9999;
    const bIdx = slugOrder.get(b.slug) ?? 9999;
    return aIdx - bIdx;
  });

  return NextResponse.json(agents);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  const body = await request.json();
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Demo user — create in mock data
  if (user.isDemo) {
    const { createMockAgent } = await import("@/lib/mock-data");
    const agent = createMockAgent({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      long_description: parsed.data.long_description ?? null,
      icon: parsed.data.icon,
      color: parsed.data.color,
      gradient: parsed.data.gradient,
      system_prompt: parsed.data.system_prompt,
      model: parsed.data.model,
    });
    return NextResponse.json(agent, { status: 201 });
  }

  const agent = await createAgent(user.id, {
    ...parsed.data,
    description: parsed.data.description ?? null,
    long_description: parsed.data.long_description ?? null,
  });

  return NextResponse.json(agent, { status: 201 });
}
