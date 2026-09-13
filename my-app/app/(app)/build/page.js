"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function BuildResume() {
  const [step, setStep] = useState(1);

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [validationError, setValidationError] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        const res = await fetch(`${API_URL}/api/resume/templates`);
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
        if (!cancelled) setTemplates(data.templates || []);
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err.message ||
              "Couldn't load resume templates. Is the backend running?"
          );
        }
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    }

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  function chooseTemplate(template) {
    setSelectedTemplate(template);
    setAnswers({});
    setValidationError("");
    setGenerateError("");
    setStep(2);
  }

  function goBack() {
    setStep(1);
    setSelectedTemplate(null);
    setAnswers({});
    setValidationError("");
    setGenerateError("");
  }

  function updateAnswer(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setValidationError("");
    setGenerateError("");

    const missing = selectedTemplate.questions.filter(
      (q) => q.required && !(answers[q.key] || "").trim()
    );
    if (missing.length > 0) {
      setValidationError(
        `Please fill in: ${missing.map((q) => q.label).join(", ")}`
      );
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/resume/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          answers,
        }),
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

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setGenerateError(
        err.message ||
          "Something went wrong while generating your resume. Is the backend running?"
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-xl flex-col gap-10 px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Build your resume
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            Pick a template and answer a few short questions. We&apos;ll turn
            your answers into a polished, downloadable resume.
          </p>
        </header>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            {loadingTemplates && (
              <p className="text-sm text-ink-muted">Loading templates…</p>
            )}

            {fetchError && (
              <p className="border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {fetchError}
              </p>
            )}

            {!loadingTemplates &&
              !fetchError &&
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => chooseTemplate(template)}
                  className="flex flex-col gap-1 rounded-lg border border-line bg-paper-raised px-4 py-4 text-left transition-colors hover:border-accent"
                >
                  <span className="font-serif text-lg text-ink">
                    {template.name}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {template.description}
                  </span>
                </button>
              ))}
          </div>
        )}

        {step === 2 && selectedTemplate && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">
                Building: {selectedTemplate.name}
              </h2>
              <button
                type="button"
                onClick={goBack}
                className="text-sm text-ink-muted hover:text-ink"
              >
                ← Back to templates
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-6">
              {selectedTemplate.questions.map((q) => (
                <div key={q.key} className="flex flex-col gap-2">
                  <label htmlFor={q.key} className="text-sm text-ink">
                    {q.label}
                    {q.required && <span className="text-danger"> *</span>}
                  </label>
                  {q.type === "text" ? (
                    <input
                      id={q.key}
                      type="text"
                      value={answers[q.key] || ""}
                      onChange={(e) => updateAnswer(q.key, e.target.value)}
                      placeholder={q.placeholder}
                      className="w-full border-0 border-b border-line bg-paper-raised px-3 pt-2 pb-2 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
                    />
                  ) : (
                    <>
                      <textarea
                        id={q.key}
                        rows={4}
                        value={answers[q.key] || ""}
                        onChange={(e) => updateAnswer(q.key, e.target.value)}
                        placeholder={q.placeholder}
                        className="w-full resize-none border-0 border-b border-line bg-paper-raised px-3 pt-2 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
                      />
                      {q.type === "list" && (
                        <span className="text-xs text-ink-muted">
                          One per line
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={generating}
                className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? "Generating…" : "Generate resume"}
              </button>
            </form>

            {validationError && (
              <p className="border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {validationError}
              </p>
            )}

            {generateError && (
              <p className="border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                {generateError}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
