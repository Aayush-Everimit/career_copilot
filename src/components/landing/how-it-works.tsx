import { Upload, ClipboardPaste, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Resume",
    description:
      "Drop your PDF resume into the uploader. We extract the text right in your browser — your file never leaves your device.",
  },
  {
    icon: ClipboardPaste,
    step: "02",
    title: "Paste the Job Description",
    description:
      "Copy the job posting you're interested in and paste it into the text area. That's all the context our AI needs.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Get AI Insights",
    description:
      "Hit Analyze and receive your match score, skill gaps, resume tips, interview questions, and a cover letter — instantly.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#E9F1FA]/50 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Three simple steps to a stronger application.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <div key={s.step} className="relative text-center">
              {/* Connector line (hidden on last + mobile) */}
              {idx < steps.length - 1 && (
                <div className="pointer-events-none absolute top-12 left-[60%] hidden h-0.5 w-[80%] bg-gradient-to-r from-[#00ABE4]/40 to-transparent md:block" />
              )}

              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-md shadow-[#00ABE4]/10">
                <s.icon className="h-10 w-10 text-[#00ABE4]" />
              </div>
              <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-[#00ABE4]">
                Step {s.step}
              </span>
              <h3 className="text-xl font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
