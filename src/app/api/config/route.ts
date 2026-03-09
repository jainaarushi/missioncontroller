import { NextResponse } from "next/server";

export async function GET() {
  const supabaseEnabled =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  return NextResponse.json({
    mode: supabaseEnabled ? "live" : "demo",
    supabase: supabaseEnabled,
    ai: "user-provided",
  });
}
