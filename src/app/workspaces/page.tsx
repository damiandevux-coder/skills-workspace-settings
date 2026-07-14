"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  ChevronRight,
  HardDrive,
  Plus,
  Users,
  UserPlus,
  Zap,
} from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { InviteMemberModal } from "@/components/workspaces/InviteMemberModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { KnowledgeItem } from "@/types/skills";
import { getWorkspaceUsage, formatTokens } from "@/data/mock-usage";
import { getWorkspaceActivity } from "@/data/mock-activity";
import { formatRelativeTime } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLabel } from "@/components/ui/SectionLabel";

function countFiles(items: KnowledgeItem[]): { total: number; pending: number } {
  let total = 0;
  let pending = 0;
  const walk = (list: KnowledgeItem[]) => {
    list.forEach((item) => {
      if (item.type === "file") {
        total++;
        if (item.status === "processing" || item.status === "queued" || item.status === "failed") {
          pending++;
        }
      }
      if (item.children) walk(item.children);
    });
  };
  walk(items);
  return { total, pending };
}

const STATUS_DOT: Record<string, string> = {
  ready: "bg-[#4ade80]",
  busy: "bg-[#f5c45e]",
  offline: "bg-[#737373]",
};

export default function WorkspaceHomePage() {
  const { activeWorkspace, addAgent, selectAgent } = useWorkspace();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [hireSpecialty, setHireSpecialty] = useState<string | undefined>(undefined);

  // Deep link: /workspaces?newAgent=<specialty> opens the creation modal at the
  // configure step (marketplace "Hire this Agent"). Runs post-mount because it
  // reads window.location — same idiom as ?new=1 on the knowledge page.
  useEffect(() => {
    const specialty = new URLSearchParams(window.location.search).get("newAgent");
    if (specialty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from window.location on mount
      setHireSpecialty(specialty);
      setIsAgentModalOpen(true);
      window.history.replaceState(null, "", "/workspaces");
    }
  }, []);

  const fileStats = activeWorkspace.knowledgeBases
    .map((kb) => countFiles(kb.items))
    .reduce((acc, s) => ({ total: acc.total + s.total, pending: acc.pending + s.pending }), {
      total: 0,
      pending: 0,
    });

  const pendingMembers = activeWorkspace.members.filter((m) => m.status === "pending").length;
  const busyAgents = activeWorkspace.agents.filter((a) => a.status === "busy").length;
  const usage = getWorkspaceUsage(activeWorkspace.id);
  const todayTokens = usage.dailyTokens[usage.dailyTokens.length - 1];
  const activity = getWorkspaceActivity(activeWorkspace.id);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#303036] text-2xl"
            style={{ backgroundColor: activeWorkspace.color + "14" }}
          >
            {activeWorkspace.emoji}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#fafafa]">{activeWorkspace.name}</h1>
            <p className="mt-0.5 text-sm text-[#737373]">
              {activeWorkspace.members.length} member
              {activeWorkspace.members.length !== 1 ? "s" : ""} ·{" "}
              {activeWorkspace.agents.length} agent
              {activeWorkspace.agents.length !== 1 ? "s" : ""} ·{" "}
              {activeWorkspace.knowledgeBases.length} knowledge base
              {activeWorkspace.knowledgeBases.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#303036] bg-[#151519] px-4 py-2 text-[13px] font-medium text-[#fafafa] transition-colors hover:border-[#5a5a5e]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite member
          </button>
          <button
            onClick={() => setIsAgentModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New agent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Members"
          value={activeWorkspace.members.length}
          hint={pendingMembers > 0 ? `${pendingMembers} pending invite${pendingMembers !== 1 ? "s" : ""}` : undefined}
          href="/workspaces/members"
        />
        <StatCard
          icon={Bot}
          label="Agents"
          value={activeWorkspace.agents.length}
          hint={busyAgents > 0 ? `${busyAgents} busy right now` : undefined}
        />
        <StatCard
          icon={HardDrive}
          label="Knowledge files"
          value={fileStats.total}
          hint={fileStats.pending > 0 ? `${fileStats.pending} still processing` : undefined}
          href="/workspaces/knowledge"
        />
        <StatCard
          icon={Zap}
          label="Tokens today"
          value={formatTokens(todayTokens)}
          tone="#4ade80"
          hint="View usage"
          href="/workspaces/usage"
        />
      </div>

      {/* Body */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity feed */}
        <div className="lg:col-span-2 rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#232323] px-5 py-3">
            <Activity className="h-3.5 w-3.5 text-[#737373]" />
            <SectionLabel>Activity</SectionLabel>
          </div>
          {activity.length > 0 ? (
            <div className="divide-y divide-[#232323]">
              {activity.map((entry) => {
                const Icon = entry.icon;
                return (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: entry.color + "15" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: entry.color }} />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[13px] text-[#a7a7ad]">
                      {entry.parts.map((part, i) =>
                        part.strong ? (
                          <span key={i} className="font-medium text-[#fafafa]">
                            {part.text}
                          </span>
                        ) : (
                          <span key={i}>{part.text}</span>
                        )
                      )}
                    </p>
                    <span className="shrink-0 text-[11px] text-[#737373]">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Invite members, add agents, and run sessions — it all shows up here."
              variant="plain"
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Agents */}
          <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <SectionLabel>Agents</SectionLabel>
              <span className="text-[11px] text-[#737373]">{activeWorkspace.agents.length}</span>
            </div>
            {activeWorkspace.agents.length > 0 ? (
              <div className="space-y-0.5">
                {activeWorkspace.agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    onClick={() => selectAgent(agent.id)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
                  >
                    <div className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[agent.status]}`} />
                    <span className="min-w-0 flex-1 truncate">{agent.name}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 text-[#737373]" />
                  </Link>
                ))}
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
                >
                  <Plus className="h-3 w-3" />
                  Add agent
                </button>
              </div>
            ) : (
              <EmptyState
                icon={Bot}
                title="No agents yet"
                variant="dashed"
                action={
                  <button
                    onClick={() => setIsAgentModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add agent
                  </button>
                }
              />
            )}
          </div>

          {/* Knowledge */}
          <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <SectionLabel>Shared knowledge</SectionLabel>
              <span className="text-[11px] text-[#737373]">
                {activeWorkspace.knowledgeBases.length}
              </span>
            </div>
            {activeWorkspace.knowledgeBases.length > 0 ? (
              <div className="space-y-0.5">
                {activeWorkspace.knowledgeBases.map((kb) => {
                  const stats = countFiles(kb.items);
                  return (
                    <Link
                      key={kb.id}
                      href={`/workspaces/knowledge?kb=${kb.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:bg-[#151519] hover:text-[#fafafa]"
                    >
                      <span>{kb.emoji}</span>
                      <span className="min-w-0 flex-1 truncate">{kb.name}</span>
                      <span className="shrink-0 text-[10px] text-[#737373]">
                        {stats.total} files
                        {stats.pending > 0 && ` · ${stats.pending} pending`}
                      </span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-[#737373]" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={HardDrive}
                title="No shared knowledge yet"
                variant="dashed"
                action={
                  <Link
                    href="/workspaces/knowledge?new=1"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New knowledge base
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </div>

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => {
          setIsAgentModalOpen(false);
          setHireSpecialty(undefined);
        }}
        onCreated={(agent) => addAgent(agent)}
        initialSpecialty={hireSpecialty}
      />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
