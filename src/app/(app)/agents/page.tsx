"use client";

import { useState } from "react";
import Link from "next/link";

const AGENTS = [
  {
    slug: "ui-ux-designer",
    name: "UI/UX Designer",
    description: "Expert in Figma, accessibility, and high-conversion landing page design.",
    tags: ["Design", "Prototyping"],
    gradient: "from-green-50 to-blue-50",
    avatar: "\uD83C\uDFA8",
  },
  {
    slug: "data-scientist",
    name: "Data Scientist",
    description: "Master of predictive modeling, SQL optimization, and Python automation.",
    tags: ["ML", "Analysis"],
    gradient: "from-blue-50 to-purple-50",
    avatar: "\uD83E\uDDEC",
  },
  {
    slug: "researcher",
    name: "Researcher",
    description: "Deep web searching, trend reports, and competitive intelligence gathering.",
    tags: ["Market", "Strategy"],
    gradient: "from-orange-50 to-pink-50",
    avatar: "\uD83D\uDD0D",
  },
  {
    slug: "developer",
    name: "Developer",
    description: "React, Node.js, and Cloud Infrastructure specialist with 24/7 uptime.",
    tags: ["Fullstack", "API"],
    gradient: "from-cyan-50 to-indigo-50",
    avatar: "\uD83D\uDCBB",
  },
  {
    slug: "data-analyst",
    name: "Data Analyst",
    description: "Visualizing complex data into actionable insights and beautiful dashboards.",
    tags: ["Tableau", "BI"],
    gradient: "from-green-50 to-teal-50",
    avatar: "\uD83D\uDCCA",
  },
  {
    slug: "content-strategist",
    name: "Content Strategist",
    description: "SEO-focused content cycles, social media automation, and brand voice.",
    tags: ["Copywriting", "SEO"],
    gradient: "from-yellow-50 to-orange-50",
    avatar: "\u270D\uFE0F",
  },
];

const CATEGORIES = [
  { icon: "grid_view", label: "All Agents", count: "197", active: true },
  { icon: "engineering", label: "Engineering", count: "95", active: false },
  { icon: "task_alt", label: "Operations & Productivity", count: "39", active: false },
  { icon: "campaign", label: "Marketing & Content", count: "39", active: false },
  { icon: "payments", label: "Sales & Revenue", count: "13", active: false },
  { icon: "fitness_center", label: "Health & Lifestyle", count: "7", active: false },
  { icon: "celebration", label: "Creative & Fun", count: "4", active: false },
];

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Agents");

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f3f3f3]" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e2e2 transparent" }}>
        {/* Breadcrumbs & Stats */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1b1b1b] tracking-tight">AI Agent Agency</h1>
            <p className="text-[#414753]">Specialized agents ready to deploy</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                className="bg-white border border-[#c1c6d5] rounded-lg py-2 pl-10 pr-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-[#006c05] focus:border-transparent outline-none"
                placeholder="Search for agents..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-[#c1c6d5] flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Sort:</span>
              <span className="text-sm font-medium">Top Rated</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {AGENTS.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className={`h-40 bg-gradient-to-br ${agent.gradient} relative flex items-center justify-center p-6`}>
                <span className="text-6xl group-hover:scale-110 transition-transform">{agent.avatar}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight">{agent.name}</h3>
                </div>
                <p className="text-sm text-[#414753] line-clamp-2 mb-4">{agent.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-[10px] font-semibold rounded text-slate-600 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="w-full bg-[#006c05] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#008808] transition-colors shadow-sm active:scale-95"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  Hire me
                </button>
              </div>
            </Link>
          ))}

          {/* Placeholder for more agents */}
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">more_horiz</span>
            <p className="text-slate-400 font-medium">Loading more specialized agents...</p>
          </div>
        </div>
      </div>

      {/* Right Categories Sidebar */}
      <aside className="hidden md:flex flex-col p-4 gap-2 h-[calc(100vh-64px)] w-72 border-l border-slate-100 bg-white font-['Inter'] text-sm sticky top-16 shrink-0">
        <div className="mb-4 px-2">
          <h2 className="text-lg font-semibold text-black">Categories</h2>
          <p className="text-xs text-slate-400">Filter by expertise</p>
        </div>
        <div
          className="flex flex-col gap-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e2e2 transparent" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <div
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer select-none transition-transform duration-200 ${
                  isActive
                    ? "bg-green-50 text-green-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:translate-x-1"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
                {isActive ? (
                  <span className="text-xs bg-green-200/50 px-2 py-0.5 rounded-full">{cat.count}</span>
                ) : (
                  <span className="text-xs font-medium">{cat.count}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-auto p-4 bg-[#ece0d6] rounded-xl">
          <p className="text-xs font-bold text-[#4d453e] mb-1 uppercase tracking-wider">Pro Tip</p>
          <p className="text-[11px] leading-relaxed text-[#4d453e]">
            Combine a Designer agent with a Developer agent for full-stack automation.
          </p>
        </div>
      </aside>
    </div>
  );
}
