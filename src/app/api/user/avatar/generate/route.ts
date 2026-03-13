import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "@/lib/ai/encrypt";
import { AVATAR_PROMPTS, type AvatarCategoryId } from "@/lib/ai/avatar-prompts";

const BUCKET = "avatars";
const GEMINI_MODEL = "gemini-2.0-flash-preview-image-generation";

// Allow up to 120s for image generation (Vercel defaults to 10s)
export const maxDuration = 120;

async function ensureBucket(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!supabase) return;
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (user.isDemo) {
      return NextResponse.json({ error: "Sign in to generate avatars" }, { status: 401 });
    }

    if (!isSupabaseEnabled()) {
      return NextResponse.json({ error: "Storage not available" }, { status: 500 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Storage not available" }, { status: 500 });
    }

    // Get Gemini key
    const { data: userData } = await supabase
      .from("users")
      .select("gemini_api_key")
      .eq("id", user.id)
      .single();

    if (!userData?.gemini_api_key) {
      return NextResponse.json(
        { error: "Add your Gemini API key in Settings to generate avatars" },
        { status: 402 },
      );
    }

    let geminiKey: string;
    try {
      geminiKey = decryptApiKey(userData.gemini_api_key);
    } catch {
      return NextResponse.json({ error: "Could not decrypt Gemini key" }, { status: 500 });
    }

    // Parse JSON body with base64 face image
    const body = await req.json();
    const faceBase64: string = body.face;
    const faceType: string = body.faceType || "image/png";

    if (!faceBase64) {
      return NextResponse.json({ error: "Face image required" }, { status: 400 });
    }

    const faceBuffer = Buffer.from(faceBase64, "base64");

    if (faceBuffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 413 });
    }

    // Ensure storage bucket exists
    await ensureBucket(supabase);

    // Upload face to storage
    const facePath = `${user.id}/face.png`;
    await supabase.storage.from(BUCKET).upload(facePath, faceBuffer, {
      contentType: faceType,
      upsert: true,
    });

    // Build Gemini URL safely
    const geminiUrl = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    );
    geminiUrl.searchParams.set("key", geminiKey);

    // Generate just ONE avatar ("creative") to test, then expand to all 7
    const testCategory = AVATAR_PROMPTS.find((p) => p.id === "creative") || AVATAR_PROMPTS[0];
    const results: Record<string, string | null> = {};
    let generated = 0;
    let failed = 0;

    console.log(`[avatar] Generating for category: ${testCategory.id}`);
    console.log(`[avatar] Gemini URL: ${geminiUrl.origin}${geminiUrl.pathname}`);
    console.log(`[avatar] Face size: ${faceBuffer.length} bytes, type: ${faceType}`);

    try {
      const res = await fetch(geminiUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: faceType,
                    data: faceBase64,
                  },
                },
                { text: testCategory.prompt },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            imageMimeType: "image/png",
          },
        }),
      });

      console.log(`[avatar] Gemini response status: ${res.status}`);

      if (!res.ok) {
        const err = await res.text();
        console.error(`[avatar] Gemini error:`, err);
        return NextResponse.json({
          error: `Gemini API error (${res.status}): ${err.slice(0, 300)}`,
        }, { status: 502 });
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts;

      if (!parts) {
        console.error(`[avatar] No parts in response:`, JSON.stringify(data).slice(0, 500));
        return NextResponse.json({
          error: "Gemini returned no image. Response: " + JSON.stringify(data).slice(0, 300),
        }, { status: 502 });
      }

      const imagePart = parts.find(
        (p: { inlineData?: { mimeType: string; data: string } }) =>
          p.inlineData?.mimeType?.startsWith("image/"),
      );

      if (!imagePart?.inlineData?.data) {
        console.error(`[avatar] No image data in parts:`, JSON.stringify(parts).slice(0, 500));
        return NextResponse.json({
          error: "Gemini returned text but no image. Try a clearer face photo.",
        }, { status: 502 });
      }

      // Upload to storage
      const imgBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      const storagePath = `${user.id}/${testCategory.id}.png`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, imgBuffer, { contentType: "image/png", upsert: true });

      if (uploadErr) {
        console.error(`[avatar] Upload error:`, uploadErr);
        return NextResponse.json({
          error: `Storage upload failed: ${uploadErr.message}`,
        }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      results[testCategory.id] = publicUrl;
      generated = 1;
    } catch (fetchErr) {
      console.error(`[avatar] Fetch error:`, fetchErr);
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      return NextResponse.json({ error: `Gemini request failed: ${msg}` }, { status: 502 });
    }

    return NextResponse.json({
      avatars: results as Record<AvatarCategoryId, string | null>,
      cost: 0,
      generated,
      failed,
    });
  } catch (err) {
    console.error("Avatar generate route error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
