import { z } from "zod";

const webScrapeParams = z.object({
  url: z.string().url().describe("URL to fetch and extract content from"),
});

export function createWebScrapeTool(firecrawlApiKey?: string) {
  return {
    description:
      "Fetch and extract content from a URL. Returns the page content as clean text or markdown.",
    parameters: webScrapeParams,
    execute: async ({ url }: z.infer<typeof webScrapeParams>) => {
      if (firecrawlApiKey) {
        try {
          const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${firecrawlApiKey}`,
            },
            body: JSON.stringify({ url, formats: ["markdown"] }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.data?.markdown || data.data?.content;
            if (content) {
              return { content: content.slice(0, 15000), url, source: "firecrawl" };
            }
          }
        } catch {
          // Fall through to basic fetch
        }
      }

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          return { content: `Failed to fetch: HTTP ${response.status}`, url, source: "fetch" };
        }

        const html = await response.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000);

        return { content: text, url, source: "fetch" };
      } catch (err) {
        return {
          content: `Failed to fetch URL: ${err instanceof Error ? err.message : "Unknown error"}`,
          url,
          source: "error",
        };
      }
    },
  };
}
