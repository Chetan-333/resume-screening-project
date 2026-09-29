"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function emptyEntry(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, ""]));
}

// A repeatable group of structured sub-fields — one card per entry (e.g.
// one job, one degree), with its own "Add another" / remove controls.
export default function EntryListField({ question, value, onChange }) {
  const entries = value && value.length > 0 ? value : [emptyEntry(question.fields)];
  const entryLabel = question.entryLabel || "Entry";

  function updateEntry(index, fieldKey, fieldValue) {
    onChange(entries.map((e, i) => (i === index ? { ...e, [fieldKey]: fieldValue } : e)));
  }

  function addEntry() {
    onChange([...entries, emptyEntry(question.fields)]);
  }

  function removeEntry(index) {
    const next = entries.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [emptyEntry(question.fields)]);
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm text-ink">
        {question.label}
        {question.required && <span className="text-danger"> *</span>}
      </Label>

      <div className="flex flex-col gap-3">
        {entries.map((entry, index) => (
          <Card key={index} className="gap-0 py-0">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {entryLabel} {index + 1}
                </span>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 text-ink-muted hover:text-danger"
                    onClick={() => removeEntry(index)}
                    aria-label={`Remove ${entryLabel.toLowerCase()} ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {question.fields.map((f) => (
                  <div
                    key={f.key}
                    className={f.type === "textarea" ? "flex flex-col gap-1.5 sm:col-span-2" : "flex flex-col gap-1.5"}
                  >
                    <Label htmlFor={`${question.key}-${index}-${f.key}`} className="text-xs text-ink-muted">
                      {f.label}
                      {f.required && <span className="text-danger"> *</span>}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        id={`${question.key}-${index}-${f.key}`}
                        rows={2}
                        value={entry[f.key] || ""}
                        onChange={(e) => updateEntry(index, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="resize-none bg-paper text-sm"
                      />
                    ) : (
                      <input
                        id={`${question.key}-${index}-${f.key}`}
                        type="text"
                        value={entry[f.key] || ""}
                        onChange={(e) => updateEntry(index, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addEntry} className="w-fit gap-1.5">
        <Plus className="size-3.5" /> Add {entryLabel.toLowerCase()}
      </Button>
    </div>
  );
}
