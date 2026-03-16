"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/lib/hooks/use-agents";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { P } from "@/lib/palette";
import type { PipelineStep } from "@/lib/ai/pipelines";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #8B5CF6, #C084FC)",
  "linear-gradient(135deg, #D97706, #FBBF24)",
  "linear-gradient(135deg, #2563EB, #60A5FA)",
  "linear-gradient(135deg, #E11D48, #FB7185)",
  "linear-gradient(135deg, #0891B2, #22D3EE)",
  "linear-gradient(135deg, #EA580C, #FB923C)",
  "linear-gradient(135deg, #7C3AED, #A78BFA)",
  "linear-gradient(135deg, #059669, #34D399)",
  "linear-gradient(135deg, #BE185D, #F472B6)",
  "linear-gradient(135deg, #1D4ED8, #93C5FD)",
  "linear-gradient(135deg, #B45309, #FCD34D)",
  "linear-gradient(135deg, #6D28D9, #C4B5FD)",
];

const TEMPLATE_CATEGORIES = [
  {
    title: "Career & Job Search",
    icon: "\u{1F4BC}",
    gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
    color: "#2563EB",
    slugs: ["job-hunter", "auto-applier", "resume-optimizer", "interview-coach", "salary-negotiator", "linkedin-optimizer", "career-pivoter", "remote-job-finder", "portfolio-builder", "networking-coach"],
  },
  {
    title: "Money & Bills",
    icon: "\u{1F4B5}",
    gradient: "linear-gradient(135deg, #059669, #34D399)",
    color: "#059669",
    slugs: ["subscription-killer", "bill-negotiator", "tax-deduction-finder", "credit-score-coach", "deal-spotter", "debt-snowball", "budget-builder", "crypto-tax-helper", "retirement-planner", "cashback-maximizer"],
  },
  {
    title: "Legal & Rights",
    icon: "\u2696\uFE0F",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    color: "#7C3AED",
    slugs: ["dispute-fighter", "benefits-finder", "lease-reviewer", "immigration-helper", "small-claims-advisor", "tenant-rights", "will-planner", "traffic-ticket"],
  },
  {
    title: "Housing & Moving",
    icon: "\u{1F3E0}",
    gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
    color: "#D97706",
    slugs: ["apartment-scout", "moving-coordinator", "utility-optimizer", "roommate-matcher", "home-inspector", "renovation-planner", "neighborhood-scout"],
  },
  {
    title: "Health & Medical",
    icon: "\u{1FA7A}",
    gradient: "linear-gradient(135deg, #DC2626, #F87171)",
    color: "#DC2626",
    slugs: ["medical-bill-auditor", "insurance-comparer", "symptom-researcher", "prescription-saver", "meal-prep-planner", "sleep-optimizer", "therapy-finder", "supplement-advisor", "allergy-navigator"],
  },
  {
    title: "Education",
    icon: "\u{1F393}",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
    color: "#0891B2",
    slugs: ["scholarship-hunter", "college-advisor", "study-plan-maker", "essay-coach", "skill-roadmap", "language-tutor"],
  },
  {
    title: "Smart Shopping",
    icon: "\u{1F6CD}\uFE0F",
    gradient: "linear-gradient(135deg, #C026D3, #E879F9)",
    color: "#C026D3",
    slugs: ["return-assistant", "car-buy-negotiator", "warranty-claimer", "tech-buyer", "grocery-optimizer", "gift-finder"],
  },
  {
    title: "Freelance & Side Income",
    icon: "\u26A1",
    gradient: "linear-gradient(135deg, #EA580C, #FB923C)",
    color: "#EA580C",
    slugs: ["freelance-bid-writer", "side-hustle-matcher", "contract-reviewer", "invoice-generator", "client-proposal", "rate-calculator"],
  },
  {
    title: "Parenting & Family",
    icon: "\u{1F476}",
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    color: "#8B5CF6",
    slugs: ["baby-name-picker", "school-chooser", "chore-organizer", "college-savings", "childcare-finder", "summer-camp-finder"],
  },
  {
    title: "Travel & Events",
    icon: "\u2708\uFE0F",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
    color: "#0891B2",
    slugs: ["flight-deal-hunter", "wedding-planner", "party-planner", "visa-advisor", "road-trip-planner", "packing-assistant"],
  },
  {
    title: "Personal Growth",
    icon: "\u{1F305}",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    color: "#F59E0B",
    slugs: ["habit-tracker", "journaling-coach", "morning-routine", "social-skills", "dating-profile", "pet-care-advisor"],
  },
];

