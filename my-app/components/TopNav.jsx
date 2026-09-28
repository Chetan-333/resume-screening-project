"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  FilePlus2,
  Info,
  LayoutDashboard,
  LogIn,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  ScanSearch,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function setTheme(next) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    // localStorage unavailable — theme just won't persist across visits
  }
}

function LinkItem({ href, icon: Icon, children }) {
  return (
    <DropdownMenuItem asChild>
      <Link href={href}>
        {Icon && <Icon />}
        {children}
      </Link>
    </DropdownMenuItem>
  );
}

function NavMenu({ label, children, align = "start" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-ink-muted hover:text-ink data-[state=open]:text-ink">
          {label}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TopNav({ sidebarCollapsed, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-20 hidden h-14 shrink-0 items-center gap-2 border-b border-line bg-paper-raised/90 px-4 backdrop-blur sm:flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={sidebarCollapsed}
        className="text-ink-muted hover:text-ink"
      >
        {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>

      <nav className="ml-2 flex items-center gap-1" aria-label="Top navigation">
        <NavMenu label="About">
          <LinkItem href="/about" icon={Info}>About the project</LinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BookOpen /> Learn more
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <LinkItem href="/screening#scoring">How scoring works</LinkItem>
              <LinkItem href="/screening#scoring">Company tiers</LinkItem>
              <LinkItem href="/screening#scoring" icon={ShieldCheck}>Guardrails &amp; privacy</LinkItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </NavMenu>

        <NavMenu label="Features">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ScanSearch /> Screening
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <LinkItem href="/screening#workspace">Rank candidates</LinkItem>
              <LinkItem href="/screening#results">Ranked results</LinkItem>
              <LinkItem href="/screening#scoring">Work-experience scoring</LinkItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <LinkItem href="/improve" icon={Sparkles}>Improve a resume</LinkItem>
          <LinkItem href="/build" icon={FilePlus2}>Build a resume</LinkItem>
          <DropdownMenuSeparator />
          <LinkItem href="/dashboard" icon={LayoutDashboard}>Dashboard</LinkItem>
        </NavMenu>

        <NavMenu label="Settings">
          <LinkItem href="/settings" icon={Settings}>All settings</LinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette /> Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              <DropdownMenuItem onSelect={() => setTheme("light")}>
                <Sun /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("dark")}>
                <Moon /> Dark
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </NavMenu>
      </nav>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 rounded-full pl-1.5 pr-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-ink-muted">
                <User className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm text-ink">Guest</span>
              <ChevronDown className="size-3.5 text-ink-muted" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
              <span className="text-sm font-medium text-ink">Guest</span>
              <span className="text-xs text-ink-muted">Accounts aren&apos;t available yet</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <LinkItem href="/login" icon={LogIn}>Sign in</LinkItem>
            <LinkItem href="/settings" icon={Settings}>Settings</LinkItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
