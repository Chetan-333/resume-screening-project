"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ScanSearch,
  Sparkles,
  FilePlus2,
  Info,
  LayoutDashboard,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Screening", href: "/screening", icon: ScanSearch },
  { name: "Improve", href: "/improve", icon: Sparkles },
  { name: "Build Resume", href: "/build", icon: FilePlus2 },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "About", href: "/about", icon: Info },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            href="/screening"
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
            className="flex items-center gap-2 font-semibold text-lg tracking-tight text-neutral-900 dark:text-white"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ScanSearch className="w-5 h-5 text-white" />
            </div>
            Resume Screening
          </Link>
          <button
            className="lg:hidden p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-blue-700 dark:text-blue-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">User</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-900 dark:text-white">Admin</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">admin@resume-screen.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
