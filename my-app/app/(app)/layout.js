import AppShell from "@/components/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }) {
  return (
    <TooltipProvider delayDuration={150}>
      <AppShell>{children}</AppShell>
    </TooltipProvider>
  );
}
