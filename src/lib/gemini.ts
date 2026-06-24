import {
  GEMINI_API_KEY,
  GEMINI_API_URL,
  OPENROUTER_API_KEY,
  OPENROUTER_API_URL,
  OPENROUTER_MODEL,
  MAX_RETRIES,
  RETRY_DELAY_MS,
  FETCH_TIMEOUT_MS,
} from "@/lib/config";
import { generateLocalAnalysis } from "@/lib/local-fallback";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { AnalysisResultSchema, type AnalysisResult } from "@/types";

const RETRYABLE_STATUS_CODES = [408, 409, 425, 429, 500, 502, 503, 504];

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUS_CODES.includes(status);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Strip code fences and parse JSON from AI response
function parseAIResponse(rawText: string): unknown {
  const cleaned = rawText
    .replace(/```(?:json)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

// Fetch with AbortController timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Gemini API call
async function callGemini(prompt: string): Promise<Response> {
  return fetchWithTimeout(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });
}

function extractGeminiText(data: Record<string, unknown>): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return d?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// OpenRouter fallback call
async function callOpenRouter(prompt: string): Promise<AnalysisResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  console.log("[Fallback] Trying OpenRouter...");

  const response = await fetchWithTimeout(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://career-copilot.vercel.app",
      "X-Title": "Career Copilot",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Fallback] OpenRouter error:", response.status, errorBody.slice(0, 200));
    throw new Error(`OpenRouter returned ${response.status}`);
  }

  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawText = (data as any)?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("No content from OpenRouter");
  }

  const parsed = parseAIResponse(rawText);
  const result = AnalysisResultSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[Fallback] Validation failed:", result.error.format());
    throw new Error("Fallback response failed validation");
  }

  console.log("[Fallback] OpenRouter succeeded");
  return result.data;
}

/**
 * Analyze resume vs job description.
 * Strategy: Gemini (with retries) → OpenRouter → local deterministic fallback.
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(resumeText, jobDescription);

  // Step 1: Gemini with retries
  if (GEMINI_API_KEY && GEMINI_API_KEY !== "PLACEHOLDER_GEMINI_API_KEY") {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Attempt ${attempt}/${MAX_RETRIES}...`);
        const response = await callGemini(prompt);

        // Retryable HTTP error
        if (!response.ok && isRetryable(response.status)) {
          const errorBody = await response.text();
          console.warn(`[Gemini] ${response.status}: ${errorBody.slice(0, 200)}`);
          lastError = new Error(`Gemini returned ${response.status}`);
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(`[Gemini] Retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          break;
        }

        // Non-retryable HTTP error
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`[Gemini] Fatal ${response.status}: ${errorBody.slice(0, 200)}`);
          lastError = new Error(`Gemini returned ${response.status}`);
          break;
        }

        // Parse response
        const data = await response.json();
        const rawText = extractGeminiText(data as Record<string, unknown>);

        if (!rawText) {
          console.error("[Gemini] Empty response:", JSON.stringify(data).slice(0, 300));
          lastError = new Error("No content from Gemini");
          // Retry empty responses instead of breaking immediately
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            await sleep(delay);
            continue;
          }
          break;
        }

        const parsed = parseAIResponse(rawText);
        const result = AnalysisResultSchema.safeParse(parsed);

        if (!result.success) {
          console.error("[Gemini] Validation failed:", result.error.format());
          lastError = new Error("Gemini response failed validation");
          // Retry validation failures — AI sometimes returns malformed JSON
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            await sleep(delay);
            continue;
          }
          break;
        }

        console.log(`[Gemini] Succeeded on attempt ${attempt}`);
        return result.data;
      } catch (err) {
        const isTimeout = err instanceof DOMException && err.name === "AbortError";
        lastError = isTimeout
          ? new Error("Gemini request timed out")
          : err instanceof Error
            ? err
            : new Error("Gemini request failed");
        console.error(`[Gemini] Attempt ${attempt} threw:`, lastError.message);

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await sleep(delay);
        }
      }
    }

    console.warn(`[Gemini] All ${MAX_RETRIES} attempts failed: ${lastError?.message}`);
  } else {
    console.warn("[Gemini] API key not configured, skipping.");
  }

  // Step 2: OpenRouter fallback
  try {
    return await callOpenRouter(prompt);
  } catch (fallbackErr) {
    console.error(
      "[Fallback] OpenRouter failed:",
      fallbackErr instanceof Error ? fallbackErr.message : fallbackErr
    );
  }

  // Step 3: Local deterministic fallback
  console.warn("[Fallback] All AI providers failed. Using local analysis.");
  try {
    return generateLocalAnalysis(resumeText, jobDescription);
  } catch (localErr) {
    console.error("[Fallback] Local analysis failed:", localErr);
    throw new Error("Analysis service is temporarily unavailable.");
  }
}
