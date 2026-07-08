"use client";

import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";

export default function WorkspaceHomePage() {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <h1 className="text-xl font-semibold text-[#f5f5f5]">
        {activeWorkspace.emoji} {activeWorkspace.name}
      </h1>
      <p className="text-sm text-[#85858e] mt-1">
        {activeWorkspace.agents.length} agents · {activeWorkspace.knowledgeBases.length} knowledge
        bases
      </p>
    </div>
  );
}
