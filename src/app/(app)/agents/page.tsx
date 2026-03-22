"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  gradient: string;
  tasks_completed: number;
}

const CATEGORIES = [
  { icon: "grid_view", label: "All Agents" },
  { icon: "engineering", label: "Engineering" },
  { icon: "task_alt", label: "Operations & Productivity" },
  { icon: "campaign", label: "Marketing & Content" },
  { icon: "payments", label: "Sales & Revenue" },
  { icon: "fitness_center", label: "Health & Lifestyle" },
  { icon: "celebration", label: "Creative & Fun" },
];

const CATEGORY_SLUGS: Record<string, string[]> = {
  Engineering: ["fullstack-developer", "code-reviewer", "debugger", "system-architect", "ui-designer"],
  "Operations & Productivity": ["product-manager", "project-planner", "meeting-notes"],
  "Marketing & Content": ["content-creator", "seo-agent", "linkedin-post", "email-drafter"],
  "Sales & Revenue": ["sales-rep", "competitor-intel"],
  "Health & Lifestyle": [],
  "Creative & Fun": ["roast-master", "startup-idea-gen", "song-lyrics"],
};

type SortOption = "name" | "tasks";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Agents");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    api.get<Agent[]>("/api/agents")
      .then(setAgents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = agents
    .filter((a) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q);
      }
      return true;
    })
    .filter((a) => {
      if (activeCategory === "All Agents") return true;
      const slugs = CATEGORY_SLUGS[activeCategory];
      return slugs ? slugs.includes(a.slug) : true;
    })
    .sort((a, b) => {
      if (sortBy === "tasks") return b.tasks_completed - a.tasks_completed;
      return a.name.localeCompare(b.name);
    });

  const categoryCounts = CATEGORIES.map((cat) => {
    if (cat.label === "All Agents") return agents.length;
    const slugs = CATEGORY_SLUGS[cat.label];
    return slugs ? agents.filter((a) => slugs.includes(a.slug)).length : 0;
  });

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
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="bg-white border border-[#c1c6d5] rounded-lg py-2 pl-10 pr-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-[#006c05] focus:border-transparent outline-none"
                placeholder="Search for agents..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div
              className="relative px-4 py-2 bg-white rounded-lg border border-[#c1c6d5] flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setSortOpen(!sortOpen)}
            >
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Sort:</span>
              <span className="text-sm font-medium">{sortBy === "name" ? "A-Z" : "Top Rated"}</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
              {sortOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    onClick={(e) => { e.stopPropagation(); setSortBy("name"); setSortOpen(false); }}
                  >
                    A-Z
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    onClick={(e) => { e.stopPropagation(); setSortBy("tasks"); setSortOpen(false); }}
                  >
                    Top Rated
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((agent) => (
              <Link
                key={agent.slug}
                href={`/agents/${agent.slug}`}
                className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div
                  className="h-40 relative flex items-center justify-center p-6"
                  style={{ background: agent.gradient || agent.color }}
                >
                  <span className="text-6xl group-hover:scale-110 transition-transform">{agent.icon}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight">{agent.name}</h3>
                  </div>
                  <p className="text-sm text-[#414753] line-clamp-2 mb-4">{agent.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-semibold rounded text-slate-600 uppercase">
                      {agent.tasks_completed} tasks
                    </span>
                  </div>
                  <span className="w-full bg-[#006c05] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#008808] transition-colors shadow-sm active:scale-95 text-center block">
                    Hire me
                  </span>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                <p className="text-slate-400 font-medium">No agents found matching your search.</p>
              </div>
            )}
          </div>
        )}
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
          {CATEGORIES.map((cat, i) => {
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
                  <span className="text-xs bg-green-200/50 px-2 py-0.5 rounded-full">{categoryCounts[i]}</span>
                ) : (
                  <span className="text-xs font-medium">{categoryCounts[i]}</span>
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
