import { NextRequest, NextResponse } from "next/server";
import { mockTasks, createMockTask } from "@/lib/mock-data";
import { createTaskSchema } from "@/lib/validators/task";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const status = searchParams.get("status");

  let tasks = [...mockTasks];
  if (section) tasks = tasks.filter((t) => t.section === section);
  if (status) tasks = tasks.filter((t) => t.status === status);

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = createMockTask(parsed.data.title, parsed.data.section);
  if (parsed.data.description) task.description = parsed.data.description;

  return NextResponse.json(task, { status: 201 });
}
