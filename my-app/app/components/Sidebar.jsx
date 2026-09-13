"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const NAV_LINKS = [
  { href: "/screening", label: "Screening" },
  { href: "/improve", label: "Improve" },
  { href: "/build", label: "Build Resume" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

function LedgerMark() {
  return (
    <svg
      width="16"
      height="16"
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

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M2 4.5h12M2 8h12M2 11.5h12" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

function NavIcon({ label, ...props }) {
  switch (label) {
    case "Screening":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
          <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M4 2h6l2 2v10H4V2Z" />
          <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M6 7.5h4M6 10h4" />
        </svg>
      );
    case "Improve":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
          <path
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 1.6l1.1 2.9 3 .5-2.2 2.1.5 3-2.4-1.5-2.4 1.5.5-3-2.2-2.1 3-.5L8 1.6Z"
          />
        </svg>
      );
    case "Build Resume":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
          <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M4 1.6h5l2.4 2.4v10.4H4V1.6Z" />
          <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M6.5 8.5h3M8 7v3" />
        </svg>
      );
    case "About":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M8 7.2v3.6" />
          <circle cx="8" cy="5.3" r="0.7" fill="currentColor" />
        </svg>
      );
    case "Dashboard":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "Settings":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
          <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
          <path
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            d="M8 1.8v1.4M8 12.8v1.4M14.2 8h-1.4M3.2 8H1.8M12.3 3.7l-1 1M4.7 11.3l-1 1M12.3 12.3l-1-1M4.7 4.7l-1-1"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const [backendStatus, setBackendStatus] = useState("checking"); // checking | online | offline
  const [menuOpen, setMenuOpen] = useState(false);

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
      ? "Backend connected"
      : backendStatus === "offline"
      ? "Backend unreachable"
      : "Checking backend…";

  const statusDotClass =
    backendStatus === "online"
      ? "bg-accent"
      : backendStatus === "offline"
      ? "bg-danger"
      : "bg-ink-muted";

  const linkClass = (href) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      pathname === href
        ? "bg-accent text-on-accent"
        : "text-ink-muted hover:bg-paper hover:text-ink"
    }`;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col justify-between border-r border-line bg-paper-raised px-4 py-6 sm:flex">
        <div className="flex flex-col gap-8">
          <Link href="/screening" className="flex items-center gap-2 px-2 text-[14px] text-ink">
            <LedgerMark />
            Resume Screening
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                <NavIcon label={link.label} className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 px-2 text-xs text-ink-muted" title={statusLabel}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusDotClass} ${
              backendStatus === "checking" ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          />
          {statusLabel}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-paper-raised px-4 sm:hidden">
        <Link href="/screening" className="flex items-center gap-2 text-[14px] text-ink">
          <LedgerMark />
          Resume Screening
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink"
        >
          {menuOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-x-0 top-14 z-10 border-b border-line bg-paper-raised px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                <NavIcon label={link.label} className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-1.5 px-3 text-xs text-ink-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} aria-hidden="true" />
            {statusLabel}
          </div>
        </div>
      )}
    </>
  );
}
