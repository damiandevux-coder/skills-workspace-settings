"use client";

import React from "react";
import { CalendarClock, Plus } from "lucide-react";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";

const MOCK_SCHEDULES = [
  {
    id: "daily-digest",
    name: "Morning campaign digest",
    cadence: "Every weekday · 8:00 AM",
    lastRun: "Today, 8:00 AM",
    status: "active" as const,
  },
  {
    id: "weekly-report",
    name: "Weekly performance report",
    cadence: "Mondays · 9:30 AM",
    lastRun: "Jul 13, 9:30 AM",
    status: "paused" as const,
  },
];

export default function ScheduledPage() {
  const { activeWorkspace } = useWorkspace();
  const agentName = activeWorkspace.agents[0]?.name ?? "your agent";

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <PageHeader
        className="mb-8"
        title="Scheduled"
        description={`Recurring runs ${agentName} executes on a schedule.`}
        actions={
          <button
            title="Creating schedules is not part of this prototype"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#737373] opacity-60"
          >
            <Plus className="h-4 w-4" />
            New schedule
          </button>
        }
      />

      <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
        <div className="grid grid-cols-[1fr_200px_160px_90px] items-center gap-4 border-b border-[#232323] px-5 py-3">
          <SectionLabel>Name</SectionLabel>
          <SectionLabel>Cadence</SectionLabel>
          <SectionLabel>Last run</SectionLabel>
          <SectionLabel>Status</SectionLabel>
        </div>
        <div className="divide-y divide-[#232323]">
          {MOCK_SCHEDULES.map((schedule) => (
            <div
              key={schedule.id}
              className="grid grid-cols-[1fr_200px_160px_90px] items-center gap-4 px-5 py-3 hover:bg-[#151519] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarClock className="h-4 w-4 shrink-0 text-[#a7a7ad]" />
                <span className="truncate text-[13px] text-[#fafafa]">{schedule.name}</span>
              </div>
              <span className="text-[12px] text-[#737373]">{schedule.cadence}</span>
              <span className="text-[12px] text-[#737373]">{schedule.lastRun}</span>
              {schedule.status === "active" ? (
                <Chip tone="success" dot>
                  Active
                </Chip>
              ) : (
                <Chip tone="neutral" dot>
                  Paused
                </Chip>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
