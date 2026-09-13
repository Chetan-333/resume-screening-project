"use client";

import { useCallback, useRef, useState } from "react";
import ResultsLedger from "@/app/components/ResultsLedger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const LAST_SCREENING_KEY = "lastScreening";
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

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    setFiles((prev) => {
      const accepted = incoming.filter(isAcceptedFile);
      const skipped = incoming.length - accepted.length;
      if (skipped > 0) {
        setError(
          `Skipped ${skipped} file${skipped > 1 ? "s" : ""} — only PDF and DOCX are supported.`
        );
      }
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const deduped = accepted.filter(
        (f) => !existingKeys.has(`${f.name}-${f.size}`)
      );
      return [...prev, ...deduped];
    });
  }, []);

  function handleFileInputChange(e) {
    const picked = Array.from(e.target.files || []);
    if (picked.length > 0) addFiles(picked);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) addFiles(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }
    if (files.length === 0) {
      setError("Please add at least one resume (PDF or DOCX).");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    for (const file of files) {
      formData.append("resumes", file);
    }

    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_URL}/api/rank`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results || []);

      // Save this run so the Dashboard can show the most recent screening.
      try {
        localStorage.setItem(
          LAST_SCREENING_KEY,
          JSON.stringify({
            jobDescriptionSnippet: jobDescription.trim().slice(0, 240),
            fileCount: files.length,
            results: data.results || [],
            rankedAt: new Date().toISOString(),
          })
        );
      } catch {
        // localStorage unavailable — Dashboard will just show its empty state
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while ranking resumes. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-xl flex-col gap-10 px-6 py-16 sm:py-20">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Cosine similarity ranking &middot; PDF &amp; DOCX supported
          </span>
          <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.15] text-ink sm:text-[2.5rem]">
            Turn a stack of resumes into a{" "}
            <span className="text-accent">ranked shortlist</span>
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            Drop in a job description and candidate resumes. Get back a
            shortlist sorted by fit, in seconds.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Job description */}
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

          {/* Candidates */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-ink">Candidates</label>

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
                Click to browse, or drag resumes in
              </p>
              <p className="text-xs text-ink-muted">PDF or DOCX</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-paper-raised">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${file.size}-${i}`}
                    className="flex items-center gap-3 px-3 py-2 text-[14px]"
                  >
                    <span className="w-5 shrink-0 font-mono text-xs text-ink-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 truncate text-ink">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="shrink-0 text-xs text-ink-muted hover:text-danger"
                      aria-label={`Remove ${file.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Ranking candidates…" : "Rank candidates"}
          </button>
        </form>

        {error && (
          <p className="border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {/* Results */}
        {results && <ResultsLedger results={results} />}
      </main>
    </div>
  );
}
