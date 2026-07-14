"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Puzzle,
  Wrench,
  CalendarClock,
  Monitor,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  PanelRight,
  PanelLeft,
  Settings,
  Zap,
} from "lucide-react";
import { useWorkspace } from "./workspaces/WorkspaceProvider";
import { getWorkspaceUsage, formatTokens } from "@/data/mock-usage";

/**
 * Agent-level sidebar mirroring the production HyperCLI webapp: agent name
 * header, "Agent" group (New Session … Workspaces), collapsible Sessions
 * group, and the Advanced / tokens / Upgrade footer. Workspace-level
 * navigation lives in the WorkspaceSettingsSidebar rail to its left.
 */

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  tooltip?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "new-session", label: "New Session", href: "/session/new", icon: Plus },
  { id: "files", label: "Files", href: "/files", icon: FolderOpen },
  { id: "integrations", label: "Integrations", href: "/integrations", icon: Puzzle },
  { id: "skills", label: "Skills", href: "/", icon: Wrench },
  { id: "scheduled", label: "Scheduled", href: "/scheduled", icon: CalendarClock },
  {
    id: "desktop",
    label: "Desktop",
    href: "#",
    icon: Monitor,
    disabled: true,
    tooltip: "Requires the HyperCLI desktop app",
  },
];

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <span
        title={item.tooltip}
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[#737373] opacity-50"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
        isActive
          ? "bg-[#1a1a1e] text-[#fafafa]"
          : "text-[#737373] hover:bg-[#151519] hover:text-[#a7a7ad]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="agentSidebarActive"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#4ade80]"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AgentSidebar({ sessions }: { sessions: string[] }) {
  const pathname = usePathname() ?? "";
  const { activeWorkspace } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const agentName = activeWorkspace.agents[0]?.name ?? "Main Agent";
  const usage = getWorkspaceUsage(activeWorkspace.id);

  const isItemActive = (item: NavItem) => {
    if (item.id === "skills") return pathname === "/" || pathname.startsWith("/skill");
    if (item.id === "new-session") return pathname.startsWith("/session");
    if (item.href !== "#") return pathname.startsWith(item.href);
    return false;
  };

  if (collapsed) {
    return (
      <aside className="flex w-[48px] shrink-0 flex-col items-center border-r border-[#232323] bg-[#0b0b0c] pt-3">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand agent sidebar"
          className="flex size-7 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#232323] bg-[#0b0b0c]">
      {/* Header: agent name + collapse */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="truncate text-sm font-medium text-[#fafafa]">{agentName}</span>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse agent sidebar"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-1.5 text-[12px] text-[#737373]">Agent</p>
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} isActive={isItemActive(item)} />
        ))}

        {/* Sessions */}
        <div className="pt-4">
          <button
            onClick={() => setSessionsExpanded(!sessionsExpanded)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] text-[#737373]"
          >
            Sessions
            {sessionsExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {sessionsExpanded &&
            sessions.map((name, i) => (
              <div
                key={name}
                className={`relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  i === 0
                    ? "text-[#fafafa]"
                    : "text-[#737373] hover:bg-[#151519] hover:text-[#a7a7ad]"
                }`}
              >
                {i === 0 && (
                  <div className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[#fafafa]/60" />
                )}
                <span className="truncate pl-1">{name}</span>
              </div>
            ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] text-[#737373] transition-colors hover:bg-[#151519] hover:text-[#a7a7ad]"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </div>
          {advancedExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        <div className="mt-2 border-t border-[#232323] px-3 pb-2 pt-3">
          <Link href="/workspaces/usage" className="flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">Tokens today</span>
            <span className="font-mono text-[12px] text-[#fafafa]">
              {formatTokens(usage.dailyTokens[usage.dailyTokens.length - 1])} /{" "}
              {formatTokens(usage.planLimit)}
            </span>
          </Link>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4ade80] px-3 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90">
          <Zap className="h-3.5 w-3.5" />
          Upgrade
        </button>
      </div>
    </aside>
  );
}
