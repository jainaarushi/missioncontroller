// Named data transforms for pipeline nodes

import type { NodeContext } from "./types";

/**
 * Extract URLs from a text blob (search results, etc.)
 */
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"')\]]+/g;
  const matches = text.match(urlRegex) || [];
  // Deduplicate and clean trailing punctuation
  const seen = new Set<string>();
  return matches
    .map(u => u.replace(/[.,;:!?)]+$/, ""))
    .filter(u => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
}

/**
 * Deduplicate lines in text
 */
function deduplicate(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return [...new Set(lines)].join("\n");
}

/**
 * Merge multiple text outputs into one
 */
function merge(texts: string[]): string {
  return texts.filter(Boolean).join("\n\n---\n\n");
}

/**
 * Summarize a list by removing duplicates and numbering
 */
function summarizeList(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const unique = [...new Set(lines)];
  return unique.map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, "")}`).join("\n");
}

export function applyTransform(
  name: "extract_urls" | "deduplicate" | "merge" | "summarize_list",
  inputs: string[],
  _ctx: NodeContext
): string {
  const combined = inputs.join("\n\n");
  switch (name) {
    case "extract_urls":
      return extractUrls(combined).join("\n");
    case "deduplicate":
      return deduplicate(combined);
    case "merge":
      return merge(inputs);
    case "summarize_list":
      return summarizeList(combined);
    default:
      return combined;
  }
}
