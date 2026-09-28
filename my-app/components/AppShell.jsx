"use client";

import { useSyncExternalStore } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopNav from "@/components/TopNav";

const COLLAPSED_KEY = "sidebarCollapsed";

// The collapsed flag lives in localStorage so it survives page changes and
// reloads. useSyncExternalStore keeps server markup (expanded) and the first
// client render identical, then switches to the saved value.
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function setCollapsed(next) {
  try {
    localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  } catch {
    // localStorage unavailable — the choice just won't persist
  }
  listeners.forEach((l) => l());
}

export default function AppShell({ children }) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        {children}
      </div>
    </div>
  );
}
