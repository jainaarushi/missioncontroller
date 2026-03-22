import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { parseFile, isSupported, getSupportedExtensions } from "@/lib/upload/parse-file";
import { rateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    // Rate limit: 20 uploads per minute
    const rl = rateLimit(`upload:${user.id}`, { maxRequests: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many uploads. Please wait." }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const taskId = formData.get("taskId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size check — clear message for >10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 10MB. Please compress or reduce the file size and try again.`,
      }, { status: 413 });
    }

    // Type check
    if (!isSupported(file.type, file.name)) {
      return NextResponse.json({
        error: `This file type is not supported (${file.type || "unknown"}). Supported formats: ${getSupportedExtensions().join(", ")}`,
      }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseFile(buffer, file.name, file.type);

    if (parsed.error && !parsed.textContent && !parsed.base64Image) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    // Store in Supabase storage if available and user is authenticated
    let storagePath: string | null = null;
    if (isSupabaseEnabled() && !user.isDemo) {
      try {
        const supabase = await createClient();
        if (supabase) {
          const timestamp = Date.now();
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          storagePath = `${user.id}/${timestamp}_${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("uploads")
            .upload(storagePath, buffer, {
              contentType: file.type || "application/octet-stream",
              upsert: false,
            });

          if (uploadError) {
            console.error("Supabase storage error:", uploadError);
            // Don't fail — continue with in-memory parsing
            storagePath = null;
          }

          // Save file metadata to task_files table
          if (storagePath && taskId) {
            await supabase.from("task_files").insert({
              task_id: taskId,
              user_id: user.id,
              filename: file.name,
              mime_type: file.type || "application/octet-stream",
              file_type: parsed.fileType,
              size_bytes: file.size,
              storage_path: storagePath,
              text_content: parsed.textContent?.substring(0, 50000) || null,
            });
          }
        }
      } catch (storageErr) {
        console.error("Storage save error:", storageErr);
        // Continue — file was still parsed successfully
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        filename: parsed.filename,
        mimeType: parsed.mimeType,
        fileType: parsed.fileType,
        textContent: parsed.textContent,
        hasImage: !!parsed.base64Image,
        sizeBytes: parsed.sizeBytes,
        storagePath,
      },
      warning: parsed.error || undefined,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({
      error: "Upload failed. Please try again.",
    }, { status: 500 });
  }
}
