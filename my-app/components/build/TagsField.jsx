"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// A chip-style multi-value input (used for skills): type text, press
// Enter or comma to turn it into a removable tag.
export default function TagsField({ question, value, onChange }) {
  const [draft, setDraft] = useState("");
  const tags = value || [];

  function commitDraft() {
    const parts = draft.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const merged = [...tags];
    for (const part of parts) {
      if (!merged.includes(part)) merged.push(part);
    }
    onChange(merged);
    setDraft("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={question.key} className="text-sm text-ink">
        {question.label}
        {question.required && <span className="text-danger"> *</span>}
      </Label>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1.5 focus-within:ring-1 focus-within:ring-accent">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-ink/10"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          id={question.key}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={tags.length === 0 ? question.placeholder || "Type a skill and press Enter" : ""}
          className="min-w-[8ch] flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/60 outline-none"
        />
      </div>
    </div>
  );
}
