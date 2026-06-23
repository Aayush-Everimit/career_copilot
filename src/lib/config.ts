/**
 * Unified configuration file for Career Copilot.
 *
 * All environment variables and app-wide constants are accessed through this module.
 * To configure the app, edit `.env.local` (see `.env.example` for the template).
 */

// ── Gemini AI (Primary) ───────────────────────────────────
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── OpenRouter AI (Fallback) ──────────────────────────────
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
export const OPENROUTER_MODEL = "meta-llama/llama-4-maverick";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ── Retry Config ──────────────────────────────────────────
export const MAX_RETRIES = 2;
export const RETRY_DELAY_MS = 800; // base delay, doubles each retry

// ── Clerk Auth Routes ─────────────────────────────────────
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

// ── App Constants ─────────────────────────────────────────
export const APP_NAME = "Career Copilot";
export const APP_DESCRIPTION =
  "AI-powered resume analysis that helps you land your dream job.";
export const MAX_PDF_SIZE_MB = 5;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;
export const MIN_TEXT_LENGTH = 50;
export const MAX_RESUME_LENGTH = 50_000;
export const MAX_JD_LENGTH = 10_000;
