import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getStats } from "@/lib/data/stats";
import { mockTasks } from "@/lib/mock-data";

export async function GET() {
  const user = await getAuthUser();

  if (user.isDemo) {
    const working = mockTasks.filter((t) => t.status === "working").length;
    const review = mockTasks.filter((t) => t.status === "review").length;
    const spent = mockTasks.reduce((s, t) => s + (Number(t.cost_usd) || 0), 0);
    return NextResponse.json({ working, review, spent });
  }

  const stats = await getStats(user.id);
  return NextResponse.json(stats);
}
