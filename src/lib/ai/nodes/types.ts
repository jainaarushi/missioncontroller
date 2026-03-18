// Node type system for deterministic pipeline graphs

export type NodeType =
  | "input"
  | "search"
  | "scrape"
  | "ai"
  | "transform"
  | "calculator"
  | "output";

// Data bag flowing between nodes during execution
export interface NodeContext {
  taskTitle: string;
  taskDescription: string | null;
  today: string;
  outputs: Record<string, unknown>;
  latestText: string;
}

// ─── Node config variants ───

export interface InputConfig {
  type: "input";
}

export interface SearchConfig {
  type: "search";
  queries: string[] | ((ctx: NodeContext) => string[]);
  maxResults?: number;
}

export interface ScrapeConfig {
  type: "scrape";
  urlsFrom: string; // Node ID to get URLs from
  maxUrls?: number;
}

export type AIToolId = "web-search" | "web-scrape" | "calculator" | "finance-data" | "deep-research";

export interface AIConfig {
  type: "ai";
  specialistSlug?: string;
  systemPrompt?: string;
  userPromptTemplate: string; // {{input}}, {{search_jobs}}, {{scrape}} etc.
  tools?: AIToolId[]; // Tools the AI can call during generation
  maxToolSteps?: number; // Max tool-calling rounds (default: 3)
}

export interface TransformConfig {
  type: "transform";
  transform: "extract_urls" | "deduplicate" | "merge" | "summarize_list";
  inputFrom: string[];
}

export interface CalculatorConfig {
  type: "calculator";
  expressionTemplate: string; // {{placeholder}} resolved at runtime
}

export interface OutputConfig {
  type: "output";
  inputFrom?: string;
}

export type NodeConfig =
  | InputConfig
  | SearchConfig
  | ScrapeConfig
  | AIConfig
  | TransformConfig
  | CalculatorConfig
  | OutputConfig;

// Node definition — serializable config for a pipeline graph
export interface NodeDef {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs?: string[];
  config: NodeConfig;
}

// Piece metadata for "Used Pieces" display on template page
export interface PieceInfo {
  name: string;
  icon: string;
  color: string;
}

// Complete pipeline graph definition
export interface PipelineGraph {
  nodes: NodeDef[];
  pieces: PieceInfo[];
}

// Execution status for a single node
export type NodeStatus = "idle" | "running" | "done" | "failed";
