"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-50 font-sans">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
