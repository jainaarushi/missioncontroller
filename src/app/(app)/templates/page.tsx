"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { P, F, FS } from "@/lib/palette";
import {
  CATEGORY_META,
  TEMPLATE_CATEGORIES,
  TEMPLATE_PIPELINES,
  TEMPLATE_RATINGS,
  TEMPLATE_RUNS,
} from "@/lib/template-agents";


/* ─── Pill component ─── */
function Pill({ children, color = P.lime, bg = "rgba(197,241,53,0.13)", size = 10 }: {
  children: React.ReactNode; color?: string; bg?: string; size?: number;
}) {
  return (
    <span style={{
      fontSize: size, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
      background: bg, color, letterSpacing: "0.04em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

/* ─── FTabs — filter tabs matching reference ─── */
function FTabs({ tabs, active, onChange }: {
  tabs: string[]; active: string; onChange: (t: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: "5px 12px", borderRadius: 100, fontSize: 11,
          cursor: "pointer", fontFamily: F, fontWeight: active === t ? 700 : 500,
          border: `1px solid ${active === t ? P.lime : P.border}`,
          background: active === t ? P.lime : P.bg3,
          color: active === t ? "#0b0b0e" : P.textSec,
          transition: "all 0.15s",
        }}>{t}</button>
      ))}
    </div>
  );
}

/* ─── TemplateCard — compact card matching reference exactly ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TemplateCard({ agent, cat, rating, runs, pipeline, onUse }: {
  agent: { id: string; icon: string; name: string; description: string | null; slug?: string };
  cat: { label: string; color: string; catBg: string };
  rating: number;
  runs: string;
  pipeline: { icon: string; label: string; color: string }[];
  onUse: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onUse}
      style={{
        background: P.bg2, border: `1px solid ${hov ? P.border2 : P.border}`,
        borderRadius: 15, overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.2s", minWidth: 0,
      }}
    >
      {/* Gradient stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}44)` }} />

      <div style={{ padding: "13px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header: icon + name + category pill + rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: cat.catBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>{agent.icon}</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: F, marginBottom: 2 }}>{agent.name}</div>
              <Pill color={cat.color} bg={cat.catBg} size={9}>{cat.label}</Pill>
            </div>
          </div>
          <span style={{ fontSize: 11, color: P.amber, fontWeight: 700 }}>★ {rating}</span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 11, color: P.textSec, lineHeight: 1.55, marginBottom: 10 }}>
          {agent.description}
        </div>

        {/* Pipeline agent preview */}
        {pipeline.length > 0 && (
          <div style={{
            padding: "9px 11px", background: P.bg3,
            borderRadius: 8, border: `1px solid ${P.border}`, marginBottom: 10,
          }}>
            <div style={{
              fontSize: 9, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: P.textTer, marginBottom: 6,
            }}>
              {pipeline.length} agents
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {pipeline.map((step, i) => (
                <span key={step.label}>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4,
                    background: P.bg4, border: `1px solid ${step.color}33`,
                    color: step.color, fontFamily: F, fontWeight: 600,
                  }}>
                    {step.icon} {step.label}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span style={{ color: P.textTer, fontSize: 9, margin: "0 1px" }}>›</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer: runs + Use Template button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto", paddingTop: 9,
          borderTop: `1px solid ${P.border}`,
        }}>
          <span style={{ fontSize: 10, color: P.textTer }}>{runs} runs</span>
          <button onClick={(e) => { e.stopPropagation(); onUse(); }} style={{
            fontSize: 10.5, fontWeight: 700, padding: "5px 12px", borderRadius: 7,
            background: P.lime, color: "#0b0b0e", border: "none",
            cursor: "pointer", fontFamily: F,
          }}>
            Use Template →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Templates Page ─── */
export default function TemplatesPage() {
  const { agents } = useAgents();
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  // Build unique category labels for tabs
  const categoryTabs = useMemo(() => {
    return ["All", ...TEMPLATE_CATEGORIES.map(c => c.title)];
  }, []);

  // Filter categories by selected tab
  const filteredCategories = useMemo(() => {
    if (filter === "All") return TEMPLATE_CATEGORIES;
    return TEMPLATE_CATEGORIES.filter(c => c.title === filter);
  }, [filter]);

  // Get all template agents in a flat list for the selected filter
  const allFilteredAgents = useMemo(() => {
    const result: { agent: typeof agents[0]; catId: string }[] = [];
    for (const cat of filteredCategories) {
      for (const slug of cat.slugs) {
        const agent = agents.find(a => a.slug === slug);
        if (agent) result.push({ agent, catId: cat.id });
      }
    }
    return result;
  }, [filteredCategories, agents]);

  function handleUseTemplate(slug: string) {
    router.push(`/templates/${slug}`);
  }

  return (
    <div style={{ padding: "20px 26px" }}>
      {/* Header — matches reference: serif italic heading */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{
          fontFamily: FS, fontSize: 22, fontWeight: 400, lineHeight: 1.2, marginBottom: 5,
        }}>
          Pre-built <span style={{ fontStyle: "italic", color: P.lime2 }}>agent pipelines</span> — ready to run.
        </h2>
        <div style={{ fontSize: 11.5, color: P.textSec }}>
          Click &quot;Use Template&quot; to launch an AI agent pipeline for your task.
        </div>
      </div>

      {/* Filter tabs */}
      <FTabs tabs={categoryTabs} active={filter} onChange={setFilter} />

      {/* Template cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}>
        {allFilteredAgents.map(({ agent, catId }) => {
          const slug = agent.slug || "";
          const cat = CATEGORY_META[catId] || { label: catId, color: P.textSec, catBg: `${P.textSec}15` };
          const pipeline = TEMPLATE_PIPELINES[slug] || [];
          const rating = TEMPLATE_RATINGS[slug] || 4.5;
          const runs = TEMPLATE_RUNS[slug] || "1.0k";

          return (
            <TemplateCard
              key={agent.id}
              agent={agent}
              cat={cat}
              rating={rating}
              runs={runs}
              pipeline={pipeline}
              onUse={() => handleUseTemplate(slug)}
            />
          );
        })}
      </div>

    </div>
  );
}
