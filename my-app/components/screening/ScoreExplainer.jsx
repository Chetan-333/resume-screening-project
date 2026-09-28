import { Layers, Building2, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DonutArt } from "./illustrations";

const tiers = [
  { label: "Tier 1", desc: "Well-known company or top employer", score: "8 – 10", className: "border-accent/50 text-accent" },
  { label: "Tier 2", desc: "Established company with a real presence", score: "5 – 7", className: "border-gold/50 text-gold" },
  { label: "Tier 3", desc: "Small, unknown or unverifiable employer", score: "4", className: "text-ink-muted" },
  { label: "None", desc: "No work experience found on the resume", score: "0", className: "text-ink-muted" },
];

const faqs = [
  {
    q: "Does the employer's name outweigh the resume itself?",
    a: "No. Work experience is capped at 25% of the final score and similarity carries the other 75%. Company tiers are a judgement from public evidence, so they are kept deliberately modest and always shown next to the similarity score.",
  },
  {
    q: "What happens if the AI or an outside service fails?",
    a: "That candidate is ranked on resume similarity alone and marked \"experience couldn't be read\". A failure is never treated as zero experience, and failed lookups are not saved.",
  },
  {
    q: "Are my resumes stored?",
    a: "Uploaded files are read from a temporary file that is deleted right after parsing, and the resume text is not sent back to your browser. Only the extracted work history (employer, title, dates) is cached, keyed by a hash, so the same resume is not analysed twice.",
  },
  {
    q: "Can I trust the ranking as a hiring decision?",
    a: "Treat it as decision support, not a decision. It cannot verify that someone really worked where they say they did, so every score is broken down for a person to review.",
  },
];

export default function ScoreExplainer() {
  return (
    <section id="scoring" className="flex scroll-mt-8 flex-col gap-8" aria-labelledby="scoring-heading">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Transparent scoring</span>
        <h2 id="scoring-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          How the score is built
        </h2>
        <p className="max-w-[60ch] text-sm leading-relaxed text-ink-muted">
          Two factors, shown separately for every candidate, so you can see
          exactly why someone ranks where they do.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center gap-5 p-6">
            <DonutArt className="w-44" />
            <ul className="flex w-full flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-accent" aria-hidden="true" />
                <span className="text-ink">Resume similarity</span>
                <span className="ml-auto font-mono text-ink-muted">75%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-gold" aria-hidden="true" />
                <span className="text-ink">Work experience</span>
                <span className="ml-auto font-mono text-ink-muted">25%</span>
              </li>
            </ul>
            <p className="w-full rounded-lg bg-secondary p-3 text-[13px] leading-relaxed text-ink-muted">
              Example: similarity 0.78 and a tier-1 employer scored 8/10 gives{" "}
              <span className="font-mono text-ink">0.75 × 0.78 + 0.25 × 0.8 = 0.785</span>.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="gap-0 py-0">
            <CardContent className="flex flex-col gap-3 p-6">
              <Layers className="size-5 text-accent" aria-hidden="true" />
              <h3 className="text-base font-medium text-ink">Section-by-section similarity</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                The embedding model can only read about 512 tokens at once, so
                long resumes used to lose their later sections. Now each section
                is compared to the role separately, and the best three are
                averaged.
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="flex flex-col gap-3 p-6">
              <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
              <h3 className="text-base font-medium text-ink">Guardrails on every AI answer</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                The AI only sees the experience section, treats resume text as
                data, and its answer is schema-checked and clamped into a fixed
                score band in code before it is used.
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0 sm:col-span-2">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-accent" aria-hidden="true" />
                <h3 className="text-base font-medium text-ink">Company tiers</h3>
                <span className="text-[13px] text-ink-muted">seed list → cache → Wikipedia evidence + AI judge</span>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tiers.map((t) => (
                  <li key={t.label} className="flex flex-col gap-2 rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={t.className}>{t.label}</Badge>
                      <span className="font-mono text-sm text-ink">{t.score}</span>
                    </div>
                    <span className="text-xs leading-relaxed text-ink-muted">{t.desc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-2 sm:p-4">
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="px-3">
                <AccordionTrigger className="text-sm font-medium text-ink">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-ink-muted">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
