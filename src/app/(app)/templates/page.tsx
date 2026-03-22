"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  "All Templates",
  "Marketing",
  "Development",
  "Sales",
  "Research",
];

interface PipelineStep {
  label: string;
  borderColor: string;
}

interface TemplateCard {
  icon: string;
  iconBg: string;
  iconColor: string;
  rating: string;
  title: string;
  description: string;
  steps: PipelineStep[];
}

const TEMPLATES: TemplateCard[] = [
  {
    icon: "share",
    iconBg: "bg-[#4d4bff]/10",
    iconColor: "text-[#3028e9]",
    rating: "4.9",
    title: "LinkedIn Outreach",
    description:
      "Automate personalized connection requests and follow-ups based on prospect profile analysis.",
    steps: [
      { label: "Research", borderColor: "border-[#006c05]" },
      { label: "Draft", borderColor: "border-[#3028e9]" },
      { label: "Send", borderColor: "border-[#20e524]" },
    ],
  },
  {
    icon: "analytics",
    iconBg: "bg-[#008808]/10",
    iconColor: "text-[#006c05]",
    rating: "4.7",
    title: "Market Analysis",
    description:
      "Aggregates competitor data, pricing trends, and customer sentiment into a comprehensive report.",
    steps: [
      { label: "Scrape", borderColor: "border-[#3028e9]" },
      { label: "Synthesize", borderColor: "border-[#006c05]" },
      { label: "Chart", borderColor: "border-[#635b53]" },
    ],
  },
  {
    icon: "terminal",
    iconBg: "bg-[#1b1b1b]/5",
    iconColor: "text-[#1b1b1b]",
    rating: "5.0",
    title: "Technical Debt Cleanup",
    description:
      "Automatically identifies deprecated code patterns and proposes refactored solutions.",
    steps: [
      { label: "Scan", borderColor: "border-[#006c05]" },
      { label: "Refactor", borderColor: "border-[#3028e9]" },
      { label: "Review", borderColor: "border-[#006c05]" },
    ],
  },
  {
    icon: "edit_note",
    iconBg: "bg-[#7c736b]/10",
    iconColor: "text-[#635b53]",
    rating: "4.8",
    title: "Blog Post Generator",
    description:
      "Converts a single focus keyword into a SEO-optimized, 1000-word longform article with images.",
    steps: [
      { label: "Outline", borderColor: "border-[#3028e9]" },
      { label: "Write", borderColor: "border-[#006c05]" },
      { label: "SEO", borderColor: "border-[#635b53]" },
    ],
  },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All Templates");

  return (
    <div className="bg-[#f9f9f9] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Category Filter */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Template Library
          </h1>
          <p className="text-[#414753] max-w-2xl mb-8">
            Discover and deploy ready-to-run AI agent pipelines designed for
            modern operational excellence.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  activeCategory === cat
                    ? "bg-[#1b1b1b] text-white"
                    : "bg-white border border-[#c1c6d5] text-[#414753] hover:border-[#006c05] hover:text-[#006c05]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid Template Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standard Template Cards (first 3) */}
          {TEMPLATES.slice(0, 3).map((template) => (
            <div
              key={template.title}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 ${template.iconBg} rounded-lg`}>
                    <span
                      className={`material-symbols-outlined ${template.iconColor}`}
                    >
                      {template.icon}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#ece0d6] px-2 py-1 rounded text-xs font-bold text-[#201b15]">
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    {template.rating}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#006c05] transition-colors">
                  {template.title}
                </h3>
                <p className="text-[#414753] text-sm mb-6 leading-relaxed">
                  {template.description}
                </p>
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Sequence
                  </span>
                  <div className="flex items-center gap-2">
                    {template.steps.map((step, i) => (
                      <div key={step.label} className="contents">
                        {i > 0 && (
                          <span className="material-symbols-outlined text-gray-300 text-sm">
                            arrow_forward
                          </span>
                        )}
                        <div
                          className={`flex-1 bg-[#eeeeee] rounded px-3 py-2 text-[11px] font-semibold text-center border-l-4 ${step.borderColor}`}
                        >
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link href="/today">
                  <button className="w-full py-2.5 bg-[#006c05] text-white rounded-lg font-bold text-sm active:scale-95 transition-transform cursor-pointer">
                    Use Template
                  </button>
                </Link>
              </div>
            </div>
          ))}

          {/* Featured Large Card (Asymmetric Layout) */}
          <div className="md:col-span-2 group bg-gradient-to-br from-white to-[#008808]/5 rounded-xl border border-[#008808]/20 overflow-hidden hover:shadow-2xl transition-all flex flex-col md:flex-row">
            <div className="p-8 md:w-1/2">
              <div className="inline-block px-3 py-1 rounded bg-[#006c05] text-white text-[10px] font-black uppercase tracking-widest mb-4">
                Enterprise Choice
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#006c05] transition-colors">
                Unified Support Agent
              </h3>
              <p className="text-[#414753] text-base mb-6">
                A multi-modal pipeline that handles tickets across Discord,
                Slack, and Email using a central knowledge base.
              </p>
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-3">
                  Orchestration Flow
                </span>
                <div className="flex items-center gap-2">
                  {["Ingest", "Classify", "Resolve", "Notify"].map((step) => (
                    <div
                      key={step}
                      className="flex-1 bg-white border border-gray-100 shadow-sm rounded px-3 py-3 text-[11px] font-semibold text-center"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/today">
                <button className="px-8 py-3 bg-[#1b1b1b] text-white rounded-lg font-bold text-sm active:scale-95 transition-transform cursor-pointer">
                  Use Template
                </button>
              </Link>
            </div>
            <div className="hidden md:block md:w-1/2 relative min-h-[300px]">
              <div className="absolute inset-0 bg-[#006c05]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#006c05] text-7xl absolute opacity-20">
                  hub
                </span>
              </div>
            </div>
          </div>

          {/* Template Card 4 (Blog Post Generator) */}
          <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 ${TEMPLATES[3].iconBg} rounded-lg`}>
                  <span
                    className={`material-symbols-outlined ${TEMPLATES[3].iconColor}`}
                  >
                    {TEMPLATES[3].icon}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#ece0d6] px-2 py-1 rounded text-xs font-bold text-[#201b15]">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  {TEMPLATES[3].rating}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-[#006c05] transition-colors">
                {TEMPLATES[3].title}
              </h3>
              <p className="text-[#414753] text-sm mb-6 leading-relaxed">
                {TEMPLATES[3].description}
              </p>
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Sequence
                </span>
                <div className="flex items-center gap-2">
                  {TEMPLATES[3].steps.map((step, i) => (
                    <div key={step.label} className="contents">
                      {i > 0 && (
                        <span className="material-symbols-outlined text-gray-300 text-sm">
                          arrow_forward
                        </span>
                      )}
                      <div
                        className={`flex-1 bg-[#eeeeee] rounded px-3 py-2 text-[11px] font-semibold text-center border-l-4 ${step.borderColor}`}
                      >
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link href="/today">
                <button className="w-full py-2.5 bg-[#006c05] text-white rounded-lg font-bold text-sm active:scale-95 transition-transform cursor-pointer">
                  Use Template
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
