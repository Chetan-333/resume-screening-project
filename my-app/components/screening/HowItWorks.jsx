import { ListChecks, ScanSearch, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Upload,
    title: "Add the role and the resumes",
    text: "Paste the job description and drop in as many PDF or DOCX resumes as you like.",
  },
  {
    icon: ScanSearch,
    title: "We read and score each one",
    text: "Each resume is split into sections and compared to the role. If you keep experience scoring on, employers are looked up and tiered too.",
  },
  {
    icon: ListChecks,
    title: "Review a ranked, explained list",
    text: "See every score split into similarity and experience, open any row to see why, and shortlist who you want.",
  },
];

export default function HowItWorks() {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="how-heading">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">How it works</span>
        <h2 id="how-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Three steps, no spreadsheet
        </h2>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <Card className="h-full gap-0 py-0">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-accent">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm text-ink-muted">0{i + 1}</span>
                </div>
                <h3 className="text-base font-medium text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
