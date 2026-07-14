"use client";

import React from "react";
import { Cpu } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { CURRENT_USER } from "@/data/current-user";
import { useWorkspace } from "./workspaces/WorkspaceProvider";

/**
 * Top bar shared by both shells: title, derived agent-status chip, user chip.
 * The status chip reflects real agent state instead of a hardcoded "Ready".
 */
export function ShellHeader({ title }: { title: React.ReactNode }) {
  const { activeWorkspace } = useWorkspace();
  const agents = activeWorkspace.agents;
  const busyCount = agents.filter((a) => a.status === "busy").length;

  const status =
    agents.length === 0
      ? { tone: "neutral" as const, label: "No agents" }
      : busyCount > 0
        ? { tone: "warning" as const, label: `${busyCount} busy` }
        : { tone: "success" as const, label: "All agents ready" };

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#232323] bg-[#0b0b0c] px-6">
      <div className="flex items-center gap-3">
        <Cpu className="h-4 w-4 text-[#4ade80]" />
        <span className="text-sm font-medium text-[#fafafa]">{title}</span>
        <Chip tone={status.tone} dot>
          {status.label}
        </Chip>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] text-[#737373]">{CURRENT_USER.name}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CURRENT_USER.avatar}
          alt={CURRENT_USER.name}
          className="h-7 w-7 rounded-full border border-[#404046] object-cover"
        />
      </div>
    </header>
  );
}
