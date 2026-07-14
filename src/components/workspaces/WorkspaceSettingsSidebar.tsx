"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelRight,
  PanelLeft,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Command,
  House,
  Plus,
  Ellipsis,
  UsersRound,
  Settings2,
  SquareActivity,
  ChartColumnBig,
  FolderOpen,
  Settings,
} from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { NewWorkspaceModal } from "./NewWorkspaceModal";
import { useWorkspace } from "./WorkspaceProvider";

/**
 * Workspace-scoped settings rail (Figma "Sidebar Workspace", node 2793-109677).
 * Rendered to the immediate LEFT of the existing agent sidebar in both shells —
 * it owns workspace-level navigation while the agent sidebar stays as-is.
 */

const AGENTS_VISIBLE_COLLAPSED = 3;

interface AdminItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  isActive: (pathname: string) => boolean;
}

const ADMIN_ITEMS: AdminItem[] = [
  {
    id: "members",
    label: "Members",
    href: "/workspaces/members",
    icon: UsersRound,
    isActive: (p) => p.startsWith("/workspaces/members"),
  },
  { id: "controls", label: "Controls", href: "#", icon: Settings2, isActive: () => false },
  { id: "activity", label: "Activity", href: "#", icon: SquareActivity, isActive: () => false },
  { id: "usage", label: "Usage", href: "#", icon: ChartColumnBig, isActive: () => false },
  {
    id: "shared-resources",
    label: "Shared resources",
    href: "/workspaces/knowledge",
    icon: FolderOpen,
    isActive: (p) => p.startsWith("/workspaces/knowledge"),
  },
  { id: "settings", label: "Settings", href: "#", icon: Settings, isActive: () => false },
];

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 w-full items-center p-2 opacity-70">
      <p className="text-[12px] font-medium leading-4 text-[#737373]">{children}</p>
    </div>
  );
}

