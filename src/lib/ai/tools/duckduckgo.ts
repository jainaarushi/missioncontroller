import { z } from "zod";

const duckDuckGoParams = z.object({
  query: z.string().describe("Search query"),
  max_results: z
    .number()
    .describe("Max results to return (1-10), defaults to 5 if not specified"),
});

interface DDGResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * DuckDuckGo search tool — free, no API key needed.
 * Uses the DuckDuckGo HTML lite endpoint and parses results.
 */
export function createDuckDuckGoSearchTool() {
  return {
    description:
      "Search the web for current information using DuckDuckGo. Free, no API key required. Returns relevant results with snippets.",
    parameters: duckDuckGoParams,
    execute: async ({ query, max_results }: z.infer<typeof duckDuckGoParams>) => {
      const limit = Math.min(max_results || 5, 10);

      try {
        // Use DuckDuckGo HTML lite — reliable, no JS needed
        const encoded = encodeURIComponent(query);
        const response = await fetch(`https://lite.duckduckgo.com/lite/?q=${encoded}`, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AgentStudio/1.0)",
            "Accept": "text/html",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          return { error: `DuckDuckGo search failed (${response.status})`, results: [] };
        }

        const html = await response.text();
        const results = parseDDGLiteResults(html, limit);

        if (results.length === 0) {
          // Fallback: try DuckDuckGo instant answer API
          return await tryInstantAnswer(query, limit);
        }

        return {
          results: results.map(r => ({
            title: r.title,
            url: r.url,
            content: r.snippet,
          })),
        };
      } catch (err) {
        // Fallback to instant answer API
        try {
          return await tryInstantAnswer(query, limit);
        } catch {
          return {
            error: `Search failed: ${err instanceof Error ? err.message : "Unknown error"}`,
            results: [],
          };
        }
      }
    },
  };
}

function parseDDGLiteResults(html: string, limit: number): DDGResult[] {
  const results: DDGResult[] = [];

  // DuckDuckGo lite returns results in a table format
  // Each result has: a link (<a> tag with class="result-link") and a snippet (<td class="result-snippet">)

  // Extract result links and snippets using regex on the HTML
  // Pattern: result link followed by snippet in the table structure
  const linkPattern = /<a[^>]+class="result-link"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  const snippetPattern = /<td[^>]+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;

  const links: { url: string; title: string }[] = [];
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    links.push({ url: match[1], title: cleanHtml(match[2]) });
  }

  const snippets: string[] = [];
  while ((match = snippetPattern.exec(html)) !== null) {
    snippets.push(cleanHtml(match[1]));
  }

  // If the simple pattern didn't work, try a more general approach
  if (links.length === 0) {
    // Alternative: look for any links that look like search results
    const generalLinkPattern = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
    const seenUrls = new Set<string>();

    while ((match = generalLinkPattern.exec(html)) !== null) {
      const url = match[1];
      const title = cleanHtml(match[2]);

      // Skip DuckDuckGo internal links and empty titles
      if (url.includes("duckduckgo.com") || !title.trim() || title.length < 5) continue;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      links.push({ url, title });
    }

    // Extract text blocks near links as snippets
    const textBlocks = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .split(/<tr/i)
      .filter(block => block.includes("http") && !block.includes("duckduckgo.com"))
      .map(block => cleanHtml(block).trim())
      .filter(text => text.length > 20);

    for (let i = snippets.length; i < links.length && i < textBlocks.length; i++) {
      snippets.push(textBlocks[i] || "");
    }
  }

  for (let i = 0; i < Math.min(links.length, limit); i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      snippet: snippets[i] || "",
    });
  }

  return results;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function tryInstantAnswer(query: string, limit: number) {
  const encoded = encodeURIComponent(query);
  const response = await fetch(`https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentStudio/1.0)" },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    return { results: [], error: "Search returned no results" };
  }

  const data = await response.json();
  const results: { title: string; url: string; content: string }[] = [];

  // Abstract (main answer)
  if (data.Abstract && data.AbstractURL) {
    results.push({
      title: data.Heading || query,
      url: data.AbstractURL,
      content: data.Abstract,
    });
  }

  // Related topics
  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics.slice(0, limit - results.length)) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(" - ")[0] || topic.Text.slice(0, 80),
          url: topic.FirstURL,
          content: topic.Text,
        });
      }
      // Handle subtopics
      if (topic.Topics) {
        for (const sub of topic.Topics.slice(0, 2)) {
          if (sub.Text && sub.FirstURL) {
            results.push({
              title: sub.Text.split(" - ")[0] || sub.Text.slice(0, 80),
              url: sub.FirstURL,
              content: sub.Text,
            });
          }
        }
      }
    }
  }

  return { results: results.slice(0, limit) };
}
