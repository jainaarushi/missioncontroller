import type { PipelineGraph } from "../types";

/** Strip filler words for search queries */
function toSearchQuery(text: string, maxLen = 60): string {
  const stopWords = new Set(["i'm", "im", "i", "am", "a", "an", "the", "with", "and", "or", "for", "in", "at", "of", "to", "my", "have", "has", "been", "being", "was", "were", "is", "are", "that", "this", "it", "its", "on", "by", "as", "so", "but", "do", "does", "did", "will", "would", "could", "should", "can", "may", "about", "very", "really", "just", "also", "looking", "want", "need", "like", "currently", "experience", "years", "year", "post", "write", "create"]);
  const words = text.replace(/[^\w\s/-]/g, " ").split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));
  let query = "";
  for (const w of words) {
    if ((query + " " + w).trim().length > maxLen) break;
    query = (query + " " + w).trim();
  }
  return query || text.slice(0, maxLen).trim();
}

export const SOCIAL_GRAPHS: Record<string, PipelineGraph> = {
  "social-media": {
    nodes: [
      { id: "input", type: "input", label: "Your Topic", description: "Understanding what you want to post about", icon: "📝", color: "#8b5cf6", config: { type: "input" } },
      {
        id: "search_trends", type: "search", label: "Research Trends", description: "Finding trending topics and viral formats", icon: "🔍", color: "#3b82f6", inputs: ["input"],
        config: {
          type: "search",
          queries: (ctx) => {
            const q = toSearchQuery(ctx.latestText);
            return [
              `${q} trending LinkedIn post ${ctx.today.split(",").pop()?.trim()}`,
              `${q} viral social media content strategy`,
              `${q} Twitter thread ideas engagement`,
            ];
          },
          maxResults: 6,
        },
      },
      {
        id: "linkedin_post", type: "ai", label: "Draft LinkedIn Post", description: "Crafting an engaging LinkedIn post", icon: "💼", color: "#0A66C2", inputs: ["input", "search_trends"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Draft a LinkedIn post about: {{input}}

Trending context:
{{search_trends}}

IMPORTANT: If the search results are empty or say "No search results", use your web_search tool to research the topic yourself.

If you have composio_linkedin_create_post or similar LinkedIn tools available, mention that the user can auto-publish after reviewing.

Create:
1. **Hook** — First line that stops the scroll (pattern interrupt, bold claim, or question). Keep it under 15 words.
2. **Main Post** — 800–1,300 characters. Use short paragraphs (1-2 sentences each). Add line breaks for readability. Tell a story or share a concrete insight, not generic advice.
3. **Call to Action** — End with a question or invitation to comment.
4. **3 Hashtag Sets** — One broad (#Leadership), one niche (#ProductManagement), one trending.
5. **Best Time to Post** — Based on the topic and audience.
6. **2 Follow-up Comments** — Pre-written comments to boost engagement in the first hour.

Format the final post in a copy-paste-ready block.`,
          tools: ["web-search"],
        },
      },
      {
        id: "twitter_thread", type: "ai", label: "Draft Twitter/X Thread", description: "Creating a viral Twitter/X thread", icon: "🐦", color: "#000000", inputs: ["input", "search_trends"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Create a Twitter/X thread about: {{input}}

Trending context:
{{search_trends}}

IMPORTANT: If the search results are empty, use your web_search tool to research the topic yourself.

Create a thread with:
1. **Tweet 1 (Hook)** — Max 280 chars. Must stop the scroll. Use a bold claim, surprising stat, or hot take.
2. **Tweets 2–7 (Body)** — Each max 280 chars. One idea per tweet. Use short sentences. Add concrete examples, numbers, or stories.
3. **Final Tweet (CTA)** — Invite retweets, follows, or replies. Include a summary of the thread.
4. **Alt: Single Tweet Version** — Condense the core insight into one powerful tweet (max 280 chars).
5. **Hashtags** — 2-3 relevant hashtags (don't overdo it on Twitter).
6. **Best Posting Time** — Based on topic and audience.

Format each tweet with "Tweet 1/7:", "Tweet 2/7:", etc. Keep character counts visible.`,
          tools: ["web-search"],
        },
      },
      {
        id: "format", type: "ai", label: "Final Report", description: "Combining posts into a polished content package", icon: "📊", color: "#8b5cf6", inputs: ["linkedin_post", "twitter_thread"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Combine these social media drafts into a polished, ready-to-publish content package:

## LinkedIn Post Draft
{{linkedin_post}}

## Twitter/X Thread Draft
{{twitter_thread}}

Create a final report with:
1. **LinkedIn Post** — Copy-paste ready, formatted with line breaks and emojis where appropriate
2. **Twitter/X Thread** — Each tweet numbered with character count shown
3. **Single Tweet Version** — The best standalone tweet
4. **Cross-Platform Calendar** — When to post each piece for maximum reach
5. **Engagement Playbook** — What to do in the first 60 minutes after posting (respond to comments, share in groups, etc.)
6. **Content Repurposing** — How to turn this into an Instagram carousel, newsletter section, or blog intro`,
          tools: ["web-search"],
        },
      },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "LinkedIn", icon: "💼", color: "#0A66C2" },
      { name: "Twitter/X", icon: "🐦", color: "#000000" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
