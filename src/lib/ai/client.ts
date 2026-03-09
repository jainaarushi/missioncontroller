import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type AIProvider = "anthropic" | "gemini";

export function createUserAnthropic(apiKey: string) {
  return createAnthropic({ apiKey });
}

export function createUserGemini(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}

// Model mapping
export const PROVIDER_MODELS: Record<AIProvider, { default: string; fast: string }> = {
  anthropic: {
    default: "claude-sonnet-4-20250514",
    fast: "claude-haiku-4-5-20251001",
  },
  gemini: {
    default: "gemini-2.0-flash",
    fast: "gemini-2.0-flash-lite",
  },
};
