import { ArrowRight, Building2, Layers, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroArt } from "./illustrations";

const points = [
  {
    icon: Layers,
    title: "Reads the whole resume",
    text: "Every section is scored on its own, so nothing gets cut off and one keyword-heavy paragraph cannot win.",
  },
  {
    icon: Building2,
    title: "Looks at where they worked",
    text: "Employers are tiered from public evidence and blended in at a modest 25%.",
  },
  {
    icon: ShieldCheck,
    title: "Checks the AI in code",
    text: "Scores are validated and clamped, so a wrong AI answer cannot slip into your ranking.",
  },
];

export default function Hero() {
  return (
    <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col gap-7">
        <Badge variant="outline" className="w-fit gap-2 rounded-full px-3 py-1 text-xs font-normal text-ink-muted">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Chunked similarity + work-experience score
        </Badge>

        <h1 className="font-serif text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
          Turn a stack of resumes into a{" "}
          <span className="text-accent">ranked shortlist</span>
        </h1>

        <p className="max-w-[52ch] text-base leading-relaxed text-ink-muted">
          Drop in a job description and candidate resumes. You get back a
          shortlist sorted by fit, with the reasoning behind every score, in
          seconds.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full px-6">
            <a href="#workspace">
              Start screening <ArrowRight />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <a href="#scoring">How scoring works</a>
          </Button>
        </div>

        <ul className="mt-2 grid gap-4 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-paper-raised text-accent">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-ink">{title}</span>
              <span className="text-[13px] leading-relaxed text-ink-muted">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <HeroArt className="mx-auto w-full max-w-[520px]" />
    </section>
  );
}
