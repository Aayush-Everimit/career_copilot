import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Copilot — AI-Powered Resume Analyzer",
  description:
    "Upload your resume, paste a job description, and get instant AI-powered analysis with match scoring, skill gap detection, and a tailored cover letter.",
  keywords: [
    "resume analyzer",
    "AI resume",
    "job matching",
    "cover letter generator",
    "career advice",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <body className="min-h-screen bg-white text-gray-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
