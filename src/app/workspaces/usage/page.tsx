"use client";

import React from "react";
import { Zap, CalendarDays, MessageSquare, Bot } from "lucide-react";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { getWorkspaceUsage, formatTokens } from "@/data/mock-usage";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DailyBars } from "@/components/ui/DailyBars";

const STATUS_DOT: Record<string, string> = {
  ready: "bg-[#4ade80]",
  busy: "bg-[#f5c45e]",
  offline: "bg-[#737373]",
};

export default function UsagePage() {
  const { activeWorkspace } = useWorkspace();
  const usage = getWorkspaceUsage(activeWorkspace.id);
  const todayTokens = usage.dailyTokens[usage.dailyTokens.length - 1];
  const totalSessions = usage.perAgent.reduce((acc, a) => acc + a.sessions, 0);
  const maxAgentTokens = Math.max(...usage.perAgent.map((a) => a.tokens), 1);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <PageHeader
        className="mb-8"
        title="Usage"
        description="Token consumption and session activity across this workspace's agents."
        accent={{
          emoji: activeWorkspace.emoji,
          name: activeWorkspace.name,
          color: activeWorkspace.color,
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Zap} label="Tokens today" value={formatTokens(todayTokens)} tone="#4ade80" />
        <StatCard icon={CalendarDays} label="This month" value={formatTokens(usage.monthTokens)} />
        <StatCard icon={MessageSquare} label="Sessions" value={totalSessions} />
      </div>

      {/* Daily chart */}
      <div className="mt-6 rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Daily tokens · last 14 days</SectionLabel>
        </div>
        <DailyBars daily={usage.dailyTokens} />
      </div>

      {/* Per-agent breakdown */}
      <div className="mt-6 rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
        <div className="border-b border-[#232323] px-5 py-3">
          <SectionLabel>By agent · this month</SectionLabel>
        </div>
        {usage.perAgent.length > 0 ? (
          <div className="divide-y divide-[#232323]">
            {usage.perAgent.map((row) => {
              const agent = activeWorkspace.agents.find((a) => a.id === row.agentId);
              return (
                <div key={row.agentId} className="grid grid-cols-[1fr_90px_110px_180px] items-center gap-4 px-5 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[agent?.status ?? "offline"]}`} />
                    <span className="truncate text-[13px] text-[#fafafa]">
                      {agent?.name ?? row.agentId}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#737373]">{row.sessions} sessions</span>
                  <span className="font-mono text-[12px] text-[#fafafa]">{formatTokens(row.tokens)}</span>
                  <div className="h-1.5 w-full rounded-full bg-[#232323]">
                    <div
                      className="h-full rounded-full bg-[#4ade80]/70"
                      style={{ width: `${(row.tokens / maxAgentTokens) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Bot} title="No usage yet" description="Sessions will show up here once your agents start working." variant="plain" />
        )}
      </div>
    </div>
  );
}
