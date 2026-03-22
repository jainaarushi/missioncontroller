"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const AGENTS: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  "ui-ux-designer": { name: "UI/UX Designer", icon: "brush", color: "#ec4899" },
  "data-scientist": { name: "Data Scientist", icon: "science", color: "#8b5cf6" },
  researcher: { name: "Research Strategist", icon: "travel_explore", color: "#3b82f6" },
  developer: { name: "Full-Stack Developer", icon: "terminal", color: "#0ea5e9" },
  "data-analyst": { name: "Data Analyst", icon: "bar_chart", color: "#14b8a6" },
  "content-strategist": { name: "Content Strategist", icon: "edit_note", color: "#f59e0b" },
};

const DEPLOY_STEPS = [
  { label: "Initializing Connections", done: true },
  { label: "LinkedIn API (Connected)", done: true },
  { label: "Google Search (Connected)", done: true },
  { label: "Proprietary Knowledge Base (Loading)", done: false },
];

export default function AgentHiredPage() {
  const params = useParams();
  const slug = params.slug as string;
  const agent = AGENTS[slug] || { name: "Research Strategist", icon: "travel_explore", color: "#3b82f6" };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#f9f9f9] p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#4ade80] flex items-center justify-center mb-8 shadow-lg shadow-[#4ade80]/30">
          <span
            className="material-symbols-outlined text-[#1b1b1b] text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-[#1b1b1b] tracking-tight mb-3">
          Agent Successfully Hired!
        </h1>
        <p className="text-[#717785] text-center max-w-md mb-10 leading-relaxed">
          Your autonomous agent has been provisioned and is currently
          initializing its environment.
        </p>

        {/* Deployment Card */}
        <div className="w-full bg-[#f9f9f9] border border-gray-200 rounded-xl p-6 mb-10">
          {/* Agent info + progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: agent.color }}
              >
                <span className="material-symbols-outlined text-xl">
                  {agent.icon}
                </span>
              </div>
              <div>
                <p className="font-bold text-[#1b1b1b] text-sm">{agent.name}</p>
                <p className="text-[11px] font-bold text-[#006c05] uppercase tracking-wider">
                  Deploying
                </p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-[#1b1b1b]">65%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#006c05] rounded-full w-[65%] transition-all duration-1000" />
          </div>

          {/* Deploy Steps */}
          <div className="grid grid-cols-2 gap-3">
            {DEPLOY_STEPS.map((step) => (
              <div key={step.label} className="flex items-center gap-2.5">
                {step.done ? (
                  <span
                    className="material-symbols-outlined text-[#006c05] text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[#006c05] text-lg animate-spin">
                    progress_activity
                  </span>
                )}
                <span className="text-sm text-[#1b1b1b] font-medium">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <Link href={`/chat/${slug}`} className="flex-1">
            <button className="w-full bg-[#006c05] hover:bg-[#008808] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-[#006c05]/20 active:scale-[0.98]">
              <span className="material-symbols-outlined">forum</span>
              Start Chatting with Agent
            </button>
          </Link>
          <Link href="/today">
            <button className="px-6 py-4 bg-[#eeeeee] hover:bg-[#e2e2e2] text-[#1b1b1b] font-bold rounded-xl transition-colors active:scale-[0.98]">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
