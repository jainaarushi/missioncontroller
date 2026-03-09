import { NextResponse } from "next/server";
import { mockTasks } from "@/lib/mock-data";

export async function GET() {
  const stats = {
    working: 0,
    review: 0,
    todo: 0,
    done: 0,
    spent: 0,
  };

  for (const task of mockTasks) {
    if (task.status === "working") stats.working++;
    else if (task.status === "review") stats.review++;
    else if (task.status === "todo") stats.todo++;
    else if (task.status === "done") stats.done++;
    stats.spent += Number(task.cost_usd) || 0;
  }

  return NextResponse.json(stats);
}
