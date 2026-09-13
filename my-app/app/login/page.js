"use client";

import { useState } from "react";
import Link from "next/link";

function LedgerMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-accent"
    >
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4" y1="10.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function Login() {
  const [notice, setNotice] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setNotice(
      "This project doesn't have user accounts yet — nothing was sent anywhere. Use \u201cContinue without signing in\u201d below to try the tool."
    );
  }

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-sm flex-col gap-8 px-6 py-20">
        <div className="flex items-center gap-2 text-[14px] text-ink">
          <LedgerMark />
          Resume Screening
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[1.75rem] font-semibold leading-tight text-ink">
            Log in
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            UI preview only — this project has no authentication backend,
            so signing in here doesn&apos;t do anything yet.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2 text-[15px] text-ink placeholder:text-ink-muted/60 outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
          >
            Sign in
          </button>
        </form>

        {notice && (
          <p className="border border-line bg-paper-raised px-3 py-2 text-xs leading-relaxed text-ink-muted">
            {notice}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          or
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <Link
          href="/about"
          className="flex h-11 w-full items-center justify-center rounded-full border border-line text-sm text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Continue without signing in
        </Link>
      </main>
    </div>
  );
}
