"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Rocket, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00ABE4]">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          Career Copilot
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#00ABE4] dark:text-gray-400 dark:hover:text-[#00ABE4]">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#00ABE4] dark:text-gray-400 dark:hover:text-[#00ABE4]">
            How It Works
          </a>
          <ThemeToggle />
          {isSignedIn ? (
            <Button asChild className="bg-[#00ABE4] hover:bg-[#0088B4] text-white">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-[#00ABE4] hover:bg-[#0088B4] text-white">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 text-gray-600 dark:text-gray-400"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-3 pt-3">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-[#00ABE4] dark:text-gray-400"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-[#00ABE4] dark:text-gray-400"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            {isSignedIn ? (
              <Button asChild className="bg-[#00ABE4] hover:bg-[#0088B4] text-white w-full">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="bg-[#00ABE4] hover:bg-[#0088B4] text-white w-full">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
