"use client";

import React from "react";
import { FileText, FileSpreadsheet, FileImage, FolderOpen } from "lucide-react";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";

const MOCK_FILES = [
  { name: "q3-campaign-summary.md", icon: FileText, size: "18 KB", modified: "2026-07-12", session: "Main Session" },
  { name: "competitor-pricing.csv", icon: FileSpreadsheet, size: "244 KB", modified: "2026-07-11", session: "Main Session" },
  { name: "launch-banner-draft.png", icon: FileImage, size: "1.1 MB", modified: "2026-07-09", session: "Main Session" },
  { name: "email-sequence-v2.md", icon: FileText, size: "9 KB", modified: "2026-07-08", session: "Main Session" },
];

export default function FilesPage() {
  const { activeWorkspace } = useWorkspace();
  const agentName = activeWorkspace.agents[0]?.name ?? "your agent";
  const hasAgents = activeWorkspace.agents.length > 0;

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <PageHeader
        className="mb-8"
        title="Files"
        description={`Outputs ${agentName} creates during sessions land here.`}
      />

      {hasAgents ? (
        <div className="rounded-xl border border-[#303036] bg-[#0b0b0c] overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_120px_140px] items-center gap-4 border-b border-[#232323] px-5 py-3">
            <SectionLabel>Name</SectionLabel>
            <SectionLabel>Size</SectionLabel>
            <SectionLabel>Modified</SectionLabel>
            <SectionLabel>Session</SectionLabel>
          </div>
          <div className="divide-y divide-[#232323]">
            {MOCK_FILES.map((file) => {
              const Icon = file.icon;
              return (
                <div
                  key={file.name}
                  className="grid grid-cols-[1fr_100px_120px_140px] items-center gap-4 px-5 py-3 hover:bg-[#151519] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-[#a7a7ad]" />
                    <span className="truncate text-[13px] text-[#fafafa]">{file.name}</span>
                  </div>
                  <span className="text-[12px] text-[#737373]">{file.size}</span>
                  <span className="text-[12px] text-[#737373]">{file.modified}</span>
                  <span className="text-[12px] text-[#737373]">{file.session}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No files yet"
          description="Add an agent and run a session — anything it produces shows up here."
        />
      )}
    </div>
  );
}
