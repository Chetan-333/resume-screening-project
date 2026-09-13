import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About — Resume Screening",
};

const steps = [
  {
    label: "Parse",
    detail: "Extracts raw text from every uploaded PDF or DOCX resume.",
  },
  {
    label: "Embed",
    detail:
      "Converts the job description and each resume into sentence embeddings.",
  },
  {
    label: "Rank",
    detail: "Scores every resume by cosine similarity to the role.",
  },
  {
    label: "Shortlist",
    detail: "Returns candidates sorted by fit, highest first.",
  },
];

const stack = [
  { name: "FastAPI", role: "Backend API (Python)" },
  { name: "sentence-transformers", role: "all-MiniLM-L6-v2 embeddings" },
  { name: "Next.js", role: "Frontend (App Router)" },
  { name: "Tailwind CSS v4", role: "Styling" },
];

export default function About() {
  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-4xl flex-col gap-16 px-6 py-16 sm:py-20">
        {/* Hero: description left, reference screenshot right */}
        <header className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              About this project
            </span>
            <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.15] text-ink sm:text-[2.5rem]">
              A small tool with one job:{" "}
              <span className="text-accent">find the best-fit resumes</span>{" "}
              fast.
            </h1>
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink-muted">
              Resume Screening reads a job description and a stack of
              candidate resumes, then hands back a ranked shortlist using
              semantic similarity — not keyword matching. No accounts, no
              database, no lock-in: paste, drop, rank.
            </p>
          </div>

          <div className="relative w-full overflow-hidden rounded-lg border border-line bg-paper-raised">
            <Image
              src="/image.png"
              alt="Reference dashboard mockup used as design inspiration for this project"
              width={1200}
              height={800}
              className="h-auto w-full"
              priority
            />
          </div>
        </header>

        {/* How it works */}
        <section className="flex flex-col gap-6">
          <h2 className="font-serif text-xl font-semibold text-ink">
            How it works
          </h2>
          <ol className="grid grid-cols-1 gap-0 sm:grid-cols-4 sm:gap-0">
            {steps.map((step, i) => (
              <li key={step.label} className="relative flex gap-4 sm:flex-col sm:gap-3">
                <div className="flex flex-col items-center sm:w-full">
                  <div className="flex items-center w-full">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                        i === steps.length - 1
                          ? "border-gold text-gold"
                          : "border-accent text-accent"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {i < steps.length - 1 && (
                      <span
                        className="mx-2 hidden h-px flex-1 bg-line sm:block"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1 pb-6 sm:pb-0 sm:pt-3">
                  <span className="text-sm font-medium text-ink">
                    {step.label}
                  </span>
                  <span className="text-xs leading-relaxed text-ink-muted sm:pr-3">
                    {step.detail}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Honesty note on scoring */}
        <section className="flex flex-col gap-3 border-t border-line pt-8">
          <h2 className="font-serif text-xl font-semibold text-ink">
            On the scores
          </h2>
          <p className="max-w-[56ch] text-[15px] leading-relaxed text-ink-muted">
            Match scores are cosine similarity between embeddings, not a
            calibrated probability of fit. Results are ranked and shown
            relative to the top candidate in each batch — a useful
            shortlist, not a verdict. A human should always review before
            deciding.
          </p>
        </section>

        {/* Stack */}
        <section className="flex flex-col gap-4 border-t border-line pt-8">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Under the hood
          </h2>
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-paper-raised">
            {stack.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="font-mono text-ink">{item.name}</span>
                <span className="text-right text-ink-muted">{item.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/screening"
          className="flex h-11 w-fit items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          Try it now
        </Link>
      </main>
    </div>
  );
}
