import { z } from "zod";

const deepResearchParams = z.object({
  topic: z.string().describe("The research topic or question"),
  depth: z
    .number()
    .optional()
    .default(2)
    .describe("Research depth: 1=quick (3 queries), 2=moderate (5 queries), 3=thorough (7 queries)"),
});

export function createDeepResearchTool(tavilyApiKey: string) {
  return {
    description:
      "Perform deep multi-step web research on a topic. Searches multiple queries from different angles, deduplicates, and compiles sources. Use this for thorough research tasks.",
    parameters: deepResearchParams,
    execute: async ({ topic, depth }: z.infer<typeof deepResearchParams>) => {
      const allResults: Array<{ title: string; url: string; content: string }> = [];

      const queries = [
        topic,
        `${topic} latest developments 2024 2025`,
        `${topic} analysis expert opinion`,
      ];
      if (depth >= 2) {
        queries.push(`${topic} statistics data numbers`);
        queries.push(`${topic} future trends predictions`);
      }
      if (depth >= 3) {
        queries.push(`${topic} research paper study findings`);
        queries.push(`${topic} criticism challenges problems limitations`);
      }

      const maxQueries = depth === 1 ? 3 : depth === 2 ? 5 : 7;

      for (const query of queries.slice(0, maxQueries)) {
        try {
          const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: tavilyApiKey,
              query,
              search_depth: depth >= 2 ? "advanced" : "basic",
              max_results: 5,
              include_answer: false,
              include_raw_content: false,
            }),
            signal: AbortSignal.timeout(15000),
          });

          if (res.ok) {
            const data = await res.json();
            for (const r of data.results || []) {
              if (!allResults.find((existing) => existing.url === r.url)) {
                allResults.push({ title: r.title, url: r.url, content: r.content });
              }
            }
          }
        } catch {
          // Skip failed queries
        }
      }

      return {
        topic,
        queriesExecuted: Math.min(queries.length, maxQueries),
        sourcesFound: allResults.length,
        sources: allResults.slice(0, 20),
      };
    },
  };
}
