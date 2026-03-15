"use client";

import { useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { P } from "@/lib/palette";
import { PipelineBlock } from "./pipeline-block";
import type { PipelineStep } from "@/lib/ai/pipelines";

interface PipelineBuilderProps {
  steps: PipelineStep[];
  agentColor: string;
  agentGradient: string;
  editable: boolean;
  onReorder?: (steps: PipelineStep[]) => void;
  onAddStep?: (afterIndex: number, step: PipelineStep) => void;
  onRemoveStep?: (index: number) => void;
  stepStatuses?: Record<number, "pending" | "working" | "done" | "failed">;
  stepOutputs?: Record<number, string>;
  onRerunFrom?: (stepIndex: number) => void;
  expandedStep?: number | null;
  onExpandStep?: (index: number | null) => void;
  renderMarkdown?: (text: string) => React.ReactNode;
}

const STEP_TEMPLATES: { label: string; step: PipelineStep }[] = [
  {
    label: "Web Research",
    step: { description: "Searching the web...", tools: ["web-search"], isCore: true, duration: 0, maxToolSteps: 6 },
  },
  {
    label: "Deep Analysis",
    step: { description: "Analyzing findings...", isCore: true, duration: 0 },
  },
  {
    label: "Refine & Polish",
    step: {
      description: "Refining output...",
      isCore2: true,
      core2Prompt: "Improve and polish this output:\n\n",
      duration: 0,
    },
  },
  {
    label: "Visual Pause",
    step: { description: "Processing...", duration: 1200 },
  },
];

export function PipelineBuilder({
  steps,
  agentColor,
  agentGradient,
  editable,
  onReorder,
  onAddStep,
  onRemoveStep,
  stepStatuses,
  stepOutputs,
  onRerunFrom,
  expandedStep,
  onExpandStep,
  renderMarkdown,
}: PipelineBuilderProps) {
  const [addMenuIndex, setAddMenuIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Header */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: P.textTer,
        letterSpacing: "0.06em",
        marginBottom: 10,
        textTransform: "uppercase" as const,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span>Pipeline ({steps.length} steps)</span>
        {editable && (
          <span style={{ fontSize: 10, fontWeight: 500, color: P.textGhost, textTransform: "none" as const, letterSpacing: 0 }}>
            Drag to reorder
          </span>
        )}
      </div>

      {/* Steps list */}
      <Reorder.Group
        axis="y"
        values={steps}
        onReorder={(newSteps) => onReorder?.(newSteps)}
        style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}
      >
        {steps.map((step, i) => (
          <div key={`step-${i}-${step.description}`}>
            <PipelineBlock
              step={step}
              index={i}
              agentColor={agentColor}
              agentGradient={agentGradient}
              editable={editable}
              status={stepStatuses?.[i]}
              output={stepOutputs?.[i]}
              onRemove={editable && onRemoveStep && steps.length > 1 ? () => onRemoveStep(i) : undefined}
              onRerunFrom={onRerunFrom ? () => onRerunFrom(i) : undefined}
              expanded={expandedStep === i}
              onToggleExpand={onExpandStep ? () => onExpandStep(expandedStep === i ? null : i) : undefined}
              renderMarkdown={renderMarkdown}
            />

            {/* Connector line + add button */}
            {i < steps.length - 1 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: editable ? 24 : 8,
                position: "relative",
              }}>
                {/* Vertical line */}
                <div style={{
                  width: 1.5,
                  height: "100%",
                  backgroundColor: P.border,
                  position: "absolute",
                }} />

                {/* Add button */}
                {editable && onAddStep && (
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <button
                      onClick={() => setAddMenuIndex(addMenuIndex === i ? null : i)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `1.5px solid ${P.border}`,
                        backgroundColor: addMenuIndex === i ? agentColor : "#fff",
                        color: addMenuIndex === i ? "#fff" : P.textTer,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        padding: 0,
                      }}
                    >
                      <Plus size={12} strokeWidth={2.5} />
                    </button>

                    {/* Add step dropdown */}
                    <AnimatePresence>
                      {addMenuIndex === i && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginTop: 4,
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            border: `1px solid ${P.border}`,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            padding: 6,
                            zIndex: 10,
                            width: 180,
                          }}
                        >
                          {STEP_TEMPLATES.map((tmpl) => (
                            <button
                              key={tmpl.label}
                              onClick={() => {
                                onAddStep(i, { ...tmpl.step });
                                setAddMenuIndex(null);
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "transparent",
                                color: P.text,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                textAlign: "left" as const,
                                transition: "background-color 0.1s",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <span style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: tmpl.step.isCore || tmpl.step.isCore2 ? agentColor : P.textGhost,
                                flexShrink: 0,
                              }} />
                              {tmpl.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </Reorder.Group>
    </div>
  );
}
