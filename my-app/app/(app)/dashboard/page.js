"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultsLedger from "@/app/components/ResultsLedger";
import { rankResults } from "@/app/lib/matchBand";

const LAST_SCREENING_KEY = "lastScreening";

function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-paper-raised px-4 py-3">
      <span className="font-mono text-xl text-ink">{value}</span>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [screening, setScreening] = useState(() => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = window.localStorage.getItem(LAST_SCREENING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const ranked = screening ? rankResults(screening.results) : [];
  const shortlistedCount = ranked.filter(
    (r) => r.band.key === "shortlisted"
  ).length;
  const topCandidate = ranked[0];

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Dashboard
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            A snapshot of your most recent screening run, saved locally in
            this browser.
          </p>
        </header>

        {screening === undefined && (
          <p className="text-sm text-ink-muted">Loading…</p>
        )}

        {screening === null && (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-ink-muted/40 bg-paper-raised px-6 py-10">
            <p className="text-[15px] text-ink">
              No screening run yet — rank some candidates on the
              Screening page and they&apos;ll show up here.
            </p>
            <Link
              href="/screening"
              className="flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
            >
              Go rank candidates
            </Link>
          </div>
        )}

        {screening && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Candidates ranked" value={ranked.length} />
              <StatCard label="Shortlisted" value={shortlistedCount} />
              <StatCard
                label="Top score"
                value={topCandidate ? topCandidate.score.toFixed(3) : "—"}
              />
              <StatCard
                label="Files submitted"
                value={screening.fileCount ?? ranked.length}
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-6">
              <span className="text-xs text-ink-muted">
                Ranked {formatTimestamp(screening.rankedAt)}
              </span>
              {screening.jobDescriptionSnippet && (
                <p className="max-w-[60ch] text-sm text-ink-muted">
                  <span className="text-ink">Role: </span>
                  {screening.jobDescriptionSnippet}
                  {screening.jobDescriptionSnippet.length >= 240 ? "…" : ""}
                </p>
              )}
            </div>

            <ResultsLedger
              results={screening.results}
              title="Last screening"
              subtitle="Rings and bands show fit relative to your top candidate in this run."
            />
          </div>
        )}
      </main>
    </div>
  );
}
