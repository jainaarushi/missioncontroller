"use client";

import { useState } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "framer-motion";
import { GripVertical, X, RotateCcw, Check, Loader2, Circle, ChevronDown } from "lucide-react";
import { P } from "@/lib/palette";
import type { PipelineStep } from "@/lib/ai/pipelines";

interface PipelineBlockProps {
  step: PipelineStep;
  index: number;
  agentColor: string;
  agentGradient: string;
  editable: boolean;
  status?: "pending" | "working" | "done" | "failed";
  output?: string;
  onRemove?: () => void;
  onRerunFrom?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  renderMarkdown?: (text: string) => React.ReactNode;
}

export function PipelineBlock({
  step,
  index,
  agentColor,
  agentGradient,
  editable,
  status,
  output,
  onRemove,
  onRerunFrom,
  expanded,
  onToggleExpand,
  renderMarkdown,
}: PipelineBlockProps) {
  const dragControls = useDragControls();
  const [hovered, setHovered] = useState(false);
  const isCore = step.isCore || step.isCore2;

  const statusIcon = status === "done" ? (
    <Check size={13} strokeWidth={3} color="#10B981" />
  ) : status === "working" ? (
    <Loader2 size={13} strokeWidth={2.5} color={agentColor} style={{ animation: "spin 1s linear infinite" }} />
  ) : status === "failed" ? (
    <X size={13} strokeWidth={3} color="#EF4444" />
  ) : (
    <Circle size={11} strokeWidth={2} color={P.textGhost} />
  );

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      transition={{ duration: 0.2 }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (output && onToggleExpand) onToggleExpand();
        }}
        style={{
          position: "relative",
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: "14px 16px",
          border: `1.5px solid ${isCore ? agentColor + "30" : P.border}`,
          borderLeft: `4px solid ${isCore ? agentColor : P.border}`,
          boxShadow: isCore
            ? `0 0 12px ${agentColor}15, 0 1px 4px rgba(0,0,0,0.04)`
            : "0 1px 4px rgba(0,0,0,0.04)",
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          cursor: output ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Drag handle */}
        {editable && (
          <div
            onPointerDown={(e) => dragControls.start(e)}
            style={{
              cursor: "grab",
              opacity: hovered ? 0.6 : 0,
              transition: "opacity 0.15s",
              display: "flex",
              alignItems: "center",
              touchAction: "none",
            }}
          >
            <GripVertical size={16} color={P.textTer} />
          </div>
        )}

        {/* Step number / status */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isCore ? agentGradient : P.sidebar,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
          color: isCore ? "#fff" : P.textTer,
        }}>
          {status ? statusIcon : index + 1}
        </div>

        {/* Description + tools */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: isCore ? 650 : 500,
            color: isCore ? P.text : P.textSec,
            lineHeight: 1.4,
          }}>
            {step.description}
          </div>
          {step.tools && step.tools.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {step.tools.map((tool) => (
                <span key={tool} style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: P.indigo,
                  padding: "1px 7px",
                  borderRadius: 4,
                  backgroundColor: P.indigoLight,
                }}>
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Core badge */}
        {isCore && !status && (
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: agentColor,
            padding: "2px 6px",
            borderRadius: 4,
            backgroundColor: agentColor + "12",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}>
            {step.isCore2 ? "REFINE" : "AI"}
          </span>
        )}

        {/* Expand indicator for completed steps with output */}
        {output && (
          <ChevronDown
            size={14}
            color={P.textTer}
            style={{
              transition: "transform 0.2s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        )}

        {/* Rerun from here button */}
        {onRerunFrom && status === "done" && hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onRerunFrom(); }}
            title="Rerun from this step"
            style={{
              position: "absolute",
              right: onRemove ? 32 : 8,
              top: 8,
              background: "none",
              border: `1px solid ${agentColor}30`,
              borderRadius: 6,
              padding: "3px 6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontWeight: 600,
              color: agentColor,
              transition: "all 0.15s",
            }}
          >
            <RotateCcw size={10} />
            Rerun
          </button>
        )}

        {/* Remove button */}
        {editable && onRemove && hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: P.textTer,
              padding: 2,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = P.textTer; }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Expandable output panel */}
      <AnimatePresence>
        {expanded && output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              margin: "0 0 0 16px",
              padding: "14px 18px",
              borderLeft: `2px solid ${agentColor}25`,
              fontSize: 13,
              color: P.textSec,
              lineHeight: 1.65,
              maxHeight: 300,
              overflowY: "auto",
            }}>
              {renderMarkdown ? renderMarkdown(output) : (
                <pre style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  margin: 0,
                }}>{output}</pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Reorder.Item>
  );
}
