// Full-page looping video behind a page's content, with a theme-colored
// veil on top so text stays readable. Purely decorative (aria-hidden).
// Users who prefer reduced motion see the still poster instead.
export default function VideoBackdrop({ src, poster }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <video
        className="h-full w-full object-cover motion-reduce:hidden"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      {/* still frame for reduced-motion users */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className="hidden h-full w-full object-cover motion-reduce:block" />
      <div className="absolute inset-0 bg-paper/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-transparent to-paper" />
    </div>
  );
}
