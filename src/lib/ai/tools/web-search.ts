import { z } from "zod";

const webSearchParams = z.object({
  query: z.string().describe("Search query"),
  search_depth: z
    .enum(["basic", "advanced"])
    .optional()
    .default("basic")
    .describe("basic = fast, advanced = more thorough"),
  max_results: z
    .number()
    .optional()
    .default(5)
    .describe("Max results to return (1-10)"),
});

export function createWebSearchTool(tavilyApiKey: string) {
  return {
    description:
      "Search the web for current information. Returns relevant results with snippets and an AI-generated answer.",
    parameters: webSearchParams,
    execute: async ({ query, search_depth, max_results }: z.infer<typeof webSearchParams>) => {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query,
          search_depth,
          max_results: Math.min(max_results, 10),
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily search failed (${response.status}): ${text}`);
      }

      const data = await response.json();

      return {
        answer: data.answer || null,
        results: (data.results || []).map(
          (r: { title: string; url: string; content: string; score: number }) => ({
            title: r.title,
            url: r.url,
            content: r.content,
            score: r.score,
          })
        ),
      };
    },
  };
}
