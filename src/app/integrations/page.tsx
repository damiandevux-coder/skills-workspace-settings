"use client";

import React from "react";
import { GitBranch, MessageSquare, HardDrive, ListTodo, Calendar, Database } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";

const INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    description: "Read repos, open PRs, and review code from sessions.",
    icon: GitBranch,
    connected: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send session summaries and get pinged when runs finish.",
    icon: MessageSquare,
    connected: false,
  },
  {
    id: "gdrive",
    name: "Google Drive",
    description: "Pull docs and sheets into shared knowledge automatically.",
    icon: HardDrive,
    connected: false,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Create and triage issues straight from agent output.",
    icon: ListTodo,
    connected: false,
  },
  {
    id: "gcal",
    name: "Google Calendar",
    description: "Let agents check availability and schedule events.",
    icon: Calendar,
    connected: false,
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Query production data with read-only credentials.",
    icon: Database,
    connected: false,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <PageHeader
        className="mb-8"
        title="Integrations"
        description="Tools your agent can reach during sessions."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303036] bg-[#101010]">
                  <Icon className="h-4.5 w-4.5 text-[#a7a7ad]" />
                </div>
                {integration.connected ? (
                  <Chip tone="success" dot>
                    Connected
                  </Chip>
                ) : (
                  <button
                    title="Connecting integrations is not part of this prototype"
                    className="cursor-not-allowed rounded-lg border border-[#303036] px-3 py-1 text-[12px] text-[#737373] opacity-60"
                  >
                    Connect
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-[#fafafa]">{integration.name}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#737373]">
                {integration.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
