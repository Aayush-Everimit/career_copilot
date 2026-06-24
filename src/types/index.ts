import { z } from "zod/v4";

// API request validation
export const AnalyzeRequestSchema = z.object({
  resumeText: z.string().min(20, "Resume text is too short (min 20 chars)").max(50_000),
  jobDescription: z.string().min(20, "Job description is too short (min 20 chars)").max(10_000),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// API response validation
export const AnalysisResultSchema = z.object({
  resumeSummary: z.string(),
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  resumeSuggestions: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  coverLetter: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
