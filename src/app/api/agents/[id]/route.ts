import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getAgentById, updateAgentById, deleteAgentById } from "@/lib/data/agents";
import { getAgent, deleteAgent as deleteMockAgent } from "@/lib/mock-data";

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  long_description: z.string().max(2000).nullable().optional(),
  icon: z.string().min(1).max(10).optional(),
  color: z.string().min(1).optional(),
  gradient: z.string().min(1).optional(),
  system_prompt: z.string().min(1).max(10000).optional(),
}).strict(); // reject unknown fields

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
  const parsed = updateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (user.isDemo) {
    const agent = getAgent(id);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    Object.assign(agent, parsed.data);
    return NextResponse.json(agent);
  }

  const updated = await updateAgentById(user.id, id, parsed.data);
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
