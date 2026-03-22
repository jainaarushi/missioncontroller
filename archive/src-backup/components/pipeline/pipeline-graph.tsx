"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import PipelineNodeComponent from "./pipeline-node";
import type { PipelineGraph as PipelineGraphType } from "@/lib/ai/nodes/types";
import type { NodeStatus } from "@/lib/ai/nodes/types";

const nodeTypes = { pipelineNode: PipelineNodeComponent };

interface PipelineGraphProps {
  graph: PipelineGraphType;
  nodeStatuses?: NodeStatus[];
}

export default function PipelineGraph({ graph, nodeStatuses }: PipelineGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const rfNodes: Node[] = graph.nodes.map((node, i) => ({
      id: node.id,
      type: "pipelineNode",
      position: { x: 0, y: i * 100 },
      data: {
        label: node.label,
        type: node.type,
        icon: node.icon,
        color: node.color,
        index: i + 1,
        status: nodeStatuses?.[i] || "idle",
      },
    }));

    const rfEdges: Edge[] = graph.nodes.slice(1).map((node, i) => {
      const sourceId = node.inputs?.[0] || graph.nodes[i].id;
      const status = nodeStatuses?.[i + 1] || "idle";
      const prevStatus = nodeStatuses?.[i] || "idle";
      const edgeColor = prevStatus === "done"
        ? graph.nodes[i].color
        : "rgba(255,255,255,0.1)";

      return {
        id: `e-${sourceId}-${node.id}`,
        source: sourceId,
        target: node.id,
        animated: status === "running",
        style: { stroke: edgeColor, strokeWidth: 1.5, transition: "stroke 0.4s" },
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [graph, nodeStatuses]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{`
        @keyframes nodeGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 24px rgba(255,255,255,0.15); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .react-flow__node { cursor: default !important; }
        .react-flow__controls { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
        .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; fill: rgba(255,255,255,0.5) !important; }
        .react-flow__controls-button:hover { fill: rgba(255,255,255,0.8) !important; background: rgba(255,255,255,0.05) !important; }
        .react-flow__background { opacity: 0.3; }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
