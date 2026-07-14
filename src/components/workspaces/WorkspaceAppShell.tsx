"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu } from "lucide-react";
import { AgentSidebar } from "@/components/AgentSidebar";
import { WorkspaceSettingsSidebar } from "./WorkspaceSettingsSidebar";
import { useWorkspace } from "./WorkspaceProvider";

export function WorkspaceAppShell({ children }: { children: React.ReactNode }) {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Workspace settings rail (left of the agent sidebar) */}
      <WorkspaceSettingsSidebar />

      {/* Agent sidebar */}
      <AgentSidebar sessions={["Main Session"]} />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-[#222226] bg-[#0b0b0c] px-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-[#4ade80]" />
            <span className="text-sm font-medium text-[#f5f5f5]">
              {activeWorkspace.emoji} {activeWorkspace.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#4ade80]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-[#303036] border border-[#404046]" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
