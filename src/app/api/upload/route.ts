import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { parseFile, isSupported, getSupportedExtensions } from "@/lib/upload/parse-file";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size check
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`,
      }, { status: 400 });
    }

    // Type check (also try filename extension as fallback)
    if (!isSupported(file.type, file.name)) {
      return NextResponse.json({
        error: `Unsupported file type: ${file.type || "unknown"}. Supported: ${getSupportedExtensions().join(", ")}`,
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseFile(buffer, file.name, file.type);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error, parsed }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      file: {
        filename: parsed.filename,
        mimeType: parsed.mimeType,
        fileType: parsed.fileType,
        textContent: parsed.textContent,
        base64Image: parsed.base64Image,
        sizeBytes: parsed.sizeBytes,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({
      error: `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    }, { status: 500 });
  }
}