function MenuItem({
  label,
  href,
  icon: Icon,
  active,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-6 w-full items-center gap-2 rounded-full px-2 transition-colors ${
        active
          ? "bg-[#ffffff0d] font-medium text-[#fafafa]"
          : "text-[#fafafa] hover:bg-[#ffffff08]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-[14px] leading-none">{label}</span>
    </Link>
  );
}

function AgentItem({ name }: { name: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-full p-1 text-left transition-colors hover:bg-[#ffffff08]">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#ffffff1a]">
        <Command className="h-3 w-3 text-[#fafafa]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] leading-none text-[#fafafa]">
        {name}
      </span>
    </button>
  );
}

function WorkspacePopover() {
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
    <div ref={containerRef} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-[10px] border border-[#ffffff1a] bg-[#0a0a0a] p-2 shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors hover:border-[#ffffff2e]"
      >
        <span className="flex h-6 shrink-0 items-center justify-center rounded-[6px] border border-[#ffffff1a] bg-[#171717] px-1">
          <Command className="h-4 w-4 text-[#fafafa]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold leading-5 text-[#fafafa]">
          {activeWorkspace.name}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#fafafa] opacity-50" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-30 mt-1 rounded-[10px] border border-[#ffffff1a] bg-[#171717] p-1.5 shadow-2xl"
          >
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-[#ffffff0d]"
              >
                <span className="text-base">{ws.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[#fafafa]">{ws.name}</span>
                  <span className="block text-[10px] text-[#737373]">
                    {ws.agents.length} agent{ws.agents.length !== 1 ? "s" : ""} ·{" "}
                    {ws.members.length} member{ws.members.length !== 1 ? "s" : ""}
                  </span>
                </span>
                {ws.id === activeWorkspace.id && <Check className="h-3.5 w-3.5 text-[#4ade80]" />}
              </button>
            ))}
            <div className="my-1 border-t border-[#ffffff1a]" />
            <button
              onClick={() => {
                setOpen(false);
                setIsNewModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2 py-2 text-[13px] text-[#737373] transition-colors hover:bg-[#ffffff0d] hover:text-[#fafafa]"
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

export function WorkspaceSettingsSidebar() {
  const pathname = usePathname() ?? "";
  const { activeWorkspace, addAgent } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const agents = activeWorkspace.agents;
  const visibleAgents = agentsExpanded ? agents : agents.slice(0, AGENTS_VISIBLE_COLLAPSED);
  const hiddenCount = agents.length - visibleAgents.length;

  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative z-10 flex shrink-0 flex-col overflow-hidden border-r border-[#232323] bg-[#ffffff05]"
    >
      {collapsed ? (
        <div className="flex justify-center p-2 pt-3">
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand workspace sidebar"
            className="flex size-7 items-center justify-center rounded-[10px] text-[#fafafa] transition-colors hover:bg-[#ffffff0d]"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex w-[256px] flex-1 flex-col overflow-y-auto p-2">
          {/* Header */}
          <div className="flex flex-col gap-3 px-2 pb-2 pt-1">
            <div className="flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hypercli-wordmark.svg"
                alt="HyperCLI"
                className="h-4 w-[79px] pt-px"
              />
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Collapse workspace sidebar"
                className="flex size-7 items-center justify-center rounded-[10px] text-[#fafafa] transition-colors hover:bg-[#ffffff0d]"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </div>

            {/* Org + workspace switcher card */}
            <div className="flex w-full flex-col gap-1 rounded-[14px] border border-[#ffffff1a] bg-[#0a0a0a] p-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              <button className="flex items-center gap-2 rounded-[10px] px-1.5 py-2 transition-colors hover:bg-[#ffffff08]">
                <span className="flex h-6 shrink-0 items-center justify-center rounded-[6px] bg-[#297eff] px-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/org-playstation.svg" alt="" className="h-4 w-4" />
                </span>
                <span className="truncate text-[14px] font-semibold leading-5 text-[#fafafa]">
                  PlayStation
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#fafafa] opacity-50" />
              </button>
              <WorkspacePopover />
            </div>
          </div>

          {/* Home */}
          <div className="flex flex-col gap-0.5 p-2">
            <MenuItem
              label="Home"
              href="/workspaces"
              icon={House}
              active={pathname === "/workspaces"}
            />
          </div>

          {/* Agents */}
          <div className="flex flex-col gap-0.5 px-2 pb-2">
            <GroupLabel>Agents</GroupLabel>
            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="flex h-6 w-full items-center gap-2 rounded-full px-2 text-left transition-colors hover:bg-[#ffffff08]"
            >
              <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-[#27272a]">
                <Plus className="h-3.5 w-3.5 text-[#fafafa]" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] leading-none text-[#fafafa]">
                New Agent
              </span>
            </button>
            {visibleAgents.map((agent) => (
              <AgentItem key={agent.id} name={agent.name} />
            ))}
            {(hiddenCount > 0 || agentsExpanded) && (
              <button
                onClick={() => setAgentsExpanded(!agentsExpanded)}
                className="flex h-7 w-full items-center gap-1.5 rounded-[8px] px-2.5 text-left transition-colors hover:bg-[#ffffff08]"
              >
                <Ellipsis className="h-4 w-4 shrink-0 text-[#737373]" />
                <span className="text-[12px] font-medium leading-4 text-[#737373]">
                  {agentsExpanded ? "Less" : "More"}
                </span>
              </button>
            )}
          </div>

          {/* Administration */}
          <div className="flex flex-col gap-0.5 px-2 pb-2">
            <GroupLabel>Administration</GroupLabel>
            {ADMIN_ITEMS.map((item) => (
              <MenuItem
                key={item.id}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={item.isActive(pathname)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-1 flex-col justify-end p-2">
            <button className="flex w-full items-center gap-2 rounded-[8px] p-1 text-left transition-colors hover:bg-[#ffffff08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mock-avatar.png"
                alt="John Smith"
                className="size-8 shrink-0 rounded-[10px] object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold leading-none text-[#fafafa]">
                  John Smith
                </span>
                <span className="block truncate text-[12px] leading-4 tracking-[0.12px] text-[#737373]">
                  johnsmith@gmail.com
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onCreated={(agent) => addAgent(agent.name)}
      />
    </motion.aside>
  );
}
