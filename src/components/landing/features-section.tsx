import {
  Target,
  Brain,
  FileText,
  HelpCircle,
  BarChart3,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Match Scoring",
    description: "Get an instant percentage score showing how well your resume matches the job description.",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "See exactly which skills you have and which ones you need to add to stand out.",
  },
  {
    icon: Brain,
    title: "AI Suggestions",
    description: "Receive personalized resume improvement tips powered by Google Gemini AI.",
  },
  {
    icon: HelpCircle,
    title: "Interview Prep",
    description: "Get custom technical interview questions based on the role so you can prepare effectively.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Generate a professional, tailored cover letter that highlights your relevant experience.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "No waiting. Upload, paste, and get your complete analysis in under 15 seconds.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 sm:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Everything You Need to{" "}
            <span className="text-[#00ABE4]">Stand Out</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            One upload. One paste. Six powerful insights to transform your job
            application.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00ABE4]/30 hover:shadow-lg hover:shadow-[#00ABE4]/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-[#00ABE4]/40"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9F1FA] text-[#00ABE4] transition-colors group-hover:bg-[#00ABE4] group-hover:text-white dark:bg-[#00ABE4]/15">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
