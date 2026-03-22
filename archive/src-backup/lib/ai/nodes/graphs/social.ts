import type { PipelineGraph } from "../types";

export const SOCIAL_GRAPHS: Record<string, PipelineGraph> = {
  "social-media": {
    nodes: [
      { id: "input", type: "input", label: "Your Topic", description: "Understanding what you want to post about", icon: "\ud83d\udcdd", color: "#8b5cf6", config: { type: "input" } },
      {
        id: "draft", type: "ai", label: "Draft Posts", description: "Writing LinkedIn post and Twitter/X thread", icon: "\u270d\ufe0f", color: "#0A66C2", inputs: ["input"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Write social media posts about: {{input}}

You MUST produce actual post content. Write the posts yourself based on the topic above.

CRITICAL RULES:
- NEVER generate fake, placeholder, or example URLs. Do NOT include any links at all.
- NEVER include "Read the full article here" or similar link placeholders.

Create BOTH of these:

---

## LINKEDIN POST

Write a complete, ready-to-publish LinkedIn post:
- **Hook** (first line): A bold statement, surprising stat, or question that stops the scroll. Under 15 words.
- **Body** (800\u20131,300 characters): Short paragraphs (1-2 sentences each). Tell a story or share a concrete insight. Use line breaks for readability.
- **Call to Action**: End with a question or invitation to comment.
- **Hashtags**: 3 hashtags \u2014 one broad, one niche, one trending.
- Do NOT add any links.

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
        },
      },
      {
        id: "format", type: "ai", label: "Final Package", description: "Polishing and formatting for publishing", icon: "\ud83d\udcca", color: "#8b5cf6", inputs: ["draft"],
        config: {
          type: "ai",
          specialistSlug: "content-creator",
          userPromptTemplate: `Polish this social media content package for publishing:

{{draft}}

Your job is to FORMAT and CLEAN UP the drafts above into a professional, ready-to-publish package. Do NOT say content is missing \u2014 the drafts are above.

CRITICAL: NEVER generate fake, placeholder, or example URLs. Remove any links entirely. Do NOT include "Read the full article" or any URL placeholders.

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
      { name: "LinkedIn", icon: "\ud83d\udcbc", color: "#0A66C2" },
      { name: "Twitter/X", icon: "\ud83d\udc26", color: "#1DA1F2" },
      { name: "AI Agent", icon: "\ud83e\udd16", color: "#f59e0b" },
    ],
  },
};
