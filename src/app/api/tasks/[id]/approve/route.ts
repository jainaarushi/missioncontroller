import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask } from "@/lib/mock-data";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = updateTask(id, {
    status: "done",
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json(updated);
}
