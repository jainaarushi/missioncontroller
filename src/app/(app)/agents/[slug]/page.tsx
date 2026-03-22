"use client";

import Link from "next/link";

const SKILL_TAGS = [
  "Deep Market Research",
  "Quantitative Analysis",
  "Competitor Benchmarking",
  "Trend Forecasting",
  "Sentiment Analysis",
];

const DIRECTIVE_PRESETS = [
  "Market Landscape Analysis",
  "Competitor Deep-Dive",
  "Product-Market Fit Audit",
  "Sector Trend Prediction",
];

export default function SpecialistProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A] font-['Inter'] antialiased">
      {/* Fixed Header */}
      <header className="flex items-center justify-between px-8 h-20 w-full z-50 sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="flex items-center gap-6">
          <Link
            href="/agents"
            className="text-slate-500 hover:text-[#16A34A] transition-colors flex items-center gap-2 font-medium text-sm group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back to Directory
          </Link>
          <div className="h-6 w-[1px] bg-slate-200" />
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-slate-900 font-semibold text-sm">
              Specialist Profile
            </span>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-slate-500 text-sm">Research Strategist</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider">
              Operational
            </span>
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="pt-12 pb-20 px-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Profile Section */}
          <section className="bg-white rounded-2xl p-10 border border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-start gap-10">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="relative">
                  <div className="w-40 h-40 rounded-2xl bg-slate-50 flex items-center justify-center border border-[#E2E8F0] shadow-sm ring-4 ring-white">
                    <span
                      className="material-symbols-outlined text-slate-400 text-7xl"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      psychology
                    </span>
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-lg shadow-md">
                    <div className="bg-[#16A34A] text-white px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
                      Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-4xl font-extrabold text-[#0F172A] tracking-tight">
                      Research Strategist
                    </h2>
                    <span className="inline-flex items-center gap-1.5 bg-green-100/50 text-[#16A34A] px-3 py-1 rounded-full text-xs font-bold border border-green-200/50">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      Verified Expert
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm font-medium">
                      Internal System Agent
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-slate-400 text-sm font-medium">
                      V4.2.0
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                    Expertise &amp; Focus
                  </h3>
                  <p className="text-[#475569] text-lg leading-relaxed font-normal">
                    A high-intelligence autonomous agent specializing in{" "}
                    <span className="text-slate-900 font-semibold">
                      deep market analysis
                    </span>
                    ,{" "}
                    <span className="text-slate-900 font-semibold">
                      competitive intelligence
                    </span>
                    , and{" "}
                    <span className="text-slate-900 font-semibold">
                      multi-source data synthesis
                    </span>
                    . Engineered for complex strategic inquiries where nuanced
                    understanding and trend prediction are paramount.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {SKILL_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-4 py-2 rounded-lg font-semibold hover:border-[#16A34A]/50 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Technical Capabilities */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#16A34A]">
                  speed
                </span>
              </div>
              <h4 className="font-bold text-slate-900">Processing Speed</h4>
              <p className="text-sm text-[#475569] leading-relaxed">
                Operates at High-Velocity (HV) mode, capable of parsing 500+
                documents per minute while maintaining context coherence.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">
                  database
                </span>
              </div>
              <h4 className="font-bold text-slate-900">Knowledge Base</h4>
              <p className="text-sm text-[#475569] leading-relaxed">
                Integrated with live web access and proprietary internal
                databases for real-time strategic alignment.
              </p>
            </div>
          </section>

          {/* Dark CTA Section */}
          <section className="bg-slate-900 rounded-2xl p-10 border border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#16A34A]/20 rounded-full -mr-48 -mt-48 blur-[100px] opacity-50 transition-opacity group-hover:opacity-70" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  Need a custom strategic directive?
                </h3>
                <p className="text-slate-400 text-base max-w-lg">
                  For unique requirements, initiate a custom task configuration.
                  This allows you to define granular parameters, output formats,
                  and specific data constraints.
                </p>
              </div>
              <button className="whitespace-nowrap bg-[#16A34A] text-white px-10 py-4 rounded-xl font-bold hover:bg-green-500 hover:shadow-lg hover:shadow-[#16A34A]/20 transition-all active:scale-95 flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">tune</span>
                Configure Custom Task
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Deployment Column */}
        <div className="lg:col-span-4 space-y-6">
          <aside className="sticky top-28">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg overflow-hidden">
              <div className="bg-slate-50 px-8 py-6 border-b border-[#E2E8F0]">
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-[0.2em]">
                  Deployment Console
                </h3>
              </div>
              <div className="p-8 space-y-8">
                {/* Task Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-900 uppercase ml-1">
                    Select Directive Preset
                  </label>
                  <div className="relative group">
                    <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 appearance-none text-sm font-medium focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] outline-none transition-all cursor-pointer">
                      {DIRECTIVE_PRESETS.map((preset) => (
                        <option key={preset}>{preset}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#16A34A] transition-colors">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">
                      Deployment Priority
                    </span>
                    <span className="text-slate-900 font-bold">Standard</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">
                      Est. Completion
                    </span>
                    <span className="text-slate-900 font-bold">
                      12-18 Minutes
                    </span>
                  </div>
                  <div className="h-[1px] bg-slate-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">
                      Credit Cost
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#16A34A] text-lg">
                        generating_tokens
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        450
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="space-y-4">
                  <button className="w-full bg-[#16A34A] hover:bg-green-600 text-white font-extrabold py-5 rounded-xl shadow-xl shadow-[#16A34A]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group">
                    <span>Execute Deployment</span>
                    <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                      rocket_launch
                    </span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium italic">
                    <span className="material-symbols-outlined text-[14px]">
                      info
                    </span>
                    Credits are auto-deducted upon initialization.
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Help */}
            <div className="mt-6 p-6 border border-slate-200 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-slate-400">
                help_outline
              </span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  Need help with presets?
                </p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  View the{" "}
                  <a
                    className="text-[#16A34A] hover:underline"
                    href="#"
                  >
                    Directive Documentation
                  </a>{" "}
                  to understand the output of each preset.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-[60] lg:hidden">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-[#16A34A] text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">rocket_launch</span>
            Confirm &amp; Deploy
          </button>
        </div>
      </div>
    </div>
  );
}
