import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { assignAgent } from "@/lib/data/tasks";
import { getAgentById } from "@/lib/data/agents";
import { updateTask as updateMockTask, getAgent as getMockAgent, getAgentSummary } from "@/lib/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();

  const { id } = await params;
  const { agent_id } = await request.json();

  if (!agent_id) {
    return NextResponse.json({ error: "agent_id required" }, { status: 400 });
  }

  // Demo user — assign in mock data
  if (user.isDemo) {
    const agent = getMockAgent(agent_id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    const updated = updateMockTask(id, { agent_id, agent: getAgentSummary(agent_id) });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  const agent = await getAgentById(user.id, agent_id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const updated = await assignAgent(user.id, id, agent_id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
