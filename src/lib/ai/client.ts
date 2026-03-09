import { createAnthropic } from "@ai-sdk/anthropic";

// Create an Anthropic client from a user's own API key
export function createUserAnthropic(apiKey: string) {
  return createAnthropic({ apiKey });
}
