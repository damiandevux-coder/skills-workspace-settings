"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { ShellHeader } from "@/components/ShellHeader";
import { WorkspaceSettingsSidebar } from "./WorkspaceSettingsSidebar";
import { useWorkspace } from "./WorkspaceProvider";

export function WorkspaceAppShell({ children }: { children: React.ReactNode }) {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Workspace settings rail (left of the agent sidebar) */}
      <WorkspaceSettingsSidebar />

      {/* Agent sidebar */}
      <AgentSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <ShellHeader
          title={`${activeWorkspace.emoji} ${activeWorkspace.name}`}
        />

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
