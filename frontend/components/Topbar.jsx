"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const routeNames = {
  "/screening": "Screening",
  "/improve": "Improve Resume",
  "/build": "Build Resume",
  "/about": "About",
  "/dashboard": "Dashboard",
  "/settings": "Settings",
};

export function Topbar({ setMobileMenuOpen }) {
  const pathname = usePathname();
  const pageTitle = routeNames[pathname] || "Resume Screening";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-lg text-sm text-neutral-500 w-64 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none w-full text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500"
          />
        </div>

        <button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-neutral-950"></span>
        </button>
        
        <ThemeToggle />
      </div>
    </header>
  );
}
