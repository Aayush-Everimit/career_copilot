import { auth } from "@clerk/nextjs/server";
import { analyzeResume } from "@/lib/gemini";
import { AnalyzeRequestSchema } from "@/types";

export async function POST(request: Request) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.format() },
      { status: 400 }
    );
  }

  // 3. Call Gemini
  try {
    const result = await analyzeResume(
      parsed.data.resumeText,
      parsed.data.jobDescription
    );
    return Response.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Analysis failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
