// Retry wrapper for AI SDK generateText calls with exponential backoff
// Handles transient API errors (500, 502, 503, 529, rate limits)

import { generateText } from "ai";

type GenerateTextParams = Parameters<typeof generateText>[0];
type GenerateTextResult = Awaited<ReturnType<typeof generateText>>;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message || "";
  // Anthropic/OpenAI/Gemini transient error codes
  if (/\b(500|502|503|529)\b/.test(msg)) return true;
  if (/internal.server.error/i.test(msg)) return true;
  if (/overloaded/i.test(msg)) return true;
  if (/rate.limit/i.test(msg) || /429/.test(msg)) return true;
  if (/timeout/i.test(msg) || /ETIMEDOUT|ECONNRESET/.test(msg)) return true;
  return false;
}

export async function generateTextWithRetry(
  params: GenerateTextParams,
): Promise<GenerateTextResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateText(params);
    } catch (err) {
      lastError = err;

      if (attempt < MAX_RETRIES && isRetryableError(err)) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt); // 1s, 2s, 4s
        console.warn(
          `[AI Retry] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed with transient error, retrying in ${delayMs}ms:`,
          err instanceof Error ? err.message : err,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      throw err; // Non-retryable or exhausted retries
    }
  }

  throw lastError; // Should never reach here, but TypeScript needs it
}
