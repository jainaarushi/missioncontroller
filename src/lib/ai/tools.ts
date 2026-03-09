import { z } from "zod";

// Tool definitions for Cadre agents
// These follow the Vercel AI SDK tool format

// Web search via DuckDuckGo (free, no API key needed)
export const webSearch = {
  description: "Search the web for current information. Use this when you need to find facts, news, data, or any information that might be online.",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }: { query: string }): Promise<string> => {
    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      const data = await res.json();

      const results: string[] = [];

      if (data.Abstract) {
        results.push(`**${data.AbstractSource}:** ${data.Abstract}`);
      }

      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, 5)) {
          if (topic.Text) {
            results.push(`- ${topic.Text}`);
          }
        }
      }

      if (data.Infobox?.content) {
        for (const item of data.Infobox.content.slice(0, 5)) {
          if (item.label && item.value) {
            results.push(`${item.label}: ${item.value}`);
          }
        }
      }

      if (results.length === 0) {
        return `No direct results found for "${query}". Try rephrasing the search.`;
      }

      return results.join("\n");
    } catch (error) {
      return `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
};

// Read a webpage and extract its text content
export const readWebpage = {
  description: "Fetch and read the text content of a webpage URL. Use this to get detailed information from a specific website.",
  parameters: z.object({
    url: z.string().url().describe("The URL to read"),
  }),
  execute: async ({ url }: { url: string }): Promise<string> => {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CadreBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return `Failed to fetch ${url}: HTTP ${res.status}`;
      }

      const html = await res.text();

      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();

      const truncated = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
      return `Content from ${url}:\n\n${truncated}`;
    } catch (error) {
      return `Failed to read ${url}: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
};

// Calculator for math operations
export const calculator = {
  description: "Evaluate a mathematical expression. Use this for any calculations, percentages, conversions, or math operations.",
  parameters: z.object({
    expression: z.string().describe("The math expression to evaluate, e.g. '(100 * 0.15) + 50'"),
  }),
  execute: async ({ expression }: { expression: string }): Promise<string> => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
      if (!sanitized || sanitized.length > 200) return "Invalid expression";
      const withPercent = sanitized.replace(/(\d+)%/g, "($1/100)");
      const result = Function(`"use strict"; return (${withPercent})`)();
      if (typeof result !== "number" || !isFinite(result)) return "Expression did not produce a valid number";
      return `${expression} = ${result}`;
    } catch {
      return `Could not evaluate: ${expression}`;
    }
  },
};

// Get current date and time
export const getCurrentDate = {
  description: "Get the current date and time. Use this when you need to know today's date or need temporal context.",
  parameters: z.object({}),
  execute: async (): Promise<string> => {
    const now = new Date();
    return `Current date: ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Current time: ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}.`;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTool = any;

// Tool sets per agent type
export function getToolsForAgent(slug: string): Record<string, AnyTool> {
  const toolMap: Record<string, Record<string, AnyTool>> = {
    scout: { web_search: webSearch, read_webpage: readWebpage, get_current_date: getCurrentDate },
    quill: { get_current_date: getCurrentDate },
    metric: { calculator, web_search: webSearch, get_current_date: getCurrentDate },
    atlas: { web_search: webSearch, calculator, get_current_date: getCurrentDate },
    voyager: { web_search: webSearch, read_webpage: readWebpage, get_current_date: getCurrentDate },
    pulse: { web_search: webSearch, calculator, get_current_date: getCurrentDate },
    sleuth: { web_search: webSearch, read_webpage: readWebpage, get_current_date: getCurrentDate },
    caster: { web_search: webSearch, read_webpage: readWebpage, get_current_date: getCurrentDate },
    architect: { web_search: webSearch, get_current_date: getCurrentDate },
    catalyst: { web_search: webSearch, read_webpage: readWebpage, get_current_date: getCurrentDate },
    vitalis: { web_search: webSearch, calculator, get_current_date: getCurrentDate },
    strategist: { web_search: webSearch, read_webpage: readWebpage, calculator, get_current_date: getCurrentDate },
  };

  return toolMap[slug] || { web_search: webSearch, calculator, get_current_date: getCurrentDate };
}
