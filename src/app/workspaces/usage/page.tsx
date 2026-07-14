"use client";

import React, { useState } from "react";
import { Zap, CalendarDays, MessageSquare, Wallet, Bot } from "lucide-react";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { getWorkspaceUsage, formatTokens } from "@/data/mock-usage";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLabel } from "@/components/ui/SectionLabel";

const STATUS_DOT: Record<string, string> = {
  ready: "bg-[#4ade80]",
  busy: "bg-[#f5c45e]",
  offline: "bg-[#737373]",
};

function dayLabel(offsetFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetFromToday);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DailyBars({ daily }: { daily: number[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...daily, 1);

  return (
    <div className="flex h-40 items-end gap-1.5">
      {daily.map((value, i) => {
        const isToday = i === daily.length - 1;
        const offset = daily.length - 1 - i;
        return (
          <div
            key={i}
            className="relative flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div className="absolute -top-7 whitespace-nowrap rounded-md border border-[#303036] bg-[#151519] px-2 py-0.5 text-[10px] text-[#fafafa] shadow-xl">
                {formatTokens(value)} tokens
              </div>
            )}
            <div
              className={`w-full rounded-t-[3px] transition-opacity ${
                isToday ? "bg-[#4ade80]" : "bg-[#4ade80]/40"
              } ${hovered === i ? "opacity-100" : ""}`}
              style={{ height: `${Math.max((value / max) * 100, 2)}%` }}
            />
            <span className="text-[9px] text-[#737373]">
              {isToday ? "Today" : offset % 3 === 0 ? dayLabel(offset) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function UsagePage() {
  const { activeWorkspace } = useWorkspace();
  const usage = getWorkspaceUsage(activeWorkspace.id);
  const todayTokens = usage.dailyTokens[usage.dailyTokens.length - 1];
  const totalSessions = usage.perAgent.reduce((acc, a) => acc + a.sessions, 0);
  const maxAgentTokens = Math.max(...usage.perAgent.map((a) => a.tokens), 1);
  const planPct = (usage.monthTokens / usage.planLimit) * 100;

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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Zap} label="Tokens today" value={formatTokens(todayTokens)} tone="#4ade80" />
        <StatCard
          icon={CalendarDays}
          label="This month"
          value={formatTokens(usage.monthTokens)}
          hint={`of ${formatTokens(usage.planLimit)} plan limit`}
        />
        <StatCard icon={MessageSquare} label="Sessions" value={totalSessions} />
        <StatCard icon={Wallet} label="Est. spend" value={usage.estSpend} />
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

      {/* Plan */}
      <div className="mt-6 rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#fafafa]">Pro plan</p>
            <p className="mt-0.5 text-[12px] text-[#737373]">
              {formatTokens(usage.monthTokens)} of {formatTokens(usage.planLimit)} tokens used this
              month ({planPct < 1 ? planPct.toFixed(1) : Math.round(planPct)}%)
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90">
            <Zap className="h-3.5 w-3.5" />
            Upgrade
          </button>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-[#232323]">
          <div
            className="h-full rounded-full bg-[#4ade80]"
            style={{ width: `${Math.max(planPct, 0.5)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
