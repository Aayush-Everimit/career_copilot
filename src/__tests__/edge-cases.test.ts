import { describe, it, expect } from "vitest";
import { z } from "zod/v4";

// Re-define schemas inline to avoid Next.js path alias issues in vitest
const AnalyzeRequestSchema = z.object({
  resumeText: z.string().min(20, "Resume text is too short (min 20 chars)").max(50_000),
  jobDescription: z.string().min(20, "Job description is too short (min 20 chars)").max(10_000),
});

const AnalysisResultSchema = z.object({
  resumeSummary: z.string(),
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  resumeSuggestions: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  coverLetter: z.string(),
});

// ── Helpers (mirrored from source to test in isolation) ──

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "these", "those",
  "have", "has", "had", "will", "would", "should", "could", "must",
  "into", "onto", "over", "under", "through", "during", "about",
  "your", "their", "there", "where", "when", "while", "which",
  "candidate", "candidates", "company", "organization",
  "required", "preferred", "responsible", "responsibilities",
  "experience", "experiences", "professional", "professionals",
  "team", "teams", "role", "position", "job", "work", "working",
  "years", "year", "month", "months", "ability", "abilities",
  "skills", "skill", "knowledge", "strong", "excellent", "good",
  "using", "used", "use", "including", "include", "etc",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

function getKeywordFrequency(text: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const token of tokenize(text)) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return map;
}

