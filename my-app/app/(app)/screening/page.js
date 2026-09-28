"use client";

import { useCallback, useState } from "react";
import Hero from "@/components/screening/Hero";
import HowItWorks from "@/components/screening/HowItWorks";
import ResultsPanel from "@/components/screening/ResultsPanel";
import ScoreExplainer from "@/components/screening/ScoreExplainer";
import ScreeningForm from "@/components/screening/ScreeningForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const LAST_SCREENING_KEY = "lastScreening";
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function isAcceptedFile(file) {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [weights, setWeights] = useState(null);
  const [includeExperience, setIncludeExperience] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addFiles = useCallback((incoming) => {
    const accepted = incoming.filter(isAcceptedFile);
    const skipped = incoming.length - accepted.length;
    if (skipped > 0) {
      setError(
        `Skipped ${skipped} file${skipped > 1 ? "s" : ""} — only PDF and DOCX are supported.`
      );
    }
    setFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const deduped = accepted.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      return [...prev, ...deduped];
    });
  }, []);

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
    formData.append("include_experience", includeExperience ? "true" : "false");
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
      setWeights(data.weights || null);

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

      requestAnimationFrame(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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
      <main className="flex w-full max-w-6xl flex-col gap-20 px-6 py-12 sm:py-16">
        <Hero />
        <HowItWorks />
        <ScreeningForm
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          files={files}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
          includeExperience={includeExperience}
          onIncludeExperienceChange={setIncludeExperience}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
        <ResultsPanel results={results} weights={weights} loading={loading} />
        <ScoreExplainer />
      </main>
    </div>
  );
}
