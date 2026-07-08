"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, HardDrive, Plus } from "lucide-react";
import { AgentCreationModal } from "@/components/AgentCreationModal";
import { useWorkspace } from "@/components/workspaces/WorkspaceProvider";
import { KnowledgeItem } from "@/types/skills";

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
