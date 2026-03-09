import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask, getAgentSummary } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { agent_id } = await request.json();

  if (!agent_id) {
    return NextResponse.json({ error: "agent_id required" }, { status: 400 });
  }

  const task = getTask(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const agentSummary = getAgentSummary(agent_id);
  if (!agentSummary) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const updated = updateTask(id, { agent_id, status: "todo" });
  return NextResponse.json(updated);
}
