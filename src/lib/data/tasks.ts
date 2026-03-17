import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import {
  mockTasks,
  mockSteps,
  getTask,
  createMockTask,
  updateTask,
  deleteTask,
  getAgentSummary,
} from "@/lib/mock-data";
import type { TaskWithAgent, TaskStep, TaskSection, TaskStatus } from "@/lib/types/task";

interface TaskFilters {
  section?: string;
  status?: string;
}

export async function listTasks(
  userId: string,
  filters?: TaskFilters
): Promise<TaskWithAgent[]> {
  if (!isSupabaseEnabled()) {
    let tasks = [...mockTasks];
    if (filters?.section) tasks = tasks.filter((t) => t.section === filters.section);
    if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status);
    return tasks;
  }

  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("tasks")
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (filters?.section) query = query.eq("section", filters.section);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as TaskWithAgent[]) || [];
}

export async function getTaskById(
  userId: string,
  taskId: string
): Promise<(TaskWithAgent & { steps: TaskStep[] }) | null> {
  if (!isSupabaseEnabled()) {
    const task = getTask(taskId);
    if (!task) return null;
    return { ...task, steps: mockSteps.get(taskId) || [] };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: task, error } = await supabase
    .from("tasks")
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  if (error || !task) return null;

  const { data: steps } = await supabase
    .from("task_steps")
    .select("*")
    .eq("task_id", taskId)
    .order("step_number", { ascending: true });

  return { ...(task as TaskWithAgent), steps: (steps as TaskStep[]) || [] };
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    description?: string;
    section?: string;
    priority?: string;
  }
): Promise<TaskWithAgent> {
  if (!isSupabaseEnabled()) {
    const task = createMockTask(data.title, data.section, data.priority);
    if (data.description) task.description = data.description;
    return task;
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      section: data.section || "today",
      priority: data.priority || "normal",
    })
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .single();

  if (error) throw new Error(error.message);
  return task as TaskWithAgent;
}

export async function updateTaskById(
  userId: string,
  taskId: string,
  data: Record<string, unknown>
): Promise<TaskWithAgent | null> {
  if (!isSupabaseEnabled()) {
    return updateTask(taskId, data as Partial<TaskWithAgent>);
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: task, error } = await supabase
    .from("tasks")
    .update(data)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .single();

  if (error) return null;
  return task as TaskWithAgent;
}

export async function deleteTaskById(
  userId: string,
  taskId: string
): Promise<boolean> {
  if (!isSupabaseEnabled()) {
    return deleteTask(taskId);
  }

  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  return !error;
}

export async function getTaskSteps(taskId: string): Promise<TaskStep[]> {
  if (!isSupabaseEnabled()) {
    return mockSteps.get(taskId) || [];
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("task_steps")
    .select("*")
    .eq("task_id", taskId)
    .order("step_number", { ascending: true });

  if (error) return [];
  return (data as TaskStep[]) || [];
}

export async function assignAgent(
  userId: string,
  taskId: string,
  agentId: string
): Promise<TaskWithAgent | null> {
  if (!isSupabaseEnabled()) {
    const task = getTask(taskId);
    if (!task) return null;
    const agentSummary = getAgentSummary(agentId);
    if (!agentSummary) return null;
    return updateTask(taskId, { agent_id: agentId, status: "todo" as TaskStatus });
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: task, error } = await supabase
    .from("tasks")
    .update({ agent_id: agentId, status: "todo" })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .single();

  if (error) return null;
  return task as TaskWithAgent;
}

export async function approveTask(
  userId: string,
  taskId: string
): Promise<TaskWithAgent | null> {
  if (!isSupabaseEnabled()) {
    const task = getTask(taskId);
    if (!task) return null;
    return updateTask(taskId, {
      status: "done" as TaskStatus,
      completed_at: new Date().toISOString(),
    });
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: task, error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .single();

  if (error) return null;
  return task as TaskWithAgent;
}

export async function reviseTask(
  userId: string,
  taskId: string,
  note: string
): Promise<TaskWithAgent | null> {
  if (!isSupabaseEnabled()) {
    const task = getTask(taskId);
    if (!task) return null;
    const updatedDescription = [
      task.description || "",
      `\n\n---\nRevision requested: ${note}`,
    ]
      .join("")
      .trim();
    mockSteps.delete(taskId);
    return updateTask(taskId, {
      description: updatedDescription,
      status: "todo" as TaskStatus,
      progress: 0,
      output: null,
      current_step: null,
    });
  }

  const supabase = await createClient();
  if (!supabase) return null;

  // Fetch current task to get description
  const { data: current } = await supabase
    .from("tasks")
    .select("description")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  if (!current) return null;

  const updatedDescription = [
    current.description || "",
    `\n\n---\nRevision requested: ${note}`,
  ]
    .join("")
    .trim();

  // Delete existing steps
  await supabase.from("task_steps").delete().eq("task_id", taskId);

  const { data: task, error } = await supabase
    .from("tasks")
    .update({
      description: updatedDescription,
      status: "todo",
      progress: 0,
      output: null,
      current_step: null,
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*, agent:agents(id, name, slug, icon, color, gradient)")
    .single();

  if (error) return null;
  return task as TaskWithAgent;
}
