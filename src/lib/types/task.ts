export type TaskStatus = "todo" | "working" | "review" | "done" | "failed";
export type TaskSection = "today" | "week" | "later";
export type TaskPriority = "urgent" | "high" | "normal" | "low";

export interface Task {
  id: string;
  user_id: string;
  agent_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  progress: number;
  current_step: string | null;
  output: string | null;
  output_format: string;
  cost_usd: number;
  tokens_in: number;
  tokens_out: number;
  duration_seconds: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  section: TaskSection;
  sort_order: number;
  priority: TaskPriority;
}

export interface TaskWithAgent extends Task {
  agent: {
    id: string;
    name: string;
    icon: string;
    color: string;
    gradient: string;
  } | null;
}

export interface TaskStep {
  id: string;
  task_id: string;
  step_number: number;
  description: string;
  status: "pending" | "working" | "done" | "failed";
  started_at: string | null;
  completed_at: string | null;
  tokens_used: number;
  output?: string;  // Per-step output (in-memory only, not in DB)
}
