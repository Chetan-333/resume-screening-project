// Cosine similarity scores from the backend aren't calibrated
// probabilities, so we don't present them as an absolute "% match."
// Instead, each candidate's score relative to the top candidate in the
// same batch decides which band they fall in. This keeps the language
// honest: "Shortlisted" means "closest to your best candidate here,"
// not "objectively 92% qualified."
export function getMatchBand(relativePct) {
  if (relativePct >= 70) {
    return {
      key: "shortlisted",
      label: "Shortlisted",
      textClass: "text-accent",
      ringClass: "text-accent",
      dotClass: "bg-accent",
    };
  }
  if (relativePct >= 40) {
    return {
      key: "maybe",
      label: "Maybe",
      textClass: "text-gold",
      ringClass: "text-gold",
      dotClass: "bg-gold",
    };
  }
  return {
    key: "not-matched",
    label: "Not matched",
    textClass: "text-ink-muted",
    ringClass: "text-ink-muted",
    dotClass: "bg-ink-muted",
  };
}

// Attaches rank, relative-fit percentage, and a match band to each raw
// {filename, score} result. Assumes results already come sorted
// descending by score (the backend guarantees this).
export function rankResults(results) {
  if (!results || results.length === 0) return [];
  const maxScore = Math.max(...results.map((r) => r.score), 0.0001);
  return results.map((r, i) => {
    const relativePct = (r.score / maxScore) * 100;
    return {
      ...r,
      rank: i + 1,
      relativePct,
      band: getMatchBand(relativePct),
      isTop: i === 0,
    };
  });
}
