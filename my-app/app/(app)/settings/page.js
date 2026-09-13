"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Settings() {
  const router = useRouter();
  const [backendStatus, setBackendStatus] = useState("checking"); // checking | online | offline

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/openapi.json`)
      .then((res) => {
        if (!cancelled) setBackendStatus(res.ok ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setBackendStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabel =
    backendStatus === "online"
      ? "Connected"
      : backendStatus === "offline"
      ? "Unreachable"
      : "Checking…";

  const statusDotClass =
    backendStatus === "online"
      ? "bg-accent"
      : backendStatus === "offline"
      ? "bg-danger"
      : "bg-ink-muted";

  function handleLogOut() {
    // There's no real session to end — this just returns you to the
    // login gate. See the note below for why.
    router.push("/login");
  }

  return (
    <div className="flex flex-1 justify-center bg-paper">
      <main className="flex w-full max-w-xl flex-col gap-10 px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Settings
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            Appearance, connection status, and account.
          </p>
        </header>

        {/* Appearance */}
        <section className="flex items-center justify-between gap-4 rounded-lg border border-line bg-paper-raised px-4 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-ink">Appearance</span>
            <span className="text-xs text-ink-muted">
              Switch between day and night reading modes.
            </span>
          </div>
          <ThemeToggle />
        </section>

        {/* Backend status */}
        <section className="flex items-center justify-between gap-4 rounded-lg border border-line bg-paper-raised px-4 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-ink">Backend connection</span>
            <span className="text-xs text-ink-muted">
              {API_URL}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusDotClass} ${
                backendStatus === "checking" ? "animate-pulse" : ""
              }`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        </section>

        {/* Account */}
        <section className="flex flex-col gap-3 rounded-lg border border-line bg-paper-raised px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-ink">Account</span>
              <span className="text-xs text-ink-muted">
                This project doesn&apos;t have user accounts yet.
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogOut}
              className="rounded-full border border-line px-4 py-2 text-xs text-ink transition-colors hover:border-danger hover:text-danger"
            >
              Log out
            </button>
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">
            There&apos;s no real session to end, so this just takes you
            back to the login screen.
          </p>
        </section>
      </main>
    </div>
  );
}
