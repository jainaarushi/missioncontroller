const RATES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": {
    input: 3.0 / 1_000_000,
    output: 15.0 / 1_000_000,
  },
  "claude-haiku-4-5-20251001": {
    input: 0.8 / 1_000_000,
    output: 4.0 / 1_000_000,
  },
};

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const rate = RATES[model] || RATES["claude-sonnet-4-20250514"];
  return inputTokens * rate.input + outputTokens * rate.output;
}
