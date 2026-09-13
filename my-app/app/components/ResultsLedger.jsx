"use client";

import { useMemo, useState } from "react";
import ScoreRing from "./ScoreRing";
import { rankResults } from "../lib/matchBand";

export default function ResultsLedger({
  results,
  title = "Results",
  subtitle,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [shortlisted, setShortlisted] = useState({});

  const ranked = useMemo(() => rankResults(results), [results]);

  const counts = useMemo(() => {
    const c = { all: ranked.length, shortlisted: 0, maybe: 0, "not-matched": 0 };
    for (const r of ranked) c[r.band.key] += 1;
    return c;
  }, [ranked]);

  const filters = [
    { key: "all", label: "All" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "maybe", label: "Maybe" },
    { key: "not-matched", label: "Not matched" },
  ];

  const filtered =
    activeFilter === "all"
      ? ranked
      : ranked.filter((r) => r.band.key === activeFilter);

  return (
    <div className="flex animate-[fadeIn_0.4s_ease-out] flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
        <span className="text-xs text-ink-muted">{ranked.length} ranked</span>
      </div>

      {subtitle && (
        <p className="-mt-2 text-xs leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}

      {ranked.length === 0 ? (
        <p className="text-sm text-ink-muted">No results returned.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activeFilter === f.key
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-ink-muted hover:text-ink"
                }`}
              >
                {f.label} ({counts[f.key] ?? 0})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No candidates in this band.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-line border-t border-line">
              {filtered.map((r) => (
                <li
                  key={r.filename + r.rank}
                  className={`flex items-center gap-4 py-3 pl-3 pr-2 ${
                    r.isTop ? "border-l-2 border-gold bg-gold-soft/30" : ""
                  }`}
                >
                  <span className="w-6 shrink-0 font-mono text-sm text-ink-muted">
                    {String(r.rank).padStart(2, "0")}
                  </span>

                  <ScoreRing
                    value={r.relativePct}
                    colorClass={r.isTop ? "text-gold" : r.band.ringClass}
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[15px] text-ink">
                      {r.filename}
                    </span>
                    <span
                      className={`w-fit text-xs ${
                        r.isTop ? "text-gold" : r.band.textClass
                      }`}
                    >
                      {r.isTop ? "Top match" : r.band.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShortlisted((prev) => ({
                          ...prev,
                          [r.filename]: !prev[r.filename],
                        }))
                      }
                      className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] shadow-sm transition-colors ${
                        shortlisted[r.filename]
                          ? "bg-surface-tint text-on-primary"
                          : "bg-primary text-on-primary hover:bg-surface-tint"
                      }`}
                    >
                      {shortlisted[r.filename] ? "Shortlisted" : "Shortlist"}
                    </button>
                    <span className="shrink-0 font-mono text-sm text-ink">
                      {r.score.toFixed(4)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
