// Gemini AI (Primary)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// OpenRouter AI (Fallback)
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
export const OPENROUTER_MODEL = "meta-llama/llama-4-maverick";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Retry & timeout
export const MAX_RETRIES = 4;
export const RETRY_DELAY_MS = 1500; // doubles each retry: 1.5s → 3s → 6s → 12s
export const FETCH_TIMEOUT_MS = 30_000;

// Clerk auth routes
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

// App constants
export const APP_NAME = "Career Copilot";
export const APP_DESCRIPTION = "AI-powered resume analysis that helps you land your dream job.";
export const MAX_PDF_SIZE_MB = 5;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;
export const MIN_TEXT_LENGTH = 20;
export const MAX_RESUME_LENGTH = 50_000;
export const MAX_JD_LENGTH = 10_000;
