// Prompt template for unified resume analysis
export function buildAnalysisPrompt(
  resumeText: string,
  jobDescription: string
): string {
  return `You are an expert career advisor and resume analyst. Analyze the following resume against the job description and return a comprehensive analysis.

Return ONLY valid JSON matching this exact schema. Do NOT include markdown code fences, backticks, or any text outside the JSON object.

{
  "resumeSummary": "A 2-3 sentence summary positioning the candidate. Example: 'Your resume positions you as a Java Full Stack Developer with strengths in Spring Boot, PostgreSQL and REST APIs. The biggest gaps for this role are AWS and Kafka.'",
  "matchScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "resumeSuggestions": ["suggestion1", "suggestion2", ...],
  "interviewQuestions": ["question1", "question2", ...],
  "coverLetter": "A professional cover letter tailored to this specific role..."
}

Guidelines:
- matchScore: Be realistic. A perfect score should be rare.
- matchedSkills: List skills found in BOTH the resume and job description.
- missingSkills: List skills in the job description that are ABSENT from the resume.
- resumeSuggestions: Give 4-6 specific, actionable suggestions to improve the resume for this role.
- interviewQuestions: Generate 5-7 technical interview questions likely to be asked for this role, based on the required skills.
- coverLetter: Write a professional 3-4 paragraph cover letter. Use a confident but not arrogant tone. Reference specific experience from the resume that matches the job requirements.
- resumeSummary: Summarize the candidate's positioning in 2-3 sentences, highlighting key strengths and the biggest gaps for this specific role.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}

Return the JSON analysis now:`;
}
