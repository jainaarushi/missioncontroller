import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/supabase/server";
import { mockTasks } from "@/lib/mock-data";

interface Stats {
  working: number;
  review: number;
  todo: number;
  done: number;
  spent: number;
}

export async function getStats(userId: string): Promise<Stats> {
  if (!isSupabaseEnabled()) {
    const stats: Stats = { working: 0, review: 0, todo: 0, done: 0, spent: 0 };
    for (const task of mockTasks) {
      if (task.status === "working") stats.working++;
      else if (task.status === "review") stats.review++;
      else if (task.status === "todo") stats.todo++;
      else if (task.status === "done") stats.done++;
      stats.spent += Number(task.cost_usd) || 0;
    }
    return stats;
  }

  const supabase = await createClient();
  if (!supabase) return { working: 0, review: 0, todo: 0, done: 0, spent: 0 };

  const { data, error } = await supabase
    .from("tasks")
    .select("status, cost_usd")
    .eq("user_id", userId);

  if (error || !data) return { working: 0, review: 0, todo: 0, done: 0, spent: 0 };

  const stats: Stats = { working: 0, review: 0, todo: 0, done: 0, spent: 0 };
  for (const task of data) {
    if (task.status === "working") stats.working++;
    else if (task.status === "review") stats.review++;
    else if (task.status === "todo") stats.todo++;
    else if (task.status === "done") stats.done++;
    stats.spent += Number(task.cost_usd) || 0;
  }
  return stats;
}