export default function TemplatesPage() {
  const { agents } = useAgents();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAgentId, setCreateAgentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all template agents for search
  const templateAgents = useMemo(() => {
    const allSlugs = TEMPLATE_CATEGORIES.flatMap(c => c.slugs);
    return agents.filter(a => allSlugs.includes(a.slug || ""));
  }, [agents]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return templateAgents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.long_description || "").toLowerCase().includes(q)
    );
  }, [templateAgents, searchQuery]);

  return (
    <>
      <style>{`
        @keyframes slideUp { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: P.text, margin: "0 0 6px",
          letterSpacing: "-0.03em",
        }}>
          Task Templates
        </h1>
        <p style={{ fontSize: 14, color: P.textSec, lineHeight: 1.5 }}>
          Real-world AI agents for everyday tasks — jobs, bills, leases, health, and more
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: 28, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both",
      }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          style={{
            width: "100%", padding: "12px 18px", borderRadius: 14,
            border: `2px solid ${P.border}`, fontSize: 14, color: P.text,
            outline: "none", backgroundColor: P.card,
            fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F160"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
        />
      </div>

      {/* Search Results */}
      {filteredBySearch && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: P.textSec, marginBottom: 14,
          }}>
            {filteredBySearch.length} result{filteredBySearch.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}>
            {filteredBySearch.map((agent, i) => (
              <TemplateCard
                key={agent.id}
                agent={agent}
                bg={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                onClick={() => {
                  setCreateAgentId(agent.id);
                  setShowCreateModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category sections */}
      {!filteredBySearch && TEMPLATE_CATEGORIES.map((cat, catIdx) => {
        const catAgents = cat.slugs
          .map(slug => agents.find(a => a.slug === slug))
          .filter(Boolean);
        if (catAgents.length === 0) return null;

        return (
          <div key={cat.title} style={{
            marginBottom: 32,
            animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.1 + catIdx * 0.05}s both`,
          }}>
            {/* Category header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 14,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: cat.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                boxShadow: `0 4px 12px ${cat.color}25`,
              }}>
                {cat.icon}
              </div>
              <span style={{
                fontSize: 15, fontWeight: 800, color: P.text,
                letterSpacing: "-0.02em",
              }}>
                {cat.title}
              </span>
            </div>

            {/* Template cards grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}>
              {catAgents.map((agent, j) => {
                if (!agent) return null;
                const catOffset = catIdx * 3;
                const bg = CARD_GRADIENTS[(j + catOffset) % CARD_GRADIENTS.length];
                return (
                  <TemplateCard
                    key={agent.id}
                    agent={agent}
                    bg={bg}
                    onClick={() => {
                      setCreateAgentId(agent.id);
                      setShowCreateModal(true);
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      <CreateTaskModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateAgentId(null); }}
        onSubmit={async (title: string, agentIds?: string[], fileContent?: string, _customPipeline?: PipelineStep[]) => {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              agent_ids: agentIds,
              description: fileContent || undefined,
              section: "today",
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setShowCreateModal(false);
            setCreateAgentId(null);
            // Auto-run if agent assigned
            if (agentIds?.length) {
              await fetch(`/api/tasks/${data.id}/run`, { method: "POST" });
            }
            router.push("/today");
          }
        }}
        agents={agents}
        preSelectedAgentId={createAgentId || undefined}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TemplateCard({ agent, bg, onClick }: { agent: any; bg: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        borderRadius: 22,
        height: 200,
        cursor: "pointer",
        overflow: "hidden",
        background: bg,
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px) scale(1.02)";
        el.style.boxShadow = "0 20px 50px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0) scale(1)";
        el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
      }}
    >
      <div style={{
        position: "relative",
        height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 20px 18px",
      }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
        }}>
          {agent.icon}
        </div>

        {/* Name + tagline + description */}
        <div>
          <div style={{
            fontSize: 20, fontWeight: 900, color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            lineHeight: 1.15, letterSpacing: "-0.03em",
            marginBottom: 3,
          }}>
            {agent.name}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.02em",
            textTransform: "uppercase" as const,
            marginBottom: 4,
          }}>
            {agent.description}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.72)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}>
            {agent.long_description || ""}
          </div>
        </div>
      </div>
    </div>
  );
}
