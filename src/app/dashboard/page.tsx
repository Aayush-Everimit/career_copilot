"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UserButton } from "@clerk/nextjs";
import {
  Rocket,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  HelpCircle,
  Mail,
  Copy,
  Check,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { extractTextFromPDF } from "@/lib/pdf-parser";
import type { AnalysisResult } from "@/types";

// Score ring SVG
function ScoreRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? "#22c55e"
      : score >= 50
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-score-fill transition-all duration-1000"
          style={{ "--score-offset": offset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}%</span>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Match</span>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#00ABE4]" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Analyzing your resume with AI — this takes about 10 seconds...
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// Main dashboard page
export default function DashboardPage() {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  // PDF upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError("File size must be under 5 MB.");
      return;
    }

    setPdfError(null);
    setIsParsing(true);

    try {
      const text = await extractTextFromPDF(file);
      if (text.length < 20) {
        setPdfError(
          "Could not extract enough text from this PDF. Try a different file or format."
        );
        setIsParsing(false);
        return;
      }
      setResumeText(text);
      setResumeFileName(file.name);
    } catch {
      setPdfError("Failed to read this PDF. Make sure it's not password-protected.");
    } finally {
      setIsParsing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const canAnalyze =
    resumeText && jobDescription.trim().length >= 20 && !isAnalyzing;

  const handleAnalyze = async () => {
    if (!canAnalyze || !resumeText) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Request failed (${res.status})`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.coverLetter) return;
    await navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResumeText(null);
    setResumeFileName(null);
    setJobDescription("");
    setResult(null);
    setError(null);
    setPdfError(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F6FD] dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00ABE4]">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            Career Copilot
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Resume Analyzer
          </h1>
          <p className="mt-1 text-gray-700 dark:text-gray-400">
            Upload your resume and paste the job description to get started.
          </p>
        </div>

        {/* Input section */}
        {!result && !isAnalyzing && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Resume upload */}
            <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-[#00ABE4]" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumeText ? (
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-green-800 dark:text-green-300">
                        {resumeFileName}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        {resumeText.length.toLocaleString()} characters extracted
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setResumeText(null);
                        setResumeFileName(null);
                      }}
                      className="rounded-lg p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
                      aria-label="Remove resume"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                      isDragActive
                        ? "border-[#00ABE4] bg-[#E9F1FA] dark:bg-[#00ABE4]/10"
                        : "border-gray-300 bg-gray-50 hover:border-[#00ABE4] hover:bg-[#E9F1FA]/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#00ABE4] dark:hover:bg-[#00ABE4]/5"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {isParsing ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#00ABE4]" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    )}
                    <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isParsing
                        ? "Extracting text..."
                        : isDragActive
                          ? "Drop your PDF here"
                          : "Drag & drop your resume PDF"}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-500">
                      PDF only, max 5 MB
                    </p>
                  </div>
                )}
                {pdfError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{pdfError}</p>
                )}
              </CardContent>
            </Card>

            {/* Job description */}
            <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-[#00ABE4]" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px] w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00ABE4] focus:outline-none focus:ring-2 focus:ring-[#00ABE4]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-500">
                    {jobDescription.length.toLocaleString()} characters
                    {jobDescription.length > 0 && jobDescription.length < 20 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        {" "}
                        — minimum 20 required
                      </span>
                    )}
                  </p>
                  {jobDescription.length > 0 && (
                    <button
                      onClick={() => setJobDescription("")}
                      className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analyze button */}
        {!result && !isAnalyzing && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              size="lg"
              className="bg-[#00ABE4] hover:bg-[#0088B4] text-white px-10 py-6 text-base font-semibold shadow-lg shadow-[#00ABE4]/25 disabled:opacity-50 disabled:shadow-none"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Analyze Resume
            </Button>
            {!resumeText && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Upload a resume to get started
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {isAnalyzing && <LoadingSkeleton />}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in-up">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Analysis
            </Button>

            {/* Resume summary */}
            <Card className="border-[#00ABE4]/20 bg-gradient-to-r from-[#E9F1FA] to-white shadow-sm dark:from-[#00ABE4]/10 dark:to-gray-900 dark:border-[#00ABE4]/30">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ABE4]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Resume Summary
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                    {result.resumeSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Score + skills row */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                  <ScoreRing score={result.matchScore} />
                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Match Score
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Matched Skills ({result.matchedSkills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-amber-500" />
                    Missing Skills ({result.missingSkills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="w-full justify-start bg-gray-100 p-1 dark:bg-gray-800">
                <TabsTrigger value="suggestions" className="gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="interview" className="gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Interview Prep
                </TabsTrigger>
                <TabsTrigger value="cover-letter" className="gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Cover Letter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions">
                <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Resume Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.resumeSuggestions.map((s, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9F1FA] text-xs font-bold text-[#00ABE4] dark:bg-[#00ABE4]/15">
                            {i + 1}
                          </span>
                          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                            {s}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interview">
                <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Technical Interview Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {result.interviewQuestions.map((q, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9F1FA] text-xs font-bold text-[#00ABE4] dark:bg-[#00ABE4]/15">
                            Q{i + 1}
                          </span>
                          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                            {q}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cover-letter">
                <Card className="border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Generated Cover Letter
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-4" />
                    <div className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-white p-6 text-sm leading-relaxed text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {result.coverLetter}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
