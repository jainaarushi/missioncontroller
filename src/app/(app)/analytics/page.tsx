"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  slug: string;
  tasks_completed: number;
  avg_duration_seconds: number;
}

interface Stats {
  working: number;
  review: number;
  spent: number;
}

export default function AnalyticsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats>({ working: 0, review: 0, spent: 0 });

  useEffect(() => {
    api.get<Agent[]>("/api/agents").then(setAgents).catch(() => {});
    api.get<Stats>("/api/stats").then(setStats).catch(() => {});
  }, []);

  const totalTasks = agents.reduce((s, a) => s + a.tasks_completed, 0);
  const activeAgents = agents.length;
  const avgCompletion = agents.length > 0
    ? (agents.reduce((s, a) => s + a.avg_duration_seconds, 0) / agents.length / 60).toFixed(1) + "m"
    : "N/A";
  const topAgents = [...agents].sort((a, b) => b.tasks_completed - a.tasks_completed).slice(0, 6);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1b1b1b]">Analytics</h1>
        <p className="text-[#414753]">Monitor agent performance and usage metrics.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Tasks", value: totalTasks.toLocaleString(), icon: "task_alt", change: `${stats.working} running`, color: "text-[#006c05]" },
          { label: "Active Agents", value: String(activeAgents), icon: "group", change: `${stats.review} in review`, color: "text-[#006c05]" },
          { label: "Avg. Completion", value: avgCompletion, icon: "timer", change: "per task", color: "text-[#006c05]" },
          { label: "Total Spent", value: `$${stats.spent.toFixed(2)}`, icon: "payments", change: "API costs", color: "text-[#006c05]" },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-[#717785]">{metric.icon}</span>
              <span className={`text-xs font-bold ${metric.color}`}>{metric.change}</span>
            </div>
            <p className="text-sm text-[#414753] font-medium">{metric.label}</p>
            <p className="text-3xl font-extrabold text-[#1b1b1b] tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-[#1b1b1b] mb-6">Tasks Over Time</h3>
          <div className="h-64 bg-[#f9f9f9] rounded-lg flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">show_chart</span>
              <p className="text-sm text-[#717785]">Chart visualization</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-[#1b1b1b] mb-6">Agent Utilization</h3>
          <div className="h-64 bg-[#f9f9f9] rounded-lg flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">donut_large</span>
              <p className="text-sm text-[#717785]">Chart visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Agents Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#1b1b1b]">Top Performing Agents</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#f9f9f9] text-[10px] font-bold uppercase tracking-wider text-[#717785]">
            <tr>
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4">Tasks Completed</th>
              <th className="px-6 py-4">Avg. Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topAgents.map((agent) => (
              <tr key={agent.slug} className="hover:bg-[#f9f9f9] transition-colors">
                <td className="px-6 py-4 font-medium text-sm">{agent.name}</td>
                <td className="px-6 py-4 text-sm text-[#414753]">{agent.tasks_completed}</td>
                <td className="px-6 py-4 text-sm text-[#414753]">
                  {agent.avg_duration_seconds > 0 ? `${(agent.avg_duration_seconds / 60).toFixed(1)}m` : "N/A"}
                </td>
              </tr>
            ))}
            {topAgents.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#717785]">No agent data yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
