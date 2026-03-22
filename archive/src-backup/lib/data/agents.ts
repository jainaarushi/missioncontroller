import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import {
  mockAgents,
  getAgent,
  createMockAgent,
  deleteAgent,
} from "@/lib/mock-data";
import type { Agent } from "@/lib/types/agent";

export async function listAgents(userId: string): Promise<Agent[]> {
  if (!isSupabaseEnabled()) {
    return mockAgents;
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .or(`user_id.eq.${userId.replace(/[^a-f0-9-]/gi, "")},is_preset.eq.true`);

  if (error) throw new Error(error.message);
  return (data as Agent[]) || [];
}

export async function getAgentById(
  userId: string,
  agentId: string
): Promise<Agent | null> {
  if (!isSupabaseEnabled()) {
    return getAgent(agentId) || null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .or(`user_id.eq.${userId.replace(/[^a-f0-9-]/gi, "")},is_preset.eq.true`)
    .single();

  if (error) return null;
  return data as Agent;
}

export async function createAgent(
  userId: string,
  data: {
    name: string;
    slug: string;
    description: string | null;
    long_description: string | null;
    icon: string;
    color: string;
    gradient: string;
    system_prompt: string;
    model: string;
  }
): Promise<Agent> {
  if (!isSupabaseEnabled()) {
    return createMockAgent(data);
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: agent, error } = await supabase
    .from("agents")
    .insert({
      user_id: userId,
      ...data,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return agent as Agent;
}

export async function updateAgentById(
  userId: string,
  agentId: string,
  data: Record<string, unknown>
): Promise<Agent | null> {
  if (!isSupabaseEnabled()) {
    const agent = getAgent(agentId);
    if (!agent) return null;
    Object.assign(agent, data);
    return agent;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: agent, error } = await supabase
    .from("agents")
    .update(data)
    .eq("id", agentId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) return null;
  return agent as Agent;
}

export async function deleteAgentById(
  userId: string,
  agentId: string
): Promise<boolean> {
  if (!isSupabaseEnabled()) {
    return deleteAgent(agentId);
  }

  const supabase = await createClient();
  if (!supabase) return false;

  // Only allow deleting non-preset agents owned by the user
  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", agentId)
    .eq("user_id", userId)
    .eq("is_preset", false);

  return !error;
}
