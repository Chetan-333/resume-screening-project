"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Download, FileText, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import EntryListField from "@/components/build/EntryListField";
import TagsField from "@/components/build/TagsField";
import DraftPreview from "@/components/build/DraftPreview";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const PREVIEW_DEBOUNCE_MS = 900;

function defaultAnswers(template) {
  const obj = {};
  for (const q of template.questions) {
    if (q.type === "entries" || q.type === "tags") obj[q.key] = [];
    else obj[q.key] = "";
  }
  return obj;
}

// Mirrors the backend's per-question validation so we know client-side
// whether it's worth auto-triggering a preview yet, without waiting on a
// round trip just to find out required fields are missing.
function findMissing(template, answers) {
  const missing = [];
  for (const q of template.questions) {
    if (!q.required) continue;
    const value = answers[q.key];

    if (q.type === "entries") {
      const entries = (value || []).filter(
        (e) => e && Object.values(e).some((v) => (v || "").trim())
      );
      if (entries.length === 0) {
        missing.push(q.label);
        continue;
      }
      for (const entry of entries) {
        for (const f of q.fields || []) {
          if (f.required && !(entry[f.key] || "").trim()) {
            missing.push(`${q.label} — ${f.label}`);
          }
        }
      }
    } else if (q.type === "tags") {
      if ((value || []).filter((t) => (t || "").trim()).length === 0) missing.push(q.label);
    } else if (!(value || "").trim()) {
      missing.push(q.label);
    }
  }
  return missing;
}

function TemplatePicker({ templates, loading, error, onChoose }) {
  return (
    <div className="flex flex-col gap-3">
      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading &&
        !error &&
        templates.map((template) => (
          <button key={template.id} type="button" onClick={() => onChoose(template)} className="text-left">
            <Card className="gap-0 py-0 transition-colors hover:border-accent">
              <CardContent className="flex flex-col gap-1 p-5">
                <span className="font-serif text-lg text-ink">{template.name}</span>
                <span className="text-sm text-ink-muted">{template.description}</span>
              </CardContent>
            </Card>
          </button>
        ))}
    </div>
  );
}

function QuestionField({ question, value, onChange }) {
  if (question.type === "entries") {
    return <EntryListField question={question} value={value} onChange={onChange} />;
  }
  if (question.type === "tags") {
    return <TagsField question={question} value={value} onChange={onChange} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={question.key} className="text-sm text-ink">
        {question.label}
        {question.required && <span className="text-danger"> *</span>}
      </Label>
      {question.type === "text" ? (
        <input
          id={question.key}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="h-9 w-full rounded-md border border-line bg-paper px-3 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
        />
      ) : (
        <Textarea
          id={question.key}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="resize-none bg-paper text-[15px]"
        />
      )}
    </div>
  );
}

