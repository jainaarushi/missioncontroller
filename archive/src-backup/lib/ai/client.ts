import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export type AIProvider = "openai" | "gemini" | "anthropic";

export function createUserAnthropic(apiKey: string) {
  return createAnthropic({ apiKey });
}

export function createUserGemini(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}

export function createUserOpenAI(apiKey: string) {
  return createOpenAI({ apiKey });
}

export const PROVIDER_MODELS: Record<AIProvider, { default: string; fast: string }> = {
  openai: {
    default: "gpt-4o-mini",
    fast: "gpt-4o-mini",
  },
  gemini: {
    default: "gemini-2.5-flash",
    fast: "gemini-2.5-flash-lite",
  },
  anthropic: {
    default: "claude-sonnet-4-20250514",
    fast: "claude-haiku-4-5-20251001",
  },
};
