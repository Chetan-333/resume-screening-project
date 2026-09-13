// A small circular progress ring showing a candidate's fit relative to
// the top candidate in the batch (see lib/matchBand.js for why this is
// relative, not an absolute "% match").
export default function ScoreRing({
  value,
  size = 44,
  strokeWidth = 4,
  colorClass = "text-accent",
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped)} percent relative fit`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--line)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-[stroke-dashoffset] duration-500 ease-out`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-ink">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
