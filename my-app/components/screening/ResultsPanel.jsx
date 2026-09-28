"use client";

import { useMemo, useState } from "react";
import { Check, Crown, Plus } from "lucide-react";
import ScoreRing from "@/app/components/ScoreRing";
import { rankResults } from "@/app/lib/matchBand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EmptyArt } from "./illustrations";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "maybe", label: "Maybe" },
  { key: "not-matched", label: "Not matched" },
];

function experienceSummary(experience) {
  if (experience.status === "scored") {
    const { best, score } = experience;
    return `Experience ${score}/10 (${best.company}, tier ${best.tier})`;
  }
  if (experience.status === "none") return "No work experience found";
  return "Experience couldn't be read";
}

// Splits the final score into the part that came from resume similarity and
// the part that came from experience, so the bar matches the real weights.
function scoreParts(r, weights) {
  const wSim = weights?.similarity ?? 1;
  const simPart = Math.min(r.score, wSim * r.similarity);
  const expPart = Math.max(r.score - simPart, 0);
  return { simPart, expPart };
}

function Stat({ label, value, hint }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-xs uppercase tracking-[0.1em] text-ink-muted">{label}</span>
        <span className="font-mono text-2xl font-semibold text-ink">{value}</span>
        <span className="truncate text-xs text-ink-muted">{hint}</span>
      </CardContent>
    </Card>
  );
}

function CompositionBar({ simPart, expPart, hasExperience }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex h-2 w-full max-w-64 overflow-hidden rounded-full bg-line"
          role="img"
          aria-label={`Score made of ${simPart.toFixed(2)} from similarity and ${expPart.toFixed(2)} from experience`}
        >
          <div className="h-full bg-accent" style={{ width: `${simPart * 100}%` }} />
          {hasExperience && <div className="h-full bg-gold" style={{ width: `${expPart * 100}%` }} />}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        Similarity {simPart.toFixed(3)}
        {hasExperience && ` + experience ${expPart.toFixed(3)}`}
      </TooltipContent>
    </Tooltip>
  );
}

function CandidateCard({ r, weights, shortlisted, onToggle }) {
  const { simPart, expPart } = scoreParts(r, weights);
  const items = r.experience?.items ?? [];

  return (
    <Card className={cn("gap-0 py-0", r.isTop && "border-gold/60 bg-gold-soft/20")}>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
          <span className="w-6 shrink-0 font-mono text-sm text-ink-muted">
            {String(r.rank).padStart(2, "0")}
          </span>
          <ScoreRing
            value={r.relativePct}
            size={52}
            colorClass={r.isTop ? "text-gold" : r.band.ringClass}
          />

          <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[15px] font-medium text-ink">{r.filename}</span>
              {r.isTop ? (
                <Badge variant="outline" className="gap-1 border-gold/60 text-gold">
                  <Crown className="size-3" aria-hidden="true" /> Top match
                </Badge>
              ) : (
                <Badge variant="outline" className={r.band.textClass}>
                  {r.band.label}
                </Badge>
              )}
            </div>
            {r.experience && (
              <span className="truncate text-xs text-ink-muted">
                Similarity {r.similarity.toFixed(4)} &middot; {experienceSummary(r.experience)}
              </span>
            )}
            <CompositionBar simPart={simPart} expPart={expPart} hasExperience={!!r.experience} />
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto">
            <span className="font-mono text-base text-ink">{r.score.toFixed(4)}</span>
            <Button
              type="button"
              size="sm"
              variant={shortlisted ? "default" : "outline"}
              className="rounded-full"
              onClick={onToggle}
              aria-pressed={shortlisted}
            >
              {shortlisted ? <Check /> : <Plus />}
              {shortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          </div>
        </div>

        {items.length > 0 && (
          <Accordion type="single" collapsible className="border-t border-line">
            <AccordionItem value="why" className="border-b-0 px-5">
              <AccordionTrigger className="py-3 text-[13px] text-ink-muted hover:text-ink">
                Why this score? · {items.length} role{items.length === 1 ? "" : "s"} found
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-3 pb-1">
                  {items.map((it, i) => (
                    <li key={`${it.company}-${i}`} className="flex flex-col gap-1 rounded-lg bg-secondary p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-ink">{it.company}</span>
                        <span className="text-ink-muted">{it.title}</span>
                        <Badge variant="outline" className="ml-auto font-mono">
                          Tier {it.tier} · {it.score}/10
                        </Badge>
                      </div>
                      <span className="text-xs text-ink-muted">
                        {[it.type, [it.start, it.end].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
                      </span>
                      {it.reason && (
                        <span className="text-[13px] leading-relaxed text-ink-muted">{it.reason}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResultsPanel({ results, weights, loading }) {
  const [filter, setFilter] = useState("all");
  const [shortlisted, setShortlisted] = useState({});

  const ranked = useMemo(() => rankResults(results), [results]);

  const counts = useMemo(() => {
    const c = { all: ranked.length, shortlisted: 0, maybe: 0, "not-matched": 0 };
    for (const r of ranked) c[r.band.key] += 1;
    return c;
  }, [ranked]);

  const stats = useMemo(() => {
    if (ranked.length === 0) return null;
    const avgSim = ranked.reduce((sum, r) => sum + r.similarity, 0) / ranked.length;
    return { top: ranked[0], avgSim };
  }, [ranked]);

  const visible = filter === "all" ? ranked : ranked.filter((r) => r.band.key === filter);
  const weighted = weights && weights.experience > 0;

  return (
    <section id="results" className="flex scroll-mt-8 flex-col gap-6" aria-labelledby="results-heading">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Results</span>
        <h2 id="results-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Your ranked shortlist
        </h2>
        {weighted && (
          <p className="text-sm text-ink-muted">
            Final score = {Math.round(weights.similarity * 100)}% resume similarity +{" "}
            {Math.round(weights.experience * 100)}% work experience.
          </p>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Ranking candidates">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && !results && (
        <Card className="gap-0 border-dashed py-0">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <EmptyArt className="w-64" />
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium text-ink">No results yet</p>
              <p className="max-w-[44ch] text-sm text-ink-muted">
                Add a job description and some resumes above, then press Rank candidates. Your ranked list will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && results && ranked.length === 0 && (
        <p className="text-sm text-ink-muted">No results returned.</p>
      )}

      {!loading && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Candidates ranked" value={ranked.length} hint="in this batch" />
            <Stat label="Top score" value={stats.top.score.toFixed(3)} hint={stats.top.filename} />
            <Stat label="Shortlisted band" value={counts.shortlisted} hint="within 70% of the best" />
            <Stat label="Avg. similarity" value={stats.avgSim.toFixed(3)} hint="resume vs. role" />
          </div>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-auto flex-wrap">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.key} value={f.key} className="gap-1.5">
                  {f.label}
                  <span className="font-mono text-xs text-ink-muted">{counts[f.key]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {visible.length === 0 ? (
            <p className="text-sm text-ink-muted">No candidates in this band.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {visible.map((r) => (
                <li key={r.filename + r.rank}>
                  <CandidateCard
                    r={r}
                    weights={weights}
                    shortlisted={!!shortlisted[r.filename]}
                    onToggle={() =>
                      setShortlisted((prev) => ({ ...prev, [r.filename]: !prev[r.filename] }))
                    }
                  />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
