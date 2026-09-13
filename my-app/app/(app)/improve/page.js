"use client";

import { useCallback, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function isAcceptedFile(file) {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

const ruledPaperStyle = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--line) 28px)",
  backgroundAttachment: "local",
  lineHeight: "28px",
};

// Cosine similarity between a resume and a job description isn't a
// calibrated percentage, so this is a rough, labeled signal rather than
// a claimed accuracy — same honesty note as the Screening/About pages.
function getAlignmentBand(score) {
  if (score >= 0.55) {
    return { label: "Strong alignment", textClass: "text-accent", dotClass: "bg-accent" };
  }
  if (score >= 0.35) {
    return { label: "Moderate alignment", textClass: "text-gold", dotClass: "bg-gold" };
  }
  return { label: "Needs work", textClass: "text-danger", dotClass: "bg-danger" };
}

export default function Improve() {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const pickFile = useCallback((incoming) => {
    const accepted = incoming.find(isAcceptedFile);
    if (!accepted) {
      setError("Please choose a PDF or DOCX resume.");
      return;
    }
    setError("");
    setFile(accepted);
  }, []);

  function handleFileInputChange(e) {
    const picked = Array.from(e.target.files || []);
    if (picked.length > 0) pickFile(picked);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) pickFile(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }
    if (!file) {
      setError("Please add a resume (PDF or DOCX).");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("resume", file);

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
          const data = await res.json();
          if (data?.detail) message = data.detail;
        } catch {
          // response wasn't JSON — keep the generic message
        }
        throw new Error(message);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while analyzing your resume. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  const band = result ? getAlignmentBand(result.score) : null;

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-xl flex-col gap-10 px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Improve your resume
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            Upload one resume and a job description. You&apos;ll get a fit
            score and specific suggestions for closing the gap.
          </p>
          <p className="text-xs text-ink-muted">
            Uses the same parsing and embedding pipeline as Screening, plus
            an LLM (via LangChain + Groq) for the written feedback.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="job-description" className="text-sm text-ink">
              The role
            </label>
            <textarea
              id="job-description"
              rows={7}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              style={ruledPaperStyle}
              className="w-full resize-none border-0 border-b border-line bg-paper-raised px-3 pt-2 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-ink">Your resume</label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-4 py-9 text-center transition-colors ${
                isDragging
                  ? "border-accent bg-gold-soft/40"
                  : "border-dashed border-ink-muted/40 bg-paper-raised hover:border-ink-muted/70"
              }`}
            >
              <p className="text-[15px] text-ink">
                {file ? file.name : "Click to browse, or drag a resume in"}
              </p>
              <p className="text-xs text-ink-muted">
                {file ? "Click to replace" : "PDF or DOCX, one file"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing resume…" : "Analyze resume"}
          </button>
        </form>

        {error && (
          <p className="border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {result && (
          <div className="flex animate-[fadeIn_0.4s_ease-out] flex-col gap-6">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-paper-raised px-4 py-4">
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-medium ${band.textClass}`}>
                  {band.label}
                </span>
                <span className="text-xs text-ink-muted">
                  Similarity to the job description
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${band.dotClass}`} aria-hidden="true" />
                <span className="font-mono text-lg text-ink">
                  {result.score.toFixed(4)}
                </span>
              </div>
            </div>

            {result.summary && (
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Summary
                </h2>
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  {result.summary}
                </p>
              </div>
            )}

            {result.strengths?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Strengths
                </h2>
                <ul className="flex flex-col gap-2">
                  {result.strengths.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-ink">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.improvements?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  What to improve
                </h2>
                <ul className="flex flex-col gap-2">
                  {result.improvements.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-[15px] text-ink">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
