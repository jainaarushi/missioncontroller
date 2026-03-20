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
        id: "search_trends", type: "search", label: "Research Trends", description: "Finding trending angles and viral formats", icon: "🔍", color: "#3b82f6", inputs: ["input"],
        config: {
          type: "search",
          queries: (ctx) => {
            const q = toSearchQuery(ctx.latestText);
            return [
              `${q} trending LinkedIn post ${ctx.today.split(",").pop()?.trim()}`,
              `${q} viral social media content strategy`,
            ];
          },
          maxResults: 5,
        },
      },
      {
        id: "draft", type: "ai", label: "Draft Posts", description: "Writing LinkedIn post and Twitter/X thread", icon: "✍️", color: "#0A66C2", inputs: ["input", "search_trends"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Write social media posts about: {{input}}

Trending context (use if relevant, ignore if empty):
{{search_trends}}

You MUST produce actual post content. Do NOT say the drafts are empty. Write the posts yourself based on the topic above.

Create BOTH of these:

---

## LINKEDIN POST

Write a complete, ready-to-publish LinkedIn post:
- **Hook** (first line): A bold statement, surprising stat, or question that stops the scroll. Under 15 words.
- **Body** (800–1,300 characters): Short paragraphs (1-2 sentences each). Tell a story or share a concrete insight. Use line breaks for readability.
- **Call to Action**: End with a question or invitation to comment.
- **Hashtags**: 3 hashtags — one broad, one niche, one trending.

Format the LinkedIn post in a clean copy-paste block between \`---START LINKEDIN---\` and \`---END LINKEDIN---\` markers.

---

## TWITTER/X THREAD

Write a 5-7 tweet thread:
- **Tweet 1 (Hook)**: Max 280 chars. Bold claim or surprising stat.
- **Tweets 2-6 (Body)**: Each max 280 chars. One idea per tweet. Concrete examples.
- **Final Tweet (CTA)**: Invite retweets/follows. Summarize the thread.
- Show character count after each tweet.
- Also write a **Single Tweet Version** (one standalone tweet, max 280 chars).

---

## POSTING STRATEGY
- Best time to post on LinkedIn for this topic
- Best time to post on Twitter/X for this topic
- 2 pre-written follow-up comments to boost engagement in the first hour`,
          tools: ["web-search"],
          maxToolSteps: 4,
        },
      },
      {
        id: "format", type: "ai", label: "Final Package", description: "Polishing and formatting for publishing", icon: "📊", color: "#8b5cf6", inputs: ["draft"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Polish this social media content package for publishing:

{{draft}}

Your job is to FORMAT and CLEAN UP the drafts above into a professional, ready-to-publish package. Do NOT say content is missing — the drafts are above.

Output this exact structure:

## LinkedIn Post (Ready to Publish)
[The complete LinkedIn post, copy-paste ready. Include line breaks and formatting exactly as it should appear on LinkedIn.]

## Twitter/X Thread
[Each tweet numbered: "1/N:", "2/N:", etc. Show (X/280 chars) after each.]

## Single Tweet Version
[One standalone tweet, max 280 chars]

## When to Post
| Platform | Best Time | Why |
|----------|-----------|-----|
| LinkedIn | ... | ... |
| Twitter/X | ... | ... |

## First 60 Minutes Playbook
[What to do after posting: reply to comments, share in groups, etc.]`,
        },
      },
    ],
    pieces: [
      { name: "Web Search", icon: "🔍", color: "#3b82f6" },
      { name: "LinkedIn", icon: "💼", color: "#0A66C2" },
      { name: "Twitter/X", icon: "🐦", color: "#1DA1F2" },
      { name: "AI Agent", icon: "🤖", color: "#f59e0b" },
    ],
  },
};
