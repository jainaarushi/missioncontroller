export interface Agent {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  icon: string;
  color: string;
  gradient: string;
  system_prompt: string;
  model: string;
  tools: unknown[];
  is_preset: boolean;
  is_public: boolean;
  tasks_completed: number;
  avg_duration_seconds: number;
  created_at: string;
}
