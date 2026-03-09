import { createAnthropic } from "@ai-sdk/anthropic";

const hasKey = !!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("placeholder");

export const anthropic = hasKey
  ? createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export function isAIEnabled(): boolean {
  return hasKey;
}
