import Link from "next/link";
import { Rocket, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Built for Digital Heroes */}
          <div className="text-center">
            <Button
              asChild
              variant="outline"
              className="mt-3 border-[#00ABE4] text-[#00ABE4] hover:bg-[#00ABE4] hover:text-white"
            >
              <a
                href="https://digitalheroesco.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Built for Digital Heroes
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          {/* Divider */}
          <div className="h-px w-full max-w-xs bg-gray-200" />

          {/* Logo & Contact */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00ABE4]">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              Career Copilot
            </Link>
            <div className="flex flex-col items-center gap-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">Aayush Gautam</span>
              <a
                href="mailto:aayush_2006@outlook.com"
                className="flex items-center gap-1 transition-colors hover:text-[#00ABE4]"
              >
                <Mail className="h-3.5 w-3.5" />
                aayush_2006@outlook.com
              </a>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Career Copilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
