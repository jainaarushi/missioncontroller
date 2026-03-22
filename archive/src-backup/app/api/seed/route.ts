import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { PRESET_AGENTS } from "@/seed/agents";

export async function POST(request: NextRequest) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ message: "Demo mode — agents already loaded in memory" });
  }

  const user = await getAuthUser();
  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in to seed agents" }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not available" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  if (force) {
    // Delete all existing preset agents for this user
    await supabase
      .from("agents")
      .delete()
      .eq("user_id", user.id)
      .eq("is_preset", true);

    // Insert all preset agents fresh
    const toInsert = PRESET_AGENTS.map((a) => ({
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

    const { error } = await supabase.from("agents").insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      message: `Force re-seeded ${toInsert.length} agents`,
      count: toInsert.length,
    });
  }

  // Normal seed — only add missing agents
  const { data: existing } = await supabase
    .from("agents")
    .select("slug")
    .eq("user_id", user.id)
    .eq("is_preset", true);

  const existingSlugs = new Set((existing || []).map((a: { slug: string }) => a.slug));

  const toInsert = PRESET_AGENTS
    .filter((a) => !existingSlugs.has(a.slug))
    .map((a) => ({
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

  if (toInsert.length === 0) {
    return NextResponse.json({
      message: "All preset agents already exist",
      count: existingSlugs.size,
    });
  }

  const { error } = await supabase.from("agents").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    message: `Seeded ${toInsert.length} new agents`,
    seeded: toInsert.map((a) => a.name),
  });
}
