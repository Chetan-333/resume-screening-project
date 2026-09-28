// Hand-drawn SVG illustrations for the Screening page. They use the app's
// own color tokens (via Tailwind fill-/stroke- utilities), so they follow
// the dark/light theme automatically.

function ResumeLines({ x, y, widths, gap = 9 }) {
  return widths.map((w, i) => (
    <rect
      key={i}
      x={x}
      y={y + i * gap}
      width={w}
      height="4"
      rx="2"
      className="fill-line"
    />
  ));
}

export function HeroArt({ className }) {
  return (
    <svg
      viewBox="0 0 520 440"
      className={className}
      role="img"
      aria-label="A stack of resumes with one ranked as the top match"
    >
      <defs>
        <pattern id="hero-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" className="fill-line" />
        </pattern>
      </defs>

      <rect x="6" y="6" width="508" height="428" rx="28" className="fill-paper-raised stroke-line" strokeWidth="1.5" />
      <rect x="6" y="6" width="508" height="428" rx="28" fill="url(#hero-dots)" opacity="0.55" />

      {/* back resumes */}
      <g transform="rotate(-9 190 250)">
        <rect x="92" y="96" width="220" height="290" rx="14" className="fill-paper stroke-line" strokeWidth="1.5" />
        <rect x="112" y="120" width="90" height="8" rx="4" className="fill-line" />
        <ResumeLines x={112} y={148} widths={[160, 150, 120, 156, 100]} />
      </g>
      <g transform="rotate(5 250 250)">
        <rect x="150" y="80" width="230" height="300" rx="14" className="fill-paper stroke-line" strokeWidth="1.5" />
        <rect x="172" y="104" width="100" height="8" rx="4" className="fill-line" />
        <ResumeLines x={172} y={132} widths={[170, 140, 160, 110, 150, 90]} />
      </g>

      {/* front resume (top match) */}
      <g>
        <rect x="196" y="66" width="250" height="328" rx="16" className="fill-paper-raised stroke-accent" strokeWidth="2" />
        <circle cx="232" cy="106" r="16" className="fill-accent" opacity="0.18" />
        <path d="M232 98a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-9 19c1.6-5 5.2-7 9-7s7.4 2 9 7" className="stroke-accent" fill="none" strokeWidth="2" strokeLinecap="round" />
        <rect x="260" y="94" width="96" height="9" rx="4.5" className="fill-ink" opacity="0.85" />
        <rect x="260" y="112" width="64" height="6" rx="3" className="fill-ink-muted" opacity="0.7" />

        {/* score ring */}
        <g transform="translate(390 104)">
          <circle r="24" fill="none" className="stroke-line" strokeWidth="5" />
          <circle r="24" fill="none" className="stroke-accent" strokeWidth="5" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset="34" transform="rotate(-90)" />
          <text textAnchor="middle" y="4" className="fill-ink font-mono" fontSize="11" fontWeight="600">0.77</text>
        </g>

        <rect x="218" y="150" width="60" height="6" rx="3" className="fill-accent" opacity="0.8" />
        <ResumeLines x={218} y={168} widths={[196, 180, 150]} />
        <rect x="218" y="208" width="60" height="6" rx="3" className="fill-accent" opacity="0.8" />
        <rect x="218" y="226" width="64" height="20" rx="10" className="fill-secondary stroke-line" />
        <rect x="288" y="226" width="54" height="20" rx="10" className="fill-secondary stroke-line" />
        <rect x="348" y="226" width="70" height="20" rx="10" className="fill-secondary stroke-line" />
        <rect x="218" y="256" width="72" height="20" rx="10" className="fill-secondary stroke-line" />
        <rect x="296" y="256" width="60" height="20" rx="10" className="fill-secondary stroke-line" />
        <rect x="218" y="296" width="60" height="6" rx="3" className="fill-accent" opacity="0.8" />
        <ResumeLines x={218} y={314} widths={[196, 170]} />

        {/* score composition bar */}
        <rect x="218" y="358" width="212" height="8" rx="4" className="fill-line" />
        <rect x="218" y="358" width="124" height="8" rx="4" className="fill-accent" />
        <rect x="342" y="358" width="44" height="8" className="fill-gold" />
      </g>

      {/* floating badges */}
      <g>
        <rect x="26" y="50" width="112" height="34" rx="17" className="fill-accent" />
        <text x="82" y="72" textAnchor="middle" className="fill-on-accent" fontSize="13" fontWeight="600">Top match</text>
      </g>
      <g>
        <rect x="52" y="330" width="150" height="34" rx="17" className="fill-paper-raised stroke-gold" strokeWidth="1.5" />
        <circle cx="72" cy="347" r="5" className="fill-gold" />
        <text x="84" y="352" className="fill-ink" fontSize="12.5" fontWeight="500">Google · Tier 1</text>
      </g>
      <g>
        <rect x="360" y="392" width="136" height="30" rx="15" className="fill-paper-raised stroke-line" strokeWidth="1.5" />
        <text x="428" y="411" textAnchor="middle" className="fill-ink-muted font-mono" fontSize="12">Similarity 0.76</text>
      </g>
    </svg>
  );
}

export function EmptyArt({ className }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="No results yet">
      <rect x="10" y="20" width="300" height="160" rx="18" fill="none" className="stroke-line" strokeWidth="2" strokeDasharray="7 7" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(40 ${44 + i * 42})`}>
          <circle cx="14" cy="14" r="12" fill="none" className="stroke-line" strokeWidth="4" />
          <rect x="40" y="6" width={150 - i * 22} height="7" rx="3.5" className="fill-line" />
          <rect x="40" y="19" width={100 - i * 12} height="5" rx="2.5" className="fill-line" opacity="0.6" />
          <rect x="220" y="4" width="40" height="20" rx="10" className="fill-line" opacity="0.7" />
        </g>
      ))}
      <g transform="translate(232 112)">
        <circle cx="26" cy="26" r="22" className="fill-paper stroke-accent" strokeWidth="3" />
        <path d="M42 42l20 20" className="stroke-accent" strokeWidth="5" strokeLinecap="round" />
        <path d="M16 26h20M26 16v20" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function DonutArt({ className }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Final score is 75% resume similarity and 25% work experience">
      <g transform="translate(100 100) rotate(-90)">
        <circle r={r} fill="none" className="stroke-accent" strokeWidth="26" strokeDasharray={`${c * 0.75} ${c}`} />
        <circle r={r} fill="none" className="stroke-gold" strokeWidth="26" strokeDasharray={`${c * 0.25} ${c}`} strokeDashoffset={-c * 0.75} />
      </g>
      <text x="100" y="96" textAnchor="middle" className="fill-ink-muted" fontSize="11" letterSpacing="1.2">FINAL SCORE</text>
      <text x="100" y="118" textAnchor="middle" className="fill-ink font-mono" fontSize="20" fontWeight="600">75 / 25</text>
    </svg>
  );
}
