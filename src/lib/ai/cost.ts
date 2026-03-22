const RATES: Record<string, { input: number; output: number }> = {
  // Anthropic (per token) — https://docs.anthropic.com/en/docs/about-claude/models
  "claude-sonnet-4-20250514": { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  "claude-haiku-4-5-20251001": { input: 0.8 / 1_000_000, output: 4.0 / 1_000_000 },
  // OpenAI (per token) — https://openai.com/api/pricing/
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  "gpt-4o": { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 },
  // Gemini — https://ai.google.dev/pricing
  "gemini-2.5-flash": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  "gemini-2.5-flash-lite": { input: 0.075 / 1_000_000, output: 0.3 / 1_000_000 },
  "gemini-2.0-flash": { input: 0.1 / 1_000_000, output: 0.4 / 1_000_000 },
  "gemini-2.0-flash-lite": { input: 0, output: 0 },
};

// Image generation pricing (per image)
const IMAGE_RATES: Record<string, Record<string, number>> = {
  // OpenAI DALL-E — https://openai.com/api/pricing/
  "dall-e-3": {
    "1024x1024": 0.040,
    "1024x1792": 0.080,
    "1792x1024": 0.080,
  },
  "dall-e-2": {
    "1024x1024": 0.020,
    "512x512": 0.018,
    "256x256": 0.016,
  },
  "gpt-image-1": {
    "1024x1024": 0.040,
    "1024x1536": 0.060,
    "1536x1024": 0.060,
    "auto": 0.040,
  },
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

export function calculateImageCost(
  imageModel: string,
  size: string,
  count: number = 1
): number {
  const modelRates = IMAGE_RATES[imageModel];
  if (!modelRates) return 0;
  const perImage = modelRates[size] || modelRates["1024x1024"] || 0;
  return perImage * count;
}
