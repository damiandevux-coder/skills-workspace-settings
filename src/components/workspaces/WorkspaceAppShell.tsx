"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Check,
} from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { NewWorkspaceModal } from "./NewWorkspaceModal";
import { useWorkspace } from "./WorkspaceProvider";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Workspace", href: "/workspaces", icon: LayoutGrid },
  { id: "knowledge", label: "Shared Knowledge", href: "/workspaces/knowledge", icon: HardDrive },
  { id: "files", label: "Files", href: "#", icon: FolderOpen },
  { id: "integrations", label: "Integrations", href: "#", icon: Puzzle },
  { id: "skills", label: "Skills", href: "#", icon: Wrench },
  { id: "scheduled", label: "Scheduled", href: "#", icon: CalendarClock },
];

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
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
          layoutId="wsSidebarActive"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#4ade80]"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative px-3 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#151519]"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#303036] text-base"
          style={{ backgroundColor: activeWorkspace.color + "18" }}
        >
          {activeWorkspace.emoji}
        </div>
        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-[#f5f5f5]">
          {activeWorkspace.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#85858e] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 right-3 top-full z-30 rounded-xl border border-[#303036] bg-[#151519] p-1.5 shadow-2xl"
          >
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85858e]">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#222226]"
              >
                <span className="text-base">{ws.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[#f5f5f5]">{ws.name}</span>
                  <span className="block text-[10px] text-[#85858e]">
                    {ws.agents.length} agent{ws.agents.length !== 1 ? "s" : ""} ·{" "}
                    {ws.knowledgeBases.length} KB{ws.knowledgeBases.length !== 1 ? "s" : ""}
                  </span>
                </span>
                {ws.id === activeWorkspace.id && <Check className="h-3.5 w-3.5 text-[#4ade80]" />}
              </button>
            ))}
            <div className="my-1 border-t border-[#303036]" />
            <button
              onClick={() => {
                setOpen(false);
                setIsNewModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-[#85858e] transition-colors hover:bg-[#222226] hover:text-[#f5f5f5]"
            >
              <Plus className="h-3.5 w-3.5" />
              New workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <NewWorkspaceModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
    </div>
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

export function WorkspaceAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeWorkspace, addAgent } = useWorkspace();
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Sidebar */}
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#222226] bg-[#0b0b0c]">
        <WorkspaceSwitcher />

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
            <SidebarItem key={item.id} item={item} isActive={pathname === item.href} />
          ))}

          {/* Sessions (workspace-scoped) */}
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
            <AnimatePresence mode="wait">
              {sessionsExpanded && (
                <motion.div
                  key={activeWorkspace.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  {activeWorkspace.agents.map((agent) => (
                    <SessionItem key={agent.id} name={agent.name} status={agent.status} />
                  ))}
                  {activeWorkspace.agents.length === 0 && (
                    <p className="px-3 py-2 text-[11px] text-[#85858e]">No agents yet</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom (global — unchanged from classic shell) */}
        <div className="border-t border-[#222226] p-3 space-y-2">
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

          <div className="rounded-lg border border-[#222226] bg-[#101010] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#85858e]">Tokens today</span>
              <span className="text-[11px] text-[#f5f5f5] font-mono">0 / 1.5B</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#222226]">
              <div className="h-full w-[0%] rounded-full bg-[#4ade80]" />
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4ade80] px-3 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90">
            <Zap className="h-3.5 w-3.5" />
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-[#222226] bg-[#0b0b0c] px-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-[#4ade80]" />
            <span className="text-sm font-medium text-[#f5f5f5]">
              {activeWorkspace.emoji} {activeWorkspace.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#4ade80]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-[#303036] border border-[#404046]" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onCreated={(agent) => addAgent(agent.name)}
      />
    </div>
  );
}
