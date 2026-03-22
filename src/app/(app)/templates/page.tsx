"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { P, F } from "@/lib/palette";
import {
  CATEGORY_META,
  TEMPLATE_CATEGORIES,
  TEMPLATE_PIPELINES,
  TEMPLATE_RATINGS,
  TEMPLATE_RUNS,
} from "@/lib/template-agents";

/* ─── Step border colors by index ─── */
const STEP_BORDER_COLORS = [P.lime, P.violet, "#7c736b"];

/* ─── TemplateCard ─── */
function TemplateCard({ agent, rating, pipeline, onUse }: {
  agent: { id: string; icon: string; name: string; description: string | null; slug?: string };
  rating: number;
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
        background: P.bg2,
        border: `1px solid ${hov ? P.border2 : "rgba(0,0,0,0.06)"}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        boxShadow: hov ? "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.2s",
      }}
    >
      {/* Top section */}
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Icon row + rating badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: P.bg3,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}>
            {agent.icon}
          </div>
          <span style={{
            background: "#ece0d6",
            color: P.textSec,
            fontSize: 12,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 6,
            fontFamily: F,
          }}>
            <span style={{ color: P.textSec }}>&#9733;</span> {rating.toFixed(1)}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 20, fontWeight: 700, fontFamily: F,
          marginTop: 16, color: hov ? "#1e8e3e" : P.text, lineHeight: 1.3,
          transition: "color 0.2s",
        }}>
          {agent.name}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 14, color: P.textSec, lineHeight: 1.6,
          marginTop: 8,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>
          {agent.description}
        </div>
      </div>

      {/* Sequence / Pipeline section */}
      {pipeline.length > 0 && (
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{
            fontSize: 10, textTransform: "uppercase",
            letterSpacing: "0.1em", fontWeight: 700,
            color: P.textTer, marginBottom: 8,
          }}>
            Sequence
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {pipeline.map((step, i) => (
              <span key={step.label} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, fontFamily: F,
                  padding: "6px 12px", borderRadius: 4,
                  background: P.bg3,
                  borderLeft: `4px solid ${STEP_BORDER_COLORS[i % STEP_BORDER_COLORS.length]}`,
                  color: P.text,
                  whiteSpace: "nowrap",
                  flex: 1,
                  textAlign: "center" as const,
                }}>
                  {step.icon} {step.label}
                </span>
                {i < pipeline.length - 1 && (
                  <span style={{ color: P.textTer, fontSize: 12, fontWeight: 600 }}>&rarr;</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: 16, background: P.bg3, borderTop: `1px solid ${P.border}`,
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onUse(); }}
          style={{
            width: "100%",
            fontSize: 14,
            fontWeight: 700,
            padding: "10px 0",
            borderRadius: 12,
            background: P.lime,
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontFamily: F,
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#156d2e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = P.lime)}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Use Template
        </button>
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
    <div style={{ padding: "32px 36px", maxWidth: 1280, margin: "0 auto" }}>
      <style>{`
        .tmpl-grid { display: grid; gap: 24px; grid-template-columns: 1fr; }
        @media (min-width: 768px) { .tmpl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .tmpl-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: F,
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          color: P.text,
          lineHeight: 1.2,
          margin: 0,
        }}>
          Template Library
        </h1>
        <p style={{
          fontSize: 15,
          color: P.textSec,
          marginTop: 8,
          lineHeight: 1.6,
        }}>
          Discover and deploy ready-to-run AI agent pipelines designed for modern operational excellence.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {categoryTabs.map((tab) => {
          const isActive = filter === tab;
          const label = tab === "All" ? "All Templates" : tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                fontFamily: F,
                cursor: "pointer",
                border: isActive ? "1px solid #1b1b1b" : "1px solid rgba(0,0,0,0.12)",
                background: isActive ? "#1b1b1b" : P.bg2,
                color: isActive ? "#ffffff" : P.textSec,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.3)";
                  e.currentTarget.style.color = "#1e8e3e";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
                  e.currentTarget.style.color = P.textSec;
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="tmpl-grid">
        {allFilteredAgents.map(({ agent, catId }) => {
          const slug = agent.slug || "";
          const pipeline = TEMPLATE_PIPELINES[slug] || [];
          const rating = TEMPLATE_RATINGS[slug] || 4.5;

          return (
            <TemplateCard
              key={agent.id}
              agent={agent}
              rating={rating}
              pipeline={pipeline}
              onUse={() => handleUseTemplate(slug)}
            />
          );
        })}
      </div>
    </div>
  );
}
