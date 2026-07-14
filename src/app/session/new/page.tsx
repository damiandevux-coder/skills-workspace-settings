"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSkills } from "@/components/skills/SkillsProvider";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { SessionChat } from "@/components/session/SessionChat";

function NewSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getSkill } = useSkills();
  const { activeAgent, addSession } = useWorkspace();
  const skillId = searchParams.get("skill");
  const skill = skillId ? getSkill(skillId) : undefined;

  if (skillId && !skill) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#737373]">Skill &quot;{skillId}&quot; not found.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-[#f5c45e] hover:underline"
          >
            ← Back to Skills
          </button>
        </div>
      </div>
    );
  }

  // Materialize the session in the sidebar once the conversation starts. The
  // URL deliberately stays /session/new: Next's App Router intercepts
  // history.replaceState as a navigation, which would remount the chat and
  // wipe its messages.
  const handleFirstMessage = (text: string) => {
    if (!activeAgent) return;
    const title = text.length > 42 ? `${text.slice(0, 42)}…` : text;
    addSession(activeAgent.id, {
      title: skill ? `${skill.name}: ${title}` : title,
      skillId: skill?.id,
    });
  };

  return (
    <SessionChat key={skill?.id ?? "generic"} skill={skill} onFirstMessage={handleFirstMessage} />
  );
}

export default function NewSessionPage() {
  return (
    <Suspense fallback={null}>
      <NewSessionInner />
    </Suspense>
  );
}
