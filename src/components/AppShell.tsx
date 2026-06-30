"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Plus,
  FolderOpen,
  Puzzle,
  Wrench,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Settings,
  Zap,
  Cpu,
  HardDrive,
} from "lucide-react";
import { AgentCreationModal } from "./AgentCreationModal";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "workspace", label: "Workspace", href: "/", icon: LayoutGrid },
  { id: "files", label: "Files", href: "#", icon: FolderOpen },
  { id: "integrations", label: "Integrations", href: "#", icon: Puzzle },
  { id: "skills", label: "Skills", href: "/", icon: Wrench },
  { id: "scheduled", label: "Scheduled", href: "#", icon: CalendarClock },
];

function SidebarItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
        isActive
          ? "bg-[#1a1a1e] text-[#f5f5f5]"
          : "text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebarActive"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#4ade80]"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SessionItem({ name, status }: { name: string; status: "ready" | "busy" | "offline" }) {
  const statusColor =
    status === "ready" ? "bg-[#4ade80]" : status === "busy" ? "bg-[#f5c45e]" : "bg-[#85858e]";

  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad] cursor-pointer transition-colors">
      <div className={`h-2 w-2 rounded-full ${statusColor}`} />
      <span className="truncate">{name}</span>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Sidebar */}
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#222226] bg-[#0b0b0c]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4ade80]">
            <Cpu className="h-4 w-4 text-[#111111]" />
          </div>
          <span className="text-sm font-semibold text-[#f5f5f5]">HyperCLI</span>
        </div>

        {/* New Agent */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setIsAgentModalOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-[#303036] bg-[#151519] px-3 py-2 text-[13px] text-[#f5f5f5] transition-colors hover:border-[#5a5a5e]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Agent
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={pathname === item.href || (item.id === "skills" && pathname?.startsWith("/skill"))}
            />
          ))}

          {/* Shared Knowledge link */}
          <Link
            href="/shared-knowledge"
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
              pathname === "/shared-knowledge"
                ? "bg-[#1a1a1e] text-[#f5f5f5]"
                : "text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad]"
            }`}
          >
            {pathname === "/shared-knowledge" && (
              <motion.div
                layoutId="sidebarActive"
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#4ade80]"
              />
            )}
            <HardDrive className="h-4 w-4 shrink-0" />
            <span className="truncate">Shared Knowledge</span>
          </Link>

          {/* Sessions */}
          <div className="pt-4">
            <button
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85858e]"
            >
              Sessions
              {sessionsExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            <AnimatePresence>
              {sessionsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <SessionItem name="Main Session" status="ready" />
                  <SessionItem name="Claw Dev" status="busy" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#222226] p-3 space-y-2">
          {/* Advanced */}
          <button
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] text-[#85858e] hover:bg-[#151519] hover:text-[#a7a7ad] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced
            </div>
            {advancedExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {/* Token usage */}
          <div className="rounded-lg border border-[#222226] bg-[#101010] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#85858e]">Tokens today</span>
              <span className="text-[11px] text-[#f5f5f5] font-mono">0 / 1.5B</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#222226]">
              <div className="h-full w-[0%] rounded-full bg-[#4ade80]" />
            </div>
          </div>

          {/* Upgrade */}
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4ade80] px-3 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90">
            <Zap className="h-3.5 w-3.5" />
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-[#222226] bg-[#0b0b0c] px-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-[#4ade80]" />
            <span className="text-sm font-medium text-[#f5f5f5]">Main Session</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#4ade80]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-[#303036] border border-[#404046]" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AgentCreationModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
    </div>
  );
}
