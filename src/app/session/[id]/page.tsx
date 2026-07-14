"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useSkills } from "@/components/skills/SkillsProvider";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { SessionChat } from "@/components/session/SessionChat";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { activeWorkspace, activeAgent, selectAgent, renameSession } = useWorkspace();
  const { getSkill } = useSkills();

  const owner = activeWorkspace.agents.find((a) =>
    a.sessions.some((s) => s.id === sessionId)
  );
  const session = owner?.sessions.find((s) => s.id === sessionId);

  // Opening an agent's session makes that agent the active one, so the
  // sidebar and header stay coherent with what you're looking at.
  useEffect(() => {
    if (owner && owner.id !== activeAgent?.id) selectAgent(owner.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectAgent is stable enough for this sync
  }, [owner?.id, activeAgent?.id]);

  if (!session) {
    return (
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-16">
        <EmptyState
          icon={MessageSquare}
          title="Session not found in this workspace"
          description={`You're viewing ${activeWorkspace.emoji} ${activeWorkspace.name} — this session may belong to a different workspace, or the prototype was reloaded.`}
          action={
            <Link
              href="/session/new"
              className="rounded-lg bg-[#fafafa] px-4 py-2 text-[13px] font-medium text-[#111111] transition-opacity hover:opacity-90"
            >
              Start a new session
            </Link>
          }
        />
      </div>
    );
  }

  const skill = session.skillId ? getSkill(session.skillId) : undefined;

  // Fresh sessions (started from a New Session button) take their title from
  // the first message, matching how /session/new names materialized sessions.
  const handleFirstMessage =
    session.title === "New Session" && owner
      ? (text: string) => {
          const title = text.length > 42 ? `${text.slice(0, 42)}…` : text;
          renameSession(owner.id, session.id, title);
        }
      : undefined;

  return <SessionChat key={session.id} skill={skill} onFirstMessage={handleFirstMessage} />;
}
