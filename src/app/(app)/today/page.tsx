"use client";

export default function TodayPage() {
  return (
    <div className="p-8 min-h-screen">
      {/* Create Task Hero Section */}
      <section className="mb-12">
        <button className="w-full bg-[#1e8e3e] hover:bg-[#1b7e37] transition-all duration-300 p-10 rounded-3xl shadow-2xl border border-[#156d2e] flex items-center justify-between group overflow-hidden relative text-left">
          <div className="absolute right-0 top-0 -mr-12 -mt-12 w-80 h-80 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="h-24 w-24 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 group-hover:rotate-6 transition-transform duration-500">
              <span className="material-symbols-outlined text-white text-[56px] font-black">
                add
              </span>
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight">
                Create New Initiative
              </h2>
              <p className="text-white/80 font-medium mt-2 text-xl max-w-lg">
                Launch a new autonomous task and assign specialist agents instantly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-8 py-4 rounded-full border border-white/20 text-white font-black group-hover:bg-white/20 transition-all relative z-10 shadow-lg">
            <span>Start Building</span>
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </div>
        </button>
      </section>

      {/* Specialist Agents Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#1978e5] rounded-full" />
            <h2 className="text-2xl font-black tracking-tight text-[#1b1b1b]">
              Specialist Agents
            </h2>
          </div>
          <a
            className="hidden md:flex items-center gap-2 text-[#1978e5] font-bold text-sm mr-4 group"
            href="#"
          >
            <span>View All Specialists</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
          <div className="flex gap-2 items-center">
            <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#1978e5] hover:border-[#1978e5] transition-all shadow-sm">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#1978e5] hover:border-[#1978e5] transition-all shadow-sm">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory">
          {/* Agent Card 1 */}
          <div className="min-w-[340px] bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all p-7 snap-start group relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black tracking-wider uppercase border border-green-100/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-black text-[#1b1b1b] mb-2">Research Strategist</h3>
            <p className="text-sm text-[#44474e]/80 leading-relaxed font-medium mb-6">
              Master of deep market analysis, lead generation, and multi-source web intelligence
              scraping.
            </p>
            <div className="pt-5 border-t border-gray-50 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                Market Analysis
              </span>
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                Data Scraping
              </span>
            </div>
          </div>

          {/* Agent Card 2 */}
          <div className="min-w-[340px] bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all p-7 snap-start group relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-50/50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  terminal
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black tracking-wider uppercase border border-green-100/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-black text-[#1b1b1b] mb-2">Full-Stack AI Dev</h3>
            <p className="text-sm text-[#44474e]/80 leading-relaxed font-medium mb-6">
              Orchestrates automated code reviews, complex refactors, and end-to-end integration
              cycles.
            </p>
            <div className="pt-5 border-t border-gray-50 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                CI/CD
              </span>
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                Node.js
              </span>
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                Python
              </span>
            </div>
          </div>

          {/* Agent Card 3 */}
          <div className="min-w-[340px] bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all p-7 snap-start group relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50/50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  edit_document
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-black tracking-wider uppercase border border-slate-200/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                IDLE
              </span>
            </div>
            <h3 className="text-xl font-black text-[#1b1b1b] mb-2">Content Architect</h3>
            <p className="text-sm text-[#44474e]/80 leading-relaxed font-medium mb-6">
              Synthesizes newsletters, engaging social narratives, and deep-dive technical
              documentation.
            </p>
            <div className="pt-5 border-t border-gray-50 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                Copywriting
              </span>
              <span className="px-3 py-1 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-lg border border-gray-100">
                Strategy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl font-black tracking-tight">Featured Templates</h2>
          <a
            className="hidden md:flex items-center gap-2 text-[#1978e5] font-bold text-sm mr-4 group"
            href="#"
          >
            <span>View All Templates</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
          <div className="flex gap-2 items-center">
            <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#1978e5] transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#1978e5] transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {/* Template 1 - LinkedIn Outreach */}
          <div className="min-w-[320px] bg-gradient-to-br from-[#4b30a1] to-[#6344d4] rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 snap-start group cursor-pointer relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-3xl">alternate_email</span>
              </div>
              <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors">
                arrow_outward
              </span>
            </div>
            <h3 className="text-xl font-black text-white relative z-10">LinkedIn Outreach</h3>
            <p className="text-sm text-white/80 mt-3 leading-relaxed relative z-10 font-medium">
              Full-cycle research, personalized drafting, and automated scheduling logic.
            </p>
            <div className="mt-8 flex gap-2 relative z-10">
              <span className="px-3 py-1 bg-white/10 text-[10px] font-black text-white rounded-lg border border-white/10 uppercase tracking-wider">
                2 Agents
              </span>
              <span className="px-3 py-1 bg-white/10 text-[10px] font-black text-white rounded-lg border border-white/10 uppercase tracking-wider">
                Sales
              </span>
            </div>
          </div>

          {/* Template 2 - Market Pulse */}
          <div className="min-w-[320px] bg-gradient-to-br from-[#006064] to-[#0097a7] rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 snap-start group cursor-pointer relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-3xl">analytics</span>
              </div>
              <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors">
                arrow_outward
              </span>
            </div>
            <h3 className="text-xl font-black text-white relative z-10">Market Pulse</h3>
            <p className="text-sm text-white/80 mt-3 leading-relaxed relative z-10 font-medium">
              Real-time competitor tracking, pricing intelligence, and sentiment reports.
            </p>
            <div className="mt-8 flex gap-2 relative z-10">
              <span className="px-3 py-1 bg-white/10 text-[10px] font-black text-white rounded-lg border border-white/10 uppercase tracking-wider">
                3 Agents
              </span>
              <span className="px-3 py-1 bg-white/10 text-[10px] font-black text-white rounded-lg border border-white/10 uppercase tracking-wider">
                Strategy
              </span>
            </div>
          </div>

          {/* Template 3 - Tech Debt Purge */}
          <div className="min-w-[320px] bg-gradient-to-br from-[#0d47a1] to-[#1976d2] rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 snap-start group cursor-pointer relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-3xl">cleaning_services</span>
              </div>
              <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors">
                arrow_outward
              </span>
            </div>
            <h3 className="text-xl font-black text-white relative z-10">Tech Debt Purge</h3>
            <p className="text-sm text-white/80 mt-3 leading-relaxed relative z-10 font-medium">
              Automated linting, refactor suggestions, and dependency health checks.
            </p>
            <div className="mt-8 flex gap-2 relative z-10">
              <span className="px-3 py-1 bg-white/10 text-[10px] font-black text-white rounded-lg border border-white/10 uppercase tracking-wider">
                1 Agent
              </span>
              <span className="px-3 py-1 bg-white/10 text-[10px] font-black text-white rounded-lg border border-white/10 uppercase tracking-wider">
                DevOps
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5]">
              <span className="material-symbols-outlined text-2xl">memory</span>
            </div>
            <span className="text-[#1978e5] text-[10px] font-black px-3 py-1 bg-[#1978e5]/10 rounded-full tracking-widest uppercase">
              Live Status
            </span>
          </div>
          <span className="text-[#44474e] text-sm font-bold mb-1">Active Agents Swarm</span>
          <div className="text-5xl font-black text-[#1b1b1b] tracking-tighter">24</div>
          <div className="mt-6 flex items-center gap-2 text-green-600 text-xs font-black">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span>+18% productivity increase</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-2xl">task_alt</span>
            </div>
          </div>
          <span className="text-[#44474e] text-sm font-bold mb-1">Cumulative Completed Tasks</span>
          <div className="text-5xl font-black text-[#1b1b1b] tracking-tighter">1,482</div>
          <div className="mt-6 flex items-center gap-2 text-[#44474e] text-xs font-bold uppercase tracking-wider opacity-60">
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Since last global sync</span>
          </div>
        </div>
      </div>

      {/* Agent Agency Orchestration Diagram */}
      <section className="mb-12">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden relative">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-[#1978e5]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 p-12 flex flex-col items-center justify-center min-h-[500px]">
            {/* Diagram Container */}
            <div className="relative w-full max-w-2xl h-[300px] flex items-center justify-center">
              {/* SVG Connecting Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                viewBox="0 0 800 300"
              >
                <line
                  stroke="#1978e5"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                  x1="400"
                  x2="200"
                  y1="150"
                  y2="80"
                />
                <line
                  stroke="#1978e5"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                  x1="400"
                  x2="250"
                  y1="150"
                  y2="230"
                />
                <line
                  stroke="#1978e5"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                  x1="400"
                  x2="600"
                  y1="150"
                  y2="80"
                />
                <line
                  stroke="#1978e5"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                  x1="400"
                  x2="550"
                  y1="150"
                  y2="230"
                />
              </svg>

              {/* Central User Task Node */}
              <div className="z-20 w-32 h-32 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(25,120,229,0.15)] border border-[#1978e5]/20 flex flex-col items-center justify-center p-4 group transition-transform hover:scale-105">
                <div className="w-14 h-14 bg-[#1978e5] text-white rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                  <span className="material-symbols-outlined text-3xl font-bold">
                    rocket_launch
                  </span>
                </div>
                <span className="text-xs font-black text-[#1b1b1b] text-center uppercase tracking-tighter">
                  Your Project
                </span>
              </div>

              {/* Specialist Nodes */}
              {/* Researcher */}
              <div className="absolute top-0 left-[15%] animate-float">
                <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-xl">travel_explore</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-blue-900 leading-none">
                      Researcher
                    </h5>
                    <p className="text-[9px] text-blue-700/70 font-bold mt-0.5">
                      Finding insights
                    </p>
                  </div>
                </div>
              </div>

              {/* Copywriter */}
              <div className="absolute bottom-0 left-[20%] animate-float-delayed">
                <div className="bg-purple-50/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-xl">edit_note</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-purple-900 leading-none">
                      Copywriter
                    </h5>
                    <p className="text-[9px] text-purple-700/70 font-bold mt-0.5">
                      Drafting content
                    </p>
                  </div>
                </div>
              </div>

              {/* LinkedIn Specialist */}
              <div className="absolute top-0 right-[15%] animate-float-extra-delayed">
                <div className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-xl">share</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-indigo-900 leading-none">
                      LinkedIn Pro
                    </h5>
                    <p className="text-[9px] text-indigo-700/70 font-bold mt-0.5">
                      Managing outreach
                    </p>
                  </div>
                </div>
              </div>

              {/* Designer */}
              <div className="absolute bottom-5 right-[18%] animate-float">
                <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-xl">palette</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-rose-900 leading-none">
                      Visual Agent
                    </h5>
                    <p className="text-[9px] text-rose-700/70 font-bold mt-0.5">
                      Polishing assets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="text-center mt-12">
              <h3 className="text-3xl font-black text-[#1b1b1b] tracking-tight">
                One Platform. Infinite Specialists.
              </h3>
              <p className="text-[#44474e] font-medium text-lg mt-2 italic opacity-80">
                Your tasks, orchestrated with precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 h-16 w-16 rounded-2xl bg-[#1978e5] text-white shadow-[0_15px_35px_rgb(25,120,229,0.4)] flex items-center justify-center hover:scale-110 hover:-rotate-3 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl font-black">add</span>
      </button>
    </div>
  );
}
