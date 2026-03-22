"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  icon: string;
  color: string;
  gradient: string;
  system_prompt: string;
  tasks_completed: number;
  avg_duration_seconds: number;
}

const PRESETS: Record<string, string[]> = {
  "deep-research": ["Market Landscape Analysis", "Competitor Deep Dive", "Trend Report"],
  "content-creator": ["Blog Content Plan", "Social Media Calendar", "SEO Audit Report"],
  "data-analyst": ["Executive Dashboard", "KPI Report Generator", "Funnel Analysis"],
  "fullstack-developer": ["Code Refactor Plan", "API Endpoint Scaffold", "DevOps Pipeline Setup"],
  "ui-designer": ["Landing Page Audit", "Design System Review", "UX Heuristic Analysis"],
  "linkedin-post": ["Engagement Post", "Thought Leadership", "Company Update"],
  "code-reviewer": ["PR Review", "Security Audit", "Performance Review"],
  "debugger": ["Bug Triage", "Stack Trace Analysis", "Memory Leak Investigation"],
  "system-architect": ["Architecture Review", "Scalability Plan", "Migration Strategy"],
  "sales-rep": ["Outreach Script", "Objection Handling", "Follow-up Sequence"],
  "seo-agent": ["Keyword Research", "Content Gap Analysis", "Technical SEO Audit"],
  "email-drafter": ["Cold Outreach", "Follow-up Series", "Newsletter Draft"],
  "product-manager": ["PRD Draft", "Feature Prioritization", "Sprint Planning"],
  "project-planner": ["Project Timeline", "Resource Allocation", "Risk Assessment"],
  "meeting-notes": ["Meeting Summary", "Action Items Extract", "Decision Log"],
  "investment-analyst": ["Company Valuation", "Market Analysis", "Due Diligence"],
  "competitor-intel": ["Competitive Landscape", "SWOT Analysis", "Pricing Intel"],
  "roast-master": ["Code Roast", "Resume Roast", "Startup Idea Roast"],
  "startup-idea-gen": ["Idea Brainstorm", "Market Fit Analysis", "MVP Scope"],
  "song-lyrics": ["Pop Ballad", "Rap Verse", "Country Song"],
};

export default function AgentProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Agent[]>("/api/agents")
      .then((agents) => {
        const found = agents.find((a) => a.slug === slug);
        setAgent(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f3f3] p-8 flex items-center justify-center">
        <div className="animate-pulse text-[#717785]">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f3f3] p-8 flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
        <p className="text-slate-500 font-medium">Agent not found</p>
        <Link href="/agents" className="text-[#006c05] font-bold text-sm hover:underline">
          Back to Agents
        </Link>
      </div>
    );
  }

  const presets = PRESETS[slug] || ["General Task", "Custom Directive", "Quick Analysis"];
  const avgTime = agent.avg_duration_seconds > 0
    ? `${(agent.avg_duration_seconds / 60).toFixed(1)}m`
    : "N/A";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f3f3f3] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Agent Profile */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-28 h-28 rounded-2xl flex items-center justify-center"
                  style={{ background: agent.gradient || agent.color }}
                >
                  <span className="text-[56px]">{agent.icon}</span>
                </div>
                <span className="px-3 py-1 bg-[#006c05] text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Active
                </span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-extrabold text-[#1b1b1b] tracking-tight">{agent.name}</h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-[#006c05] text-xs font-bold rounded-full border border-green-100">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Verified Expert
                  </span>
                </div>
                <p className="text-sm text-[#717785]">
                  {agent.description} &bull; {agent.tasks_completed} tasks completed &bull; Avg {avgTime}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1b1b1b] mb-4">
                Expertise & Focus
              </h3>
              <p className="text-[#414753] text-[15px] leading-relaxed">
                {agent.long_description || agent.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <span
                  key={preset}
                  className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-[#414753] hover:border-[#006c05] hover:text-[#006c05] transition-colors"
                >
                  {preset}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column — Deployment Console */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1b1b1b] mb-6">
                Deployment Console
              </h3>

              <div className="mb-5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#414753] mb-2 block">
                  Select Directive Preset
                </label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1b1b1b] focus:ring-2 focus:ring-[#006c05] focus:border-transparent outline-none cursor-pointer">
                    {presets.map((preset) => (
                      <option key={preset}>{preset}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#717785] text-lg pointer-events-none">
                    unfold_more
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 mb-6">
                <span className="text-sm text-[#414753]">Deployment Priority</span>
                <span className="text-sm font-bold text-[#1b1b1b]">Standard</span>
              </div>

              <Link href={`/agents/${slug}/hired`}>
                <button className="w-full bg-[#006c05] hover:bg-[#008808] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#006c05]/20 active:scale-[0.98] text-lg">
                  Hire me
                  <span className="material-symbols-outlined">rocket_launch</span>
                </button>
              </Link>

              <div className="flex items-center gap-2 mt-4 justify-center">
                <span className="material-symbols-outlined text-[#717785] text-sm">info</span>
                <span className="text-xs text-[#717785] italic">Credits are auto-deducted upon initialization.</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f3f3f3] border border-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#717785]">help</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#1b1b1b] mb-1">Need help with presets?</p>
                <p className="text-xs text-[#717785] leading-relaxed">
                  View the{" "}
                  <Link href="/templates" className="text-[#006c05] font-semibold hover:underline">
                    Directive Documentation
                  </Link>{" "}
                  to understand the output of each preset.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-[#1b1b1b] rounded-2xl p-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">Need a custom agent?</h3>
            <p className="text-gray-400 text-sm">You can create a custom ai agent specialist.</p>
          </div>
          <Link href="/agents">
            <button className="bg-[#006c05] hover:bg-[#008808] text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 active:scale-[0.98]">
              <span className="material-symbols-outlined text-lg">tune</span>
              Browse All Agents
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
