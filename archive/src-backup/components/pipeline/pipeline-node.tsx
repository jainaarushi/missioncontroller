"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeStatus } from "@/lib/ai/nodes/types";

interface PipelineNodeData {
  label: string;
  type: string;
  icon: string;
  color: string;
  index: number;
  status?: NodeStatus;
}

const TYPE_LABELS: Record<string, string> = {
  input: "Trigger",
  search: "Web Search",
  scrape: "Web Scrape",
  ai: "AI Agent",
  transform: "Transform",
  calculator: "Calculator",
  output: "Output",
  mcp: "MCP Tool",
  conditional: "Branch",
};

function PipelineNodeComponent({ data }: { data: PipelineNodeData }) {
  const status = data.status || "idle";
  const typeLabel = TYPE_LABELS[data.type] || data.type;

  const borderColor = status === "running"
    ? data.color
    : status === "done"
    ? data.color
    : status === "failed"
    ? "#ef4444"
    : "rgba(255,255,255,0.08)";

  const bgColor = status === "running"
    ? `${data.color}08`
    : status === "done"
    ? `${data.color}06`
    : "rgba(255,255,255,0.03)";

  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 220,
        maxWidth: 260,
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "all 0.3s ease",
        boxShadow: status === "running"
          ? `0 0 20px ${data.color}30`
          : "0 2px 8px rgba(0,0,0,0.2)",
        ...(status === "running" ? { animation: "nodeGlow 2s ease-in-out infinite" } : {}),
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />

      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `${data.color}18`,
          border: `1px solid ${data.color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {status === "done" ? (
          <span style={{ color: data.color, fontSize: 14 }}>&#10003;</span>
        ) : status === "failed" ? (
          <span style={{ color: "#ef4444", fontSize: 14 }}>&#10007;</span>
        ) : status === "running" ? (
          <span style={{ fontSize: 14, animation: "spin 1s linear infinite", display: "inline-block" }}>&#x27F3;</span>
        ) : (
          data.icon
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: status !== "idle" ? data.color : "rgba(255,255,255,0.85)",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.index}. {data.label}
        </div>
        <div
          style={{
            fontSize: 9.5,
            color: "rgba(255,255,255,0.4)",
            marginTop: 2,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {typeLabel}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  );
}

export default memo(PipelineNodeComponent);
