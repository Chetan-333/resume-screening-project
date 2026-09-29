// Instant, purely client-side mirror of what's been typed so far — no AI,
// no API call, updates on every keystroke. Shown while the AI-polished
// preview is (re)generating in the background, so the user always sees
// something respond immediately as they type.
const SKIP_KEYS = new Set(["full_name", "email", "phone", "target_role", "linkedin_hint"]);

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{title}</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      {children}
    </div>
  );
}

export default function DraftPreview({ template, answers, className = "" }) {
  const name = (answers.full_name || "").trim() || "Your name";
  const role = (answers.target_role || "").trim();
  const contactBits = [answers.email, answers.phone, answers.linkedin_hint]
    .map((v) => (v || "").trim())
    .filter(Boolean);

  return (
    <div className={`flex h-full flex-col gap-5 overflow-y-auto bg-white p-8 text-[#1a1a1a] ${className}`}>
      <div className="flex flex-col gap-1 border-b border-neutral-200 pb-4">
        <span className="font-serif text-2xl font-semibold">{name}</span>
        {role && <span className="text-sm text-neutral-600">{role}</span>}
        {contactBits.length > 0 && (
          <span className="text-xs text-neutral-500">{contactBits.join(" · ")}</span>
        )}
      </div>

      {template.questions.map((q) => {
        if (SKIP_KEYS.has(q.key)) return null;
        const value = answers[q.key];
        const heading = q.sectionLabel || q.label;

        if (q.type === "textarea") {
          if (!(value || "").trim()) return null;
          return (
            <Section key={q.key} title={heading}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{value}</p>
            </Section>
          );
        }

        if (q.type === "entries") {
          const entries = (value || []).filter(
            (e) => e && typeof e === "object" && Object.values(e).some((v) => (v || "").trim())
          );
          if (entries.length === 0) return null;
          const [f1, f2] = q.primaryFields || [];
          return (
            <Section key={q.key} title={heading}>
              <div className="flex flex-col gap-3">
                {entries.map((entry, i) => {
                  const titleLine = [entry[f1], entry[f2]].filter(Boolean).join(" · ");
                  const dateVal = q.dateField ? entry[q.dateField] : null;
                  return (
                    <div key={i} className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        {titleLine && <span className="text-sm font-medium text-neutral-900">{titleLine}</span>}
                        {dateVal && <span className="text-xs text-neutral-500">{dateVal}</span>}
                      </div>
                      {entry.description && (
                        <p className="whitespace-pre-line text-sm text-neutral-700">{entry.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          );
        }

        if (q.type === "tags") {
          const tags = (value || []).filter((t) => (t || "").trim());
          if (tags.length === 0) return null;
          return (
            <Section key={q.key} title={heading}>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700">
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          );
        }

        // Plain optional text field (e.g. certifications).
        if (!(value || "").trim()) return null;
        return (
          <Section key={q.key} title={heading}>
            <p className="text-sm text-neutral-700">{value}</p>
          </Section>
        );
      })}
    </div>
  );
}
