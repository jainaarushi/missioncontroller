import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/server";
import { decryptApiKey } from "@/lib/ai/encrypt";
import { AVATAR_PROMPTS, type AvatarCategoryId } from "@/lib/ai/avatar-prompts";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CONCURRENCY = 2;
const GEMINI_MODEL = "gemini-2.0-flash-preview-image-generation";
const BUCKET = "avatars";

// Allow up to 120s for generating 7 images (Vercel defaults to 10s)
export const maxDuration = 120;

async function ensureBucket(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!supabase) return;
  // Try to create — if it already exists, Supabase returns an error we ignore
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});
}

export async function POST(req: Request) {
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

  // Parse multipart form data
  const formData = await req.formData();
  const face = formData.get("face");
  if (!face || !(face instanceof File)) {
    return NextResponse.json({ error: "Face image required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(face.type)) {
    return NextResponse.json(
      { error: "Image must be JPG, PNG, or WEBP" },
      { status: 415 },
    );
  }

  if (face.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 413 });
  }

  // Read face as base64
  const faceBuffer = Buffer.from(await face.arrayBuffer());
  const faceBase64 = faceBuffer.toString("base64");
  const faceType = face.type;

  // Ensure storage bucket exists
  await ensureBucket(supabase);

  // Upload face to storage
  const facePath = `${user.id}/face.png`;
  await supabase.storage.from(BUCKET).upload(facePath, faceBuffer, {
    contentType: faceType,
    upsert: true,
  });

  // Generate avatars with concurrency control
  const results: Record<string, string | null> = {};
  let generated = 0;
  let failed = 0;

  async function generateOne(category: (typeof AVATAR_PROMPTS)[number]) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
        {
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
                  { text: category.prompt },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
              imageMimeType: "image/png",
            },
          }),
        },
      );

      if (!res.ok) {
        const err = await res.text();
        console.error(`Avatar generation failed for ${category.id}:`, err);
        failed++;
        results[category.id] = null;
        return;
      }

      const data = await res.json();

      // Extract image from Gemini response
      const parts = data.candidates?.[0]?.content?.parts;
      if (!parts) {
        console.error(`No parts in Gemini response for ${category.id}`);
        failed++;
        results[category.id] = null;
        return;
      }

      const imagePart = parts.find(
        (p: { inlineData?: { mimeType: string; data: string } }) =>
          p.inlineData?.mimeType?.startsWith("image/"),
      );

      if (!imagePart?.inlineData?.data) {
        console.error(`No image data in Gemini response for ${category.id}`);
        failed++;
        results[category.id] = null;
        return;
      }

      const imgBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      await uploadAvatar(category.id, imgBuffer);
    } catch (err) {
      console.error(`Avatar generation error for ${category.id}:`, err);
      failed++;
      results[category.id] = null;
    }
  }

  async function uploadAvatar(categoryId: string, buffer: Buffer) {
    const storagePath = `${user.id}/${categoryId}.png`;
    const { error: uploadErr } = await supabase!.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadErr) {
      console.error(`Upload failed for ${categoryId}:`, uploadErr);
      failed++;
      results[categoryId] = null;
      return;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase!.storage.from(BUCKET).getPublicUrl(storagePath);

    results[categoryId] = publicUrl;
    generated++;
  }

  // Process with concurrency limit
  const queue = [...AVATAR_PROMPTS];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift()!;
          await generateOne(item);
        }
      })(),
    );
  }

  await Promise.all(workers);

  return NextResponse.json({
    avatars: results as Record<AvatarCategoryId, string | null>,
    cost: 0,
    generated,
    failed,
  });
}