export default function BuildResume() {
  const [step, setStep] = useState(1);

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answers, setAnswers] = useState({});

  // Preview: the LLM runs once here, debounced after typing stops.
  // previewContent is what's later sent straight to /api/resume/pdf, so
  // the download always matches what's shown on screen — no second (and
  // possibly different) LLM generation.
  const [previewHtml, setPreviewHtml] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  // The exact `answers` object reference the current preview was built
  // from. Comparing it to the live `answers` state (by identity — every
  // edit creates a new object) tells us the preview is stale.
  const [previewedAnswers, setPreviewedAnswers] = useState(null);
  const dirty = previewedAnswers !== answers;

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
          setFetchError(err.message || "Couldn't load resume templates. Is the backend running?");
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

  const runPreview = useCallback(async () => {
    if (!selectedTemplate) return;
    if (findMissing(selectedTemplate, answers).length > 0) return;

    const requestId = ++requestIdRef.current;
    const answersForThisRun = answers;
    setPreviewError("");
    setPreviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/resume/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: selectedTemplate.id, answers: answersForThisRun }),
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
      // A newer request may have started (and finished) while this one
      // was in flight — ignore this stale response so it doesn't clobber
      // a more recent preview.
      if (requestId !== requestIdRef.current) return;

      setPreviewHtml(data.html);
      setPreviewContent(data.content);
      setPreviewedAnswers(answersForThisRun);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setPreviewError(err.message || "Something went wrong while generating the preview.");
    } finally {
      if (requestId === requestIdRef.current) setPreviewLoading(false);
    }
  }, [selectedTemplate, answers]);

  // Auto-preview: debounced so a burst of keystrokes only triggers one
  // LLM call, a beat after the user pauses — not one call per keystroke.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!selectedTemplate) return undefined;
    if (findMissing(selectedTemplate, answers).length > 0) return undefined;

    debounceRef.current = setTimeout(runPreview, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [answers, selectedTemplate, runPreview]);

  function chooseTemplate(template) {
    setSelectedTemplate(template);
    setAnswers(defaultAnswers(template));
    resetPreview();
    setStep(2);
  }

  function goBack() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStep(1);
    setSelectedTemplate(null);
    setAnswers({});
    resetPreview();
  }

  function resetPreview() {
    setPreviewHtml(null);
    setPreviewContent(null);
    setPreviewError("");
    setDownloadError("");
    setPreviewedAnswers(null);
  }

  function updateAnswer(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDownload() {
    if (!previewContent || dirty) return;
    setDownloadError("");
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/api/resume/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: selectedTemplate.id, content: previewContent }),
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
      setDownloadError(err.message || "Something went wrong while downloading the PDF.");
    } finally {
      setDownloading(false);
    }
  }

  const missingNow = selectedTemplate ? findMissing(selectedTemplate, answers) : [];
  const showPolished = !!previewHtml && !dirty && !previewLoading;

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-5xl flex-col gap-10 px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Build your resume
          </h1>
          <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink-muted">
            Pick a template and fill in the form — the preview on the right
            updates as you type, and polishes itself with AI a moment after
            you pause.
          </p>
        </header>

        {step === 1 && (
          <div className="mx-auto w-full max-w-xl">
            <TemplatePicker
              templates={templates}
              loading={loadingTemplates}
              error={fetchError}
              onChoose={chooseTemplate}
            />
          </div>
        )}

        {step === 2 && selectedTemplate && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Building: {selectedTemplate.name}
                </h2>
                <Button type="button" variant="ghost" size="sm" onClick={goBack} className="gap-1 text-ink-muted">
                  <ArrowLeft className="size-3.5" /> Templates
                </Button>
              </div>

              <div className="flex flex-col gap-5">
                {selectedTemplate.questions.map((q) => (
                  <QuestionField
                    key={q.key}
                    question={q}
                    value={answers[q.key]}
                    onChange={(value) => updateAnswer(q.key, value)}
                  />
                ))}
              </div>

              {previewContent && (
                <Button
                  type="button"
                  size="lg"
                  disabled={downloading || dirty || missingNow.length > 0}
                  onClick={handleDownload}
                  className="h-11 w-full rounded-full"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="animate-spin" /> Preparing PDF…
                    </>
                  ) : (
                    <>
                      <Download /> Download PDF
                    </>
                  )}
                </Button>
              )}

              {previewError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{previewError}</AlertDescription>
                </Alert>
              )}
              {downloadError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{downloadError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Live preview */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <Card className="gap-0 overflow-hidden py-0">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
                    <FileText className="size-3.5" /> Live preview
                  </span>
                  <div className="flex items-center gap-2">
                    {previewLoading ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-ink-muted">
                        <Loader2 className="size-3 animate-spin" /> Polishing with AI…
                      </span>
                    ) : showPolished ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
                        <Sparkles className="size-3" /> AI polished
                      </span>
                    ) : missingNow.length > 0 ? (
                      <span className="text-[11px] text-ink-muted">Draft — fill required fields to polish</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                        <RefreshCw className="size-3" /> Draft — polishing shortly
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="relative h-[75vh]">
                    {showPolished ? (
                      <iframe
                        title="Resume preview"
                        srcDoc={previewHtml}
                        sandbox=""
                        className="h-full w-full border-0 bg-white"
                      />
                    ) : (
                      <DraftPreview template={selectedTemplate} answers={answers} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
