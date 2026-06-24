"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E9F1FA] via-white to-[#E9F1FA] pt-28 pb-20 sm:pt-36 sm:pb-28 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#00ABE4]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#00ABE4]/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-[#00ABE4]/20 bg-white px-4 py-1.5 text-sm font-medium text-[#00ABE4] shadow-sm dark:bg-gray-800 dark:border-[#00ABE4]/30">
          <Sparkles className="h-4 w-4" />
          AI-Powered Resume Analysis
        </div>

        <h1 className="animate-fade-in-up-delay-1 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
          Land Your Dream Job with{" "}
          <span className="text-[#00ABE4]">AI-Powered</span> Insights
        </h1>

        <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-400">
          Upload your resume, paste a job description, and get instant match
          scoring, skill gap analysis, interview prep, and a tailored cover
          letter — all in seconds.
        </p>

        <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-[#00ABE4] hover:bg-[#0088B4] text-white px-8 py-6 text-base font-semibold shadow-lg shadow-[#00ABE4]/25 transition-all hover:shadow-xl hover:shadow-[#00ABE4]/30"
          >
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-500">No credit card required</p>
        </div>
      </div>
    </section>
  );
}
