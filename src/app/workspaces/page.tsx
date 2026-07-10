"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, HardDrive, Plus, Users, UserPlus, Mail, Shield, Pencil, User, Eye } from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { InviteMemberModal } from "@/components/workspaces/InviteMemberModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { KnowledgeItem } from "@/types/skills";
import { WorkspaceMember } from "@/types/workspaces";

const ROLE_ICON: Record<string, React.ElementType> = {
  admin: Shield,
  editor: Pencil,
  member: User,
  viewer: Eye,
};

const ROLE_COLOR: Record<string, string> = {
  admin: "#ef4444",
  editor: "#60a5fa",
  member: "#4ade80",
  viewer: "#85858e",
};

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
  offline: "bg-[#85858e]",
};

export default function WorkspaceHomePage() {
  const { activeWorkspace, addAgent } = useWorkspace();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fileStats = activeWorkspace.knowledgeBases
    .map((kb) => countFiles(kb.items))
    .reduce((acc, s) => ({ total: acc.total + s.total, pending: acc.pending + s.pending }), {
      total: 0,
      pending: 0,
    });

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#f5f5f5]">
          {activeWorkspace.emoji} {activeWorkspace.name}
        </h1>
        <p className="text-sm text-[#85858e] mt-1">
          An isolated workspace — its agents and shared knowledge live only here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Members card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#f5f5f5]">
              <Users className="h-4 w-4 text-[#85858e]" />
              Members
            </h2>
            <span className="text-[11px] text-[#85858e]">{activeWorkspace.members.length}</span>
          </div>

          {activeWorkspace.members.length > 0 ? (
            <div className="space-y-1">
              {activeWorkspace.members.slice(0, 4).map((member) => {
                const RoleIcon = ROLE_ICON[member.role] || User;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#303036] text-[10px] font-medium text-[#f5f5f5]">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">
                      {member.name || member.email}
                    </span>
                    <RoleIcon className="h-3 w-3 shrink-0" style={{ color: ROLE_COLOR[member.role] || "#85858e" }} />
                    {member.status === "pending" && (
                      <span className="text-[10px] text-[#f5c45e]">Pending</span>
                    )}
                  </div>
                );
              })}
              {activeWorkspace.members.length > 4 && (
                <Link
                  href="/workspaces/members"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-[#85858e] hover:text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                >
                  +{activeWorkspace.members.length - 4} more
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors"
              >
                <UserPlus className="h-3 w-3" />
                Invite member
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#303036] px-4 py-8 text-center">
              <Users className="mx-auto mb-2 h-5 w-5 text-[#85858e]" />
              <p className="text-sm text-[#85858e]">No members yet</p>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite member
              </button>
            </div>
          )}
        </div>

        {/* Agents card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#f5f5f5]">
              <Bot className="h-4 w-4 text-[#85858e]" />
              Agents
            </h2>
            <span className="text-[11px] text-[#85858e]">{activeWorkspace.agents.length}</span>
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
                  <span className="text-[10px] uppercase tracking-wide text-[#85858e]">
                    {agent.status}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#303036] px-2.5 py-1.5 text-[11px] text-[#85858e] hover:text-[#f5f5f5] hover:border-[#5a5a5e] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add agent
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#303036] px-4 py-8 text-center">
              <Bot className="mx-auto mb-2 h-5 w-5 text-[#85858e]" />
              <p className="text-sm text-[#85858e]">No agents in this workspace yet</p>
              <button
                onClick={() => setIsAgentModalOpen(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add agent
              </button>
            </div>
          )}
        </div>

        {/* Knowledge card */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[#f5f5f5]">
              <HardDrive className="h-4 w-4 text-[#85858e]" />
              Shared Knowledge
            </h2>
            <span className="text-[11px] text-[#85858e]">
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
                    href="/workspaces/knowledge"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[#a7a7ad] hover:bg-[#151519] transition-colors"
                  >
                    <span>{kb.emoji}</span>
                    <span className="flex-1 truncate">{kb.name}</span>
                    <span className="text-[10px] text-[#85858e]">
                      {stats.total} files{stats.pending > 0 && ` · ${stats.pending} pending`}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#85858e]" />
                  </Link>
                );
              })}
              <p className="mt-2 px-3 text-[11px] text-[#85858e]">
                {fileStats.total} files total
                {fileStats.pending > 0 && ` · ${fileStats.pending} still processing`}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#303036] px-4 py-8 text-center">
              <HardDrive className="mx-auto mb-2 h-5 w-5 text-[#85858e]" />
              <p className="text-sm text-[#85858e]">No shared knowledge yet</p>
              <Link
                href="/workspaces/knowledge?new=1"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3.5 py-2 text-[12px] font-medium text-[#111111] transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                New knowledge base
              </Link>
            </div>
          )}
        </div>
      </div>

      <AgentCreationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onCreated={(agent) => addAgent(agent.name)}
      />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
