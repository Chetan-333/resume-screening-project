"use client";

import { useRef, useState } from "react";
import { AlertCircle, FileText, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ScreeningForm({
  jobDescription,
  onJobDescriptionChange,
  files,
  onAddFiles,
  onRemoveFile,
  includeExperience,
  onIncludeExperienceChange,
  loading,
  error,
  onSubmit,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleInputChange(e) {
    const picked = Array.from(e.target.files || []);
    if (picked.length > 0) onAddFiles(picked);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) onAddFiles(dropped);
  }

  return (
    <section id="workspace" className="flex scroll-mt-8 flex-col gap-6" aria-labelledby="workspace-heading">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Workspace</span>
        <h2 id="workspace-heading" className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Set up a screening
        </h2>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <form onSubmit={onSubmit} className="grid lg:grid-cols-2">
            {/* Role */}
            <div className="flex flex-col gap-3 border-b border-line p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <Label htmlFor="job-description" className="text-sm text-ink">
                  1. The role
                </Label>
                <span className="font-mono text-xs text-ink-muted">
                  {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Paste the job description here…"
                className="min-h-56 flex-1 resize-none bg-paper text-[15px] leading-relaxed"
              />
            </div>

            {/* Candidates */}
            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-ink">2. Candidates</Label>
                <span className="font-mono text-xs text-ink-muted">
                  {files.length} file{files.length === 1 ? "" : "s"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isDragging
                    ? "border-accent bg-accent/10"
                    : "border-ink-muted/40 bg-paper hover:border-ink-muted/70"
                )}
              >
                <UploadCloud className="size-7 text-accent" aria-hidden="true" />
                <span className="text-[15px] text-ink">Click to browse, or drag resumes in</span>
                <span className="text-xs text-ink-muted">PDF or DOCX · as many as you like</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                multiple
                onChange={handleInputChange}
                className="hidden"
                aria-label="Choose resume files"
              />

              {files.length > 0 && (
                <ul className="flex max-h-48 flex-col divide-y divide-line overflow-y-auto rounded-lg border border-line bg-paper">
                  {files.map((file, i) => (
                    <li key={`${file.name}-${file.size}-${i}`} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      <span className="flex-1 truncate text-ink">{file.name}</span>
                      <span className="shrink-0 font-mono text-xs text-ink-muted">{formatSize(file.size)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-ink-muted hover:text-danger"
                        onClick={() => onRemoveFile(i)}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Options + submit */}
            <div className="flex flex-col gap-5 border-t border-line p-6 lg:col-span-2">
              <div className="flex items-start gap-4 rounded-xl bg-secondary p-4">
                <Switch
                  id="include-experience"
                  checked={includeExperience}
                  onCheckedChange={onIncludeExperienceChange}
                  className="mt-0.5"
                />
                <Label htmlFor="include-experience" className="flex flex-col items-start gap-1 font-normal">
                  <span className="text-sm font-medium text-ink">Also weigh work-experience quality</span>
                  <span className="text-[13px] leading-relaxed text-ink-muted">
                    Tiers each candidate&apos;s employers (well-known company vs. small startup) and blends it in:
                    75% resume similarity, 25% experience. Slower than similarity alone.
                  </span>
                </Label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" disabled={loading} className="h-11 w-full rounded-full">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Ranking candidates…
                  </>
                ) : (
                  <>
                    <Sparkles /> Rank candidates
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
