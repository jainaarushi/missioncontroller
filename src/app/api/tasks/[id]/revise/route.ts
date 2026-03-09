import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask, mockSteps } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { note } = await request.json();
  const task = getTask(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updatedDescription = [
    task.description || "",
    `\n\n---\nRevision requested: ${note}`,
  ]
    .join("")
    .trim();

  mockSteps.delete(id);

  const updated = updateTask(id, {
    description: updatedDescription,
    status: "todo",
    progress: 0,
    output: null,
    current_step: null,
  });

  return NextResponse.json(updated);
}
