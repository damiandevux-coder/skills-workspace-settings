"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, HardDrive, Plus, Users, UserPlus, User } from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { InviteMemberModal } from "@/components/workspaces/InviteMemberModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { KnowledgeItem } from "@/types/skills";
import { ROLE_CONFIG } from "@/lib/roles";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const { activeWorkspace, addAgent } = useWorkspace();
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

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      {/* Header */}
      <PageHeader
        className="mb-8"
        title={`${activeWorkspace.emoji} ${activeWorkspace.name}`}
        description="An isolated workspace — its agents and shared knowledge live only here."
        accent={{
          emoji: activeWorkspace.emoji,
          name: `${activeWorkspace.members.length} members · ${activeWorkspace.agents.length} agents`,
          color: activeWorkspace.color,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Members card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#fafafa]">
              <Users className="h-4 w-4 text-[#737373]" />
              Members
            </h2>
            <span className="text-[11px] text-[#737373]">{activeWorkspace.members.length}</span>
          </div>

          {activeWorkspace.members.length > 0 ? (
            <div className="space-y-1">
              {activeWorkspace.members.slice(0, 4).map((member) => {
                const RoleIcon = ROLE_CONFIG[member.role]?.icon ?? User;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#303036] text-[10px] font-medium text-[#fafafa]">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">
                      {member.name || member.email}
                    </span>
                    <RoleIcon className="h-3 w-3 shrink-0" style={{ color: ROLE_CONFIG[member.role]?.color ?? "#737373" }} />
                    {member.status === "pending" && (
                      <span className="text-[10px] text-[#f5c45e]">Pending</span>
                    )}
                  </div>
                );
              })}
              {activeWorkspace.members.length > 4 && (
                <Link
                  href="/workspaces/members"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-[#737373] hover:text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                >
                  +{activeWorkspace.members.length - 4} more
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors"
              >
                <UserPlus className="h-3 w-3" />
                Invite member
              </button>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No members yet"
              variant="dashed"
              action={
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#fafafa] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite member
                </button>
              }
            />
          )}
        </div>

        {/* Agents card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#fafafa]">
              <Bot className="h-4 w-4 text-[#737373]" />
              Agents
            </h2>
            <span className="text-[11px] text-[#737373]">{activeWorkspace.agents.length}</span>
          </div>

          {activeWorkspace.agents.length > 0 ? (
            <div className="space-y-1">
              {activeWorkspace.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full ${STATUS_DOT[agent.status]}`} />
                  <span className="flex-1 truncate">{agent.name}</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#737373]">
                    {agent.status}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#737373] hover:text-[#fafafa] hover:border-[#5a5a5e] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add agent
              </button>
            </div>
          ) : (
            <EmptyState
              icon={Bot}
              title="No agents in this workspace yet"
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

        {/* Knowledge card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#fafafa]">
              <HardDrive className="h-4 w-4 text-[#737373]" />
              Shared Knowledge
            </h2>
            <span className="text-[11px] text-[#737373]">
              {activeWorkspace.knowledgeBases.length}
            </span>
          </div>

          {activeWorkspace.knowledgeBases.length > 0 ? (
            <div className="space-y-1">
              {activeWorkspace.knowledgeBases.map((kb) => {
                const stats = countFiles(kb.items);
                return (
                  <Link
                    key={kb.id}
                    href={`/workspaces/knowledge?kb=${kb.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                  >
                    <span>{kb.emoji}</span>
                    <span className="flex-1 truncate">{kb.name}</span>
                    <span className="text-[10px] text-[#737373]">
                      {stats.total} files{stats.pending > 0 && ` · ${stats.pending} pending`}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#737373]" />
                  </Link>
                );
              })}
              <p className="mt-2 px-3 text-[11px] text-[#737373]">
                {fileStats.total} files total
                {fileStats.pending > 0 && ` · ${fileStats.pending} still processing`}
              </p>
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

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => {
          setIsAgentModalOpen(false);
          setHireSpecialty(undefined);
        }}
        onCreated={(agent) => addAgent(agent.name)}
        initialSpecialty={hireSpecialty}
      />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
