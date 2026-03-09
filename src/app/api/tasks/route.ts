import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { listTasks, createTask } from "@/lib/data/tasks";
import { createTaskSchema } from "@/lib/validators/task";
import { mockTasks, createMockTask } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  // Demo user — return mock tasks
  if (user.isDemo) {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || undefined;
    const filtered = section ? mockTasks.filter((t) => t.section === section) : mockTasks;
    return NextResponse.json(filtered);
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || undefined;
  const status = searchParams.get("status") || undefined;

  const tasks = await listTasks(user.id, { section, status });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Demo users — create in mock data
  if (user.isDemo) {
    createMockTask(parsed.data.title);
    const created = mockTasks[0]; // createMockTask prepends to array
    return NextResponse.json(created, { status: 201 });
  }

  const task = await createTask(user.id, parsed.data);
  return NextResponse.json(task, { status: 201 });
}