function getTopKeywords(freq: Map<string, number>, limit = 40): string[] {
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function parseAIResponse(rawText: string): unknown {
  const cleaned = rawText
    .replace(/```(?:json)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

function generateLocalAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeFreq = getKeywordFrequency(resumeText);
  const jdFreq = getKeywordFrequency(jobDescription);
  const resumeKeywords = new Set(getTopKeywords(resumeFreq, 60));
  const jdKeywords = new Set(getTopKeywords(jdFreq, 40));

  const matchedSkills = [...jdKeywords].filter((w) => resumeKeywords.has(w)).slice(0, 15);
  const missingSkills = [...jdKeywords].filter((w) => !resumeKeywords.has(w)).slice(0, 15);
  const matchScore = jdKeywords.size === 0
    ? 50
    : Math.min(100, Math.round((matchedSkills.length / jdKeywords.size) * 100));

  const resumeSuggestions: string[] = [];
  const resumeSummary = matchedSkills.length > 0
    ? `Your profile demonstrates experience related to ${matchedSkills.slice(0, 5).join(", ")}.`
    : "Your resume contains limited overlap with the job description.";

  if (missingSkills.length > 0) {
    resumeSuggestions.push(`Consider highlighting experience related to ${missingSkills.slice(0, 3).join(", ")}.`);
  }
  if (matchScore < 50) {
    resumeSuggestions.push("Tailor your resume more closely to the job description.");
  }
  resumeSuggestions.push("Quantify achievements with measurable results.");
  resumeSuggestions.push("Place the most relevant projects near the top.");

  const interviewQuestions = matchedSkills.length > 0
    ? matchedSkills.slice(0, 8).map((s) => `Describe your experience with ${s}.`)
    : ["Walk me through your background.", "What accomplishment are you most proud of?", "Why this role?"];

  const coverLetter = `Dear Hiring Manager,\n\nI am excited to apply.\n\nSincerely,\nCandidate`;

  return { matchScore, matchedSkills, missingSkills, resumeSuggestions, interviewQuestions, coverLetter, resumeSummary };
}

// ── Test Suites ──

describe("AnalyzeRequestSchema validation", () => {
  it("rejects resume shorter than 20 chars", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "too short",
      jobDescription: "A valid job description text here",
    });
    expect(result.success).toBe(false);
  });

  it("accepts resume at exactly 20 chars", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "12345678901234567890", // 20 chars
      jobDescription: "12345678901234567890",
    });
    expect(result.success).toBe(true);
  });

  it("rejects job description shorter than 20 chars", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "A valid resume text with enough chars",
      jobDescription: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects resume over 50,000 chars", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "a".repeat(50_001),
      jobDescription: "A valid job description text here",
    });
    expect(result.success).toBe(false);
  });

  it("rejects JD over 10,000 chars", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "A valid resume text with enough chars",
      jobDescription: "a".repeat(10_001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty strings", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "",
      jobDescription: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts max-length resume (50,000 chars)", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "a".repeat(50_000),
      jobDescription: "A valid job description text here",
    });
    expect(result.success).toBe(true);
  });

  it("accepts max-length JD (10,000 chars)", () => {
    const result = AnalyzeRequestSchema.safeParse({
      resumeText: "A valid resume text with enough chars",
      jobDescription: "a".repeat(10_000),
    });
    expect(result.success).toBe(true);
  });
});

describe("parseAIResponse", () => {
  it("strips code fences and parses JSON", () => {
    const raw = '```json\n{"hello":"world"}\n```';
    expect(parseAIResponse(raw)).toEqual({ hello: "world" });
  });

  it("parses clean JSON without fences", () => {
    const raw = '{"matchScore": 75}';
    expect(parseAIResponse(raw)).toEqual({ matchScore: 75 });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseAIResponse("not json at all")).toThrow();
  });

  it("handles nested code fences", () => {
    const raw = '```json\n{"nested": "```value```"}\n```';
    const result = parseAIResponse(raw);
    expect(result).toHaveProperty("nested");
  });

  it("handles empty JSON object", () => {
    expect(parseAIResponse("{}")).toEqual({});
  });
});

describe("tokenize", () => {
  it("filters stop words", () => {
    const tokens = tokenize("the candidate has strong skills");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("has");
    expect(tokens).not.toContain("strong");
    expect(tokens).not.toContain("skills");
  });

  it("filters short words (< 3 chars)", () => {
    const tokens = tokenize("I am a go to person");
    expect(tokens).not.toContain("am");
    expect(tokens).not.toContain("a");
    expect(tokens).not.toContain("go");
    expect(tokens).not.toContain("to");
  });

  it("filters pure numbers", () => {
    const tokens = tokenize("2024 senior 100 percent");
    expect(tokens).not.toContain("2024");
    expect(tokens).not.toContain("100");
    expect(tokens).toContain("senior");
    expect(tokens).toContain("percent");
  });

  it("handles unicode / non-English text", () => {
    const tokens = tokenize("développeur logiciel résumé 工程师 エンジニア");
    expect(tokens.length).toBeGreaterThan(0);
    // Should not crash
  });

  it("handles empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("handles whitespace-only string", () => {
    expect(tokenize("   \n\t  ")).toEqual([]);
  });

  it("handles special characters only", () => {
    const tokens = tokenize("!@#$%^&*()+=");
    expect(tokens).toEqual([]);
  });
});

describe("generateLocalAnalysis", () => {
  it("returns valid AnalysisResult schema", () => {
    const result = generateLocalAnalysis(
      "Senior React developer with TypeScript experience building web applications",
      "Looking for React developer with TypeScript and Node.js experience"
    );
    const validated = AnalysisResultSchema.safeParse(result);
    expect(validated.success).toBe(true);
  });

  it("handles zero keyword overlap gracefully", () => {
    const result = generateLocalAnalysis(
      "Plumber with 10 years of pipe fitting experience",
      "Senior machine learning engineer with TensorFlow and PyTorch expertise"
    );
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.missingSkills.length).toBeGreaterThan(0);
  });

  it("handles identical resume and JD text", () => {
    const text = "React TypeScript Node.js developer with AWS cloud experience";
    const result = generateLocalAnalysis(text, text);
    expect(result.matchScore).toBeGreaterThanOrEqual(50);
    expect(result.matchedSkills.length).toBeGreaterThan(0);
  });

  it("handles very short text (at threshold)", () => {
    const result = generateLocalAnalysis(
      "python developer here",
      "need python developer now"
    );
    const validated = AnalysisResultSchema.safeParse(result);
    expect(validated.success).toBe(true);
  });

  it("handles JD with only stop words", () => {
    const result = generateLocalAnalysis(
      "React developer with TypeScript experience",
      "the candidate should have strong skills and experience"
    );
    // All words in JD are stop words → jdKeywords will be empty → matchScore = 50
    expect(result.matchScore).toBe(50);
  });

  it("always returns non-empty suggestions", () => {
    const result = generateLocalAnalysis("anything here xxxx", "something else yyyy");
    expect(result.resumeSuggestions.length).toBeGreaterThan(0);
  });

  it("always returns non-empty interview questions", () => {
    const result = generateLocalAnalysis("anything here xxxx", "something else yyyy");
    expect(result.interviewQuestions.length).toBeGreaterThan(0);
  });

  it("always returns a cover letter", () => {
    const result = generateLocalAnalysis("anything here xxxx", "something else yyyy");
    expect(result.coverLetter.length).toBeGreaterThan(0);
  });

  it("matchScore is clamped 0-100", () => {
    const result = generateLocalAnalysis(
      "React React React React React React React React React React",
      "React"
    );
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
  });
});

describe("AnalysisResultSchema validation", () => {
  it("rejects matchScore below 0", () => {
    const result = AnalysisResultSchema.safeParse({
      resumeSummary: "test",
      matchScore: -1,
      matchedSkills: [],
      missingSkills: [],
      resumeSuggestions: [],
      interviewQuestions: [],
      coverLetter: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects matchScore above 100", () => {
    const result = AnalysisResultSchema.safeParse({
      resumeSummary: "test",
      matchScore: 101,
      matchedSkills: [],
      missingSkills: [],
      resumeSuggestions: [],
      interviewQuestions: [],
      coverLetter: "test",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid complete response", () => {
    const result = AnalysisResultSchema.safeParse({
      resumeSummary: "Strong candidate",
      matchScore: 72,
      matchedSkills: ["react", "typescript"],
      missingSkills: ["aws"],
      resumeSuggestions: ["Add AWS certs"],
      interviewQuestions: ["Explain React hooks"],
      coverLetter: "Dear Hiring Manager...",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty arrays for skills", () => {
    const result = AnalysisResultSchema.safeParse({
      resumeSummary: "test",
      matchScore: 50,
      matchedSkills: [],
      missingSkills: [],
      resumeSuggestions: [],
      interviewQuestions: [],
      coverLetter: "test",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = AnalysisResultSchema.safeParse({
      matchScore: 50,
    });
    expect(result.success).toBe(false);
  });
});
