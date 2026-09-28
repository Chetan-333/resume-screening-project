import * as React from "react";
import { FolderOpen } from "lucide-react";

export function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "No data available", 
  description = "Get started by creating a new entry.", 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/20 backdrop-blur-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
        <Icon className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
      </div>
      <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
