"use client";

import Link from "next/link";
import { PageHeader } from "../../components/PageHeader";
import { LayoutDashboard, ScanSearch } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="pb-12 h-full flex flex-col">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your resume screening activity."
      />
      
      <div className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-900/30">
          <LayoutDashboard className="w-10 h-10 text-blue-500 dark:text-blue-400 opacity-80" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          No screening activity yet.
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-8">
          The backend does not currently store or track historical screening statistics or candidate activity. 
          Start a new screening session to process candidates instantly.
        </p>
        <Link 
          href="/screening"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <ScanSearch className="w-5 h-5" />
          Start New Screening
        </Link>
      </div>
    </div>
  );
}
