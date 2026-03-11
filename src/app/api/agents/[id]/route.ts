import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAgentById, updateAgentById, deleteAgentById } from "@/lib/data/agents";
import { getAgent, deleteAgent as deleteMockAgent, mockAgents } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;

  if (user.isDemo) {
    const agent = getAgent(id);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(agent);
  }

  const agent = await getAgentById(user.id, id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  const { id } = await params;
  const body = await request.json();

  if (user.isDemo) {
    const agent = getAgent(id);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    Object.assign(agent, body);
    return NextResponse.json(agent);
  }

  const updated = await updateAgentById(user.id, id, body);
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
    const deleted = deleteMockAgent(id);
    if (!deleted) return NextResponse.json({ error: "Cannot delete preset agents" }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  const deleted = await deleteAgentById(user.id, id);
  if (!deleted) return NextResponse.json({ error: "Cannot delete preset agents" }, { status: 400 });

  return NextResponse.json({ success: true });
}
