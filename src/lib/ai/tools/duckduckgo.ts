import { z } from "zod";

const duckDuckGoParams = z.object({
  query: z.string().describe("Search query"),
  max_results: z
    .number()
    .describe("Max results to return (1-10), defaults to 5 if not specified"),
});

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/**
 * DuckDuckGo search tool — free, no API key needed.
 * Uses multiple strategies to get search results reliably from server-side.
 */
export function createDuckDuckGoSearchTool() {
  return {
    description:
      "Search the web for current information using DuckDuckGo. Free, no API key required. Returns relevant results with snippets.",
    parameters: duckDuckGoParams,
    execute: async ({ query, max_results }: z.infer<typeof duckDuckGoParams>) => {
      const limit = Math.min(max_results || 5, 10);

      // Strategy 1: DuckDuckGo HTML endpoint with browser-like headers
      try {
        const results = await fetchDDGHtml(query, limit);
        if (results.length > 0) return { results };
      } catch {
        // Fall through
      }

      // Strategy 2: DuckDuckGo instant answer API (always works for known topics)
      try {
        const results = await fetchDDGInstantAnswer(query, limit);
        if (results.length > 0) return { results };
      } catch {
        // Fall through
      }

      // Strategy 3: Use Google's web search via a simple fetch (no API key)
      try {
        const results = await fetchGoogleLite(query, limit);
        if (results.length > 0) return { results };
      } catch {
        // Fall through
      }

      // All strategies failed — return an informative message so the model still works
      return {
        results: [],
        note: `Web search for "${query}" could not retrieve results. Please provide your best analysis based on your training knowledge.`,
      };
    },
  };
}

// ── Strategy 1: DuckDuckGo HTML search ──────────────────────
async function fetchDDGHtml(query: string, limit: number): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  // Use the main HTML endpoint with POST (more reliable than lite)
  const response = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://html.duckduckgo.com/",
    },
    body: `q=${encoded}&b=`,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return [];

  const html = await response.text();
  return parseDDGHtmlResults(html, limit);
}

function parseDDGHtmlResults(html: string, limit: number): SearchResult[] {
  const results: SearchResult[] = [];

  // DuckDuckGo HTML results use class="result__a" for links and "result__snippet" for snippets
  const resultPattern = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetPattern = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  const links: { url: string; title: string }[] = [];
  let match;

  while ((match = resultPattern.exec(html)) !== null) {
    const url = decodeURIComponent(
      match[1].replace(/.*uddg=/, "").replace(/&.*/, "") || match[1]
    );
    links.push({ url, title: cleanHtml(match[2]) });
  }

  const snippets: string[] = [];
  while ((match = snippetPattern.exec(html)) !== null) {
    snippets.push(cleanHtml(match[1]));
  }

  // Fallback: try generic result link pattern
  if (links.length === 0) {
    const genericPattern = /<a[^>]+class="[^"]*result[^"]*"[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = genericPattern.exec(html)) !== null) {
      const url = match[1];
      const title = cleanHtml(match[2]);
      if (!url.includes("duckduckgo.com") && title.length > 3) {
        links.push({ url, title });
      }
    }
  }

  for (let i = 0; i < Math.min(links.length, limit); i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      content: snippets[i] || "",
    });
  }

  return results;
}

// ── Strategy 2: DuckDuckGo Instant Answer API ───────────────
async function fetchDDGInstantAnswer(query: string, limit: number): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  const results: SearchResult[] = [];

  if (data.Abstract && data.AbstractURL) {
    results.push({
      title: data.Heading || query,
      url: data.AbstractURL,
      content: data.Abstract,
    });
  }

  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics.slice(0, limit - results.length)) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(" - ")[0] || topic.Text.slice(0, 80),
          url: topic.FirstURL,
          content: topic.Text,
        });
      }
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

  return results.slice(0, limit);
}

// ── Strategy 3: Google lite search (no API key) ─────────────
async function fetchGoogleLite(query: string, limit: number): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(`https://www.google.com/search?q=${encoded}&num=${limit}&hl=en`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return [];

  const html = await response.text();
  const results: SearchResult[] = [];

  // Google results: <a href="/url?q=URL&...">TITLE</a>
  const linkPattern = /<a[^>]+href="\/url\?q=(https?[^&"]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  const seenUrls = new Set<string>();
  while ((match = linkPattern.exec(html)) !== null && results.length < limit) {
    const url = decodeURIComponent(match[1]);
    const title = cleanHtml(match[2]);
    if (seenUrls.has(url) || !title || title.length < 3) continue;
    if (url.includes("google.com") || url.includes("youtube.com/watch")) continue;
    seenUrls.add(url);
    results.push({ title, url, content: "" });
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
