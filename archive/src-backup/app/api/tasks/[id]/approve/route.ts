import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { approveTask } from "@/lib/data/tasks";
import { getTask, updateTask as updateMockTask } from "@/lib/mock-data";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  if (user.isDemo) {
    const task = getTask(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updated = updateMockTask(id, { status: "done", completed_at: new Date().toISOString() });
    return NextResponse.json(updated);
  }

  const updated = await approveTask(user.id, id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
