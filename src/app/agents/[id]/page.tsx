"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bot,
  MessageSquare,
  Plus,
  Wrench,
  HardDrive,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { useSkills } from "@/components/skills/SkillsProvider";
import { AGENT_SPECIALTIES } from "@/data/agent-specialties";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_TONE = {
  ready: "success",
  busy: "warning",
  offline: "neutral",
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const { activeWorkspace, activeAgent, selectAgent, addSession } = useWorkspace();
  const { installedSkills } = useSkills();

  const agent = activeWorkspace.agents.find((a) => a.id === agentId);

  // Workspace-switch contract: an agent URL from another workspace gets an
  // explicit escape state instead of silently showing the wrong agent.
  if (!agent) {
    return (
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-16">
        <EmptyState
          icon={Bot}
          title="This agent isn't in the current workspace"
          description={`You're viewing ${activeWorkspace.emoji} ${activeWorkspace.name} — the agent at this URL belongs to a different workspace.`}
          action={
            <div className="flex items-center gap-2">
              {activeAgent && (
                <Link
                  href={`/agents/${activeAgent.id}`}
                  className="rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
                >
                  Go to {activeAgent.name}
                </Link>
              )}
              <Link
                href="/workspaces"
                className="rounded-lg border border-[#303036] px-4 py-2 text-[13px] text-[#a7a7ad] transition-colors hover:border-[#5a5a5e] hover:text-[#fafafa]"
              >
                Workspace home
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const specialty = AGENT_SPECIALTIES.find((s) => s.id === agent.specialtyId);
  const SpecialtyIcon = specialty?.icon ?? Bot;
  const accentColor = specialty?.color ?? "#4ade80";
  const assignedKbs = activeWorkspace.knowledgeBases.filter((kb) =>
    kb.assignedAgents.includes(agent.id)
  );
  const activeSkillCount = installedSkills.filter(
    (s) => s.status !== "preview" && !s.disabled
  ).length;

  const startSession = () => {
    const session = addSession(agent.id);
    selectAgent(agent.id);
    router.push(`/session/${session.id}`);
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-8">
      <button
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/workspaces"))}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#737373] transition-colors hover:text-[#fafafa]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: accentColor + "18",
              border: `1px solid ${accentColor}35`,
            }}
          >
            <SpecialtyIcon className="h-7 w-7" style={{ color: accentColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#fafafa]">{agent.name}</h1>
              <Chip tone={STATUS_TONE[agent.status]} dot>
                {agent.status}
              </Chip>
            </div>
            <p className="mt-1 text-sm text-[#737373]">
              {agent.role ?? "Custom Agent"}
              {specialty && ` · ${specialty.tagline}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            onClick={() => selectAgent(agent.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#303036] bg-[#151519] px-4 py-2 text-[13px] font-medium text-[#fafafa] transition-colors hover:border-[#5a5a5e]"
          >
            <Wrench className="h-3.5 w-3.5" />
            Skills
          </Link>
          <button
            onClick={startSession}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4ade80] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Session
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Sessions */}
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#232323] px-5 py-3">
            <SectionLabel>Recent sessions</SectionLabel>
            <span className="text-[11px] text-[#737373]">{agent.sessions.length}</span>
          </div>
          {agent.sessions.length > 0 ? (
            <div className="divide-y divide-[#232323]">
              {agent.sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  onClick={() => selectAgent(agent.id)}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#151519]"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-[#737373]" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#fafafa]">
                    {session.title}
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    {formatDate(session.lastActiveAt ?? session.createdAt)}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#737373]" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No sessions yet"
              variant="plain"
              action={
                <button onClick={startSession} className="text-sm text-[#4ade80] hover:underline">
                  Start the first one
                </button>
              }
            />
          )}
        </div>

        {/* Knowledge + skills */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#232323] px-5 py-3">
              <SectionLabel>Assigned knowledge</SectionLabel>
              <span className="text-[11px] text-[#737373]">{assignedKbs.length}</span>
            </div>
            {assignedKbs.length > 0 ? (
              <div className="divide-y divide-[#232323]">
                {assignedKbs.map((kb) => (
                  <Link
                    key={kb.id}
                    href={`/workspaces/knowledge?kb=${kb.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#151519]"
                  >
                    <span className="text-sm">{kb.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-[#fafafa]">
                      {kb.name}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#737373]" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={HardDrive} title="No knowledge bases assigned" variant="plain" />
            )}
          </div>

          <Link
            href="/"
            onClick={() => selectAgent(agent.id)}
            className="flex items-center justify-between rounded-xl border border-[#303036] bg-[#0b0b0c] px-5 py-4 transition-colors hover:border-[#5a5a5e]"
          >
            <div className="flex items-center gap-3">
              <Wrench className="h-4 w-4 text-[#737373]" />
              <span className="text-[13px] text-[#fafafa]">Active skills</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#4ade80]">{activeSkillCount}</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#737373]" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
