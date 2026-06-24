"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const { isSignedIn } = useAuth();

  return (
    <section className="bg-gradient-to-r from-[#00ABE4] to-[#0088B4] py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to Boost Your Job Applications?
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Join Career Copilot and start getting AI-powered insights in seconds.
          Free to use, no credit card required.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-white text-[#00ABE4] hover:bg-gray-50 px-8 py-6 text-base font-semibold shadow-lg dark:bg-gray-900 dark:text-[#00ABE4] dark:hover:bg-gray-800"
        >
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
