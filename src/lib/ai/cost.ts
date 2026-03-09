const RATES: Record<string, { input: number; output: number }> = {
  // Anthropic
  "claude-sonnet-4-20250514": { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  "claude-haiku-4-5-20251001": { input: 0.8 / 1_000_000, output: 4.0 / 1_000_000 },
  // OpenAI
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  "gpt-4o": { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 },
  // Gemini (free tier = $0)
  "gemini-2.0-flash-lite": { input: 0, output: 0 },
  "gemini-1.5-flash": { input: 0, output: 0 },
};

// Default to gpt-4o-mini pricing if model unknown
const DEFAULT_RATE = { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 };

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const rate = RATES[model] || DEFAULT_RATE;
  return inputTokens * rate.input + outputTokens * rate.output;
}
