import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/server";
import { AVATAR_CATEGORIES } from "@/lib/ai/avatar-prompts";

const BUCKET = "avatars";

export async function GET() {
  const user = await getAuthUser();

  if (user.isDemo || !isSupabaseEnabled()) {
    return NextResponse.json({ avatars: {}, hasFace: false });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ avatars: {}, hasFace: false });
  }

  // List files in the user's avatar folder in storage
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(user.id, { limit: 20 });

  if (!files || files.length === 0) {
    return NextResponse.json({ avatars: {}, hasFace: false });
  }

  const fileNames = new Set(files.map((f: { name: string }) => f.name));
  const hasFace = fileNames.has("face.png");

  // Build avatar URLs from storage files — each category is {category}.png
  const avatars: Record<string, string> = {};
  for (const catId of AVATAR_CATEGORIES) {
    const fileName = `${catId}.png`;
    if (fileNames.has(fileName)) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(`${user.id}/${fileName}`);
      avatars[catId] = publicUrl;
    }
  }

  return NextResponse.json({ avatars, hasFace });
}

export async function DELETE() {
  const user = await getAuthUser();

  if (user.isDemo) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Storage not available" }, { status: 500 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not available" }, { status: 500 });
  }

  // List all files in the user's avatar folder
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(user.id, { limit: 20 });

  if (files && files.length > 0) {
    const paths = files.map((f: { name: string }) => `${user.id}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }

  return NextResponse.json({ ok: true });
}
