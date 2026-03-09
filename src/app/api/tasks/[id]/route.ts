import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getTaskById, updateTaskById, deleteTaskById } from "@/lib/data/tasks";
import { mockSteps, getTask as getMockTask, updateTask as updateMockTask, deleteTask as deleteMockTask } from "@/lib/mock-data";
import { updateTaskSchema } from "@/lib/validators/task";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  // Demo user — return from mock data
  if (user.isDemo) {
    const task = getMockTask(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const liveSteps = mockSteps.get(id);
    return NextResponse.json({ ...task, steps: liveSteps || [] });
  }

  const task = await getTaskById(user.id, id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const liveSteps = mockSteps.get(id);
  if (liveSteps && liveSteps.length > 0) {
    task.steps = liveSteps;
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;
  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (user.isDemo) {
    const updated = updateMockTask(id, parsed.data as Record<string, unknown>);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  const updated = await updateTaskById(user.id, id, parsed.data as Record<string, unknown>);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  if (user.isDemo) {
    const deleted = deleteMockTask(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  const deleted = await deleteTaskById(user.id, id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
