"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, HardDrive, Mail, Plus, Users, UserPlus, Zap } from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { InviteMemberModal } from "@/components/workspaces/InviteMemberModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { KnowledgeItem } from "@/types/skills";
import { WorkspaceAgent } from "@/types/workspaces";
import { getWorkspaceUsage, formatTokens } from "@/data/mock-usage";
import { ROLE_CONFIG } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { DailyBars } from "@/components/ui/DailyBars";

function countFiles(items: KnowledgeItem[]): number {
  let total = 0;
  const walk = (list: KnowledgeItem[]) => {
    list.forEach((item) => {
      if (item.type === "file") total++;
      if (item.children) walk(item.children);
    });
  };
  walk(items);
  return total;
}

const STATUS_DOT: Record<string, string> = {
  ready: "bg-[#4ade80]",
  busy: "bg-[#f5c45e]",
  offline: "bg-[#737373]",
};

function AgentStatusChip({ status }: { status: WorkspaceAgent["status"] }) {
  if (status === "ready") return <Chip tone="success">Active</Chip>;
  if (status === "busy") return <Chip tone="warning">Busy</Chip>;
  return <span className="text-[11px] uppercase tracking-wide text-[#737373]">Stopped</span>;
}

function lastActivity(agent: WorkspaceAgent): string | null {
  const times = agent.sessions
    .map((s) => s.lastActiveAt ?? s.createdAt)
    .sort()
    .reverse();
  return times[0] ?? null;
}

export default function WorkspaceHomePage() {
  const router = useRouter();
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

  const totalFiles = activeWorkspace.knowledgeBases.reduce(
    (acc, kb) => acc + countFiles(kb.items),
    0
  );
  const usage = getWorkspaceUsage(activeWorkspace.id);
  const todayTokens = usage.dailyTokens[usage.dailyTokens.length - 1];
  const agentUsage = new Map(usage.perAgent.map((r) => [r.agentId, r]));

  const openSession = (agentId: string) => {
    selectAgent(agentId);
    router.push("/session/new");
  };

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
              {activeWorkspace.agents.length !== 1 ? "s" : ""}
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
        <StatCard icon={Users} label="Members" value={activeWorkspace.members.length} href="/workspaces/members" />
        <StatCard icon={Bot} label="Agents" value={activeWorkspace.agents.length} />
        <StatCard icon={HardDrive} label="Knowledge files" value={totalFiles} href="/workspaces/knowledge" />
        <StatCard icon={Zap} label="Tokens today" value={formatTokens(todayTokens)} tone="#4ade80" href="/workspaces/usage" />
      </div>

      {/* Token usage + Members */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Link
          href="/workspaces/usage"
          className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5 transition-colors hover:border-[#3d3d40]"
        >
          <div className="mb-4 flex items-center justify-between">
            <SectionLabel>Token usage · last 14 days</SectionLabel>
            <span className="text-[11px] text-[#737373]">View usage →</span>
          </div>
          <DailyBars daily={usage.dailyTokens} height="h-36" />
        </Link>

        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#232323] px-5 py-3">
            <SectionLabel>Members</SectionLabel>
            <Link href="/workspaces/members" className="text-[11px] text-[#737373] hover:text-[#fafafa]">
              Manage →
            </Link>
          </div>
          {activeWorkspace.members.length > 0 ? (
            <div className="divide-y divide-[#232323]">
              {activeWorkspace.members.slice(0, 5).map((member) => {
                const role = ROLE_CONFIG[member.role];
                const initial = (member.name ?? member.email).charAt(0).toUpperCase();
                return (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: member.status === "pending" ? "#303036" : "#4ade80",
                        color: member.status === "pending" ? "#737373" : "#111111",
                      }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-[#fafafa]">
                        {member.name || member.email}
                      </p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-[#737373]">
                        <Mail className="h-2.5 w-2.5 shrink-0" />
                        {member.email}
                      </p>
                    </div>
                    <Chip color={role.color} icon={role.icon} bordered>
                      {role.label}
                    </Chip>
                    {member.status === "pending" && <Chip tone="warning">Pending</Chip>}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No members yet"
              variant="plain"
              action={
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="text-sm text-[#4ade80] hover:underline"
                >
                  Invite the first one
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Agent usage table */}
      <div className="mt-6 rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
        <div className="border-b border-[#232323] px-5 py-3">
          <SectionLabel>Agent usage</SectionLabel>
        </div>
        {activeWorkspace.agents.length > 0 ? (
          <>
            <div className="grid grid-cols-[1.4fr_110px_100px_100px_120px] items-center gap-4 border-b border-[#232323] px-5 py-2.5">
              <SectionLabel>Agent</SectionLabel>
              <SectionLabel>Status</SectionLabel>
              <SectionLabel>Sessions</SectionLabel>
              <SectionLabel>Tokens</SectionLabel>
              <SectionLabel>Last activity</SectionLabel>
            </div>
            <div className="divide-y divide-[#232323]">
              {activeWorkspace.agents.map((agent) => {
                const row = agentUsage.get(agent.id);
                const last = lastActivity(agent);
                return (
                  <button
                    key={agent.id}
                    onClick={() => openSession(agent.id)}
                    className="grid w-full grid-cols-[1.4fr_110px_100px_100px_120px] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[#151519]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[agent.status]}`} />
                      <span className="truncate text-[13px] text-[#fafafa]">{agent.name}</span>
                    </div>
                    <div>
                      <AgentStatusChip status={agent.status} />
                    </div>
                    <span className="text-[12px] text-[#737373]">{row ? row.sessions : "—"}</span>
                    <span className="font-mono text-[12px] text-[#fafafa]">
                      {row ? formatTokens(row.tokens) : "—"}
                    </span>
                    <span className="text-[12px] text-[#737373]">
                      {last ? formatRelativeTime(last) : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Bot}
            title="No agents in this workspace yet"
            variant="plain"
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
