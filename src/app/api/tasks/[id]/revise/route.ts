import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { reviseTask } from "@/lib/data/tasks";
import { getTask, updateTask as updateMockTask } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;
  const { note } = await request.json();

  if (user.isDemo) {
    const task = getTask(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updated = updateMockTask(id, {
      status: "todo",
      progress: 0,
      description: (task.description ? task.description + "\n\n" : "") + `Revision note: ${note}`,
    });
    return NextResponse.json(updated);
  }

  const updated = await reviseTask(user.id, id, note);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
