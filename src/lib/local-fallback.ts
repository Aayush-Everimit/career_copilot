import type { AnalysisResult } from "@/types";

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

// Deterministic local analysis when all AI providers fail
export function generateLocalAnalysis(
  resumeText: string,
  jobDescription: string
): AnalysisResult {
  const resumeFreq = getKeywordFrequency(resumeText);
  const jdFreq = getKeywordFrequency(jobDescription);

  const resumeKeywords = new Set(getTopKeywords(resumeFreq, 60));
  const jdKeywords = new Set(getTopKeywords(jdFreq, 40));

  const matchedSkills = [...jdKeywords]
    .filter((word) => resumeKeywords.has(word))
    .slice(0, 15);

  const missingSkills = [...jdKeywords]
    .filter((word) => !resumeKeywords.has(word))
    .slice(0, 15);

  const matchScore =
    jdKeywords.size === 0
      ? 50
      : Math.min(100, Math.round((matchedSkills.length / jdKeywords.size) * 100));

  const resumeSuggestions: string[] = [];
  const resumeSummary =
    matchedSkills.length > 0
      ? `Your profile demonstrates experience related to ${matchedSkills.slice(0, 5).join(", ")}. The strongest alignment with this role comes from these areas.`
      : "Your resume contains limited overlap with the job description. Consider tailoring your experience and skills more closely to the requirements.";

  if (missingSkills.length > 0) {
    resumeSuggestions.push(
      `Consider highlighting experience related to ${missingSkills.slice(0, 3).join(", ")}.`
    );
  }

  if (matchScore < 50) {
    resumeSuggestions.push(
      "Tailor your resume more closely to the terminology used in the job description."
    );
  }

  resumeSuggestions.push("Quantify achievements with measurable results wherever possible.");
  resumeSuggestions.push("Place the most relevant projects, experience, or accomplishments near the top.");

  const interviewQuestions =
    matchedSkills.length > 0
      ? matchedSkills
          .slice(0, 8)
          .map((skill) => `Describe your practical experience with ${skill} and how you have applied it in a real-world situation.`)
      : [
          "Walk me through your professional background.",
          "What accomplishment are you most proud of?",
          "Why are you interested in this role?",
        ];

  const strongestAreas =
    matchedSkills.length > 0
      ? matchedSkills.slice(0, 5).join(", ")
      : "your relevant background and experience";

  const coverLetter = `Dear Hiring Manager,

I am excited to apply for this opportunity.

Based on my background, I believe I can contribute effectively to this role. My experience aligns with several important areas mentioned in the job description, including ${strongestAreas}.

I am particularly interested in the opportunity to contribute my skills while continuing to learn and grow within your organization.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my experience can support your team.

Sincerely,
Candidate`;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    resumeSuggestions,
    interviewQuestions,
    coverLetter,
    resumeSummary,
  };
}